# Islamic Quiz Card Game 🕌

**بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ**

A multiplayer Islamic quiz card game built with HTML5/JavaScript and Node.js. Test your Islamic knowledge through engaging gameplay with friends from around the world.

## Features

### 🎮 Game Features
- **Multiplayer Real-time Gameplay** - Play with 2-4 players simultaneously
- **Islamic Knowledge Categories**:
  - 📖 Quran & Tafseer
  - 📜 Hadith Collections
  - ⚖️ Fiqh (Islamic Jurisprudence)
  - 🏛️ Islamic History
  - ☪️ Aqidah (Islamic Theology)
- **Card-based Mechanics** - Special cards with unique effects
- **Tournament System** - Competitive Islamic knowledge contests
- **Leaderboards** - Global and category-specific rankings
- **Practice Mode** - Learn offline at your own pace

### 📱 Platform Support
- **Web Browser** - Play directly in any modern browser
- **Android** - Native mobile app via Cordova
- **iOS** - Native mobile app via Cordova
- **Responsive Design** - Optimized for all screen sizes

### 🌍 Islamic Content
- **Authentic Sources** - All questions verified by Islamic scholars
- **Multiple Languages** - English, Arabic, and more
- **Source Citations** - Every question includes references
- **Difficulty Levels** - From beginner to expert
- **Cultural Sensitivity** - Respectful representation of Islamic values

## Quick Start

