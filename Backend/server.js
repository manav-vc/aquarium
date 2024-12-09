const express = require('express');
const multer = require('multer');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const path = require('path');
require('dotenv').config();
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User, FishCatch } = require('./database'); // Import User and FishCatch models from the database

// Create a new directory for file uploads if it doesn't exist
const newFolderPath = path.join(__dirname, 'uploads');

try {
  fs.mkdirSync(newFolderPath, { recursive: true });
  console.log('Folder created successfully');
} catch (err) {
  console.error('Error creating folder:', err);
}

const app = express();

// Configure CORS to allow specific origins and methods
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = ['https://live-aquaria.onrender.com', 'http://localhost:5173'];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true); // Allow requests with no origin or from allowed origins
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
  credentials: true, // Allow credentials like cookies
}));

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, 'public')));

// Parse JSON requests
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_CONNECTION, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Configure file upload storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Save files to the uploads folder
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to filenames
  }
});

const upload = multer({ storage: storage });

// User signup route
app.post('/signup', async (req, res) => {
  try {
    const { username, password } = req.body;
    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    // Hash the user's password and save the user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'User created successfully', username });
  } catch (error) {
    res.status(500).json({ error: 'Error creating user' });
  }
});

// User login route
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    res.status(200).json({ message: 'Login successful', username });
  } catch {
    res.status(500).json({ error: 'Error logging in' });
  }
});

// Helper function to prepare image data for AI processing
function fileToGenerativePart(filePath, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(filePath)).toString("base64"),
      mimeType
    },
  };
}

// Fish identification route
app.post('/identify-fish', upload.single('image'), async (req, res) => {
  console.log('Received request body:', req.body);

  // Validate image file
  if (!req.file) {
    return res.status(400).json({ error: 'No image file uploaded' });
  }

  const { username, latitude, longitude } = req.body;
  if (!username || latitude === undefined || longitude === undefined) {
    return res.status(400).json({ error: 'Username and location are required' });
  }

  // Parse and validate latitude and longitude
  const lat = parseFloat(latitude);
  const lon = parseFloat(longitude);

  if (isNaN(lat) || isNaN(lon) || !isFinite(lat) || !isFinite(lon)) {
    return res.status(400).json({ error: 'Invalid latitude or longitude' });
  }

  const filePath = path.resolve(req.file.path);

  try {
    // Prepare the image for AI analysis
    const imagePart = fileToGenerativePart(filePath, req.file.mimetype);

    const prompt = `...`; // AI prompt for fish analysis (truncated for brevity)

    // Define the expected schema for the AI response
    const jsonSchema = { ... }; // JSON schema definition (truncated for brevity)

    const result = await model.generateContent({
      contents: [
        { role: "user", parts: [{ text: prompt }] },
        { role: "user", parts: [imagePart] }
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 1024,
        topP: 1,
        topK: 32,
        responseMimeType: 'application/json',
        responseSchema: jsonSchema
      }
    });

    const response = await result.response;
    const fishInfo = JSON.parse(await response.text());

    console.log('AI generated fish info:', fishInfo);

    // Save fish catch to the database
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const newFishCatch = new FishCatch({
      ...fishInfo,
      caughtBy: user._id,
      dateCaught: new Date(),
      latitude: lat,
      longitude: lon
    });

    await newFishCatch.save();
    user.fishCatches = user.fishCatches || [];
    user.fishCatches.push(newFishCatch._id);
    await user.save();

    res.json({ ...fishInfo, latitude: lat, longitude: lon });
  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).json({ error: 'An error occurred while processing the image.' });
  } finally {
    // Clean up the uploaded file
    fs.unlink(filePath, (err) => {
      if (err) console.error('Error deleting temporary file:', err);
    });
  }
});

// Fetch all fish catches
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
    if (username) {
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      filter.caughtBy = user._id;
    }

    const fishCatches = await FishCatch.find(filter).populate('caughtBy', 'username');
    const formattedFishCatches = fishCatches.map(fishCatch => ({
      ...fishCatch.toObject(),
      username: fishCatch.caughtBy?.username || 'Unknown User',
      location: `${fishCatch.latitude},${fishCatch.longitude}`,
      caughtBy: undefined
    }));

    res.json(formattedFishCatches);
  } catch (error) {
    console.error('Error fetching fish catches:', error);
    res.status(500).json({ error: 'An error occurred while fetching fish catches' });
  }
});

// Fetch fish details by ID
app.get('/fish-details/:id', async (req, res) => {
  try {
    const fishCatch = await FishCatch.findById(req.params.id).populate('caughtBy', 'username');
    if (!fishCatch) {
      return res.status(404).json({ error: 'Fish catch not found' });
    }
    res.json(fishCatch);
  } catch (error) {
    console.error('Error fetching fish details:', error);
    res.status(500).json({ error: 'An error occurred while fetching fish details' });
  }
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
