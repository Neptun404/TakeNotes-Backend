import { PrismaClientInitializationError, PrismaClientRustPanicError, PrismaClientValidationError, PrismaClientKnownRequestError, PrismaClientUnknownRequestError } from "@prisma/client/runtime/library";

type PrismaClientError = PrismaClientInitializationError | PrismaClientRustPanicError | PrismaClientValidationError | PrismaClientKnownRequestError | PrismaClientUnknownRequestError | Error

export class InvalidNoteIDError extends Error {
    message: string
    constructor(message: string) {
        super(message)
        this.message = message;
    }
}

export class NoteNotFoundError extends Error {
    name: string
    message: string

    constructor(message: string) {
        super(message)
        this.name = 'NoteNotFoundError';
        this.message = message
    }
}

export class DatabaseError {
    message: string
    dbError: PrismaClientError
    constructor(
        message: string,
        dbError: PrismaClientError
    ) {
        this.message = message;
        this.dbError = dbError
    }
}

export class FolderNotFoundError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "FolderNotFoundError";
        this.message = message;
    }
}