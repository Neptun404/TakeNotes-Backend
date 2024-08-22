import db from '../../src/db';
import { getMockReq, getMockRes } from '@jest-mock/express';

jest.mock('../db', () => ({
    __esModule: true,
    default: {
        folder: {
            create: jest.fn(),
            findFirst: jest.fn(),
            findMany: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        }
    }
}))

const mockFolderCreation = db.folder.create as jest.Mock;
const mockFolderFindFirst = db.folder.findFirst as jest.Mock;
const mockFolderFindMany = db.folder.findMany as jest.Mock;
const mockFolderUpdate = db.folder.update as jest.Mock;
const mockFolderDelete = db.folder.delete as jest.Mock;

import {
    getFolder,
    getFolders,
    createFolder,
    deleteFolder,
    updateFolder
} from '../../src/services/folder.service';
import { Folder } from '@prisma/client';


describe('Test cases for getting folders', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockFolderFindFirst.mockClear();
    });

    it('should get return an empty array if user has no folders yet', async () => {
        const testOwnerId = 100;

        const folders = await getFolders(testOwnerId);
        mockFolderFindMany.mockResolvedValue([]);

        expect(folders).toBe([])
    })

    it('should return an array of folders', async () => {
        const testOwnerId = 100;

        const folders = await getFolders(testOwnerId);

        const mockFolders: [Folder] = [{
            id: 1,
            title: 'test',
            ownerId: testOwnerId
        }];
        mockFolderFindMany.mockResolvedValue([{}]);

        expect(folders).toBe([{}])
    })
});

describe('Test cases for creating folders', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockFolderCreation.mockClear();
    });
});

describe('Test cases for updating folders', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockFolderUpdate.mockClear();
    });
});

describe('Test cases for deleting folders', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockFolderDelete.mockClear();
    });
});