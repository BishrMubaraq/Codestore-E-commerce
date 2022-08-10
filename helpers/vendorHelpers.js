const db = require('../config/connection')
const collections = require('../config/collections')
const bcrypt = require('bcrypt')
const objectId = require('mongodb').ObjectId

module.exports = {
    doSignup: (vendorData) => {
        let response = {}
        return new Promise(async (resolve, reject) => {
            try {
                vendorData.password = await bcrypt.hash(vendorData.password, 10)
                db.get().collection(collections.VENDOR_COLLECTION).insertOne({
                    'name': vendorData.name,
                    'email': vendorData.email,
                    'bussinessName': vendorData.bussinessName,
                    'mobileNumber': vendorData.mobileNumber,
                    'status': true,
                    'password': vendorData.password
                }).then(async (data) => {
                    let vendors = await db.get().collection(collections.VENDOR_COLLECTION).findOne({ _id: data.insertedId })
                    response.vendor = vendors
                    response.status = true
                    resolve(response)
                })
            } catch (err) {
                reject(err)
            }
        })
    },
    alreadyVendor: (vendorData) => {
        return new Promise(async (resolve, reject) => {
            try {
                let alreadyVendor = await db.get().collection(collections.VENDOR_COLLECTION).findOne({ $or: [{ email: vendorData.email }, { mobileNumber: vendorData.mobileNumber }] })
                if (alreadyVendor) {
                    resolve({ status: true })
                } else {
                    resolve({ status: false })
                }
            } catch (err) {
                reject(err)
            }
        })

    },
    doLogin: (vendorData) => {
        return new Promise(async (resolve, reject) => {
            try {
                let response = {}
                let vendor = await db.get().collection(collections.VENDOR_COLLECTION).findOne({ email: vendorData.email, status: true })
                let vendorStatus = await db.get().collection(collections.VENDOR_COLLECTION).findOne({ email: vendorData.email, status: false })
                if (vendor) {
                    bcrypt.compare(vendorData.password, vendor.password).then((status) => {
                        if (status) {
                            response.status = true
                            response.vendor = vendor
                            resolve(response)
                        } else {

                            response.status = false
                            resolve(response)

                        }
                    })
                } else if (vendorStatus) {
                    response.status = false
                    response.vendorStatus = true
                    resolve(response)
                }
                else {
                    response.status = false
                    resolve(response)
                }
            } catch (err) {
                reject(err)
            }
        })
    },
    getAllVendors: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let vendors = await db.get().collection(collections.VENDOR_COLLECTION).find().toArray()
                resolve(vendors)
            } catch (err) {
                reject(err)
            }
        })
    },
    blockVendor: (vendorId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.VENDOR_COLLECTION).updateOne({ _id: objectId(vendorId) },
                {
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
    UnBlockVendor: (vendorId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.VENDOR_COLLECTION).updateOne({ _id: objectId(vendorId) },
                {
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
    isVendorBlock: (vendorId) => {
        let response = {}
        return new Promise(async (resolve, reject) => {
            try {
                let vendor = await db.get().collection(collections.VENDOR_COLLECTION).findOne({ _id: objectId(vendorId) })
                if (vendor.status) {
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
    vendorData: (vendorId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.VENDOR_COLLECTION).findOne({ _id: objectId(vendorId) }).then((response) => {
                resolve(response)
            }).catch((err) => {
                reject(err)
            })
        })
    },
    editProfileWithImage: (vendorId, vendorData, image) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.VENDOR_COLLECTION).updateOne({ _id: objectId(vendorId) },
                {
                    $set: {
                        'name': vendorData.name,
                        'email': vendorData.email,
                        'bussinessName': vendorData.bussinessName,
                        'mobileNumber': vendorData.mobileNumber,
                        'profile-photo': image
                    }
                }).then(() => {
                    resolve()
                }).catch((err) => {
                    reject(err)
                })
        })
    },
    editProfile: (vendorId, vendorData) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.VENDOR_COLLECTION).updateOne({ _id: objectId(vendorId) },
                {
                    $set: {
                        'name': vendorData.name,
                        'email': vendorData.email,
                        'bussinessName': vendorData.bussinessName,
                        'mobileNumber': vendorData.mobileNumber,
                    }
                }).then(() => {
                    resolve()
                }).catch((err) => {
                    reject(err)
                })
        })
    }
}