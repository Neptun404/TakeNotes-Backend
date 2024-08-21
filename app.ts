const err = new Error('This is my error')

class InvalidNoteIdError extends Error {
    constructor(message: string) {
        super(message)
        this.name = "InvalidNoteIDError"
        this.message = message
    }
}

class NoteNotFoundError extends Error {
    constructor(message: string) {
        super(message)
        this.name = "NoteNotFoundError"
        this.message = message
    }
}

