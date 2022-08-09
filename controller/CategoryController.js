const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const Joi = require('joi');

class CategoryController {

    getAllCategories = async (req, res, next) => {
        try {
            const categories = await prisma.category.findMany({
                orderBy: { createdAt: 'desc' }
            });
            return res.json(categories);
        } catch (error) {
            return next(error);
        }
    };
    //
    getCategory = async (req, res, next) => {
        try {
            const id = parseInt(req.params.id);

            const category = await prisma.category.findUniqueOrThrow({
                where: { id: id }
            });
            return res.json(category);
        } catch (error) {
            return next(error);
        }
    };
    //
    newCategory = async (req, res, next) => {
        try {
            const schema = Joi.object({
                title: Joi.string().required().max(50),
                description: Joi.string().optional().max(150),
            })
            const { title, description } = req.body

            const values = await schema.validateAsync({ title, description })

            const category = await prisma.category.create({ data: { title: values.title, description: values.description } })

            return res.json(category);
        } catch (error) {
            return next(error);
        }
    };
    //
    updateCategory = async (req, res, next) => {
        try {
            const schema = Joi.object({
                title: Joi.string().required().max(50),
                description: Joi.string().optional().max(150),
            })
            const { title, description } = req.body
            const id = parseInt(req.params.id);

            const oldCategory = await prisma.category.findUniqueOrThrow({ where: { id: id } })

            const values = await schema.validateAsync({ title, description })

            const category = await prisma.category.update({ where: { id: oldCategory.id }, data: { title: values.title, description: values.description } })

            return res.json(category);
        } catch (error) {
            return next(error);
        }
    };
}

module.exports = CategoryController;