const GameRoom = require('../models/GameRoom');
const { v4: uuidv4 } = require('uuid');

class GameRoomManager {
    constructor(io) {
        this.io = io;
        this.rooms = new Map();
        this.playerRooms = new Map(); // playerId -> roomId mapping
        
        // Cleanup interval
        this.cleanupInterval = setInterval(() => {
            this.cleanupEmptyRooms();
        }, 30000); // Every 30 seconds
    }

    createRoom(hostSocket, playerName, gameMode = 'quick_match') {
        const roomId = this.generateRoomId();
        const room = new GameRoom(roomId, gameMode, this.io);
        
        // Add host to room
        room.addPlayer(hostSocket.id, playerName, true);
        hostSocket.join(roomId);
        
        // Store room and player mapping
        this.rooms.set(roomId, room);
        this.playerRooms.set(hostSocket.id, roomId);
        
        console.log(`Room created: ${roomId} by ${playerName}, mode: ${gameMode}`);
        return room;
    }

    joinRoom(socket, roomId, playerName) {
        const room = this.rooms.get(roomId);
        
        if (!room) {
            return null;
        }
        
        if (room.isFull()) {
            return null;
        }
        
        if (room.gameState !== 'waiting') {
            return null;
        }
        
        // Add player to room
        const success = room.addPlayer(socket.id, playerName, false);
        
        if (success) {
            socket.join(roomId);
            this.playerRooms.set(socket.id, roomId);
            return room;
        }
        
        return null;
    }

    leaveRoom(socket) {
        const roomId = this.playerRooms.get(socket.id);
        
        if (!roomId) {
            return null;
        }
        
        const room = this.rooms.get(roomId);
        
        if (room) {
            room.removePlayer(socket.id);
            socket.leave(roomId);
            this.playerRooms.delete(socket.id);
            
            // If room is empty, remove it
            if (room.isEmpty()) {
                this.rooms.delete(roomId);
                console.log(`Room ${roomId} removed - empty`);
            } else if (room.hostId === socket.id) {
                // Transfer host to another player
                room.transferHost();
            }
            
            return room;
        }
        
        return null;
    }

    findAvailableRoom(gameMode = 'quick_match') {
        for (const room of this.rooms.values()) {
            if (room.gameMode === gameMode && 
                !room.isFull() && 
                room.gameState === 'waiting') {
                return room;
            }
        }
        return null;
    }

    getRoom(roomId) {
        return this.rooms.get(roomId);
    }

    getPlayerRoom(playerId) {
        const roomId = this.playerRooms.get(playerId);
        return roomId ? this.rooms.get(roomId) : null;
    }

    handlePlayerDisconnect(socket) {
        const room = this.leaveRoom(socket);
        
        if (room && room.gameState === 'playing') {
            // Handle in-game disconnection
            room.handlePlayerDisconnect(socket.id);
        }
        
        return room;
    }

    generateRoomId() {
        let roomId;
        do {
            // Generate a 6-character room code
            roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
        } while (this.rooms.has(roomId));
        
        return roomId;
    }

    cleanupEmptyRooms() {
        const now = Date.now();
        const emptyRooms = [];
        
        for (const [roomId, room] of this.rooms) {
            // Remove rooms that have been empty for more than 5 minutes
            if (room.isEmpty() && (now - room.lastActivity) > 300000) {
                emptyRooms.push(roomId);
            }
            // Remove finished games older than 30 minutes
            else if (room.gameState === 'finished' && (now - room.gameEndTime) > 1800000) {
                emptyRooms.push(roomId);
            }
        }
        
        emptyRooms.forEach(roomId => {
            this.rooms.delete(roomId);
            console.log(`Room ${roomId} cleaned up - inactive`);
        });
    }

    // Statistics methods
    getActiveRoomsCount() {
        return this.rooms.size;
    }

    getWaitingRoomsCount() {
        let count = 0;
        for (const room of this.rooms.values()) {
            if (room.gameState === 'waiting') count++;
        }
        return count;
    }

    getPlayingRoomsCount() {
        let count = 0;
        for (const room of this.rooms.values()) {
            if (room.gameState === 'playing') count++;
        }
        return count;
    }

    getTotalPlayersCount() {
        let count = 0;
        for (const room of this.rooms.values()) {
            count += room.getPlayerCount();
        }
        return count;
    }

    getRoomStats() {
        const stats = {
            totalRooms: this.rooms.size,
            waitingRooms: this.getWaitingRoomsCount(),
            playingRooms: this.getPlayingRoomsCount(),
            totalPlayers: this.getTotalPlayersCount(),
            roomsByMode: {}
        };
        
        for (const room of this.rooms.values()) {
            if (!stats.roomsByMode[room.gameMode]) {
                stats.roomsByMode[room.gameMode] = 0;
            }
            stats.roomsByMode[room.gameMode]++;
        }
        
        return stats;
    }

    // Admin methods
    getAllRooms() {
        const roomList = [];
        for (const [roomId, room] of this.rooms) {
            roomList.push({
                id: roomId,
                gameMode: room.gameMode,
                gameState: room.gameState,
                playerCount: room.getPlayerCount(),
                maxPlayers: room.maxPlayers,
                createdAt: room.createdAt,
                lastActivity: room.lastActivity,
                hostId: room.hostId
            });
        }
        return roomList;
    }

    forceCloseRoom(roomId) {
        const room = this.rooms.get(roomId);
        if (room) {
            // Notify all players
            this.io.to(roomId).emit('room_closed', {
                reason: 'Room closed by administrator'
            });
            
            // Remove all players from the room
            for (const playerId of room.players.keys()) {
                this.playerRooms.delete(playerId);
            }
            
            // Remove room
            this.rooms.delete(roomId);
            return true;
        }
        return false;
    }

    // Periodic maintenance
    performMaintenance() {
        console.log('Performing room maintenance...');
        
        const before = this.rooms.size;
        this.cleanupEmptyRooms();
        const after = this.rooms.size;
        
        if (before !== after) {
            console.log(`Maintenance complete: ${before - after} rooms cleaned up`);
        }
        
        // Log current stats
        const stats = this.getRoomStats();
        console.log('Current room stats:', stats);
    }

    destroy() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
        
        // Close all rooms
        for (const roomId of this.rooms.keys()) {
            this.forceCloseRoom(roomId);
        }
        
        this.rooms.clear();
        this.playerRooms.clear();
    }
}

module.exports = GameRoomManager;