import Phaser from 'phaser';
import Card from '../components/Card';
import IslamicQuestion from '../components/IslamicQuestion';

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.networkManager = null;
        this.gameData = null;
        this.gameMode = 'practice';
        this.currentQuestion = null;
        this.playerHand = [];
        this.gameBoard = null;
        this.players = [];
        this.currentPlayer = 0;
        this.score = 0;
        this.timeRemaining = 30;
        this.questionTimer = null;
        this.isPracticeMode = false;
    }

    init(data) {
        this.gameData = data.gameData || {};
        this.gameMode = data.gameMode || 'practice';
        this.isPracticeMode = this.gameMode === 'practice';
        this.networkManager = this.game.networkManager;
        this.playerName = data.playerName || 'Player';
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Background
        this.createBackground();
        
        // Game UI
        this.createGameUI();
        
        // Game board
        this.createGameBoard();
        
        // Player hand area
        this.createPlayerHand();
        
        // Question area
        this.createQuestionArea();
        
        // Setup network listeners (if not practice mode)
        if (!this.isPracticeMode) {
            this.setupNetworkListeners();
        }
        
        // Initialize game
        this.initializeGame();
    }

    createBackground() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Check if HD background is available
        if (this.textures.exists('bg-game')) {
            // Use the high-quality background image
            const bg = this.add.image(width/2, height/2, 'bg-game');
            
            // Scale to cover the entire screen while maintaining aspect ratio
            const scaleX = width / bg.width;
            const scaleY = height / bg.height;
            const scale = Math.max(scaleX, scaleY);
            bg.setScale(scale);
            
            // Add subtle overlay for game table effect
            const overlay = this.add.graphics();
            overlay.fillStyle(0x000000, 0.2);
            overlay.fillRect(0, 0, width, height);
            
            // Table felt texture on top
            const tableTexture = this.add.graphics();
            tableTexture.fillStyle(0x1B5E20, 0.6);
            tableTexture.fillRoundedRect(50, 100, width - 100, height - 200, 30);
            tableTexture.lineStyle(4, 0xFFD700, 0.8);
            tableTexture.strokeRoundedRect(50, 100, width - 100, height - 200, 30);
        } else {
            // Fallback to gradient background
            const gradient = this.add.graphics();
            gradient.fillGradientStyle(0x0D4715, 0x0D4715, 0x1B5E20, 0x1B5E20);
            gradient.fillRect(0, 0, width, height);
            
            // Table felt texture
            const tableTexture = this.add.graphics();
            tableTexture.fillStyle(0x1B5E20, 0.8);
            tableTexture.fillRoundedRect(50, 100, width - 100, height - 200, 30);
            tableTexture.lineStyle(4, 0xFFD700, 0.8);
            tableTexture.strokeRoundedRect(50, 100, width - 100, height - 200, 30);
        }
    }

    createGameUI() {
        const width = this.cameras.main.width;
        
        // Top UI bar
        const uiBar = this.add.rectangle(width / 2, 50, width, 80, 0x1B5E20, 0.9);
        
        // Score
        this.scoreText = this.add.text(50, 30, `Score: ${this.score}`, {
            fontSize: '18px',
            fontFamily: 'Inter, sans-serif',
            fontStyle: 'bold',
            fill: '#FFD700'
        });
        
        // Timer
        this.timerText = this.add.text(width / 2, 30, `Time: ${this.timeRemaining}s`, {
            fontSize: '18px',
            fontFamily: 'Inter, sans-serif',
            fontStyle: 'bold',
            fill: '#FFFFFF',
            align: 'center'
        }).setOrigin(0.5);
        
        // Current player (multiplayer)
        if (!this.isPracticeMode) {
            this.currentPlayerText = this.add.text(width - 50, 30, 'Your Turn', {
                fontSize: '16px',
                fontFamily: 'Inter, sans-serif',
                fill: '#4CAF50',
                align: 'right'
            }).setOrigin(1, 0);
        }
        
        // Question counter
        this.questionCounter = this.add.text(width / 2, 60, 'Question 1 of 20', {
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
            fill: '#E8F5E8',
            align: 'center'
        }).setOrigin(0.5);
        
        // Menu button
        this.createMenuButton();
    }

    createMenuButton() {
        const width = this.cameras.main.width;
        
        const menuBtn = this.add.text(width - 20, 20, '☰', {
            fontSize: '24px',
            fill: '#FFFFFF'
        }).setOrigin(1, 0).setInteractive();
        
        menuBtn.on('pointerup', () => {
            this.showPauseMenu();
        });
    }

    createGameBoard() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Central card area
        this.gameBoardArea = this.add.rectangle(width / 2, height / 2, 300, 200, 0x2E7D32, 0.3);
        this.gameBoardArea.setStrokeStyle(2, 0xFFD700, 0.5);
        
        // Card slots
        this.cardSlots = [];
        for (let i = 0; i < 4; i++) {
            const angle = (i * Math.PI * 2) / 4;
            const x = width / 2 + Math.cos(angle) * 120;
            const y = height / 2 + Math.sin(angle) * 80;
            
            const slot = this.add.circle(x, y, 40, 0x1B5E20, 0.5);
            slot.setStrokeStyle(2, 0xFFD700, 0.3);
            this.cardSlots.push(slot);
        }
    }

    createPlayerHand() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Hand area
        this.handArea = this.add.rectangle(width / 2, height - 100, width - 100, 120, 0x1B5E20, 0.7);
        this.handArea.setStrokeStyle(2, 0xFFD700, 0.5);
        
        // Hand label
        this.add.text(width / 2, height - 160, 'Your Cards', {
            fontSize: '16px',
            fontFamily: 'Inter, sans-serif',
            fill: '#FFFFFF',
            align: 'center'
        }).setOrigin(0.5);
        
        // Initialize empty hand
        this.playerHand = [];
        this.handContainer = this.add.container(0, 0);
    }

    createQuestionArea() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Question panel
        this.questionPanel = this.add.rectangle(width / 2, height * 0.3, width - 80, 200, 0xFFFFFF, 0.95);
        this.questionPanel.setStrokeStyle(3, 0x1B5E20);
        this.questionPanel.setVisible(false);
        
        // Question text
        this.questionText = this.add.text(width / 2, height * 0.25, '', {
            fontSize: '16px',
            fontFamily: 'Inter, sans-serif',
            fill: '#1B5E20',
            align: 'center',
            wordWrap: { width: width - 120 }
        }).setOrigin(0.5).setVisible(false);
        
        // Answer buttons container
        this.answerContainer = this.add.container(0, 0);
        this.answerButtons = [];
        
        // Timer bar for question
        this.questionTimerBar = this.add.rectangle(width / 2, height * 0.38, width - 100, 8, 0x4CAF50);
        this.questionTimerBar.setVisible(false);
    }

    setupNetworkListeners() {
        this.networkManager.on('questionReceived', (data) => {
            this.displayQuestion(data.question);
        });
        
        this.networkManager.on('answerResult', (data) => {
            this.handleAnswerResult(data);
        });
        
        this.networkManager.on('scoreUpdated', (data) => {
            this.updateScore(data.scores);
        });
        
        this.networkManager.on('turnChanged', (data) => {
            this.updateCurrentPlayer(data.currentPlayer);
        });
        
        this.networkManager.on('cardDrawn', (data) => {
            this.addCardToHand(data.card);
        });
        
        this.networkManager.on('gameEnded', (data) => {
            this.endGame(data);
        });
    }

    initializeGame() {
        if (this.isPracticeMode) {
            // Start practice mode
            this.initializePracticeMode();
        } else {
            // Wait for server to send first question
            this.showWaitingMessage();
        }
    }

    initializePracticeMode() {
        // Generate initial hand of cards
        this.generateInitialHand();
        
        // Start first question
        this.time.delayedCall(1000, () => {
            this.loadNextQuestion();
        });
    }

    generateInitialHand() {
        const cardTypes = ['blessing', 'challenge', 'knowledge', 'wisdom'];
        
        for (let i = 0; i < 5; i++) {
            const cardType = Phaser.Utils.Array.GetRandom(cardTypes);
            const card = new Card(this, cardType, this.getCardData(cardType));
            this.playerHand.push(card);
        }
        
        this.updateHandDisplay();
    }

    getCardData(type) {
        const cardData = {
            blessing: {
                title: 'Blessing Card',
                description: 'Gain extra points for correct answers',
                effect: 'double_points'
            },
            challenge: {
                title: 'Challenge Card',
                description: 'Make next question harder for bonus points',
                effect: 'increase_difficulty'
            },
            knowledge: {
                title: 'Knowledge Card',
                description: 'Get a hint for the current question',
                effect: 'show_hint'
            },
            wisdom: {
                title: 'Wisdom Card',
                description: 'Extra time to answer',
                effect: 'extra_time'
            }
        };
        
        return cardData[type] || cardData.knowledge;
    }

    updateHandDisplay() {
        // Clear existing hand display
        this.handContainer.removeAll(true);
        
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const startX = (width / 2) - ((this.playerHand.length - 1) * 60) / 2;
        
        this.playerHand.forEach((card, index) => {
            const x = startX + index * 60;
            const y = height - 100;
            
            const cardImage = this.add.image(x, y, 'card-back').setScale(0.3).setInteractive();
            cardImage.setData('cardIndex', index);
            
            // Card hover effect
            cardImage.on('pointerover', () => {
                cardImage.setScale(0.35);
                cardImage.setTint(0xFFE082);
            });
            
            cardImage.on('pointerout', () => {
                cardImage.setScale(0.3);
                cardImage.clearTint();
            });
            
            cardImage.on('pointerup', () => {
                this.playCard(index);
            });
            
            this.handContainer.add(cardImage);
        });
    }

    loadNextQuestion() {
        // Generate a practice question
        const questions = this.getPracticeQuestions();
        this.currentQuestion = Phaser.Utils.Array.GetRandom(questions);
        this.displayQuestion(this.currentQuestion);
    }

    getPracticeQuestions() {
        return [
            {
                id: 1,
                text: "What is the first pillar of Islam?",
                answers: ["Shahada (Declaration of Faith)", "Salah (Prayer)", "Zakat (Charity)", "Hajj (Pilgrimage)"],
                correctAnswer: 0,
                category: "fiqh",
                source: "Basic Islamic Knowledge"
            },
            {
                id: 2,
                text: "How many chapters (Surahs) are in the Quran?",
                answers: ["112", "113", "114", "115"],
                correctAnswer: 2,
                category: "quran",
                source: "Quran Structure"
            },
            {
                id: 3,
                text: "What does 'Islam' mean in Arabic?",
                answers: ["Peace", "Submission", "Faith", "Worship"],
                correctAnswer: 1,
                category: "aqidah",
                source: "Arabic Language"
            },
            {
                id: 4,
                text: "Who was the first person to accept Islam after Prophet Muhammad (PBUH)?",
                answers: ["Abu Bakr (RA)", "Khadijah (RA)", "Ali (RA)", "Umar (RA)"],
                correctAnswer: 1,
                category: "history",
                source: "Seerah"
            },
            {
                id: 5,
                text: "In which month do Muslims fast?",
                answers: ["Shawwal", "Ramadan", "Dhul Hijjah", "Muharram"],
                correctAnswer: 1,
                category: "fiqh",
                source: "Islamic Calendar"
            }
        ];
    }

    displayQuestion(question) {
        this.currentQuestion = question;
        this.timeRemaining = 30;
        
        // Show question panel
        this.questionPanel.setVisible(true);
        this.questionText.setVisible(true);
        this.questionTimerBar.setVisible(true);
        
        // Set question text
        this.questionText.setText(question.text);
        
        // Create answer buttons
        this.createAnswerButtons(question.answers);
        
        // Start timer
        this.startQuestionTimer();
    }

    createAnswerButtons(answers) {
        // Clear existing buttons
        this.answerContainer.removeAll(true);
        this.answerButtons = [];
        
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        answers.forEach((answer, index) => {
            const x = width / 2;
            const y = height * 0.35 + index * 40;
            
            const button = this.add.rectangle(x, y, width - 120, 35, 0x2E7D32).setInteractive();
            button.setStrokeStyle(2, 0xFFD700);
            
            const buttonText = this.add.text(x, y, `${String.fromCharCode(65 + index)}. ${answer}`, {
                fontSize: '14px',
                fontFamily: 'Inter, sans-serif',
                fill: '#FFFFFF',
                align: 'center',
                wordWrap: { width: width - 140 }
            }).setOrigin(0.5);
            
            button.on('pointerover', () => {
                button.setFillStyle(0x4CAF50);
            });
            
            button.on('pointerout', () => {
                button.setFillStyle(0x2E7D32);
            });
            
            button.on('pointerup', () => {
                this.submitAnswer(index);
            });
            
            this.answerContainer.add([button, buttonText]);
            this.answerButtons.push({ button, text: buttonText });
        });
    }

    startQuestionTimer() {
        if (this.questionTimer) {
            this.questionTimer.destroy();
        }
        
        this.questionTimer = this.time.addEvent({
            delay: 1000,
            callback: this.updateQuestionTimer,
            callbackScope: this,
            repeat: this.timeRemaining - 1
        });
    }

    updateQuestionTimer() {
        this.timeRemaining--;
        this.timerText.setText(`Time: ${this.timeRemaining}s`);
        
        // Update timer bar
        const width = this.cameras.main.width;
        const progress = this.timeRemaining / 30;
        this.questionTimerBar.width = (width - 100) * progress;
        
        // Change color as time runs out
        if (this.timeRemaining <= 10) {
            this.questionTimerBar.setFillStyle(0xFF6B6B);
        } else if (this.timeRemaining <= 20) {
            this.questionTimerBar.setFillStyle(0xFFA000);
        }
        
        if (this.timeRemaining <= 0) {
            this.submitAnswer(-1); // Time's up
        }
    }

    submitAnswer(answerIndex) {
        if (this.questionTimer) {
            this.questionTimer.destroy();
        }
        
        const isCorrect = answerIndex === this.currentQuestion.correctAnswer;
        const timeTaken = 30 - this.timeRemaining;
        
        if (this.isPracticeMode) {
            this.handleAnswerResult({
                isCorrect: isCorrect,
                correctAnswer: this.currentQuestion.correctAnswer,
                pointsEarned: isCorrect ? this.calculatePoints(timeTaken) : 0
            });
        } else {
            // Send to server
            this.networkManager.submitAnswer(this.currentQuestion.id, answerIndex, timeTaken);
        }
    }

    calculatePoints(timeTaken) {
        const basePoints = 100;
        const timeBonus = Math.max(0, (30 - timeTaken) * 2);
        return basePoints + timeBonus;
    }

    handleAnswerResult(result) {
        // Highlight correct answer
        this.highlightAnswer(result.correctAnswer, result.isCorrect);
        
        // Update score
        if (result.pointsEarned > 0) {
            this.score += result.pointsEarned;
            this.scoreText.setText(`Score: ${this.score}`);
            
            // Show points animation
            this.showPointsAnimation(result.pointsEarned);
        }
        
        // Show feedback
        this.showAnswerFeedback(result.isCorrect);
        
        // Continue to next question after delay
        this.time.delayedCall(2000, () => {
            this.hideQuestion();
            if (this.isPracticeMode) {
                this.loadNextQuestion();
            }
        });
    }

    highlightAnswer(correctIndex, wasCorrect) {
        this.answerButtons.forEach((btn, index) => {
            if (index === correctIndex) {
                btn.button.setFillStyle(0x4CAF50); // Green for correct
            } else {
                btn.button.setFillStyle(0xFF6B6B); // Red for wrong
            }
        });
    }

    showAnswerFeedback(isCorrect) {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        const feedbackText = isCorrect ? 'Correct! ماشاء الله' : 'Wrong! الله أعلم';
        const feedbackColor = isCorrect ? '#4CAF50' : '#FF6B6B';
        
        const feedback = this.add.text(width / 2, height * 0.6, feedbackText, {
            fontSize: '24px',
            fontFamily: 'Inter, sans-serif',
            fontStyle: 'bold',
            fill: feedbackColor,
            align: 'center'
        }).setOrigin(0.5);
        
        // Animate feedback
        this.tweens.add({
            targets: feedback,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 500,
            yoyo: true,
            onComplete: () => {
                feedback.destroy();
            }
        });
    }

    showPointsAnimation(points) {
        const width = this.cameras.main.width;
        
        const pointsText = this.add.text(width / 2, 100, `+${points}`, {
            fontSize: '32px',
            fontFamily: 'Inter, sans-serif',
            fontStyle: 'bold',
            fill: '#FFD700',
            align: 'center'
        }).setOrigin(0.5);
        
        this.tweens.add({
            targets: pointsText,
            y: 50,
            alpha: 0,
            duration: 1000,
            onComplete: () => {
                pointsText.destroy();
            }
        });
    }

    hideQuestion() {
        this.questionPanel.setVisible(false);
        this.questionText.setVisible(false);
        this.questionTimerBar.setVisible(false);
        this.answerContainer.removeAll(true);
    }

    playCard(cardIndex) {
        // Card playing logic
        const card = this.playerHand[cardIndex];
        if (card) {
            // Apply card effect
            this.applyCardEffect(card.getData('type'));
            
            // Remove card from hand
            this.playerHand.splice(cardIndex, 1);
            this.updateHandDisplay();
        }
    }

    applyCardEffect(cardType) {
        switch (cardType) {
            case 'blessing':
                // Double points for next correct answer
                break;
            case 'challenge':
                // Increase difficulty
                break;
            case 'knowledge':
                // Show hint
                break;
            case 'wisdom':
                // Add extra time
                this.timeRemaining += 15;
                break;
        }
    }

    showPauseMenu() {
        // Create pause menu overlay
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
        const menu = this.add.rectangle(width / 2, height / 2, 300, 200, 0x1B5E20);
        
        this.add.text(width / 2, height / 2 - 50, 'Game Paused', {
            fontSize: '24px',
            fontFamily: 'Inter, sans-serif',
            fontStyle: 'bold',
            fill: '#FFFFFF',
            align: 'center'
        }).setOrigin(0.5);
        
        // Resume button
        const resumeBtn = this.add.text(width / 2, height / 2, 'Resume', {
            fontSize: '18px',
            fontFamily: 'Inter, sans-serif',
            fill: '#FFD700',
            align: 'center'
        }).setOrigin(0.5).setInteractive();
        
        resumeBtn.on('pointerup', () => {
            overlay.destroy();
            menu.destroy();
            resumeBtn.destroy();
        });
        
        // Main menu button
        const mainMenuBtn = this.add.text(width / 2, height / 2 + 40, 'Main Menu', {
            fontSize: '18px',
            fontFamily: 'Inter, sans-serif',
            fill: '#FFFFFF',
            align: 'center'
        }).setOrigin(0.5).setInteractive();
        
        mainMenuBtn.on('pointerup', () => {
            this.scene.start('MenuScene');
        });
    }

    showWaitingMessage() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        this.add.text(width / 2, height / 2, 'Waiting for other players...', {
            fontSize: '18px',
            fontFamily: 'Inter, sans-serif',
            fill: '#FFFFFF',
            align: 'center'
        }).setOrigin(0.5);
    }

    updateScore(scores) {
        // Update multiplayer scores
    }

    updateCurrentPlayer(currentPlayer) {
        // Update whose turn it is
    }

    addCardToHand(cardData) {
        // Add card received from server
    }

    endGame(gameData) {
        // Handle game end
        this.scene.start('MenuScene');
    }
}

export default GameScene;