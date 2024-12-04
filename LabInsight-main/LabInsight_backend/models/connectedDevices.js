const mongoose = require('mongoose');

const connectedDeviceSchema = new mongoose.Schema({
    deviceType: String,
    deviceName: String,
    macAddress: String,
    signalStrength: Number,
    ip: String,
});

module.exports = mongoose.model('ConnectedDevice', connectedDeviceSchema, 'connecteddevices');
