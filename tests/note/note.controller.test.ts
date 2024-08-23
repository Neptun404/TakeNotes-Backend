import { Note } from '@prisma/client';
import noteController, { InvalidTagsError } from '../../src/controllers/note.controller';
import { createNote, deleteNote, getManyNotes, getOneNote, updateNote } from '../../src/services/note.service';
import { Request, Response, NextFunction } from 'express';
import { createError } from '../../src/utils/createError';
import { getMockReq, getMockRes } from '@jest-mock/express'
import { NoteNotFoundError } from '../../src/errors/DatabaseErrors';

jest.mock('../../src/services/note.service')

const mockGetOneNote = getOneNote as jest.Mock;
const mockGetManyNotes = getManyNotes as jest.Mock;
const mockCreateNote = createNote as jest.Mock;
const mockDeleteNote = deleteNote as jest.Mock;
const mockUpdateNote = updateNote as jest.Mock;

describe('Test getting notes from the api', () => {
    const mockData: Note = { content: 'Note Content', title: 'Note Title', id: 1, ownerId: 1 }
    const mockDatas: Note[] = [{ content: 'Note Content', title: 'Note Title', id: 1, ownerId: 1 }, { content: 'Note Content', title: 'Note Title', id: 2, ownerId: 1 }]

    let req: Partial<Request>
    let res: Partial<Response>
    let next: NextFunction;

    beforeEach(() => {
        jest.clearAllMocks()

        req = {
            params: { id: '1' } // Ensure params are strings, as they are in real HTTP requests
        };

        res = {
            locals: { userId: 1 },
            status: jest.fn().mockReturnThis(), // Allows method chaining
            json: jest.fn(),
            send: jest.fn()
        };

        next = jest.fn();
    })

    it('Test succesful retrieval of a note', async () => {
        mockGetOneNote.mockResolvedValue({
            id: 1,
            ownerId: 1,
            content: 'Note Content',
            title: 'Note Title',
        })

        await noteController.getNote(req as Request, res as Response, next)
        expect(res.json).toHaveBeenLastCalledWith({ status: 'success', message: 'Note found', data: mockData })
        expect(res.status).toHaveBeenCalledWith(200)
    })

    it('Test error thrown for invalid note id', async () => {
        req.params!.id = 'invalid' // Set an non number value for the id
        noteController.getNote(req as Request, res as Response, next)
        expect(next).toHaveBeenCalledWith(createError(400, 'Invalid note id'))
    })

    it('Test error thrown for note not found', async () => {
        mockGetOneNote.mockRejectedValue(new NoteNotFoundError('Note not found'))
        await noteController.getNote(req as Request, res as Response, next)

        expect(next).toHaveBeenCalledWith(createError(404, 'Note not found'))
    })

    it('Test error thrown if note exists but is not owned by the user', async () => {
        mockGetOneNote.mockRejectedValue(new NoteNotFoundError('Note not found'))
        await noteController.getNote(req as Request, res as Response, next);

        expect(next).toHaveBeenCalledWith(createError(404, 'Note not found'))
    })
})

describe('Test cases for getting multiple notes controller', () => {
    let req: Partial<Request>
    let res: Partial<Response>
    let next: NextFunction;

    const mockDatas: Note[] = [{ content: 'Note Content', title: 'Note Title', id: 1, ownerId: 1 }, { content: 'Note Content', title: 'Note Title', id: 2, ownerId: 1 }]

    beforeEach(() => {
        jest.clearAllMocks()

        req = {
        };

        res = {
            locals: { userId: 1 },
            status: jest.fn().mockReturnThis(), // Allows method chaining
            json: jest.fn(),
            send: jest.fn()
        };

        next = jest.fn();
    })

    it('Get multiple notes should succeed', async () => {
        mockGetManyNotes.mockResolvedValue(mockDatas)
        await noteController.getNotes(req as Request, res as Response, next)
        expect(res.json).toHaveBeenCalledWith({ status: 'success', message: 'Notes found', data: mockDatas })
    })

    it('Get notes should succeed even if the owner has no notes created', async () => {
        mockGetManyNotes.mockResolvedValue([])
        await noteController.getNotes(req as Request, res as Response, next)
        expect(res.json).toHaveBeenCalledWith({ status: 'success', message: 'Notes found', data: [] })
    })
})

