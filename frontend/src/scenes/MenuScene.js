import Phaser from 'phaser';

class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
        this.networkManager = null;
        this.playerName = '';
    }

    create() {
        this.networkManager = this.game.networkManager;
        
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Background
        this.createBackground();
        
        // Title
        this.createTitle();
        
        // Menu options
        this.createMenuButtons();
        
        // Player name input
        this.createPlayerNameInput();
        
        // Connection status
        this.createConnectionStatus();
        
        // Setup network event listeners
        this.setupNetworkListeners();
    }

    createBackground() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Gradient background
        const gradient = this.add.graphics();
        gradient.fillGradientStyle(0x1B5E20, 0x1B5E20, 0x2E7D32, 0x2E7D32);
        gradient.fillRect(0, 0, width, height);
        
        // Add subtle pattern
        for (let x = 0; x < width; x += 100) {
            for (let y = 0; y < height; y += 100) {
                this.add.image(x, y, 'bg-pattern').setOrigin(0, 0).setAlpha(0.05);
            }
        }
        
        // Islamic star pattern
        this.createIslamicStars();
    }

    createIslamicStars() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create floating stars
        for (let i = 0; i < 20; i++) {
            const star = this.add.graphics();
            const x = Phaser.Math.Between(50, width - 50);
            const y = Phaser.Math.Between(50, height - 50);
            const size = Phaser.Math.Between(3, 8);
            
            star.fillStyle(0xFFD700, 0.3);
            star.fillStar(x, y, 8, size, size * 0.5);
            
            // Add twinkling animation
            this.tweens.add({
                targets: star,
                alpha: { from: 0.1, to: 0.6 },
                duration: Phaser.Math.Between(2000, 4000),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
    }

    createTitle() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Arabic title
        const arabicTitle = this.add.text(width / 2, height * 0.15, 'بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ', {
            fontSize: Math.min(width * 0.05, 32) + 'px',
            fontFamily: 'Amiri, serif',
            fill: '#FFD700',
            align: 'center',
            stroke: '#1B5E20',
            strokeThickness: 2
        }).setOrigin(0.5);
        
        // English title
        const englishTitle = this.add.text(width / 2, height * 0.25, 'Islamic Quiz Card Game', {
            fontSize: Math.min(width * 0.06, 36) + 'px',
            fontFamily: 'Inter, sans-serif',
            fontStyle: 'bold',
            fill: '#FFFFFF',
            align: 'center',
            stroke: '#1B5E20',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        // Subtitle
        const subtitle = this.add.text(width / 2, height * 0.32, 'Test Your Islamic Knowledge', {
            fontSize: Math.min(width * 0.025, 18) + 'px',
            fontFamily: 'Inter, sans-serif',
            fill: '#E8F5E8',
            align: 'center'
        }).setOrigin(0.5);
        
        // Title animations
        this.tweens.add({
            targets: arabicTitle,
            y: arabicTitle.y - 10,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    createPlayerNameInput() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Player name label
        this.add.text(width / 2, height * 0.45, 'Enter Your Name:', {
            fontSize: '18px',
            fontFamily: 'Inter, sans-serif',
            fill: '#FFFFFF',
            align: 'center'
        }).setOrigin(0.5);
        
        // Create HTML input element
        const inputElement = document.createElement('input');
        inputElement.type = 'text';
        inputElement.placeholder = 'Your Name';
        inputElement.value = localStorage.getItem('playerName') || '';
        inputElement.maxLength = 20;
        inputElement.style.cssText = `
            position: absolute;
            left: 50%;
            top: ${height * 0.5}px;
            transform: translateX(-50%);
            width: 200px;
            height: 40px;
            font-size: 16px;
            text-align: center;
            border: 2px solid #FFD700;
            border-radius: 10px;
            background: rgba(255, 255, 255, 0.9);
            color: #1B5E20;
            font-family: 'Inter', sans-serif;
            font-weight: 500;
        `;
        
        document.body.appendChild(inputElement);
        
        // Store reference to clean up later
        this.nameInput = inputElement;
        
        // Update player name when typing
        inputElement.addEventListener('input', (e) => {
            this.playerName = e.target.value;
            localStorage.setItem('playerName', this.playerName);
        });
        
        // Set initial value
        this.playerName = inputElement.value;
    }

    createMenuButtons() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        const buttonY = height * 0.6;
        const buttonSpacing = 80;
        
        // Quick Match button
        const quickMatchBtn = this.createButton(width / 2, buttonY, 'Quick Match', () => {
            this.startQuickMatch();
        });
        
        // Create Room button
        const createRoomBtn = this.createButton(width / 2, buttonY + buttonSpacing, 'Create Room', () => {
            this.createRoom();
        });
        
        // Join Room button
        const joinRoomBtn = this.createButton(width / 2, buttonY + buttonSpacing * 2, 'Join Room', () => {
            this.showJoinRoomDialog();
        });
        
        // Practice Mode button
        const practiceBtn = this.createButton(width / 2, buttonY + buttonSpacing * 3, 'Practice Mode', () => {
            this.startPracticeMode();
        });
        
        // Store button references
        this.menuButtons = [quickMatchBtn, createRoomBtn, joinRoomBtn, practiceBtn];
    }

    createButton(x, y, text, callback) {
        const button = this.add.image(x, y, 'button').setInteractive();
        
        const buttonText = this.add.text(x, y, text, {
            fontSize: '16px',
            fontFamily: 'Inter, sans-serif',
            fontStyle: 'bold',
            fill: '#1B5E20',
            align: 'center'
        }).setOrigin(0.5);
        
        // Button hover effects
        button.on('pointerover', () => {
            button.setTint(0xFFE082);
            buttonText.setStyle({ fill: '#0D4715' });
            this.tweens.add({
                targets: [button, buttonText],
                scaleX: 1.05,
                scaleY: 1.05,
                duration: 200,
                ease: 'Power2'
            });
        });
        
        button.on('pointerout', () => {
            button.clearTint();
            buttonText.setStyle({ fill: '#1B5E20' });
            this.tweens.add({
                targets: [button, buttonText],
                scaleX: 1,
                scaleY: 1,
                duration: 200,
                ease: 'Power2'
            });
        });
        
        button.on('pointerdown', () => {
            this.tweens.add({
                targets: [button, buttonText],
                scaleX: 0.95,
                scaleY: 0.95,
                duration: 100,
                yoyo: true,
                ease: 'Power2'
            });
        });
        
        button.on('pointerup', callback);
        
        return { button, text: buttonText };
    }

    createConnectionStatus() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        this.connectionStatus = this.add.text(width / 2, height * 0.9, 'Connecting to server...', {
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
            fill: '#FFD700',
            align: 'center'
        }).setOrigin(0.5);
        
        // Connection indicator
        this.connectionIndicator = this.add.circle(width / 2 - 100, height * 0.9, 6, 0xFF6B6B);
        
        // Try to connect
        this.connectToServer();
    }

    setupNetworkListeners() {
        this.networkManager.on('roomJoined', (data) => {
            console.log('Room joined:', data);
            this.scene.start('LobbyScene', { roomData: data });
        });
        
        this.networkManager.on('error', (error) => {
            this.showErrorMessage('Connection error: ' + error.message);
        });
        
        this.networkManager.on('disconnected', (reason) => {
            this.updateConnectionStatus('Disconnected', false);
        });
    }

    async connectToServer() {
        try {
            const playerName = this.playerName || 'Anonymous';
            await this.networkManager.connect(playerName);
            this.updateConnectionStatus('Connected', true);
        } catch (error) {
            console.error('Failed to connect:', error);
            this.updateConnectionStatus('Connection failed', false);
        }
    }

    updateConnectionStatus(message, connected) {
        this.connectionStatus.setText(message);
        this.connectionIndicator.setFillStyle(connected ? 0x4CAF50 : 0xFF6B6B);
    }

    startQuickMatch() {
        if (!this.validatePlayerName()) return;
        
        if (this.networkManager.isConnected) {
            this.networkManager.joinRandomRoom('quick_match');
        } else {
            this.showErrorMessage('Not connected to server');
        }
    }

    createRoom() {
        if (!this.validatePlayerName()) return;
        
        if (this.networkManager.isConnected) {
            this.networkManager.createRoom('custom');
        } else {
            this.showErrorMessage('Not connected to server');
        }
    }

    showJoinRoomDialog() {
        if (!this.validatePlayerName()) return;
        
        const roomId = prompt('Enter Room ID:');
        if (roomId && roomId.trim()) {
            this.networkManager.joinRoom(roomId.trim());
        }
    }

    startPracticeMode() {
        if (!this.validatePlayerName()) return;
        
        // Start practice mode (offline)
        this.scene.start('GameScene', { 
            gameMode: 'practice',
            playerName: this.playerName 
        });
    }

    validatePlayerName() {
        if (!this.playerName || this.playerName.trim().length < 2) {
            this.showErrorMessage('Please enter a name (at least 2 characters)');
            return false;
        }
        return true;
    }

    showErrorMessage(message) {
        // Create error message popup
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        const errorBg = this.add.rectangle(width / 2, height / 2, width * 0.8, 100, 0xFF6B6B, 0.9);
        const errorText = this.add.text(width / 2, height / 2, message, {
            fontSize: '16px',
            fontFamily: 'Inter, sans-serif',
            fill: '#FFFFFF',
            align: 'center',
            wordWrap: { width: width * 0.7 }
        }).setOrigin(0.5);
        
        // Auto-hide after 3 seconds
        this.time.delayedCall(3000, () => {
            errorBg.destroy();
            errorText.destroy();
        });
    }

    destroy() {
        // Clean up HTML input element
        if (this.nameInput && this.nameInput.parentNode) {
            this.nameInput.parentNode.removeChild(this.nameInput);
        }
        
        super.destroy();
    }
}

export default MenuScene;