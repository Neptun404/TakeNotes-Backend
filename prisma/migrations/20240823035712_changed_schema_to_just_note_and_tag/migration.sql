/*
  Warnings:

  - The primary key for the `Tag` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the `Folder` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `NoteFolder` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TaggedNote` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name]` on the table `Tag` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `id` to the `Tag` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Folder` DROP FOREIGN KEY `Folder_ownerId_fkey`;

-- DropForeignKey
ALTER TABLE `NoteFolder` DROP FOREIGN KEY `NoteFolder_folderId_fkey`;

-- DropForeignKey
ALTER TABLE `NoteFolder` DROP FOREIGN KEY `NoteFolder_noteId_fkey`;

-- DropForeignKey
ALTER TABLE `TaggedNote` DROP FOREIGN KEY `TaggedNote_noteId_fkey`;

-- DropForeignKey
ALTER TABLE `TaggedNote` DROP FOREIGN KEY `TaggedNote_tagName_fkey`;

-- AlterTable
ALTER TABLE `Tag` DROP PRIMARY KEY,
    ADD COLUMN `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- DropTable
DROP TABLE `Folder`;

-- DropTable
DROP TABLE `NoteFolder`;

-- DropTable
DROP TABLE `TaggedNote`;

-- CreateTable
CREATE TABLE `_NoteToTag` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_NoteToTag_AB_unique`(`A`, `B`),
    INDEX `_NoteToTag_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Tag_name_key` ON `Tag`(`name`);

-- AddForeignKey
ALTER TABLE `_NoteToTag` ADD CONSTRAINT `_NoteToTag_A_fkey` FOREIGN KEY (`A`) REFERENCES `Note`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_NoteToTag` ADD CONSTRAINT `_NoteToTag_B_fkey` FOREIGN KEY (`B`) REFERENCES `Tag`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
