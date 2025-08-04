import Phaser from 'phaser';

class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Create a loading bar
        this.createLoadingBar();
        
        // Load essential assets
        this.loadAssets();
        
        // Set up progress tracking
        this.load.on('progress', this.updateLoadingBar, this);
        this.load.on('complete', this.loadComplete, this);
    }

    createLoadingBar() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Background
        this.add.rectangle(width / 2, height / 2, width * 0.8, 60, 0x1B5E20);
        
        // Progress bar background
        const progressBg = this.add.rectangle(width / 2, height / 2, width * 0.7, 20, 0x333333);
        
        // Progress bar fill
        this.progressBar = this.add.rectangle(width / 2 - (width * 0.7) / 2, height / 2, 0, 20, 0xFFD700);
        this.progressBar.setOrigin(0, 0.5);
        
        // Loading text
        this.loadingText = this.add.text(width / 2, height / 2 - 50, 'بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ', {
            fontSize: '24px',
            fontFamily: 'Amiri, serif',
            fill: '#FFFFFF',
            align: 'center'
        }).setOrigin(0.5);
        
        this.statusText = this.add.text(width / 2, height / 2 + 50, 'Loading Islamic Quiz Card Game...', {
            fontSize: '16px',
            fontFamily: 'Inter, sans-serif',
            fill: '#FFFFFF',
            align: 'center'
        }).setOrigin(0.5);
        
        // Percentage text
        this.percentText = this.add.text(width / 2, height / 2, '0%', {
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
            fill: '#1B5E20',
            fontStyle: 'bold'
        }).setOrigin(0.5);
    }

    loadAssets() {
        // Create placeholder assets programmatically
        this.createPlaceholderAssets();
        
        // Load audio files (if available)
        // Note: We'll create these programmatically for now
        this.createAudioAssets();
        
        // Load fonts if needed
        this.loadFonts();
    }

    createPlaceholderAssets() {
        // Create card back texture
        const cardBack = this.add.graphics();
        cardBack.fillStyle(0x1B5E20);
        cardBack.fillRoundedRect(0, 0, 200, 300, 20);
        cardBack.lineStyle(4, 0xFFD700);
        cardBack.strokeRoundedRect(0, 0, 200, 300, 20);
        
        // Add Islamic pattern
        cardBack.lineStyle(2, 0xFFD700, 0.5);
        for (let i = 0; i < 5; i++) {
            cardBack.strokeCircle(100, 150, 20 + i * 15);
        }
        
        cardBack.generateTexture('card-back', 200, 300);
        cardBack.destroy();

        // Create card front texture
        const cardFront = this.add.graphics();
        cardFront.fillStyle(0xFFFFFF);
        cardFront.fillRoundedRect(0, 0, 200, 300, 20);
        cardFront.lineStyle(4, 0x1B5E20);
        cardFront.strokeRoundedRect(0, 0, 200, 300, 20);
        cardFront.generateTexture('card-front', 200, 300);
        cardFront.destroy();

        // Create button texture
        const button = this.add.graphics();
        button.fillGradientStyle(0xFFD700, 0xFFD700, 0xFFA000, 0xFFA000);
        button.fillRoundedRect(0, 0, 200, 60, 15);
        button.lineStyle(2, 0x1B5E20);
        button.strokeRoundedRect(0, 0, 200, 60, 15);
        button.generateTexture('button', 200, 60);
        button.destroy();

        // Create background pattern
        const bgPattern = this.add.graphics();
        bgPattern.fillStyle(0x1B5E20, 0.1);
        bgPattern.fillRect(0, 0, 100, 100);
        bgPattern.lineStyle(1, 0xFFD700, 0.3);
        
        // Simple geometric pattern
        bgPattern.beginPath();
        bgPattern.moveTo(50, 0);
        bgPattern.lineTo(100, 50);
        bgPattern.lineTo(50, 100);
        bgPattern.lineTo(0, 50);
        bgPattern.closePath();
        bgPattern.strokePath();
        
        bgPattern.generateTexture('bg-pattern', 100, 100);
        bgPattern.destroy();

        // Create player avatar placeholder
        const avatar = this.add.graphics();
        avatar.fillStyle(0x2E7D32);
        avatar.fillCircle(40, 40, 35);
        avatar.lineStyle(3, 0xFFD700);
        avatar.strokeCircle(40, 40, 35);
        avatar.generateTexture('player-avatar', 80, 80);
        avatar.destroy();
    }

    createAudioAssets() {
        // Note: For now, we'll just register the keys
        // Audio files should be provided by the user later
        this.sound.add('card-flip', { volume: 0.3 });
        this.sound.add('correct-answer', { volume: 0.5 });
        this.sound.add('wrong-answer', { volume: 0.3 });
        this.sound.add('background-music', { volume: 0.2, loop: true });
        this.sound.add('notification', { volume: 0.4 });
    }

    loadFonts() {
        // Fonts are loaded via CSS link in index.html
        // Just ensure they're available
        this.statusText.setText('Loading fonts and assets...');
    }

    updateLoadingBar(progress) {
        const width = this.cameras.main.width;
        this.progressBar.width = (width * 0.7) * progress;
        this.percentText.setText(Math.round(progress * 100) + '%');
        
        // Update status text based on progress
        if (progress < 0.3) {
            this.statusText.setText('Loading game assets...');
        } else if (progress < 0.6) {
            this.statusText.setText('Preparing Islamic content...');
        } else if (progress < 0.9) {
            this.statusText.setText('Setting up multiplayer...');
        } else {
            this.statusText.setText('Almost ready...');
        }
    }

    loadComplete() {
        this.statusText.setText('Ready! الحمد لله');
        
        // Add a short delay before transitioning
        this.time.delayedCall(1000, () => {
            this.scene.start('MenuScene');
        });
    }

    create() {
        // Add background pattern
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Tile the background pattern
        for (let x = 0; x < width; x += 100) {
            for (let y = 0; y < height; y += 100) {
                this.add.image(x, y, 'bg-pattern').setOrigin(0, 0).setAlpha(0.1);
            }
        }
    }
}

export default BootScene;