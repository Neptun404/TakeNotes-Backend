import db from "../../src/db";
import {
    createTags,
    getTags
} from '../../src/services/tag.service'

jest.mock('../../src/db', () => ({
    __esModule: true,
    default: {
        tag: {
            createTags: jest.fn(),
        },
        note: {
            findMany: jest.fn()
        }
    }
}))


const mockGetNoteTags = db.note.findMany as jest.Mock;

describe('Test cases for getTags', () => {
    it('should return empty array if no tags found', async () => {
        mockGetNoteTags.mockResolvedValue([])

        const a = getTags(2);
        await expect(a).resolves.toEqual([])
    })

    it('should return array of tags created by the user', async () => {
        mockGetNoteTags.mockResolvedValue(['tag1', 'tag2', 'delish'])

        const a = getTags(2);
        expect(a).resolves.toEqual(['tag1', 'tag2', 'delish'])
    })
})


it('', () => {
    expect(true)
})