describe('Test cases for note creation', () => {
    let req: Partial<Request>
    let res: Partial<Response>
    let next: NextFunction;

    beforeEach(() => {
        jest.clearAllMocks()

        req = {
        };

        res = {
            locals: { userId: 1 },
            status: jest.fn().mockReturnThis(), // Allows method chaining
            json: jest.fn(),
            send: jest.fn()
        };

        next = jest.fn();
    })

    it('Should succeed if no tags are provided', async () => {
        req.body = { title: 'Test Note Title', content: 'Test Note Content' }

        mockCreateNote.mockResolvedValue({
            id: 1,
            ownerId: 1,
            content: 'Test Note Content',
            title: 'Test Note Title',
            tags: []
        })
        await noteController.createNote(req as Request, res as Response, next)

        expect(res.json).toHaveBeenCalledWith({
            status: 'success',
            message: 'Note created',
            data: {
                id: 1,
                ownerId: 1,
                content: 'Test Note Content',
                title: 'Test Note Title',
                tags: []
            }
        })
        expect(next).not.toHaveBeenCalled()
    })

    it('should succeed if tags are provided', async () => {
        req.body = {
            title: 'Test Note Title',
            content: 'Test Note Content',
            tags: ['tag1', 'tag2']
        }

        const mockedResolve = {
            id: 1,
            ownerId: 1,
            content: 'Test Note Content',
            title: 'Test Note Title',
            tags: ['tag1', 'tag2']
        }
        mockCreateNote.mockResolvedValue(mockedResolve)

        await noteController.createNote(req as Request, res as Response, next)

        expect(next).not.toHaveBeenCalled()
        expect(res.json).toHaveBeenCalledWith({
            status: 'success',
            message: 'Note created',
            data: {
                ...mockedResolve
            }
        })
    })

    it('should succeed if tags array contains non-string values', async () => {
        req.body = {
            title: 'Test Note Title',
            content: 'Test Note Content',
            tags: ['tag1', 1234]
        }

        const mockedNote = {
            id: 1,
            ownerId: 1,
            content: 'Test Note Content',
            title: 'Test Note Title',
            tags: ['tag1', 1234]
        }
        mockCreateNote.mockResolvedValue(mockedNote)
        await noteController.createNote(req as Request, res as Response, next)

        expect(next).not.toHaveBeenCalled()
        expect(res.json).toHaveBeenCalledWith({
            status: 'success',
            message: 'Note created',
            data: {
                ...mockedNote
            }
        })
    })

    it('should fail if note has more than 20 tags', async () => {
        req.body = {
            title: 'Test Note Title',
            content: 'Test Note Content',
            tags: Array(21).fill('tag1')
        }

        mockCreateNote.mockRejectedValue(new InvalidTagsError('Note can have at most 20 tags'))
        await noteController.createNote(req as Request, res as Response, next)

        expect(res.json).not.toHaveBeenCalled()
        expect(next).toHaveBeenCalledWith(createError(400, 'Note can have at most 20 tags'))
    })

    it('should fail if note has duplicate tags', async () => {
        req.body = {
            title: 'Test Note Title',
            content: 'Test Note Content',
            tags: ['tag1', 'tag2', 'tag1']
        }

        await noteController.createNote(req as Request, res as Response, next)

        expect(res.json).not.toHaveBeenCalled()
        expect(next).toHaveBeenCalledWith(createError(400, 'Duplicate tags are not allowed'))
    })

    it('should fail if tags are not in an array format', async () => {
        req.body = {
            title: 'Test Note Title',
            content: 'Test Note Content',
            tags: 'invalid-format'
        }

        mockCreateNote.mockRejectedValue(new InvalidTagsError('Tags must be in an array format'))
        await noteController.createNote(req as Request, res as Response, next)

        expect(res.json).not.toHaveBeenCalled()
        expect(next).toHaveBeenCalledWith(createError(400, 'Tags must be in an array format'))
    })

    it('should fail if tags are empty', async () => {
        req.body = {
            title: 'Test Note Title',
            content: 'Test Note Content',
            tags: ['tag1', '', 'tag2']
        }

        mockCreateNote.mockRejectedValue(new InvalidTagsError('Tags cannot be empty'))
        await noteController.createNote(req as Request, res as Response, next)

        expect(res.json).not.toHaveBeenCalled()
        expect(next).toHaveBeenCalledWith(createError(400, 'Tags cannot be empty'))
    })

    it('should succeed if tags contain special characters', async () => {
        req.body = {
            title: 'Test Note Title',
            content: 'Test Note Content',
            tags: ['tag1', '@f&yp', '眠-い']
        }

        const mockedNote = {
            id: 1,
            ownerId: 1,
            content: 'Test Note Content',
            title: 'Test Note Title',
            tags: ['tag1', '@f&yp', '眠-い']
        }
        mockCreateNote.mockResolvedValue(mockedNote)
        await noteController.createNote(req as Request, res as Response, next)

        expect(res.json).toHaveBeenCalledWith({
            status: 'success',
            message: 'Note created',
            data: {
                ...mockedNote
            }
        })
    })

    it('Note creation should be successful', async () => {
        const mockData = { ownerId: 1, title: 'Test Note Title', content: 'Test Note Content' }

        mockCreateNote.mockResolvedValue(mockData)
        req.body = { title: 'Test Note Title', content: 'Test Note Content' }
        await noteController.createNote(req as Request, res as Response, next)

        expect(res.json).toHaveBeenCalledWith({
            status: 'success',
            message: 'Note created',
            data: mockData
        })
    })

    it('Test error 400 should be thrown if title is missing', async () => {
        req.body = { content: 'Test Note Content' }
        await noteController.createNote(req as Request, res as Response, next)

        expect(next).toHaveBeenCalledWith(createError(400, 'Title and content are required'))
    })

    it('Test error 400 should be thrown if content is missing', async () => {
        req.body = { title: 'Test Note Title' }
        await noteController.createNote(req as Request, res as Response, next)

        expect(next).toHaveBeenCalledWith(createError(400, 'Title and content are required'))
    })

    it('Test error 400 should be thrown if title is an empty string', async () => {
        req.body = { title: '  ', content: 'Test Note Content' }
        await noteController.createNote(req as Request, res as Response, next);

        expect(next).toHaveBeenCalledWith(createError(400, 'Title cannot be empty'))
    })
})

