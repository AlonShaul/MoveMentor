import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import postRoutes from './routes/posts.js';
import userRoutes from './routes/users.js';
import planRoutes from './routes/planRoutes.js';
import { authMiddleware } from './middleware/auth.js';
import { WebhookClient } from 'dialogflow-fulfillment';
import { generatePlan } from './controllers/plan.js';
import pkg from 'uuid';
const { v4: uuidv4 } = pkg;
import { SessionsClient } from '@google-cloud/dialogflow';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors({
  origin: ['http://localhost:3000', 'https://movementor-fyyf.onrender.com','https://movementor-1.onrender.com' , 'https://movementor.onrender.com'], // Allow your frontend URL
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

const uploadDir = path.join(__dirname, 'public', 'upload');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('MongoDB connected');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

app.post('/api/upload', upload.single('file'), function (req, res) {
  const file = req.file;
  res.status(200).json(file.filename);
});

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/plans', planRoutes);

// Dialogflow setup
const sessionId = uuidv4();
const sessionClient = new SessionsClient({
  keyFilename: process.env.DIALOGFLOW_KEY_PATH,
});
const sessionPath = sessionClient.projectAgentSessionPath('move-mentor-426019', sessionId);

// Dialogflow webhook route
app.post('/webhook', express.json(), authMiddleware, async (req, res) => {
  try {
    // Check if the request is from Dialogflow
    if (!req.body.queryResult) {
      return res.status(400).send('Invalid or unknown request type');
    }

    const agent = new WebhookClient({ request: req, response: res });
    console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
    console.log('Dialogflow Request body: ' + JSON.stringify(request.body));

    function welcome(agent) {
      agent.add(`Welcome to my agent!`);
    }

    function fallback(agent) {
      agent.add(`I didn't understand`);
      agent.add(`I'm sorry, can you try again?`);
    }

    async function handleGeneratePlan(agent) {
      try {
        const category = agent.parameters.category;
        const adaptedForThirdAge = agent.parameters.adaptedForThirdAge;
        const adaptedForChildren = agent.parameters.adaptedForChildren;
        const duration = agent.parameters.duration;

        console.log('Parameters received from Dialogflow:', { category, adaptedForThirdAge, adaptedForChildren, duration });

        req.query = { category, adaptedForThirdAge, adaptedForChildren, duration, userId: req.user._id };
        const response = await generatePlan(req, res);

        if (res.statusCode === 201) {
          agent.add('Plan generated successfully.');
        } else {
          console.error('Failed to generate plan, status code:', res.statusCode);
          agent.add('Failed to generate the plan.');
        }
      } catch (error) {
        console.error('Error in handleGeneratePlan:', error);
        agent.add('Error generating the plan.');
      }
    }

    let intentMap = new Map();
    intentMap.set('Default Welcome Intent', welcome);
    intentMap.set('Default Fallback Intent', fallback);
    intentMap.set('Generate Plan', handleGeneratePlan);
    agent.handleRequest(intentMap);
  } catch (error) {
    console.error('Error in Dialogflow webhook:', error);
    res.status(500).send('Error processing request');
  }
});

app.listen(process.env.PORT || 8800, () => {
  console.log(`Server running on port ${process.env.PORT || 8800}`);
});
