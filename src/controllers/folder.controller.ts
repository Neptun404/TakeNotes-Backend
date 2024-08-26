import { Request, Response, NextFunction } from "express"
import folderService from "../services/folder.service";
import { InvalidNoteID, validateNoteID } from "./note.controller";
import { DatabaseError, FolderNotFoundError, NoteNotFoundError } from "../errors/DatabaseErrors";
import createError from "../utils/createError";

class ValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.message = message;
        this.name = 'ValidationError'
    }
}

function validateFolderId(id: any): number {
    if (!Number.isInteger(parseInt(id))) throw new ValidationError(id)
    else return parseInt(id)
}

async function getFolder(req: Request, res: Response, next: NextFunction) {

    try {
        // Validate folder id
        const { id } = req.params
        if (!id) throw new ValidationError('Invalid folder id')

        const { userId } = res.locals;
        const folder = await folderService.getFolder(validateFolderId(id), userId);

        res.status(200).json({
            status: 'success',
            message: 'Folder retrieved successfully',
            data: folder
        })
    } catch (error) {
        if (error instanceof FolderNotFoundError) return next(createError(400, `Folder with id ${req.params.id} not found`))
        if (error instanceof DatabaseError) return next(createError(500, 'Database error'))
        else return next(createError(500, 'Internal server error'))
    }
}

async function getFolders(req: Request, res: Response, next: NextFunction) {
    try {
        const { userId } = res.locals;

        const folders = await folderService.getFolders(userId);

        res.status(200).json({
            status: 'success',
            message: 'Folders retrieved successfully',
            data: folders
        })
    } catch (error) {
        if (error instanceof DatabaseError) return next(createError(500, `Database error`))
        else return next(createError(500, `Internal server error`))
    }
}

async function createFolder(req: Request, res: Response, next: NextFunction) {
    try {
        // Validate request body
        const { title } = req.body
        if (!title || (title as string).trim() === '')
            throw new ValidationError('Invalid folder title');

        // Create folder
        const { userId } = res.locals;
        const { notes } = req.body

        if (!notes) throw new ValidationError('notes field does not exists')
        else if (!Array.isArray(notes)) throw new ValidationError('notes must be an array')

        const _notes: { id: number }[] = notes.map(noteId => {
            return { id: validateNoteID(noteId) }
        })

        const folder = await folderService.createFolder(userId, {
            title: title,
            notes: _notes
        })

        res.status(200).json({
            staus: 'success',
            message: 'Folder created',
            data: folder
        })
    } catch (error) {
        console.error((error as Error).message);
        if (error instanceof ValidationError) return next(createError(400, error.message))
        else if (error instanceof InvalidNoteID) return next(createError(400, error.message))
        else if (error instanceof NoteNotFoundError) return next(createError(400, error.message))
        else if (error instanceof DatabaseError) return next(createError(500, 'Database error'))
        else return next(createError(500, 'Internal Server error'))
    }
}

async function updateFolder(req: Request, res: Response, next: NextFunction) {
    throw new Error('Endpoint not implemented')
}

async function deleteFolder(req: Request, res: Response, next: NextFunction) {
    throw new Error('Endpoint not implemented')
}

export default {
    getFolder,
    getFolders,
    createFolder,
    updateFolder,
    deleteFolder
}