describe('Test cases for note deletion', () => {
    let req: Partial<Request>
    let res: Partial<Response>
    let next: NextFunction;

    beforeEach(() => {
        jest.clearAllMocks()

        req = {
            params: { id: '1' } // Ensure params are strings, as they are in real HTTP requests
        };

        res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis(), // Allows method chaining
            locals: { userId: 1 },
        };

        next = jest.fn();
    })

    it('Test note deletion should succeed', async () => {
        req.params = { id: '1' }
        mockDeleteNote.mockResolvedValue({
            id: 1,
            ownerId: res.locals!.userId,
            title: 'Note Title',
            content: 'Note Content'
        })

        await noteController.deleteNote(req as Request, res as Response, next)

        expect(next).toHaveBeenCalledTimes(0)
        expect(res.json).toHaveBeenCalledWith({
            status: 'success',
            message: 'Note deleted'
        })
    })

    it('Test error 400 should be thrown if note id is missing', async () => {
        req.params = {}

        await noteController.deleteNote(req as Request, res as Response, next)

        expect(next).toHaveBeenCalledWith(createError(400, `${req.params!.id} is an invalid note id`))
    })

    it('Test error 400 should be thrown if note id is invalid', async () => {
        req.params!.id = 'abc';

        await noteController.deleteNote(req as Request, res as Response, next)

        expect(next).toHaveBeenCalledWith(createError(400, `${req.params!.id} is an invalid note id`))
    })

    it('Test error 404 should be sent if note does not exist', async () => {
        mockDeleteNote.mockRejectedValue(new NoteNotFoundError('Note not found'))

        await noteController.deleteNote(req as Request, res as Response, next)

        expect(next).toHaveBeenCalledWith(createError(404, 'Note not found'))
    })

    it('Test error 404 should be sent if note exists but is not owned by the user', async () => {
        res.locals!.userId = 2 // Ensure that the user is not the owner of the note
        mockDeleteNote.mockRejectedValue(new NoteNotFoundError('Note not found'))

        await noteController.deleteNote(req as Request, res as Response, next)

        expect(res.json).not.toHaveBeenCalled()
        expect(next).toHaveBeenCalledWith(createError(404, 'Note not found'))
    })
})

describe('Check function \'updateNote controller\'', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should return 200 when note is updated', async () => {
        const mockData: Note = { content: 'New Content', title: 'New Title', id: 1, ownerId: 1 }
        const req = getMockReq({ params: { id: '1' }, body: { title: 'Old Title', content: 'Old Content' } })
        const { res, next } = getMockRes({ locals: { userId: 1 } })

        mockUpdateNote.mockResolvedValue(mockData)
        await noteController.updateNote(req, res, next)

        expect(next).not.toHaveBeenCalled()
        expect(res.json).toHaveBeenCalledWith({
            status: 'success',
            message: 'Note updated',
            data: mockData
        })
    })

    it('should return 400 when title or content is not sent', async () => {
        const req = getMockReq({ params: { id: '1' }, body: {} })
        const { res, next } = getMockRes({ locals: { userId: 1 } })

        await noteController.updateNote(req, res, next)

        expect(res.json).not.toHaveBeenCalled()
        expect(next).toHaveBeenCalledWith(createError(400, 'Title and content are required'))
    })

    it('should return 400 when title is empty', async () => {
        const req = getMockReq({ params: { id: '1' }, body: { title: '  ', content: 'Old Content' } })
        const { res, next } = getMockRes({ locals: { userId: 1 } })

        await noteController.updateNote(req, res, next)

        expect(res.json).not.toHaveBeenCalled()
        expect(next).toHaveBeenCalledWith(createError(400, 'Title cannot be empty'))
    })

    it('should return 404 when note is not found', async () => {
        const req = getMockReq({ params: { id: '1' }, body: { title: 'Old Title', content: 'Old Content' } })
        const { res, next } = getMockRes({ locals: { userId: 1 } })

        mockUpdateNote.mockRejectedValue(new NoteNotFoundError('Note not found'))
        await noteController.updateNote(req, res, next)

        expect(res.json).not.toHaveBeenCalled()
        expect(next).toHaveBeenCalledWith(createError(404, 'Note not found'))
    })

    it('should return 404 when note exists but is not owned by the user', async () => {
        const req = getMockReq({ params: { id: '1' }, body: { title: 'Old Title', content: 'Old Content' } })
        const { res, next } = getMockRes({ locals: { userId: 2 } })

        mockUpdateNote.mockRejectedValue(new NoteNotFoundError('Note not found'))

        await noteController.updateNote(req, res, next)

        expect(res.json).not.toHaveBeenCalled()
        expect(next).toHaveBeenCalledWith(createError(404, 'Note not found'))
    })
})