const IslamicQuestion = require('../../frontend/src/components/IslamicQuestion');

class GameRoom {
    constructor(id, gameMode, io) {
        this.id = id;
        this.gameMode = gameMode;
        this.io = io;
        
        // Room settings
        this.maxPlayers = 4;
        this.minPlayers = 2;
        
        // Player management
        this.players = new Map(); // playerId -> playerData
        this.hostId = null;
        
        // Game state
        this.gameState = 'waiting'; // waiting, playing, finished
        this.currentQuestionIndex = 0;
        this.questions = [];
        this.gameSettings = {
            questionCount: 20,
            timePerQuestion: 30,
            categories: ['all'],
            difficulty: 'mixed'
        };
        
        // Timing
        this.createdAt = Date.now();
        this.lastActivity = Date.now();
        this.gameStartTime = null;
        this.gameEndTime = null;
        
        // Game mechanics
        this.currentTurn = 0;
        this.cardDeck = [];
        this.turnTimer = null;
        this.questionTimer = null;
        
        // Scoring
        this.scores = new Map(); // playerId -> score
        this.roundAnswers = new Map(); // playerId -> answerData
    }

    // Player management
    addPlayer(playerId, playerName, isHost = false) {
        if (this.players.size >= this.maxPlayers) {
            return false;
        }
        
        if (this.gameState !== 'waiting') {
            return false;
        }
        
        const playerData = {
            id: playerId,
            name: playerName,
            isHost: isHost,
            isReady: false,
            score: 0,
            cards: [],
            isConnected: true,
            joinedAt: Date.now()
        };
        
        this.players.set(playerId, playerData);
        this.scores.set(playerId, 0);
        
        if (isHost || !this.hostId) {
            this.hostId = playerId;
            playerData.isHost = true;
        }
        
        this.updateActivity();
        return true;
    }

    removePlayer(playerId) {
        const player = this.players.get(playerId);
        
        if (!player) {
            return false;
        }
        
        this.players.delete(playerId);
        this.scores.delete(playerId);
        this.roundAnswers.delete(playerId);
        
        // Transfer host if needed
        if (this.hostId === playerId && this.players.size > 0) {
            this.transferHost();
        }
        
        this.updateActivity();
        return true;
    }

    transferHost() {
        if (this.players.size === 0) {
            this.hostId = null;
            return;
        }
        
        // Find next suitable host
        for (const [playerId, player] of this.players) {
            if (player.isConnected) {
                this.hostId = playerId;
                player.isHost = true;
                
                // Notify new host
                this.io.to(playerId).emit('host_transferred', {
                    roomId: this.id,
                    isHost: true
                });
                
                // Notify other players
                this.io.to(this.id).emit('host_changed', {
                    newHostId: playerId,
                    newHostName: player.name
                });
                
                break;
            }
        }
    }

    setPlayerReady(playerId, isReady) {
        const player = this.players.get(playerId);
        if (player) {
            player.isReady = isReady;
            this.updateActivity();
            return true;
        }
        return false;
    }

    // Game state management
    canStartGame() {
        if (this.players.size < this.minPlayers) {
            return false;
        }
        
        // Check if all players are ready (except host)
        for (const [playerId, player] of this.players) {
            if (!player.isHost && !player.isReady) {
                return false;
            }
        }
        
        return true;
    }

    startGame(contentManager) {
        if (!this.canStartGame()) {
            throw new Error('Cannot start game - not all players ready');
        }
        
        this.gameState = 'playing';
        this.gameStartTime = Date.now();
        
        // Generate questions
        this.generateQuestions(contentManager);
        
        // Initialize cards for each player
        this.initializeCards();
        
        // Start first question
        this.currentQuestionIndex = 0;
        
        const gameData = {
            roomId: this.id,
            players: this.getPlayers(),
            gameSettings: this.gameSettings,
            totalQuestions: this.questions.length,
            currentQuestion: this.getCurrentQuestion()
        };
        
        this.updateActivity();
        return gameData;
    }

