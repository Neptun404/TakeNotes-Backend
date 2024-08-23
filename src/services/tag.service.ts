import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import db from '../db';
import { DatabaseError } from '../errors/DatabaseErrors';

export async function createTags(tags: string[]) {
    try {
        // Create an array of objects with name: tag
        const _tags = tags.map(tag => {
            return { name: tag }
        })

        return await db.tag.createMany({
            data: _tags,
            skipDuplicates: true,
        })
    } catch (error) {
        if (error instanceof PrismaClientKnownRequestError) throw new DatabaseError(error.message, error);
        else throw new Error('Internal server error');
    }
}

export default { createTags }