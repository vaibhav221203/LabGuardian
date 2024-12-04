const express = require('express');
const router = express.Router();
const networkController = require('../controllers/networkDetailsController');

router.post('/network_details', networkController.saveNetworkDetails);
router.get('/network_details/:source_ip', networkController.getNetworkDetails);

module.exports = router;
