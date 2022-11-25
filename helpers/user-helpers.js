var db = require('../configurations/connection');
var bcrypt = require('bcrypt');
var collection = require('../configurations/collections');
const { Collection, ObjectId } = require('mongodb');
//const { response } = require('express');
let referralCodeGenerator = require('referral-code-generator')

module.exports = {

    userSignUp: (data) => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ email: data.email })
            if (user) {
                reject()
            } else {
                let mobile = await db.get().collection(collection.USER_COLLECTION).findOne({ phone: data.phone })
                if (mobile) {
                    reject()
                }
                let referrel = data.referrel
                if (referrel) {
                    let referUser = await db.get().collection(collection.USER_COLLECTION).findOne({ referrelCode: referrel })
                    if (referUser) {
                        data.password = await bcrypt.hash(data.password, 10)
                        let referrelCode = data.username.slice(0, 3) + referralCodeGenerator.alpha('lowercase', 6)
                        data.referrelCode = referrelCode
                        data.wallet=parseInt(99)
                        db.get().collection(collection.USER_COLLECTION).insertOne(data).then((userdata) => {
                                if(referUser.wallet){
                                    walletAmount=parseInt(referUser.wallet)
                                    db.get().collection(collection.USER_COLLECTION).updateOne({ _id: ObjectId(referUser._id) }, {
                                        $set: {
                                            wallet: parseInt(100)+walletAmount
                                        }
                                    }).then(() => {
                                        resolve()
        
                                    })
                                }else{
                            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: ObjectId(referUser._id) }, {
                                $set: {
                                    wallet: parseInt(100)
                                }
                            }).then(() => {
                                resolve()

                            })
                        }
                        })




                    } else {
                        reject()
                    }


                } else {
                    data.password = await bcrypt.hash(data.password, 10)
                    let referrelCode = data.username.slice(0, 3) + referralCodeGenerator.alpha('lowercase', 6)
                    data.referrelCode = referrelCode
                    db.get().collection(collection.USER_COLLECTION).insertOne(data).then((userdata) => {
                        resolve()
                    })
                }
            }
        })
    },

    userLogin: (data) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).findOne({ email: data.email }).then((user) => {
                if (user) {
                    if (user.isBlocked) {
                        reject({ blockError: true })
                    } else {

                        bcrypt.compare(data.password, user.password).then((status) => {
                            if (status) {
                                resolve(user)
                            } else {
                                reject({ passwordError: true })
                            }
                        })
                    }
                } else {
                    reject({ userNameError: true })
                }
            })
        })
    },

    findUserWithPhone: (phone) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).findOne({ phone: phone }).then((response) => {
                resolve(response)
            })
        })
    },

    getUserDetails: (userId) => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: ObjectId(userId) })
            resolve(user)
        })

    },

    editProfile: (data) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: ObjectId(data._id) }, {
                $set: {
                    username: data.username,
                    email: data.email,
                    phone: data.phone
                }
            }).then((response) => {
                resolve()
            })
        })
    },

    addAddress: (address, userId) => {
       
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: ObjectId(userId) }, {
                $addToSet: {
                    address: address
                }
            }).then((response) => {
                resolve()
            })

        })
    },

    getAddress: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).findOne({ _id: ObjectId(userId) }, {
                $projection: {
                    address: 1
                }
            }).then((response) => {
                resolve(response)
            })
        })
    },

    // getAddress:(userId)=>{
    //     return new Promise(async(resolve, reject) => {
    //         let address=await db.get().collection(collection.USER_COLLECTION).aggregate([
    //         {
    //             $match:{_id:ObjectId(userId)},
    //           },
    //           {
    //             $project:{
    //                 address:'$address'
    //           }
    //         },{
    //             $project:{
    //                 address:1,_id:0
    //             }
    //         }
    //     ]).toArray()
    //     console.log(address);
    //     resolve(address)
    //     })
    // }

    changePassword: (data, userId) => {
        return new Promise(async (resolve, reject) => {
            let password = data.password
            let newpassword = data.newpassword
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: ObjectId(userId) })
            bcrypt.compare(password, user.password).then(async (status) => {
                if (status) {
                    newpassword = await bcrypt.hash(newpassword, 10)
                    db.get().collection(collection.USER_COLLECTION).updateOne({ _id: ObjectId(userId) }, {
                        $set: {
                            password: newpassword
                        }
                    }).then((response) => {
                        resolve()
                    })
                } else {
                    reject()
                }

            })
        })


    },

    deleteAddress: (userId, uniqueid) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: ObjectId(userId) }, {
                $pull: {
                    address: { uniqueid: uniqueid }
                }
            }).then((response) => {
                resolve()
            })
        })
    },

    totalUsers: () => {
        return new Promise(async (resolve, reject) => {
            let totalUsers = await db.get().collection(collection.USER_COLLECTION).count()
            resolve(totalUsers)
        })

    },

    getWalletAmount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: ObjectId(userId) })
            resolve(user.wallet)
        })
    },

    updateWallet:(userId,total)=>{
        return new Promise(async(resolve, reject) => {
            let user=await db.get().collection(collection.USER_COLLECTION).findOne({_id:ObjectId(userId)})
            let wallet=parseInt(user.wallet)
            db.get().collection(collection.USER_COLLECTION).updateOne({_id:ObjectId(userId)},{
                $set:{
                    wallet:wallet-parseInt(total)
                }
            }).then(()=>{
                resolve()
            })
        })
    },

    editAddress:(data,userId)=>{
        let uniqueid=data.uniqueid
        return new Promise(async(resolve, reject) => {
           let user=await db.get().collection(collection.USER_COLLECTION).findOne({_id:ObjectId(userId)})
           let index= user.address.findIndex(address=>address.uniqueid==uniqueid)
        db.get().collection(collection.USER_COLLECTION).updateOne({_id:ObjectId(userId),'address.uniqueid':uniqueid},{
            $set:{
                'address.$':data
            }
        }).then(()=>{
            resolve()
        })

        })
    }







}