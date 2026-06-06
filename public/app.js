import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js';
import { getDatabase, ref, push, onValue, remove, update } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js';

// ===========================
// FIREBASE CONFIGURATION
// ===========================

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBVBZk7-XBa1_GC5b5k6jVk0z5gL1m2n3o',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'savings-dashboard.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'savings-dashboard-12345',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'savings-dashboard.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789:web:abcdef123456',
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || 'https://savings-dashboard.firebaseio.com'
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getDatabase(firebaseApp);

const app = document.getElementById('app');
let currentUser = null;
let currentToken = null;

// ===========================
// AUTH STATE MANAGEMENT
// ===========================

onAuthStateChanged(auth, (user) => {
  currentUser = user;
  if (user) {
    loadDashboard();
  } else {
    showAuthPage();
  }
});

// ===========================
// RENDER FUNCTIONS
// ===========================

function showAuthPage() {
  let isLogin = true;

  const renderAuth = () => {
    app.innerHTML = `
      <div class="auth-container">
        <div class="auth-box">
          <div class="auth-header">
            <h1>💰 Savings Pro</h1>
            <p>${isLogin ? 'Welcome back' : 'Join millions saving smarter'}</p>
          </div>

          <div id="auth-message"></div>

          <form id="auth-form">
            ${!isLogin ? `
              <div class="form-group">
                <label for="name">Full Name</label>
                <input type="text" id="name" placeholder="John Doe" required>
              </div>
            ` : ''}

            <div class="form-group">
              <label for="email">Email Address</label>
              <input type="email" id="email" placeholder="your@email.com" required>
            </div>

            <div class="form-group">
              <label for="password">Password</label>
              <input type="password" id="password" placeholder="Min 6 characters" required>
            </div>

            ${!isLogin ? `
              <div class="form-group">
                <label for="confirm-password">Confirm Password</label>
                <input type="password" id="confirm-password" placeholder="Confirm password" required>
              </div>
            ` : ''}

            <button type="submit" class="submit-btn">${isLogin ? 'Sign In' : 'Create Account'}</button>
          </form>

          <div class="toggle-text">
            ${isLogin ? "Don't have an account?" : 'Already have an account?'}
            <a id="toggle-auth"> ${isLogin ? 'Sign Up' : 'Sign In'}</a>
          </div>
        </div>
      </div>
    `;

    document.getElementById('toggle-auth').addEventListener('click', () => {
      isLogin = !isLogin;
      renderAuth();
    });

    document.getElementById('auth-form').addEventListener('submit', handleAuth);
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    const messageEl = document.getElementById('auth-message');

    try {
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      messageEl.innerHTML = '';

      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const confirmPassword = document.getElementById('confirm-password').value;
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      messageEl.innerHTML = `<div class="error">${error.message}</div>`;
    }
  };

  renderAuth();
}

function loadDashboard() {
  app.innerHTML = `
    <div class="dashboard">
      <nav class="navbar">
        <h1>💰 Savings Dashboard Pro</h1>
        <div class="navbar-right">
          <div class="user-info">👤 ${currentUser?.email}</div>
          <button class="logout-btn" id="logout">Logout</button>
        </div>
      </nav>

      <div id="dashboard-content"></div>
    </div>
  `;

  document.getElementById('logout').addEventListener('click', () => {
    signOut(auth).then(() => {
      showAuthPage();
    });
  });

  renderDashboardContent();
}

function renderDashboardContent() {
  const content = document.getElementById('dashboard-content');

  content.innerHTML = `
    <div class="stats-section">
      <div class="stat-card income">
        <div class="stat-label">Total Income</div>
        <div class="stat-value">MK 0</div>
        <div class="stat-change">📈 +0 this month</div>
      </div>

      <div class="stat-card expense">
        <div class="stat-label">Total Expenses</div>
        <div class="stat-value">MK 0</div>
        <div class="stat-change">📉 -0 this month</div>
      </div>

      <div class="stat-card savings">
        <div class="stat-label">Auto-Approved Savings</div>
        <div class="stat-value">MK 0</div>
        <div class="stat-change">💰 Growth mode</div>
      </div>

      <div class="stat-card balance">
        <div class="stat-label">Account Balance</div>
        <div class="stat-value">MK 0</div>
        <div class="stat-change">✨ Keep it up!</div>
      </div>
    </div>

    <div class="transactions-header">
      <h2>Recent Transactions</h2>
      <button class="filter-btn" id="filter-btn">📊 All</button>
    </div>

    <div class="transactions-list" id="transactions-list">
      <div class="empty-state">
        <div class="empty-state-icon">📭</div>
        <h3>No transactions yet</h3>
        <p>Your transactions will appear here once you start using the system</p>
      </div>
    </div>
  `;

  // Load transactions for current user
  if (currentUser) {
    const transactionsRef = ref(db, `users/${currentUser.uid}/transactions`);
    onValue(transactionsRef, (snapshot) => {
      const data = snapshot.val();
      const transactions = data ? Object.values(data).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)) : [];

      renderTransactions(transactions);
      updateStats(transactions);
    });
  }
}

function renderTransactions(transactions) {
  const list = document.getElementById('transactions-list');

  if (transactions.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📭</div>
        <h3>No transactions yet</h3>
        <p>Your transactions will appear here once you start using the system</p>
      </div>
    `;
    return;
  }

  list.innerHTML = transactions.map((t, i) => `
    <div class="transaction-card ${t.type}" style="animation-delay: ${i * 0.05}s">
      <div class="transaction-info">
        <div class="transaction-sender">${t.sender || 'Unknown'}</div>
        <div class="transaction-type">${t.type}</div>
        <div class="transaction-status status-${t.savingsStatus || 'pending'}">
          ${(t.savingsStatus || 'pending').toUpperCase()}
        </div>
      </div>
      <div>
        <div class="transaction-amount">MK ${(t.amount || 0).toLocaleString()}</div>
        <div class="transaction-type" style="text-align: right; margin-top: 5px;">
          💾 ${t.savingsPercent || 0}% saved
        </div>
      </div>
    </div>
  `).join('');
}

function updateStats(transactions) {
  let income = 0, expenses = 0, savings = 0;

  transactions.forEach(t => {
    if (t.type === 'income') income += t.amount || 0;
    if (['expense', 'gambling', 'airtime'].includes(t.type)) expenses += t.amount || 0;
    if (t.savingsStatus === 'approved') savings += t.saveAmount || 0;
  });

  const cards = document.querySelectorAll('.stat-card');
  cards[0].querySelector('.stat-value').textContent = `MK ${income.toLocaleString()}`;
  cards[1].querySelector('.stat-value').textContent = `MK ${expenses.toLocaleString()}`;
  cards[2].querySelector('.stat-value').textContent = `MK ${savings.toLocaleString()}`;
  cards[3].querySelector('.stat-value').textContent = `MK ${(income - expenses).toLocaleString()}`;
}

// Initialize
showAuthPage();
