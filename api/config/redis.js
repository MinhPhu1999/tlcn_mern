require('dotenv').config();
const redis = require('redis');

const client = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOSTNAME, {
    no_ready_check: true,
    auth_pass: process.env.REDIS_PASSWORD,
});

module.exports = client;
