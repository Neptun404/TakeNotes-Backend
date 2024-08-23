import { Request, Response, NextFunction } from "express";
import db from '../db';
import noteServices, { getManyNotes, getOneNote } from '../services/note.service';
import { createError } from '../utils/createError';
import { DatabaseError, NoteNotFoundError } from '../errors/DatabaseErrors';

class InvalidNoteID {
    message: string
    constructor(message: string) {
        this.message = message;
    }
}

function validateNoteID(id: any): number {
    // Throws an InvalidNoteID error if id is not a number
    if (!Number.isInteger(parseInt(id))) throw new InvalidNoteID(id)
    else return parseInt(id)
}

export async function getNote(req: Request, res: Response, next: NextFunction) {
    const { userId } = res.locals as { userId: number };
    const { id } = req.params;

    try {
        const note = await getOneNote(userId, validateNoteID(id));

        res.status(200).json({
            status: 'success',
            message: 'Note found',
            data: note
        })
    } catch (error) {
        if (error instanceof InvalidNoteID) return next(createError(400, 'Invalid note id'))
        else if (error instanceof NoteNotFoundError) return next(createError(404, 'Note not found'))
        else if (error instanceof DatabaseError) return next(createError(500, 'Database error'))
        else return next(createError(500, 'Server error'))
    }
}

export async function getNotes(req: Request, res: Response, next: NextFunction) {
    const { userId } = res.locals as { userId: number };
    try {
        const notes = await getManyNotes(userId);

        res.json({
            status: 'success',
            message: 'Notes found',
            data: notes
        })
    } catch (error) {
        if (error instanceof DatabaseError) return next(createError(500, 'Database error'))
        else return next(createError(500, 'Internal server error'))
    }
}

class MissingTitleOrContentError extends Error {
    message: string
    constructor(message: string) {
        super(message);
        this.message = message;
    }
}

export class InvalidTagsError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'InvalidTagsError';
        this.message = message;
    }
}

export async function createNote(req: Request, res: Response, next: NextFunction) {
    const { userId } = res.locals as { userId: number };
    const { title, content, tags } = req.body // Get title, content and tags from request body

    try {
        // Validate tags
        if (tags) {
            if (!Array.isArray(tags))
                throw new InvalidTagsError('Tags must be in an array format');
            else if (tags.length > 20) throw new InvalidTagsError('Note can have at most 20 tags');

            // Check that none of the tags are empty
            const tagsMap: { [key: string]: boolean } = {};
            (tags as string[]).forEach((tag) => {
                if (!tag || !tag.toString().trim()) throw new InvalidTagsError('Tags cannot be empty');
                if (tagsMap[tag]) throw new InvalidTagsError('Duplicate tags are not allowed');
                tagsMap[tag] = true;
            })
        }

        // Throw error if title is missing or empty
        if (!title || !content) throw new MissingTitleOrContentError('Title and content are required')
        else if ((title as string).trim() === '') throw new MissingTitleOrContentError('Title cannot be empty')

        const note = await noteServices.createNote(userId, { title, content, tags });

        res.status(201).json({
            status: 'success',
            message: 'Note created',
            data: note
        })
    } catch (error) {
        if (error instanceof InvalidTagsError) return next(createError(400, error.message))
        else if (error instanceof MissingTitleOrContentError) return next(createError(400, error.message))
        else if (error instanceof DatabaseError) return next(createError(500, 'Database error'))
        else return next(createError(500, 'Internal server error'))
    }
}

export async function deleteNote(req: Request, res: Response, next: NextFunction) {
    const { userId } = res.locals as { userId: number };
    const { id } = req.params;

    // Check if id is valid note id
    try {
        const noteId = validateNoteID(id)

        // Delete note in database
        await noteServices.deleteNote(userId, noteId)

        res.status(200).json({
            status: 'success',
            message: 'Note deleted',
        })
    } catch (error) {
        if (error instanceof InvalidNoteID) return next(createError(400, `${id} is an invalid note id`))
        else if (error instanceof NoteNotFoundError) return next(createError(404, 'Note not found'))
        else if (error instanceof DatabaseError) return next(createError(500, 'Database error'))
        else return next(createError(500, 'Internal server error'))
    }
}

export async function updateNote(req: Request, res: Response, next: NextFunction) {
    const { userId } = res.locals as { userId: number };
    const { id } = req.params;
    const { title, content } = req.body

    try {
        const noteId = validateNoteID(id)

        // Check if title and content are not empty
        if (!title || !content) throw new MissingTitleOrContentError('Title and content are required')
        else if ((title as string).trim() === '') throw new MissingTitleOrContentError('Title cannot be empty')

        const updatedNote = await noteServices.updateNote(userId, noteId, { title, content })

        // Send response with success message and resource
        res.status(200).json({
            "status": "success",
            "message": "Note updated",
            "data": updatedNote
        })
    } catch (error) {
        if (error instanceof MissingTitleOrContentError) return next(createError(400, error.message))
        else if (error instanceof InvalidNoteID) return next(createError(400, `${id} is an invalid note id`))
        else if (error instanceof NoteNotFoundError) return next(createError(404, 'Note not found'))
        else if (error instanceof DatabaseError) return next(createError(500, 'Database error'))
        else return next(createError(500, 'Internal server error'))
    }
}

export default {
    getNote,
    getNotes,
    createNote,
    updateNote,
    deleteNote
}