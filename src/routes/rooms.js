const express = require('express');
const router = express.Router();

// This would typically be injected or imported differently
let gameRoomManager = null;

// Middleware to ensure room manager is available
router.use((req, res, next) => {
    if (!gameRoomManager) {
        gameRoomManager = req.app.get('gameRoomManager');
    }
    
    if (!gameRoomManager) {
        return res.status(503).json({
            error: 'Room service unavailable',
            message: 'Game room manager not initialized'
        });
    }
    
    next();
});

// GET /api/rooms/stats
router.get('/stats', (req, res) => {
    try {
        const stats = gameRoomManager.getRoomStats();
        
        res.json({
            success: true,
            stats: stats,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Error getting room stats:', error);
        res.status(500).json({
            error: 'Failed to get room statistics',
            message: error.message
        });
    }
});

// GET /api/rooms/list (Admin only - would need authentication)
router.get('/list', (req, res) => {
    try {
        // In production, this would require admin authentication
        const rooms = gameRoomManager.getAllRooms();
        
        res.json({
            success: true,
            rooms: rooms,
            count: rooms.length,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Error getting room list:', error);
        res.status(500).json({
            error: 'Failed to get room list',
            message: error.message
        });
    }
});

// GET /api/rooms/:roomId
router.get('/:roomId', (req, res) => {
    try {
        const { roomId } = req.params;
        
        if (!roomId || roomId.length < 4) {
            return res.status(400).json({
                error: 'Invalid room ID',
                message: 'Room ID must be at least 4 characters long'
            });
        }
        
        const room = gameRoomManager.getRoom(roomId);
        
        if (!room) {
            return res.status(404).json({
                error: 'Room not found',
                message: `Room ${roomId} does not exist`
            });
        }
        
        // Return public room information
        const roomInfo = {
            id: room.id,
            gameMode: room.gameMode,
            gameState: room.gameState,
            playerCount: room.getPlayerCount(),
            maxPlayers: room.maxPlayers,
            players: room.getPlayers().map(player => ({
                id: player.id,
                name: player.name,
                isHost: player.isHost,
                isReady: player.isReady,
                isConnected: player.isConnected
            })),
            gameSettings: room.gameSettings,
            createdAt: room.createdAt,
            canJoin: !room.isFull() && room.gameState === 'waiting'
        };
        
        res.json({
            success: true,
            room: roomInfo
        });
        
    } catch (error) {
        console.error('Error getting room info:', error);
        res.status(500).json({
            error: 'Failed to get room information',
            message: error.message
        });
    }
});

// GET /api/rooms/available/:gameMode
router.get('/available/:gameMode', (req, res) => {
    try {
        const { gameMode } = req.params;
        const { limit = 10 } = req.query;
        
        // Validate game mode
        const validGameModes = ['quick_match', 'tournament', 'custom', 'practice'];
        if (!validGameModes.includes(gameMode)) {
            return res.status(400).json({
                error: 'Invalid game mode',
                message: `Game mode must be one of: ${validGameModes.join(', ')}`
            });
        }
        
        const roomLimit = Math.min(Math.max(parseInt(limit) || 10, 1), 50);
        const allRooms = gameRoomManager.getAllRooms();
        
        // Filter available rooms
        const availableRooms = allRooms
            .filter(room => 
                room.gameMode === gameMode &&
                room.gameState === 'waiting' &&
                room.playerCount < room.maxPlayers
            )
            .sort((a, b) => b.playerCount - a.playerCount) // Sort by player count (fuller rooms first)
            .slice(0, roomLimit)
            .map(room => ({
                id: room.id,
                gameMode: room.gameMode,
                playerCount: room.playerCount,
                maxPlayers: room.maxPlayers,
                createdAt: room.createdAt,
                canJoin: true
            }));
        
        res.json({
            success: true,
            rooms: availableRooms,
            gameMode: gameMode,
            count: availableRooms.length,
            limit: roomLimit
        });
        
    } catch (error) {
        console.error('Error getting available rooms:', error);
        res.status(500).json({
            error: 'Failed to get available rooms',
            message: error.message
        });
    }
});

// POST /api/rooms/:roomId/join (validate if room can be joined)
router.post('/:roomId/join', (req, res) => {
    try {
        const { roomId } = req.params;
        const { playerName } = req.body;
        
        if (!roomId || roomId.length < 4) {
            return res.status(400).json({
                error: 'Invalid room ID',
                message: 'Room ID must be at least 4 characters long'
            });
        }
        
        if (!playerName || playerName.trim().length < 2) {
            return res.status(400).json({
                error: 'Invalid player name',
                message: 'Player name must be at least 2 characters long'
            });
        }
        
        const room = gameRoomManager.getRoom(roomId);
        
        if (!room) {
            return res.status(404).json({
                error: 'Room not found',
                message: `Room ${roomId} does not exist`
            });
        }
        
        if (room.isFull()) {
            return res.status(409).json({
                error: 'Room is full',
                message: 'This room has reached maximum capacity'
            });
        }
        
        if (room.gameState !== 'waiting') {
            return res.status(409).json({
                error: 'Game in progress',
                message: 'Cannot join room - game is already in progress'
            });
        }
        
        // Check if player name is already taken in this room
        const existingPlayer = room.getPlayers().find(p => 
            p.name.toLowerCase() === playerName.trim().toLowerCase()
        );
        
        if (existingPlayer) {
            return res.status(409).json({
                error: 'Name taken',
                message: 'A player with this name is already in the room'
            });
        }
        
        // Room can be joined
        res.json({
            success: true,
            canJoin: true,
            room: {
                id: room.id,
                gameMode: room.gameMode,
                playerCount: room.getPlayerCount(),
                maxPlayers: room.maxPlayers
            },
            message: 'Room is available to join'
        });
        
    } catch (error) {
        console.error('Error validating room join:', error);
        res.status(500).json({
            error: 'Failed to validate room join',
            message: error.message
        });
    }
});

// DELETE /api/rooms/:roomId (Admin only - force close room)
router.delete('/:roomId', (req, res) => {
    try {
        const { roomId } = req.params;
        
        // In production, this would require admin authentication
        const success = gameRoomManager.forceCloseRoom(roomId);
        
        if (success) {
            res.json({
                success: true,
                message: `Room ${roomId} has been closed`
            });
        } else {
            res.status(404).json({
                error: 'Room not found',
                message: `Room ${roomId} does not exist`
            });
        }
        
    } catch (error) {
        console.error('Error closing room:', error);
        res.status(500).json({
            error: 'Failed to close room',
            message: error.message
        });
    }
});

// POST /api/rooms/cleanup (Admin only - trigger cleanup)
router.post('/cleanup', (req, res) => {
    try {
        // In production, this would require admin authentication
        gameRoomManager.performMaintenance();
        
        const stats = gameRoomManager.getRoomStats();
        
        res.json({
            success: true,
            message: 'Room cleanup completed',
            stats: stats
        });
        
    } catch (error) {
        console.error('Error performing room cleanup:', error);
        res.status(500).json({
            error: 'Failed to perform cleanup',
            message: error.message
        });
    }
});

// GET /api/rooms/health
router.get('/health', (req, res) => {
    try {
        const stats = gameRoomManager.getRoomStats();
        
        // Simple health check
        const isHealthy = stats.totalRooms < 1000; // Arbitrary limit
        
        res.status(isHealthy ? 200 : 503).json({
            success: isHealthy,
            status: isHealthy ? 'healthy' : 'unhealthy',
            stats: stats,
            limits: {
                maxRooms: 1000,
                currentRooms: stats.totalRooms
            },
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Error checking room service health:', error);
        res.status(500).json({
            error: 'Room service unhealthy',
            message: error.message
        });
    }
});

// Error handling middleware
router.use((error, req, res, next) => {
    console.error('Rooms API error:', error);
    
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
});

module.exports = router;