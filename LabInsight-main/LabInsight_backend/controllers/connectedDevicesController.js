const ConnectedDevices = require('../models/ConnectedDevices');
const fs = require('fs/promises');
const path = require('path');

exports.uploadConnectedDevices = async (req, res) => {
  try {
    const ipAddress = req.ip.replace(/:/g, '_');
    const ConnectedDevicesModel = mongoose.model(`ConnectedDevices_${ipAddress}`, ConnectedDevices.schema);

    const filePath = path.join(__dirname, '..', 'connected_devices', ipAddress, 'connected_devices.txt');
    const fileContent = await readTextFile(filePath);
    const connectedDevicesArray = parseConnectedDevices(fileContent);

    const secondaryDevices = connectedDevicesArray.filter(item => item.deviceType === 'Secondary Storage');
    if (secondaryDevices.length > 0) {
      res.status(200).json({ message: 'Secondary device detected', ipAddress });
    } else {
      res.status(200).json({ message: 'No secondary device detected', ipAddress });
    }

    await ConnectedDevicesModel.deleteMany({});
    await ConnectedDevicesModel.insertMany(connectedDevicesArray);
    await deleteFile(filePath);
  } catch (error) {
    console.error(error);
    if (error.name === 'ValidationError') {
      res.status(400).send('Validation Error: ' + error.message);
    } else {
      res.status(500).send('Internal Server Error');
    }
  }
};

exports.getConnectedDevices = async (req, res) => {
  try {
    const ipAddress = req.ip.replace(/:/g, '_');
    const ConnectedDevicesModel = mongoose.model(`ConnectedDevices_${ipAddress}`, ConnectedDevices.schema);

    const connectedDevices = await ConnectedDevicesModel.find();
    res.status(200).json(connectedDevices);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

// Helper functions (move these to a utility file if needed)
function readTextFile(filePath) {
  return fs.readFile(filePath, 'utf8');
}

function parseConnectedDevices(content) {
  // Parsing logic here...
}
