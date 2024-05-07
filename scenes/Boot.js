import { Scene } from 'phaser';

export class Boot extends Scene {
  constructor() {
    super('scene-boot');
  }

  preload() {
    this.load.aseprite('hero', '/sprites/hero.png', '/sprites/hero.json');
    this.load.image('footprint1', '/sprites/footprints1.png');
    this.load.image('footprint2', '/sprites/footprints2.png');
    this.load.aseprite('roberto', '/sprites/Roberto.png', '/sprites/Roberto.json');

    this.load.aseprite('hand', '/sprites/Hand.png', '/sprites/Hand.json');
    this.load.aseprite('crab', '/sprites/Crab.png', '/sprites/Crab.json');

    this.load.image('shipwreck', '/sprites/Shipwreck.png');

    this.load.image('px', '/sprites/px.png');

    this.load.aseprite('ui-heart', '/sprites/ui/Heart.png', '/sprites/ui/Heart.json');
    this.load.image('ui-speaking', '/sprites/ui/speaking.png');

    this.load.image('tileset2', '/tilesets/tileset2.png');
    this.load.image('parallax', '/maps/parallax.png');
    this.load.tilemapTiledJSON('map', '/maps/map.json');

    this.load.audio('ost-desert-top', '/ost/desert-top.mp3');
    this.load.audio('ost-desert-combat', '/ost/desert-combat.mp3');

    this.load.audio('sfx-slash1', '/sfx/slash1.wav');
    this.load.audio('sfx-slash2', '/sfx/slash2.wav');
    
    this.load.audio('vo-isiah1', '/vo/Isiah/damage report.mp3');
    this.load.audio('vo-isiah2', '/vo/Isiah/i said damage report.mp3');
    this.load.audio('vo-roberto1', '/vo/Roberto/with all due respect sir - cool your jets.mp3');
    this.load.audio('vo-isiah3', '/vo/Isiah/i dont have time for this.mp3');
    this.load.audio('vo-isiah4', '/vo/Isiah/lets.mp3');
    this.load.audio('vo-roberto2', '/vo/Roberto/sir please - i understand that tensions are high right now.mp3');
    this.load.audio('vo-roberto3', '/vo/Roberto/but i advised you to take a deep breath and keep calm.mp3');
    this.load.audio('vo-roberto4', '/vo/Roberto/anyways this ship is broken.mp3');

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

    this.gfx.clear();

    this.add.text(720 / 2, 720 / 2, 'Launch Game', {
      fontFamily: 'monospace',
      color: '#FFF',
      fontSize: 40
    }).setOrigin(0.5);

    this.input.on('pointerup', () => {
      document.documentElement.requestFullscreen();
      this.scene.start('scene-demo');
    });
  }
}