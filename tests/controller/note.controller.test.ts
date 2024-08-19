import { Note } from '@prisma/client';
import noteController from '../../src/controllers/note.controller';
import { getManyNotes, getOneNote, NoteNotFoundError } from '../../src/services/note.service';
import { Request, Response, NextFunction } from 'express';
import * as createError from 'http-errors';

jest.mock('../../src/services/note.service')

const mockGetOneNote = getOneNote as jest.Mock;
const mockGetManyNotes = getManyNotes as jest.Mock;

describe('Test getting notes from the api', () => {
    const mockData: Note = { content: 'Note Content', title: 'Note Title', id: 1, ownerId: 1 }
    const mockDatas: Note[] = [{ content: 'Note Content', title: 'Note Title', id: 1, ownerId: 1 }, { content: 'Note Content', title: 'Note Title', id: 2, ownerId: 1 }]

    let req: Partial<Request>
    let res: Partial<Response>
    let next: NextFunction;

    beforeEach(() => {
        jest.clearAllMocks()
        mockGetOneNote.mockClear()

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
        mockGetOneNote.mockClear()

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