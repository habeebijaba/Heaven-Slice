var db = require('../configurations/connection');
var bcrypt = require('bcrypt');
var collection = require('../configurations/collections');
const { Collection } = require('mongodb');
//const { response } = require('express');
var objectId = require('mongodb').ObjectId

module.exports = {
    addBanner:(data)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.BANNER_COLLECTION).insertOne(data).then((response)=>{
                resolve(response)
            })
        })
    },

    getAllBanner:()=>{
        return new Promise(async(resolve, reject) => {
            let allBanners=await db.get().collection(collection.BANNER_COLLECTION).find().sort({ $natural: -1 }).toArray()
            resolve(allBanners)
        })
    },

    getBanner:(banId)=>{
        return new Promise(async(resolve, reject) => {
           let banner=await db.get().collection(collection.BANNER_COLLECTION).findOne({_id:objectId(banId)})
           resolve(banner)
        })
    },

    editBanner:(data)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.BANNER_COLLECTION).updateOne({_id:objectId(data._id)},{
                $set:{
                    name: data.name,
                    category: data.category,
                    offer: data.offer,
                    description: data.description
                }
            }).then(()=>{
                
                resolve()
            })
        })
    },

    deleteBanner:(banId)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.BANNER_COLLECTION).deleteOne({_id:objectId(banId)}).then(()=>{
                resolve()
            })
        })
    }








}