//Rocket Prefab
class Rocket extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame);

        scene.add.existing(this); //add object to existing scene

        this.isFiring = false; //track rockets firing status

        this.sfxRocket = scene.sound.add('sfx_rocket'); // add rocket sfx
    }

    update() {
        //left right movement
        if(!this.isFiring) {
            if(keyLEFT.isDown && this.x >= 47) {
                this.x -= 2;
            } else if(keyRIGHT.isDown && this.x <= 578) {
                this.x += 2;
            }
        }

        //firebutton
        if(Phaser.Input.Keyboard.JustDown(keyF) && !this.isFiring) {
            this.isFiring = true;
            this.sfxRocket.play();  // play sfx
        }

        //if fired move up
        if(this.isFiring && this.y >= 108) {
            this.y -= 2;
            if(keyLEFT.isDown && this.x >= 47) {
                this.x -= 0.5;
            } else if(keyRIGHT.isDown && this.x <= 578) {
                this.x += 0.5;
            } else if(keyUP.isDown) {
                this.y -= 0.25;
            } else if(keyDOWN.isDown) {
                this.y += 0.25;
            }

        }

        //reset on miss
        if(this.y <= 108) {
            this.reset();
        }
    }

    reset() {
        this.isFiring = false;
        this.y = 431
    }
}