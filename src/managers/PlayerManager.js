class PlayerManager {
    constructor() {
        this.players = new Map(); // socketId -> playerData
        this.playersByName = new Map(); // playerName -> socketId (for uniqueness)
        this.playerStats = new Map(); // socketId -> stats
        
        // Session tracking
        this.activeSessions = new Map();
        this.connectionHistory = [];
        
        // Cleanup interval
        this.cleanupInterval = setInterval(() => {
            this.cleanupInactivePlayers();
        }, 60000); // Every minute
    }

    addPlayer(socket) {
        const playerId = socket.id;
        const playerName = socket.playerName || 'Anonymous';
        const joinTime = Date.now();
        
        // Check if name is already taken
        if (this.playersByName.has(playerName) && playerName !== 'Anonymous') {
            // Generate unique name
            let counter = 1;
            let uniqueName = `${playerName}${counter}`;
            while (this.playersByName.has(uniqueName)) {
                counter++;
                uniqueName = `${playerName}${counter}`;
            }
            socket.playerName = uniqueName;
        }
        
        const playerData = {
            id: playerId,
            name: socket.playerName || playerName,
            socket: socket,
            
            // Connection info
            joinTime: joinTime,
            lastActivity: joinTime,
            ipAddress: socket.handshake.address,
            userAgent: socket.handshake.headers['user-agent'],
            
            // Game state
            isInRoom: false,
            currentRoomId: null,
            isPlaying: false,
            
            // Session data
            gamesPlayed: 0,
            totalScore: 0,
            questionsAnswered: 0,
            correctAnswers: 0,
            
            // Status
            isConnected: true,
            isActive: true
        };
        
        // Store player data
        this.players.set(playerId, playerData);
        this.playersByName.set(playerData.name, playerId);
        
        // Initialize stats
        this.playerStats.set(playerId, {
            sessionStart: joinTime,
            gamesPlayed: 0,
            gamesWon: 0,
            totalScore: 0,
            questionsAnswered: 0,
            correctAnswers: 0,
            averageResponseTime: 0,
            categoriesPlayed: new Set(),
            achievements: []
        });
        
        // Track connection
        this.connectionHistory.push({
            playerId,
            playerName: playerData.name,
            action: 'connected',
            timestamp: joinTime,
            ipAddress: playerData.ipAddress
        });
        
        // Setup activity tracking
        this.setupActivityTracking(socket);
        
        console.log(`Player added: ${playerData.name} (${playerId})`);
        return playerData;
    }

    removePlayer(playerId) {
        const player = this.players.get(playerId);
        
        if (!player) {
            return false;
        }
        
        // Track disconnection
        this.connectionHistory.push({
            playerId,
            playerName: player.name,
            action: 'disconnected',
            timestamp: Date.now(),
            sessionDuration: Date.now() - player.joinTime
        });
        
        // Remove from maps
        this.players.delete(playerId);
        this.playersByName.delete(player.name);
        
        // Keep stats for a while (cleanup will handle it)
        const stats = this.playerStats.get(playerId);
        if (stats) {
            stats.sessionEnd = Date.now();
            stats.isActive = false;
        }
        
        console.log(`Player removed: ${player.name} (${playerId})`);
        return true;
    }

    setupActivityTracking(socket) {
        const playerId = socket.id;
        
        // Track various activities
        const activities = [
            'create_room', 'join_room', 'leave_room', 'start_game',
            'submit_answer', 'draw_card', 'play_card', 'chat_message'
        ];
        
        activities.forEach(activity => {
            socket.on(activity, () => {
                this.updatePlayerActivity(playerId, activity);
            });
        });
        
        // Track ping/pong for connection health
        socket.on('ping', () => {
            this.updatePlayerActivity(playerId, 'ping');
            socket.emit('pong');
        });
    }

    updatePlayerActivity(playerId, activity = 'general') {
        const player = this.players.get(playerId);
        if (player) {
            player.lastActivity = Date.now();
            
            // Log specific activities
            if (activity !== 'ping' && activity !== 'general') {
                console.log(`Player activity: ${player.name} - ${activity}`);
            }
        }
    }

    // Player state management
    setPlayerInRoom(playerId, roomId) {
        const player = this.players.get(playerId);
        if (player) {
            player.isInRoom = true;
            player.currentRoomId = roomId;
            this.updatePlayerActivity(playerId, 'joined_room');
        }
    }

    setPlayerLeftRoom(playerId) {
        const player = this.players.get(playerId);
        if (player) {
            player.isInRoom = false;
            player.currentRoomId = null;
            player.isPlaying = false;
            this.updatePlayerActivity(playerId, 'left_room');
        }
    }

    setPlayerPlaying(playerId, isPlaying) {
        const player = this.players.get(playerId);
        if (player) {
            player.isPlaying = isPlaying;
            this.updatePlayerActivity(playerId, isPlaying ? 'game_started' : 'game_ended');
        }
    }

    // Statistics management
    updatePlayerStats(playerId, gameResult) {
        const stats = this.playerStats.get(playerId);
        if (!stats) return;
        
        stats.gamesPlayed++;
        
        if (gameResult.won) {
            stats.gamesWon++;
        }
        
        stats.totalScore += gameResult.score || 0;
        stats.questionsAnswered += gameResult.questionsAnswered || 0;
        stats.correctAnswers += gameResult.correctAnswers || 0;
        
        // Update average response time
        if (gameResult.averageResponseTime) {
            const totalGames = stats.gamesPlayed;
            stats.averageResponseTime = 
                ((stats.averageResponseTime * (totalGames - 1)) + gameResult.averageResponseTime) / totalGames;
        }
        
        // Track categories played
        if (gameResult.categories) {
            gameResult.categories.forEach(category => {
                stats.categoriesPlayed.add(category);
            });
        }
        
        // Check for achievements
        this.checkAchievements(playerId, stats);
        
        this.updatePlayerActivity(playerId, 'stats_updated');
    }

    checkAchievements(playerId, stats) {
        const achievements = [];
        
        // First game achievement
        if (stats.gamesPlayed === 1) {
            achievements.push({
                id: 'first_game',
                name: 'First Steps',
                description: 'Played your first game',
                earnedAt: Date.now()
            });
        }
        
        // Perfect game achievement
        if (stats.questionsAnswered > 0 && 
            (stats.correctAnswers / stats.questionsAnswered) >= 1.0) {
            achievements.push({
                id: 'perfect_game',
                name: 'Mastery',
                description: 'Answered all questions correctly in a game',
                earnedAt: Date.now()
            });
        }
        
        // Games played milestones
        const gameMilestones = [5, 10, 25, 50, 100];
        if (gameMilestones.includes(stats.gamesPlayed)) {
            achievements.push({
                id: `games_${stats.gamesPlayed}`,
                name: `${stats.gamesPlayed} Games`,
                description: `Played ${stats.gamesPlayed} games`,
                earnedAt: Date.now()
            });
        }
        
        // Category achievements
        const categoryMilestones = [3, 5];
        if (categoryMilestones.includes(stats.categoriesPlayed.size)) {
            achievements.push({
                id: `categories_${stats.categoriesPlayed.size}`,
                name: 'Well Rounded',
                description: `Played in ${stats.categoriesPlayed.size} different categories`,
                earnedAt: Date.now()
            });
        }
        
        // Add new achievements
        achievements.forEach(achievement => {
            if (!stats.achievements.find(a => a.id === achievement.id)) {
                stats.achievements.push(achievement);
                
                // Notify player
                const player = this.players.get(playerId);
                if (player && player.socket) {
                    player.socket.emit('achievement_earned', achievement);
                }
            }
        });
    }

    // Query methods
    getPlayer(playerId) {
        return this.players.get(playerId);
    }

    getPlayerByName(playerName) {
        const playerId = this.playersByName.get(playerName);
        return playerId ? this.players.get(playerId) : null;
    }

    getPlayerStats(playerId) {
        return this.playerStats.get(playerId);
    }

    getAllPlayers() {
        return Array.from(this.players.values()).map(player => ({
            id: player.id,
            name: player.name,
            joinTime: player.joinTime,
            lastActivity: player.lastActivity,
            isInRoom: player.isInRoom,
            currentRoomId: player.currentRoomId,
            isPlaying: player.isPlaying,
            isConnected: player.isConnected,
            isActive: player.isActive
        }));
    }

    getActivePlayers() {
        const now = Date.now();
        const activeThreshold = 5 * 60 * 1000; // 5 minutes
        
        return Array.from(this.players.values()).filter(player => 
            player.isConnected && 
            player.isActive && 
            (now - player.lastActivity) < activeThreshold
        );
    }

    getPlayersInRooms() {
        return Array.from(this.players.values()).filter(player => player.isInRoom);
    }

    getPlayingPlayers() {
        return Array.from(this.players.values()).filter(player => player.isPlaying);
    }

    // Statistics methods
    getActivePlayersCount() {
        return this.getActivePlayers().length;
    }

    getTotalPlayersCount() {
        return this.players.size;
    }

    getPlayersInRoomsCount() {
        return this.getPlayersInRooms().length;
    }

    getPlayingPlayersCount() {
        return this.getPlayingPlayers().length;
    }

    getPlayerStatistics() {
        const allStats = Array.from(this.playerStats.values());
        const activeStats = allStats.filter(stats => stats.isActive !== false);
        
        return {
            totalPlayers: this.players.size,
            activePlayers: this.getActivePlayersCount(),
            playersInRooms: this.getPlayersInRoomsCount(),
            playingPlayers: this.getPlayingPlayersCount(),
            totalGamesPlayed: allStats.reduce((sum, stats) => sum + stats.gamesPlayed, 0),
            totalQuestionsAnswered: allStats.reduce((sum, stats) => sum + stats.questionsAnswered, 0),
            totalCorrectAnswers: allStats.reduce((sum, stats) => sum + stats.correctAnswers, 0),
            averageAccuracy: this.calculateOverallAccuracy(activeStats),
            topPlayers: this.getTopPlayers(10)
        };
    }

    calculateOverallAccuracy(stats) {
        const totalQuestions = stats.reduce((sum, s) => sum + s.questionsAnswered, 0);
        const totalCorrect = stats.reduce((sum, s) => sum + s.correctAnswers, 0);
        
        return totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;
    }

    getTopPlayers(limit = 10) {
        const activeStats = Array.from(this.playerStats.entries())
            .filter(([_, stats]) => stats.isActive !== false && stats.gamesPlayed > 0);
        
        return activeStats
            .map(([playerId, stats]) => {
                const player = this.players.get(playerId);
                return {
                    playerId,
                    playerName: player?.name || 'Unknown',
                    gamesPlayed: stats.gamesPlayed,
                    gamesWon: stats.gamesWon,
                    totalScore: stats.totalScore,
                    averageScore: stats.gamesPlayed > 0 ? stats.totalScore / stats.gamesPlayed : 0,
                    accuracy: stats.questionsAnswered > 0 ? 
                        (stats.correctAnswers / stats.questionsAnswered) * 100 : 0,
                    winRate: stats.gamesPlayed > 0 ? 
                        (stats.gamesWon / stats.gamesPlayed) * 100 : 0
                };
            })
            .sort((a, b) => b.totalScore - a.totalScore)
            .slice(0, limit);
    }

    // Cleanup methods
    cleanupInactivePlayers() {
        const now = Date.now();
        const inactiveThreshold = 30 * 60 * 1000; // 30 minutes
        const inactivePlayers = [];
        
        for (const [playerId, player] of this.players) {
            if (!player.isConnected || 
                (now - player.lastActivity) > inactiveThreshold) {
                inactivePlayers.push(playerId);
            }
        }
        
        inactivePlayers.forEach(playerId => {
            this.removePlayer(playerId);
        });
        
        if (inactivePlayers.length > 0) {
            console.log(`Cleaned up ${inactivePlayers.length} inactive players`);
        }
        
        // Cleanup old connection history
        this.cleanupConnectionHistory();
    }

    cleanupConnectionHistory() {
        const now = Date.now();
        const historyThreshold = 24 * 60 * 60 * 1000; // 24 hours
        
        this.connectionHistory = this.connectionHistory.filter(
            entry => (now - entry.timestamp) < historyThreshold
        );
    }

    // Admin methods
    kickPlayer(playerId, reason = 'Kicked by administrator') {
        const player = this.players.get(playerId);
        if (player && player.socket) {
            player.socket.emit('kicked', { reason });
            player.socket.disconnect(true);
            return true;
        }
        return false;
    }

    banPlayer(playerId, duration = 24 * 60 * 60 * 1000) {
        const player = this.players.get(playerId);
        if (player) {
            // In a real implementation, you'd store this in a database
            console.log(`Player banned: ${player.name} for ${duration}ms`);
            return this.kickPlayer(playerId, 'You have been banned');
        }
        return false;
    }

    sendMessageToPlayer(playerId, message) {
        const player = this.players.get(playerId);
        if (player && player.socket) {
            player.socket.emit('admin_message', { message });
            return true;
        }
        return false;
    }

    broadcastMessage(message) {
        let sentCount = 0;
        for (const player of this.players.values()) {
            if (player.socket && player.isConnected) {
                player.socket.emit('admin_broadcast', { message });
                sentCount++;
            }
        }
        return sentCount;
    }

    // Export/Import methods for persistence
    exportPlayerData() {
        const data = {
            players: Array.from(this.players.entries()),
            stats: Array.from(this.playerStats.entries()),
            connectionHistory: this.connectionHistory.slice(-1000), // Last 1000 entries
            exportTime: Date.now()
        };
        
        return JSON.stringify(data);
    }

    importPlayerData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            // Only import stats and history, not active connections
            if (data.stats) {
                data.stats.forEach(([playerId, stats]) => {
                    this.playerStats.set(playerId, { ...stats, isActive: false });
                });
            }
            
            if (data.connectionHistory) {
                this.connectionHistory = data.connectionHistory;
            }
            
            return true;
        } catch (error) {
            console.error('Failed to import player data:', error);
            return false;
        }
    }

    destroy() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
        
        this.players.clear();
        this.playersByName.clear();
        this.playerStats.clear();
        this.connectionHistory = [];
    }
}

module.exports = PlayerManager;