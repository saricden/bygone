import { GameObjects, Display } from 'phaser';
const {Sprite} = GameObjects;
const {Color} = Display;

export class Fire extends Sprite {
  constructor(scene, x, y, depth = 1000, width = 100) {
    super(scene, x, y, 'px'); // 'px' = Just a single white pixel image
    
    this.scene = scene;
    this.setVisible(false);
    
    this.scene.add.existing(this);

    this.pfx = this.scene.add.particles(0, 0, 'px', {
      speedY: {
        min: -50,
        max: -25
      },
      speedX: {
        min: -(width / 2),
        max: (width / 2)
      },
      lifespan: 4000,
      gravityY: -50,
      scale: { values: [1, 50, 80, 1] },
      alpha: { values: [0.85, 0.35, 0.35, 0], interpolation: 'linear' },
      color: [ 0xFFFFFF, 0xfacc22, 0xf89800, 0xf83600, 0x9f0404, 0x333333, 0x000000 ],
      colorEase: 'quad.out'
    });

    this.pfx.createGravityWell({
      x,
      y: (y - 50),
      power: 1,
      gravity: 10
    });

    // this.pfx.postFX.addBloom(1);

    this.pfx.startFollow(this);
    this.pfx.start();
    
    this.pfx.setDepth(depth);

    this.sfxSpatialKey = 'sfx-fire-loop';
    this.sfxSpatialThreshold = 700;
  }
}