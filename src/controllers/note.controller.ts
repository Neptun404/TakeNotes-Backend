import { Request, Response, NextFunction } from "express";
import createError from 'http-errors';
import db from '../db';

export async function getNote(req: Request, res: Response, next: NextFunction) { }

export async function getNotes(req: Request, res: Response, next: NextFunction) { }

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

export async function updateNote(req: Request, res: Response, next: NextFunction) { }

export async function deleteNote(req: Request, res: Response, next: NextFunction) { }

export default {
    getNote,
    getNotes,
    createNote,
    updateNote,
    deleteNote
}