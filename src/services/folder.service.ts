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
    throw new Error("Not implemented");
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

export async function updateFolder(id: number, folder: { title: string, ownerId: number }) {
    throw new Error("Not implemented");
}

export async function deleteFolder(id: number) {
    throw new Error("Not implemented");
}

export default {
    getFolder,
    getFolders,
    createFolder,
    updateFolder,
    deleteFolder
}