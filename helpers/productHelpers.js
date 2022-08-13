const db = require('../config/connection')
const collections = require('../config/collections')
const objectId = require('mongodb').ObjectId

module.exports = {
    addProduct: (productDetails, img, vendorData) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.PRODUCT_COLLECTION).insertOne({
                'name': productDetails.name,
                'price': parseInt(productDetails.price),
                'category': productDetails.category,
                'xs-stocks': productDetails.xs_stock,
                's-stocks': productDetails.s_stock,
                'm-stocks': productDetails.m_stock,
                'l-stocks': productDetails.l_stock,
                'xl-stocks': productDetails.xl_stock,
                'xxl-stocks': productDetails.xxl_stock,
                'offer': productDetails.offer,
                'material': productDetails.material,
                'deleteStatus': false,
                'description': productDetails.description,
                'images': img,
                'vendorId': objectId(vendorData._id),
                'vendorName': vendorData.name,
                'vendorBussinessName': vendorData.bussinessName,
                'time': Date.now()
            }).then((response) => {
                resolve(response)
            }).catch((err) => {
                reject(err)
            })
        })
    },
    getAllProducts: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let Allproducts = await db.get().collection(collections.PRODUCT_COLLECTION).find({
                    deleteStatus: false
                }).sort({ 'time': -1 }).toArray()
                resolve(Allproducts)
            } catch (err) {
                reject(err)
            }
        })
    },
    getLimitedProducts: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let Allproducts = await db.get().collection(collections.PRODUCT_COLLECTION).find({
                    deleteStatus: false
                }).sort({ 'time': -1 }).limit(6).toArray()
                resolve(Allproducts)
            } catch (err) {
                reject(err)
            }
        })
    },
    getVendorProducts: (vendorId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let vendorProducts = await db.get().collection(collections.PRODUCT_COLLECTION).find({
                    vendorId: objectId(vendorId), deleteStatus: false
                }).sort({ 'time': -1 }).toArray()
                resolve(vendorProducts)
            } catch (err) {
                reject(err)
            }
        })
    },
    deleteProducts: (proId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.PRODUCT_COLLECTION).updateOne({ _id: objectId(proId) }, {
                $set: {
                    deleteStatus: true
                }
            }).then((response) => {
                resolve(response)
            }).catch((err) => {
                reject(err)
            })
        })
    },
    getProduct: (proId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let product = await db.get().collection(collections.PRODUCT_COLLECTION).findOne({ _id: objectId(proId) })
                resolve(product)
            } catch (err) {
                reject(err)
            }
        })
    },
    updateProduct: (proId, productDetails, images) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.PRODUCT_COLLECTION).updateOne({ _id: objectId(proId) }, {
                $set: {
                    'name': productDetails.name,
                    'price': parseInt(productDetails.price),
                    'category': productDetails.category,
                    'xs-stocks': productDetails.xs_stock,
                    's-stocks': productDetails.s_stock,
                    'm-stocks': productDetails.m_stock,
                    'l-stocks': productDetails.l_stock,
                    'xl-stocks': productDetails.xl_stock,
                    'xxl-stocks': productDetails.xxl_stock,
                    'offer': productDetails.offer,
                    'material': productDetails.material,
                    'deleteStatus': false,
                    'description': productDetails.description,
                    'images': images,
                    'time': Date.now()
                }
            }).then((response) => {
                resolve(response)
            }).catch((err) => {
                reject(err)
            })
        })
    },
    addReview:(reviewData,userId)=>{
        let review={review:reviewData.review,
                    userId:objectId(userId),
                    time:Date.now()}
        return new Promise(async(resolve,reject)=>{
            try{
            let product=await db.get().collection(collections.PRODUCT_COLLECTION).findOne({_id:objectId(reviewData.proId)})
            if(product.review){
                db.get().collection(collections.PRODUCT_COLLECTION).updateOne({_id:objectId(reviewData.proId)},
                {$push:{
                    review:review
                }}).then(()=>{
                    resolve()
                }).catch((err)=>{
                    reject(err)
                })
            }else{
                db.get().collection(collections.PRODUCT_COLLECTION).updateOne({_id:objectId(reviewData.proId)},
                {$set:{
                    review:[review]
                }}).then(()=>{
                    resolve()
                }).catch((err)=>{
                    reject(err)
                })
            }
        }catch(err){
            reject(err)
        }
        })
    },
    getAllReviews:(proId)=>{
        return new Promise(async(resolve,reject)=>{
            try{
            let product=await db.get().collection(collections.PRODUCT_COLLECTION).findOne({_id:objectId(proId)})
            if(product.review){
               let reviews=await db.get().collection(collections.PRODUCT_COLLECTION).aggregate([
                    {$match:{_id:objectId(proId)}},
                    {$unwind:'$review'},
                    {$project:{review:1}},
                    {$lookup:{
                        from:collections.USER_COLLECTION,
                        localField:'review.userId',
                        foreignField:'_id',
                        as:'userDetails'
                    }},
                    {$sort:{'review.time':-1}}

                ]).toArray()
                resolve(reviews)
            }else{
                resolve(false)
            }
        }catch(err){
            reject(err)
        }
        })
    },
    getUserReview:(proId,userId)=>{
        return new Promise(async(resolve,reject)=>{
            try{
            let product=await db.get().collection(collections.PRODUCT_COLLECTION).findOne({_id:objectId(proId)})
            if(product.review){
                let reviews=await db.get().collection(collections.PRODUCT_COLLECTION).aggregate([
                     {$match:{_id:objectId(proId)}},
                     {$unwind:'$review'},
                     {$project:{review:1}},
                     {$match:{'review.userId':objectId(userId)}},
                     {$lookup:{
                         from:collections.USER_COLLECTION,
                         localField:'review.userId',
                         foreignField:'_id',
                         as:'userDetails'
                     }},
                     {$sort:{'review.time':-1}}
 
                 ]).toArray()
                 resolve(reviews)
             }else{
                 resolve(false)
             }
            }catch(err){
                reject(err)
            }
        })
    },
    getVendorProductReview:(vendorId)=>{
        return new Promise(async(resolve,reject)=>{
            try{
                let reviews=await db.get().collection(collections.PRODUCT_COLLECTION).aggregate([
                     {$match:{vendorId:objectId(vendorId)}},
                     {$unwind:'$review'},
                     {$sort:{'review.time':-1}},
                     {$project:{name:1,images:1,review:1,category:1,userId:'$review.userId'}},
                     {$lookup:{
                        from:collections.USER_COLLECTION,
                        localField:'userId',
                        foreignField:'_id',
                        as:'userDetails'
                     }}
 
                 ]).toArray()
                 resolve(reviews)

            }catch(err){
                reject(err)
            }
        })
    },
    deleteReview:(proId,reviewId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.PRODUCT_COLLECTION).updateOne({_id:objectId(proId)},
            {$pull:{review:{'time':parseInt(reviewId)}}}).then((response)=>{
                resolve(response)
            }).catch((err)=>{
                reject(err)
            })
        })
    }
}