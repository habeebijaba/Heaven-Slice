var db = require('../configurations/connection');
var bcrypt = require('bcrypt');
var collection = require('../configurations/collections');
const { Collection } = require('mongodb');
//const { response } = require('express');
const { equals } = require('objectid');
var objectId = require('mongodb').ObjectId




module.exports = {

    addProduct: (data) => {
        return new Promise(async (resolve, reject) => {
            let product = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ name: data.name })
            if (product) {
                reject()
            } else {
                data.price = parseInt(data.price)
                // data.productOffer=parseInt(data.productOffer)
                data.isActive=true
                db.get().collection(collection.PRODUCT_COLLECTION).insertOne(data).then((response) => {
                    resolve(response)
                })
            }
        })
    },

    getAllProducts: () => {
        return new Promise(async (resolve, reject) => {
            let allProducts = await db.get().collection(collection.PRODUCT_COLLECTION).find({isActive:true}).toArray()
            
            
            resolve(allProducts)
        })
    },


getWishProducts:(userId)=>{
    return new Promise(async(resolve, reject) => {
        let allProducts = await db.get().collection(collection.PRODUCT_COLLECTION).find({isActive:true}).toArray()
        let userwish=await db.get().collection(collection.WISHLIST_COLLECTION).find({user:objectId(userId)}).toArray()
        let wishpro=await db.get().collection(collection.WISHLIST_COLLECTION).aggregate([
            {
                $match:{user:objectId(userId)}
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
                                         product: { $arrayElemAt: ['$product._id', 0] } 
                                     } 
                               
            }
        ]).toArray()
        console.log(wishpro[0].product,"thi sis user wish productsa");
        console.log(userwish[0],"this is userwish");
    })
},



    // getWishProducts:(userId)=>{
    //     return new Promise(async(resolve, reject) => {
    //         let allProducts = await db.get().collection(collection.PRODUCT_COLLECTION).find({isActive:true}).toArray()
    //         let userwish=await db.get().collection(collection.WISHLIST_COLLECTION).find({user:objectId(userId)}).toArray()
    //         let wishProducts=await db.get().collection(collection.WISHLIST_COLLECTION).aggregate([
    //             {
    //                 $match:{user:objectId(userId)}
    //             },
    //             {
    //                 $unwind:'$products' 
    //             },
    //             {
    //                 $project:{ 
    //                     item:'$products.item'
    //                 } 
    //             },
    //             {
    //                 $lookup:{
    //                     from:collection.PRODUCT_COLLECTION,
    //                     localField:'item',
    //                     foreignField:'_id',
    //                     as:'product'  
    //                 } 
    //             }, 
    //             { 
    //                 $project:{
    //                     product: { $arrayElemAt: ['$product._id', 0] } 
    //                 } 
    //             }
    //         ]).toArray()   
    //         console.log(userwish[0].products[1]);
             //finallll
    //         var i;
    //         for(i=0;i<=allProducts.length ;i++){
    //             item=userwish[0].products[i]
    //             console.log(item);
    //         let proexist=(allProducts.findIndex(product=>product._id==item));
    //         console.log(proexist);
    //         if(proexist!=-1){
    //             allProducts[i].iswish=true
 
    //         }else{   
    //             allProducts[i].iswish=false  

    //         }
    //         }  
    //         console.log(allProducts); 
 
// final end

            
            // console.log(userwish[0].products);
            // console.log("wishpros"); 
            // console.log(allProducts[0].name);
            // console.log(wishProducts);  
            // console.log(userwish[0].products); 
            // console.log(allProducts);  
            // if (userwish) { 
            //     wishProducts.forEach (item=>{
            //         allProducts.forEach(products=>{
            //             if(products._id.equals( item)){
            //                 products.wish=true 
                            
                            
            //             }else{
            //                 if(products.wish!=true){
            //                 products.wish=false} 
            //             }
            //             console.log(allProducts);

            //         })
            //     })
  


                // array.forEach(element => {
                    
                // }); 



                // let proExist = userwish.products.findIndex(product => product.item == wishProducts._id)
                // console.log(proExist);
            // var i;var j;
            // for(i=0;i<allProducts.length;i++){
            //     for(j=0;j<wishProducts.length;j++){
            //         // console.log( allProducts[i]._id,"proid")
            //         // console.log( wishProducts[i].product,"wishid")


            //         if( (allProducts[i]._id).equals((wishProducts[j]).product)){
            //     allProducts[i].wish=true
            //     continue;
            // }else{
            //     allProducts[i].wish=false
            // }}}
            // console.log(wishProducts);
            // console.log(allProducts);
            
    // }
// })

    // },









    getAllProductsAdmin:()=>{
        return new Promise(async(resolve, reject) => {
            let allProducts=await db.get().collection(collection.PRODUCT_COLLECTION).find().sort({ $natural: -1 }).toArray()
            resolve(allProducts)
        })

    },

   

    deactivateProduct:(id)=>{
return new Promise((resolve, reject) => {
    db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(id)},{
        $set:{
            isActive:false
        }
    }).then(()=>{
        resolve()
    })
})
    },

    activateProduct:(id)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(id)},{
                $set:{
                    isActive:true
                }
            }).then(()=>{
                resolve()
            })
        })
    },

    getProductDetails: (id) => {
        return new Promise(async (resolve, reject) => {
            try{
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(id) }).then((productDetails)=>{
                resolve(productDetails)

            }).catch(()=>{
                reject()
            })
        }catch{
            reject()
        }
        })
    },

    editProduct: (data) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: objectId(data.id) }, {
                $set: {
                    name: data.name,
                    category: data.category,
                    subCategory:data.subCategory,        
                    price: parseInt( data.price),
                    description: data.description,
                    
                    
                }
            }).then((response) => {
                resolve()
            })
        })
    },

    totalProducts:()=>{
        return new Promise(async(resolve, reject) => {
            let totalProducts=await db.get().collection(collection.PRODUCT_COLLECTION).count()
            resolve(totalProducts)
        })
    },

    getCatWiseProduct:(category)=>{
        return new Promise(async(resolve, reject) => {
            let catWisePro=await db.get().collection(collection.PRODUCT_COLLECTION).find({category:category,isActive:true}).toArray()
            resolve(catWisePro)
        })
    },

    getSimilarProducts:(proId,category)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).find({ $and: [{ category:category },{_id:{$ne:objectId(proId)} }] }).toArray().then((response)=>{
                resolve(response)
            })
        })
    }










}