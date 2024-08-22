import { Request, Response, NextFunction } from "express"

async function getFolder(req: Request, res: Response, next: NextFunction) {
    throw new Error('Endpoint not implemented')
}

async function getFolders(req: Request, res: Response, next: NextFunction) {
    throw new Error('Endpoint not implemented')
}

async function createFolder(req: Request, res: Response, next: NextFunction) {
    throw new Error('Endpoint not implemented')
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