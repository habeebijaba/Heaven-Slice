var db = require('../configurations/connection');
var bcrypt = require('bcrypt');
var collection = require('../configurations/collections');
const { Collection, ObjectId } = require('mongodb');
//const { response } = require('express');
const Razorpay=require('razorpay')
var paypal = require('paypal-rest-sdk');
const dotenv = require('dotenv');
const { resolve } = require('path');
const moment=require('moment')

dotenv.config();



var instance = new Razorpay({
    key_id: process.env.KEY_ID,
    key_secret: process.env.KEY_SECRET,
  });


  
  paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': process.env.CLIENT_ID,
    'client_secret': process.env.CLIENT_SECRET
  });


module.exports = {
    placeOrder: (order, products, total,couponCode,discount) => {
        return new Promise((resolve, reject) => {
            // console.log(order,products,total);
            console.log(order['payment-method'],);
            // let status=['payment-method']==="COD"?'placed':'pending'
            let status;
            if (order['payment-method'] === "COD"|| order['payment-method']==="paypal" || order['payment-method']==="wallet" ) {
                status = 'placed'
            } else {
                status = 'pending'
            }
            console.log(status);
            let orderObj = {
                deliveryDetails: {
                    name: order.name,
                    address: order.address,
                    town: order.town,
                    district: order.district,
                    state: order.state,
                    pincode: order.pincode,
                    phone: order.phone,
                },
                userId: ObjectId(order.userId),
                paymentMethod: order['payment-method'],
                products: products,
                totalAmount: total,
                discount:discount,
                status: status,
                date:new Date()
            }
            db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response) => {
                db.get().collection(collection.CART_COLLECTION).deleteOne({ user: ObjectId(order.userId) })


                db.get().collection(collection.COUPON_COLLECTION).updateOne({coupon:couponCode},{
                    $push:{
                        users:(order.userId)

                    }
                }).then(()=>{
                resolve(response.insertedId)

                })




            })


        })
    },

    

    getOrders:(userId)=>{
        return new Promise(async(resolve, reject) => {
            let orders=await db.get().collection(collection.ORDER_COLLECTION).find({userId:ObjectId(userId)},{sort:{date:-1}}).toArray()
            var i;
            for(i=0;i<orders.length;i++){
                orders[i].date=moment(orders[i].date).format('MMMM Do YYYY, h:mm:ss a')
            }
            resolve(orders)
        })
    },

    getOrderProducts: (orderId) => {
        return new Promise(async (resolve, reject) => {
            let orderProducts = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: { _id: ObjectId(orderId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    
                    $project: {
                        item: '$products.products.item',
                        quantity:'$products.products.quantity'
                    }
                },
                {
                    $unwind: '$item'
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
                        item: 1,quantity:1, product: { $arrayElemAt: ['$product', 0] }
                    }
                }

            ]).toArray()
            resolve(orderProducts)
        })
    },

    

    getAllOrders: () => {
        return new Promise(async(resolve, reject) => {
            let orders=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    
                        $sort:{date:-1}
                    
                }
            ]).toArray()
            var i;
            for(i=0;i<orders.length;i++){
                orders[i].date=moment(orders[i].date).format('MMMM Do YYYY, h:mm:ss a')
            }
            resolve(orders)
            
        })
    },
    

    cancelOrder: (orderId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: ObjectId(orderId) }, {
                $set: {
                    status: "cancelled",
                    isCancelled: true,
                    cancellDate:new Date()
                }
            }).then((response) => {
                resolve()

            })

        })
    },

    orderStatusChange: (status, orderId) => {
        return new Promise((resolve, reject) => {
            if (status == "cancelled") {
                db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: ObjectId(orderId) }, {
                    $set: {
                        status: status,
                        isCancelled: true,
                        cancellDate:new Date()
                    }
                }).then(() => {
                    resolve()
                })
            }else if(status=="delivered"){
                db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:ObjectId(orderId)},{
                    $set:{
                        status:status,
                        isDelivered:true,
                        deliveredDate: new Date()

                    }
                }).then((res)=>{
                    resolve()
                })

            }else if(status=="shipped"){
                db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:ObjectId(orderId)},{
                    $set:{
                        status:status,
                        isShipped:true,
                        shippedDate: new Date()

                    }
                }).then((res)=>{
                    resolve()
                })

            }else if(status=="out for delivery"){
                db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:ObjectId(orderId)},{
                    $set:{
                        status:status,
                        isOutForDelivery:true,
                        outForDeliveryDate: new Date()

                    }
                }).then((res)=>{
                    resolve()
                })

            }
             else {
                db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: ObjectId(orderId) }, {
                    $set: {
                        status: status,
                        // isCancelled: false
                    }
                }).then((response) => {
                    resolve()
                })

            }
        })
    },

    totalOrders:()=>{
        return new Promise(async(resolve, reject) => {
            let totalOrders=await db.get().collection(collection.ORDER_COLLECTION).count()
            resolve(totalOrders)
        })
    },

    generateRazorpay:(orderId,total)=>{
        return new Promise((resolve, reject) => {
            instance.orders.create({
                amount: total*100,
                currency: "INR",
                receipt: ""+orderId,
                notes: {
                  key1: "value3",
                  key2: "value2"
                }
              },(err,order)=>{
                resolve(order)
              })
             
        })
    },

    verifyPayment:(data)=>{
        return new Promise((resolve, reject) => {
            const crypto=require('crypto');
            let hmac=crypto.createHmac('sha256',process.env.KEY_SECRET)
            hmac.update(data['payment[razorpay_order_id]']+'|'+data[ 'payment[razorpay_payment_id]'])
            hmac=hmac.digest('hex')
            if(hmac==data['payment[razorpay_signature]']){
                resolve()
            }else{
                reject()
            }
        })

    },

    changePaymentStatus:(orderId)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:ObjectId(orderId)},{
                $set:{
                    status:'placed'
                }
            }).then((response)=>{
                resolve()
            })
        })
    },

    generatePaypal:(orderId,total)=>{
        return new Promise((resolve, reject) => {
            var create_payment_json = {
                "intent": "sale",
                "payer": { 
                    "payment_method": "paypal"
                },
                "redirect_urls": {
                    "return_url": "http://localhost:3000/order-successfull",
                    "cancel_url": "http://localhost:3000/place-order"
                },
                "transactions": [{
                    "item_list": {
                        "items": [{
                            "name": "item",
                            "sku": "item",
                            "price": total,
                            "currency": "USD",
                            "quantity": 1
                        }]
                    },
                    "amount": {
                        "currency": "USD",
                        "total": total
                    },
                    "description": "This is the payment description."
                }]
            };
            
            
            paypal.payment.create(create_payment_json, function (error, payment) {
                if (error) {
                    throw error;
                } else {
                    
                    resolve(payment.links[1].href)
                }
            });
        })

    },


    totalRevenue:()=>{ 
        return new Promise(async(resolve, reject) => {
            try{
          let totalRevenue=await  db.get().collection(collection.ORDER_COLLECTION).aggregate([
            {
                $match:{
                    status:"delivered"
                }
                
            },
            {
                $project:{
                    totalAmount:"$totalAmount"
                }
            },
            {
                $group:{
                    _id:null,
                    totalAmount:{$sum:'$totalAmount'}
                }
            }
        ]).toArray()
            resolve(totalRevenue[0].totalAmount)
        }catch{
            resolve(0)
        }
        })
    },

    dailyRevenue:()=>{
        return new Promise(async(resolve, reject) => {
            try{
            let dailyRevenue=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match:{
                        date:{
                            $gte:new Date(new Date()-1000*60*60*24)
                        }
                    }
                },
                {
                    $match:{
                        status:"delivered"
                    }
                    
                },
                {
                    $group:{
                        _id:null,
                        totalAmount:{$sum:'$totalAmount'}
                    }
                }
            ]).toArray()
            resolve(dailyRevenue[0].totalAmount)
        }catch{
            resolve(0)
        }
        })
    },

    totalOrderSuccess:()=>{
        return new Promise(async(resolve, reject) => {
            let totalOrderSuccess=await db.get().collection(collection.ORDER_COLLECTION).find({status:"delivered"}).count()
            resolve(totalOrderSuccess)
        })
    },

    weeklyRevenue:()=>{
        return new Promise(async(resolve, reject) => {
            try{
          let weeklyRevenue=await  db.get().collection(collection.ORDER_COLLECTION).aggregate([
            {
                $match:{
                    date:{
                        $gte:new Date(new Date()-1000*60*60*24*7)
                    }
                }
            },
            {
                $match:{
                    status:"delivered"
                }
                
            },
            {
                $group:{
                    _id:null,
                    totalAmount:{$sum:'$totalAmount'}
                }
            }
            ]).toArray()
            resolve(weeklyRevenue[0].totalAmount)
        }catch{
            resolve(0)
        }

        })
    },

    yearlyRevenue:()=>{
        return new Promise(async(resolve, reject) => {
            try{
            let yearlyRevenue=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    
                        $match:{
                            date:{
                                $gte:new Date(new Date()-1000*60*60*24*7*4*12)
                            }
                        }
                    },
                    {
                        $match:{
                            status:"delivered"
                        }
                        
                    },
                    {
                        $group:{
                            _id:null,
                            totalAmount:{$sum:'$totalAmount'}
                        }
                    }
                
            ]).toArray()
        
            resolve(yearlyRevenue[0].totalAmount)
        }catch{
            resolve(0)
        }
        })
    },


    getchartData: (req, res) =>
     {

        return new Promise((resolve, reject) => {
            
        
        db.get().collection(collection.ORDER_COLLECTION).aggregate([
          { $match: { "status": "delivered" } },
          {
            $project: {
              date: { $convert: { input: "$_id", to: "date" } }, total: "$totalAmount"
            }
          },
          {
            $match: {
              date: {
                $lt: new Date(), $gt: new Date(new Date().getTime() - (24 * 60 * 60 * 1000 * 365))
              }
            }
          },
          {
            $group: {
              _id: { $month: "$date" },
              total: { $sum: "$total" }
            }
          },
          {
            $project: {
              month: "$_id",
              total: "$total",
              _id: 0
            }
          }
        ]).toArray().then(result => {
            db.get().collection(collection.ORDER_COLLECTION).aggregate([
            { $match: { "status": "delivered" } },
            {
              $project: {
                date: { $convert: { input: "$_id", to: "date" } }, total: "$totalAmount"
              }
            },
            {
              $match: {
                date: {
                  $lt: new Date(), $gt: new Date(new Date().getTime() - (24 * 60 * 60 * 1000 * 7))
                }
              }
            },
            {
              $group: {
                _id: { $dayOfWeek: "$date" },
                total: { $sum: "$total" }
              }
            },
            {
              $project: {
                date: "$_id",
                total: "$total",
                _id: 0
              }
            },
            {
              $sort: { date: 1 }
            }
          ]).toArray().then(weeklyReport => 
            {
            let obj={
                result,weeklyReport
            }
            resolve(obj)
          })
        })

    })



      },

      getOrderDetails:(orderId)=>{
        return new Promise(async(resolve, reject) => {
            let orderDetails=await db.get().collection(collection.ORDER_COLLECTION).findOne({_id:ObjectId(orderId)})
            resolve(orderDetails)
        })
      }

      








}