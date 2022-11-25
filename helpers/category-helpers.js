var db = require('../configurations/connection');
var bcrypt = require('bcrypt');
var collection = require('../configurations/collections');
const { Collection } = require('mongodb');
//const { response } = require('express');
var objectId = require('mongodb').ObjectId

module.exports = {

    getAllCategories: () => {
        return new Promise(async (resolve, reject) => {
            let allCategories = await db.get().collection(collection.CATEGORY_COLLECTION).find().sort({ $natural: -1 }).toArray()
            resolve(allCategories)
        })
    },

    addCategory: (data) => {
        return new Promise(async (resolve, reject) => {
            let category = await db.get().collection(collection.CATEGORY_COLLECTION).findOne({ category: data.category })
            if (category) {
                reject()
            } else {
                db.get().collection(collection.CATEGORY_COLLECTION).insertOne(data).then((response) => {
                    resolve(response)
                })
            }
        })
    },

    deleteCategory: (id) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.CATEGORY_COLLECTION).deleteOne({ _id: objectId(id) }).then((response) => {
                resolve()
            })
        })
    },

    getCategory:(id)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORY_COLLECTION).findOne({_id:objectId(id)}).then((response)=>{
                resolve(response)
            })
        })
    },

    editCategory:(data)=>{
        let id=data.id
        return new Promise(async(resolve, reject) => {
            // let catExist=await db.get().collection(collection.CATEGORY_COLLECTION).findOne({_id:objectId(id)})
            // if(catExist){
            //     reject()
            // }else{
            db.get().collection(collection.CATEGORY_COLLECTION).updateOne({_id:objectId(id)},{
                $set:{
                    category:data.category,
                    description:data.description
                }
            }).then(()=>{
                resolve()
            })
        // }
        })
    }








}