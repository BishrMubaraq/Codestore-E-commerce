const db = require('../config/connection')
const collections = require('../config/collections')
const objectId = require('mongodb').ObjectId

module.exports = {
    doLogin: (adminData) => {
        let response = {}
        return new Promise(async (resolve, reject) => {
            try {
                let admin = await db.get().collection(collections.ADMIN_COLLECTION).findOne({ adminId: adminData.adminId })
                if (admin) {
                    if (admin.password == adminData.password) {
                        response.status = true;
                        response.admin = admin;
                        resolve(response)
                    } else {
                        response.status = false
                        resolve(response)
                    }
                } else {
                    response.status = false
                    resolve(response)
                }
            } catch (err) {
                reject(err)
            }
        })
    },
    getVendorsOrder: (sellerId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let orderDetails = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
                    { $unwind: '$orderObj.products' },
                    {
                        $lookup: {
                            from: collections.PRODUCT_COLLECTION,
                            localField: 'orderObj.products.item',
                            foreignField: '_id',
                            as: 'productDetails'
                        }
                    },
                    { $match: { 'productDetails.vendorId': objectId(sellerId) } },
                    {
                        $project: {
                            orderObj: 1,
                            product: { $arrayElemAt: ['$productDetails', 0] },
                            date: { $dateToString: { format: "%d-%m-%Y", date: "$orderObj.date" } }
                        }
                    },
                    {
                        $addFields: {
                            productTotal: { $sum: { $multiply: ['$orderObj.products.quantity', '$product.price'] } }
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
    getAllOrders: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let orderDetails = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
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
                        $project: {
                            orderObj: 1,
                            product: { $arrayElemAt: ['$productDetails', 0] },
                            date: { $dateToString: { format: "%d-%m-%Y", date: "$orderObj.date" } }
                        }
                    },
                    {
                        $addFields: {
                            productTotal: { $sum: { $multiply: ['$orderObj.products.quantity', '$product.price'] } }
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
    changeOrderStatus: (status, orderId) => {
        return new Promise((resolve, reject) => {
            if (status === 'cancelled') {
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
            } else if (status === 'shipped') {
                db.get().collection(collections.ORDER_COLLECTION).updateOne({ _id: objectId(orderId) },
                    {
                        $set: {
                            'orderObj.cancelled': false,
                            'orderObj.shipping': true,
                            'orderObj.delivered': false,
                            'orderObj.pending': false
                        }
                    }).then(() => {
                        resolve()
                    }).catch((err) => {
                        reject(err)
                    })
            } else if (status === 'delivered') {
                db.get().collection(collections.ORDER_COLLECTION).updateOne({ _id: objectId(orderId) },
                    {
                        $set: {
                            'orderObj.cancelled': false,
                            'orderObj.shipping': false,
                            'orderObj.delivered': true,
                            'orderObj.pending': false
                        }
                    }).then(() => {
                        resolve()
                    }).catch((err) => {
                        reject(err)
                    })
            } else {
                db.get().collection(collections.ORDER_COLLECTION).updateOne({ _id: objectId(orderId) },
                    {
                        $set: {
                            'orderObj.cancelled': false,
                            'orderObj.shipping': false,
                            'orderObj.delivered': false,
                            'orderObj.pending': true
                        }
                    }).then(() => {
                        resolve()
                    }).catch((err) => {
                        reject(err)
                    })
            }


        })
    },
    totalVendors: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let vendorsCount = await db.get().collection(collections.VENDOR_COLLECTION).find().count()
                resolve(vendorsCount)
            } catch (err) {
                reject(err)
            }

        })
    },
    totalUsers: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let usersCount = await db.get().collection(collections.USER_COLLECTION).find().count()
                resolve(usersCount)
            } catch (err) {
                reject(err)
            }
        })
    },
    totalOrder: (vendorId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let totalOrders = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
                    { $match: { 'orderObj.cancelled': false } },
                    { $unwind: '$orderObj.products' },
                    {
                        $lookup: {
                            from: collections.PRODUCT_COLLECTION,
                            localField: 'orderObj.products.item',
                            foreignField: '_id',
                            as: 'productDetails'
                        }
                    },
                    { $match: { 'productDetails.vendorId': objectId(vendorId) } },
                    { $count: 'totalOrders' }
                ]).toArray()
                if (totalOrders.length > 0) {
                    resolve(totalOrders[0].totalOrders)

                } else {
                    resolve(0)
                }

            } catch (err) {
                reject(err)
            }
        })
    }, totalCancelOrders: (vendorId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let totalCancelOrders = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
                    { $match: { 'orderObj.cancelled': true } },
                    { $unwind: '$orderObj.products' },
                    {
                        $lookup: {
                            from: collections.PRODUCT_COLLECTION,
                            localField: 'orderObj.products.item',
                            foreignField: '_id',
                            as: 'productDetails'
                        }
                    },
                    { $match: { 'productDetails.vendorId': objectId(vendorId) } },
                    { $count: 'totalCancelOrders' }
                ]).toArray()
                if (totalCancelOrders.length > 0) {
                    resolve(totalCancelOrders[0].totalCancelOrders)
                } else {
                    resolve(0)
                }


            } catch (err) {
                reject(err)
            }
        })
    }, totalOnlinePayments: (vendorId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let totalOnlinePayment = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
                    { $match: { 'orderObj.payment_method': 'OnlinePayment' } },
                    { $unwind: '$orderObj.products' },
                    {
                        $lookup: {
                            from: collections.PRODUCT_COLLECTION,
                            localField: 'orderObj.products.item',
                            foreignField: '_id',
                            as: 'productDetails'
                        }
                    },
                    { $match: { 'productDetails.vendorId': objectId(vendorId) } },
                    { $count: 'totalOnlinePayment' }
                ]).toArray()
                if (totalOnlinePayment.length > 0) {
                    resolve(totalOnlinePayment[0].totalOnlinePayment)
                } else {
                    resolve(0)
                }


            } catch (err) {
                reject(err)
            }
        })
    },
    totalCod: (vendorId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let totalCod = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
                    { $match: { 'orderObj.payment_method': 'COD' } },
                    { $unwind: '$orderObj.products' },
                    {
                        $lookup: {
                            from: collections.PRODUCT_COLLECTION,
                            localField: 'orderObj.products.item',
                            foreignField: '_id',
                            as: 'productDetails'
                        }
                    },
                    { $match: { 'productDetails.vendorId': objectId(vendorId) } },
                    { $count: 'totalCod' }
                ]).toArray()
                if (totalCod.length > 0) {
                    resolve(totalCod[0].totalCod)
                } else {
                    resolve(0)
                }


            } catch (err) {
                reject(err)
            }
        })
    },
    totalOnlineMoney: (vendorId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let totalOnlineMoney = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
                    { $match: { 'orderObj.payment_method': 'OnlinePayment' } },
                    { $unwind: '$orderObj.products' },
                    {
                        $lookup: {
                            from: collections.PRODUCT_COLLECTION,
                            localField: 'orderObj.products.item',
                            foreignField: '_id',
                            as: 'productDetails'
                        }
                    },
                    { $match: { 'productDetails.vendorId': objectId(vendorId) } },
                    {
                        $group: {
                            _id: null,
                            total: {
                                $sum: '$orderObj.total'
                            }
                        }
                    }
                ]).toArray()
                if (totalOnlineMoney.length > 0) {
                    resolve(totalOnlineMoney[0].total)
                } else {
                    resolve(0)
                }


            } catch (err) {
                reject(err)
            }


        })
    },
    totalCodMoney: (vendorId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let totalCodMoney = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
                    { $match: { 'orderObj.payment_method': 'COD' } },
                    { $unwind: '$orderObj.products' },
                    {
                        $lookup: {
                            from: collections.PRODUCT_COLLECTION,
                            localField: 'orderObj.products.item',
                            foreignField: '_id',
                            as: 'productDetails'
                        }
                    },
                    { $match: { 'productDetails.vendorId': objectId(vendorId) } },
                    {
                        $group: {
                            _id: null,
                            total: {
                                $sum: '$orderObj.total'
                            }
                        }
                    }
                ]).toArray()
                if (totalCodMoney.length > 0) {
                    resolve(totalCodMoney[0].total)
                } else {
                    resolve(0)
                }


            } catch (err) {
                reject(err)
            }


        })
    },
    totalPending: (vendorId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let totalPending = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
                    {
                        $match: {
                            'orderObj.pending': true
                        }
                    }, {
                        $unwind: {
                            path: '$orderObj.products'
                        }
                    }, {
                        $lookup: {
                            from: collections.PRODUCT_COLLECTION,
                            localField: 'orderObj.products.item',
                            foreignField: '_id',
                            as: 'productsDetails'
                        }
                    }, {
                        $match: {
                            'productsDetails.vendorId': objectId(vendorId)
                        }
                    }, {
                        $count: 'pendingCount'
                    }
                ]).toArray()
                if (totalPending.length > 0) {
                    resolve(totalPending[0].pendingCount)
                } else {
                    resolve(0)
                }


            } catch (err) {
                reject(err)
            }
        })
    },
    totalShipped: (vendorId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let totalShipped = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
                    { $match: { 'orderObj.shipping': true } },
                    { $unwind: '$orderObj.products' },
                    {
                        $lookup: {
                            from: collections.PRODUCT_COLLECTION,
                            localField: 'orderObj.products.item',
                            foreignField: '_id',
                            as: 'productDetails'
                        }
                    },
                    { $match: { 'productDetails.vendorId': objectId(vendorId) } },
                    { $count: 'totalShipped' }
                ]).toArray()
                if (totalShipped.length > 0) {
                    resolve(totalShipped[0].totalShipped)
                } else {
                    resolve(0)
                }


            } catch (err) {
                reject(err)
            }
        })
    },
    totalDelivered: (vendorId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let totalDelivered = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
                    { $match: { 'orderObj.delivered': true } },
                    { $unwind: '$orderObj.products' },
                    {
                        $lookup: {
                            from: collections.PRODUCT_COLLECTION,
                            localField: 'orderObj.products.item',
                            foreignField: '_id',
                            as: 'productDetails'
                        }
                    },
                    { $match: { 'productDetails.vendorId': objectId(vendorId) } },
                    { $count: 'totalDelivered' }
                ]).toArray()
                if (totalDelivered.length > 0) {
                    resolve(totalDelivered[0].totalDelivered)
                } else {
                    resolve(0)
                }


            } catch (err) {
                reject(err)
            }
        })
    }
}
