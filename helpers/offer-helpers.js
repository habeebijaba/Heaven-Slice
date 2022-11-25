var db = require("../configurations/connection");
var bcrypt = require("bcrypt");
var collection = require("../configurations/collections");
const { Collection, ObjectId } = require("mongodb");
//const { response } = require("express");
const moment = require("moment");
module.exports = {
  getAllProdOffers: () => {
    return new Promise(async (resolve, reject) => {
      let allProdOffers = await db
        .get()
        .collection(collection.PRODUCT_OFFERS)
        .find()
        .toArray();
      resolve(allProdOffers);
    });
  },

  addProdOffer: (data) => {
    return new Promise(async (resolve, reject) => {
      data.startDateIso = new Date(data.starting);
      data.endDateIso = new Date(data.expiry);
      data.proOfferPercentage = parseInt(data.proOfferPercentage);
      let exist = await db
        .get()
        .collection(collection.PRODUCT_OFFERS)
        .findOne({ product: data.product});
      if (exist) {
        reject();
      } else {
        db.get()
          .collection(collection.PRODUCT_OFFERS)
          .insertOne(data)
          .then((response) => {
            resolve();
          });
      }
    });
  },

  startProductOffer: (date) => {
    let proStartDateIso = new Date(date);

    return new Promise(async (resolve, reject) => {
      let data = await db
        .get()
        .collection(collection.PRODUCT_OFFERS)
        .find({ startDateIso: { $lte: proStartDateIso } })
        .toArray();
      if (data) {
        await data.map(async (onedata) => {
          let product = await db
            .get()
            .collection(collection.PRODUCT_COLLECTION)
            .findOne({ name: onedata.product, offer: { $exists: false } });
          if (product) {
            let actualPrice = product.price;
            let newPrice = (product.price * onedata.proOfferPercentage) / 100;
            newPrice = newPrice.toFixed();
            db.get()
              .collection(collection.PRODUCT_COLLECTION)
              .updateOne(
                { _id: ObjectId(product._id) },
                {
                  $set: {
                    actualPrice: actualPrice,
                    price: actualPrice - newPrice,
                    offer: true,
                    proOfferPercentage: onedata.proOfferPercentage,
                  },
                }
              );
            resolve();
          } else {
            resolve();
          }
        });
      }
      resolve()
    });
  },

  getProdOfferDetails: (proOfferId) => {
    return new Promise(async (resolve, reject) => {
      let proOfferDetails = await db
        .get()
        .collection(collection.PRODUCT_OFFERS)
        .findOne({ _id: ObjectId(proOfferId) });
      resolve(proOfferDetails);
    });
  },

  editProdOffer: (proOfferId,data) => {
    
    return new Promise((resolve, reject) => {
      
        db.get().collection(collection.PRODUCT_OFFERS).updateOne({_id:ObjectId(proOfferId)},{
            $set:{
                product: data.product,
                starting: data.starting,
                expiry: data.expiry,
                proOfferPercentage:parseInt (data.proOfferPercentage),
                startDateIso : new Date(data.starting),
                endDateIso : new Date(data.expiry)
            }
        }).then((res)=>{
            resolve()
        })
    });
  },

  deleteProdOffer:(proOfferId)=>{
    return new Promise(async(resolve, reject) => {
        let productOffer = await db.get().collection(collection.PRODUCT_OFFERS).findOne({ _id:ObjectId(proOfferId) })
        let pname = productOffer.product
        let product = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ name: pname })
        db.get().collection(collection.PRODUCT_OFFERS).deleteOne({ _id: ObjectId(proOfferId) }).then(() => {
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ name: pname },
                {
                    $set: {
                        price: product.actualPrice
                    },
                    $unset: {
                        offer: "",
                        proOfferPercentage: "",
                        actualPrice: "",
                        
                    }
                }).then(() => {
                    resolve()
                })
        })
    })
    
},

getAllCatOffers:()=>{
    return new Promise(async(resolve, reject) => {
        let allCatOffers=await db.get().collection(collection.CATEGORY_OFFERES).find().toArray()
        resolve(allCatOffers)
    })
},

addCatOffer:async (data) => {
    let cname = data.category
    let offerExist=await db.get().collection(collection.CATEGORY_OFFERES).findOne({category:cname})
    if(offerExist){
      reject()
    }else{
    data.catOfferPercentage = parseInt(data.catOfferPercentage)
    return new Promise(async (resolve, reject) => {
        data.startDateIso = new Date(data.starting)
        data.endDateIso = new Date(data.expiry)
        let response = {};
        let exist = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ name: data.product, offer: { $exists: true } });
        if (exist) {
            reject()
        } else {
            db.get().collection(collection.CATEGORY_OFFERES).insertOne(data).then(async (response) => {
                resolve(response)
            }).catch((err) => {
                reject(err)
            })
        }

    })
  }
},

startCategoryOffer: (date) => {
  let startDateIso = new Date(date);
  return new Promise(async (resolve, reject) => {
      let data = await db.get().collection(collection.CATEGORY_OFFERES).find({ startDateIso: { $lte: startDateIso } }).toArray();
      if (data.length > 0)  {
          await data.map(async (onedata) => {

              let products = await db.get().collection(collection.PRODUCT_COLLECTION).find({ category: onedata.category, offer: { $exists: false } }).toArray();

              await products.map(async (product) => {
                  let actualPrice = product.price
                  let newPrice = (((product.price) * (onedata.catOfferPercentage)) / 100)
                  newPrice = newPrice.toFixed()
                  db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: ObjectId(product._id) },
                      {
                          $set: {
                              actualPrice: actualPrice,
                              price: (actualPrice - newPrice),
                              offer: true,
                              catOfferPercentage: onedata.catOfferPercentage
                          }
                      })
              })
          })
          resolve();
      } else {
          resolve();
      }
  })
},

getCatOfferDetails:(catOfferId)=>{
  return new Promise(async(resolve, reject) => {
  let catOfferDetails=await db.get().collection(collection.CATEGORY_OFFERES).findOne({_id:ObjectId(catOfferId)})
resolve(catOfferDetails)    
  })

},

editCatOffer:(catOfferId,data)=>{
  return new Promise((resolve, reject) => {
    db.get().collection(collection.CATEGORY_OFFERES).updateOne({_id:ObjectId(catOfferId)},{
      $set:{
        category:data.category,
        starting:data.starting,
        expiry:data.expiry,
        catOfferPercentage:parseInt(data.catOfferPercentage),
        startDateIso:new Date(data.starting),
        endDateIso:new Date(data.expiry)

      }
    }).then(()=>{
      resolve()

    })
    
  })
},

deleteCatOffer:(catOfferId)=>{
  return new Promise(async(resolve, reject) => {
    let catOffer=await db.get().collection(collection.CATEGORY_OFFERES).findOne({_id:ObjectId(catOfferId)})
    let category=catOffer.category
    let products=await db.get().collection(collection.PRODUCT_COLLECTION).find({category:category,offer:{$exists:true}}).toArray()
    
    if(products){
      
      db.get().collection(collection.CATEGORY_OFFERES).deleteOne({_id:ObjectId(catOfferId)}).then(async()=>{
          await products.map(async(product)=>{
            try{
            
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:ObjectId(product._id)},{
              $set:{
                price:product.actualPrice
              },
              $unset:{
                offer: "",
                catOfferPercentage: "",
                actualPrice: "",
              }
            }).then(()=>{
              resolve()
            })
          }catch{
            resolve()
          }

          })

          
      })
    }else{
      resolve()
    }
  })
}



};

