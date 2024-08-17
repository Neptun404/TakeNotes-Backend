import { Request, Response, NextFunction } from "express";
import createError from 'http-errors';

export async function getNote(req: Request, res: Response, next: NextFunction) { }

export async function getNotes(req: Request, res: Response, next: NextFunction) { }

export async function createNote(req: Request, res: Response, next: NextFunction) {}

export async function updateNote(req: Request, res: Response, next: NextFunction) { }

export async function deleteNote(req: Request, res: Response, next: NextFunction) { }

export default {
    getNote,
    getNotes,
    createNote,
    updateNote,
    deleteNote
}