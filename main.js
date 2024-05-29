import './style.css';
import { Game, WEBGL, Scale } from 'phaser';
// import { StatusBar } from '@capacitor/status-bar';
import { Boot } from './scenes/Boot';
import { Demo } from './scenes/Demo';
import { Hud } from './scenes/Hud';
import { Title } from './scenes/Title';
import { audioContext } from './utils/ffmpeg';

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
    Title,
    Demo,
    Hud
  ],
  pixelArt: true,
  audio: {
    context: audioContext
  }
}

function boot() {
  // try {
  //   await StatusBar.hide();
  // }
  // catch (e) {
  //   console.warn(e);
  // }
  new Game(config);
  // canvas.style.display = 'none';
}

boot();

document.addEventListener('contextmenu', e => e.preventDefault());
window.addEventListener('touchstart', () => {
  document.documentElement.classList.remove('novirtual');
});

const doc = document.documentElement;

document.addEventListener('click', () => {
  if (!document.fullscreenElement) {
    doc.requestFullscreen();
  }
});

document.addEventListener('fullscreenchange', () => {
  if (document.fullscreenElement) {
    doc.classList.add('no_cursor');
  }
  else {
    doc.classList.remove('no_cursor');
  }
});