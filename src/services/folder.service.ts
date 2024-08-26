import db from "../db";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { DatabaseError, FolderNotFoundError } from "../errors/DatabaseErrors";

export async function getFolder(id: number, ownerId: number) {
    try {
        const folder = await db.folder.findUnique({
            where: { id, AND: { ownerId } },
            include: {
                notes: {
                    select: {
                        title: true,
                        id: true,
                        tags: true
                    }
                }
            }
        });
        if (!folder) {
            throw new FolderNotFoundError(`Folder with id ${id} not found`);
        }
        return folder;
    } catch (error) {
        if (error instanceof FolderNotFoundError) throw error;
        else if (error instanceof PrismaClientKnownRequestError) throw new DatabaseError(error.message, error);
        else throw new Error(`Failed to get folder: ${error.message}`);
    }
}

export async function getFolders(ownerId: number) {
    try {
        return await db.folder.findMany({
            where: { ownerId },
            select: {
                name: true,
                id: true
            }
        })
    } catch (error) {
        if (error instanceof PrismaClientKnownRequestError) throw new DatabaseError(error.message, error);
        else throw new Error(`Failed to get folders: ${error.message}`);
    }
}

export async function createFolder(ownerId: number, folder: { title: string, notes?: { id: number }[] }) {
    try {
        // Create a new folder record
        return await db.folder.create({
            data: {
                name: folder.title,
                ownerId: ownerId,
                notes: {
                    connect: folder.notes ? folder.notes : [], // Connect the folder to the notes if provided
                }
            }
        })
    } catch (error) {
        if (error instanceof PrismaClientKnownRequestError) throw new DatabaseError(error.message, error);
        else throw new Error(`Failed to create folder: ${error.message}`);
    }

}

// Test that connecting a uncreated note to folder effects
export async function updateFolder(ownerId: number, id: number, folder: {
    title: string,
    notes?: { id: number }[]
}) {
    try {
        return await db.folder.update({
            where: { id, AND: { ownerId } },
            data: {
                name: folder.title,
                notes: {
                    connect: folder.notes ? folder.notes : [],
                }
            },
        })
    } catch (error) {
        if (error instanceof PrismaClientKnownRequestError)
            if (error.code === 'P2025') // P2025 means record not found
                throw new FolderNotFoundError(`Folder not found with id ${id}`)
            else throw new DatabaseError('Database error occured during note update', error)
        else throw new Error('Internal server error')
    }
}

export async function deleteFolder(ownerId: number, id: number) {
    try {
        return await db.folder.delete({
            where: {
                id, AND: {
                    ownerId
                }
            }
        })
    } catch (error) {
        if (error instanceof PrismaClientKnownRequestError) {
            if (error.code === 'P2025') // P2025 means record not found
                throw new FolderNotFoundError(`Folder not found with id ${id}`)
            throw new DatabaseError(error.message, error)
        }
        else throw new Error('Internal server error');
    }
}

export default {
    getFolder,
    getFolders,
    createFolder,
    updateFolder,
    deleteFolder
}