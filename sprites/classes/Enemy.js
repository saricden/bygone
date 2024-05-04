import { GameObjects } from 'phaser';
const {Sprite} = GameObjects;

export class Enemy extends Sprite {
  constructor(scene, x, y, texture, maxHP) {
    super(scene, x, y, texture);

    this.scene = scene;
    this.scene.physics.world.enable(this);
    this.scene.add.existing(this);
    this.maxHP = maxHP;
    this.hp = maxHP;
    this.isDead = false;
    this.pfxc = {
      speedX: 0,
      speedY: 0,
      gravityY: 50,
      scale: { start: 5, end: 0 },
      // alpha: [0.2, 0.5, 0.1, 0.3, 0.4, 0.9],
      duration: 150,
      // tint: 0xFFFFFF,
      frequency: 300
    };
    this.pfx = this.scene.add.particles(0, 0, 'px', this.pfxc);
    this.allowDamage = true;

  }

  damage(dmg, from, doDmgFn = null, fxFn = null) {
    if (this.hp - dmg > 0) {
      if (typeof doDmgFn !== 'function' || doDmgFn()) {
        this.hp -= dmg;
        this.allowDamage = false;
      }

      this.scene.tweens.addCounter({
        from: 0,
        to: 255,
        duration: 200,
        onUpdate: (tween) => {
          const v = Math.floor(tween.getValue());
          const t = Phaser.Display.Color.GetColor(255, v, v);

          this.setTint(t);

          if (typeof fxFn === 'function') {
            fxFn();
          }
        },
        onComplete: () => this.allowDamage = true
      })
    }
    else {
      if (!this.isDead) {
        this.hp = 0;
        this.isDead = true;
        this.setVisible(false);
        this.pfx.setConfig({
          ...this.pfxc,
          speedY: {
            min: -150,
            max: 150
          },
          speedX: {
            min: -150,
            max: 150
          },
          gravityY: 100
        });
        this.pfx.explode(200, this.x, this.y);
      }
    }
  }
}