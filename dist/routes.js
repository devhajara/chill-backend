"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes.ts
const express_1 = __importDefault(require("express"));
const controllers_1 = require("./controllers");
const router = express_1.default.Router();
// Admin: Create new lottery
router.post('/lottery', controllers_1.createLottery);
// Get current active lottery
router.get('/lottery', controllers_1.getCurrentLottery);
// Enter a lottery
router.post('/entry', controllers_1.enterLottery);
// Get all entries for a specific lottery
router.get('/entries/:lotteryId', controllers_1.getEntries);
// Admin: Declare winner(s)
router.post('/winner', controllers_1.declareWinner);
// Get all winners
router.get('/winners', controllers_1.getWinners);
exports.default = router;
