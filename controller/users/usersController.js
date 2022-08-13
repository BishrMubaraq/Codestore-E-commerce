const userHelpers = require('../../helpers/userHelpers')
const productHelpers = require('../../helpers/productHelpers')
const twilioHelpers = require('../../helpers/twilioHelpers')
const bannerHelpers = require('../../helpers/bannerHelpers')
const categoryHelpers = require('../../helpers/categoryHelpers')

module.exports = {
    // user Home page
    getHome: async (req, res, next) => {
        try {
            let user = req.session.User
            let banners = await bannerHelpers.getAllBanners()
            let cartProducts = false
            let categories = await categoryHelpers.getAllCategories()
            let totalAmount = null

            if (user) {
                cartProducts = await userHelpers.getCartProducts(user._id)
                totalAmount = await userHelpers.getCartTotal(user._id)

            }
            let cartCount = null
            let wishlistCount = null
            if (user) {
                cartCount = await userHelpers.getCartCount(user._id)
                wishlistCount = await userHelpers.getWhishlistCount(user._id)

            }
            productHelpers.getLimitedProducts().then((products) => {
                res.render('users/userHome', {
                    layout: 'userLayout', user, products, cartCount, banners, home: true, cartProducts, categories, totalAmount, wishlistCount
                })
            })
        } catch (err) {
            next(err)
        }
    },

    // user Signin
    getSignin: (req, res) => {
        let userLogin = req.session.UserLoggedIn
        if (userLogin) {
            res.redirect('/')
        } else {
            res.render('users/userLogin', { layout: 'loginLayout', loginErr: req.session.UserLoginErr })
            req.session.UserLoginErr = false
        }
    },
    postSignin: (req, res, next) => {
        userHelpers.doLogin(req.body).then((response) => {
            if (response.loginStatus) {
                req.session.UserLoggedIn = true
                req.session.User = response.userData
                res.redirect('/')
            } else {
                if (response.userStatus) {
                    req.session.UserLoginErr = 'Access Denied'
                    res.redirect('/signin')
                } else {
                    req.session.UserLoginErr = 'Invalid Email or Password'
                    res.redirect('/signin')
                }

            }
        }).catch((err) => {
            next(err)
        })

    },
    // user Signup
    getSignup: (req, res) => {
        let userLogin = req.session.UserLoggedIn
        if (userLogin) {
            res.redirect('/')
        } else {
            res.render('users/userSignup', { layout: 'loginLayout', signupErr: req.session.signupErr })
            req.session.signupErr = false

        }
    },

    postSignup: async (req, res, next) => {
        try {
            let alreadyUser = await userHelpers.alreadyUserCheck(req.body)
            if (alreadyUser.status) {
                req.session.signupErr = "Email or MobileNumber already taken"
                res.redirect('/signup')
            } else {
                req.session.userBody = req.body
                twilioHelpers.doSms(req.session.userBody).then((data) => {
                    if (data) {
                        res.redirect('/otp-verification')
                    } else {
                        res.redirect('/signup')
                    }
                })
            }
        } catch (err) {
            next(err)
        }
    },
    // Otp Verification
    getOtp: (req, res) => {
        res.render('users/userOtp', { layout: 'loginLayout', otpErr: req.session.otpErr })
        req.session.otpErr = false
    },
    postOtp: (req, res, next) => {
        twilioHelpers.otpVerify(req.body, req.session.userBody).then((response) => {
            if (response.valid) {
                userHelpers.doSignup(req.session.userBody).then((response) => {
                    req.session.UserLoggedIn = true
                    req.session.User = response.userData
                    res.redirect('/')
                }).catch((err) => {
                    next(err)
                })
            } else {
                req.session.otpErr = 'Invalid OTP.'
                res.redirect('/otp-verification')
            }
        }).catch((err) => {
            next(err)
        })
    },
    // User Products
    getProducts: async (req, res, next) => {
        try {
            let user = req.session.User
            let cartProducts = false
            let categories = await categoryHelpers.getAllCategories()
            let cartCount = null
            let wishlistCount = null
            if (user) {
                cartProducts = await userHelpers.getCartProducts(user._id)
                cartCount = await userHelpers.getCartCount(user._id)
                wishlistCount = await userHelpers.getWhishlistCount(user._id)

            }
            productHelpers.getAllProducts().then((products) => {
                res.render('users/userProduct', { layout: 'userLayout', products, user, cartCount, shop: true, cartProducts, wishlistCount,categories })
            })
        } catch (err) {
            next(err)
        }

    },
    // User Product Details
    getProductDetails: async (req, res, next) => {
        let user = req.session.User
        let cartProducts = false
        let userReviews=false
        
        try {
            let cartCount = null
            let wishlistCount = null
            if (user) {
                cartProducts = await userHelpers.getCartProducts(user._id)
                cartCount = await userHelpers.getCartCount(user._id)
                wishlistCount = await userHelpers.getWhishlistCount(user._id)
                userReviews=await productHelpers.getUserReview(req.query.id,user._id)
            }
            proId = req.query.id
            let allReviews=await productHelpers.getAllReviews(proId)
            let reviewCount=0
            if(allReviews.length>0){
                reviewCount=allReviews.length
            }
            productHelpers.getProduct(proId).then((productDetails) => {
                res.render('users/productDetails', { layout: 'userLayout', productDetails, user, cartCount, cartProducts,allReviews,userReviews,reviewCount,wishlistCount })
            }).catch((err) => {
                next(err)
            })
        } catch (err) {
            next(err)
        }


    },
    // User Cart
    getCart: async (req, res, next) => {
        try {
            let user = req.session.User
            let cartCount = null
            let wishlistCount = null
            if (user) {
                wishlistCount = await userHelpers.getWhishlistCount(user._id)
                cartCount = await userHelpers.getCartCount(user._id)
            }
            if (user) {
                userHelpers.getCartProducts(user._id).then(async (cartProducts) => {
                    let totalAmount = await userHelpers.getCartTotal(user._id)
                    res.render('users/userCart', { layout: 'userLayout', cartProducts, user, cartCount, totalAmount,wishlistCount })
                })
            } else {
                res.render('users/userCart', { layout: 'userLayout', })
            }
        } catch (err) {
            next(err)
        }

    },
    // User Add to Cart
    postAddtoCart: (req, res, next) => {
        let user = req.session.User
        userHelpers.addToCart(user._id, req.body).then(() => {
            res.redirect('back')
        }).catch((err) => {
            next(err)
        })
    },
    // User Cart Product delete
    getDeleteCartProduct: (req, res, next) => {
        let user = req.session.User
        userHelpers.deleteCartProduct(user._id, req.query.id).then((response) => {
            res.redirect('back')
        }).catch((err) => {
            next(err)
        })
    },
    // Change cart Product Quantity
    postChangeQuantity: (req, res, next) => {
        userHelpers.changeProQuantity(req.body).then(async (response) => {
            response.total = await userHelpers.getCartTotal(req.body.user)
            res.json(response)
        }).catch((err) => {
            next(err)
        })
    },
    // User Checkout
    getCheckout: async (req, res, next) => {
        try {
            let user = req.session.User
            let cartCount = null
            let wishlistCount = null
            let cartProducts=false
            if (user) {
                cartProducts = await userHelpers.getCartProducts(user._id)
                wishlistCount = await userHelpers.getWhishlistCount(user._id)
                cartCount = await userHelpers.getCartCount(user._id)
            }
            address = await userHelpers.getAddress(user._id)
            let totalAmount = await userHelpers.getCartTotal(user._id)
            let products = await userHelpers.getCartProducts(user._id)
            if (products) {
                res.render('users/checkout', { layout: 'userLayout', user: true, user, totalAmount, address, products,wishlistCount,cartCount,cartProducts })
            } else {
                res.redirect('/cart')
            }


        } catch (err) {
            next(err)
        }

    },
    postCheckout: async (req, res, next) => {
        try {
            user = req.session.User
            let address = await userHelpers.fetchAddress(user._id, req.body.address)
            if (address) {
                let shippingAddress = address[0].shippingAddress
                let products = await userHelpers.getCartProductList(user._id)
                let totalPrice = await userHelpers.getCartTotal(user._id)
                if (products) {
                    userHelpers.placeOrder(req.body, shippingAddress, products, totalPrice, user._id).then((orderId) => {

                        if (req.body.payment_method === 'COD') {
                            res.json({ codStatus: true })
                        } else {
                            userHelpers.generateRazorpay(orderId, totalPrice).then((response) => {
                                res.json(response)
                            })
                        }

                    }).catch((err) => {
                        next(err)
                    })
                } else {
                    res.redirect('/cart')
                }

            } else {

                res.redirect('/checkout')
            }
        } catch (err) {
            next(err)
        }

    },
    // Verify Paymetnt
    postVerifyPayment: () => {
        userHelpers.
            verifyPayment(req.body).then(() => {
                res.json({ status: true })
            }).catch((err) => {
                res.json({ status: false, errMsg: 'Payment Failed' })
            })
    },
    // Add Address
    getAddAddress: (req, res) => {
        res.render('users/address', { layout: 'userLayout', user: true })
    },
    postAddress: (req, res, next) => {
        let user = req.session.User
        userHelpers.addAddress(req.body, user._id).then(() => {
            res.redirect('/checkout')
        }).catch((err) => {
            next(err)
        })
    },
    // get Wishlist
    getWishlist: async (req, res, next) => {
        try {
            let user = req.session.User
            let cartCount = null
            let wishlistCount = null
            let cartProducts=false
            if (user) {
                cartProducts = await userHelpers.getCartProducts(user._id)
                wishlistCount = await userHelpers.getWhishlistCount(user._id)
                cartCount = await userHelpers.getCartCount(user._id)
            }
            let wishProducts = await userHelpers.getWishlistProducts(user._id)
            if (wishProducts) {
                res.render('users/wishlist', { layout: 'userLayout', user, wishProducts,cartCount,wishlistCount ,cartProducts})
            } else {
                res.render('users/wishlist', { layout: 'userLayout', user, wishProducts: false,cartCount,wishlistCount  })
            }
        } catch (err) {
            next(err)
        }
    },
    // post Add to Wishlist
    postAddtoWishlist: (req, res, next) => {
        let user = req.session.User
        userHelpers.addToWishlist(user._id, req.body.productId).then((response) => {
            res.json(response)
        }).catch((err) => {
            next(err)
        })
    },
    getDeleteWishlist: (req, res, next) => {
        let user = req.session.User
        userHelpers.deleteWishlistProduct(user._id, req.query.id).then(() => {
            res.redirect('back')
        }).catch((err) => {
            next(err)
        })
    },
    // User Profile
    getUserProfile: async(req, res, next) => {
        let user = req.session.User
        let cartCount = null
        let wishlistCount = null
        let cartProducts=false
        if (user) {
            cartProducts = await userHelpers.getCartProducts(user._id)
            wishlistCount = await userHelpers.getWhishlistCount(user._id)
            cartCount = await userHelpers.getCartCount(user._id)
        }
        userHelpers.userData(user._id).then((userData) => {
            res.render('users/userProfile', { layout: 'userLayout', user: true, user, userData,cartProducts,wishlistCount,cartCount })
        }).catch((err) => {
            next(err)
        })

    },
    postUserProfile: (req, res, next) => {
        userHelpers.editUserData(req.body.userId, req.body).then(() => {
            res.redirect('back')
        }).catch((err) => {
            next(err)
        })
    },
    // User Orders
    getUserOrders: async (req, res, next) => {
        try {
            let user = req.session.User
            let cartCount = null
            let wishlistCount = null
            let cartProducts=false
            if (user) {
                cartProducts = await userHelpers.getCartProducts(user._id)
                wishlistCount = await userHelpers.getWhishlistCount(user._id)
                cartCount = await userHelpers.getCartCount(user._id)
            }
            let orderDetails = await userHelpers.userOrders(user._id)
            res.render('users/orders', { layout: 'userLayout', orderDetails,cartCount,wishlistCount,cartProducts,user })
        } catch (err) {
            next(err)
        }
    },
    getOrderDetails: async (req, res, next) => {
        try {
            let user = req.session.User
            let cartCount = null
            let wishlistCount = null
            let cartProducts=false
            if (user) {
                cartProducts = await userHelpers.getCartProducts(user._id)
                wishlistCount = await userHelpers.getWhishlistCount(user._id)
                cartCount = await userHelpers.getCartCount(user._id)
            }
            let orderDetails = await userHelpers.getOrderDetails(req.query.orderId, req.query.proId)
            res.render('users/orderDetails', { layout: 'userLayout', orderDetails,user,cartCount,wishlistCount,cartProducts })
        } catch (err) {
            next(err)
        }


    },
    postCancelOrder: (req, res, next) => {
        try {
            userHelpers.cancelOrder(req.body.orderId, req.body.proId).then(() => {
                res.json({ status: true })
            })
        } catch (err) {
            next(err)
        }
    },
    // forgot password email check
    getForgotPassword: (req, res) => {
        res.render('users/frgtpassword', { layout: 'loginLayout', 'emailErr': req.session.emailErr })
        req.session.emailErr = false
    },
    postForgotPassword: (req, res, next) => {
        userHelpers.checkEmail(req.body.email).then((response) => {
            if (response.status) {
                let mobileNumber = response.user.mobileNumber
                req.session.forgotPaswordDeatils = response.user
                twilioHelpers.forgotPasswordDoSms(mobileNumber).then((response) => {
                    if (response.valid) {
                        res.redirect('/passwordOtp')
                    }
                }).catch((err) => {
                    next(err)
                })
            } else {
                req.session.emailErr = 'Invalid Email.'
                res.redirect('back')
            }


        }).catch((err) => {
            next(err)
        })
    },
    // forgot password otp
    getPasswordOtp: (req, res) => {
        res.render('users/passwordOtp', { layout: 'loginLayout', 'otpErr': req.session.otpErr })
        req.session.otpErr = false
    },
    postPasswordOtp: (req, res, next) => {
        twilioHelpers.forgotPasswordOtpVerify(req.body, req.session.forgotPaswordDeatils.mobileNumber).then((response) => {
            if (response.valid) {
                res.redirect('/reset-password')
            } else {
                req.session.otpErr = 'Invalid Otp.'
                res.redirect('back')
            }

        }).catch((err) => {
            next(err)
        })
    },
    // reset Password
    getResetPassword: (req, res) => {
        res.render('users/reset-password', { layout: 'loginLayout' })
    },
    postResetPassword: (req, res, next) => {
        let userData = req.session.forgotPaswordDeatils
        userHelpers.resetPassword(userData.email, req.body.password).then(() => {
            req.session.User = null
            req.session.UserLoggedIn = null
            req.session.UserLoginErr = null
            req.session.forgotPasword = null
            res.redirect('/signin')
        }).catch((err) => {
            next(err)
        })
    },
    // post review
    postProductReview:(req,res,next)=>{
        productHelpers.addReview(req.body,req.body.userId).then(()=>{
            res.redirect('back')
        }).catch((err)=>{
            next(err)
        })
    },
    // delete review
    deleteReview:(req,res,next)=>{
        productHelpers.deleteReview(req.body.proId,req.body.reviewId).then(()=>{
            res.json(true)
        }).catch((err)=>{
            next(err)
        })
    },

    // User Logout
    getLogout: (req, res) => {
        req.session.User = null
        req.session.UserLoggedIn = null
        req.session.UserLoginErr = null
        res.redirect('/')
    }
}