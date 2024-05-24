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

    this.hitboxActive = false;
    
    this.on('animationupdate', ({key}, {index}) => {
      this.hitboxActive = (index === 21);
    });

    this.scene.physics.add.overlap(this, this.scene.hero, () => {
      if (!this.scene.gameOver && this.hitboxActive) {
        this.scene.gameOver = true;
        this.scene.hero.setAlpha(0);
        this.scene.cameras.main.stopFollow();
        this.scene.cameras.main.pan(this.x, this.y, 300);
        this.scene.cameras.main.zoomTo(6, 700);
        this.scene.endEncounter();
        this.scene.roberto.setAlpha(0);
        this.scene.hero.hp = 0;

        this.scene.time.delayedCall(2000, () => {
          this.scene.tweens.add({ targets: [this.scene.hero], alpha: 1, duration: 3000 });
          this.scene.hero.setY(0);
          this.scene.cameras.main.zoomTo(3, 1000);
        });
      }
    });
  }
}