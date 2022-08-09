const router = require('express').Router();
const multer = require("multer");
const fs = require("fs");
const ArticleController = require('../controller/ArticleController')
const articleController = new ArticleController()
const CategoryController = require('../controller/CategoryController');
const categoryController = new CategoryController()
const Joi = require('joi');
const mail = require('../service/mailservice')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let path = "public/articles/";
        if (!fs.existsSync(path)) {
            path = fs.mkdirSync(path, { recursive: true });
        }
        cb(null, path);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        let extArray = file.mimetype.split("/");
        let extension = extArray[extArray.length - 1];
        cb(null, file.fieldname + "-" + uniqueSuffix + "." + extension);
    },
});
const upload = multer({ storage: storage });

router.get('/', async (req, res, next) => {
    res.send({ message: 'Ok api is working 🚀' });
});

//ARTICLE ROUTES

router.post(
    '/article', upload.single("thumbnail"),
    articleController.newArticle
)
router.post(
    '/article/:id', upload.single("thumbnail"),
    articleController.updateArticle
)

router.get('/article', articleController.getAllArticles)
router.get('/article/:id', articleController.getArticle)


//CATEGORY ROUTES

router.post(
    '/category',
    categoryController.newCategory
)
router.put(
    '/category/:id',
    categoryController.updateCategory
)
router.get('/category', categoryController.getAllCategories)
router.get('/category/:id', categoryController.getCategory)

router.post('/news-letter', async (req, res, next) => {
    try {
        const schema = Joi.object({
            email: Joi.string().email().required(),
        })
        const { email } = req.body
        const values = await schema.validateAsync({ email })
        await mail(values.email);
        return res.json('Mail sent successfully')
    } catch (error) {
        next(error)
    }
})

module.exports = router;
