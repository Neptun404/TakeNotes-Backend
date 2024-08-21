import noteService, { createNote, DatabaseError, getManyNotes, getOneNote, NoteNotFoundError, updateNote } from '../../src/services/note.service';
import db from '../../src/db';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

jest.mock('../../src/db', () => ({
    __esModule: true,
    default: {
        note: {
            create: jest.fn(),
            findFirst: jest.fn(),
            update: jest.fn(),
            findMany: jest.fn(),
            delete: jest.fn(),
        }
    }
}))


const mockNoteCreation = db.note.create as jest.Mock;
const mockNoteFindFirst = db.note.findFirst as jest.Mock;
const mockNoteFindMany = db.note.findMany as jest.Mock;
const mockNoteUpdate = db.note.update as jest.Mock;
const mockNoteDelete = db.note.delete as jest.Mock;

describe('Test cases for creating notes', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockNoteCreation.mockClear()
    })

    test('Creation of note should succed', async () => {
        const note = { title: 'Test Note Title', content: 'Test Note Content' }
        const ownerId = 1;

        // Mock database query resolve value
        mockNoteCreation.mockResolvedValue({ ownerId: 1, title: 'Test Note Title', content: 'Test Note Content' })

        // Call createNote service function, which in turns calls database query that returns mocked values
        const result = await createNote(ownerId, note);

        expect(mockNoteCreation).toHaveBeenCalledWith({
            data: {
                title: 'Test Note Title',
                content: 'Test Note Content',
                ownerId
            }
        })
        expect(result).toEqual({ ownerId: 1, title: 'Test Note Title', content: 'Test Note Content' })
    })

    test('Creation of note should succeed if content is empty', async () => {
        const note = { title: 'Test Note Title', content: '' }
        const ownerId = 1;

        mockNoteCreation.mockResolvedValue({ ownerId: 1, title: 'Test Note Title', content: '' })

        const result = await createNote(ownerId, note);

        expect(result).toEqual({ ownerId: 1, title: 'Test Note Title', content: '' })
        expect(mockNoteCreation).toHaveBeenCalledWith({
            data: {
                title: 'Test Note Title',
                content: '',
                ownerId
            }
        })
    })
})



describe('Test cases for getting notes', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockNoteFindFirst.mockClear()
    })

    test('Get notes of a specific id should succeed', async () => {
        const noteId = 1,
            ownerId = 1;
        const note = { title: 'Test Note Title', content: 'Test Note Content', id: noteId, ownerId }

        mockNoteFindFirst.mockResolvedValue({
            id: 1,
            title: 'Test Note Title',
            content: 'Test Note Content',
            ownerId: 1
        })

        const result = await getOneNote(ownerId, noteId);

        expect(result).toEqual(note)
    })

    test('Error should be thrown if note not found', async () => {
        const noteId = 1,
            ownerId = 1;

        mockNoteFindFirst.mockResolvedValue(null)

        await expect(getOneNote(ownerId, noteId)).rejects.toBeInstanceOf(NoteNotFoundError)
    })

    test('Error should be throw if trying to get a note that doesn\'t belong to the user', async () => {
        const noteId = 1,
            ownerId = 2;

        mockNoteFindFirst.mockResolvedValue(null)

        await expect(getOneNote(ownerId, noteId)).rejects.toBeInstanceOf(NoteNotFoundError)
        expect(mockNoteFindFirst).toHaveBeenCalledWith({
            where: {
                id: noteId, AND: {
                    ownerId
                }
            }
        })
    })

    test('Test succeed even if owner has no notes stored', async () => {
        mockNoteFindMany.mockResolvedValue([])
        await getManyNotes(1).then(result => expect(result).toEqual([]))
    })

    test('Test should throw database error if database query fails', async () => {
        mockNoteFindMany.mockRejectedValue(new PrismaClientKnownRequestError('', {
            clientVersion: '',
            code: ''
        }))

        expect(() => getManyNotes(1)).rejects.toBeInstanceOf(DatabaseError)
    })
})

describe("Test cases for note updates", () => {
    const noteNotFoundError = new PrismaClientKnownRequestError('', {
        code: 'P2025',
        clientVersion: '4.7.0',
    })

    beforeEach(() => {
        jest.clearAllMocks()
        mockNoteFindFirst.mockClear()
    })

    const oldNote = {
        id: 1,
        ownerId: 1,
        title: 'Old Note Title',
        content: 'Old Note Content'
    }

    it("Update note should succeed", async () => {
        mockNoteUpdate.mockResolvedValue({
            ...oldNote,
            title: 'New Note Title',
            content: 'New Note Content'
        })

        const updatedNote = await updateNote(oldNote.ownerId, oldNote.id, { content: 'New Note Content', title: 'New Note Title' })

        // expect(() => updateNote(oldNote.ownerId, oldNote.id, oldNote)).not.toThrow()
        expect(updatedNote).toEqual({
            id: 1,
            ownerId: 1,
            title: 'New Note Title',
            content: 'New Note Content'
        })

    })

    it("Update an non-existing note should throw an error", async () => {
        mockNoteUpdate.mockRejectedValue(noteNotFoundError)
        expect(updateNote(oldNote.ownerId, oldNote.id, { content: oldNote.content, title: oldNote.title })).rejects.toBeInstanceOf(NoteNotFoundError)
    })

    it("Update exisintg note but does not belong to the owner should throw an error", async () => {
        mockNoteUpdate.mockRejectedValue(noteNotFoundError)
        expect(updateNote(2, oldNote.id, oldNote)).rejects.toBeInstanceOf(NoteNotFoundError)
    })
})

describe('Test cases for note deletion', () => {
    it('Note deletion should succeed', async () => {
        const noteId = 1,
            ownerId = 1;

        const expectedData = {
            id: noteId,
            ownerId,
            title: 'Note Title',
            content: 'Note Content'
        }
        mockNoteDelete.mockResolvedValue(expectedData)

        const result = await noteService.deleteNote(ownerId, noteId)

        expect(result).toBe(expectedData)
    })

    it('Note deletion should fail if note does not belong to the user', async () => {
        const noteId = 1,
            ownerId = 2;

        mockNoteDelete.mockRejectedValue(new PrismaClientKnownRequestError('', {
            clientVersion: '',
            code: 'P2025'
        }))

        const d = () => noteService.deleteNote(ownerId, noteId);

        expect(d).rejects.toBeInstanceOf(NoteNotFoundError)
    })

    it('Note deletion should fail if note does not exist', async () => {
        const noteId = 1,
            ownerId = 1;

        mockNoteDelete.mockRejectedValue(new PrismaClientKnownRequestError('', {
            clientVersion: '',
            code: 'P2025'
        }))

        const d = () => noteService.deleteNote(ownerId, noteId);

        expect(d).rejects.toBeInstanceOf(NoteNotFoundError)
    })
})