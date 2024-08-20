import { Request, Response, NextFunction } from "express";
import db from '../db';
import noteServices, { DatabaseError, NoteNotFoundError, getManyNotes, getOneNote } from '../services/note.service';
import { createError } from '../utils/createError';

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

export async function createNote(req: Request, res: Response, next: NextFunction) {
    const { userId } = res.locals as { userId: number };
    const { title, content } = req.body

    try {
        // Throw error if title is missing or empty
        if (!title || !content) throw new MissingTitleOrContentError('Title and content are required')
        else if ((title as string).trim() === '') throw new MissingTitleOrContentError('Title cannot be empty')

        const note = await noteServices.createNote(userId, { title, content })

        res.status(201).json({
            status: 'success',
            message: 'Note created',
            data: note
        })
    } catch (error) {
        if (error instanceof MissingTitleOrContentError) return next(createError(400, error.message))
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
        await noteServices.deleteNote(noteId, userId)

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

// export async function createNote(req: Request, res: Response, next: NextFunction) {
//     const { userId } = res.locals as { userId: number };

//     // TODO - Validate user input
//     const { title, content } = req.body

//     // Check if title and content were sent but title should not be empty
//     if (
//         !title ||
//         !content ||
//         (title as string).trim() === ''
//     ) {
//         return next(createError(400, 'Title and content are required'))
//     }

//     // TODO - Create note
//     try {
//         // Create note in database with user id as owner
//         const note = await db.note.create({
//             data: {
//                 title,
//                 content,
//                 ownerId: userId
//             }
//         })

//         // TODO - Send response with success message and resource
//         res.json({
//             message: 'Note Created',
//             resource: `/note/${note.id}`
//         })
//     } catch (error: any) {
//         if (error.name === 'PrismaClientInitializationError') {
//             return next(createError(500, 'Server error'))
//         }

//         next(createError(500, 'Internal server error'))
//     }
// }

// export async function updateNote(req: Request, res: Response, next: NextFunction) {
//     const { userId } = res.locals as { userId: number };
//     const { id: noteId } = req.params;

//     // Check if id is valid note id
//     if (!Number.isInteger(parseInt(noteId))) {
//         return next(createError(400, 'Invalid note id'))
//     }

//     const { title, content } = req.body

//     // Validate title is not empty
//     if (
//         !title ||
//         (title as string).trim() === ''
//     ) {
//         return next(createError(400, 'Note title cannot be empty'))
//     }

//     try {
//         // Update note in database
//         const updatedNote = await noteServices.updateNote(parseInt(noteId), userId, { title, content })

//         // Send response with success message and resource
//         res.status(200).json({
//             "status": "success",
//             "message": "Note updated",
//             "data": updatedNote
//         })
//     } catch (error) {
//         if (error instanceof NoteNotFoundError)
//             return next(createError(404, 'Note not found'))
//         else if (error instanceof DatabaseError) {
//             console.error('Database error:', error.dbError);
//             return next(createError(500, error.message))
//         }
//         else {
//             console.error('Unexpected error:', error);
//             return next(createError(500, 'Internal server error'))
//         }

//     }
// }

// export async function deleteNote(req: Request, res: Response, next: NextFunction) {
//     const { userId } = res.locals as { userId: number };
//     const { id: noteId } = req.params;

//     // Check if id is valid note id
//     if (!Number.isInteger(parseInt(noteId))) {
//         return next(createError(400, 'Invalid note id'))
//     }

//     try {
//         // Delete note in database
//         const deletedNote = await noteServices.deleteNote(parseInt(noteId), userId)



//     } catch (error) {
//     }

// }

export default {
    getNote,
    getNotes,
    createNote,
    updateNote: (req: Request, res: Response, next: NextFunction) => { next(createError(501, "Not Implemented")) },
    deleteNote
}