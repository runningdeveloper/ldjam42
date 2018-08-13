import phaser from 'phaser';
import { Preloader } from './preloader.js';
import { Game } from './game.js';


const config = {
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'content',
    scene: [
        Preloader,
        Game
    ]
}
const game =  new phaser.Game(config);
window.onresize = function () {
  game.renderer.resize(window.innerWidth, window.innerHeight)
  game.events.emit('resize')
}