'use strict';

const fs = require('fs');
const MailQueue = require('./lib/mail-queue.js');

let mq = new MailQueue({queueDir: "./queue", sentDir: "./sent", rejectedDir: "./rejected" });

mq.start();
