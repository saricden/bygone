import { GameObjects, Math as pMath } from "phaser";
const {Sprite, Rectangle} = GameObjects;

export class Villain extends Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'villain');

    this.scene = scene;
    this.t = this.scene.hero;

    this.scene.add.existing(this);
    this.scene.physics.world.enable(this);
    this.body.setAllowGravity(false);
    this.body.setSize(20);
    
    this.setOrigin(0.5, 0.75);
    this.atkbx = new Rectangle(scene, 0, 0, 14, 14, 0xFF0000, 0);
    this.scene.add.existing(this.atkbx);
    this.scene.physics.world.enable(this.atkbx);
    this.atkbx.body.setAllowGravity(false);
    this.atkbx.dmg = 0;

    this.on('animationcomplete', ({key}) => {
      if (key === 'villain-evade') {
        this.body.setVelocityX(0);
        this.pfx.stopFollow();
        this.pfx.stop();
      }
    });

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

    this.scene.physics.add.overlap(this.atkbx, this.t, () => {
      const dmg = this.atkbx.dmg;

      if (dmg > 0) {
        const force = 500;
        const dir = (this.flipX ? -1 : 1);
        this.t.takeDamage(dmg, dir, force);
      }

      this.atkbx.setPosition(0, 0);
      this.atkbx.dmg = 0;
    });

    this.scene.physics.add.overlap(this, this.t.atkb, () => {
      if (this.visible) {
        // this.scene.tweens.addCounter({
        //   from: 1,
        //   to: 0,
        //   duration: 200,
        //   onUpdate: (tween) => {
        //     const v = Math.floor(tween.getValue());
        //     const dir = (this.flipX ? 1 : -1);
        //     this.body.setVelocityX(dir * v * 100);
        //   },
        //   onComplete: () => this.invincible = false
        // });

        if (this.alpha > 0) {
          const evadeRate = Math.floor(9 * this.alpha);
          const doEvade = (pMath.Between(1, evadeRate) === evadeRate);

          if (doEvade && this.alpha > 0.2) {
            const dir = (Math.random() >= 0.5 ? -1 : 1);
            this.play('villain-evade').chain({ key: 'villain-float', repeat: -1, yoyo: true });
            this.body.setVelocityX(250 * dir);
            this.pfx.startFollow(this);
            this.pfx.start();
          }
          else {            
            this.alpha -= 0.05;
            const xo = pMath.Between(-20 / 2, 20 / 2);
            const yo = pMath.Between(-44 / 2, 44 / 2);
            this.pfx.setPosition(this.x + xo, this.y + yo);
            this.pfx.explode(10);

            if (this.alpha > 0.2) {
              this.play('villain-dmg').chain({ key: 'villain-float', repeat: -1, yoyo: true });
            }
            else if (!this.defeated) {
              this.playReverse('villian-emerge');
              this.defeated = true;
            }
          }
        }
        else {
          this.alpha = 0;
        }
        this.t.atkb.setPosition(0, 0);
      }
    });

    this.on('animationupdate', ({key}, {index}) => {
      this.atkbx.setPosition(0, 0);

      if (key === 'villian-kick' && index === 5) {
        const {flipX} = this;
        const dir = (flipX ? -1 : 1);
        this.atkbx.setPosition(this.x + (dir * 30), this.y + 10);
      }
    });

    this.on('animationcomplete', ({key}) => {
      if ((key === 'villian-emerge' || key === 'villian-kick') && this.alpha > 0.2) {
        this.play({ key: 'villain-float', repeat: -1, yoyo: true }, true);
        this.atkbx.dmg = 1;
      }
    });

    this.defeated = false;
  }

  emerge() {
    this.setVisible(true);
    this.setPosition(this.t.x, this.t.y - 20);
    this.play('villian-emerge');
  }

  teleport() {
    if (this.alpha > 0.2) {
      const {x} = this.t;
  
      if (this.flipX) {
        this.setX(x - 35);
      }
      else {
        this.setX(x + 35);
      }
  
      this.body.setVelocityX(0);
      this.scene.cameras.main.flash(1000);
      this.play('villian-kick');
    }
    else {
      this.scene.endEncounter();
    }
  }

  update() {
    const {t} = this;

    if (!this.defeated) {
      this.setFlipX(t.x <= this.x);
    }

    if (this.alpha <= 0) {
      this.scene.endEncounter();
      this.scene.willow.setFrame(1); // Refactor me!
    }
  }
}