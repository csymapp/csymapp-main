'use strict'

const nodemailer = require('nodemailer')
, config = require(__dirname+'/../../config/config.system');



let sendEmail = async function(addresses, data, attachments) {
    let mailOptions = {}
    , transporter = nodemailer.createTransport({
        host: config.get('/mail/host'),
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: config.get('/mail/mail'),
            pass: config.get('/mail/password')
        }
    });
    // try{
    
    mailOptions = {
        from: addresses.from,
        to: addresses.to, 
        subject: data.subject, 
        html: data.content, // html body
        attachments: attachments?attachments:false
    };
    // }catch(er){console.log(er)}
    return new Promise(function(resolve, reject) {
        transporter.sendMail(mailOptions).then(function(info){
            resolve(info)
        }).catch(function(err){
            reject(err);
        });	
    });
}

module.exports = sendEmail
