import Phaser from 'phaser';

class LobbyScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LobbyScene' });
        this.networkManager = null;
        this.playerName = '';
        this.mode = 'quick';
        this.roomCode = '';
        this.players = [];
        this.isHost = false;
        this.gameSettings = {
            category: 'All',
            difficulty: 'Mixed',
            questionCount: 20,
            timeLimit: 30
        };
    }

    init(data) {
        this.networkManager = data.networkManager;
        this.playerName = data.playerName || 'Anonymous';
        this.mode = data.mode || 'quick';
        this.roomCode = data.roomCode || '';
        
        if (this.mode === 'create') {
            this.isHost = true;
            this.roomCode = this.generateRoomCode();
        }
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Beautiful background
        this.createLobbyBackground();
        
        // Header with room info
        this.createLobbyHeader();
        
        // Players area
        this.createPlayersArea();
        
        // Game settings (host only)
        if (this.isHost) {
            this.createGameSettings();
        }
        
        // Action buttons
        this.createActionButtons();
        
        // Chat area
        this.createChatArea();
        
        // Back button
        this.createBackButton();
        
        // Setup network events
        this.setupNetworkEvents();
        
        // Add initial player
        this.addPlayer(this.playerName, true);
    }

    createLobbyBackground() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Gradient background
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x0D4E12, 0x1B5E20, 0x2E7D32, 0x1B5E20);
        bg.fillRect(0, 0, width, height);
        
        // Floating particles for ambiance
        this.createFloatingParticles();
        
        // Subtle overlay
        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.05);
        overlay.fillRect(0, 0, width, height);
    }

    createFloatingParticles() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        for (let i = 0; i < 10; i++) {
            const particle = this.add.circle(
                Phaser.Math.Between(0, width),
                Phaser.Math.Between(0, height),
                Phaser.Math.Between(2, 6),
                0xFFD700,
                Phaser.Math.FloatBetween(0.1, 0.3)
            );
            
            this.tweens.add({
                targets: particle,
                y: particle.y - Phaser.Math.Between(50, 100),
                alpha: { from: 0.1, to: 0.4 },
                duration: Phaser.Math.Between(4000, 8000),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
    }

    createLobbyHeader() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Header background
        const headerBg = this.add.graphics();
        headerBg.fillStyle(0x1B5E20, 0.8);
        headerBg.fillRoundedRect(50, 30, width - 100, 80, 15);
        headerBg.lineStyle(2, 0xFFD700, 0.8);
        headerBg.strokeRoundedRect(50, 30, width - 100, 80, 15);
        
        // Room title
        let titleText = '';
        switch (this.mode) {
            case 'quick':
                titleText = '⚡ Quick Match Lobby';
                break;
            case 'create':
                titleText = '🏠 Room Created';
                break;
            case 'join':
                titleText = '🚪 Joined Room';
                break;
        }
        
        this.add.text(width/2, 50, titleText, {
            fontSize: '24px',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 'bold',
            fill: '#FFFFFF',
            align: 'center'
        }).setOrigin(0.5);
        
        // Room code (if applicable)
        if (this.roomCode) {
            this.add.text(width/2, 80, `Room Code: ${this.roomCode}`, {
                fontSize: '16px',
                fontFamily: 'Inter, sans-serif',
                fill: '#FFD700',
                align: 'center'
            }).setOrigin(0.5);
        }
        
        // Status
        this.statusText = this.add.text(width/2, 95, 'Waiting for players...', {
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
            fill: '#E8F5E8',
            align: 'center'
        }).setOrigin(0.5);
    }

    createPlayersArea() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Players section header
        this.add.text(80, 140, '👥 Players (1/4)', {
            fontSize: '18px',
            fontFamily: 'Inter, sans-serif',
            fontWeight: '600',
            fill: '#FFFFFF'
        });
        
        // Player slots container
        this.playersContainer = this.add.container(0, 0);
        this.playerSlots = [];
        
        // Create 4 player slots
        for (let i = 0; i < 4; i++) {
            const slot = this.createPlayerSlot(80, 170 + i * 70, i);
            this.playerSlots.push(slot);
            this.playersContainer.add(slot);
        }
    }

    createPlayerSlot(x, y, index) {
        const width = this.cameras.main.width;
        const slotContainer = this.add.container(x, y);
        
        // Slot background
        const slotBg = this.add.graphics();
        slotBg.fillStyle(0x2E7D32, 0.4);
        slotBg.lineStyle(2, 0x4CAF50, 0.6);
        slotBg.fillRoundedRect(0, 0, width - 160, 60, 10);
        slotBg.strokeRoundedRect(0, 0, width - 160, 60, 10);
        
        // Player avatar
        const avatar = this.add.circle(40, 30, 20, 0x757575);
        const avatarIcon = this.add.text(40, 30, '👤', {
            fontSize: '20px',
            align: 'center'
        }).setOrigin(0.5);
        
        // Player name
        const nameText = this.add.text(80, 20, 'Waiting for player...', {
            fontSize: '16px',
            fontFamily: 'Inter, sans-serif',
            fontWeight: '500',
            fill: '#FFFFFF'
        });
        
        // Player status
        const statusText = this.add.text(80, 40, '', {
            fontSize: '12px',
            fontFamily: 'Inter, sans-serif',
            fill: '#A5D6A7'
        });
        
        // Ready indicator
        const readyIndicator = this.add.circle(width - 200, 30, 8, 0xFF6B6B);
        readyIndicator.setVisible(false);
        
        // Host crown (for host)
        const hostCrown = this.add.text(width - 180, 30, '👑', {
            fontSize: '16px',
            align: 'center'
        }).setOrigin(0.5).setVisible(false);
        
        slotContainer.add([slotBg, avatar, avatarIcon, nameText, statusText, readyIndicator, hostCrown]);
        
        // Store references for easy access
        slotContainer.nameText = nameText;
        slotContainer.statusText = statusText;
        slotContainer.readyIndicator = readyIndicator;
        slotContainer.hostCrown = hostCrown;
        slotContainer.avatar = avatar;
        slotContainer.avatarIcon = avatarIcon;
        slotContainer.isEmpty = true;
        
        return slotContainer;
    }

    createGameSettings() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Settings container
        const settingsBg = this.add.graphics();
        settingsBg.fillStyle(0x1B5E20, 0.6);
        settingsBg.lineStyle(2, 0xFFD700, 0.8);
        settingsBg.fillRoundedRect(width/2 + 20, 140, width/2 - 70, 200, 15);
        settingsBg.strokeRoundedRect(width/2 + 20, 140, width/2 - 70, 200, 15);
        
        // Settings title
        this.add.text(width/2 + 40, 160, '⚙️ Game Settings', {
            fontSize: '18px',
            fontFamily: 'Inter, sans-serif',
            fontWeight: '600',
            fill: '#FFD700'
        });
        
        // Category setting
        this.add.text(width/2 + 40, 190, 'Category:', {
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
            fill: '#FFFFFF'
        });
        
        this.categoryButton = this.createSettingButton(width/2 + 40, 210, this.gameSettings.category, () => {
            this.cycleSetting('category', ['All', 'Quran', 'Hadith', 'Fiqh', 'History']);
        });
        
        // Difficulty setting
        this.add.text(width/2 + 40, 240, 'Difficulty:', {
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
            fill: '#FFFFFF'
        });
        
        this.difficultyButton = this.createSettingButton(width/2 + 40, 260, this.gameSettings.difficulty, () => {
            this.cycleSetting('difficulty', ['Easy', 'Medium', 'Hard', 'Mixed']);
        });
        
        // Question count
        this.add.text(width/2 + 40, 290, 'Questions:', {
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
            fill: '#FFFFFF'
        });
        
        this.questionCountButton = this.createSettingButton(width/2 + 40, 310, `${this.gameSettings.questionCount}`, () => {
            this.cycleSetting('questionCount', [10, 15, 20, 25, 30]);
        });
    }

    createSettingButton(x, y, text, callback) {
        const button = this.add.container(x, y);
        
        const bg = this.add.graphics();
        bg.fillStyle(0x4CAF50, 0.8);
        bg.lineStyle(2, 0xFFD700, 0.8);
        bg.fillRoundedRect(0, 0, 120, 25, 12);
        bg.strokeRoundedRect(0, 0, 120, 25, 12);
        
        const buttonText = this.add.text(60, 12, text, {
            fontSize: '12px',
            fontFamily: 'Inter, sans-serif',
            fontWeight: '600',
            fill: '#FFFFFF',
            align: 'center'
        }).setOrigin(0.5);
        
        button.add([bg, buttonText]);
        button.setSize(120, 25);
        button.setInteractive({ cursor: 'pointer' });
        button.buttonText = buttonText;
        
        button.on('pointerover', () => {
            bg.clear();
            bg.fillStyle(0x66BB6A, 0.9);
            bg.lineStyle(2, 0xFFD700, 1);
            bg.fillRoundedRect(0, 0, 120, 25, 12);
            bg.strokeRoundedRect(0, 0, 120, 25, 12);
        });
        
        button.on('pointerout', () => {
            bg.clear();
            bg.fillStyle(0x4CAF50, 0.8);
            bg.lineStyle(2, 0xFFD700, 0.8);
            bg.fillRoundedRect(0, 0, 120, 25, 12);
            bg.strokeRoundedRect(0, 0, 120, 25, 12);
        });
        
        button.on('pointerdown', callback);
        
        return button;
    }

    createActionButtons() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Ready/Start button
        const buttonText = this.isHost ? '🚀 Start Game' : '✅ Ready';
        const buttonColor = this.isHost ? 0xFF6B35 : 0x4CAF50;
        
        this.actionButton = this.createActionButton(width/2 - 100, height - 120, buttonText, buttonColor, () => {
            if (this.isHost) {
                this.startGame();
            } else {
                this.toggleReady();
            }
        });
        
        // Leave room button
        this.leaveButton = this.createActionButton(width/2 + 100, height - 120, '🚪 Leave', 0xFF5722, () => {
            this.leaveRoom();
        });
    }

    createActionButton(x, y, text, color, callback) {
        const button = this.add.container(x, y);
        
        const bg = this.add.graphics();
        bg.fillGradientStyle(color, color, Phaser.Display.Color.GetColor32(
            Phaser.Display.Color.Lighten(Phaser.Display.Color.ColorToRGBA(color), 20)
        ), color);
        bg.fillRoundedRect(-80, -20, 160, 40, 20);
        
        const border = this.add.graphics();
        border.lineStyle(2, 0xFFD700, 0.8);
        border.strokeRoundedRect(-80, -20, 160, 40, 20);
        
        const buttonText = this.add.text(0, 0, text, {
            fontSize: '16px',
            fontFamily: 'Inter, sans-serif',
            fontWeight: '600',
            fill: '#FFFFFF',
            align: 'center'
        }).setOrigin(0.5);
        
        button.add([bg, border, buttonText]);
        button.setSize(160, 40);
        button.setInteractive({ cursor: 'pointer' });
        
        button.on('pointerover', () => {
            button.setScale(1.05);
            border.lineStyle(3, 0xFFD700, 1);
            border.clear();
            border.strokeRoundedRect(-80, -20, 160, 40, 20);
        });
        
        button.on('pointerout', () => {
            button.setScale(1);
            border.lineStyle(2, 0xFFD700, 0.8);
            border.clear();
            border.strokeRoundedRect(-80, -20, 160, 40, 20);
        });
        
        button.on('pointerdown', callback);
        
        return button;
    }

    createChatArea() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Chat container
        const chatBg = this.add.graphics();
        chatBg.fillStyle(0x1B5E20, 0.4);
        chatBg.lineStyle(2, 0x4CAF50, 0.6);
        chatBg.fillRoundedRect(80, height - 200, width/2 - 100, 70, 10);
        chatBg.strokeRoundedRect(80, height - 200, width/2 - 100, 70, 10);
        
        this.add.text(90, height - 190, '💬 Quick Chat', {
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
            fontWeight: '600',
            fill: '#FFFFFF'
        });
        
        // Quick chat buttons
        const chatMessages = ['Ready!', 'Wait please', 'Good luck!', "Let's go!"];
        chatMessages.forEach((msg, index) => {
            const btn = this.add.text(90 + (index * 70), height - 170, msg, {
                fontSize: '11px',
                fontFamily: 'Inter, sans-serif',
                fill: '#A5D6A7',
                backgroundColor: '#2E7D32',
                padding: { x: 8, y: 4 }
            }).setInteractive({ cursor: 'pointer' });
            
            btn.on('pointerdown', () => {
                this.sendChatMessage(msg);
            });
        });
    }

    createBackButton() {
        const backButton = this.add.text(50, 50, '← Back to Menu', {
            fontSize: '16px',
            fontFamily: 'Inter, sans-serif',
            fontWeight: '500',
            fill: '#FFD700',
            backgroundColor: '#1B5E20',
            padding: { x: 15, y: 8 }
        }).setInteractive({ cursor: 'pointer' });
        
        backButton.on('pointerdown', () => {
            this.scene.start('MenuScene');
        });
        
        backButton.on('pointerover', () => {
            backButton.setTint(0xFFFFFF);
        });
        
        backButton.on('pointerout', () => {
            backButton.clearTint();
        });
    }

    // Game logic methods
    addPlayer(name, isCurrentPlayer = false) {
        const emptySlot = this.playerSlots.find(slot => slot.isEmpty);
        if (!emptySlot) return;
        
        emptySlot.isEmpty = false;
        emptySlot.nameText.setText(name);
        emptySlot.statusText.setText(isCurrentPlayer ? 'You' : 'Connected');
        emptySlot.avatar.setFillStyle(0x4CAF50);
        emptySlot.avatarIcon.setText('👤');
        
        if (isCurrentPlayer && this.isHost) {
            emptySlot.hostCrown.setVisible(true);
            emptySlot.statusText.setText('Host (You)');
        }
        
        this.updatePlayerCount();
    }

    updatePlayerCount() {
        const playerCount = this.playerSlots.filter(slot => !slot.isEmpty).length;
        const playersHeader = this.children.getByName('playersHeader');
        // Update the players count display would go here
    }

    cycleSetting(setting, values) {
        const currentIndex = values.indexOf(this.gameSettings[setting]);
        const nextIndex = (currentIndex + 1) % values.length;
        this.gameSettings[setting] = values[nextIndex];
        
        // Update button text
        switch (setting) {
            case 'category':
                this.categoryButton.buttonText.setText(this.gameSettings.category);
                break;
            case 'difficulty':
                this.difficultyButton.buttonText.setText(this.gameSettings.difficulty);
                break;
            case 'questionCount':
                this.questionCountButton.buttonText.setText(`${this.gameSettings.questionCount}`);
                break;
        }
    }

    startGame() {
        console.log('Starting game with settings:', this.gameSettings);
        this.scene.start('GameScene', {
            mode: this.mode,
            playerName: this.playerName,
            settings: this.gameSettings
        });
    }

    toggleReady() {
        // Toggle ready state logic would go here
        console.log('Toggling ready state');
    }

    leaveRoom() {
        this.scene.start('MenuScene');
    }

    sendChatMessage(message) {
        console.log('Sending chat message:', message);
        // Chat logic would go here
    }

    setupNetworkEvents() {
        // Network event handling would go here
        console.log('Setting up network events for lobby');
    }

    generateRoomCode() {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    }
}

export default LobbyScene;