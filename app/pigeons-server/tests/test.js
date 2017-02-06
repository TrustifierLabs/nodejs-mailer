'use strict';

const bunyan = require('bunyan');
const nodemailer = require('nodemailer');
const authObject = require('./good-creds.json');

// Create a SMTP transporter object
let transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
	type: 'OAuth2',
    	user: 'ahmed.masud@trustifier.com',
    	serviceClient: authObject.client_email,
    	accessUrl: "https://www.googleapis.com/oauth2/v4/token",
       	privateKey: authObject.private_key,
    },
    logger: bunyan.createLogger({
        name: 'nodemailer'
    }),
    debug: true // include SMTP traffic in the logs
}, {
    // default message fields

    // sender info
    from: 'Ahmed Masud <ahmed.masud@trustifier.com>',
    headers: {
        'X-Laziness-level': 1000 // just an example header, no need to use this
    }
});

console.log('SMTP Configured');

// Message object
let message = {

    user: 'ahmed.masud@trustifier.com',
    from: 'Ahmed Masud <ahmed.masud@trustifier.com>',
    // Comma separated list of recipients
    to: 'Ahmed Masud <ahmed.masud@trustifier.com>',

    // Subject of the message
    subject: 'Nodemailer is unicode friendly ✔ #', //

    // plaintext body
    text: 'Hello to myself!',

    // HTML body
    html: '<p><b>Hello</b> to myself <img src="cid:note@example.com"/></p>' +
        '<p>Here\'s a nyan cat for you as an embedded attachment:<br/><img src="cid:nyan@example.com"/></p>',

    // Apple Watch specific HTML body
    watchHtml: '<b>Hello</b> to myself',

    // An array of attachments
    attachments: [

        // Binary Buffer attachment
        {
            filename: 'image.png',
            content: new Buffer('iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQMAAAAlPW0iAAAABlBMVEUAAAD/' +
                '//+l2Z/dAAAAM0lEQVR4nGP4/5/h/1+G/58ZDrAz3D/McH8yw83NDDeNGe4U' +
                'g9C9zwz3gVLMDA/A6P9/AFGGFyjOXZtQAAAAAElFTkSuQmCC', 'base64'),

            cid: 'ahmed.masud-alsdkflasdjfkljal@trustifier.com' // should be as unique as possible
        },

    ]
};

console.log('Sending Mail');
transporter.sendMail(message, (error, info) => {
    if (error) {
        console.log('Error occurred');
        console.log(error.message);
        return;
    }
    console.log('Message sent successfully!');
    console.log('Server responded with "%s"', info.response);
    transporter.close();
});

