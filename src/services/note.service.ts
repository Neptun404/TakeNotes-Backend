import {
    PrismaClientInitializationError,
    PrismaClientKnownRequestError,
    PrismaClientRustPanicError,
    PrismaClientValidationError,
    PrismaClientUnknownRequestError,
} from '@prisma/client/runtime/library';
import db from '../db';

type PrismaClientError = PrismaClientInitializationError | PrismaClientRustPanicError | PrismaClientValidationError | PrismaClientKnownRequestError | PrismaClientUnknownRequestError | Error

export class NoteNotFoundError extends Error {
    name: string
    message: string

    constructor(message: string) {
        super(message)
        this.name = 'NoteNotFoundError';
        this.message = message
    }
}

export class DatabaseError {
    message: string
    dbError: PrismaClientError
    constructor(
        message: string,
        dbError: PrismaClientError
    ) {
        this.message = message;
        this.dbError = dbError
    }
}

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

export async function createNote(ownerId: number, note: { title: string, content: string }) {
    try {
        // Create note in database with user id as owner
        const createdNote = await db.note.create({
            data: {
                title: note.title,
                content: note.content,
                ownerId
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
            }
        })

        return deletedNote;
    } catch (error: any) {
        if (error instanceof PrismaClientKnownRequestError) throw new DatabaseError(error.message, error);
        else throw new Error('Internal server error');
    }
}

export async function updateNote(ownerId: number, noteId: number, note: { title: string, content: string }) {
    try {
        // Update user's record in the database
        const updatedNote = await db.note.update({
            where: {
                id: noteId, AND: {
                    ownerId
                }
            },
            data: {
                ...note
            }
        })

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
    updateNote: (...params: any[]) => { },
    deleteNote
}