const express = require('express');
const router = express.Router();
const multer = require('multer');
const deviceController = require('../controllers/connectedDevicesController');
const path = require('path');
const fs = require('fs/promises');

const uploadConnectedDevices = multer({
  storage: multer.diskStorage({
    destination: async function (req, file, cb) {
      const ipAddress = req.ip.replace(/:/g, '_');
      const folderPath = path.join(__dirname, '..', 'connected_devices', ipAddress);
      await fs.mkdir(folderPath, { recursive: true });
      cb(null, folderPath);
    },
    filename: function (req, file, cb) {
      cb(null, 'connected_devices.txt');
    },
  }),
});

router.post('/connected_devices', uploadConnectedDevices.single('file'), deviceController.uploadConnectedDevices);
router.get('/connected_devices', deviceController.getConnectedDevices);

module.exports = router;
