const express = require('express');
const router = express.Router();
const userController = require('../controller/users/usersController')
const userHelpers = require('../helpers/userHelpers')

const verifyLogin = function (req, res, next) {
    if (req.session.UserLoggedIn) {
        let user = req.session.User
        userHelpers.isUserBlocked(user._id).then((response) => {
            if (response.status) {
                next()
            } else {
                req.session.UserLoggedIn = null
                req.session.User = null
                res.redirect('/signin')
            }

        })
    } else {
        res.redirect('/signin')
    }
}



/*User Home Page*/
router.get('/', userController.getHome)

/*User Signin */
router.get('/signin', userController.getSignin);

router.post('/signin', userController.postSignin)

/*User Signup */
router.get('/signup', userController.getSignup);

router.post('/signup', userController.postSignup)

// User Otp Verification
router.get('/otp-verification', userController.getOtp)

router.post('/otp-verification', userController.postOtp)

// User Products Page
router.get('/products', userController.getProducts)

// User Product Details
router.get('/product-details', userController.getProductDetails)

// User Cart
router.get('/cart', userController.getCart)

// Add to Cart
router.post('/add-to-cart', verifyLogin, userController.postAddtoCart)

// Delete from cart 
router.get('/delete-from-cart', verifyLogin, userController.getDeleteCartProduct)

//Change Product Quantity
router.post('/change-product-quantity', userController.postChangeQuantity)

// checkout
router.get('/checkout', verifyLogin, userController.getCheckout)
router.post('/checkout', userController.postCheckout)

// verify-payment
router.post('/verify-payment', verifyLogin, userController.postVerifyPayment)
// Add adress
router.get('/add-address', verifyLogin, userController.getAddAddress)
router.post('/add-address', userController.postAddress)

// User Wishlist
router.get('/wishlist', verifyLogin, userController.getWishlist)

// Add to Wishlist
router.post('/add-to-wishlist', verifyLogin, userController.postAddtoWishlist)

// Delete wishlist Product
router.get('/delete-from-wishlist', verifyLogin, userController.getDeleteWishlist)

// User Profile
router.get('/user-profile', verifyLogin, userController.getUserProfile)

router.post('/user-profile', verifyLogin, userController.postUserProfile)

// View Orders
router.get('/orders',verifyLogin,userController.getUserOrders)

// Order Details
router.get('/orderDetails',verifyLogin,userController.getOrderDetails)

// CancelOrder
router.post('/cancelOrder',verifyLogin,userController.postCancelOrder)

// forgot password email
router.get('/change-password',userController.getForgotPassword)
router.post('/change-password',userController.postForgotPassword)

// forgot password otp
router.get('/passwordOtp',userController.getPasswordOtp)
router.post('/passwordOtp',userController.postPasswordOtp)

// reset password
router.get('/reset-password',userController.getResetPassword)
router.post('/reset-password',userController.postResetPassword)

//product filter
// router.post('/product-details/filter',userController.productFilter) 

// User Logout
router.get('/logout', userController.getLogout)

module.exports = router;
