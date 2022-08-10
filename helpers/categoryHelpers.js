const db = require('../config/connection')
const collections = require('../config/collections')
const objectId = require('mongodb').ObjectId


module.exports = {
    addCategory: (categoryData) => {
        categoryData.name = categoryData.name.toUpperCase()
        let response = {}
        return new Promise(async (resolve, reject) => {
            try {
                let categoryName = await db.get().collection(collections.CATEGORY_COLLECTION).findOne({ name: categoryData.name })
                if (categoryName) {
                    response.status = true
                    resolve(response)
                } else {
                    db.get().collection(collections.CATEGORY_COLLECTION).insertOne({
                        name: categoryData.name,
                    }).then(() => {
                        response.status = false
                        resolve(response)
                    })
                }
            } catch (err) {
                reject(err)
            }
        })
    },
    getAllCategories: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let categories = await db.get().collection(collections.CATEGORY_COLLECTION).find({}).toArray()
                resolve(categories)
            } catch (err) {
                reject(err)
            }
        })
    },
    getCategory: (catId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let category = await db.get().collection(collections.CATEGORY_COLLECTION).findOne({ _id: objectId(catId) })
                resolve(category)
            } catch (err) {
                reject(err)
            }
        })
    },
    updateCategory: (catData) => {
        let response = {}
        return new Promise(async (resolve, reject) => {
            try {
                let categoryName = await db.get().collection(collections.CATEGORY_COLLECTION).findOne({ name: catData.name })
                if (categoryName) {
                    response.status = true
                    resolve(response)
                } else {
                    db.get().collection(collections.CATEGORY_COLLECTION).updateOne({
                        _id: objectId(catData.catId)
                    }, {
                        $set: {
                            name: catData.name
                        }
                    }).then(() => {
                        response.status = false
                        resolve(response)
                    })
                }
            } catch (err) {
                reject(err)
            }

        })
    },
    deleteCategory: (catId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.CATEGORY_COLLECTION).deleteOne({ _id: objectId(catId) }).then((response) => {
                resolve(response)
            }).catch((err) => {
                reject(err)
            })
        })
    }
}