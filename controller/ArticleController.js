const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const Joi = require('joi');
const { env } = require("process");
const Utils = require('../utils')
const axios = require('axios');

class ArticleController {
    getAllArticles = async (req, res, next) => {
        try {

            const url = `https://newsapi.org/v2/everything?q=tech&apiKey=${process.env.API_KEY}`
            const response = await axios.get(url);

            const remote = response.data.articles

            const articles = await prisma.article.findMany({
                orderBy: { createdAt: 'desc' }, include: { categories: { select: { category: { select: { title: true } } } } }
            });

            const merged = articles.concat(remote);
            const sorted = merged.sort((a, b) => {
                return new Date(b.publishedAt) - new Date(a.publishedAt);
            })
            return res.json(sorted);
        } catch (error) {
            return next(error);
        }
    };
    getArticle = async (req, res, next) => {
        try {
            const id = parseInt(req.params.id);

            const article = await prisma.article.findUnique({
                where: { id: id },
                include: { categories: { select: { category: { select: { title: true } } } } },
            });
            if (article) {
                return res.json(article);
            }
            return res.status(404).json({ "message": "Article Not Found" });
        } catch (error) {
            return next(error);
        }
    };
    deleteArticle = async (req, res, next) => {
        try {
            const id = parseInt(req.params.id);

            const article = await prisma.article.findUnique({
                where: { id: id },
                include: { categories: true },
                rejectOnNotFound: true
            });
            for (const index in article.categories) {
                console.log(index);
                await prisma.categoriesOnArticles.delete({
                    where: {
                        articleId_categoryId:
                        {
                            articleId: article.categories[index].articleId,
                            categoryId: article.categories[index].categoryId
                        }
                    }
                })
            }
            const deleted = await prisma.article.delete({ where: { id: article.id } });
            return res.json(deleted);
        } catch (error) {
            return next(error);
        }
    };
    //
    newArticle = async (req, res, next) => {
        try {
            const schema = Joi.object({
                sourceId: Joi.optional(),
                sourceName: Joi.optional(),
                title: Joi.string().required().max(50),
                description: Joi.string().required().max(150),
                content: Joi.string().required(),
                breaking: Joi.boolean().optional(),
                bannerText: Joi.string().optional(),
                author: Joi.string().required(),
                color: Joi.string().optional(),
                category: Joi.array()
            })
            const { sourceId, sourceName,
                title, description, content,
                breaking, bannerText, color,
                category, author } = req.body

            const values = await schema.validateAsync(
                {
                    sourceId, sourceName, title,
                    description, content,
                    breaking, bannerText,
                    color, category, author
                }
            )
            if (!req.file) {
                throw Error('article thumbnail is required')
            }
            const convertedPath = req.file.path.replace(/\\/g, "/");
            const imgPath = `${process.env.BASE_URL}/${convertedPath}`

            if (values.category != undefined || values.category != null) {
                const categories = await prisma.category.findMany({
                    where:
                        { id: { in: values.category.map(el => parseInt(el)) } }, select: { id: true }
                })
                delete values.category
                const article = await prisma.article.create({
                    data: {
                        ...values,
                        imgUrl: imgPath,
                    }
                })
                const pivotData = []
                categories.forEach(element => {
                    let temp = {}
                    temp.articleId = article.id
                    temp.categoryId = element.id
                    pivotData.push(temp)
                });
                const pivot = await prisma.categoriesOnArticles.createMany({
                    data: pivotData
                })
                return res.status(201).json(article)
            } else {
                const article = await prisma.article.create({
                    data: { ...values, imgUrl: imgPath }
                })
                return res.status(201).json(article)
            }
        } catch (error) {
            if (req.file) {
                Utils.deleteFile(req.file.path)
            }
            return next(error);
        }
    };

    updateArticle = async (req, res, next) => {
        try {
            const schema = Joi.object({
                sourceId: Joi.optional(),
                sourceName: Joi.optional(),
                title: Joi.string().required().max(50),
                description: Joi.string().required().max(150),
                content: Joi.string().required(),
                breaking: Joi.boolean().optional(),
                bannerText: Joi.string().optional(),
                author: Joi.string().required(),
                color: Joi.string().optional(),
                category: Joi.array()
            })
            const { sourceId, sourceName,
                title, description, content,
                breaking, bannerText, color,
                category, author } = req.body

            const values = await schema.validateAsync(
                {
                    sourceId, sourceName, title,
                    description, content,
                    breaking, bannerText,
                    color, category, author
                }
            )
            let imgPath = null
            if (req.file) {
                const convertedPath = req.file.path.replace(/\\/g, "/");
                imgPath = `${process.env.BASEURL}/${convertedPath}`
            }

            const id = parseInt(req.params.id);

            const articleOld = await prisma.article.findUniqueOrThrow({
                where: { id: id },
                include: { categories: true }
            });
            for (const index in articleOld.categories) {
                console.log(index);
                await prisma.categoriesOnArticles.delete({
                    where: {
                        articleId_categoryId:
                        {
                            articleId: articleOld.categories[index].articleId,
                            categoryId: articleOld.categories[index].categoryId
                        }
                    }
                })
            }

            if (values.category != undefined || values.category != null) {
                const categories = await prisma.category.findMany({
                    where:
                        { id: { in: values.category.map(el => parseInt(el)) } }, select: { id: true }
                })
                delete values.category
                const article = await prisma.article.update({
                    where: { id: articleOld.id },
                    data: {
                        ...values,
                        imgUrl: imgPath ?? article.articleOld.imgUrl,
                    }
                })
                const pivotData = []
                categories.forEach(element => {
                    let temp = {}
                    temp.articleId = article.id
                    temp.categoryId = element.id
                    pivotData.push(temp)
                });
                await prisma.categoriesOnArticles.createMany({
                    data: pivotData
                })
                return res.status(201).json(article)
            } else {
                const article = await prisma.article.update({
                    where: { id: articleOld.id },
                    data: { ...values, imgUrl: imgPath ?? articleOld.imgUrl }
                })
                return res.status(201).json(article)
            }
        } catch (error) {
            if (req.file) {
                Utils.deleteFile(req.file.path)
            }
            return next(error);
        }
    };
}

module.exports = ArticleController;