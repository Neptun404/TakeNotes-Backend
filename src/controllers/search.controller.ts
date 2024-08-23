import { NextFunction, Request, Response } from "express";
import createError from '../utils/createError';
import searchService from "../services/search.service";

class InvalidSearchTermError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'InvalidSerachTermError'
    }
}
export async function searchByTitle(req: Request, res: Response, next: NextFunction) {
    try {
        const { ownerId } = res.locals
        const { searchTerm } = req.query
        if (!searchTerm) throw new InvalidSearchTermError('Search term is required')
        else if (typeof searchTerm !== 'string' || searchTerm.trim() === '') throw new InvalidSearchTermError('Search term must be a non-empty string')

        res.status(200).json({
            staus: 'success',
            message: 'Search successful',
            data: await searchService.searchByTitle(ownerId, searchTerm)
        })
    } catch (error) {
        if (error instanceof Error) return next(createError(400, error.message))
        else return next(createError(500, 'Internal server error'))
    }
}

export async function searchByTags(req: Request, res: Response, next: NextFunction) {
    try {
        const { ownerId } = res.locals
        const { tags } = req.query

        // Validate tags and throw error if invalid
        if (!tags) throw new InvalidSearchTermError('Tags are required');
        else if (!Array.isArray(tags)) throw new InvalidSearchTermError('Tags must be in an array format')
        else if (!tags.every(tag => typeof tag === 'string' && tag.trim() !== '')) throw new InvalidSearchTermError('Tags must be a non-empty string')

        res.status(200).json({
            staus: 'success',
            message: 'Search successful',
            data: await searchService.searchByTags(ownerId, tags as string[])
        })
    } catch (error) {
        if (error instanceof InvalidSearchTermError) return next(createError(400, error.message))
        else if (error instanceof Error) return next(createError(400, error.message))
        else return next(createError(500, 'Internal server error'))
    }
}

export default {
    searchByTitle,
    searchByTags
}