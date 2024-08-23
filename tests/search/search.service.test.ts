import searchService from "../../src/services/search.service";
import db from "../../src/db";

jest.mock('../../src/db', () => ({
    __esModule: true,
    default: {
        note: {
            findFirst: jest.fn(),
            findMany: jest.fn(),
        }
    }
}))

const mockFindMany = db.note.findMany as jest.Mock;

describe('Search notes by title', () => {
    it('should return empty array if no notes found', async () => {
        mockFindMany.mockResolvedValue([])

        const a = await searchService.searchByTitle('test')
        expect(a).toEqual([])
    })

    it('should return array of notes if notes found', async () => {
        const mockedNotes = [
            {
                id: 1,
                title: 'Test Note Title',
                content: 'Test Note Content',
                ownerId: 1
            }
        ]
        mockFindMany.mockResolvedValue(mockedNotes)

        const a = await searchService.searchByTitle('test')

        expect(a).toEqual(mockedNotes)
    })
})


describe('Search notes by tags', () => {
    it('should return empty array if no notes found', async () => {
        mockFindMany.mockResolvedValue([])

        const a = await searchService.searchByTags(1, ['test'])
        expect(a).toEqual([])
    });

    it('should return array of notes if notes found', async () => {
        const mockedNotes = [
            {
                id: 1,
                title: 'Test Note Title',
                content: 'Test Note Content',
                ownerId: 1,
                tags: ['test', 'delish']
            }
        ]
        mockFindMany.mockResolvedValue(mockedNotes)

        const a = await searchService.searchByTags(1, ['test'])

        expect(a).toEqual(mockedNotes)
    });

    it('should return empty array if no notes found with that tag', async () => {
        mockFindMany.mockResolvedValue([])

        const a = await searchService.searchByTags(1, ['test'])

        expect(a).toEqual([])
    })
})
