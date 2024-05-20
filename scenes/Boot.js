import { Scene } from 'phaser';

export class Boot extends Scene {
  constructor() {
    super('scene-boot');
  }

  preload() {
    this.load.setBaseURL('./');
    this.load.aseprite('hero', '/sprites/hero.png', '/sprites/hero.json');
    this.load.image('footprint1', '/sprites/footprints1.png');
    this.load.image('footprint2', '/sprites/footprints2.png');
    this.load.aseprite('roberto', '/sprites/Roberto.png', '/sprites/Roberto.json');
    this.load.aseprite('willow', '/sprites/willow.png', '/sprites/willow.json');
    this.load.aseprite('villain', '/sprites/villain.png', '/sprites/villain.json');

    this.load.aseprite('hand', '/sprites/Hand.png', '/sprites/Hand.json');
    this.load.aseprite('crab', '/sprites/Crab.png', '/sprites/Crab.json');

    this.load.image('shipwreck', '/sprites/Shipwreck.png');

    this.load.image('px', '/sprites/px.png');

    this.load.aseprite('ui-heart', '/sprites/ui/Heart.png', '/sprites/ui/Heart.json');
    this.load.image('ui-speaking', '/sprites/ui/speaking.png');
    this.load.image('ui-play', '/sprites/ui/play.png');
    this.load.image('ui-temp-title', '/sprites/ui/temp-title.png');

    this.load.image('tileset2', '/tilesets/tileset2.png');
    // this.load.image('parallax', '/maps/parallax.png');
    this.load.image('bg-1', '/maps/mars-bg.png');
    this.load.image('bg-2', '/maps/bg2.png');
    this.load.tilemapTiledJSON('map', '/maps/map.json');
    this.load.image('sun', '/maps/sun.png');

    this.load.audio('ost-desert-top', '/ost/desert-top.mp3');
    this.load.audio('ost-desert-combat', '/ost/desert-combat.mp3');
    this.load.audio('ost-desert-boss', '/ost/desert-boss.mp3');

    this.load.audio('sfx-slash1', '/sfx/slash1.wav');
    this.load.audio('sfx-slash2', '/sfx/slash2.wav');
    this.load.audio('sfx-step1', '/sfx/step1.mp3');
    this.load.audio('sfx-step2', '/sfx/step2.mp3');
    this.load.audio('sfx-step3', '/sfx/step3.mp3');
    this.load.audio('sfx-jump', '/sfx/jump.mp3');
    this.load.audio('sfx-land', '/sfx/land.mp3');
    this.load.audio('sfx-flip', '/sfx/flip.mp3');
    this.load.audio('sfx-crash', '/sfx/crash.mp3');
    this.load.audio('sfx-crab1', '/sfx/crab1.mp3');
    this.load.audio('sfx-crab2', '/sfx/crab2.mp3');
    this.load.audio('sfx-crab3', '/sfx/crab3.mp3');
    this.load.audio('sfx-crab4', '/sfx/crab4.mp3');
    this.load.audio('sfx-crab5', '/sfx/crab5.mp3');
    this.load.audio('sfx-kill-crab', '/sfx/kill-crab.mp3');
    
    this.load.audio('vo-isiah1', '/vo0.1/Isiah/damage report.mp3');
    this.load.audio('vo-isiah2', '/vo0.1/Isiah/i said damage report.mp3');
    this.load.audio('vo-roberto1', '/vo0.1/Roberto/with all due respect sir - cool your jets.mp3');
    this.load.audio('vo-isiah3', '/vo0.1/Isiah/i dont have time for this.mp3');
    this.load.audio('vo-isiah4', '/vo0.1/Isiah/lets.mp3');
    this.load.audio('vo-roberto2', '/vo0.1/Roberto/sir please - i understand that tensions are high right now.mp3');
    this.load.audio('vo-roberto3', '/vo0.1/Roberto/but i advised you to take a deep breath and keep calm.mp3');
    this.load.audio('vo-roberto4', '/vo0.1/Roberto/my sensors indicate very little organic life in this desert.mp3');
    this.load.audio('vo-roberto5', '/vo0.1/Roberto/however there seems to be a large concentration 10km out.mp3');
    this.load.audio('vo-isiah5', '/vo0.1/Isiah/perhaps its an outpost of some kind.mp3');
    this.load.audio('vo-roberto6', '/vo0.1/Roberto/lifeform ahead - seems harmless though.mp3');
    this.load.audio('vo-roberto7', '/vo0.1/Roberto/dont bother it.mp3');
    this.load.audio('vo-roberto8', '/vo0.1/Roberto/whyd you kill it.mp3');
    this.load.audio('vo-isiah6', '/vo0.1/Isiah/honestly i dont know.mp3');
    this.load.audio('vo-isiah7', '/vo0.1/Isiah/its - a tree.mp3');
    this.load.audio('vo-roberto9', '/vo0.1/Roberto/i wonder how its alive - all the way out here.mp3');
    this.load.audio('vo-roberto10', '/vo0.1/Roberto/why did my sensors pick it up - it looks dead.mp3');
    this.load.audio('vo-isiah8', '/vo0.1/Isiah/curious.mp3');
    
    this.gfx = this.add.graphics();
    const w = 600;
    const h = 40;

    this.load.on('progress', (v) => {
      this.gfx.fillStyle(0xFFFFFF, 0.5);
      this.gfx.fillRect((720 / 2) - (w / 2), 720 / 2 - (h / 2), w, h);
      this.gfx.fillStyle(0xFFFFFF, 1);
      this.gfx.fillRect(((720 / 2) - (w / 2)), 720 / 2 - (h / 2), w * v, h);
    });
  }

  create() {
    this.anims.createFromAseprite('hero');
    this.anims.createFromAseprite('roberto');
    this.anims.createFromAseprite('hand');
    this.anims.createFromAseprite('crab');
    this.anims.createFromAseprite('villain');

    this.gfx.clear();

    this.add.text(720 / 2, 720 / 2 - 15, 'Start Game', {
      fontFamily: 'monospace',
      color: '#FFF',
      fontSize: 64
    }).setOrigin(0.5, 1);

    this.add.text(720 / 2, 720 / 2 + 15, '0.2 preview', {
      color: 'rgba(255, 255, 255, 0.75)',
      fontSize: 38
    }).setOrigin(0.5, 0);

    this.input.on('pointerup', () => {
      document.documentElement.requestFullscreen();
      document.documentElement.classList.add('no_cursor');
      this.scene.start('scene-title');
    });
  }
}