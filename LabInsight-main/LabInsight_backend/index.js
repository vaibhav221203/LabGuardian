const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs/promises');
const cors = require('cors');
const { toast } = require('react-toastify');

const app = express();
const port = 4141;
const HOST = '0.0.0.0';
// Middleware to parse JSON bodies
app.use(express.json());
app.use(cors());


mongoose.connect('mongodb://0.0.0.0:27017/wtl', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const ProcessDetailsSchema = new mongoose.Schema({
  PID: Number,
  Name: String,
  Username: String,
  'CPU Percent': Number,
  'Memory Usage (MB)': Number,
});

const ConnectedDevicesSchema = new mongoose.Schema({
  deviceType: { type: String },
  deviceName: { type: String },
  macAddress: { type: String },
  signalStrength: { type: Number },
  mountPoint: { type: String },
});


// Define the MongoDB model for network details
const NetworkDetailsSchema = new mongoose.Schema({
  source_ip: String,
  source_port: String,
  source_domain: String,
  destination_ip: String,
  destination_port: String,
  destination_domain: String,
  protocol: String,
  timestamp: { type: Date, default: Date.now }
});

const uploadProcessDetails = multer({
  storage: multer.diskStorage({
    destination: async function (req, file, cb) {
      const ipAddress = req.ip.replace(/:/g, '_');
      const folderPath = path.join(__dirname, 'uploads', ipAddress);
      await fs.mkdir(folderPath, { recursive: true });
      cb(null, folderPath);
    },
    filename: function (req, file, cb) {
      cb(null, 'process_details.txt');
    },
  }),
});

const uploadConnectedDevices = multer({
  storage: multer.diskStorage({
    destination: async function (req, file, cb) {
      const ipAddress = req.ip.replace(/:/g, '_');
      const folderPath = path.join(__dirname, 'connected_devices', ipAddress);
      await fs.mkdir(folderPath, { recursive: true });
      cb(null, folderPath);
    },
    filename: function (req, file, cb) {
      cb(null, 'connected_devices.txt');
    },
  }),
});

function readTextFile(filePath) {
  return fs.readFile(filePath, 'utf8');
}

function parseProcessDetails(content) {
  const lines = content.split('\n');
  const header = lines[0].split('\t');

  return lines.slice(1).map(line => {
    const values = line.split('\t');
    const processDetail = {};

    for (let i = 0; i < header.length; i++) {
      const fieldName = header[i].trim();
      const value = i < values.length ? values[i].trim() : '';

      switch (fieldName) {
        case 'PID':
          processDetail['PID'] = isNaN(Number(value)) ? value : Number(value);
          break;
        case 'Name':
          processDetail['Name'] = value;
          break;
        case 'Username':
          processDetail['Username'] = value;
          break;
        case 'CPU Percent':
          processDetail['CPU Percent'] = isNaN(Number(value)) ? value : Number(value);
          break;
        case 'Memory Usage (MB)':
          processDetail['Memory Usage (MB)'] = isNaN(Number(value)) ? value : Number(value);
          break;
        default:
          break;
      }
    }

    return processDetail;
  }).filter(process => process['Name'] && process['PID']);
}

function parseConnectedDevices(content) {
  const lines = content.split('\n');
  const header = lines[0].split('\t');

  return lines.slice(1).map(line => {
    const values = line.split('\t');
    const connectedDevice = {};

    for (let i = 0; i < header.length; i++) {
      const fieldName = header[i].trim();
      const value = i < values.length ? values[i].trim() : '';

      switch (fieldName) {
        case 'Device Type':
        case 'DeviceName':
          connectedDevice['deviceType'] = value || NaN;
          break;
        case 'Device Name':
          connectedDevice['deviceName'] = value || NaN;
          break;
        case 'MAC Address':
          connectedDevice['macAddress'] = value || NaN;
          break;
        case 'Signal Strength':
          connectedDevice['signalStrength'] = isNaN(Number(value)) ? NaN : Number(value);
          break;
        default:
          break;
      }
    }

    connectedDevice['mountPoint'] = connectedDevice['deviceType'] === 'Secondary Storage' ? connectedDevice['deviceName'] : '';

    return connectedDevice;
  });
}

app.post('/process_details', uploadProcessDetails.single('file'), async (req, res) => {
  try {
    const ipAddress = req.ip.replace(/:/g, '_');
    const ProcessDetails = mongoose.model(`ProcessDetails_${ipAddress}`, ProcessDetailsSchema);

    const fileContent = await readTextFile(path.join(__dirname, 'uploads', ipAddress, 'process_details.txt'));
    const processDetailsArray = parseProcessDetails(fileContent);

    await ProcessDetails.deleteMany({});
    await ProcessDetails.insertMany(processDetailsArray);
    await deleteFile(path.join(__dirname, 'uploads', ipAddress, 'process_details.txt'));

    res.status(200).send(`File uploaded, process details saved to MongoDB, and file deleted.`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/connected_devices', uploadConnectedDevices.single('file'), async (req, res) => {
  try {
    const ipAddress = req.ip.replace(/:/g, '_');
    const ConnectedDevices = mongoose.model(`ConnectedDevices_${ipAddress}`, ConnectedDevicesSchema);

    const filePath = path.join(__dirname, 'connected_devices', ipAddress, 'connected_devices.txt');
    const fileContent = await readTextFile(filePath);
    const connectedDevicesArray = parseConnectedDevices(fileContent);
    // console.log(connectedDevicesArray);
    

    // Check if any secondary devices are detected
    const secondaryDevices = connectedDevicesArray.filter(item => item.deviceType === 'Secondary Storage');
    if (secondaryDevices.length > 0) {
      // Send a response indicating secondary device detection
      res.status(200).json({ message: 'Secondary device detected', ipAddress });
    } else {
      // res.status(200).send(`File uploaded, connected devices details saved to MongoDB, and file deleted.`);
      res.status(200).json({ message: 'Secondary device detected', ipAddress });

    }
    await ConnectedDevices.deleteMany({});
    await ConnectedDevices.insertMany(connectedDevicesArray);
    await deleteFile(filePath);
  } catch (error) {
    console.error(error);
    
    if (error.name === 'ValidationError') {
      res.status(400).send('Validation Error: ' + error.message);
    } else {
      res.status(500).send('Internal Server Error');
    }
  }
});



app.post('/network_details', async (req, res) => {
  try {
    const data = req.body;
    const { source_ip } = data;

    // Create a collection with the name 'network_details_ipaddress'
    const collectionName = `network_details___${source_ip}`;
    const NetworkDetails = mongoose.model(collectionName, NetworkDetailsSchema, collectionName);

    // Get the document count in the collection
    const documentCount = await NetworkDetails.countDocuments();

    // If there are already 100 documents, remove the oldest one
    if (documentCount >= 100) {
      const oldestDocument = await NetworkDetails.findOneAndDelete({}, { sort: { createdAt: 1 } });
      // console.log(`Oldest document removed: ${JSON.stringify(oldestDocument)}`);
    }

    // Save data to the corresponding collection
    const networkDetails = new NetworkDetails(data);
    await networkDetails.save();

    res.status(200).send('Data stored successfully.');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});


async function deleteFile(filePath) {
  await fs.unlink(filePath);
}

// -------------------------------------------------------------
// Define a function to create models dynamically
function createModel(collectionName, schema) {
  return mongoose.models[collectionName] || mongoose.model(collectionName, schema);
}

// Route handler for fetching collections and data
// app.get('/collections', async (req, res) => {
//   try {
//     // Get all collection names from the MongoDB database
//     const collections = await mongoose.connection.db.listCollections().toArray();

//     // Fetch data from each collection
//     const dataPromises = collections.map(async collection => {
//       const collectionName = collection.name;
//       const Model = createModel(collectionName, ProcessDetailsSchema); // Use predefined schema
//       const data = await Model.find({});
//       return { collection: collectionName, data };
//     });

//     // Wait for all data to be fetched
//     const collectionsWithData = await Promise.all(dataPromises);

//     // Send the collection names and data as a response
//     res.status(200).json({ collections: collectionsWithData });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send('Internal Server Error');
//   }
// });

app.get('/ips', async (req, res) => {
  try {
    // Get all collection names
    const collections = mongoose.connection.db.collections();

    let allIPs = [];

    // Extract IP addresses from collection names
    for (let collection of await collections) {
      const collectionName = collection.collectionName;

      // Extract IP address from collection name
      // const ipAddress = collectionName.split('___').pop();
      
      const matchResult = collectionName.match(/\d+\.\d+\.\d+\.\d+/);
      const ipAddress = matchResult ? matchResult[0] : null;
       
      allIPs.push(ipAddress);

    }

    // Remove duplicate IP addresses
    allIPs = [...new Set(allIPs)];

    res.json(allIPs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/network_details/:ipAddress', async (req, res) => {
  try {
    const ipAddress = req.params.ipAddress;
    const collectionName = `network_details___${ipAddress}`;
    const NetworkDetails = mongoose.model(collectionName, NetworkDetailsSchema, collectionName);
    
    // Fetch network details data for the specified IP address
    const networkDetails = await NetworkDetails.find({});
    
    res.status(200).json(networkDetails);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.get('/process_details/:ipAddress', async (req, res) => {
  try {
    const ipAddress = req.params.ipAddress;
    const collectionName = `processdetails___ffff_${ipAddress}`;
    
    const ProcessDetails = mongoose.model(collectionName, ProcessDetailsSchema, collectionName);
    
    // Fetch network details data for the specified IP address
    const processDetails = await ProcessDetails.find({});
    
    res.status(200).json(processDetails);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.get('/connected_devices/:ipAddress', async (req, res) => {
  try {
    const ipAddress = req.params.ipAddress;
    const collectionName = `connecteddevices___ffff_${ipAddress}`;
    
    const ConnectedDevices = mongoose.model(collectionName, ConnectedDevicesSchema, collectionName);
    
    // Fetch network details data for the specified IP address
    const connectedDevices = await ConnectedDevices.find({});
    
    res.status(200).json(connectedDevices);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.get('/check_secondary_device', async (req, res) => {
  try {
    // Get all collection names from the MongoDB database
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    // Initialize an array to hold IP addresses with secondary devices
    const secondaryDevicesIPs = [];
    
    // Iterate through all collections
    for (const collection of collections) {
      // Check if the collection name starts with "connecteddevices"
      if (collection.name.startsWith('connecteddevices')) {
        const CollectionModel = mongoose.model(collection.name, ConnectedDevicesSchema, collection.name);
        
        // Check if any document in the collection has deviceType equal to "Secondary Storage"
        const secondaryDevice = await CollectionModel.findOne({ deviceType: "Secondary Storage" });
        
        // If a secondary device is found, store its IP address
        if (secondaryDevice) {
          const ipAddress = collection.name.split('___').pop();
          secondaryDevicesIPs.push(ipAddress);
        }
      }
    }

    // If no secondary devices are found
    if (secondaryDevicesIPs.length === 0) {
      return res.status(200).json({ message: "No secondary devices detected", secondaryDevicesIPs });
    }

    // If secondary devices are found, send the list of IP addresses
    return res.status(200).json({ message: "Secondary devices detected", secondaryDevicesIPs });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});




app.listen(port,HOST, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
