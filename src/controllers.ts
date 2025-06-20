import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ✅ Create a new lottery
export const createLottery = async (req: Request, res: Response) => {
    try {
        const { name, startDate, endDate } = req.body;
        const lottery = await prisma.lottery.create({
            data: {
                name,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
            },
        });
        res.status(201).json(lottery);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error creating lottery' });
    }
};

// ✅ Get the current active lottery
export const getCurrentLottery = async (_req: Request, res: Response) => {
    try {
        const now = new Date();
        const lottery = await prisma.lottery.findFirst({
            where: {
                startDate: { lte: now },
                endDate: { gte: now },
            },
            orderBy: {
                startDate: 'desc',
            },
        });
        res.json(lottery);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching current lottery' });
    }
};

// ✅ Enter the lottery
export const enterLottery = async (req: Request, res: Response) => {
    try {
        const { wallet, lotteryId } = req.body;
        const entry = await prisma.entry.create({
            data: {
                wallet,
                lottery: { connect: { id: lotteryId } },
            },
        });
        res.status(201).json(entry);
    } catch (err: any) {
        console.error(err);
        if (err.code === 'P2002') {
            res.status(400).json({ error: 'Wallet already entered this lottery.' });
        } else {
            res.status(500).json({ error: 'Error entering lottery' });
        }
    }
};

// ✅ Get all entries for a lottery
export const getEntries = async (req: Request, res: Response) => {
    try {
        const { lotteryId } = req.params;
        const entries = await prisma.entry.findMany({
            where: { lotteryId: Number(lotteryId) },
        });
        res.json(entries);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching entries' });
    }
};

// ✅ Declare a winner
export const declareWinner = async (req: Request, res: Response) => {
    try {
        const { wallet, lotteryId } = req.body;
        const winner = await prisma.winner.create({
            data: {
                wallet,
                lottery: { connect: { id: lotteryId } },
            },
        });
        res.status(201).json(winner);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error declaring winner' });
    }
};

// ✅ Get all past winners
export const getWinners = async (_req: Request, res: Response) => {
    try {
        const winners = await prisma.winner.findMany({
            include: {
                lottery: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        res.json(winners);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching winners' });
    }
};
