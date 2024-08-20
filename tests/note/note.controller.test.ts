import { Note } from '@prisma/client';
import noteController from '../../src/controllers/note.controller';
import { createNote, deleteNote, getManyNotes, getOneNote, NoteNotFoundError } from '../../src/services/note.service';
import { Request, Response, NextFunction } from 'express';
import { createError } from '../../src/utils/createError';

jest.mock('../../src/services/note.service')

const mockGetOneNote = getOneNote as jest.Mock;
const mockGetManyNotes = getManyNotes as jest.Mock;
const mockCreateNote = createNote as jest.Mock;
const mockDeleteNote = deleteNote as jest.Mock;

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
