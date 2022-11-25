var db = require('../configurations/connection');
var bcrypt = require('bcrypt');
var collection = require('../configurations/collections');
const { Collection, ObjectId } = require('mongodb');
//const { response } = require('express');
module.exports = {

    addToWishlist: (userId, proId) => {
        let proObj = {
            item: ObjectId(proId),
        }
        return new Promise(async (resolve, reject) => {
            let userWishlist = await db.get().collection(collection.WISHLIST_COLLECTION).findOne({ user: ObjectId(userId) })
            if (userWishlist) {
                let proExist = userWishlist.products.findIndex(product => product.item == proId)
                if (proExist != -1) {
                    db.get().collection(collection.WISHLIST_COLLECTION).updateOne({ user: ObjectId(userId), 'products.item': ObjectId(proId) }, {
                        $pull: { products: { item: ObjectId(proId) } }
                    }).then(() => {
                        reject()
                    })
                } else {
                    db.get().collection(collection.WISHLIST_COLLECTION).updateOne({ user: ObjectId(userId) }, {
                        $push: {
                            products: proObj
                        }
                    }).then(() => {
                        resolve()
                    })
                }

            } else {
                wishobj = {
                    user: ObjectId(userId),
                    products: [proObj]
                }
                db.get().collection(collection.WISHLIST_COLLECTION).insertOne(wishobj).then(() => {
                    resolve()
                })
            }

        })

    },

    getWishProducts:(userId)=>{
        return new Promise(async(resolve, reject) => {
            let allProducts=await db.get().collection(collection.WISHLIST_COLLECTION).aggregate([
                {
                    $match:{user:ObjectId(userId)}
                },
                {
                    $unwind:'$products'
                },
                {
                    $project:{
                        item:'$products.item'
                    }
                },
                {
                    $lookup:{
                        from:collection.PRODUCT_COLLECTION,
                        localField:'item',
                        foreignField:'_id',
                        as:'product'
                    }
                },
                {
                    $project:{
                        product: { $arrayElemAt: ['$product', 0] }
                    }
                }
            ]).toArray()
            resolve(allProducts)
        })
    },

    deleteWishItem:(userId,proId)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.WISHLIST_COLLECTION).updateOne({user:ObjectId(userId), 'products.item': ObjectId(proId) },{
                $pull:{products:{
                    item:ObjectId(proId)
                }

                }
            }).then(()=>{
                resolve()
            })
        })
    },

    getWishlistCount: (id) => {
        return new Promise(async (resolve, reject) => {
            let count = 0
            let wishlist = await db.get().collection(collection.WISHLIST_COLLECTION).findOne({ user: ObjectId(id) })
            if (wishlist) {
                count = wishlist.products.length
                resolve(count)

            }else{
                resolve(0)
            }
        })
    },

    getTotalAmount: (userId) => {
        return new Promise(async (resolve, reject) => {
try{
            
                let total = await db.get().collection(collection.WISHLIST_COLLECTION).aggregate([
                    {
                        $match: { user: ObjectId(userId) }
                    },
                    {
                        $unwind: '$products'
                    },
                    {
                        $project: {
                            item: '$products.item',
                            // quantity: '$products.quantity'
                        }
                    },
                     {
                        $lookup: {
                            from: collection.PRODUCT_COLLECTION,
                            localField: 'item',
                            foreignField: '_id',
                            as: 'product'
                        }
                    },
                    {
                        $project: {
                            item: 1,_id:0,  price: { $arrayElemAt: ['$product.price', 0] }
                        }
                    },
                    {
                        $group:{
                            _id:null,
                            total:{$sum:'$price'}
                        }
                    }
               
                
                    
                ]).toArray()
                resolve(total[0].total)
            }catch{
                resolve(0)
            }

           

            
        })

    },


}