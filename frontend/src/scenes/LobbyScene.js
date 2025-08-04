import Phaser from 'phaser';

class LobbyScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LobbyScene' });
        this.networkManager = null;
        this.roomData = null;
        this.players = [];
        this.isHost = false;
        this.playerElements = [];
    }

    init(data) {
        this.roomData = data.roomData || {};
        this.networkManager = this.game.networkManager;
        this.isHost = this.roomData.isHost || false;
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Background
        this.createBackground();
        
        // Room info
        this.createRoomInfo();
        
        // Players list
        this.createPlayersArea();
        
        // Game settings (if host)
        if (this.isHost) {
            this.createGameSettings();
        }
        
        // Action buttons
        this.createActionButtons();
        
        // Chat area
        this.createChatArea();
        
        // Setup network listeners
        this.setupNetworkListeners();
        
        // Initialize with current room data
        if (this.roomData.players) {
            this.updatePlayersList(this.roomData.players);
        }
    }

    createBackground() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Gradient background
        const gradient = this.add.graphics();
        gradient.fillGradientStyle(0x1B5E20, 0x1B5E20, 0x2E7D32, 0x2E7D32);
        gradient.fillRect(0, 0, width, height);
        
        // Pattern overlay
        for (let x = 0; x < width; x += 100) {
            for (let y = 0; y < height; y += 100) {
                this.add.image(x, y, 'bg-pattern').setOrigin(0, 0).setAlpha(0.03);
            }
        }
    }

    createRoomInfo() {
        const width = this.cameras.main.width;
        
        // Title
        this.add.text(width / 2, 50, 'Game Lobby', {
            fontSize: '28px',
            fontFamily: 'Inter, sans-serif',
            fontStyle: 'bold',
            fill: '#FFFFFF',
            align: 'center'
        }).setOrigin(0.5);
        
        // Room ID
        this.roomIdText = this.add.text(width / 2, 90, `Room ID: ${this.roomData.roomId || 'Loading...'}`, {
            fontSize: '18px',
            fontFamily: 'Inter, sans-serif',
            fill: '#FFD700',
            align: 'center'
        }).setOrigin(0.5);
        
        // Game mode
        this.gameModeText = this.add.text(width / 2, 120, `Mode: ${this.roomData.gameMode || 'Quick Match'}`, {
            fontSize: '16px',
            fontFamily: 'Inter, sans-serif',
            fill: '#E8F5E8',
            align: 'center'
        }).setOrigin(0.5);
    }

    createPlayersArea() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Players section title
        this.add.text(50, 160, 'Players:', {
            fontSize: '20px',
            fontFamily: 'Inter, sans-serif',
            fontStyle: 'bold',
            fill: '#FFFFFF'
        });
        
        // Players container
        this.playersContainer = this.add.container(0, 0);
        
        // Create slots for up to 4 players
        for (let i = 0; i < 4; i++) {
            const slot = this.createPlayerSlot(60, 200 + i * 80, i);
            this.playerElements.push(slot);
        }
    }

    createPlayerSlot(x, y, index) {
        // Player slot background
        const slotBg = this.add.rectangle(x, y, width * 0.8, 60, 0x2E7D32, 0.3);
        slotBg.setStrokeStyle(2, 0xFFD700, 0.5);
        
        // Player avatar
        const avatar = this.add.image(x - width * 0.35, y, 'player-avatar').setScale(0.6);
        
        // Player name
        const nameText = this.add.text(x - width * 0.25, y - 15, 'Waiting for player...', {
            fontSize: '16px',
            fontFamily: 'Inter, sans-serif',
            fill: '#FFFFFF'
        });
        
        // Player status
        const statusText = this.add.text(x - width * 0.25, y + 15, '', {
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
            fill: '#E8F5E8'
        });
        
        // Ready indicator
        const readyIndicator = this.add.circle(x + width * 0.3, y, 8, 0xFF6B6B);
        
        return {
            background: slotBg,
            avatar: avatar,
            nameText: nameText,
            statusText: statusText,
            readyIndicator: readyIndicator,
            isEmpty: true
        };
    }

    createGameSettings() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Settings section (only for host)
        this.add.text(width / 2, height * 0.65, 'Game Settings (Host)', {
            fontSize: '18px',
            fontFamily: 'Inter, sans-serif',
            fontStyle: 'bold',
            fill: '#FFD700',
            align: 'center'
        }).setOrigin(0.5);
        
        // Game mode selector
        this.createGameModeSelector();
        
        // Category selector
        this.createCategorySelector();
    }

    createGameModeSelector() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        const y = height * 0.7;
        
        this.add.text(width / 2 - 100, y, 'Mode:', {
            fontSize: '16px',
            fontFamily: 'Inter, sans-serif',
            fill: '#FFFFFF'
        });
        
        // Quick Match button
        const quickBtn = this.createSettingButton(width / 2 - 50, y + 30, 'Quick', () => {
            this.changeGameMode('quick_match');
        });
        
        // Tournament button
        const tournamentBtn = this.createSettingButton(width / 2 + 50, y + 30, 'Tournament', () => {
            this.changeGameMode('tournament');
        });
        
        this.gameModeButtons = [quickBtn, tournamentBtn];
    }

    createCategorySelector() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        const y = height * 0.8;
        
        this.add.text(width / 2 - 100, y, 'Categories:', {
            fontSize: '16px',
            fontFamily: 'Inter, sans-serif',
            fill: '#FFFFFF'
        });
        
        const categories = ['All', 'Quran', 'Hadith', 'Fiqh', 'History'];
        this.categoryButtons = [];
        
        categories.forEach((category, index) => {
            const x = width / 2 - 80 + (index * 40);
            const btn = this.createSettingButton(x, y + 30, category, () => {
                this.changeCategory(category);
            });
            this.categoryButtons.push(btn);
        });
    }

    createSettingButton(x, y, text, callback) {
        const button = this.add.rectangle(x, y, 70, 30, 0x1B5E20).setInteractive();
        const buttonText = this.add.text(x, y, text, {
            fontSize: '12px',
            fontFamily: 'Inter, sans-serif',
            fill: '#FFFFFF',
            align: 'center'
        }).setOrigin(0.5);
        
        button.setStrokeStyle(1, 0xFFD700);
        
        button.on('pointerup', callback);
        
        return { button, text: buttonText };
    }

    createActionButtons() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        const buttonY = height - 100;
        
        // Start Game button (host only)
        if (this.isHost) {
            this.startGameBtn = this.createActionButton(width / 2 - 100, buttonY, 'Start Game', () => {
                this.startGame();
            });
        }
        
        // Ready button
        this.readyBtn = this.createActionButton(width / 2, buttonY, 'Ready', () => {
            this.toggleReady();
        });
        
        // Leave Room button
        this.leaveBtn = this.createActionButton(width / 2 + 100, buttonY, 'Leave', () => {
            this.leaveRoom();
        });
    }

    createActionButton(x, y, text, callback) {
        const button = this.add.image(x, y, 'button').setInteractive().setScale(0.8);
        const buttonText = this.add.text(x, y, text, {
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
            fontStyle: 'bold',
            fill: '#1B5E20',
            align: 'center'
        }).setOrigin(0.5);
        
        button.on('pointerup', callback);
        
        return { button, text: buttonText };
    }

    createChatArea() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Chat will be implemented in a future update
        // For now, just show a placeholder
        this.add.text(50, height - 50, 'Chat: Coming soon!', {
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
            fill: '#E8F5E8'
        });
    }

    setupNetworkListeners() {
        this.networkManager.on('playerJoined', (data) => {
            this.updatePlayersList(data.players);
        });
        
        this.networkManager.on('playerLeft', (data) => {
            this.updatePlayersList(data.players);
        });
        
        this.networkManager.on('gameStarted', (data) => {
            this.scene.start('GameScene', { gameData: data });
        });
        
        this.networkManager.on('roomLeft', () => {
            this.scene.start('MenuScene');
        });
    }

    updatePlayersList(players) {
        this.players = players || [];
        
        // Update each player slot
        this.playerElements.forEach((slot, index) => {
            if (index < this.players.length) {
                const player = this.players[index];
                slot.nameText.setText(player.name);
                slot.statusText.setText(player.isHost ? 'Host' : 'Player');
                slot.readyIndicator.setFillStyle(player.isReady ? 0x4CAF50 : 0xFF6B6B);
                slot.isEmpty = false;
                slot.avatar.setVisible(true);
            } else {
                slot.nameText.setText('Waiting for player...');
                slot.statusText.setText('');
                slot.readyIndicator.setFillStyle(0xFF6B6B);
                slot.isEmpty = true;
                slot.avatar.setVisible(false);
            }
        });
    }

    changeGameMode(mode) {
        // Send to server
        // Implementation depends on backend
    }

    changeCategory(category) {
        // Send to server
        // Implementation depends on backend
    }

    toggleReady() {
        // Toggle ready state
        // Implementation depends on backend
    }

    startGame() {
        if (this.isHost && this.players.length >= 2) {
            this.networkManager.startGame();
        }
    }

    leaveRoom() {
        this.networkManager.leaveRoom();
    }
}

export default LobbyScene;