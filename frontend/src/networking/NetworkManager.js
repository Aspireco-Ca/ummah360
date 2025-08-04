import { io } from 'socket.io-client';

class NetworkManager {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.gameRoom = null;
        this.playerId = null;
        this.playerName = '';
        this.callbacks = {};
        
        // Server configuration
        this.serverUrl = process.env.NODE_ENV === 'production' 
            ? 'wss://your-production-server.com' 
            : 'ws://localhost:4000';
    }

    connect(playerName = 'Anonymous') {
        return new Promise((resolve, reject) => {
            try {
                this.playerName = playerName;
                
                this.socket = io(this.serverUrl, {
                    transports: ['websocket', 'polling'],
                    timeout: 5000,
                    forceNew: true
                });

                this.socket.on('connect', () => {
                    console.log('Connected to game server');
                    this.isConnected = true;
                    this.playerId = this.socket.id;
                    resolve();
                });

                this.socket.on('connect_error', (error) => {
                    console.error('Connection failed:', error);
                    this.isConnected = false;
                    reject(error);
                });

                this.socket.on('disconnect', (reason) => {
                    console.log('Disconnected from server:', reason);
                    this.isConnected = false;
                    this.emit('disconnected', reason);
                });

                // Game event listeners
                this.setupGameEventListeners();

            } catch (error) {
                console.error('Failed to connect:', error);
                reject(error);
            }
        });
    }

    setupGameEventListeners() {
        // Room management
        this.socket.on('room_joined', (data) => {
            this.gameRoom = data.roomId;
            this.emit('roomJoined', data);
        });

        this.socket.on('room_left', (data) => {
            this.gameRoom = null;
            this.emit('roomLeft', data);
        });

        this.socket.on('player_joined', (data) => {
            this.emit('playerJoined', data);
        });

        this.socket.on('player_left', (data) => {
            this.emit('playerLeft', data);
        });

        // Game state events
        this.socket.on('game_started', (data) => {
            this.emit('gameStarted', data);
        });

        this.socket.on('game_ended', (data) => {
            this.emit('gameEnded', data);
        });

        this.socket.on('question_received', (data) => {
            this.emit('questionReceived', data);
        });

        this.socket.on('answer_result', (data) => {
            this.emit('answerResult', data);
        });

        this.socket.on('score_updated', (data) => {
            this.emit('scoreUpdated', data);
        });

        this.socket.on('turn_changed', (data) => {
            this.emit('turnChanged', data);
        });

        // Card game specific events
        this.socket.on('card_drawn', (data) => {
            this.emit('cardDrawn', data);
        });

        this.socket.on('card_played', (data) => {
            this.emit('cardPlayed', data);
        });

        // Chat and communication
        this.socket.on('chat_message', (data) => {
            this.emit('chatMessage', data);
        });

        // Error handling
        this.socket.on('error', (error) => {
            console.error('Server error:', error);
            this.emit('error', error);
        });
    }

    // Room management methods
    createRoom(gameMode = 'quick_match') {
        if (!this.isConnected) return false;
        
        this.socket.emit('create_room', {
            playerName: this.playerName,
            gameMode: gameMode
        });
        return true;
    }

    joinRoom(roomId) {
        if (!this.isConnected) return false;
        
        this.socket.emit('join_room', {
            roomId: roomId,
            playerName: this.playerName
        });
        return true;
    }

    joinRandomRoom(gameMode = 'quick_match') {
        if (!this.isConnected) return false;
        
        this.socket.emit('join_random_room', {
            playerName: this.playerName,
            gameMode: gameMode
        });
        return true;
    }

    leaveRoom() {
        if (!this.isConnected || !this.gameRoom) return false;
        
        this.socket.emit('leave_room', {
            roomId: this.gameRoom
        });
        return true;
    }

    // Game action methods
    startGame() {
        if (!this.isConnected || !this.gameRoom) return false;
        
        this.socket.emit('start_game', {
            roomId: this.gameRoom
        });
        return true;
    }

    submitAnswer(questionId, selectedAnswer, timeTaken) {
        if (!this.isConnected || !this.gameRoom) return false;
        
        this.socket.emit('submit_answer', {
            roomId: this.gameRoom,
            questionId: questionId,
            selectedAnswer: selectedAnswer,
            timeTaken: timeTaken
        });
        return true;
    }

    drawCard() {
        if (!this.isConnected || !this.gameRoom) return false;
        
        this.socket.emit('draw_card', {
            roomId: this.gameRoom
        });
        return true;
    }

    playCard(cardId, targetPlayerId = null) {
        if (!this.isConnected || !this.gameRoom) return false;
        
        this.socket.emit('play_card', {
            roomId: this.gameRoom,
            cardId: cardId,
            targetPlayerId: targetPlayerId
        });
        return true;
    }

    // Chat methods
    sendChatMessage(message) {
        if (!this.isConnected || !this.gameRoom) return false;
        
        this.socket.emit('chat_message', {
            roomId: this.gameRoom,
            message: message,
            playerName: this.playerName
        });
        return true;
    }

    // Event system
    on(event, callback) {
        if (!this.callbacks[event]) {
            this.callbacks[event] = [];
        }
        this.callbacks[event].push(callback);
    }

    off(event, callback) {
        if (!this.callbacks[event]) return;
        
        const index = this.callbacks[event].indexOf(callback);
        if (index > -1) {
            this.callbacks[event].splice(index, 1);
        }
    }

    emit(event, data) {
        if (this.callbacks[event]) {
            this.callbacks[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event callback for ${event}:`, error);
                }
            });
        }
    }

    // Utility methods
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
        this.isConnected = false;
        this.gameRoom = null;
        this.playerId = null;
    }

    getConnectionStatus() {
        return {
            isConnected: this.isConnected,
            playerId: this.playerId,
            playerName: this.playerName,
            gameRoom: this.gameRoom
        };
    }

    // Reconnection logic
    reconnect() {
        if (this.socket) {
            this.disconnect();
        }
        return this.connect(this.playerName);
    }
}

export default NetworkManager;