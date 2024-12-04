const NetworkDetails = require('../models/NetworkDetails');

exports.saveNetworkDetails = async (req, res) => {
  try {
    const data = req.body;
    const { source_ip } = data;
    const collectionName = `network_details___${source_ip}`;
    const NetworkDetailsModel = mongoose.model(collectionName, NetworkDetails.schema, collectionName);

    const documentCount = await NetworkDetailsModel.countDocuments();
    if (documentCount >= 100) {
      await NetworkDetailsModel.findOneAndDelete({}, { sort: { createdAt: 1 } });
    }

    const networkDetails = new NetworkDetailsModel(data);
    await networkDetails.save();

    res.status(200).send('Data stored successfully.');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

exports.getNetworkDetails = async (req, res) => {
  try {
    const { source_ip } = req.params;
    const collectionName = `network_details___${source_ip}`;
    const NetworkDetailsModel = mongoose.model(collectionName, NetworkDetails.schema, collectionName);

    const networkDetails = await NetworkDetailsModel.find();
    res.status(200).json(networkDetails);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};
