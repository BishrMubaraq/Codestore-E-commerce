
const adminHelpers = require("../../helpers/adminHelpers");
const productHelpers = require('../../helpers/productHelpers')
const userHelpers = require('../../helpers/userHelpers')
const vendorHelpers = require('../../helpers/vendorHelpers')
const categoryHelpers = require('../../helpers/categoryHelpers')
const bannerHelpers = require('../../helpers/bannerHelpers')

module.exports = {
  // Admin Login
  getLogin: function (req, res, next) {
    let adminLogged = req.session.adminLoggedIn
    if (adminLogged) {
      res.redirect('/admin')
    } else {
      res.render('admin/adminLogin', { layout: 'loginLayout', loginErr: req.session.adminErr });
      req.session.adminErr = false
    }

  },


  postLogin: (req, res) => {
    adminHelpers.doLogin(req.body).then((response) => {
      loginStatus = response.status
      if (loginStatus) {
        req.session.adminLoggedIn = true
        req.session.adminData = response.admin
        res.redirect('/admin')
      } else {
        req.session.adminErr = 'Invalid Admin Id or Password'
        res.redirect('back')
      }
    })
  },
  //   Admin Home
  getHome: function (req, res, next) {
    let adminData = req.session.adminData
    if (adminData) {
      Promise.all([adminHelpers.totalVendors(), adminHelpers.totalUsers(), adminHelpers.totalOrder(adminData._id), adminHelpers.totalCancelOrders(adminData._id), adminHelpers.totalOnlinePayments(adminData._id), adminHelpers.totalCod(adminData._id), adminHelpers.totalOnlineMoney(adminData._id), adminHelpers.totalCodMoney(adminData._id), adminHelpers.totalPending(adminData._id), adminHelpers.totalShipped(adminData._id), adminHelpers.totalDelivered(adminData._id)]
      ).then((values) => {

        const [totalVendors, totalUsers, totalOrders, totalCancelOrders, totalOnlinePayment, totalCod, totalOnlineMoney, totalCodMoney, totalPending, totalShipped, totalDelivered] = values
        res.render('admin/adminHome', { layout: 'adminLayout', admin: true, adminData, adminHome: true, totalVendors, totalUsers, totalOrders, totalCancelOrders, totalOnlinePayment, totalCod, totalOnlineMoney, totalCodMoney, totalPending, totalShipped, totalDelivered });
      }).catch((err) => {
        next(err)
      })

    } else {
      res.redirect('/admin/login')
    }
  },
  // Admin Vendor's Products
  getProducts: (req, res) => {
    productHelpers.getAllProducts().then((products) => {
      res.render('admin/adminProducts', { layout: 'adminLayout', admin: true, products, adminVendorProducts: true })
    })
  },
  // Admin Vendor's Products delete
  getDeleteVendorProduct: (req, res) => {
    productHelpers.deleteProducts(req.query.id).then((response) => {
      res.redirect('/admin/products')
    })
  },
  // Admin Users
  getUsers: (req, res) => {
    userHelpers.getAllUsers().then((usersData) => {
      let status = usersData.status
      if (status) {
        res.render('admin/adminUsers', {
          layout: 'adminLayout', admin: true, usersData, adminUsers: true, status
        })
      } else {
        res.render('admin/adminUsers', {
          layout: 'adminLayout', admin: true, usersData, adminUsers: true
        })
      }
    })

  },
  // Admin User Block Unblock
  getBlockUser: (req, res) => {
    userHelpers.blockUser(req.query.id).then(() => {
      res.redirect('/admin/users')
    })
  },

  getUnblockUser: (req, res) => {
    userHelpers.unBlockUser(req.query.id).then(() => {
      res.redirect('/admin/users')
    })
  },
  // Admin Vendors
  getVendors: (req, res) => {
    vendorHelpers.getAllVendors().then((vendorsData) => {
      let status = vendorsData.status
      if (status) {
        res.render('admin/adminVendors', {
          layout: 'adminLayout', admin: true, vendorsData, adminVendors: true, status
        })
      } else {
        res.render('admin/adminVendors', {
          layout: 'adminLayout', admin: true, vendorsData, adminVendors: true
        })
      }

    })
  },
  // Admin Vendor Block and Unblock

  getBlockVendor: (req, res) => {
    vendorHelpers.blockVendor(req.query.id).then(() => {
      res.redirect('/admin/vendors')
    })
  },
  getUnblockVendor: (req, res) => {
    vendorHelpers.UnBlockVendor(req.query.id).then(() => {
      res.redirect('/admin/vendors')
    })
  },
  // Admin Categories
  getCategories: (req, res) => {
    categoryHelpers.getAllCategories().then((categories) => {
      res.render('admin/category', { layout: 'adminLayout', admin: true, categories, adminCategories: true })
    })

  },
  // Admin Add-Category
  getAddCategory: (req, res) => {
    res.render('admin/add-category', { layout: 'adminLayout', admin: true, 'categoryErr': req.session.categoryErr })
    req.session.categoryErr = false
  },
  postAddCategory: (req, res) => {
    categoryHelpers.addCategory(req.body).then((response) => {
      if (response.status) {
        req.session.categoryErr = 'Category name already exist.'
        res.redirect('/admin/add-category')
      } else {
        res.redirect('/admin/add-category')
      }

    })
  },
  // Admin Edit Category
  getEditCategory: (req, res) => {
    categoryHelpers.getCategory(req.query.id).then((category) => {
      res.render('admin/edit-category', { layout: 'adminLayout', admin: true, category, 'categoryErr': req.session.categoryErr })
      req.session.categoryErr = false
    })

  },
  postEditCategory: (req, res) => {
    categoryHelpers.updateCategory(req.body).then((response) => {
      if (response.status) {
        req.session.categoryErr = 'Category name already exist.'
        res.redirect('/admin/edit-category?id=' + req.body.catId + '')
      } else {
        res.redirect('/admin/categories')
      }

    })
  },
  // Admin Delete Category
  getCategoryDelete: (req, res) => {
    categoryHelpers.deleteCategory(req.query.id).then(() => {
      res.redirect('/admin/categories')
    })
  },
  // Admin's Products
  getAdminProducts: (req, res) => {
    adminData = req.session.adminData
    productHelpers.getVendorProducts(adminData._id).then((products) => {
      res.render('admin/adminProductManagement', { layout: 'adminLayout', admin: true, products, adminProducts: true })
    })

  },
  // Admin add product
  getAdminAddProducts: (req, res) => {
    categoryHelpers.getAllCategories().then((categories) => {
      res.render('admin/adminAddProduct', { layout: 'adminLayout', admin: true, categories })
    })

  },
  postAdminAddProducts: (req, res) => {
    adminData = req.session.adminData
    let img = []
    if (req.files.length > 0) {
      img = req.files.map((file) => {
        return file.filename
      })
    }
    productHelpers.addProduct(req.body, img, adminData).then(() => {
      res.redirect('/admin/admin-products')
    })
  },
  // Admin Edit Product
  getEditProduct: (req, res) => {
    productHelpers.getProduct(req.query.id).then((product) => {
      categoryHelpers.getAllCategories().then((categories) => {
        res.render('admin/adminEditProduct', { layout: 'adminLayout', vendor: true, product, categories })
      })

    })
  },
  postEditProduct: (req, res,next) => {
    let img = []
    if (req.files.length > 0) {
      img = req.files.map((file) => {
        return file.filename
      })
    }
    productHelpers.updateProduct(req.query.id, req.body, img).then(() => {
      res.redirect('/admin/admin-products')
    }).catch((err)=>{
      next(err)
    })
  },
  // Admin Delete Product
  getDeleteAdminProduct: (req, res) => {
    productHelpers.deleteProducts(req.query.id).then(() => {
      res.redirect('/admin/admin-products')
    })
  },
  // Admin Banner Management
  getBanners: (req, res) => {
    bannerHelpers.getAllBanners().then((banners) => {
      res.render('admin/banner', { layout: 'adminLayout', admin: true, banners, adminBanner: true })
    })

  },
  // Admin add Banner
  getAddBanner: (req, res) => {
    res.render('admin/add-banner', { layout: 'adminLayout', admin: true })
  },
  postAddBanner: (req, res) => {
    let image = req.file.filename
    bannerHelpers.addBanner(req.body, image).then(() => {
      res.redirect('/admin/add-banner')
    })


  },
  // Admin Edit Banner
  getEditBanner: (req, res) => {
    bannerHelpers.getBanner(req.query.id).then((bannerData) => {
      res.render('admin/editBanner', { layout: 'adminLayout', admin: true, bannerData })
    })

  },
  postEditBanner: (req, res) => {
    let image = req.file.filename

    bannerHelpers.updateBanner(req.query.id, req.body, image).then(() => {
      res.redirect('/admin/banner')
    })
  },
  // Admin Delete Banner
  getDeleteBanner: (req, res) => {
    bannerHelpers.deleteBanner(req.query.id).then(() => {
      res.redirect('/admin/banner')
    })
  },
  // Admin Orders
  getAdminOrders: async (req, res, next) => {
    try {
      adminData = req.session.adminData
      let orders = await adminHelpers.getVendorsOrder(adminData._id)
      res.render('admin/orders', { layout: 'adminLayout', admin: true, orders })
    } catch (err) {
      next(err)
    }

  },
  postAdminOrders: (req, res, next) => {
    try {
      adminHelpers.changeOrderStatus(req.body.status, req.body.orderId).then(() => {
        res.redirect('back')
      })
    } catch (err) {
      next(err)
    }
  },
  // All Orders
  getAllOrders: async (req, res) => {
    let allOrders = await adminHelpers.getAllOrders()
    res.render('admin/allOrders', { layout: 'adminLayout', admin: true, allOrders })
  },
  postAllOrders: (req, res) => {
    adminHelpers.changeOrderStatus(req.body.status, req.body.orderId).then(() => {
      res.redirect('back')
    })
  },
  // Admin Logout
  getLogout: (req, res) => {
    req.session.adminLoggedIn = null
    req.session.adminData = null
    req.session.adminErr = null
    res.redirect('/admin/login')
  },
  // Admin Error Page
  getError: (req, res) => {
    res.render('admin/error', { layout: 'loginLayout' })
  }

}