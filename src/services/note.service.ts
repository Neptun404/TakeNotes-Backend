import {
    PrismaClientInitializationError,
    PrismaClientKnownRequestError,
    PrismaClientRustPanicError,
    PrismaClientValidationError,
    PrismaClientUnknownRequestError,
} from '@prisma/client/runtime/library';
import db from '../db';
import { NoteNotFoundError, DatabaseError } from '../errors/DatabaseErrors';
import tagService from './tag.service';

export async function getOneNote(ownerId: number, noteId: number) {
    try {
        const note = await db.note.findFirst({
            where: {
                id: noteId, AND: {
                    ownerId
                }
            }
        })

        if (!note) throw new NoteNotFoundError(`Note with id ${noteId} that belongs to Owner with id ${ownerId} not found`);

        return note;
    } catch (error) {
        if (error instanceof NoteNotFoundError) throw error;
        else if (error instanceof PrismaClientKnownRequestError) throw new DatabaseError(error.message, error);
        else throw new Error('Internal server error');
    }
}

export async function getManyNotes(ownerId: number) {
    try {
        const notes = await db.note.findMany({
            where: {
                ownerId: ownerId
            }
        })

        return notes;
    } catch (error) {
        if (error instanceof PrismaClientKnownRequestError) throw new DatabaseError(error.message, error);
        else throw new Error('Internal server error');
    }
}

export async function createNote(ownerId: number, note: { title: string, content: string, tags?: string[] }) {
    try {
        // Create tags if provided
        let _tags: { name: string }[] | [] = []
        if (note.tags) {
            // Wait for tags to be created before proceding
            await tagService.createTags(note.tags)
            _tags = note.tags.map(tag => {
                return { name: tag }
            })
        }

        // Create note in database with user id as owner
        const createdNote = await db.note.create({
            data: {
                title: note.title,
                content: note.content,
                ownerId,
                tags: {
                    connect: _tags
                }
            }
        })

        return createdNote; // Return the created note
    } catch (error) {
        if (error instanceof PrismaClientKnownRequestError) throw new DatabaseError(error.message, error);
        else throw new Error('Internal server error');
    }
}

export async function deleteNote(ownerId: number, noteId: number) {
    try {
        const deletedNote = await db.note.delete({
            where: {
                id: noteId, AND: {
                    ownerId: ownerId
                }
            }, include: {
                tags: true
            }
        })

        return deletedNote;
    } catch (error: any) {
        if (error instanceof PrismaClientKnownRequestError) {
            if (error.code === 'P2025') // P2025 means record not found
                throw new NoteNotFoundError(`Note with id ${noteId} that belongs to Owner with id ${ownerId} not found`)
            throw new DatabaseError(error.message, error)
        }
        else throw new Error('Internal server error');
    }
}

export async function updateNote(ownerId: number, noteId: number, note: { title: string, content: string, tags?: string[] }) {
    try {
        // Create tags if provided
        let _tags: { name: string }[] | [] = []
        if (note.tags) {
            // Wait for tags to be created before proceding
            await tagService.createTags(note.tags)
            _tags = note.tags.map(tag => {
                return { name: tag }
            })
        }

        // Update user's record in the database
        const updatedNote = await db.note.update({
            data: {
                title: note.title,
                content: note.content,
                tags: {
                    set: [],
                    connect: _tags
                }
            },
            include: {
                tags: true
            },
            where: {
                id: noteId, AND: {
                    ownerId
                }
            }
        });

        return updatedNote;
    } catch (error) {
        if (error instanceof PrismaClientKnownRequestError)
            if (error.code === 'P2025') // P2025 means record not found
                throw new NoteNotFoundError(`Note with id ${noteId} that belongs to Owner with id ${ownerId} not found`)
            else throw new DatabaseError('Database error occured during note update', error)
        else throw new Error('Internal server error')
    }
}

export default {
    getOneNote,
    getManyNotes,
    createNote,
    deleteNote,
    updateNote
}