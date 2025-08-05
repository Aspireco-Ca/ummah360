import Phaser from 'phaser';

class VictoryScene extends Phaser.Scene {
    constructor() {
        super({ key: 'VictoryScene' });
        this.winner = null;
        this.scores = [];
        this.gameMode = '';
        this.particles = [];
    }

    init(data) {
        this.winner = data.winner || 'Player';
        this.scores = data.scores || [];
        this.gameMode = data.gameMode || 'practice';
        this.playerName = data.playerName || 'Player';
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Victory background
        this.createVictoryBackground();
        
        // Celebration effects
        this.createCelebrationEffects();
        
        // Victory UI
        this.createVictoryUI();
        
        // Action buttons
        this.createActionButtons();
        
        // Play victory sound if available
        if (this.sound.get('victory')) {
            this.sound.play('victory');
        }
    }

    createVictoryBackground() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Check if HD background is available
        if (this.textures.exists('bg-victory')) {
            // Use the high-quality victory background
            const bg = this.add.image(width/2, height/2, 'bg-victory');
            
            // Scale to cover the entire screen while maintaining aspect ratio
            const scaleX = width / bg.width;
            const scaleY = height / bg.height;
            const scale = Math.max(scaleX, scaleY);
            bg.setScale(scale);
            
            // Add subtle overlay for better text readability
            const overlay = this.add.graphics();
            overlay.fillStyle(0x000000, 0.4);
            overlay.fillRect(0, 0, width, height);
        } else {
            // Fallback to gradient background
            const bg = this.add.graphics();
            
            // Night sky gradient
            bg.fillGradientStyle(
                0x0A0A2E, // Dark blue top
                0x1A1A3E, // Purple top-right
                0x2E0A3E, // Purple bottom
                0x0A0A2E  // Dark blue bottom-right
            );
            bg.fillRect(0, 0, width, height);
            
            // Add stars
            for (let i = 0; i < 100; i++) {
                const star = this.add.circle(
                    Phaser.Math.Between(0, width),
                    Phaser.Math.Between(0, height * 0.7),
                    Phaser.Math.Between(1, 3),
                    0xFFFFFF,
                    Phaser.Math.FloatBetween(0.3, 1)
                );
                
                // Twinkling effect
                this.tweens.add({
                    targets: star,
                    alpha: { from: 0.3, to: 1 },
                    duration: Phaser.Math.Between(1000, 3000),
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            }
            
            // Crescent moon
            const moon = this.add.graphics();
            moon.fillStyle(0xFFFFE0);
            moon.fillCircle(width * 0.8, height * 0.2, 50);
            moon.fillStyle(0x0A0A2E);
            moon.fillCircle(width * 0.8 + 20, height * 0.2, 50);
        }
    }

    createCelebrationEffects() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Falling golden particles
        for (let i = 0; i < 30; i++) {
            const particle = this.add.graphics();
            const x = Phaser.Math.Between(0, width);
            const y = Phaser.Math.Between(-100, -50);
            const size = Phaser.Math.Between(3, 8);
            
            // Draw star-shaped particle
            particle.fillStyle(0xFFD700, Phaser.Math.FloatBetween(0.6, 1));
            this.drawStar(particle, 0, 0, 5, size, size * 0.5);
            particle.setPosition(x, y);
            
            this.particles.push(particle);
            
            // Falling animation
            this.tweens.add({
                targets: particle,
                y: height + 50,
                x: x + Phaser.Math.Between(-50, 50),
                rotation: Math.PI * 4,
                duration: Phaser.Math.Between(3000, 6000),
                repeat: -1,
                delay: Phaser.Math.Between(0, 3000),
                ease: 'Linear'
            });
        }
        
        // Firework bursts
        this.time.addEvent({
            delay: 2000,
            callback: () => this.createFirework(),
            loop: true
        });
    }

    createFirework() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const x = Phaser.Math.Between(width * 0.2, width * 0.8);
        const y = Phaser.Math.Between(height * 0.3, height * 0.5);
        
