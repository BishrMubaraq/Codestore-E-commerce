const express = require('express');
const router = express.Router();
const adminController = require('../controller/admin/adminController')
const multer = require('../middlewares/multer')
const verifyLogin = function (req, res, next) {
    if (req.session.adminLoggedIn) {
        next()
    } else {
        res.redirect('/admin/login')
    }
}


// Admin Home
router.get('/', adminController.getHome);

/* Admin Login */
router.get('/login', adminController.getLogin);

router.post('/login', adminController.postLogin)

// Admin Vendor Products
router.get('/products', verifyLogin, adminController.getProducts)

// Admin Vendor Product delete
router.get('/delete-product', verifyLogin, adminController.getDeleteVendorProduct)

// Admin Users
router.get('/users', verifyLogin, adminController.getUsers)

// Admin Block User
router.get('/block-user', verifyLogin, adminController.getBlockUser)

// Admin Unblock User
router.get('/unblock-user', verifyLogin, adminController.getUnblockUser)

// Admin Vendors
router.get('/vendors', verifyLogin, adminController.getVendors)

// Admin Block User
router.get('/block-vendor', verifyLogin, adminController.getBlockVendor)

// Admin Unblock User
router.get('/unblock-vendor', verifyLogin, adminController.getUnblockVendor)

// Admin Categories
router.get('/categories', verifyLogin, adminController.getCategories)

// Admin Add Categories
router.get('/add-category', verifyLogin, adminController.getAddCategory)

router.post('/add-category', adminController.postAddCategory)

// Admin Edit Categories
router.get('/edit-category', verifyLogin, adminController.getEditCategory)

router.post('/edit-category', adminController.postEditCategory)

// Admin delete Category
router.get('/delete-category', verifyLogin, adminController.getCategoryDelete)

// Admin's Products
router.get('/admin-products', verifyLogin, adminController.getAdminProducts)

//Admin add Products
router.get('/add-product', verifyLogin, adminController.getAdminAddProducts)
router.post('/add-product', store.array('image', 4), adminController.postAdminAddProducts)

// Admin edit Products
router.get('/edit-product', verifyLogin, adminController.getEditProduct)
router.post('/edit-product', store.array('image', 4), adminController.postEditProduct)

// Admin Delete Products
router.get('/delete-Adminproduct', verifyLogin, adminController.getDeleteAdminProduct)

// Admin Banner Management
router.get('/banner', verifyLogin, adminController.getBanners)

// Admin Add Banner
router.get('/add-banner', verifyLogin, adminController.getAddBanner)

router.post('/add-banner', store.single('image'), adminController.postAddBanner)

// Admin Edit Banner
router.get('/edit-banner', verifyLogin, adminController.getEditBanner)

router.post('/edit-banner', store.single('image'), adminController.postEditBanner)

// Delete Banner
router.get('/delete-banner', verifyLogin, adminController.getDeleteBanner)

// All Admin Orders
router.get('/orders', verifyLogin, adminController.getAdminOrders)
router.post('/orders', verifyLogin, adminController.postAdminOrders)

// All Orders
router.get('/allOrders', verifyLogin, adminController.getAllOrders)
router.post('/allOrders', verifyLogin, adminController.postAllOrders)

// Product reviews
router.get('/reviews', verifyLogin, adminController.getReveiws)
router.get('/delete-review', verifyLogin, adminController.deleteReview)

// Vendor approval
router.get('/vendor-approval',verifyLogin,adminController.getVendorApproval)
router.get('/approve-vendor',verifyLogin,adminController.VendorApproval)

// Admin Logout
router.get('/logout', adminController.getLogout)

// Admin Error
router.get('/*', adminController.getError)

module.exports = router;
