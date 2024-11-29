const express = require('express');
const multer = require('multer');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const path = require('path');
require('dotenv').config();
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User, FishCatch } = require('./database'); // Make sure this path is correct
// Create a new directory synchronously
const newFolderPath = path.join(__dirname, 'uploads');

try {
  fs.mkdirSync(newFolderPath, { recursive: true });
  console.log('Folder created successfully');
} catch (err) {
  console.error('Error creating folder:', err);
}

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  credentials: true
}));

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_CONNECTION, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage });

app.get('/get-all-fish-catches', async (req, res) => {
  const { query, username } = req.query;

  const filter = {};

  if (query) {
    const parsedRarity = parseFloat(query);

    if (!isNaN(parsedRarity)) {
      filter.rarityScore = parsedRarity;
    } else {
      filter.fishName = { $regex: query, $options: 'i' };
    }
  }

  try {
    let fishCatches;
    if (username) {
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      filter.caughtBy = user._id;
    }

    fishCatches = await FishCatch.find(filter).populate('caughtBy', 'username');

    // Transform the data to include the username and format the location
    const formattedFishCatches = fishCatches.map(fishCatch => {
      const catchObject = fishCatch.toObject();
      return {
        ...catchObject,
        username: catchObject.caughtBy ? catchObject.caughtBy.username : 'Unknown User',
        location: `${catchObject.latitude},${catchObject.longitude}`,
        caughtBy: undefined // Remove the caughtBy field to avoid sending unnecessary data
      };
    });

    res.json(formattedFishCatches);
  } catch (error) {
    console.error('Error fetching fish catches:', error);
    res.status(500).json({ error: 'An error occurred while fetching fish catches' });
  }
});