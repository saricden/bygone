import { GameObjects } from "phaser";
const {Sprite} = GameObjects;

export class Fireball extends Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'px');

    this.scene = scene;
    this.scene.add.existing(this);
    this.scene.physics.world.enable(this);
    this.setScale(4);
    this.target = this.scene.hero;
    this.setTint(0x000000);

    this.pfx = this.scene.add.particles(0, 0, 'px', {
      speedY: {
        min: -100,
        max: 100
      },
      speedX: {
        min: -100,
        max: 100
      },
      gravityY: 100,
      scale: { start: 2, end: 0 },
      alpha: [0.2, 0.5, 0.1, 0.3, 0.4, 0.9],
      tint: 0x000000
    });

    this.pfx.start();
    this.pfx.startFollow(this);

    this.scene.physics.add.collider(this.scene.ground, this, () => this.explode());
    this.scene.physics.add.collider(this.scene.hero, this, () => {
      this.explode();
      this.target.takeDamage(1, 0, 10);
    });
  }

  explode() {
    this.pfx.stop();
    this.pfx.explode(25);
    this.destroy();
  }
}