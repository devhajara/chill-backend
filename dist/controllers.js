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
exports.endCurrentLottery = exports.getWinners = exports.declareWinner = exports.getEntries = exports.enterLottery = exports.getCurrentLottery = exports.createLottery = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Utility function to parse entry fee
function parseEntryFee(entryFee) {
    return typeof entryFee === "string" ? parseFloat(entryFee) : entryFee;
}
// Create a new lottery (admin only)
const createLottery = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, startDate, endDate, entryFee, lotteryWallet, autoPick, numWinners, } = req.body;
        if (!name ||
            !startDate ||
            !endDate ||
            entryFee === undefined ||
            !lotteryWallet ||
            numWinners === undefined) {
            res.status(400).json({ error: "Missing required lottery fields" });
            return;
        }
        // ✅ Safely convert entryFee whether it's a string or number
        const parsedEntryFee = typeof entryFee === "string" ? parseFloat(entryFee) : entryFee;
        // ✅ Step 2: Add debug log here
        console.log("🔥 Final values to Prisma:", {
            name,
            startDate,
            endDate,
            entryFee: parsedEntryFee,
            lotteryWallet,
            autoPick,
            numWinners,
        });
        const lottery = yield prisma.lottery.create({
            data: {
                name,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                entryFee: parsedEntryFee,
                lotteryWallet,
                autoPick,
                numWinners,
            },
        });
        res.status(201).json(lottery);
    }
    catch (error) {
        console.error("Create Lottery Error:", error);
        res.status(500).json({ error: "Error creating lottery" });
    }
});
exports.createLottery = createLottery;
// Get current active lottery
const getCurrentLottery = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const now = new Date();
        const current = yield prisma.lottery.findFirst({
            where: {
                startDate: { lte: now },
                endDate: { gte: now },
            },
            orderBy: { startDate: 'desc' }
        });
        res.json(current);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch current lottery' });
    }
});
exports.getCurrentLottery = getCurrentLottery;
// Enter a lottery
const enterLottery = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { wallet, lotteryId } = req.body;
        const existing = yield prisma.entry.findUnique({
            where: {
                wallet_lotteryId: {
                    wallet,
                    lotteryId,
                },
            },
        });
        if (existing) {
            res.status(400).json({ error: 'Wallet already entered' });
        }
        const EntryModel = yield prisma.entry.create({
            data: {
                wallet,
                lotteryId
            }
        });
        res.status(201).json(EntryModel);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to enter lottery' });
    }
});
exports.enterLottery = enterLottery;
// Get all entries for a specific lottery
const getEntries = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const lotteryId = parseInt(req.params.lotteryId, 10);
        const entries = yield prisma.entry.findMany({ where: { lotteryId } });
        res.json(entries);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch entries' });
    }
});
exports.getEntries = getEntries;
// Declare winner(s)
const declareWinner = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { lotteryId, manualWinners } = req.body; // Optional: manualWinners: string[]
        const lottery = yield prisma.lottery.findUnique({ where: { id: lotteryId } });
        if (!lottery) {
            res.status(404).json({ error: 'Lottery not found' });
            return;
        }
        const entries = yield prisma.entry.findMany({ where: { lotteryId } });
        if (entries.length === 0) {
            res.status(400).json({ error: 'No entries found' });
            return;
        }
        let selectedWinners = [];
        if (lottery.autoPick) {
            const shuffled = entries.sort(() => 0.5 - Math.random());
            selectedWinners = shuffled.slice(0, lottery.numWinners).map((e) => e.wallet);
            if (!manualWinners || manualWinners.length === 0)
                res.status(400).json({ error: 'Manual winners required' });
            selectedWinners = manualWinners;
        }
        yield prisma.winner.createMany({
            data: selectedWinners.map(wallet => ({ wallet, lotteryId }))
        });
        res.status(201).json({ message: 'Winners declared', winners: selectedWinners });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to declare winners' });
    }
});
exports.declareWinner = declareWinner;
// Get all winners (can add filters later)
const getWinners = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const winners = yield prisma.winner.findMany({ orderBy: { createdAt: 'desc' } });
        res.json(winners);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch winners' });
    }
});
exports.getWinners = getWinners;
// PATCH /api/lottery/end — End current active lottery
const endCurrentLottery = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const currentLottery = yield prisma.lottery.findFirst({
            where: {
                endDate: {
                    gt: new Date(), // means it's still active
                },
            },
            orderBy: { startDate: 'desc' },
        });
        if (!currentLottery) {
            res.status(404).json({ error: 'No active lottery found' });
            return;
        }
        const updated = yield prisma.lottery.update({
            where: { id: currentLottery.id },
            data: { endDate: new Date() },
        });
        res.json({ success: true, updated }); // ✅ no "return"
    }
    catch (error) {
        console.error('Error ending lottery:', error);
        res.status(500).json({ error: 'Failed to end lottery' });
    }
});
exports.endCurrentLottery = endCurrentLottery;
