# 🚀 Quick Start Guide - Islamic Quiz Card Game

**بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ**

## ⚡ Super Quick Testing (2 minutes)

### Method 1: Automatic Setup
```bash
cd "E:\Claude Projects\ummah360"
npm run setup
```

### Method 2: Manual Setup
```bash
cd "E:\Claude Projects\ummah360"
npm install
npm run build
```

## 🎮 Start Playing

### Terminal 1 - Backend Server
```bash
npm run dev
# Server will start on http://localhost:4000
```

### Terminal 2 - Frontend Server  
```bash
npm run dev-frontend
# Game will open on http://localhost:8080
```

## 🧪 Test Scenarios

### Single Player Test
1. Open `http://localhost:8080`
2. Enter name: "TestPlayer"
3. Click **"Practice Mode"**
4. Answer Islamic questions!

### Multiplayer Test
1. **Tab 1**: Enter name "Player1" → **"Create Room"**
2. **Tab 2**: Enter name "Player2" → **"Join Room"** → Enter room ID
3. **Player1**: Click **"Start Game"**
4. Both players answer questions simultaneously!

## 🔧 Different Ports Used

- **Frontend**: `http://localhost:8080` (was 3000)
- **Backend**: `http://localhost:4000` (was 3001)
- **API Test**: `http://localhost:4000/health`

## 📱 Mobile Testing

```bash
npm run mobile:setup
npm run mobile:build
cd mobile
npx cordova serve
# Open: http://localhost:8000
```

## ⚠️ Troubleshooting

### Port Already in Use?
```bash
# Kill processes on ports
netstat -ano | findstr :8080
netstat -ano | findstr :4000
# Kill with: taskkill /PID <PID> /F
```

### Dependencies Issues?
```bash
npm cache clean --force
rm -rf node_modules
npm install
```

### Build Errors?
```bash
npm run build
# Check console for errors
```

## 🐙 GitHub Setup

### Initialize Git Repository
```bash
git init
git add .
git commit -m "Initial commit: Islamic Quiz Card Game

- Multiplayer HTML5 game with Phaser.js
- Node.js backend with Socket.io
- Islamic content with authentic sources
- Mobile-ready with Cordova
- Real-time gameplay for 2-4 players

بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ"
```

### Create GitHub Repository
1. Go to GitHub.com
2. Click **"New Repository"**
3. Name: `islamic-quiz-card-game`
4. Description: `Multiplayer Islamic Quiz Card Game - Test your Islamic knowledge through engaging gameplay`
5. **Public** repository
6. Don't initialize with README (we already have one)

### Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/islamic-quiz-card-game.git
git branch -M main
git push -u origin main
```

## 🚀 Deploy to GitHub Pages

### Enable GitHub Pages
1. Go to repository → **Settings**
2. Scroll to **Pages**
3. Source: **GitHub Actions**
4. The workflow will auto-deploy on push to main

### Custom Domain (Optional)
1. Add `CNAME` file with your domain
2. Update DNS settings
3. Enable HTTPS in repository settings

## 🐳 Docker Deployment

### Quick Docker Test
```bash
npm run docker:build
npm run docker:run
# Access: http://localhost:4000
```

### Production Docker
```bash
docker-compose up -d
# Includes MongoDB, Redis, Nginx
```

## 📊 Test APIs

```bash
# Server health
curl http://localhost:4000/health

# Islamic questions
curl http://localhost:4000/api/questions/random

# Room stats
curl http://localhost:4000/api/rooms/stats

# Leaderboard
curl http://localhost:4000/api/leaderboard/top
```

## ✅ Success Checklist

- [ ] Server starts on port 4000
- [ ] Frontend loads on port 8080
- [ ] Practice mode works
- [ ] Multiplayer rooms work
- [ ] Islamic questions display
- [ ] WebSocket connection stable
- [ ] Mobile version accessible
- [ ] APIs respond correctly

## 🆘 Get Help

**Common Issues:**
- **EADDRINUSE**: Port in use → Change ports or kill processes
- **Module not found**: Run `npm install`
- **Build fails**: Check Node.js version (16+ required)
- **WebSocket fails**: Check firewall/antivirus

**Test Commands:**
```bash
node --version    # Check Node.js (16+ required)
npm --version     # Check npm (8+ required)
```

---

🌟 **Ready to play? الحمد لله - May Allah bless your Islamic learning journey!**