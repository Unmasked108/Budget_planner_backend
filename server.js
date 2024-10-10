const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { authMiddleware } = require('./middleware/authMiddleware');
const app = express();
const port = 3000;
const userRoutes = require('./routes/userRoutes');
require('dotenv').config();

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/your-db-name')
  .then(() => {
    console.log('MongoDB connected');
  })
  .catch((error) => console.log('MongoDB connection error:', error));

// Define routes
app.use('/api/users', userRoutes);
app.use('/api/income', require('./routes/income'));

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
