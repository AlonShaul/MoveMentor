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
import { WebhookClient } from 'dialogflow-fulfillment';
import { generatePlan } from './controllers/plan.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors({
  origin: ['http://localhost:3000', 'https://movementor.onrender.com', 'https://movementor-1.onrender.com'],
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

mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/blog', {
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

app.post('/webhook', express.json(), async (req, res) => {
  const agent = new WebhookClient({ request: req, response: res });

  function welcome(agent) {
    agent.add(`Welcome to my agent!`);
  }

  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
  }

  async function handleGeneratePlan(agent) {
    const category = agent.parameters.category;
    const adaptedForThirdAge = agent.parameters.adaptedForThirdAge === 'true';
    const adaptedForChildren = agent.parameters.adaptedForChildren === 'true';

    req.query = { category, adaptedForThirdAge, adaptedForChildren };

    try {
      const result = await generatePlan(req, res);
      if (res.statusCode === 201) {
        agent.add('Plan generated successfully.');
      } else {
        agent.add('Failed to generate the plan.');
      }
    } catch (error) {
      console.error('Error handling generate plan:', error);
      agent.add('Failed to generate the plan.');
    }
  }

  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('Generate Plan', handleGeneratePlan);
  agent.handleRequest(intentMap);
});

app.listen(process.env.PORT || 8800, () => {
  console.log(`Server running on port ${process.env.PORT || 8800}`);
});
