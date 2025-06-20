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

// ROUTES

// Create a new lottery (admin)
router.post('/lottery', createLottery);

// Get current active lottery
router.get('/lottery', getCurrentLottery);

// Enter the current lottery
router.post('/entry', enterLottery);

// Get all entries for a specific lottery
router.get('/entries/:lotteryId', getEntries);

// Declare a winner (admin)
router.post('/winner', declareWinner);

// Get past winners
router.get('/winners', getWinners);

export default router;
