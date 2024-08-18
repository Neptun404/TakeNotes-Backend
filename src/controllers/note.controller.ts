import { Request, Response, NextFunction } from "express";
import createError from 'http-errors';
import db from '../db';
import noteServices, { DatabaseError, NoteNotFoundError } from '../services/note.service';

export async function getNote(req: Request, res: Response, next: NextFunction) {
    const { userId } = res.locals as { userId: number };
    const { id: noteId } = req.params;

    // Check if id is valid note id
    if (!Number.isInteger(parseInt(noteId))) {
        return next(createError(400, 'Invalid note id'))
    }

    // Find note by id in database with user id as owner
    const note = await db.note.findFirst({
        where: {
            id: parseInt(noteId), AND: {
                ownerId: userId
            }
        }
    })

    // If note is not found, return error
    if (!note) {
        return next(createError(404, 'Note not found'))
    }

    // Send response with success message and resource
    res.json({
        message: 'Note found',
        data: note
    })
}

export async function getNotes(req: Request, res: Response, next: NextFunction) {
    const { userId } = res.locals as { userId: number };

    try {
        // Find all notes in database with user id as owner
        const notes = await db.note.findMany({
            where: {
                ownerId: userId
            }
        })

        // Send response with success message and resource
        res.json({
            message: 'Notes found',
            data: notes
        })
    } catch (error) {
        return next(createError(500, 'Internal server error'))
    }
}

export async function createNote(req: Request, res: Response, next: NextFunction) {
    const { userId } = res.locals as { userId: number };

    // TODO - Validate user input
    const { title, content } = req.body

    // Check if title and content were sent but title should not be empty
    if (
        !title ||
        !content ||
        (title as string).trim() === ''
    ) {
        return next(createError(400, 'Title and content are required'))
    }

    // TODO - Create note
    try {
        // Create note in database with user id as owner
        const note = await db.note.create({
            data: {
                title,
                content,
                ownerId: userId
            }
        })

        // TODO - Send response with success message and resource
        res.json({
            message: 'Note Created',
            resource: `/note/${note.id}`
        })
    } catch (error: any) {
        if (error.name === 'PrismaClientInitializationError') {
            return next(createError(500, 'Server error'))
        }

        next(createError(500, 'Internal server error'))
    }
}

export async function updateNote(req: Request, res: Response, next: NextFunction) {
    const { userId } = res.locals as { userId: number };
    const { id: noteId } = req.params;

    // Check if id is valid note id
    if (!Number.isInteger(parseInt(noteId))) {
        return next(createError(400, 'Invalid note id'))
    }

    const { title, content } = req.body

    // Validate title is not empty
    if (
        !title ||
        (title as string).trim() === ''
    ) {
        return next(createError(400, 'Note title cannot be empty'))
    }

    try {
        // Update note in database
        const updatedNote = await noteServices.updateNote(parseInt(noteId), userId, { title, content })

        // Send response with success message and resource
        res.status(200).json({
            "status": "success",
            "message": "Note updated",
            "data": updatedNote
        })
    } catch (error) {
        if (error instanceof NoteNotFoundError)
            return next(createError(404, 'Note not found'))
        else if (error instanceof DatabaseError) {
            console.error('Database error:', error.dbError);
            return next(createError(500, error.message))
        }
        else {
            console.error('Unexpected error:', error);
            return next(createError(500, 'Internal server error'))
        }

    }
}

export async function deleteNote(req: Request, res: Response, next: NextFunction) { }

export default {
    getNote,
    getNotes,
    createNote,
    updateNote,
    deleteNote
}