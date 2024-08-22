-- CreateTable
CREATE TABLE `Tag` (
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`name`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TaggedNote` (
    `id` INTEGER NOT NULL,
    `tagName` VARCHAR(191) NOT NULL,
    `noteId` INTEGER NOT NULL,

    UNIQUE INDEX `TaggedNote_tagName_noteId_key`(`tagName`, `noteId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TaggedNote` ADD CONSTRAINT `TaggedNote_tagName_fkey` FOREIGN KEY (`tagName`) REFERENCES `Tag`(`name`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TaggedNote` ADD CONSTRAINT `TaggedNote_noteId_fkey` FOREIGN KEY (`noteId`) REFERENCES `Note`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
