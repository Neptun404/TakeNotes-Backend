import { NextFunction, Request, Response } from "express";
import tagService from "../services/tag.service";
import { DatabaseError } from "../errors/DatabaseErrors";
import createError from '../utils/createError';

export async function getTags(req: Request, res: Response, next: NextFunction) {
    try {
        const { ownerId } = res.locals;

        res.status(200).json({
            status: 'success',
            message: 'Tags retrieved successfully',
            data: await tagService.getTags(ownerId)
        })
    } catch (error) {
        if (error instanceof DatabaseError) return next(createError(500, 'Database error'))
        else return next(createError(500, 'Internal Server Error'))
    }
}