import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import db from '../db';
import { DatabaseError } from '../errors/DatabaseErrors';

export async function searchByTitle(title: string) {
    try {
        return await db.note.findMany({
            where: {
                title: {
                    search: title
                }
            }
        })
    } catch (error) {
        if (error instanceof PrismaClientKnownRequestError) throw new DatabaseError(error.message, error);
        else throw new Error('Internal server error');
    }
}

export async function searchByTags(ownerId: number, tags: string[]) {
    try {
        return await db.note.findMany({
            select: {
                id: true,
                content: true,
                title: true,
                tags: true,
                ownerId: true
            },
            where: {
                ownerId, AND: {
                    tags: {
                        some: {
                            name: {
                                in: tags
                            }
                        }
                    }
                }
            }
        })

    } catch (error) {
        if (error instanceof PrismaClientKnownRequestError) throw new DatabaseError(error.message, error);
        else throw new Error('Internal server error');
    }
}

export default {
    searchByTitle,
    searchByTags
}