import { NextFunction, Request, Response } from "express";

export function searchByName(req: Request, res: Response, next: NextFunction) {

}

export function searchByTags(req: Request, res: Response, next: NextFunction) {
}

export default {
    searchByName,
    searchByTags
}