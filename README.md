# 💰 Savings Dashboard Pro v2.0

A modern, multi-user financial dashboard with real-time analytics, animations, and integrated authentication. Built with Node.js, Express, Firebase, and vanilla JavaScript.

## ✨ Features

### 🔐 **Authentication**
- Firebase email/password authentication
- Secure JWT token management
- Rate limiting on auth endpoints
- Password validation

### 📊 **Dashboard**
- Real-time transaction tracking
- Automatic savings calculation
- Income/expense analytics
- 7-day financial forecasting
- Multi-user support with isolated data

### 🎨 **UI/UX**
- Smooth animations (slide, fade, scale, pulse)
- Responsive mobile-first design
- Dark mode support
- Loading states and skeleton screens
- Glass-morphism effects

### 🤖 **Smart Features**
- Auto-approval savings system
- Macrodroid webhook integration
- Offline transaction caching
- Duplicate prevention
- Proof-based transfer verification

### 🔒 **Security**
- Helmet.js for HTTP headers
- CORS configuration
- Rate limiting
- JWT token verification
- Input validation

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.x
- Firebase project (free tier works)
- Render.com account (for deployment)

### Installation

1. **Clone repository**
   ```bash
   git clone <repo-url>
   cd Savings-Dashboard-upgrade-
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```
   Then fill in your Firebase credentials:
   ```
   FIREBASE_API_KEY=xxx
   FIREBASE_AUTH_DOMAIN=xxx.firebaseapp.com
   FIREBASE_PROJECT_ID=xxx
   FIREBASE_STORAGE_BUCKET=xxx.appspot.com
   FIREBASE_MESSAGING_SENDER_ID=xxx
   FIREBASE_APP_ID=xxx
   FIREBASE_DATABASE_URL=https://xxx.firebaseio.com
   JWT_SECRET=your-super-secret-key
   PORT=3000
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```
   Server runs at `http://localhost:3000`

5. **Build for production**
   ```bash
   npm run build
   ```

## 📱 Usage

### Authentication

**Register**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

**Login**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

**Verify Token**
```bash
curl -X GET http://localhost:3000/api/auth/verify \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Dashboard

**Get Dashboard Data**
```bash
curl -X GET http://localhost:3000/api/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Macrodroid Integration

**Send Proof Message**
```bash
curl -X POST http://localhost:3000/api/macrodroid-proof \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_id",
    "tid": "TXN123.456.ABC",
    "successMessage": "Transfer successful"
  }'
```

## 🏗️ Project Structure

```
.
├── server.js              # Express server with auth & APIs
├── package.json           # Dependencies
├── .env.example           # Environment variables template
├── .gitignore             # Git ignore rules
├── public/
│   ├── index.html         # Main HTML
│   ├── app.js             # Client-side app (auth + dashboard)
│   ├── styles.css         # All animations & styles
│   └── firebase.js        # Firebase initialization (deprecated)
├── render.yaml            # Render deployment config
└── README.md              # This file
```

## 🎨 Animation Classes

The dashboard includes smooth animations:

- `slideInDown` - Top entrance
- `slideInUp` - Bottom entrance  
- `fadeIn` - Opacity transition
- `scaleIn` - Scale with opacity
- `pulse` - Pulse effect
- `shimmer` - Loading skeleton
- `floating` - Hover float effect
- `glow` - Glowing box shadow

## 🔧 API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify` - Verify token

### Dashboard
- `GET /api/dashboard` - Get user stats & transactions
- `GET /api/health` - Health check

### Webhooks
- `POST /api/macrodroid-proof` - Receive transfer proof

## 🚀 Deployment

### Render.com

1. Push to GitHub
2. Connect repo to Render
3. Set environment variables in Render dashboard
4. Auto-deploy on push

### Environment Variables Required
```
FIREBASE_API_KEY
FIREBASE_AUTH_DOMAIN
FIREBASE_PROJECT_ID
FIREBASE_STORAGE_BUCKET
FIREBASE_MESSAGING_SENDER_ID
FIREBASE_APP_ID
FIREBASE_DATABASE_URL
JWT_SECRET
CORS_ORIGIN
PORT
```

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repo
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open pull request

## 📝 License

MIT License - feel free to use for personal and commercial projects

## 🆘 Support

For issues or questions:
- Open a GitHub issue
- Check Firebase documentation
- Review server logs in Render dashboard

## 🎯 Roadmap

- [ ] Two-factor authentication
- [ ] Budget planning tools
- [ ] Investment tracking
- [ ] Mobile app (React Native)
- [ ] Multi-currency support
- [ ] Advanced analytics & charts
- [ ] Export to PDF/CSV
- [ ] SMS notifications
- [ ] Credit score integration

---

**Made with 💚 by blessings2008**