### Prerequisites
- Node.js 16+ and npm 8+
- For mobile development: Android SDK, Xcode (iOS), Cordova CLI

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ummah360/islamic-quiz-card-game.git
   cd islamic-quiz-card-game
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Start frontend development**
   ```bash
   npm run dev-frontend
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

### Mobile Development

1. **Setup mobile development**
   ```bash
   npm run mobile:setup
   ```

2. **Build for Android**
   ```bash
   npm run mobile:build:android
   ```

3. **Build for iOS**
   ```bash
   npm run mobile:build:ios
   ```

4. **Run on device**
   ```bash
   npm run mobile:run:android  # or mobile:run:ios
   ```

## Architecture

### Frontend (Phaser.js + HTML5)
```
frontend/
├── src/
│   ├── scenes/          # Game scenes (Menu, Lobby, Game)
│   ├── components/      # Reusable components (Card, Question)
│   ├── networking/      # WebSocket client management
│   └── styles/          # CSS and themes
└── assets/              # Images, sounds, fonts
```

### Backend (Node.js + Socket.io)
```
src/
├── server.js           # Main server entry point
├── managers/           # Game logic managers
│   ├── GameRoomManager.js
│   ├── PlayerManager.js
│   └── IslamicContentManager.js
├── models/             # Data models
├── routes/             # API endpoints
│   ├── questions.js
│   ├── rooms.js
│   └── leaderboard.js
└── middleware/         # Auth and validation
```

### Mobile (Cordova)
```
mobile/
├── config.xml          # Cordova configuration
├── www/               # Built web assets
├── platforms/         # iOS/Android projects
├── plugins/           # Cordova plugins
└── res/               # Icons and splash screens
```

## API Endpoints

### Questions API
- `GET /api/questions/categories` - Get available categories
- `GET /api/questions/category/:category` - Get questions by category
- `GET /api/questions/mixed` - Get mixed questions
- `GET /api/questions/random` - Get random question
- `GET /api/questions/search` - Search questions

### Rooms API
- `GET /api/rooms/stats` - Get room statistics
- `GET /api/rooms/:roomId` - Get room information
- `GET /api/rooms/available/:gameMode` - Find available rooms
- `POST /api/rooms/:roomId/join` - Validate room join

### Leaderboard API
- `GET /api/leaderboard/top` - Get top players
- `GET /api/leaderboard/player/:playerId` - Get player stats
- `GET /api/leaderboard/categories/:category` - Category leaderboard

## Game Mechanics

### Card Types
- **🌟 Blessing Cards** - Double points for correct answers
- **⚡ Challenge Cards** - Increase difficulty for bonus points
- **📚 Knowledge Cards** - Get hints for questions
- **⏰ Wisdom Cards** - Extra time to answer

### Scoring System
- **Base Points**: 100 points per correct answer
- **Time Bonus**: Faster answers earn more points
- **Difficulty Multiplier**: Harder questions worth more
- **Card Effects**: Special cards can modify scoring

### Game Modes
- **Quick Match**: Fast 2-4 player games
- **Tournament**: Bracket-style competitions
- **Study Groups**: Collaborative learning
- **Practice Mode**: Solo learning experience

## Development

### Running Tests
```bash
npm test
```

### Code Structure
- **ES6 Modules** - Modern JavaScript throughout
- **Component-based** - Reusable game components
- **Event-driven** - Socket.io for real-time communication
- **Responsive** - Mobile-first design approach

### Adding New Questions
1. Create questions in the appropriate category file
2. Follow the `IslamicQuestion` class structure
3. Include proper source citations
4. Test for content validation

### Contributing
1. Fork the repository
2. Create a feature branch
3. Follow Islamic content guidelines
4. Add tests for new features
5. Submit a pull request

## Deployment

### Production Build
```bash
npm run build
NODE_ENV=production npm start
```

### Environment Variables
```bash
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb://localhost:27017/islamicquiz
REDIS_URL=redis://localhost:6379
```

### Docker Deployment
```bash
docker build -t islamic-quiz .
docker run -p 3001:3001 islamic-quiz
```

## Islamic Content Guidelines

### Content Validation
- All questions must cite authentic Islamic sources
- Hadith must include chain of narration (Isnad) when available
- Quranic references must include Surah and Ayah numbers
- Content reviewed by qualified Islamic scholars

### Sources
- **Quran**: Sahih International, Pickthall, Yusuf Ali translations
- **Hadith**: Sahih Bukhari, Sahih Muslim, Sunan collections
- **History**: Ibn Hisham, At-Tabari chronicles
- **Fiqh**: Four major schools (Hanafi, Maliki, Shafi'i, Hanbali)

### Content Standards
- Respectful representation of Islamic teachings
- Culturally sensitive to diverse Muslim communities
- Accurate historical and theological information
- Age-appropriate content for all audiences

## Performance Optimization

### Frontend
- **Asset Optimization** - Compressed images and audio
- **Code Splitting** - Lazy loading of game components
- **Caching** - Efficient asset and API response caching
- **Mobile Optimization** - Touch-optimized controls

### Backend
- **Connection Pooling** - Efficient database connections
- **Redis Caching** - Fast real-time game state
- **Rate Limiting** - DDoS protection and fair usage
- **Clustering** - Multi-process server scaling

## Troubleshooting

### Common Issues

**Mobile build fails**
```bash
npm run mobile:clean
npm run mobile:setup
```

**WebSocket connection issues**
- Check firewall settings
- Verify server is running on correct port
- Test with different network connection

**Content loading problems**
- Clear browser cache
- Check API endpoints are accessible
- Verify Islamic content is properly loaded

### Development Tips
- Use browser developer tools for debugging
- Monitor WebSocket messages in Network tab
- Test on actual mobile devices, not just emulators
- Verify Islamic content accuracy with scholars

## License

MIT License - See [LICENSE](LICENSE) file for details

## Acknowledgments

- Islamic scholars for content validation
- Open source Phaser.js game framework
- Socket.io for real-time communication
- Apache Cordova for mobile deployment
- The global Muslim community for inspiration

## Support

- 📧 Email: support@ummah360.com
- 🐛 Issues: [GitHub Issues](https://github.com/ummah360/islamic-quiz-card-game/issues)
- 📚 Documentation: [Wiki](https://github.com/ummah360/islamic-quiz-card-game/wiki)
- 💬 Community: [Discord Server](https://discord.gg/islamicquiz)

---

**"And whoever is given knowledge, is given indeed abundant good."** - Quran 2:269

Built with ❤️ for the Ummah by the Ummah360 team.