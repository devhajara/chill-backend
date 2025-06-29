// src/controllers.ts
import { Request, Response } from 'express';
import { PrismaClient,} from '@prisma/client';

const prisma = new PrismaClient();

// Create a new lottery (admin only)
export const createLottery = async (req: Request, res: Response) => {
    try {
        const {
            name,
            startDate,
            endDate,
            entryFee,
            lotteryWallet,
            autoPick,
            numWinners,
        } = req.body;

        if (
            !name ||
            !startDate ||
            !endDate ||
            entryFee === undefined ||
            !lotteryWallet ||
            numWinners === undefined
        ) {
            res.status(400).json({ error: "Missing required lottery fields" });
            return;
        }

        const parsedEntryFee = typeof entryFee === "string" ? parseFloat(entryFee) : entryFee;
        console.log("Processed values:", {
            entryFee: parsedEntryFee,
            type: typeof parsedEntryFee,
        });
          

        const lottery = await prisma.lottery.create({
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
    } catch (error) {
        console.error("Create Lottery Error:", error);
        res.status(500).json({ error: "Error creating lottery" });
    }
};

// Get current active lottery
export const getCurrentLottery = async (_req: Request, res: Response) => {
    try {
        const now = new Date();
        const current = await prisma.lottery.findFirst({
            where: {
                startDate: { lte: now },
                endDate: { gte: now },
            },
            orderBy: { startDate: 'desc' }
        });
         res.json(current);
    } catch (error) {
         res.status(500).json({ error: 'Failed to fetch current lottery' });
    }
};

// Enter a lottery
export const enterLottery = async (req: Request, res: Response) => {
    try {
        const { wallet, lotteryId } = req.body;

        const existing = await prisma.entry.findUnique({
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

        const EntryModel = await prisma.entry.create({
            data: {
                wallet,
                lotteryId
            }
        });

        res.status(201).json(EntryModel);
    } catch (error) {
        res.status(500).json({ error: 'Failed to enter lottery' });
    }
};

// Get all entries for a specific lottery
export const getEntries = async (req: Request, res: Response) => {
    try {
        const lotteryId = parseInt(req.params.lotteryId, 10);
        const entries = await prisma.entry.findMany({ where: { lotteryId } });
        res.json(entries);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch entries' });
    }
};

// Declare winner(s)
export const declareWinner = async (req: Request, res: Response) => {
    try {
        const { lotteryId, manualWinners } = req.body; // Optional: manualWinners: string[]
        const lottery = await prisma.lottery.findUnique({ where: { id: lotteryId } });
        if (!lottery) {
            res.status(404).json({ error: 'Lottery not found' });
            return;
        }

        const entries = await prisma.entry.findMany({ where: { lotteryId } });
        if (entries.length === 0) {
            res.status(400).json({ error: 'No entries found' });
            return;
        }

        let selectedWinners: string[] = [];

        if (lottery.autoPick) {
            const shuffled = entries.sort(() => 0.5 - Math.random());
        

            selectedWinners = shuffled.slice(0, lottery.numWinners).map((e: any) => e.wallet);

            if (!manualWinners || manualWinners.length === 0)
                res.status(400).json({ error: 'Manual winners required' });
            selectedWinners = manualWinners;
        }

        await prisma.winner.createMany({
            data: selectedWinners.map(wallet => ({ wallet, lotteryId }))
        });

        res.status(201).json({ message: 'Winners declared', winners: selectedWinners });
    } catch (error) {
        res.status(500).json({ error: 'Failed to declare winners' });
    }
};

// Get all winners (can add filters later)
export const getWinners = async (_req: Request, res: Response) => {
    try {
        const winners = await prisma.winner.findMany({ orderBy: { createdAt: 'desc' } });
        res.json(winners);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch winners' });
    }
};
