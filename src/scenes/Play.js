class Play extends Phaser.Scene {
    constructor() {
        super("playScene")
    }

    preload() {
        // Load images and tile sprite
        this.load.image("rocket", "./assets/rocket.png");
        this.load.image("spaceship", "./assets/spaceship.png");
        this.load.image("starfield", "./assets/starfield.png");
        this.load.image("smallship", "./assets/small_ship.png");
        // Load spritesheet
        this.load.spritesheet('explosion', './assets/explosion.png', {frameWidth: 64, frameHeight: 32, startFrame: 0, endFrame: 9});
        this.load.spritesheet('smallexplosion', './assets/explosion.png', {frameWidth: 32, frameHeight: 16, startFrame: 0, endFrame: 9});
    }

    create(time, delta) {
        //variables
        startTime = time;
        this.currentPlayTimeSec = Math.floor(game.settings.gameTimer / 1000); //gameTimer in seconds
        this.music = this.sound.add('backgroundMusic'); //Background music variable
        this.maxPlayTime = game.settings.gameTimer / 1000;

        //play background music

        this.music.play();
        
        //Place Tile Sprite
        this.starfield = this.add.tileSprite(0, 0, 640, 480, "starfield").setOrigin(0,0);

        //white rectangle borders
        this.add.rectangle(5, 5, 630, 32, 0xFFFFFF).setOrigin(0, 0);
        this.add.rectangle(5, 443, 630, 32, 0xFFFFFF).setOrigin(0, 0);
        this.add.rectangle(5, 5, 32, 455, 0xFFFFFF).setOrigin(0, 0);
        this.add.rectangle(603, 5, 32, 455, 0xFFFFFF).setOrigin(0, 0);

        //grid UI background
        this.add.rectangle(37, 42, 566, 64, 0x00FF00).setOrigin(0, 0);

        //add the rocket(p1)
        this.p1Rocket = new Rocket(this, game.config.width / 2, 431, "rocket").setScale(0.5, 0.5).setOrigin(0, 0);

        //add spaceship(x3)
        this.ship01 = new Spaceship(this, game.config.width + 192, 164, "spaceship", 0, 30).setOrigin(0,0);
        this.ship02 = new Spaceship(this, game.config.width + 96, 228, "spaceship", 0, 20).setOrigin(0,0);
        this.ship03 = new Spaceship(this, game.config.width, 292, "spaceship", 0, 10).setOrigin(0,0);

        //add smallship(x1)
        this.smallShip01 = new Smallship(this, game.config.width + 288, 132, "smallship", 0, 50).setOrigin(0,0);

        //define keyboard keys
        keyF = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
        keyLEFT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        keyRIGHT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        keyUP = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        keyDOWN = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);

        // animation config
        this.anims.create({
            key: 'explode',
            frames: this.anims.generateFrameNumbers('explosion', { start: 0, end: 9, first: 0}),
            frameRate: 30
        });

        this.anims.create({
            key: 'smallexplode',
            frames: this.anims.generateFrameNumbers('smallexplosion', { start: 0, end: 9, first: 0}),
            frameRate: 30
        });

        this.p1Score = 0;
        // score display

        let scoreConfig = {
            fontFamily: 'Courier',
            fontSize: '28px',
            backgroundColor: '#F3B141',
            color: '#843605',
            align: 'right',
            padding: {
                top: 5,
                bottom: 5,
            },
            fixedWidth: 100
        }
        this.scoreLeft = this.add.text(69, 54, this.p1Score, scoreConfig);

        //Time Display
        let timeConfig = {
            fontFamily: 'Courier',
            fontSize: '14px',
            backgroundColor: '#F3B141',
            color: '#843605',
            align: 'right',
            padding: {
                top: 5,
                bottom: 5,
            },
        }
        this.timeDisplay = this.add.text(411, 44, 'TIME LEFT: ' + this.currentPlayTimeSec, timeConfig);

        //Highscore Display
        this.highScoreDisplay = this.add.text(411, 74, 'HIGH SCORE: ' + highScore, timeConfig)

        // Fire display
        let fireConfig = {
            fontFamily: 'Courier',
            fontSize: '28px',
            backgroundColor: '#ff0000',
            color: '#ffffff',
            align: 'center',
            padding: {
                top: 5,
                bottom: 5,
            },
            fixedWidth: 100
        }
        this.fireText = this.add.text(269, 54, 'Fire', fireConfig);

        // game over flag
        this.gameOver = false;

        scoreConfig.fixedWidth = 0;
    }


    update(time, delta) {
        //game over timer
        var timeElapsed = Math.floor(time - startTime);
        this.currentPlayTimeSec = this.maxPlayTime - Math.floor(timeElapsed / 1000);
        if (!this.gameOver){
            this.timeDisplay.text = 'TIME LEFT: ' + this.currentPlayTimeSec;
        }

        //update HIGH SCORE
        if (this.p1Score > highScore) {
            let timeConfig = {
                fontFamily: 'Courier',
                fontSize: '14px',
                backgroundColor: '#F3B141',
                color: '#843605',
                align: 'right',
                padding: {
                    top: 5,
                    bottom: 5,
                },
            }
            highScore = this.p1Score;
            this.highScoreDisplay = this.add.text(411, 74, 'HIGH SCORE: ' + highScore, timeConfig)
        }

        // check key input for restart
        if (this.gameOver && Phaser.Input.Keyboard.JustDown(keyF)) {
            this.scene.start("playScene", time);
        }

        //scroll starfields
        this.starfield.tilePositionX -= 4;

        if (!this.gameOver) {               
            this.p1Rocket.update();         // update rocket sprite
            this.ship01.update();           // update spaceships (x3)
            this.ship02.update();
            this.ship03.update();
            this.smallShip01.update();
        }

        //Hide/Show fireDisplay
        if (!this.p1Rocket.isFiring) {
            this.fireText.visible = false;
        }
        if (this.p1Rocket.isFiring) {
            this.fireText.visible = true;
        }

        // check collisions
        if(this.checkCollision(this.p1Rocket, this.ship03)) {
            this.p1Rocket.reset();
            this.shipExplode(this.ship03);
            this.maxPlayTime += 1;
            this.currentPlayTimeSec = this.maxPlayTime - Math.floor(timeElapsed / 1000);
            this.timeDisplay.text = 'TIME LEFT: ' + this.currentPlayTimeSec;
        }
        if (this.checkCollision(this.p1Rocket, this.ship02)) {
            this.p1Rocket.reset();
            this.shipExplode(this.ship02);
            this.maxPlayTime += 2;
            this.currentPlayTimeSec = this.maxPlayTime - Math.floor(timeElapsed / 1000);
            this.timeDisplay.text = 'TIME LEFT: ' + this.currentPlayTimeSec;
        }
        if (this.checkCollision(this.p1Rocket, this.ship01)) {
            this.p1Rocket.reset();
            this.shipExplode(this.ship01);
            this.maxPlayTime += 3;
            this.currentPlayTimeSec = this.maxPlayTime - Math.floor(timeElapsed / 1000);
            this.timeDisplay.text = 'TIME LEFT: ' + this.currentPlayTimeSec;
        }
        if (this.checkCollision(this.p1Rocket, this.smallShip01)) {
            this.p1Rocket.reset();
            this.smallExplode(this.smallShip01);
            this.maxPlayTime += 5;
            this.currentPlayTimeSec = this.maxPlayTime - Math.floor(timeElapsed / 1000);
            this.timeDisplay.text = 'TIME LEFT: ' + this.currentPlayTimeSec;
        }
        
        //Game Over
        if(this.currentPlayTimeSec == 0) {
            this.music.stop();
            let scoreConfig = {
                fontFamily: 'Courier',
                fontSize: '28px',
                backgroundColor: '#F3B141',
                color: '#843605',
                align: 'right',
                padding: {
                    top: 5,
                    bottom: 5,
                },
            }
            this.add.text(game.config.width/2, game.config.height/2, 'GAME OVER', scoreConfig).setOrigin(0.5);
            this.add.text(game.config.width/2, game.config.height/2 + 64, '(F)ire to Restart', scoreConfig).setOrigin(0.5);
            this.gameOver = true;
        }

    }

    checkCollision(rocket, ship) {
        // simple AABB checking
        if (rocket.x < ship.x + ship.width && 
            rocket.x + rocket.width > ship.x && 
            rocket.y < ship.y + ship.height &&
            rocket.height + rocket.y > ship. y) {
                return true;
        } else {
            return false;
        }
    }

    shipExplode(ship) {
        ship.alpha = 0;                         // temporarily hide ship
        // create explosion sprite at ship's position
        let boom = this.add.sprite(ship.x, ship.y, 'explosion').setOrigin(0, 0);
        boom.anims.play('explode');             // play explode animation
        boom.on('animationcomplete', () => {    // callback after animation completes
            ship.reset();                       // reset ship position
            ship.alpha = 1;                     // make ship visible again
            boom.destroy();                     // remove explosion sprite
        }); 
        // score increment and repaint
        this.p1Score += ship.points;
        this.scoreLeft.text = this.p1Score;
        this.sound.play('sfx_explosion');      
    }

    smallExplode(ship) {
        ship.alpha = 0;                         // temporarily hide ship
        // create explosion sprite at ship's position
        let boom = this.add.sprite(ship.x, ship.y, 'smallexplosion').setOrigin(0, 0);
        boom.anims.play('smallexplode');             // play explode animation
        boom.on('animationcomplete', () => {    // callback after animation completes
            ship.reset();                       // reset ship position
            ship.alpha = 1;                     // make ship visible again
            boom.destroy();                     // remove explosion sprite
        }); 
        // score increment and repaint
        this.p1Score += ship.points;
        this.scoreLeft.text = this.p1Score;
        this.sound.play('sfx_explosion');   
    }
}