var db = require('../configurations/connection');
var bcrypt = require('bcrypt');
var collection = require('../configurations/collections');
const { Collection } = require('mongodb');
//const { response } = require('express');
var objectId = require('mongodb').ObjectId
const moment=require('moment')

module.exports = {

    getAllUsers: () => {
        return new Promise(async (resolve, reject) => {
            let allUsers = await db.get().collection(collection.USER_COLLECTION).find().sort({ $natural: -1 }).toArray()
            resolve(allUsers)
        })
    },

    blockUser: (id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(id) }, {
                $set: {
                    isBlocked: true
                }
            }).then((response) => {
                resolve(response)
            })
        })
    },

    unBlockUser: (id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(id) }, {
                $set: {
                    isBlocked: false
                }
            }).then((response) => {
                resolve(response)
            })
        })
    },

    monthlyReport: () => {
        return new Promise(async (resolve, reject) => {
            
            let start=new Date(new Date()-1000*60*60*24*30)
            let end = new Date()

            let orderSuccess = await db.get().collection(collection.ORDER_COLLECTION).find({ date: { $gte: start, $lte: end }, status: { $nin: ['cancelled'] } }).sort({ Date: -1, Time: -1 }).toArray()
            var i;
            for(i=0;i<orderSuccess.length;i++){
                orderSuccess[i].date=moment(orderSuccess[i].date).format('lll')
            }
            
            let orderTotal = await db.get().collection(collection.ORDER_COLLECTION).find({ date: { $gte: start, $lte: end } }).toArray()
            let orderSuccessLength = orderSuccess.length
            let orderTotalLength = orderTotal.length
            let orderFailLength = orderTotalLength - orderSuccessLength
            let total = 0
            let discount=0
            let razorpay = 0
            let cod = 0
            let paypal = 0
            let wallet=0
            
            for (let i = 0; i < orderSuccessLength; i++) {
                total = total + orderSuccess[i].totalAmount
                if (orderSuccess[i].paymentMethod === 'COD') {
                    cod++
                } else if (orderSuccess[i].paymentMethod === 'paypal') {
                    paypal++
                }else if (orderSuccess[i].paymentMethod === 'razorpay') {
                    razorpay++
                }
                 else {
                    wallet++
                }
                 if (orderSuccess[i].discount) {
                    
                    discount = discount + parseInt(orderSuccess[i].discount)
                    discount++
                }
            }

            let productCount=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match:{
                       $and:[{status:{$nin:["cancelled"]}
                    },
                { date: { $gte: start, $lte: end }}]

                    },
                    
                },
                {
                    $project:{
                        _id:0,
                        quantity:'$products.products.quantity'
                        
                    }
                },
                {
                    $unwind:'$quantity'
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum:'$quantity' }  
                    }   
                }
              ]).toArray()
            
            var data = {
                start: moment(start).format('YYYY/MM/DD'),
                end: moment(end).format('YYYY/MM/DD'),
                totalOrders: orderTotalLength,
                successOrders: orderSuccessLength,
                failOrders: orderFailLength,
                totalSales: total,
                cod: cod,
                paypal: paypal,
                razorpay: razorpay,
                wallet:wallet,
                discount:discount,
                productCount:productCount[0].total,
               
                currentOrders: orderSuccess
            }
            resolve(data)
      })
     },

     getReport: (startDate,endDate) => {
        return new Promise(async (resolve, reject) => {
            let start=new Date(startDate)
            let end = new Date(endDate)
            let orderSuccess = await db.get().collection(collection.ORDER_COLLECTION).find({ date: { $gte: start, $lte: end }, status: { $nin: ['cancelled'] } }).sort({ Date: -1, Time: -1 }).toArray()

            let orderTotal = await db.get().collection(collection.ORDER_COLLECTION).find({ date: { $gte: start, $lte: end } }).toArray()
            let orderSuccessLength = orderSuccess.length
            let orderTotalLength = orderTotal.length
            let orderFailLength = orderTotalLength - orderSuccessLength
            let total = 0
            let discount=0
            let razorpay = 0
            let cod = 0
            let paypal = 0
            let wallet=0
            let productCount=0
            for (let i = 0; i < orderSuccessLength; i++) {
                total = total + orderSuccess[i].totalAmount
                if (orderSuccess[i].paymentMethod === 'COD') {
                    cod++
                } else if (orderSuccess[i].paymentMethod === 'paypal') {
                    paypal++
                }else if (orderSuccess[i].paymentMethod === 'razorpay') {
                    razorpay++
                }
                 else {
                    wallet++
                }
                 if (orderSuccess[i].discount) {
                
                    discount = discount + parseInt(orderSuccess[i].discount)
                    discount++
                }
            }


try{
             productCount=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match:{
                       $and:[{status:{$nin:["cancelled"]}
                    },
                { date: { $gte: start, $lte: end }}]

                    },
                    
                },
                {
                    $project:{
                        _id:0,
                        quantity:'$products.products.quantity'
                        
                    }
                },
                {
                    $unwind:'$quantity'
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum:'$quantity' }
                    }
                }
              ]).toArray()
              
            var data = {
                start: moment(start).format('YYYY/MM/DD'),
                end: moment(end).format('YYYY/MM/DD'),
                totalOrders: orderTotalLength,
                successOrders: orderSuccessLength,
                failOrders: orderFailLength,
                totalSales: total,
                cod: cod,
                paypal: paypal,
                razorpay: razorpay,
                wallet:wallet,
                discount:discount,
                productCount:productCount[0].total,
                
               
                currentOrders: orderSuccess
            }
            resolve(data)
        }catch{
            resolve(data)
        }
      })
     },

     dailyReport:()=>{
        return new Promise(async(resolve, reject) => {
            
            let start=new Date(new Date()-1000*60*60*24)
            let end = new Date()
            let orderSuccess = await db.get().collection(collection.ORDER_COLLECTION).find({ date: { $gte: start, $lte: end }, status: { $nin: ['cancelled'] } }).sort({ Date: -1, Time: -1 }).toArray()
            
            let orderTotal = await db.get().collection(collection.ORDER_COLLECTION).find({ date: { $gte: start, $lte: end } }).toArray()
            let orderSuccessLength = orderSuccess.length
            let orderTotalLength = orderTotal.length
            let orderFailLength = orderTotalLength - orderSuccessLength
            let total = 0
            let discount=0
            let razorpay = 0
            let cod = 0
            let paypal = 0
            let wallet=0
            let productCount=0
            for (let i = 0; i < orderSuccessLength; i++) {
                total = total + orderSuccess[i].totalAmount
                if (orderSuccess[i].paymentMethod === 'COD') {
                    cod++
                } else if (orderSuccess[i].paymentMethod === 'paypal') {
                    paypal++
                }else if (orderSuccess[i].paymentMethod === 'razorpay') {
                    razorpay++
                }
                 else {
                    wallet++
                }
                 if (orderSuccess[i].discount) {
                
                    discount = discount + parseInt(orderSuccess[i].discount)
                    discount++
                }
            }


try{
            productCount=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match:{
                       $and:[{status:{$nin:["cancelled"]}
                    },
                { date: { $gte: start, $lte: end }}]

                    },
                    
                },
                {
                    $project:{
                        _id:0,
                        quantity:'$products.products.quantity'
                        
                    }
                },
                {
                    $unwind:'$quantity'
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum:'$quantity', }
                    }
                }
              ]).toArray()

            var data = {
                start: moment(start).format('YYYY/MM/DD'),
                end: moment(end).format('YYYY/MM/DD'),
                totalOrders: orderTotalLength,
                successOrders: orderSuccessLength,
                failOrders: orderFailLength,
                totalSales: total,
                cod: cod,
                paypal: paypal,
                razorpay: razorpay,
                wallet:wallet,
                discount:discount,
                productCount:productCount[0].total,
                averageRevenue:total/productCount[0].total,

                currentOrders: orderSuccess
            }
            resolve(data)
        }catch{
            resolve(data)
        }
        })
     },

     weeklyReport:()=>{
        return new Promise(async(resolve, reject) => {
            
            let start=new Date(new Date()-1000*60*60*24*7)
            let end = new Date()
            let orderSuccess = await db.get().collection(collection.ORDER_COLLECTION).find({ date: { $gte: start, $lte: end }, status: { $nin: ['cancelled'] } }).sort({ Date: -1, Time: -1 }).toArray()
            let orderTotal = await db.get().collection(collection.ORDER_COLLECTION).find({ date: { $gte: start, $lte: end } }).toArray()
            let orderSuccessLength = orderSuccess.length
            let orderTotalLength = orderTotal.length
            let orderFailLength = orderTotalLength - orderSuccessLength
            let total = 0
            let discount=0
            let razorpay = 0
            let cod = 0
            let paypal = 0
            let wallet=0
            let productCount=0
            for (let i = 0; i < orderSuccessLength; i++) {
                total = total + orderSuccess[i].totalAmount
                if (orderSuccess[i].paymentMethod === 'COD') {
                    cod++
                } else if (orderSuccess[i].paymentMethod === 'paypal') {
                    paypal++
                }else if (orderSuccess[i].paymentMethod === 'razorpay') {
                    razorpay++
                }
                 else {
                    wallet++
                }
                 if (orderSuccess[i].discount) {
                
                    discount = discount + parseInt(orderSuccess[i].discount)
                    discount++
                }
            }

            productCount=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match:{
                       $and:[{status:{$nin:["cancelled"]}
                    },
                { date: { $gte: start, $lte: end }}]

                    },
                    
                },
                {
                    $project:{
                        _id:0,
                        quantity:'$products.products.quantity'
                        
                    }
                },
                {
                    $unwind:'$quantity'
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum:'$quantity' }
                    }
                }
              ]).toArray()

            var data = {
                start: moment(start).format('YYYY/MM/DD'),
                end: moment(end).format('YYYY/MM/DD'),
                totalOrders: orderTotalLength,
                successOrders: orderSuccessLength,
                failOrders: orderFailLength,
                totalSales: total,
                cod: cod,
                paypal: paypal,
                razorpay: razorpay,
                wallet:wallet,
                discount:discount,
                productCount:productCount[0].total,
                averageRevenue:total/productCount[0].total,
                
                currentOrders: orderSuccess
            }
            resolve(data)
        })
     },

     yearlyReport:()=>{
        return new Promise(async(resolve, reject) => {
            
            let start=new Date(new Date()-1000*60*60*24*365)

            let end = new Date()
            let orderSuccess = await db.get().collection(collection.ORDER_COLLECTION).find({ date: { $gte: start, $lte: end }, status: { $nin: ['cancelled'] } }).sort({ Date: -1, Time: -1 }).toArray()
            let orderTotal = await db.get().collection(collection.ORDER_COLLECTION).find({ date: { $gte: start, $lte: end } }).toArray()
            let orderSuccessLength = orderSuccess.length
            let orderTotalLength = orderTotal.length
            let orderFailLength = orderTotalLength - orderSuccessLength
            let total = 0
            let discount=0
            let razorpay = 0
            let cod = 0
            let paypal = 0
            let wallet=0
            let productCount=0
            for (let i = 0; i < orderSuccessLength; i++) {
                total = total + orderSuccess[i].totalAmount
                if (orderSuccess[i].paymentMethod === 'COD') {
                    cod++
                } else if (orderSuccess[i].paymentMethod === 'paypal') {
                    paypal++
                }else if (orderSuccess[i].paymentMethod === 'razorpay') {
                    razorpay++
                }
                 else {
                    wallet++
                }
                 if (orderSuccess[i].discount) {
                
                    discount = discount + parseInt(orderSuccess[i].discount)
                    discount++
                }
            }

            productCount=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match:{
                       $and:[{status:{$nin:["cancelled"]}
                    },
                { date: { $gte: start, $lte: end }}]

                    },
                    
                },
                {
                    $project:{
                        _id:0,
                        quantity:'$products.products.quantity'
                        
                    }
                },
                {
                    $unwind:'$quantity'
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum:'$quantity' }
                    }
                }
              ]).toArray()

            var data = {
                start: moment(start).format('YYYY/MM/DD'),
                end: moment(end).format('YYYY/MM/DD'),
                totalOrders: orderTotalLength,
                successOrders: orderSuccessLength,
                failOrders: orderFailLength,
                totalSales: total,
                cod: cod,
                paypal: paypal,
                razorpay: razorpay,
                wallet:wallet,
                discount:discount,
                productCount:productCount[0].total,

                averageRevenue:total/productCount[0].total,

                currentOrders: orderSuccess
            }
           
            resolve(data)
        })
     }


}