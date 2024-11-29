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

// Signup route
app.post('/signup', async (req, res) => {
  
});