    generateQuestions(contentManager) {
        const { questionCount, categories, difficulty } = this.gameSettings;
        
        // For now, use the frontend question system
        // In production, this would query a proper database
        let allQuestions = [];
        
        if (categories.includes('all') || categories.length === 0) {
            allQuestions = [
                ...IslamicQuestion.getQuranQuestions(),
                ...IslamicQuestion.getHadithQuestions(),
                ...IslamicQuestion.getFiqhQuestions(),
                ...IslamicQuestion.getHistoryQuestions(),
                ...IslamicQuestion.getAqidahQuestions()
            ];
        } else {
            categories.forEach(category => {
                allQuestions = allQuestions.concat(
                    IslamicQuestion.getQuestionsByCategory(category, questionCount)
                );
            });
        }
        
        // Shuffle and select questions
        this.questions = this.shuffleArray(allQuestions).slice(0, questionCount);
        
        // Ensure we have enough questions
        if (this.questions.length < questionCount) {
            console.warn(`Not enough questions available. Requested: ${questionCount}, Available: ${this.questions.length}`);
        }
    }

    initializeCards() {
        const cardTypes = ['blessing', 'challenge', 'knowledge', 'wisdom'];
        
        // Give each player initial cards
        for (const [playerId, player] of this.players) {
            player.cards = [];
            
            // Give 3 random cards to start
            for (let i = 0; i < 3; i++) {
                const cardType = cardTypes[Math.floor(Math.random() * cardTypes.length)];
                const card = {
                    id: `${playerId}_${Date.now()}_${i}`,
                    type: cardType,
                    playerId: playerId
                };
                player.cards.push(card);
            }
        }
    }

    getCurrentQuestion() {
        if (this.currentQuestionIndex < this.questions.length) {
            const question = this.questions[this.currentQuestionIndex];
            
            // Don't send the correct answer to clients
            return {
                id: question.id,
                text: question.text,
                arabicText: question.arabicText,
                answers: question.answers,
                category: question.category,
                source: question.source,
                reference: question.reference,
                timeLimit: question.timeLimit,
                questionNumber: this.currentQuestionIndex + 1,
                totalQuestions: this.questions.length
            };
        }
        return null;
    }

    submitAnswer(playerId, questionId, selectedAnswer, timeTaken) {
        if (this.gameState !== 'playing') {
            throw new Error('Game not in progress');
        }
        
        const currentQuestion = this.questions[this.currentQuestionIndex];
        if (!currentQuestion || currentQuestion.id !== questionId) {
            throw new Error('Invalid question');
        }
        
        const player = this.players.get(playerId);
        if (!player) {
            throw new Error('Player not found');
        }
        
        // Check if player already answered
        if (this.roundAnswers.has(playerId)) {
            throw new Error('Already answered this question');
        }
        
        const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
        const points = isCorrect ? currentQuestion.calculateScore(timeTaken, true) : 0;
        
        // Store answer
        this.roundAnswers.set(playerId, {
            playerId,
            selectedAnswer,
            isCorrect,
            points,
            timeTaken
        });
        
        // Update score
        const currentScore = this.scores.get(playerId) || 0;
        this.scores.set(playerId, currentScore + points);
        player.score = currentScore + points;
        
        const result = {
            isCorrect,
            correctAnswer: currentQuestion.correctAnswer,
            pointsEarned: points,
            totalScore: player.score,
            explanation: currentQuestion.explanation
        };
        
        // Check if all players have answered
        if (this.roundAnswers.size === this.players.size) {
            // Move to next question
            setTimeout(() => {
                this.nextQuestion();
            }, 3000); // 3 second delay to show results
        }
        
        this.updateActivity();
        return result;
    }

    nextQuestion() {
        this.roundAnswers.clear();
        this.currentQuestionIndex++;
        
        if (this.currentQuestionIndex >= this.questions.length) {
            // Game finished
            this.endGame();
        } else {
            // Send next question
            const nextQuestion = this.getCurrentQuestion();
            this.io.to(this.id).emit('question_received', nextQuestion);
        }
    }

    endGame() {
        this.gameState = 'finished';
        this.gameEndTime = Date.now();
        
        // Calculate final results
        const results = this.calculateFinalResults();
        
        // Notify players
        this.io.to(this.id).emit('game_ended', {
            results,
            gameStats: {
                duration: this.gameEndTime - this.gameStartTime,
                questionsAnswered: this.currentQuestionIndex,
                totalQuestions: this.questions.length
            }
        });
        
        this.updateActivity();
    }

