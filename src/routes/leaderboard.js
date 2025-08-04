const express = require('express');
const router = express.Router();

// This would typically be injected or imported differently
let playerManager = null;

// Middleware to ensure player manager is available
router.use((req, res, next) => {
    if (!playerManager) {
        playerManager = req.app.get('playerManager');
    }
    
    if (!playerManager) {
        return res.status(503).json({
            error: 'Leaderboard service unavailable',
            message: 'Player manager not initialized'
        });
    }
    
    next();
});

// GET /api/leaderboard/top
router.get('/top', (req, res) => {
    try {
        const { limit = 50, sortBy = 'totalScore' } = req.query;
        
        // Validate parameters
        const leaderboardLimit = Math.min(Math.max(parseInt(limit) || 50, 1), 100);
        const validSortOptions = ['totalScore', 'gamesWon', 'accuracy', 'winRate', 'gamesPlayed'];
        
        if (!validSortOptions.includes(sortBy)) {
            return res.status(400).json({
                error: 'Invalid sort option',
                message: `Sort by must be one of: ${validSortOptions.join(', ')}`
            });
        }
        
        const topPlayers = playerManager.getTopPlayers(leaderboardLimit);
        
        // Re-sort if different criteria requested
        if (sortBy !== 'totalScore') {
            topPlayers.sort((a, b) => {
                switch (sortBy) {
                    case 'gamesWon':
                        return b.gamesWon - a.gamesWon;
                    case 'accuracy':
                        return b.accuracy - a.accuracy;
                    case 'winRate':
                        return b.winRate - a.winRate;
                    case 'gamesPlayed':
                        return b.gamesPlayed - a.gamesPlayed;
                    default:
                        return b.totalScore - a.totalScore;
                }
            });
            
            // Update ranks after re-sorting
            topPlayers.forEach((player, index) => {
                player.rank = index + 1;
            });
        }
        
        res.json({
            success: true,
            leaderboard: topPlayers,
            sortBy: sortBy,
            count: topPlayers.length,
            limit: leaderboardLimit,
            generatedAt: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Error getting top players:', error);
        res.status(500).json({
            error: 'Failed to get leaderboard',
            message: error.message
        });
    }
});

// GET /api/leaderboard/player/:playerId
router.get('/player/:playerId', (req, res) => {
    try {
        const { playerId } = req.params;
        
        if (!playerId) {
            return res.status(400).json({
                error: 'Invalid player ID',
                message: 'Player ID is required'
            });
        }
        
        const player = playerManager.getPlayer(playerId);
        const stats = playerManager.getPlayerStats(playerId);
        
        if (!player && !stats) {
            return res.status(404).json({
                error: 'Player not found',
                message: `Player ${playerId} does not exist`
            });
        }
        
        // Calculate player's rank
        const topPlayers = playerManager.getTopPlayers(1000); // Get more players for accurate ranking
        const playerRank = topPlayers.findIndex(p => p.playerId === playerId) + 1;
        
        const playerData = {
            id: playerId,
            name: player?.name || 'Unknown',
            stats: stats || {},
            rank: playerRank || 'Unranked',
            isActive: player?.isActive || false,
            lastSeen: player?.lastActivity || stats?.sessionEnd,
            achievements: stats?.achievements || []
        };
        
        res.json({
            success: true,
            player: playerData
        });
        
    } catch (error) {
        console.error('Error getting player leaderboard data:', error);
        res.status(500).json({
            error: 'Failed to get player data',
            message: error.message
        });
    }
});

// GET /api/leaderboard/stats
router.get('/stats', (req, res) => {
    try {
        const stats = playerManager.getPlayerStatistics();
        
        // Add additional leaderboard statistics
        const leaderboardStats = {
            ...stats,
            leaderboardData: {
                topScore: stats.topPlayers.length > 0 ? stats.topPlayers[0].totalScore : 0,
                topPlayer: stats.topPlayers.length > 0 ? stats.topPlayers[0].playerName : null,
                averageScore: stats.topPlayers.length > 0 ? 
                    stats.topPlayers.reduce((sum, p) => sum + p.totalScore, 0) / stats.topPlayers.length : 0,
                totalAchievementsEarned: stats.topPlayers.reduce((sum, p) => sum + (p.achievements?.length || 0), 0)
            },
            generatedAt: new Date().toISOString()
        };
        
        res.json({
            success: true,
            stats: leaderboardStats
        });
        
    } catch (error) {
        console.error('Error getting leaderboard stats:', error);
        res.status(500).json({
            error: 'Failed to get leaderboard statistics',
            message: error.message
        });
    }
});

// GET /api/leaderboard/categories/:category
router.get('/categories/:category', (req, res) => {
    try {
        const { category } = req.params;
        const { limit = 25 } = req.query;
        
        // Validate category
        const validCategories = ['quran', 'hadith', 'fiqh', 'history', 'aqidah'];
        if (!validCategories.includes(category.toLowerCase())) {
            return res.status(400).json({
                error: 'Invalid category',
                message: `Category must be one of: ${validCategories.join(', ')}`
            });
        }
        
        const leaderboardLimit = Math.min(Math.max(parseInt(limit) || 25, 1), 100);
        
        // This is a simplified implementation
        // In a real application, you'd track category-specific statistics
        const topPlayers = playerManager.getTopPlayers(leaderboardLimit);
        
        // Filter players who have played in this category
        // For now, we'll just return top players with a note about category filtering
        const categoryLeaderboard = topPlayers.map(player => ({
            ...player,
            categorySpecific: false // Indicates this is general leaderboard, not category-specific
        }));
        
        res.json({
            success: true,
            leaderboard: categoryLeaderboard,
            category: category,
            count: categoryLeaderboard.length,
            limit: leaderboardLimit,
            note: 'Category-specific tracking not yet implemented, showing general leaderboard',
            generatedAt: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Error getting category leaderboard:', error);
        res.status(500).json({
            error: 'Failed to get category leaderboard',
            message: error.message
        });
    }
});

// GET /api/leaderboard/achievements
router.get('/achievements', (req, res) => {
    try {
        const { limit = 50 } = req.query;
        const achievementLimit = Math.min(Math.max(parseInt(limit) || 50, 1), 100);
        
        // Get all players with achievements
        const topPlayers = playerManager.getTopPlayers(1000); // Get more players
        const achievementLeaderboard = [];
        
        for (const player of topPlayers) {
            const stats = playerManager.getPlayerStats(player.playerId);
            if (stats && stats.achievements && stats.achievements.length > 0) {
                achievementLeaderboard.push({
                    playerId: player.playerId,
                    playerName: player.playerName,
                    achievementCount: stats.achievements.length,
                    achievements: stats.achievements,
                    latestAchievement: stats.achievements[stats.achievements.length - 1]
                });
            }
        }
        
        // Sort by achievement count
        achievementLeaderboard.sort((a, b) => b.achievementCount - a.achievementCount);
        
        // Add ranks
        achievementLeaderboard.forEach((player, index) => {
            player.rank = index + 1;
        });
        
        res.json({
            success: true,
            leaderboard: achievementLeaderboard.slice(0, achievementLimit),
            count: Math.min(achievementLeaderboard.length, achievementLimit),
            total: achievementLeaderboard.length,
            limit: achievementLimit,
            generatedAt: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Error getting achievement leaderboard:', error);
        res.status(500).json({
            error: 'Failed to get achievement leaderboard',
            message: error.message
        });
    }
});

// GET /api/leaderboard/recent
router.get('/recent', (req, res) => {
    try {
        const { hours = 24, limit = 25 } = req.query;
        
        const hoursBack = Math.min(Math.max(parseInt(hours) || 24, 1), 168); // Max 1 week
        const recentLimit = Math.min(Math.max(parseInt(limit) || 25, 1), 100);
        const cutoffTime = Date.now() - (hoursBack * 60 * 60 * 1000);
        
        // Get active players (this is a simplified implementation)
        const activePlayers = playerManager.getActivePlayers();
        
        // Filter players active in the specified time period
        const recentPlayers = activePlayers
            .filter(player => player.lastActivity > cutoffTime)
            .map(player => {
                const stats = playerManager.getPlayerStats(player.id);
                return {
                    playerId: player.id,
                    playerName: player.name,
                    lastActivity: player.lastActivity,
                    gamesPlayed: stats?.gamesPlayed || 0,
                    totalScore: stats?.totalScore || 0,
                    isCurrentlyOnline: player.isConnected
                };
            })
            .sort((a, b) => b.totalScore - a.totalScore)
            .slice(0, recentLimit);
        
        // Add ranks
        recentPlayers.forEach((player, index) => {
            player.rank = index + 1;
        });
        
        res.json({
            success: true,
            leaderboard: recentPlayers,
            timeFrame: `${hoursBack} hours`,
            count: recentPlayers.length,
            limit: recentLimit,
            generatedAt: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Error getting recent leaderboard:', error);
        res.status(500).json({
            error: 'Failed to get recent leaderboard',
            message: error.message
        });
    }
});

// GET /api/leaderboard/search
router.get('/search', (req, res) => {
    try {
        const { q: query, limit = 20 } = req.query;
        
        if (!query || query.trim().length < 2) {
            return res.status(400).json({
                error: 'Invalid query',
                message: 'Search query must be at least 2 characters long'
            });
        }
        
        const searchLimit = Math.min(Math.max(parseInt(limit) || 20, 1), 50);
        const searchTerm = query.trim().toLowerCase();
        
        // Search through all players
        const allPlayers = playerManager.getTopPlayers(1000); // Get many players for search
        
        const matchingPlayers = allPlayers
            .filter(player => 
                player.playerName.toLowerCase().includes(searchTerm)
            )
            .slice(0, searchLimit);
        
        res.json({
            success: true,
            results: matchingPlayers,
            query: query,
            count: matchingPlayers.length,
            limit: searchLimit
        });
        
    } catch (error) {
        console.error('Error searching leaderboard:', error);
        res.status(500).json({
            error: 'Failed to search leaderboard',
            message: error.message
        });
    }
});

// GET /api/leaderboard/health
router.get('/health', (req, res) => {
    try {
        const stats = playerManager.getPlayerStatistics();
        
        const isHealthy = stats.totalPlayers < 10000; // Arbitrary limit
        
        res.status(isHealthy ? 200 : 503).json({
            success: isHealthy,
            status: isHealthy ? 'healthy' : 'unhealthy',
            playerStats: {
                totalPlayers: stats.totalPlayers,
                activePlayers: stats.activePlayers,
                playingPlayers: stats.playingPlayers
            },
            leaderboardSize: stats.topPlayers.length,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Error checking leaderboard health:', error);
        res.status(500).json({
            error: 'Leaderboard service unhealthy',
            message: error.message
        });
    }
});

// Error handling middleware
router.use((error, req, res, next) => {
    console.error('Leaderboard API error:', error);
    
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
});

module.exports = router;