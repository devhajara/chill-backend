// src/routes.ts
import express from 'express';
import {
    createLottery,
    getCurrentLottery,
    enterLottery,
    getEntries,
    declareWinner,
    getWinners,
} from './controllers';

const router = express.Router();

// Admin: Create new lottery
router.post('/lottery', createLottery);

// Get current active lottery
router.get('/lottery', getCurrentLottery);

// Enter a lottery
router.post('/entry', enterLottery);

// Get all entries for a specific lottery
router.get('/entries/:lotteryId', getEntries);

// Admin: Declare winner(s)
router.post('/winner', declareWinner);

// Get all winners
router.get('/winners', getWinners);

export default router;
