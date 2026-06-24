import express, { Request, Response } from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { INITIAL_TRANSACTIONS, INITIAL_BUDGET_LIMITS, INITIAL_PRD_SECTIONS } from './src/data';

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const DB_PATH = path.join(process.cwd(), 'database.json');

interface DbState {
  transactions: any[];
  limits: any[];
  prdSections: any[];
}

// Ensure database.json exists and is seeded with initial state if missing
function loadDb(): DbState {
  try {
    if (fs.existsSync(DB_PATH)) {
      const content = fs.readFileSync(DB_PATH, 'utf-8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.error('Error loading database.json, rebuilding...', error);
  }
  
  const initialState: DbState = {
    transactions: INITIAL_TRANSACTIONS,
    limits: INITIAL_BUDGET_LIMITS,
    prdSections: INITIAL_PRD_SECTIONS
  };
  saveDb(initialState);
  return initialState;
}

function saveDb(state: DbState) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(state, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving database.json:', error);
  }
}

async function startServer() {
  // Parse JSON bodies up to 10MB
  app.use(express.json({ limit: '10mb' }));

  // --- API ROUTE SPECIFICATIONS ---

  // 1. Transactions CRUD
  app.get('/api/transactions', (_req: Request, res: Response) => {
    const db = loadDb();
    res.json(db.transactions);
  });

  app.post('/api/transactions', (req: Request, res: Response) => {
    const db = loadDb();
    const newTx = req.body;
    
    if (!newTx.description || typeof newTx.amount !== 'number' || !newTx.type || !newTx.category || !newTx.date) {
      return res.status(400).json({ error: 'Missing or invalid transaction fields.' });
    }

    const transaction = {
      ...newTx,
      id: newTx.id || `tx-${Date.now()}`
    };

    db.transactions.unshift(transaction);
    saveDb(db);
    res.status(201).json(transaction);
  });

  app.delete('/api/transactions/:id', (req: Request, res: Response) => {
    const db = loadDb();
    const { id } = req.params;
    const originalLength = db.transactions.length;
    
    db.transactions = db.transactions.filter(t => t.id !== id);
    if (db.transactions.length === originalLength) {
      return res.status(404).json({ error: 'Transaction entry not found.' });
    }

    saveDb(db);
    res.json({ success: true, message: 'Transaction successfully purged.' });
  });

  // 2. Monthly Budget Targets
  app.get('/api/limits', (_req: Request, res: Response) => {
    const db = loadDb();
    res.json(db.limits);
  });

  app.put('/api/limits/:category', (req: Request, res: Response) => {
    const db = loadDb();
    const { category } = req.params;
    const { limit } = req.body;

    if (typeof limit !== 'number' || limit < 0) {
      return res.status(400).json({ error: 'Limit must be a non-negative number.' });
    }

    const index = db.limits.findIndex(l => l.category.toLowerCase() === category.toLowerCase());
    if (index >= 0) {
      db.limits[index].limit = limit;
    } else {
      db.limits.push({ category, limit });
    }

    saveDb(db);
    res.json({ category, limit });
  });

  app.post('/api/limits/reset', (_req: Request, res: Response) => {
    const db = loadDb();
    db.limits = INITIAL_BUDGET_LIMITS;
    saveDb(db);
    res.json(db.limits);
  });

  // 3. PRD Requirements Management
  app.get('/api/prd-sections', (_req: Request, res: Response) => {
    const db = loadDb();
    res.json(db.prdSections);
  });

  app.put('/api/prd-sections/:id', (req: Request, res: Response) => {
    const db = loadDb();
    const { id } = req.params;
    const { content } = req.body;

    if (typeof content !== 'string') {
      return res.status(400).json({ error: 'Markdown content must be a valid string.' });
    }

    const index = db.prdSections.findIndex(s => s.id === id);
    if (index >= 0) {
      db.prdSections[index].content = content;
      saveDb(db);
      res.json(db.prdSections[index]);
    } else {
      res.status(404).json({ error: 'PRD Section not found.' });
    }
  });

  // 4. Batch Import and Hard Reset
  app.post('/api/reset-all', (_req: Request, res: Response) => {
    const initialState: DbState = {
      transactions: INITIAL_TRANSACTIONS,
      limits: INITIAL_BUDGET_LIMITS,
      prdSections: INITIAL_PRD_SECTIONS
    };
    saveDb(initialState);
    res.json({ success: true, message: 'All financial states successfully reset to seeds.' });
  });

  app.post('/api/import', (req: Request, res: Response) => {
    const { transactions, limits, prdSections } = req.body;
    
    if (!Array.isArray(transactions) || !Array.isArray(limits)) {
      return res.status(400).json({ error: 'Malformed payload. Transactions and limits arrays are required.' });
    }

    const newState: DbState = {
      transactions,
      limits,
      prdSections: Array.isArray(prdSections) ? prdSections : INITIAL_PRD_SECTIONS
    };

    saveDb(newState);
    res.json({ success: true, message: 'Database state overwritten successfully.' });
  });

  // --- VITE MIDDLEWARE OR STATIC ASSETS SERVING ---

  const server = http.createServer(app);

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: { server }
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[VaultFlow Server] running on http://localhost:${PORT}`);
  });
}

startServer();
