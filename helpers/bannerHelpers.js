const db = require('../config/connection')
const collections = require('../config/collections')
const objectId = require('mongodb').ObjectId

module.exports = {
    addBanner: (bannerData, image) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.BANNER_COLLECTION).insertOne({
                mainText: bannerData.mainText,
                subText: bannerData.subText,
                textColor: bannerData.textColor,
                url: bannerData.url,
                deleteStatus: false,
                bannerImage: image,
                vendorName: bannerData.vendorName,
                bussinessName: bannerData.bussinessName,
                time: Date.now()
            }).then((response) => {
                resolve()
            }).catch((err) => {
                reject(err)
            })
        })
    },
    getAllBanners: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let banners = await db.get().collection(collections.BANNER_COLLECTION).find({ deleteStatus: false }).sort({ time: -1 }).toArray()
                resolve(banners)
            } catch (err) {
                reject(err)
            }
        })
    },
    getBanner: (bannerId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.BANNER_COLLECTION).findOne({ _id: objectId(bannerId) }).then((banner) => {
                resolve(banner)
            }).catch((err) => {
                reject(err)
            })
        })
    },
    updateBanner: (bannerId, bannerData, image) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.BANNER_COLLECTION).updateOne({ _id: objectId(bannerId) }, {
                $set: {
                    mainText: bannerData.mainText,
                    subText: bannerData.subText,
                    textColor: bannerData.textColor,
                    url: bannerData.url,
                    bannerImage: image,
                    vendorName: bannerData.vendorName,
                    bussinessName: bannerData.bussinessName,
                    time: Date.now()
                }
            }).then(() => {
                resolve()
            }).catch((err) => {
                reject(err)
            })
        })
    },
    deleteBanner: (bannerId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.BANNER_COLLECTION).updateOne({ _id: objectId(bannerId) }, {
                $set: {
                    deleteStatus: true,
                }
            }).then((response) => {
                resolve()
            }).catch((err) => {
                reject(err)
            })
        })
    }
}