        // Create burst of particles
        for (let i = 0; i < 20; i++) {
            const particle = this.add.circle(x, y, 3, 0xFFD700);
            const angle = (Math.PI * 2 * i) / 20;
            const distance = Phaser.Math.Between(50, 150);
            
            this.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * distance,
                y: y + Math.sin(angle) * distance,
                alpha: { from: 1, to: 0 },
                scale: { from: 1, to: 0 },
                duration: 1000,
                ease: 'Quad.easeOut',
                onComplete: () => particle.destroy()
            });
        }
    }

    createVictoryUI() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Victory container
        const container = this.add.container(width/2, height * 0.35);
        
        // Victory crown
        const crown = this.add.text(0, -80, '👑', {
            fontSize: '64px',
            align: 'center'
        }).setOrigin(0.5);
        
        // Bounce animation for crown
        this.tweens.add({
            targets: crown,
            y: -70,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Victory text
        const victoryText = this.add.text(0, 0, 'مبارك! Victory!', {
            fontSize: '48px',
            fontFamily: 'Amiri, serif',
            fontWeight: 'bold',
            fill: '#FFD700',
            stroke: '#1B5E20',
            strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5);
        
        // Winner name
        const winnerText = this.add.text(0, 60, this.winner === this.playerName ? 'You Won!' : `${this.winner} Won!`, {
            fontSize: '32px',
            fontFamily: 'Inter, sans-serif',
            fontWeight: '600',
            fill: '#FFFFFF',
            align: 'center'
        }).setOrigin(0.5);
        
        // Islamic congratulation
        const islamicText = this.add.text(0, 100, 'الحمد لله', {
            fontSize: '24px',
            fontFamily: 'Amiri, serif',
            fill: '#E8F5E8',
            align: 'center'
        }).setOrigin(0.5);
        
        container.add([crown, victoryText, winnerText, islamicText]);
        
        // Scale in animation
        container.setScale(0);
        this.tweens.add({
            targets: container,
            scale: 1,
            duration: 800,
            ease: 'Back.easeOut'
        });
        
        // Display scores if multiplayer
        if (this.scores.length > 0 && this.gameMode !== 'practice') {
            this.createScoreboard();
        }
    }

    createScoreboard() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Scoreboard background
        const scoreBg = this.add.graphics();
        scoreBg.fillStyle(0x1B5E20, 0.8);
        scoreBg.lineStyle(3, 0xFFD700, 1);
        scoreBg.fillRoundedRect(width/2 - 200, height * 0.55, 400, 150, 20);
        scoreBg.strokeRoundedRect(width/2 - 200, height * 0.55, 400, 150, 20);
        
        // Scores title
        this.add.text(width/2, height * 0.57, 'Final Scores', {
            fontSize: '20px',
            fontFamily: 'Inter, sans-serif',
            fontWeight: '600',
            fill: '#FFD700',
            align: 'center'
        }).setOrigin(0.5);
        
        // Display scores
        this.scores.forEach((score, index) => {
            const y = height * 0.62 + (index * 25);
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '  ';
            
            this.add.text(width/2 - 180, y, `${medal} ${score.name}`, {
                fontSize: '16px',
                fontFamily: 'Inter, sans-serif',
                fill: '#FFFFFF'
            });
            
            this.add.text(width/2 + 180, y, `${score.points} pts`, {
                fontSize: '16px',
                fontFamily: 'Inter, sans-serif',
                fill: '#FFFFFF'
            }).setOrigin(1, 0);
        });
    }

    createActionButtons() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Play Again button
        const playAgainBtn = this.createButton(
            width/2 - 110, 
            height * 0.8, 
            '🔄 Play Again', 
            0x4CAF50,
            () => {
                this.scene.start('MenuScene');
            }
        );
        
        // Main Menu button
        const menuBtn = this.createButton(
            width/2 + 110, 
            height * 0.8, 
            '🏠 Main Menu', 
            0x2196F3,
            () => {
                this.scene.start('MenuScene');
            }
        );
        
        // Animate buttons in
        [playAgainBtn, menuBtn].forEach((btn, index) => {
            btn.setScale(0);
            this.tweens.add({
                targets: btn,
                scale: 1,
                duration: 500,
                delay: 1000 + (index * 100),
                ease: 'Back.easeOut'
            });
        });
    }

    createButton(x, y, text, color, callback) {
        const button = this.add.container(x, y);
        
        // Button background
        const bg = this.add.graphics();
        bg.fillStyle(color, 0.9);
        bg.lineStyle(3, 0xFFD700, 1);
        bg.fillRoundedRect(-100, -25, 200, 50, 25);
        bg.strokeRoundedRect(-100, -25, 200, 50, 25);
        
        // Button text
        const btnText = this.add.text(0, 0, text, {
            fontSize: '18px',
            fontFamily: 'Inter, sans-serif',
            fontWeight: '600',
            fill: '#FFFFFF',
            align: 'center'
        }).setOrigin(0.5);
        
        button.add([bg, btnText]);
        button.setSize(200, 50);
        button.setInteractive({ cursor: 'pointer' });
        
        // Hover effects
        button.on('pointerover', () => {
            this.tweens.add({
                targets: button,
                scale: 1.05,
                duration: 200,
                ease: 'Quad.easeOut'
            });
        });
        
        button.on('pointerout', () => {
            this.tweens.add({
                targets: button,
                scale: 1,
                duration: 200,
                ease: 'Quad.easeOut'
            });
        });
        
        button.on('pointerdown', callback);
        
        return button;
    }

    drawStar(graphics, x, y, points, outerRadius, innerRadius) {
        const step = Math.PI / points;
        
        graphics.beginPath();
        for (let i = 0; i <= points * 2; i++) {
            const r = i % 2 === 0 ? outerRadius : innerRadius;
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
        graphics.fillPath();
    }

    update() {
        // Optional: Add any per-frame updates here
    }
}

export default VictoryScene;