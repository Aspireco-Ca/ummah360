const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Import managers
const GameRoomManager = require('./managers/GameRoomManager');
const IslamicContentManager = require('./managers/IslamicContentManager');
const PlayerManager = require('./managers/PlayerManager');

// Import middleware
const socketAuth = require('./middleware/socketAuth');

class IslamicQuizServer {
    constructor() {
        this.app = express();
        this.server = http.createServer(this.app);
        this.io = socketIo(this.server, {
            cors: {
                origin: process.env.NODE_ENV === 'production' 
                    ? ['https://your-domain.com'] 
                    : ['http://localhost:8080', 'http://127.0.0.1:8080'],
                methods: ['GET', 'POST'],
                credentials: true
            },
            transports: ['websocket', 'polling']
        });

        // Initialize managers
        this.gameRoomManager = new GameRoomManager(this.io);
        this.contentManager = new IslamicContentManager();
        this.playerManager = new PlayerManager();

        this.setupMiddleware();
        this.setupRoutes();
        this.setupSocketHandlers();
        this.startServer();
    }

    setupMiddleware() {
        // Security middleware
        this.app.use(helmet({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    scriptSrc: ["'self'", "'unsafe-inline'"],
                    styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
                    fontSrc: ["'self'", "https://fonts.gstatic.com"],
                    imgSrc: ["'self'", "data:", "https:"],
                    connectSrc: ["'self'", "ws:", "wss:"]
                }
            }
        }));

        // CORS
        this.app.use(cors({
            origin: process.env.NODE_ENV === 'production' 
                ? ['https://your-domain.com'] 
                : ['http://localhost:8080', 'http://127.0.0.1:8080'],
            credentials: true
        }));

        // Rate limiting
        const limiter = rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100, // limit each IP to 100 requests per windowMs
            message: 'Too many requests from this IP, please try again later.'
        });
        this.app.use('/api/', limiter);

        // Body parsing
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

        // Static files - serve frontend assets with absolute path
        const staticPath = path.resolve(__dirname, '../frontend/dist');
        console.log('🗂️ Serving static files from:', staticPath);
        this.app.use(express.static(staticPath));
        
        // Also serve assets specifically
        const assetsPath = path.resolve(__dirname, '../frontend/dist/assets');
        console.log('🎨 Serving assets from:', assetsPath);
        this.app.use('/assets', express.static(assetsPath));

        // Enhanced logging for debugging asset requests
        this.app.use((req, res, next) => {
            console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
            if (req.path.includes('/assets/')) {
                console.log(`🎯 Asset request: ${req.path}`);
            }
            next();
        });
    }

    setupRoutes() {
        // Health check
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'healthy',
                version: '2.1-DEBUGGING',
                deploymentTest: 'Railway cache test - Aug 5, 2025',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                activeRooms: this.gameRoomManager.getActiveRoomsCount(),
                activePlayers: this.playerManager.getActivePlayersCount()
            });
        });

        // Set managers in app context for route access
        this.app.set('contentManager', this.contentManager);
        this.app.set('gameRoomManager', this.gameRoomManager);
        this.app.set('playerManager', this.playerManager);

        // API routes
        this.app.use('/api/questions', require('./routes/questions'));
        this.app.use('/api/rooms', require('./routes/rooms'));
        this.app.use('/api/leaderboard', require('./routes/leaderboard'));

        // Debug test route
        this.app.get('/test', (req, res) => {
            const testPath = path.join(__dirname, '../frontend/src/test.html');
            res.sendFile(testPath);
        });

        // Working version route (bypass cache)
        this.app.get('/working', (req, res) => {
            res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Islamic Quiz Card Game - WORKING!</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%);
            font-family: Arial, sans-serif;
            color: white;
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            text-align: center;
        }
        .success {
            background: rgba(0,0,0,0.3);
            padding: 40px;
            border-radius: 15px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        }
        .title { font-size: 32px; margin-bottom: 20px; }
        .status { font-size: 18px; margin: 10px 0; }
        .button {
            display: inline-block;
            padding: 15px 30px;
            margin: 10px;
            background: #FFD700;
            color: #1B5E20;
            text-decoration: none;
            border-radius: 10px;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="success">
        <div class="title">🎉 SUCCESS!</div>
        <div class="status">✅ Railway deployment is working</div>
        <div class="status">✅ Server routes are working</div>
        <div class="status">✅ HTML is rendering properly</div>
        <div class="status">🕌 Islamic Quiz Card Game</div>
        <div class="status">بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ</div>
        <br>
        <a href="/" class="button">Back to Home</a>
        <a href="/game" class="button">Try Phaser Version</a>
        <div style="margin-top: 20px; font-size: 14px;">
            Time: ${new Date().toISOString()}<br>
            This proves the server is working correctly!
        </div>
    </div>
    <script>
        console.log('✅ JavaScript is working in inline version!');
        alert('🎮 JavaScript execution confirmed!');
    </script>
</body>
</html>
            `);
        });

        // Simple working version route
        this.app.get('/simple', (req, res) => {
            const simplePath = path.join(__dirname, '../frontend/src/simple.html');
            res.sendFile(simplePath);
        });

        // Root route - serve simple version temporarily (v2.0)
        this.app.get('/', (req, res) => {
            console.log('Serving simple version');
            const simplePath = path.join(__dirname, '../frontend/src/simple.html');
            res.sendFile(simplePath);
        });

        // Original Phaser version route
        this.app.get('/game', (req, res) => {
            const indexPath = path.join(__dirname, '../frontend/dist/index.html');
            res.sendFile(indexPath, (err) => {
                if (err) {
                    console.error('Failed to serve index.html:', err);
                    res.status(500).json({
                        error: 'Frontend not built',
                        message: 'Run npm run build to generate frontend files'
                    });
                }
            });
        });

        // Serve frontend in production
        if (process.env.NODE_ENV === 'production') {
            this.app.get('*', (req, res) => {
                res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
            });
        }

        // Error handling
        this.app.use((err, req, res, next) => {
            console.error('Express error:', err);
            res.status(500).json({
                error: 'Internal server error',
                message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
            });
        });

        // 404 handler
        this.app.use((req, res) => {
            res.status(404).json({
                error: 'Not found',
                message: `Route ${req.method} ${req.path} not found`
            });
        });
    }

    setupSocketHandlers() {
        // Socket authentication middleware
        this.io.use(socketAuth);

        this.io.on('connection', (socket) => {
            console.log(`Player connected: ${socket.id}`);

            // Register player
            this.playerManager.addPlayer(socket);

            // Room management events
            socket.on('create_room', (data) => {
                this.handleCreateRoom(socket, data);
            });

            socket.on('join_room', (data) => {
                this.handleJoinRoom(socket, data);
            });

            socket.on('join_random_room', (data) => {
                this.handleJoinRandomRoom(socket, data);
            });

            socket.on('leave_room', (data) => {
                this.handleLeaveRoom(socket, data);
            });

            // Game events
            socket.on('start_game', (data) => {
                this.handleStartGame(socket, data);
            });

            socket.on('submit_answer', (data) => {
                this.handleSubmitAnswer(socket, data);
            });

            socket.on('draw_card', (data) => {
                this.handleDrawCard(socket, data);
            });

            socket.on('play_card', (data) => {
                this.handlePlayCard(socket, data);
            });

            // Chat events
            socket.on('chat_message', (data) => {
                this.handleChatMessage(socket, data);
            });

            // Player status events
            socket.on('player_ready', (data) => {
                this.handlePlayerReady(socket, data);
            });

            socket.on('ping', () => {
                socket.emit('pong');
            });

            // Disconnection
            socket.on('disconnect', (reason) => {
                console.log(`Player disconnected: ${socket.id}, reason: ${reason}`);
                this.handlePlayerDisconnect(socket, reason);
            });

            // Error handling
            socket.on('error', (error) => {
                console.error(`Socket error for ${socket.id}:`, error);
            });
        });
    }

    // Room management handlers
    handleCreateRoom(socket, data) {
        try {
            const { playerName, gameMode } = data;
            
            if (!playerName || playerName.trim().length < 2) {
                socket.emit('error', { message: 'Invalid player name' });
                return;
            }

            const room = this.gameRoomManager.createRoom(socket, playerName, gameMode);
            
            socket.emit('room_joined', {
                roomId: room.id,
                isHost: true,
                players: room.getPlayers(),
                gameMode: room.gameMode
            });

            console.log(`Room created: ${room.id} by ${playerName}`);
        } catch (error) {
            console.error('Error creating room:', error);
            socket.emit('error', { message: 'Failed to create room' });
        }
    }

    handleJoinRoom(socket, data) {
        try {
            const { roomId, playerName } = data;
            
            if (!roomId || !playerName || playerName.trim().length < 2) {
                socket.emit('error', { message: 'Invalid room ID or player name' });
                return;
            }

            const room = this.gameRoomManager.joinRoom(socket, roomId, playerName);
            
            if (room) {
                // Notify player
                socket.emit('room_joined', {
                    roomId: room.id,
                    isHost: false,
                    players: room.getPlayers(),
                    gameMode: room.gameMode
                });

                // Notify other players
                socket.to(roomId).emit('player_joined', {
                    players: room.getPlayers(),
                    newPlayer: { id: socket.id, name: playerName }
                });

                console.log(`${playerName} joined room: ${roomId}`);
            } else {
                socket.emit('error', { message: 'Room not found or full' });
            }
        } catch (error) {
            console.error('Error joining room:', error);
            socket.emit('error', { message: 'Failed to join room' });
        }
    }

    handleJoinRandomRoom(socket, data) {
        try {
            const { playerName, gameMode } = data;
            
            if (!playerName || playerName.trim().length < 2) {
                socket.emit('error', { message: 'Invalid player name' });
                return;
            }

            let room = this.gameRoomManager.findAvailableRoom(gameMode);
            
            if (!room) {
                // Create new room if none available
                room = this.gameRoomManager.createRoom(socket, playerName, gameMode);
                socket.emit('room_joined', {
                    roomId: room.id,
                    isHost: true,
                    players: room.getPlayers(),
                    gameMode: room.gameMode
                });
            } else {
                // Join existing room
                this.gameRoomManager.joinRoom(socket, room.id, playerName);
                socket.emit('room_joined', {
                    roomId: room.id,
                    isHost: false,
                    players: room.getPlayers(),
                    gameMode: room.gameMode
                });

                // Notify other players
                socket.to(room.id).emit('player_joined', {
                    players: room.getPlayers(),
                    newPlayer: { id: socket.id, name: playerName }
                });
            }

            console.log(`${playerName} joined random room: ${room.id}`);
        } catch (error) {
            console.error('Error joining random room:', error);
            socket.emit('error', { message: 'Failed to join random room' });
        }
    }

    handleLeaveRoom(socket, data) {
        try {
            const room = this.gameRoomManager.leaveRoom(socket);
            
            if (room) {
                // Notify other players
                socket.to(room.id).emit('player_left', {
                    players: room.getPlayers(),
                    playerId: socket.id
                });

                socket.emit('room_left', { roomId: room.id });
                console.log(`Player ${socket.id} left room: ${room.id}`);
            }
        } catch (error) {
            console.error('Error leaving room:', error);
            socket.emit('error', { message: 'Failed to leave room' });
        }
    }

    // Game handlers
    handleStartGame(socket, data) {
        try {
            const room = this.gameRoomManager.getPlayerRoom(socket.id);
            
            if (!room) {
                socket.emit('error', { message: 'Not in a room' });
                return;
            }

            if (!room.isHost(socket.id)) {
                socket.emit('error', { message: 'Only host can start game' });
                return;
            }

            if (room.players.length < 2) {
                socket.emit('error', { message: 'Need at least 2 players to start' });
                return;
            }

            // Start game
            const gameData = room.startGame(this.contentManager);
            
            // Notify all players
            this.io.to(room.id).emit('game_started', gameData);
            
            console.log(`Game started in room: ${room.id}`);
        } catch (error) {
            console.error('Error starting game:', error);
            socket.emit('error', { message: 'Failed to start game' });
        }
    }

    handleSubmitAnswer(socket, data) {
        try {
            const { roomId, questionId, selectedAnswer, timeTaken } = data;
            
            const room = this.gameRoomManager.getRoom(roomId);
            if (!room) {
                socket.emit('error', { message: 'Room not found' });
                return;
            }

            const result = room.submitAnswer(socket.id, questionId, selectedAnswer, timeTaken);
            
            // Send result to player
            socket.emit('answer_result', result);
            
            // Update other players if needed
            if (result.gameUpdate) {
                socket.to(roomId).emit('score_updated', result.gameUpdate);
            }

            // Check if round/game is complete
            if (result.nextQuestion) {
                this.io.to(roomId).emit('question_received', result.nextQuestion);
            } else if (result.gameEnded) {
                this.io.to(roomId).emit('game_ended', result.gameEnded);
            }

        } catch (error) {
            console.error('Error submitting answer:', error);
            socket.emit('error', { message: 'Failed to submit answer' });
        }
    }

    handleDrawCard(socket, data) {
        try {
            const { roomId } = data;
            
            const room = this.gameRoomManager.getRoom(roomId);
            if (!room) {
                socket.emit('error', { message: 'Room not found' });
                return;
            }

            const card = room.drawCard(socket.id);
            if (card) {
                socket.emit('card_drawn', { card });
            } else {
                socket.emit('error', { message: 'Cannot draw card' });
            }
        } catch (error) {
            console.error('Error drawing card:', error);
            socket.emit('error', { message: 'Failed to draw card' });
        }
    }

    handlePlayCard(socket, data) {
        try {
            const { roomId, cardId, targetPlayerId } = data;
            
            const room = this.gameRoomManager.getRoom(roomId);
            if (!room) {
                socket.emit('error', { message: 'Room not found' });
                return;
            }

            const result = room.playCard(socket.id, cardId, targetPlayerId);
            if (result.success) {
                // Notify all players
                this.io.to(roomId).emit('card_played', {
                    playerId: socket.id,
                    cardId: cardId,
                    effect: result.effect,
                    targetPlayerId: targetPlayerId
                });
            } else {
                socket.emit('error', { message: result.error });
            }
        } catch (error) {
            console.error('Error playing card:', error);
            socket.emit('error', { message: 'Failed to play card' });
        }
    }

    handleChatMessage(socket, data) {
        try {
            const { roomId, message, playerName } = data;
            
            // Validate message
            if (!message || message.trim().length === 0 || message.length > 200) {
                socket.emit('error', { message: 'Invalid message' });
                return;
            }

            // Basic profanity filter (extend as needed)
            const cleanMessage = this.filterMessage(message);
            
            // Broadcast to room
            this.io.to(roomId).emit('chat_message', {
                playerId: socket.id,
                playerName: playerName,
                message: cleanMessage,
                timestamp: Date.now()
            });
        } catch (error) {
            console.error('Error handling chat message:', error);
            socket.emit('error', { message: 'Failed to send message' });
        }
    }

    handlePlayerReady(socket, data) {
        try {
            const room = this.gameRoomManager.getPlayerRoom(socket.id);
            if (!room) {
                socket.emit('error', { message: 'Not in a room' });
                return;
            }

            room.setPlayerReady(socket.id, data.isReady);
            
            // Notify all players
            this.io.to(room.id).emit('player_ready_changed', {
                playerId: socket.id,
                isReady: data.isReady,
                players: room.getPlayers()
            });
        } catch (error) {
            console.error('Error handling player ready:', error);
            socket.emit('error', { message: 'Failed to update ready status' });
        }
    }

    handlePlayerDisconnect(socket, reason) {
        try {
            // Remove from player manager
            this.playerManager.removePlayer(socket.id);
            
            // Handle room cleanup
            const room = this.gameRoomManager.handlePlayerDisconnect(socket);
            
            if (room) {
                // Notify other players
                socket.to(room.id).emit('player_left', {
                    players: room.getPlayers(),
                    playerId: socket.id,
                    reason: 'disconnected'
                });
            }
        } catch (error) {
            console.error('Error handling player disconnect:', error);
        }
    }

    // Utility methods
    filterMessage(message) {
        // Basic implementation - extend with proper profanity filter
        return message.trim();
    }

    startServer() {
        const PORT = process.env.PORT || 4000;
        
        this.server.listen(PORT, () => {
            console.log(`🕌 Islamic Quiz Card Game Server running on port ${PORT}`);
            console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🌟 بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ`);
        });

        // Graceful shutdown
        process.on('SIGTERM', () => {
            console.log('SIGTERM received, shutting down gracefully');
            this.server.close(() => {
                console.log('Server closed');
                process.exit(0);
            });
        });

        process.on('SIGINT', () => {
            console.log('SIGINT received, shutting down gracefully');
            this.server.close(() => {
                console.log('Server closed');
                process.exit(0);
            });
        });
    }
}

// Start server
new IslamicQuizServer();

module.exports = IslamicQuizServer;