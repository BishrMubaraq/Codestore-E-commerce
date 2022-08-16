const express = require('express');
const router = express.Router();
const vendorsController = require('../controller/vendors/vendorsControllers')
const multer = require('../middlewares/multer')
const vendorHelpers = require('../helpers/vendorHelpers');
const verifyLogin = function (req, res, next) {
    if (req.session.vendorData) {
        let vendor = req.session.vendorData
        vendorHelpers.isVendorBlock(vendor._id).then((response) => {
            if (response.status) {
                next();
            } else {
                req.session.vendorData = null
                req.session.vendorLoggedIn = null
                res.redirect('/vendor/signin')
            }
        })
    } else {
        res.redirect('/vendor/signin')
    }
}

// Vendor Signin 
router.get('/signin', vendorsController.getSignin)
router.post('/signin', vendorsController.postSignin)

// Vendor Signup
router.get('/signup', vendorsController.getSignup)
router.post('/signup', vendorsController.postSignup)

// Vendor Home
router.get('/', verifyLogin, vendorsController.getHome)

// Vendor Products
router.get('/products', verifyLogin, vendorsController.getProducts)

// Vendor add Product
router.get('/add-product', verifyLogin, vendorsController.getAddProduct)

router.post('/add-product', store.array('image', 4), vendorsController.postAddProduct)

// Vendor Delete Product
router.get('/delete-product', verifyLogin, vendorsController.getDelete)

// Vendor Edit Product
router.get('/edit-product', verifyLogin, vendorsController.getEdit)

router.post('/edit-product', store.array('image', 4), vendorsController.postEdit)

// Vendor Category
router.get('/categories', verifyLogin, vendorsController.getCategories)

// Vendor Add Category
router.get('/add-category', verifyLogin, vendorsController.getAddCategory)
router.post('/add-category', vendorsController.postAddCategory)

// Vendor Edit Category
router.get('/edit-category', verifyLogin, vendorsController.getEditCategory)
router.post('/edit-category', vendorsController.postEditCategory)

// vendor delete Category
router.get('/delete-category', verifyLogin, vendorsController.getDeleteCategory)

// Vendor Profile
router.get('/profile', verifyLogin, vendorsController.getProfile)

router.post('/profile', verifyLogin, store.single('profile-image'), vendorsController.postProfile)

// Vendor Order
router.get('/orders', verifyLogin, vendorsController.getOrders)
router.post('/orders', verifyLogin, vendorsController.postOrders)

// product reviews
router.get('/product-review',verifyLogin,vendorsController.getProductReview)

// delete review
router.get('/delete-review',verifyLogin,vendorsController.deleteReview)


// Vendor Logout
router.get('/logout', vendorsController.getLogout)


// Vendor Error
router.get('/*', vendorsController.getError)

module.exports = router;