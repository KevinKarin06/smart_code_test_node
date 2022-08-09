/*
  Warnings:

  - You are about to drop the `_articletocategory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `_articletocategory` DROP FOREIGN KEY `_ArticleToCategory_A_fkey`;

-- DropForeignKey
ALTER TABLE `_articletocategory` DROP FOREIGN KEY `_ArticleToCategory_B_fkey`;

-- DropTable
DROP TABLE `_articletocategory`;

-- CreateTable
CREATE TABLE `CategoriesOnArticles` (
    `articleId` INTEGER NOT NULL,
    `categoryId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`articleId`, `categoryId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CategoriesOnArticles` ADD CONSTRAINT `CategoriesOnArticles_articleId_fkey` FOREIGN KEY (`articleId`) REFERENCES `Article`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CategoriesOnArticles` ADD CONSTRAINT `CategoriesOnArticles_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
