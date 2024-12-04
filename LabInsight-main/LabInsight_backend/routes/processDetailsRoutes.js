const express = require('express');
const router = express.Router();
const multer = require('multer');
const processController = require('../controllers/processDetailsController');
const path = require('path');
const fs = require('fs/promises');

const uploadProcessDetails = multer({
  storage: multer.diskStorage({
    destination: async function (req, file, cb) {
      const ipAddress = req.ip.replace(/:/g, '_');
      const folderPath = path.join(__dirname, '..', 'uploads', ipAddress);
      await fs.mkdir(folderPath, { recursive: true });
      cb(null, folderPath);
    },
    filename: function (req, file, cb) {
      cb(null, 'process_details.txt');
    },
  }),
});

router.post('/upload', uploadProcessDetails.single('file'), processController.uploadProcessDetails);
router.get('/process_details', processController.getProcessDetails);

module.exports = router;
