const mongoose = require('mongoose');

const processDetailSchema = new mongoose.Schema({
    pid: Number,
    name: String,
    username: String,
    cpuPercent: Number,
    memoryUsageMb: Number,
    ip: String,
});

module.exports = mongoose.model('ProcessDetail', processDetailSchema, 'processdetails');
