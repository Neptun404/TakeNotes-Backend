import db from "../../src/db";
import {
    createTags
} from '../../src/services/tag.service'

jest.mock('../../src/db', () => ({
    __esModule: true,
    default: {
        tag: {
            createTags: jest.fn()
        }
    }
}))


const mockCreateTags = db.tag.createMany as jest.Mock;

it('', () => {
    expect(true)
})