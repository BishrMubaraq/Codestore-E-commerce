const vendorHelpers = require("../../helpers/vendorHelpers")
const productHelpers = require('../../helpers/productHelpers')

const categoryHelpers = require("../../helpers/categoryHelpers")
const adminHelpers = require("../../helpers/adminHelpers")



module.exports = {

    // Vendor Signin
    getSignin: (req, res) => {
        let vendorLogged = req.session.vendorLoggedIn
        if (vendorLogged) {
            res.redirect('/vendor')
        } else {
            res.render('vendors/vendorLogin', { layout: 'loginLayout', loginErr: req.session.vendorErr })
            req.session.vendorErr = false
        }

    },
    postSignin: (req, res, next) => {
        vendorHelpers.doLogin(req.body).then((response) => {
            if (response.status) {
                req.session.vendorLoggedIn = true
                req.session.vendorData = response.vendor
                res.redirect('/vendor')
            } else {
                if (response.vendorStatus) {
                    req.session.vendorErr = 'Access Denied'
                    res.redirect('back')
                } else {
                    req.session.vendorErr = 'Invalid Email or Password'
                    res.redirect('back')
                }

            }
        }).catch((err) => {
            next(err)
        })
    },
    // Vendor Signup
    getSignup: (req, res) => {
        let vendorLogged = req.session.vendorLoggedIn
        if (vendorLogged) {
            res.redirect('/vendor')
        } else {
            res.render('vendors/vendorSignup', { layout: 'loginLayout', signupErr: req.session.vendorSignupErr })
            req.session.vendorSignupErr = false
        }
    },
    postSignup: async (req, res, next) => {
        try {
            let alreadyVendor = await vendorHelpers.alreadyVendor(req.body)
            if (alreadyVendor.status) {
                req.session.vendorSignupErr = "Email or MobileNumber is already taken."
                res.redirect('/vendor/signup')
            } else {
                vendorHelpers.doSignup(req.body).then((response) => {
                    req.session.vendorLoggedIn = true
                    req.session.vendorData = response.vendor
                    res.redirect('/vendor')
                })
            }
        } catch (err) {
            next(err)
        }

    },

    // Vendor Home
    getHome: (req, res, next) => {
        let vendor = req.session.vendorData
        Promise.all([adminHelpers.totalOrder(vendor._id), adminHelpers.totalCancelOrders(vendor._id), adminHelpers.totalOnlinePayments(vendor._id), adminHelpers.totalCod(vendor._id), adminHelpers.totalOnlineMoney(vendor._id), adminHelpers.totalCodMoney(vendor._id), adminHelpers.totalPending(vendor._id), adminHelpers.totalShipped(vendor._id), adminHelpers.totalDelivered(vendor._id)]).then((values) => {
            const [totalOrders, totalCancel, totalOnline, totalCod, totalOnlineMoney, totalCodMoney, totalPending, totalShipped, totalDelivered] = values
            vendorHelpers.vendorData(vendor._id).then((vendorData) => {
                res.render('vendors/vendorHome', { layout: 'adminLayout', vendorData, vendor: true, vendorHome: true, totalOrders, totalCancel, totalOnline, totalCod, totalOnlineMoney, totalCodMoney, totalPending, totalShipped, totalDelivered })
            })
        }).catch((err) => {
            next(err)
        })


    },
    // Vendor Products
    getProducts: async (req, res, next) => {
        try {
            let vendor = req.session.vendorData
            let vendorData = await vendorHelpers.vendorData(vendor._id)
            let vendorId = vendorData._id
            productHelpers.getVendorProducts(vendorId).then((products) => {
                res.render('vendors/vendorProducts', { layout: 'adminLayout', vendor: true, products, productManagement: true, vendorData })
            })
        } catch (err) {
            next(err)
        }

    },
    // Vendor Add Products
    getAddProduct: async (req, res, next) => {
        try {
            let vendor = req.session.vendorData
            let vendorData = await vendorHelpers.vendorData(vendor._id)
            categoryHelpers.getAllCategories().then((categories) => {
                res.render('vendors/add-product', { layout: 'adminLayout', vendor: true, categories, vendorData })
            })
        } catch (err) {
            next(err)
        }

    },

    postAddProduct: function (req, res, next) {
        let vendor = req.session.vendorData
        let img = []
        if (req.files.length > 0) {
            img = req.files.map((file) => {
                return file.filename
            })
        }
        productHelpers.addProduct(req.body, img, vendor).then((response) => {
            res.redirect('/vendor/add-product')
        }).catch((err) => {
            next(err)
        })

    },
    // Delete Products
    getDelete: (req, res, next) => {
        let proId = req.query.id
        productHelpers.deleteProducts(proId).then((response) => {
            res.redirect('/vendor/products')
        }).catch((err) => {
            next(err)
        })
    },
    // Edit  Products
    getEdit: async (req, res, next) => {
        try {
            let vendor = req.session.vendorData
            let vendorData = await vendorHelpers.vendorData(vendor._id)
            let proId = req.query.id
            productHelpers.getProduct(proId).then((product) => {
                categoryHelpers.getAllCategories().then((categories) => {
                    res.render('vendors/edit-product', { layout: 'adminLayout', vendor: true, product, categories, vendorData })
                })

            })
        } catch (err) {
            next(err)
        }
    },
    postEdit: (req, res, next) => {
        let proId = req.query.id
        let img = []
        if (req.files) {
            img = req.files.map((file) => {
                return file.filename
            })
        }
        productHelpers.updateProduct(proId, req.body, img).then((response) => {
            res.redirect('/vendor/products')
        }).catch((err) => {
            next(err)
        })
    },
    // Vendor Categories
    getCategories: async (req, res, next) => {
        try {
            let vendor = req.session.vendorData
            let vendorData = await vendorHelpers.vendorData(vendor._id)
            categoryHelpers.getAllCategories().then((categories) => {
                res.render('vendors/category', { layout: 'adminLayout', vendor: true, categories, categoryManagement: true, vendorData })
            }).catch((err) => {
                next(err)
            })
        } catch (err) {
            next(err)
        }
    },
    // Add category
    getAddCategory: async (req, res, next) => {
        try {
            let vendor = req.session.vendorData
            let vendorData = await vendorHelpers.vendorData(vendor._id)
            res.render('vendors/add-category', { layout: 'adminLayout', vendor: true, vcategoryErr: req.session.vcategoryErr, vendorData })
            req.session.vcategoryErr = false
        } catch (err) {
            next(err)
        }
    },
    postAddCategory: (req, res, next) => {
        categoryHelpers.addCategory(req.body).then((response) => {
            if (response.status) {
                req.session.vcategoryErr = 'Category name already exist.'
                res.redirect('/vendor/add-category')
            }
            else {
                res.redirect('/vendor/add-category')
            }

        }).catch((err) => {
            next(err)
        })
    },
    // Edit category
    getEditCategory: async (req, res, next) => {
        try {
            let vendor = req.session.vendorData
            let vendorData = await vendorHelpers.vendorData(vendor._id)
            categoryHelpers.getCategory(req.query.id).then((category) => {
                res.render('vendors/edit-category', { layout: 'adminLayout', vendor: true, category, vcategoryErr: req.session.vcategoryErr, vendorData })
                req.session.vcategoryErr = false
            }).catch((err) => {
                next(err)
            })
        } catch (err) {
            next(err)
        }

    },
    postEditCategory: (req, res, next) => {
        categoryHelpers.updateCategory(req.body).then((response) => {
            if (response.status) {
                req.session.vcategoryErr = 'Category name already exist.'
                res.redirect('back')
            } else {
                res.redirect('/vendor/categories')
            }

        }).catch((err) => {
            next(err)
        })
    },
    // Delete Category
    getDeleteCategory: (req, res, next) => {
        categoryHelpers.deleteCategory(req.query.id).then(() => {
            res.redirect('/vendor/categories')
        }).catch((err) => {
            next(err)
        })
    },
    // Vendor Profile
    getProfile: (req, res, next) => {
        let vendor = req.session.vendorData
        vendorHelpers.vendorData(vendor._id).then((vendorData) => {
            res.render('vendors/vendorProfile', { layout: 'adminLayout', vendor, vendorData })
        }).catch((err) => {
            next(err)
        })
    },
    postProfile: (req, res, next) => {
        let vendor = req.session.vendorData
        if (req.file) {
            vendorHelpers.editProfileWithImage(vendor._id, req.body, req.file.filename).then(() => {
                res.redirect('back')
            }).catch((err) => {
                next(err)
            })
        } else {
            vendorHelpers.editProfile(vendor._id, req.body).then(() => {
                res.redirect('back')
            }).catch((err) => {
                next(err)
            })
        }
    },
    // Vendor Orders
    getOrders: async (req, res, next) => {
        try {
            let orders = await adminHelpers.getVendorsOrder(req.session.vendorData._id)
            res.render('vendors/orders', { layout: 'adminLayout', vendor: true, orders })
        } catch (err) {
            next(err)
        }

    },
    postOrders: async (req, res, next) => {
        try {
            adminHelpers.changeOrderStatus(req.body.status, req.body.orderId).then(() => {
                res.redirect('back')
            })
        } catch (err) {
            next(err)
        }
    },
    // Vendor Logout
    getLogout: (req, res) => {
        req.session.vendorLoggedIn = null
        req.session.vendorData = null
        req.session.vendorErr = null
        res.redirect('/vendor/signin')
    },
    // Vendor Error Page
    getError: (req, res) => {
        res.render('vendors/error', { layout: 'loginLayout' })
    }
}