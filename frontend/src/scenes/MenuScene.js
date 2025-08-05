import Phaser from 'phaser';

class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
        this.networkManager = null;
        this.playerName = '';
        this.buttons = [];
        this.nameInput = null;
        this.isConnected = false;
        this.stars = [];
        this.particles = [];
    }

    create() {
        this.networkManager = this.game.networkManager;
        
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create beautiful Islamic-themed background
        this.createIslamicBackground();
        
        // Create floating animations
        this.createFloatingElements();
        
        // Create title with proper Islamic design
        this.createIslamicTitle();
        
        // Create name input
        this.createNameInput();
        
        // Create menu buttons
        this.createMenuButtons();
        
        // Create footer
        this.createFooter();
        
        // Setup interactions
        this.setupInputHandlers();
        this.setupNetworkConnection();
    }

    createIslamicBackground() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Check if HD background is available
        if (this.textures.exists('bg-menu')) {
            // Use the high-quality background image
            const bg = this.add.image(width/2, height/2, 'bg-menu');
            
            // Scale to cover the entire screen while maintaining aspect ratio
            const scaleX = width / bg.width;
            const scaleY = height / bg.height;
            const scale = Math.max(scaleX, scaleY);
            bg.setScale(scale);
            
            // Add subtle overlay for better text readability
            const overlay = this.add.graphics();
            overlay.fillStyle(0x000000, 0.3);
            overlay.fillRect(0, 0, width, height);
        } else {
            // Fallback to programmatic gradient background
            const bg = this.add.graphics();
            
            // Islamic green gradient
            bg.fillGradientStyle(
                0x0A4B0F, // Dark green top-left
                0x1B5E20, // Medium green top-right  
                0x2E7D32, // Lighter green bottom-left
                0x1B5E20  // Medium green bottom-right
            );
            bg.fillRect(0, 0, width, height);
            
            // Add subtle Islamic pattern overlay
            this.createPatternOverlay();
            
            // Add ambient lighting effect
            const overlay = this.add.graphics();
            overlay.fillStyle(0x000000, 0.15);
            overlay.fillRect(0, 0, width, height);
        }
    }

    createPatternOverlay() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create subtle geometric pattern
        for (let x = 0; x < width; x += 150) {
            for (let y = 0; y < height; y += 150) {
                const pattern = this.add.graphics();
                pattern.lineStyle(1, 0xFFD700, 0.08);
                
                // Draw Islamic geometric star
                this.drawGeometricStar(pattern, x + 75, y + 75, 25);
                pattern.setDepth(-1);
            }
        }
    }

    drawGeometricStar(graphics, x, y, radius) {
        const points = 8;
        const step = Math.PI / points;
        
        graphics.beginPath();
        for (let i = 0; i <= points * 2; i++) {
            const r = i % 2 === 0 ? radius : radius * 0.5;
            const angle = i * step - Math.PI / 2;
            const px = x + Math.cos(angle) * r;
            const py = y + Math.sin(angle) * r;
            
            if (i === 0) {
                graphics.moveTo(px, py);
            } else {
                graphics.lineTo(px, py);
            }
        }
        graphics.closePath();
        graphics.strokePath();
    }

    createFloatingElements() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create floating stars with proper animations
        for (let i = 0; i < 12; i++) {
            const star = this.add.graphics();
            const x = Phaser.Math.Between(50, width - 50);
            const y = Phaser.Math.Between(50, height - 50);
            const size = Phaser.Math.Between(3, 8);
            
            star.fillStyle(0xFFD700, Phaser.Math.FloatBetween(0.2, 0.5));
            this.drawGeometricStar(star, 0, 0, size);
            star.setPosition(x, y);
            star.setDepth(1);
            
            this.stars.push(star);
            
            // Proper Phaser 3 tween animation
            this.tweens.add({
                targets: star,
                y: y - Phaser.Math.Between(30, 60),
                alpha: { from: 0.2, to: 0.7 },
                rotation: Math.PI * 2,
                duration: Phaser.Math.Between(4000, 8000),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
        
        // Create floating particles
        for (let i = 0; i < 20; i++) {
            const particle = this.add.circle(
                Phaser.Math.Between(0, width),
                Phaser.Math.Between(0, height),
                Phaser.Math.Between(2, 5),
                0xFFD700,
                Phaser.Math.FloatBetween(0.1, 0.3)
            );
            
            particle.setDepth(0);
            this.particles.push(particle);
            
            this.tweens.add({
                targets: particle,
                y: particle.y - Phaser.Math.Between(100, 200),
                alpha: { from: 0.1, to: 0.4 },
                duration: Phaser.Math.Between(6000, 10000),
                yoyo: true,
                repeat: -1,
                ease: 'Quad.easeInOut'
            });
        }
    }

    createIslamicTitle() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Main title with drop shadow effect
        const titleShadow = this.add.text(width/2 + 4, height * 0.15 + 4, 'Islamic Quiz', {
            fontSize: '52px',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 'bold',
            fill: '#000000'
        }).setOrigin(0.5).setAlpha(0.4).setDepth(2);
        
        const title = this.add.text(width/2, height * 0.15, 'Islamic Quiz', {
            fontSize: '52px',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 'bold',
            fill: '#FFFFFF',
            stroke: '#1B5E20',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(3);
        
        // Subtitle with animation
        const subtitle = this.add.text(width/2, height * 0.21, 'Card Game', {
            fontSize: '26px',
            fontFamily: 'Inter, sans-serif',
            fontWeight: '300',
            fill: '#E8F5E8'
        }).setOrigin(0.5).setDepth(3);
        
        // Islamic Bismillah
        const bismillah = this.add.text(width/2, height * 0.27, 'بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ', {
            fontSize: '22px',
            fontFamily: 'Amiri, serif',
            fill: '#FFD700'
        }).setOrigin(0.5).setDepth(3);
        
        // Gentle pulsing animation for title
        this.tweens.add({
            targets: [title, titleShadow],
            scaleX: 1.03,
            scaleY: 1.03,
            duration: 3000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Fade in animation for subtitle
        subtitle.setAlpha(0);
        this.tweens.add({
            targets: subtitle,
            alpha: 1,
            duration: 2000,
            delay: 500,
            ease: 'Quad.easeOut'
        });
        
        // Fade in animation for bismillah
        bismillah.setAlpha(0);
        this.tweens.add({
            targets: bismillah,
            alpha: 1,
            duration: 2000,
            delay: 1000,
            ease: 'Quad.easeOut'
        });
    }

    createNameInput() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Input background with proper graphics
        const inputBg = this.add.graphics();
        inputBg.fillStyle(0xFFFFFF, 0.95);
        inputBg.lineStyle(3, 0xFFD700, 1);
        inputBg.fillRoundedRect(width/2 - 160, height * 0.36 - 30, 320, 60, 30);
        inputBg.strokeRoundedRect(width/2 - 160, height * 0.36 - 30, 320, 60, 30);
        inputBg.setDepth(4);
        
        // Input label
        this.add.text(width/2, height * 0.32, 'Enter Your Name', {
            fontSize: '18px',
            fontFamily: 'Inter, sans-serif',
            fontWeight: '600',
            fill: '#FFFFFF'
        }).setOrigin(0.5).setDepth(5);
        
        // Name display text
        this.nameDisplay = this.add.text(width/2, height * 0.36, 'Click here to enter your name...', {
            fontSize: '20px',
            fontFamily: 'Inter, sans-serif',
            fontWeight: '500',
            fill: '#1B5E20'
        }).setOrigin(0.5).setDepth(5);
        
        // Interactive zone for name input
        const inputZone = this.add.zone(width/2, height * 0.36, 320, 60);
        inputZone.setInteractive({ cursor: 'pointer' });
        inputZone.setDepth(6);
        
        // Hover effects
        inputZone.on('pointerover', () => {
            inputBg.clear();
            inputBg.fillStyle(0xFFFFFF, 1);
            inputBg.lineStyle(4, 0xFFD700, 1);
            inputBg.fillRoundedRect(width/2 - 160, height * 0.36 - 30, 320, 60, 30);
            inputBg.strokeRoundedRect(width/2 - 160, height * 0.36 - 30, 320, 60, 30);
        });
        
        inputZone.on('pointerout', () => {
            inputBg.clear();
            inputBg.fillStyle(0xFFFFFF, 0.95);
            inputBg.lineStyle(3, 0xFFD700, 1);
            inputBg.fillRoundedRect(width/2 - 160, height * 0.36 - 30, 320, 60, 30);
            inputBg.strokeRoundedRect(width/2 - 160, height * 0.36 - 30, 320, 60, 30);
        });
        
        inputZone.on('pointerdown', () => this.showNameInput());
        
        this.inputBg = inputBg;
        this.inputZone = inputZone;
    }

    showNameInput() {
        const name = prompt('Enter your name:');
        if (name && name.trim()) {
            this.playerName = name.trim();
            this.nameDisplay.setText(this.playerName);
            this.nameDisplay.setStyle({ fontWeight: '600', fill: '#2E7D32' });
            this.enableMenuButtons();
            
            // Success animation
            this.tweens.add({
                targets: this.inputBg,
                scaleX: 1.05,
                scaleY: 1.05,
                duration: 200,
                yoyo: true,
                ease: 'Back.easeOut'
            });
        }
    }

    createMenuButtons() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        const buttonData = [
            { text: '⚡ Quick Match', key: 'quick', color: 0xFF6B35, y: height * 0.52 },
            { text: '🏠 Create Room', key: 'create', color: 0x4CAF50, y: height * 0.61 },
            { text: '🚪 Join Room', key: 'join', color: 0x2196F3, y: height * 0.70 },
            { text: '📚 Practice', key: 'practice', color: 0x9C27B0, y: height * 0.79 }
        ];
        
        this.buttons = [];
        
        buttonData.forEach((data, index) => {
            const button = this.createGameButton(width/2, data.y, data.text, data.color, () => {
                this.handleMenuAction(data.key);
            });
            
            // Start buttons off-screen and animate in
            button.x = -400;
            button.setAlpha(0.3);
            button.disableInteractive();
            this.buttons.push(button);
            
            // Staggered entrance animation
            this.tweens.add({
                targets: button,
                x: width/2,
                alpha: 1,
                duration: 800,
                delay: index * 150,
                ease: 'Back.easeOut'
            });
        });
    }

    createGameButton(x, y, text, color, callback) {
        const container = this.add.container(x, y);
        container.setDepth(10);
        
        // Create color variations using proper Phaser 3 color methods
        const baseColor = new Phaser.Display.Color(color);
        const lightColor = baseColor.clone().lighten(20);
        const darkColor = baseColor.clone().darken(10);
        
        // Button background
        const bg = this.add.graphics();
        bg.fillStyle(color, 1);
        bg.fillRoundedRect(-130, -28, 260, 56, 28);
        
        // Button border
        const border = this.add.graphics();
        border.lineStyle(3, 0xFFD700, 0.8);
        border.strokeRoundedRect(-130, -28, 260, 56, 28);
        
        // Button text
        const buttonText = this.add.text(0, 0, text, {
            fontSize: '20px',
            fontFamily: 'Inter, sans-serif',
            fontWeight: '700',
            fill: '#FFFFFF'
        }).setOrigin(0.5);
        
        // Button highlight (initially hidden)
        const highlight = this.add.graphics();
        highlight.fillStyle(lightColor.color, 0.3);
        highlight.fillRoundedRect(-130, -28, 260, 56, 28);
        highlight.setVisible(false);
        
        container.add([bg, highlight, border, buttonText]);
        container.setSize(260, 56);
        container.setInteractive({ cursor: 'pointer' });
        
        // Store references
        container.bg = bg;
        container.border = border;
        container.highlight = highlight;
        container.buttonText = buttonText;
        container.baseColor = color;
        container.lightColor = lightColor.color;
        
        // Hover effects
        container.on('pointerover', () => {
            this.tweens.add({
                targets: container,
                scaleX: 1.05,
                scaleY: 1.05,
                duration: 200,
                ease: 'Quad.easeOut'
            });
            
            highlight.setVisible(true);
            border.clear();
            border.lineStyle(4, 0xFFD700, 1);
            border.strokeRoundedRect(-130, -28, 260, 56, 28);
        });
        
        container.on('pointerout', () => {
            this.tweens.add({
                targets: container,
                scaleX: 1,
                scaleY: 1,
                duration: 200,
                ease: 'Quad.easeOut'
            });
            
            highlight.setVisible(false);
            border.clear();
            border.lineStyle(3, 0xFFD700, 0.8);
            border.strokeRoundedRect(-130, -28, 260, 56, 28);
        });
        
        container.on('pointerdown', () => {
            // Click animation
            this.tweens.add({
                targets: container,
                scaleX: 0.95,
                scaleY: 0.95,
                duration: 100,
                yoyo: true,
                ease: 'Quad.easeInOut',
                onComplete: callback
            });
        });
        
        return container;
    }

    enableMenuButtons() {
        this.buttons.forEach((button, index) => {
            button.setInteractive({ cursor: 'pointer' });
            
            // Enable animation
            this.tweens.add({
                targets: button,
                alpha: 1,
                duration: 300,
                delay: index * 50,
                ease: 'Quad.easeOut'
            });
        });
    }

    createFooter() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Connection status
        this.connectionStatus = this.add.text(width/2, height * 0.88, '🔴 Connecting to server...', {
            fontSize: '16px',
            fontFamily: 'Inter, sans-serif',
            fontWeight: '500',
            fill: '#E8F5E8'
        }).setOrigin(0.5).setDepth(5);
        
        // Version info
        this.add.text(width/2, height * 0.93, 'Ummah360 Islamic Quiz v1.0 • الحمد لله', {
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
            fill: '#A5D6A7'
        }).setOrigin(0.5).setDepth(5);
        
        // Add subtle pulsing to connection status
        this.tweens.add({
            targets: this.connectionStatus,
            alpha: 0.6,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    handleMenuAction(action) {
        if (!this.playerName) {
            this.showNameInput();
            return;
        }
        
        // Screen transition effect
        this.cameras.main.fadeOut(500, 0, 0, 0);
        
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
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
        });
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
            this.cameras.main.fadeOut(300, 0, 0, 0);
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                this.scene.restart();
            });
        });
        
        // Enter key for name input
        this.input.keyboard.on('keydown-ENTER', () => {
            if (!this.playerName) {
                this.showNameInput();
            }
        });
    }

    setupNetworkConnection() {
        if (!this.networkManager) return;
        
        // Try to connect with proper error handling
        this.networkManager.connect(this.playerName || 'Anonymous')
            .then(() => {
                this.isConnected = true;
                this.connectionStatus.setText('🟢 Connected to server');
                this.connectionStatus.setTint(0x4CAF50);
                
                // Success animation
                this.tweens.add({
                    targets: this.connectionStatus,
                    scaleX: 1.1,
                    scaleY: 1.1,
                    duration: 300,
                    yoyo: true,
                    ease: 'Back.easeOut'
                });
            })
            .catch((error) => {
                this.isConnected = false;
                this.connectionStatus.setText('🔴 Connection failed - Playing offline');
                this.connectionStatus.setTint(0xFF5722);
                console.error('Connection failed:', error);
            });
    }

    update(time, delta) {
        // Optional: Add any per-frame updates here
        // Keep particles and stars animated smoothly
    }

    shutdown() {
        // Clean up tweens and animations
        this.tweens.killAll();
        
        // Clean up arrays
        this.stars = [];
        this.particles = [];
        this.buttons = [];
    }
}

export default MenuScene;