var db = require('../configurations/connection');
var bcrypt = require('bcrypt');
var collection = require('../configurations/collections');
const { Collection } = require('mongodb');
//const { response } = require('express');
const { CART_COLLECTION } = require('../configurations/collections');
var objectId = require('mongodb').ObjectId

module.exports = {

    addToCart: (proId, userId) => {
        let proObj = {
            item: objectId(proId),
            quantity: 1
        }
        return new Promise(async (resolve, reject) => {
            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
            if (userCart) {
                let proExist = userCart.products.findIndex(product => product.item == proId)
                
                if (proExist != -1) {
                    db.get().collection(collection.CART_COLLECTION)
                        .updateOne({ user: objectId(userId), 'products.item': objectId(proId) }, {
                            $inc: { 'products.$.quantity': 1 }
                        }).then(() => {
                            resolve()
                        })
                } else {

                    db.get().collection(collection.CART_COLLECTION).updateOne({ user: objectId(userId) }, {
                        $push: { products: proObj }
                    }).then(() => {
                        db.get().collection(collection.CART_COLLECTION).updateOne({user:objectId(userId)},{
                            $pull:{
                                saveForLater:{
                                    product:objectId(proId)
                                }
                            }
                        }).then(()=>{
                            resolve()

                        })
                    })
                }

            } else {
                let cartObj =
                {
                    user: objectId(userId),
                    products: [proObj]
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response) => {
                    resolve()
                })
            }
        })
    },
    getCartProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                }, {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                }

               
            ]).toArray()
           
            resolve(cartItems)
        })
    },
    getCartCount: (id) => {
        return new Promise(async (resolve, reject) => {
            let count = 0
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(id) })
            if (cart) {
                count = cart.products.length
                resolve(count)

            }else{
                resolve(0)
            }
        })
    },

    changeProductQuantity: (details) => {
        details.count = parseInt(details.count)
        details.quantity = parseInt(details.quantity)

        return new Promise((resolve, reject) => {
            if (details.count == -1 && details.quantity == 1) {
                db.get().collection(collection.CART_COLLECTION).updateOne({ _id: objectId(details.cart) },
                    {
                        $pull: { products: { item: objectId(details.product) } }
                    }
                ).then((response) => {
                    resolve({ removeProduct: true })
                })
            } else {
                db.get().collection(collection.CART_COLLECTION)
                    .updateOne({ _id: objectId(details.cart), 'products.item': objectId(details.product) }, {
                        $inc: { 'products.$.quantity': details.count }
                    }).then((response) => {
                        resolve({ status: true })
                    })
            }
        })
    },
    deleteCartItem: (cartId, proId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CART_COLLECTION).updateOne({ _id: objectId(cartId), 'products.item': objectId(proId) }, {
                $pull: { products: { item: objectId(proId) } }
            }).then((response) => {
                
                resolve()
            })
        })
    },
    getTotalAmount: (userId) => {
       
        return new Promise(async (resolve, reject) => {

            try {
                let total = await db.get().collection(collection.CART_COLLECTION).aggregate([
                    {
                        $match: { user: objectId(userId) }
                    },
                    {
                        $unwind: '$products'
                    },
                    {
                        $project: {
                            item: '$products.item',
                            quantity: '$products.quantity'
                        }
                    }, {
                        $lookup: {
                            from: collection.PRODUCT_COLLECTION,
                            localField: 'item',
                            foreignField: '_id',
                            as: 'product'
                        }
                    },
                    {
                        $project: {
                            item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: { $multiply: ['$quantity', '$product.price'] } }
                        }
                    }
                ]).toArray()
               
                resolve(total[0].total)

            } catch (err) {
                resolve(0)

            }
        })

    },






    getCartProductList: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
            resolve(cart)
        })
    },


    findProCount:(userId,proId)=>{
        return new Promise(async(resolve, reject) => {
            try{
            let count=await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match:{
                        user:objectId(userId)
                    }
                },
                {
                    $project:{
                        _id:0,
                        products:'$products'
                    }
                },
                {
                    $unwind:'$products'
                },
                {
                    $match:{
                        'products.item':objectId(proId)
                    }
                },
                {
                   
                    $project:{
                        quantity:'$products.quantity'
                    }
                }
            ]).toArray()
            resolve(count[0].quantity)
        }catch{
            resolve(0)
        }
        })
    },

    // addToSave:(userId,proId)=>{
    //     console.log("at helper");
    //     console.log(proId);
    //     let proObj = {
    //         item: objectId(proId),
    //     }
    //     return new Promise(async (resolve, reject) => {
    //         let userSavelist = await db.get().collection(collection.SAVELIST_COLLECTION).findOne({ user: objectId(userId) })
    //         console.log(userSavelist);
    //         if (userSavelist) {
    //             let proExist = userSavelist.products.findIndex(product => product.item == proId)
    //             if (proExist != -1) {
    //                 db.get().collection(collection.SAVELIST_COLLECTION).updateOne({ user: objectId(userId), 'products.item': objectId(proId) }, {
    //                     $pull: { products: { item: objectId(proId) } }
    //                 }).then((res) => {
    //                     console.log(res,"rehject resss");
    //                     reject()
    //                 })
    //             } else {
    //                 db.get().collection(collection.SAVELIST_COLLECTION).updateOne({ user: objectId(userId) }, {
    //                     $push: {
    //                         products: proObj
    //                     }
    //                 }).then((res) => {
    //                     console.log('resolve ress',res);
    //                     resolve()
    //                 })
    //             }

    //         } else {
    //             saveobj = {
    //                 user: objectId(userId),
    //                 products: [proObj]
    //             }
    //             db.get().collection(collection.SAVELIST_COLLECTION).insertOne(saveobj).then(() => {
    //                 console.log("last resolve working");
    //                 resolve()
    //             })
    //         }

    //     })

    // },

    saveForLater:(userId,proId,quantity)=>{
        return new Promise((resolve, reject) => {
            let proObj={
                product:objectId(proId),
                quantity:parseInt(quantity)
            }
            db.get().collection(collection.CART_COLLECTION).updateOne({user:objectId(userId)},
            {
                $push:{
                    saveForLater:proObj
                }
            }).then((response)=>{
                console.log(response);
                db.get().collection(collection.CART_COLLECTION).updateOne({user:objectId(userId)},
                {
                    $pull:{
                        products:{
                            item:objectId(proId)
                        }
                    }
                }).then((res)=>{
                    console.log(res,'this is pulll');
                    resolve()
                })

            })
        })
    },

    getSaveForLaterProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            let saveForLater = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) }
                },
                {
                    $unwind: '$saveForLater'
                },
                {
                    $project: {
                        item: '$saveForLater.product',
                        quantity: '$saveForLater.quantity'
                    }
                }, {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                }

               
            ]).toArray()
           console.log(saveForLater,"sace bdf");
           for(let i=0;i<saveForLater.length;i++){
            saveForLater[i].total=saveForLater[i].quantity*saveForLater[i].product.price
            console.log(saveForLater[i].total,"this is myyyyyyyy");

           }
            resolve(saveForLater)
        })
    },

    moveToCart:(userId,proId,quantity)=>{
        return new Promise((resolve, reject) => {
            let proObj={
                item:objectId(proId),
                quantity:parseInt(quantity)
            }
            db.get().collection(collection.CART_COLLECTION).updateOne({user:objectId(userId)},
            {
                $push:{
                    products:proObj    
                }
            }).then(()=>{
                db.get().collection(collection.CART_COLLECTION).updateOne({user:objectId(userId)},
                { 
                    $pull:{
                        saveForLater:{
                            product:objectId(proId)
                        }
                    }
                }).then(()=>{
                    console.log("haii friendsss");
                    resolve()
                })
            })
            
        })
    },

    deleteSaveForLater:(userId,proId)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CART_COLLECTION).updateOne({user:objectId(userId)},{
                $pull:{
                    saveForLater:{
                        product:objectId(proId)
                    }
                }
            }).then((res)=>{
console.log(res);
console.log('pulled successflly');
resolve()
            })
        })
    }



}