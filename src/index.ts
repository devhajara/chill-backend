// src/index.ts
import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const prisma = new PrismaClient();
const app = express();
const PORT = parseInt(process.env.PORT || "8080", 10);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', routes);

// Root route
app.get('/', (_req, res) => {
    res.send('🎉 Chill & Win backend is running!');
});
// import { Request, Response } from 'express'; // Already imported at the top

// ✅ Place this before app.listen(...) and not inside any app.use()


// const prisma = new PrismaClient(); // Removed duplicate declaration

  

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is live on http://0.0.0.0:${PORT}`);
});
