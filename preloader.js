import phaser from 'phaser';
import rocket from './assets/rocket_green1.png';
import sat from './assets/rocket_white1.png';
import planet from './assets/planet_small.png';
export class Preloader extends phaser.Scene {
    constructor () {
        super({
            key: 'preloader'
        })
    }
    preload () {
        console.log('Preload');
        this.load.image('planet', planet);
        this.load.image('rocket', rocket);
        this.load.image('sat', sat);
    }
    create () {
      this.scene.start('game');
    }
}