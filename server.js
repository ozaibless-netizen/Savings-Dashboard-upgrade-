import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import path, { dirname, join } from 'path';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, onValue, remove, update } from 'firebase/database';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// ===========================
// SECURITY MIDDLEWARE
// ===========================

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '15000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests, please try again later'
});

app.use('/api/', limiter);

// ===========================
// MIDDLEWARE
// ===========================

app.use(express.json({ limit: '10mb' }));
app.use(express.static(join(__dirname, 'public')));

// ===========================
// FIREBASE SETUP
// ===========================

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  databaseURL: process.env.FIREBASE_DATABASE_URL
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getDatabase(firebaseApp);
const auth = getAuth(firebaseApp);

// ===========================
// AUTH MIDDLEWARE
// ===========================

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }
};

// ===========================
// AUTHENTICATION ENDPOINTS
// ===========================

/**
 * Register new user
 * POST /api/auth/register
 * Body: { email, password }
 */
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create user profile in database
    await push(ref(db, `users/${user.uid}`), {
      email: user.email,
      createdAt: Date.now(),
      lastLogin: Date.now(),
      totalSavings: 0,
      totalIncome: 0,
      totalExpenses: 0,
      transactionCount: 0
    });

    const token = jwt.sign({ userId: user.uid, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: { uid: user.uid, email: user.email }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * Login user
 * POST /api/auth/login
 * Body: { email, password }
 */
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password required' });
    }

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const token = jwt.sign({ userId: user.uid, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: { uid: user.uid, email: user.email }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ success: false, error: 'Invalid credentials' });
  }
});

/**
 * Verify token
 * GET /api/auth/verify
 */
app.get('/api/auth/verify', verifyToken, (req, res) => {
  res.json({
    success: true,
    user: { userId: req.userId, email: req.userEmail }
  });
});

// ===========================
// DASHBOARD ENDPOINTS
// ===========================

/**
 * Get user dashboard data
 * GET /api/dashboard
 */
app.get('/api/dashboard', verifyToken, async (req, res) => {
  try {
    const transactionsRef = ref(db, `users/${req.userId}/transactions`);

    onValue(transactionsRef, (snapshot) => {
      const data = snapshot.val();
      const transactions = data ? Object.values(data) : [];

      let totalIncome = 0;
      let totalExpenses = 0;
      let approvedSavings = 0;

      transactions.forEach(t => {
        if (t.type === 'income') totalIncome += t.amount || 0;
        if (['expense', 'gambling', 'airtime'].includes(t.type)) totalExpenses += t.amount || 0;
        if (t.savingsStatus === 'approved') approvedSavings += t.saveAmount || 0;
      });

      res.json({
        success: true,
        stats: {
          totalIncome,
          totalExpenses,
          balance: totalIncome - totalExpenses,
          approvedSavings,
          transactionCount: transactions.length
        },
        transactions: transactions.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
      });
    }, { onlyOnce: true });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ===========================
// MACRODROID WEBHOOK
// ===========================

/**
 * Receive proof message from Macrodroid
 * POST /api/macrodroid-proof
 */
app.post('/api/macrodroid-proof', async (req, res) => {
  try {
    const { userId, tid, successMessage } = req.body;

    if (!userId || !tid || !successMessage) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    await push(ref(db, `users/${userId}/completion_messages`), {
      tid,
      successMessage,
      timestamp: Date.now(),
      processed: false
    });

    res.json({ success: true, message: 'Proof received' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ===========================
// HEALTH CHECK
// ===========================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    app: 'Savings Dashboard Pro v2.0'
  });
});

// ===========================
// SPA ROUTING
// ===========================

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

// ===========================
// ERROR HANDLER
// ===========================

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ success: false, error: err.message });
});

// ===========================
// START SERVER
// ===========================

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║  💰 SAVINGS DASHBOARD PRO v2.0 - MULTI-USER EDITION 🚀   ║
╠════════════════════════════════════════════════════════════╣
║ Server: http://localhost:${PORT}
║ Auth: ✅ Firebase Authentication Enabled
║ Real-time: ✅ Realtime Database Connected
║ Security: ✅ Helmet, CORS, Rate Limiting
║ Features: ✅ Animations, Multi-user, Analytics
╚════════════════════════════════════════════════════════════╝
  `);
});

export default app;
