/*
  Warnings:

  - You are about to drop the `_FolderToTag` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `_FolderToTag` DROP FOREIGN KEY `_FolderToTag_A_fkey`;

-- DropForeignKey
ALTER TABLE `_FolderToTag` DROP FOREIGN KEY `_FolderToTag_B_fkey`;

-- DropTable
DROP TABLE `_FolderToTag`;
