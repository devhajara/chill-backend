"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWinners = exports.declareWinner = exports.getEntries = exports.enterLottery = exports.getCurrentLottery = exports.createLottery = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// ✅ Create a new lottery
const createLottery = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, startDate, endDate } = req.body;
        const lottery = yield prisma.lottery.create({
            data: {
                name,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
            },
        });
        res.status(201).json(lottery);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error creating lottery' });
    }
});
exports.createLottery = createLottery;
// ✅ Get the current active lottery
const getCurrentLottery = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const now = new Date();
        const lottery = yield prisma.lottery.findFirst({
            where: {
                startDate: { lte: now },
                endDate: { gte: now },
            },
            orderBy: {
                startDate: 'desc',
            },
        });
        res.json(lottery);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching current lottery' });
    }
});
exports.getCurrentLottery = getCurrentLottery;
// ✅ Enter the lottery
const enterLottery = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { wallet, lotteryId } = req.body;
        const entry = yield prisma.entry.create({
            data: {
                wallet,
                lottery: { connect: { id: lotteryId } },
            },
        });
        res.status(201).json(entry);
    }
    catch (err) {
        console.error(err);
        if (err.code === 'P2002') {
            res.status(400).json({ error: 'Wallet already entered this lottery.' });
        }
        else {
            res.status(500).json({ error: 'Error entering lottery' });
        }
    }
});
exports.enterLottery = enterLottery;
// ✅ Get all entries for a lottery
const getEntries = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { lotteryId } = req.params;
        const entries = yield prisma.entry.findMany({
            where: { lotteryId: Number(lotteryId) },
        });
        res.json(entries);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching entries' });
    }
});
exports.getEntries = getEntries;
// ✅ Declare a winner
const declareWinner = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { wallet, lotteryId } = req.body;
        const winner = yield prisma.winner.create({
            data: {
                wallet,
                lottery: { connect: { id: lotteryId } },
            },
        });
        res.status(201).json(winner);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error declaring winner' });
    }
});
exports.declareWinner = declareWinner;
// ✅ Get all past winners
const getWinners = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const winners = yield prisma.winner.findMany({
            include: {
                lottery: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        res.json(winners);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching winners' });
    }
});
exports.getWinners = getWinners;
