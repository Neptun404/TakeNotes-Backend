export async function getFolder(id: number) {
    throw new Error("Not implemented");
}

export async function getFolders(ownerId: number) {
    throw new Error("Not implemented");
}

export async function createFolder(folder: { title: string, ownerId: number }) {
    throw new Error("Not implemented");
}

export async function updateFolder(id: number, folder: { title: string, ownerId: number }) {
    throw new Error("Not implemented");
}

export async function deleteFolder(id: number) {
    throw new Error("Not implemented");
}

export default {
    getFolder,
    getFolders,
    createFolder,
    updateFolder,
    deleteFolder
}