    calculateFinalResults() {
        const results = [];
        
        for (const [playerId, player] of this.players) {
            results.push({
                playerId,
                playerName: player.name,
                score: player.score,
                rank: 0 // Will be calculated below
            });
        }
        
        // Sort by score and assign ranks
        results.sort((a, b) => b.score - a.score);
        results.forEach((result, index) => {
            result.rank = index + 1;
        });
        
        return results;
    }

    // Card system
    drawCard(playerId) {
        const player = this.players.get(playerId);
        if (!player || player.cards.length >= 5) {
            return null;
        }
        
        const cardTypes = ['blessing', 'challenge', 'knowledge', 'wisdom'];
        const cardType = cardTypes[Math.floor(Math.random() * cardTypes.length)];
        
        const card = {
            id: `${playerId}_${Date.now()}`,
            type: cardType,
            playerId: playerId
        };
        
        player.cards.push(card);
        this.updateActivity();
        
        return card;
    }

    playCard(playerId, cardId, targetPlayerId = null) {
        const player = this.players.get(playerId);
        if (!player) {
            return { success: false, error: 'Player not found' };
        }
        
        const cardIndex = player.cards.findIndex(card => card.id === cardId);
        if (cardIndex === -1) {
            return { success: false, error: 'Card not found' };
        }
        
        const card = player.cards[cardIndex];
        
        // Apply card effect
        const effect = this.applyCardEffect(card, playerId, targetPlayerId);
        
        // Remove card from player's hand
        player.cards.splice(cardIndex, 1);
        
        this.updateActivity();
        
        return {
            success: true,
            effect: effect,
            cardType: card.type
        };
    }

    applyCardEffect(card, playerId, targetPlayerId) {
        const effects = {
            blessing: () => {
                // Double points for next correct answer
                const player = this.players.get(playerId);
                if (player) {
                    player.doublePointsNext = true;
                }
                return 'Double points for next correct answer';
            },
            challenge: () => {
                // All players must answer a bonus question
                return 'Bonus question for all players';
            },
            knowledge: () => {
                // Show hint for current question
                return 'Hint revealed for current question';
            },
            wisdom: () => {
                // Extra time for current question
                return 'Extra 15 seconds added to timer';
            }
        };
        
        const effectFunction = effects[card.type];
        return effectFunction ? effectFunction() : 'Unknown effect';
    }

    // Player disconnect handling
    handlePlayerDisconnect(playerId) {
        const player = this.players.get(playerId);
        if (player) {
            player.isConnected = false;
            
            // In a real game, you might want to pause or handle differently
            // For now, just mark as disconnected
            
            this.updateActivity();
        }
    }

    // Utility methods
    updateActivity() {
        this.lastActivity = Date.now();
    }

    isEmpty() {
        return this.players.size === 0;
    }

    isFull() {
        return this.players.size >= this.maxPlayers;
    }

    isHost(playerId) {
        return this.hostId === playerId;
    }

    getPlayerCount() {
        return this.players.size;
    }

    getPlayers() {
        const playerList = [];
        for (const [playerId, player] of this.players) {
            playerList.push({
                id: playerId,
                name: player.name,
                isHost: player.isHost,
                isReady: player.isReady,
                score: player.score,
                isConnected: player.isConnected,
                cardCount: player.cards.length
            });
        }
        return playerList;
    }

    getGameState() {
        return {
            id: this.id,
            gameMode: this.gameMode,
            gameState: this.gameState,
            players: this.getPlayers(),
            currentQuestionIndex: this.currentQuestionIndex,
            totalQuestions: this.questions.length,
            gameSettings: this.gameSettings,
            createdAt: this.createdAt,
            gameStartTime: this.gameStartTime
        };
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // Admin methods
    forceEndGame() {
        if (this.gameState === 'playing') {
            this.endGame();
            return true;
        }
        return false;
    }

    kickPlayer(playerId) {
        if (this.players.has(playerId)) {
            this.removePlayer(playerId);
            this.io.to(playerId).emit('kicked_from_room', {
                roomId: this.id,
                reason: 'Kicked by host'
            });
            return true;
        }
        return false;
    }
}

module.exports = GameRoom;