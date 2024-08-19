import { HttpError } from 'http-errors';

export function createError(statusCode: number, name: string, message?: string | undefined): HttpError {
    return {
        expose: true,
        message: message ?? name,
        name,
        statusCode,
        status: statusCode
    }
}

export default createError;