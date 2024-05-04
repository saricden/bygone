import { Scene } from 'phaser';

export class Boot extends Scene {
  constructor() {
    super('scene-boot');
  }

  preload() {
    this.load.aseprite('hero', '/sprites/hero.png', '/sprites/hero.json');

    this.load.aseprite('hand', '/sprites/Hand.png', '/sprites/Hand.json');
    this.load.aseprite('crab', '/sprites/Crab.png', '/sprites/Crab.json');

    this.load.image('px', '/sprites/px.png');

    this.load.aseprite('ui-heart', '/sprites/ui/Heart.png', '/sprites/ui/Heart.json');

    this.load.image('tiles-test', '/tilesets/test.png');
    this.load.tilemapTiledJSON('map-test', '/maps/test.json');

    this.load.image('tiles-mars', '/tilesets/mars.png');
    this.load.image('bg-1', '/maps/mars-bg.png');

    this.load.image('tiles-sand-and-cave', '/tilesets/sand-and-cave.png');
    this.load.tilemapTiledJSON('map-desert1', '/maps/desert1.json');

    this.load.audio('ost-desert-top', '/ost/desert-top.mp3');
    this.load.audio('ost-desert-combat', '/ost/desert-combat.mp3');

    this.load.audio('sfx-slash1', '/sfx/slash1.wav');
    this.load.audio('sfx-slash2', '/sfx/slash2.wav');
  }

  create() {
    this.anims.createFromAseprite('hero');
    this.anims.createFromAseprite('hand');
    this.anims.createFromAseprite('crab');

    this.scene.start('scene-demo');
  }
}