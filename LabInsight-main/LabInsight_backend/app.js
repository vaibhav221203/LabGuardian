const express = require('express');
const mongoose = require('mongoose');
const processDetailsRoutes = require('./routes/processDetailsRoutes');
const connectedDevicesRoutes = require('./routes/connectedDevicesRoutes');
const networkDetailsRoutes = require('./routes/networkDetailsRoutes');
require('dotenv').config();

const app = express();
app.use(express.json());

const corsOptions = {
  origin: true, // Allow requests from any origin
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: 'Content-Type, Authorization', // Add any other headers you need
  preflightContinue: false,
  optionsSuccessStatus: 204
};

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.use('/api', processDetailsRoutes);
app.use('/api', connectedDevicesRoutes);
app.use('/api', networkDetailsRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
