const db = require('../config/connection')
const collections = require('../config/collections')
const bcrypt = require('bcryptjs')
const Razorpay = require('razorpay')
const objectId = require('mongodb').ObjectId
const orderid = require('order-id')('key');
require('dotenv').config()
const id = orderid.generate();
const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET_KEY,
});



module.exports = {
    doSignup: (userData) => {
        let response = {}
        return new Promise(async (resolve, reject) => {
            try {

                userData.password = await bcrypt.hash(userData.password, 10);
                db.get().collection(collections.USER_COLLECTION).insertOne({
                    'name': userData.name,
                    'email': userData.email,
                    'mobileNumber': userData.phone,
                    'status': true,
                    'password': userData.password
                }).then(async (data) => {
                    let user = await db.get().collection(collections.USER_COLLECTION).findOne({ _id: data.insertedId })
                    response.status = true
                    response.userData = user
                    resolve(response)
                })
            } catch (err) {
                reject(err)
            }


        })
    },
    alreadyUserCheck: (userData) => {
        return new Promise(async (resolve, reject) => {
            try {
                let alreadyUser = await db.get().collection(collections.USER_COLLECTION).findOne({ $or: [{ email: userData.email }, { mobileNumber: userData.phone }] })
                if (alreadyUser) {
                    resolve({ status: true })
                } else {
                    resolve({ status: false })
                }
            } catch (err) {
                reject(err)
            }
        })

    },
    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            try {
                let response = {}
                let user = await db.get().collection(collections.USER_COLLECTION).findOne({ email: userData.email, status: true })
                let userStatus = await db.get().collection(collections.USER_COLLECTION).findOne({ email: userData.email, status: false })
                if (user) {
                    bcrypt.compare(userData.password, user.password).then((status) => {
                        if (status) {
                            response.loginStatus = true
                            response.userData = user
                            resolve(response)
                        } else {
                            response.loginStatus = false
                            resolve(response)
                        }
                    })
                }
                else if (userStatus) {
                    response.loginStatus = false
                    response.userStatus = true
                    resolve(response)
                } else {
                    response.loginStatus = false
                    resolve(response)
                }
            } catch (err) {
                reject(err)
            }
        })
    },
    getAllUsers: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let users = await db.get().collection(collections.USER_COLLECTION).find().toArray()
                resolve(users)
            } catch (err) {
                reject(err)
            }
        })
    },
    blockUser: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.USER_COLLECTION).updateOne({ _id: objectId(userId) }, {
                $set: {
                    status: false
                }
            }).then(() => {
                resolve()
            }).catch((err) => {
                reject(err)
            })
        })
    },
    unBlockUser: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.USER_COLLECTION).updateOne({ _id: objectId(userId) }, {
                $set: {
                    status: true
                }
            }).then(() => {
                resolve()
            }).catch((err) => {
                reject(err)
            })
        })
    },
    isUserBlocked: (userId) => {
        let response = {}
        return new Promise(async (resolve, reject) => {
            try {

                let user = await db.get().collection(collections.USER_COLLECTION).findOne({ _id: objectId(userId) })
                if (user.status) {
                    response.status = true
                    resolve(response)
                } else {
                    response.status = false
                    resolve(response)
                }
            } catch (err) {
                reject(err)
            }
        })
    },
    addToCart: (userId, proDetails) => {
        let proObj = {
            item: objectId(proDetails.proId),
            quantity: Number(proDetails.quantity),
            size: proDetails.size,
            status: 'placed',
            isDeactive: false,
            time: Date.now()
        }
        return new Promise(async (resolve, reject) => {
            try {
                let userCart = await db.get().collection(collections.CART_COLLECTION).findOne({ user: objectId(userId) });
                if (userCart) {
                    let proExist = userCart.products.findIndex(
                        (product) => {
                            return product.item == proId
                        })
                    if (proExist != -1) {
                        db.get().collection(collections.CART_COLLECTION).updateOne({
                            'products.item': objectId(proDetails.proId)
                        }, {
                            $inc: { 'products.$.quantity': Number(proDetails.quantity) }
                        }).then(() => {
                            resolve()
                        })
                    } else {
                        db.get().collection(collections.CART_COLLECTION).updateOne({ user: objectId(userId) }, {

                            $push: { products: proObj }

                        }).then((response) => {
                            resolve()
                        });
                    }

                } else {
                    let cartObj = {
                        user: objectId(userId),
                        products: [proObj]
                    };
                    db.get().collection(collections.CART_COLLECTION).insertOne(cartObj).then((response) => {
                        resolve()
                    })
                }
            } catch (err) {
                reject(err)
            }



        })
    },
    getCartProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let cartProducts = await db.get().collection(collections.CART_COLLECTION).aggregate([
                    { $match: { user: objectId(userId) } },
                    { $unwind: '$products' },
                    {
                        $project: {
                            item: '$products.item',
                            quantity: '$products.quantity',
                            time: '$products.time'
                        }
                    },
                    {
                        $lookup: {
                            from: collections.PRODUCT_COLLECTION,
                            localField: 'item',
                            foreignField: '_id',
                            as: 'productDetails'
                        }
                    }, {
                        $project: {
                            item: 1, quantity: 1, time: 1, product: {
                                $arrayElemAt: ['$productDetails', 0]
                            }
                        }
                    },
                    {
                        $addFields: {
                            productTotal: { $sum: { $multiply: ['$quantity', '$product.price'] } }
                        }
                    },
                    {
                        $sort: {
                            time: -1
                        }
                    }
                ]).toArray()

                resolve(cartProducts)
            } catch (err) {
                reject(err)
            }
        })
    },
    getCartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let cart = await db.get().collection(collections.CART_COLLECTION).findOne({ user: objectId(userId) })
                if (cart) {
                    let cartCount = cart.products.length
                    resolve(cartCount)
                } else {
                    let cartCount = 0
                    resolve(cartCount)
                }
            } catch (err) {
                reject(err)
            }
        })
    },
    getWhishlistCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let wishlist = await db.get().collection(collections.WHISLIST_COLLECTION).findOne({ userId: objectId(userId) })
                if (wishlist) {
                    let wishlistCount = wishlist.products.length
                    resolve(wishlistCount)
                } else {
                    let wishlistCount = 0
                    resolve(wishlistCount)
                }
            } catch (err) {
                reject(err)
            }

        })
    },
    deleteCartProduct: (userId, proId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.CART_COLLECTION).updateOne({ user: objectId(userId) }, {
                $pull: {
                    products: { 'item': objectId(proId) }
                }
            }).then((response) => {
                resolve(response)
            }).catch((err) => {
                reject(err)
            })
        })
    },
    changeProQuantity: (cartDetails) => {
        let cartId = cartDetails.cart
        let proId = cartDetails.product
        let count = parseInt(cartDetails.count)
        let quantity = parseInt(cartDetails.quantity)
        return new Promise((resolve, reject) => {
            if (count == -1 && quantity == 1) {
                db.get().collection(collections.CART_COLLECTION).updateOne({ _id: objectId(cartId) },
                    { $pull: { products: { item: objectId(proId) } } }).then((response) => {
                        resolve({ removeProduct: true })
                    }).catch((err) => {
                        reject(err)
                    })
            } else {
                db.get().collection(collections.CART_COLLECTION).updateOne({
                    _id: objectId(cartId),
                    'products.item': objectId(proId)
                }, {
                    $inc: {
                        'products.$.quantity': count
                    }
                }).then((response) => {
                    resolve({ status: true })
                }).catch((err) => {
                    reject(err)
                })
            }

        })
    },
    getCartTotal: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let userCart = await db.get().collection(collections.CART_COLLECTION).findOne({ user: objectId(userId) })
                if (userCart) {
                    let total = await db.get().collection(collections.CART_COLLECTION).aggregate([
                        { $match: { user: objectId(userId) } },
                        { $unwind: '$products' },
                        {
                            $project: {
                                item: '$products.item',
                                quantity: '$products.quantity',
                                time: '$products.time'
                            }
                        },
                        {
                            $lookup: {
                                from: collections.PRODUCT_COLLECTION,
                                localField: 'item',
                                foreignField: '_id',
                                as: 'productDetails'
                            }
                        }, {
                            $project: {
                                item: 1, quantity: 1, time: 1, product: {
                                    $arrayElemAt: ['$productDetails', 0]
                                }
                            }
                        },
                        {
                            $group: {
                                _id: objectId(userId),
                                total: { $sum: { $multiply: ['$quantity', '$product.price'] } }

                            }
                        }
                    ]).toArray()
                    if (total.length > 0) {
                        resolve(total[0].total)
                    } else {
                        resolve(false)
                    }


                } else {
                    resolve(false)

                }
            } catch (err) {
                reject(err)
            }

        })
    },
    addAddress: (addressData, userId) => {
        addressData.time = Date.now()
        let address = [addressData]
        return new Promise(async (resolve, reject) => {
            try {

                let user = await db.get().collection(collections.USER_COLLECTION).findOne({ _id: objectId(userId) })
                if (user.shippingAddress) {
                    db.get().collection(collections.USER_COLLECTION).updateOne({ _id: objectId(userId) }, {
                        $push: {
                            shippingAddress: addressData
                        }
                    }).then(() => {
                        resolve()
                    }).catch((err)=>{
                        reject(err)
                    })
                } else {
                    db.get().collection(collections.USER_COLLECTION).updateOne({ _id: objectId(userId) },
                        {
                            $set: {
                                shippingAddress: address
                            }
                        }).then(() => {
                            resolve()
                        }).catch((err)=>{
                            reject(err)
                        })
                }
            } catch (err) {
                reject(err)
            }

        })

    },
    getAddress: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let user = await db.get().collection(collections.USER_COLLECTION).findOne({ _id: objectId(userId) })
                if (user.shippingAddress) {
                    let userAddress = await db.get().collection(collections.USER_COLLECTION).aggregate([
                        { $match: { _id: objectId(userId) } },
                        { $project: { shippingAddress: 1 } }, {
                            $unwind: '$shippingAddress'
                        }, {
                            $sort: { 'shippingAddress.time': -1 }
                        }, {
                            $limit: 2
                        }

                    ]).toArray()
                    resolve(userAddress)
                } else {
                    resolve(false)
                }
            } catch (err) {
                reject(err)
            }

        })
    },
    fetchAddress: (userId, addressId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let user = await db.get().collection(collections.USER_COLLECTION).findOne({ _id: objectId(userId) })
                if (user.shippingAddress) {
                    let address = await db.get().collection(collections.USER_COLLECTION).aggregate([
                        { $match: { _id: objectId(userId) } },
                        { $project: { shippingAddress: 1 } },
                        { $unwind: '$shippingAddress' },
                        { $match: { 'shippingAddress.time': parseInt(addressId) } }

                    ]).toArray()
                    resolve(address)
                } else {
                    resolve(false)
                }
            } catch (err) {
                reject(err)
            }
        })
    },
    placeOrder: (order, address, products, totalAmount, userId) => {
        return new Promise((resolve, reject) => {
            try {
                let orderObj = {
                    address: address,
                    orderId: orderid.getTime(id),
                    userId: objectId(userId),
                    payment_method: order.payment_method,
                    shipping: false,
                    delivered: false,
                    cancelled: false,
                    pending: true,
                    products: products,
                    total: totalAmount,
                    date: new Date(),
                    time: Date.now()
                }
                db.get().collection(collections.ORDER_COLLECTION).insertOne({ orderObj }).then((response) => {
                    db.get().collection(collections.CART_COLLECTION).deleteOne({ user: objectId(userId) })
                    resolve(response.insertedId)
                })
            } catch (err) {
                reject(err)
            }

        })
    },
    generateRazorpay: (orderId, total) => {
        return new Promise((resolve, reject) => {
            let options = {
                amount: total * 100,
                currency: 'INR',
                receipt: '' + orderId
            };
            instance.orders.create(options, function (err, order) {
                if (err) {
                    reject(err)
                } else {
                    resolve(order)
                }

            })
        })
    }
    ,
    verifyPayment: (details) => {
        return new Promise((resolve, reject) => {
            const crypto = require('crypto')
            const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_SECRET_KEY)
            hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id'])
            hmac = hmac.digest('hex')
            if (hmac == details['payment[razorpay_signature]']) {
                resolve()
            } else {
                reject(err)
            }
        })
    },
    getCartProductList: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.CART_COLLECTION).findOne({ user: objectId(userId) }).then((cart) => {
                resolve(cart.products)
            }).catch((err) => {
                reject(err)
            })


        })
    },
    addToWishlist: (userId, proId) => {
        let proObj = {
            item: objectId(proId),
            time: Date.now()
        }
        return new Promise(async (resolve, reject) => {
            try {
                let userWishlist = await db.get().collection(collections.WHISLIST_COLLECTION).findOne({ userId: objectId(userId) })
                if (userWishlist) {
                    let proExist = userWishlist.products.findIndex(
                        (product) => {
                            return product.item == proId
                        }
                    )
                    if (proExist != -1) {
                        db.get().collection(collections.WHISLIST_COLLECTION).updateOne({
                            'products.item': objectId(proId)
                        }, {
                            $pull: { products: { item: objectId(proId) } }
                        }).then(() => {
                            resolve({ status: false, login: true })
                        }).catch((err) => {
                            reject(err)
                        })
                    } else {
                        db.get().collection(collections.WHISLIST_COLLECTION).updateOne({ userId: objectId(userId) },
                            {
                                $push: { products: proObj }
                            }).then(() => {
                                resolve({ status: true, login: true })
                            }).catch((err) => {
                                reject(err)
                            })
                    }

                } else {
                    let wishListObj = {
                        userId: objectId(userId),
                        products: [proObj]
                    }
                    db.get().collection(collections.WHISLIST_COLLECTION).insertOne(wishListObj).then((response) => {
                        resolve({ status: true, login: true })
                    })
                }
            } catch (err) {
                reject(err)
            }
        })
    },
    getWishlistProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let wishProducts = await db.get().collection(collections.WHISLIST_COLLECTION).aggregate([
                    { $match: { userId: objectId(userId) } },
                    { $unwind: '$products' },
                    {
                        $project: {
                            item: '$products.item',
                            time: '$products.time'
                        }
                    },
                    {
                        $lookup: {
                            from: collections.PRODUCT_COLLECTION,
                            localField: 'item',
                            foreignField: '_id',
                            as: 'productDetails'
                        }
                    },
                    {
                        $project: {
                            item: 1,
                            time: 1,
                            product: {
                                $arrayElemAt: ['$productDetails', 0]
                            }
                        }
                    },
                    {
                        $sort: {
                            time: -1
                        }
                    }

                ]).toArray()

                resolve(wishProducts)
            } catch (err) {
                reject(err)
            }
        })
    },
    deleteWishlistProduct: (userId, proId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.WHISLIST_COLLECTION).updateOne({ userId: objectId(userId) }, {
                $pull: {
                    products: { 'item': objectId(proId) }
                }
            }).then((reponse) => {
                resolve()
            }).catch((err) => {
                reject(err)
            })
        })
    },
    userData: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.USER_COLLECTION).findOne({ _id: objectId(userId) }).then((response) => {
                resolve(response)
            }).catch((err) => {
                reject(err)
            })
        })
    },
    editUserData: (userId, userData) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.USER_COLLECTION).updateOne({ _id: objectId(userId) }, {
                $set: {
                    name: userData.name,
                    email: userData.email
                }
            }).then(() => {
                resolve()
            }).catch((err) => {
                reject(err)
            })
        })
    },
    userOrders: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let orderDetails = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
                    { $match: { 'orderObj.userId': objectId(userId) } },
                    { $unwind: '$orderObj.products' },
                    {
                        $lookup: {
                            from: collections.PRODUCT_COLLECTION,
                            localField: 'orderObj.products.item',
                            foreignField: '_id',
                            as: 'productDetails'

                        }
                    },
                    {
                        $project:
                        {
                            orderObj: 1,
                            productDetails: 1,
                            date: { $dateToString: { format: "%d-%m-%Y", date: "$orderObj.date" } }
                        }
                    },
                    { $sort: { 'orderObj.time': -1 } }

                ]).toArray()

                resolve(orderDetails)
            } catch (err) {
                reject(err)
            }

        })
    },
    getOrderDetails: (orderId, proId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let orderDetails = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
                    { $match: { _id: objectId(orderId) } },
                    { $unwind: '$orderObj.products' },
                    { $match: { 'orderObj.products.item': objectId(proId) } },
                    {
                        $lookup: {
                            from: collections.PRODUCT_COLLECTION,
                            localField: 'orderObj.products.item',
                            foreignField: '_id',
                            as: 'productDetails'

                        },


                    },
                    {
                        $project: {
                            orderObj: 1,
                            product: { $arrayElemAt: ['$productDetails', 0] },
                            date: { $dateToString: { format: "%d-%m-%Y", date: "$orderObj.date" } },

                        }
                    },
                    {
                        $addFields: {
                            productTotal: { $sum: { $multiply: ['$orderObj.products.quantity', '$product.price'] } }
                        }
                    }

                ]).toArray()

                resolve(orderDetails)
            } catch (err) {
                reject(err)
            }
        })
    },
    cancelOrder: (orderId, proId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.ORDER_COLLECTION).updateOne({ _id: objectId(orderId) },
                {
                    $set: {
                        'orderObj.cancelled': true,
                        'orderObj.shipping': false,
                        'orderObj.delivered': false,
                        'orderObj.pending': false
                    }
                }).then(() => {
                    resolve()
                }).catch((err) => {
                    reject(err)
                })
        })
    },
    checkEmail: (email) => {
        let response = {}
        return new Promise(async (resolve, reject) => {
            try {
                let user = await db.get().collection(collections.USER_COLLECTION).findOne({ email: email })
                if (user) {
                    response.user = user
                    response.status = true
                    resolve(response)
                } else {
                    response.status = false
                    resolve(response)
                }
            } catch (err) {
                reject(err)
            }


        })
    },
    resetPassword: (email, password) => {
        return new Promise(async (resolve, reject) => {
            try {
                password = await bcrypt.hash(password, 10);
                db.get().collection(collections.USER_COLLECTION).updateOne({ email: email },
                    {
                        $set: {
                            password: password
                        }
                    }).then(() => {
                        resolve()
                    })
            } catch (err) {
                reject(err)
            }

        })
    },
}