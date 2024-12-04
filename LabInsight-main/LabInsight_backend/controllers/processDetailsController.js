const ProcessDetails = require('../models/ProcessDetails');
const fs = require('fs/promises');
const path = require('path');

exports.uploadProcessDetails = async (req, res) => {
  try {
    const ipAddress = req.ip.replace(/:/g, '_');
    const ProcessDetailsModel = mongoose.model(`ProcessDetails_${ipAddress}`, ProcessDetails.schema);

    const fileContent = await readTextFile(path.join(__dirname, '..', 'uploads', ipAddress, 'process_details.txt'));
    const processDetailsArray = parseProcessDetails(fileContent);

    await ProcessDetailsModel.deleteMany({});
    await ProcessDetailsModel.insertMany(processDetailsArray);
    await deleteFile(path.join(__dirname, '..', 'uploads', ipAddress, 'process_details.txt'));

    res.status(200).send('File uploaded, process details saved to MongoDB, and file deleted.');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

exports.getProcessDetails = async (req, res) => {
  try {
    const ipAddress = req.ip.replace(/:/g, '_');
    const ProcessDetailsModel = mongoose.model(`ProcessDetails_${ipAddress}`, ProcessDetails.schema);

    const processDetails = await ProcessDetailsModel.find();
    res.status(200).json(processDetails);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

// Helper functions (move these to a utility file if needed)
function readTextFile(filePath) {
  return fs.readFile(filePath, 'utf8');
}

function parseProcessDetails(content) {
  // Parsing logic here...
}
