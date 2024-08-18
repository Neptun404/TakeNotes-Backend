import {
    PrismaClientInitializationError,
    PrismaClientKnownRequestError,
    PrismaClientRustPanicError,
    PrismaClientValidationError,
    PrismaClientUnknownRequestError,
} from '@prisma/client/runtime/library';
import db from '../db';

type PrismaClientError = PrismaClientInitializationError | PrismaClientRustPanicError | PrismaClientValidationError | PrismaClientKnownRequestError | PrismaClientUnknownRequestError

export class NoteNotFoundError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'NoteNotFoundError';
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

export async function updateNote(ownerId: number, noteId: number, noteData: { title: string, content: string }) {
    try {
        // Find note by id in database with user id as owner
        const note = await db.note.findFirst({
            where: {
                id: noteId, AND: {
                    ownerId
                }
            }
        })

        // If note is not found, throw error
        if (!note) throw new NoteNotFoundError(`Note with id ${noteId} that belongs to Owner with id ${ownerId} not found`);

        // Update note in database 
        const updatedNote = await db.note.update({
            data: {
                title: noteData.title,
                content: noteData.content,
            },
            where: {
                id: noteId,
                ownerId
            }
        })

        return updatedNote; // Return the update note
    } catch (error) {
        if (error instanceof NoteNotFoundError)
            throw error;

        throw new DatabaseError(error.message, error);
    }
}

export default {
    updateNote
}