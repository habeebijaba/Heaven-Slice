const dotenv = require('dotenv');
const { response } = require('express');
dotenv.config();

const config = {
    serviceSID: process.env.SERVICE_SID,
    accountSID: process.env.ACCOUNT_SID,
    authToken: process.env.AUTH_TOKEN
  };
const client = require('twilio')(config.accountSID, config.authToken)

module.exports={
    getOtp:(phone)=>{
        
        phone="+91"+phone
        return new Promise((resolve,reject)=>{
            client.verify.services(config.serviceSID).verifications.create({
                to:phone,
                channel:"sms"
            }).then((response)=>{
                 console.log(response);
                 console.log('success');
                resolve()

            }).catch((e)=>{
                 console.log(e);
                 console.log('failed');
                reject()

            })
            
        })
    },

    verifyOtp:(phone,otp)=>{
        return new Promise((resolve,reject)=>{
        phone="+91"+phone
            client.verify.services(config.serviceSID).verificationChecks.create({
                to:phone,
                code:otp
                
            }).then((response)=>{
                let valid=response.valid
                if(valid){
                console.log('success');
                resolve({status:true})
            }else{
                resolve({status:false})
            }
            }).catch((e)=>{
                console.log(e);
                console.log('failed');
                reject()
            })
        })
    }


}




