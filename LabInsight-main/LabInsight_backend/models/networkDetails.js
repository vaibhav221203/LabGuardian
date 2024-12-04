const mongoose = require('mongoose');

const networkDetailSchema = new mongoose.Schema({
    sourceIp: String,
    sourcePort: String,
    sourceDomain: String,
    destinationIp: String,
    destinationPort: String,
    destinationDomain: String,
    protocol: String,
    ip: String,
});

module.exports = mongoose.model('NetworkDetail', networkDetailSchema, 'networkdetails');
