import express from 'express';

const router = express.Router();

router.post('/webhook', (req, res) => {
  // Your webhook logic goes here
  res.send('Dialogflow webhook');
});

export default router;
