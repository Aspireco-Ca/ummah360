import Phaser from 'phaser';

class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
        this.networkManager = null;
        this.playerName = '';
        this.buttons = [];
        this.nameInput = null;
        this.isConnected = false;
    }

    create() {
        this.networkManager = this.game.networkManager;
        
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Beautiful background
        this.createModernBackground();
        
        // Islamic title with better typography
        this.createIslamicTitle();
        
        // Player name input with better design
        this.createPlayerNameInput();
        
        // Modern menu buttons
        this.createModernMenuButtons();
        
        // Footer with connection status
        this.createFooter();
        
        // Setup interactions
        this.setupNetworkListeners();
        this.setupInputHandlers();
    }

    createModernBackground() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Gradient background
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x0D4E12, 0x1B5E20, 0x2E7D32, 0x388E3C);
        bg.fillRect(0, 0, width, height);
        
        // Animated Islamic geometric patterns
        this.createAnimatedPatterns();
        
        // Subtle overlay
        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.1);
        overlay.fillRect(0, 0, width, height);
    }

    createAnimatedPatterns() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create floating Islamic stars with animation
        for (let i = 0; i < 15; i++) {
            const star = this.add.graphics();
            const x = Phaser.Math.Between(50, width - 50);
            const y = Phaser.Math.Between(50, height - 50);
            const size = Phaser.Math.Between(4, 12);
            
            star.fillStyle(0xFFD700, Phaser.Math.FloatBetween(0.1, 0.4));
            this.drawStar(star, 0, 0, 8, size, size * 0.5);
            star.setPosition(x, y);
            
            // Floating animation
            this.tweens.add({
                targets: star,
                y: y - Phaser.Math.Between(20, 40),
                alpha: { from: 0.1, to: 0.6 },
                duration: Phaser.Math.Between(3000, 6000),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
        
        // Add crescent moons
        for (let i = 0; i < 8; i++) {
            const moon = this.add.graphics();
            const x = Phaser.Math.Between(100, width - 100);
            const y = Phaser.Math.Between(100, height - 100);
            
            moon.fillStyle(0xFFD700, 0.15);
            this.drawCrescent(moon, 0, 0, 15);
            moon.setPosition(x, y);
            
            this.tweens.add({
                targets: moon,
                rotation: Math.PI * 2,
                duration: Phaser.Math.Between(8000, 12000),
                repeat: -1,
                ease: 'Linear'
            });
        }
    }

    createIslamicTitle() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Main title with shadow effect
        const titleShadow = this.add.text(width/2 + 3, height * 0.15 + 3, 'Islamic Quiz', {
            fontSize: '48px',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 'bold',
            fill: '#000000',
            align: 'center'
        }).setOrigin(0.5).setAlpha(0.3);
        
        const title = this.add.text(width/2, height * 0.15, 'Islamic Quiz', {
            fontSize: '48px',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 'bold',
            fill: '#FFFFFF',
            align: 'center',
            stroke: '#1B5E20',
            strokeThickness: 2
        }).setOrigin(0.5);
        
        // Subtitle
        const subtitle = this.add.text(width/2, height * 0.2, 'Card Game', {
            fontSize: '24px',
            fontFamily: 'Inter, sans-serif',
            fontWeight: '300',
            fill: '#E8F5E8',
            align: 'center'
        }).setOrigin(0.5);
        
        // Arabic bismillah
        const bismillah = this.add.text(width/2, height * 0.26, 'بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ', {
            fontSize: '20px',
            fontFamily: 'Amiri, serif',
            fill: '#FFD700',
            align: 'center'
        }).setOrigin(0.5);
        
        // Gentle pulsing animation for title
        this.tweens.add({
            targets: title,
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    createPlayerNameInput() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Input container
        const inputBg = this.add.graphics();
        inputBg.fillStyle(0xFFFFFF, 0.95);
        inputBg.lineStyle(3, 0xFFD700, 1);
        inputBg.fillRoundedRect(width/2 - 150, height * 0.35 - 25, 300, 50, 25);
        inputBg.strokeRoundedRect(width/2 - 150, height * 0.35 - 25, 300, 50, 25);
        
        // Input label
        this.add.text(width/2, height * 0.32, 'Enter Your Name', {
            fontSize: '16px',
            fontFamily: 'Inter, sans-serif',
            fontWeight: '500',
            fill: '#FFFFFF',
            align: 'center'
        }).setOrigin(0.5);
        
        // Name display
        this.nameDisplay = this.add.text(width/2, height * 0.35, 'Click to enter name...', {
            fontSize: '18px',
            fontFamily: 'Inter, sans-serif',
            fill: '#1B5E20',
            align: 'center'
        }).setOrigin(0.5);
        
        // Make input clickable
        const inputZone = this.add.zone(width/2, height * 0.35, 300, 50);
        inputZone.setInteractive({ cursor: 'pointer' });
        inputZone.on('pointerdown', () => this.showNameInput());
        
        this.inputBg = inputBg;
        this.inputZone = inputZone;
    }

    showNameInput() {
        const name = prompt('Enter your name:');
        if (name && name.trim()) {
            this.playerName = name.trim();
            this.nameDisplay.setText(this.playerName);
            this.enableMenuButtons();
        }
    }

    createModernMenuButtons() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        const buttonData = [
            { text: '⚡ Quick Match', key: 'quick', color: 0xFF6B35, y: height * 0.5 },
            { text: '🏠 Create Room', key: 'create', color: 0x4CAF50, y: height * 0.58 },
            { text: '🚪 Join Room', key: 'join', color: 0x2196F3, y: height * 0.66 },
            { text: '📚 Practice', key: 'practice', color: 0x9C27B0, y: height * 0.74 }
        ];
        
        this.buttons = [];
        
        buttonData.forEach((data, index) => {
            const button = this.createGameButton(width/2, data.y, data.text, data.color, () => {
                this.handleMenuAction(data.key);
            });
            
            // Initially disabled
            button.setAlpha(0.5);
            button.disableInteractive();
            this.buttons.push(button);
            
            // Staggered entrance animation
            this.tweens.add({
                targets: button,
                x: width/2,
                alpha: button.alpha,
                duration: 500,
                delay: index * 100,
                ease: 'Back.easeOut'
            });
        });
    }

    createGameButton(x, y, text, color, callback) {
        const container = this.add.container(x - 400, y);
        
        // Button background with gradient effect
        const bg = this.add.graphics();
        bg.fillGradientStyle(color, color, Phaser.Display.Color.GetColor32(
            Phaser.Display.Color.Lighten(Phaser.Display.Color.ColorToRGBA(color), 20)
        ), color);
        bg.fillRoundedRect(-120, -25, 240, 50, 25);
        
        // Button border
        const border = this.add.graphics();
        border.lineStyle(2, 0xFFD700, 0.8);
        border.strokeRoundedRect(-120, -25, 240, 50, 25);
        
        // Button text
        const buttonText = this.add.text(0, 0, text, {
            fontSize: '18px',
            fontFamily: 'Inter, sans-serif',
            fontWeight: '600',
            fill: '#FFFFFF',
            align: 'center'
        }).setOrigin(0.5);
        
        container.add([bg, border, buttonText]);
        container.setSize(240, 50);
        container.setInteractive({ cursor: 'pointer' });
        
        // Hover effects
        container.on('pointerover', () => {
            container.setScale(1.05);
            border.lineStyle(3, 0xFFD700, 1);
            border.clear();
            border.strokeRoundedRect(-120, -25, 240, 50, 25);
        });
        
        container.on('pointerout', () => {
            container.setScale(1);
            border.lineStyle(2, 0xFFD700, 0.8);
            border.clear();
            border.strokeRoundedRect(-120, -25, 240, 50, 25);
        });
        
        container.on('pointerdown', callback);
        
        return container;
    }

    enableMenuButtons() {
        this.buttons.forEach(button => {
            button.setAlpha(1);
            button.setInteractive({ cursor: 'pointer' });
        });
    }

    createFooter() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Connection status
        this.connectionStatus = this.add.text(width/2, height * 0.9, '🔴 Connecting to server...', {
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
            fill: '#E8F5E8',
            align: 'center'
        }).setOrigin(0.5);
        
        // Version info
        this.add.text(width/2, height * 0.95, 'Ummah360 Islamic Quiz v1.0', {
            fontSize: '12px',
            fontFamily: 'Inter, sans-serif',
            fill: '#A5D6A7',
            align: 'center'
        }).setOrigin(0.5);
    }

    handleMenuAction(action) {
        if (!this.playerName) {
            this.showNameInput();
            return;
        }
        
        switch (action) {
            case 'quick':
                this.startQuickMatch();
                break;
            case 'create':
                this.createRoom();
                break;
            case 'join':
                this.joinRoom();
                break;
            case 'practice':
                this.startPractice();
                break;
        }
    }

    startQuickMatch() {
        console.log('Starting quick match...');
        this.scene.start('LobbyScene', { 
            mode: 'quick', 
            playerName: this.playerName,
            networkManager: this.networkManager 
        });
    }

    createRoom() {
        console.log('Creating room...');
        this.scene.start('LobbyScene', { 
            mode: 'create', 
            playerName: this.playerName,
            networkManager: this.networkManager 
        });
    }

    joinRoom() {
        const roomCode = prompt('Enter room code:');
        if (roomCode) {
            console.log('Joining room:', roomCode);
            this.scene.start('LobbyScene', { 
                mode: 'join', 
                roomCode: roomCode,
                playerName: this.playerName,
                networkManager: this.networkManager 
            });
        }
    }

    startPractice() {
        console.log('Starting practice mode...');
        this.scene.start('GameScene', { 
            mode: 'practice', 
            playerName: this.playerName 
        });
    }

    setupInputHandlers() {
        // ESC key to reset
        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.restart();
        });
    }

    setupNetworkListeners() {
        if (!this.networkManager) return;
        
        // Try to connect
        this.networkManager.connect(this.playerName || 'Anonymous')
            .then(() => {
                this.isConnected = true;
                this.connectionStatus.setText('🟢 Connected to server');
                this.connectionStatus.setTint(0x4CAF50);
            })
            .catch((error) => {
                this.isConnected = false;
                this.connectionStatus.setText('🔴 Connection failed');
                this.connectionStatus.setTint(0xFF5722);
                console.error('Connection failed:', error);
            });
    }

    // Helper drawing methods
    drawStar(graphics, x, y, points, outerRadius, innerRadius) {
        const step = Math.PI / points;
        
        graphics.beginPath();
        for (let i = 0; i <= points * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = i * step - Math.PI / 2;
            const px = x + Math.cos(angle) * radius;
            const py = y + Math.sin(angle) * radius;
            
            if (i === 0) {
                graphics.moveTo(px, py);
            } else {
                graphics.lineTo(px, py);
            }
        }
        graphics.closePath();
        graphics.fillPath();
    }

    drawCrescent(graphics, x, y, radius) {
        graphics.beginPath();
        graphics.arc(x, y, radius, 0, Math.PI * 2);
        graphics.arc(x + radius * 0.3, y, radius * 0.8, 0, Math.PI * 2);
        graphics.closePath();
        graphics.fillPath();
    }
}

export default MenuScene;