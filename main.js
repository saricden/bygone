import './style.css';
import { Game, WEBGL, Scale } from 'phaser';
// import { StatusBar } from '@capacitor/status-bar';
import { Boot } from './scenes/Boot';
import { Demo } from './scenes/Demo';
import { Hud } from './scenes/Hud';

const canvas = document.getElementById('game');

const config = {
  type: WEBGL,
  canvas,
  dom: {
    createContainer: true
  },
  input: {
    mouse: {
      target: 'game'
    },
    touch: {
      target: 'game'
    }
  }
  ,
  width: 720,
  height: 720,
  scale: {
    parent: document.querySelector('body'),
    mode: Scale.FIT
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 800 },
      // debug: true
    }
  },
  input: {
    gamepad: true
  },
  scene: [
    Boot,
    Demo,
    Hud
  ],
  pixelArt: true
}

function boot() {
  // try {
  //   await StatusBar.hide();
  // }
  // catch (e) {
  //   console.warn(e);
  // }
  new Game(config);
}

boot();
document.addEventListener('contextmenu', e => e.preventDefault());