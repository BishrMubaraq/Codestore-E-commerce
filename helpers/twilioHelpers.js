require('dotenv').config()
const accountSid = process.env.TWILIO_ACCOUNT_SID
const authTocken = process.env.TWILIO_AUTH_TOCKEN
const client = require('twilio')(accountSid, authTocken)
const servicesId = process.env.TWILIO_SERVICE_SID

module.exports = {
    doSms: (noData) => {
        let res = {}
        return new Promise((resolve, reject) => {
            client.verify.services(servicesId).verifications.create({
                to: `+91${noData.phone}`,
                channel: "sms"
            }).then((res) => {
                res.valid = true;
                resolve(res)
            }).catch((err) => {
                reject(err)
            })
        })
    },
    otpVerify: (otpData, nuData) => {
        let resp = {}
        return new Promise(async (resolve, reject) => {
            client.verify.services(servicesId).verificationChecks.create({
                to: `+91${nuData.phone}`,
                code: otpData.otp
            }).then((resp) => {
                resolve(resp)
            }).catch((err) => {
                reject(err)
            })
        })
    },
    forgotPasswordDoSms: (number) => {
        let res = {}
        return new Promise((resolve, reject) => {
            client.verify.services(servicesId).verifications.create({
                to: `+91${number}`,
                channel: "sms"
            }).then((res) => {
                res.valid = true;
                resolve(res)
            }).catch((err) => {
                reject(err)
            })
        })
    },
    forgotPasswordOtpVerify: (otpData, number) => {
        let resp = {}
        return new Promise(async (resolve, reject) => {
            client.verify.services(servicesId).verificationChecks.create({
                to: `+91${number}`,
                code: otpData.otp
            }).then((resp) => {
                resolve(resp)
            }).catch((err) => {
                reject(err)
            })
        })
    }
}