import { GameObjects } from "phaser";
const {Sprite} = GameObjects;

export class Hand extends Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'hand');

    this.scene = scene;
    this.scene.add.existing(this);
    this.scene.physics.world.enable(this);
    this.body.setAllowGravity(false);
    this.setOrigin(0.5, 0.9);

    this.play('grab-attack');

    this.on('animation-complete', () => this.destroy());
  }
}