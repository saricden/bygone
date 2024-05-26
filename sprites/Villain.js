import { GameObjects, Math as pMath } from "phaser";
import { Hand } from "./Hand";
import { Fireball } from "./Fireball";
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

    this.level = 1;
    this.moveIndex = 0;

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
    this.moveIndex = (this.moveIndex > 0 ? 0 : pMath.Between(0, this.level * 2));
    // this.moveIndex = 2;

    if (this.alpha > 0.2) {
      this.body.setVelocityX(0);
      this.scene.cameras.main.flash(1000);
      const {x, y} = this.t;

      if (this.moveIndex === 0) {
        if (this.flipX) {
          this.setPosition(x - 35, y - 20);
        }
        else {
          this.setPosition(x + 35, y - 20);
        }
    
        this.play('villian-kick');
      }
      else if (this.moveIndex === 1) {
        // Summon handz
        // const numHands = pMath.Between(2, 3);
        const numHands = 3;
        this.setPosition(x, y - 150);

        this.play({ key: 'villain-summon', repeat: -1 });

        for (let i = 1; i <= numHands; i++) {
          const delay = i * 500;

          this.scene.time.delayedCall(delay, () => {
            const {x: camX} = this.scene.cameras.main.midPoint;
            const camW = (720 / 3);
            const rOffset = pMath.Between(-camW / 2, camW / 2);

            new Hand(this.scene, camX + rOffset, y);
          });
        }
      }
      else if (this.moveIndex === 2) {
        const numFireballs = pMath.Between(8, 16);
        this.setPosition(x, y - 150);

        this.play({ key: 'villain-summon', repeat: -1 });

        for (let i = 1; i <= numFireballs; i++) {
          const delay = i * 500;

          this.scene.time.delayedCall(delay, () => {
            const {x: camX} = this.scene.cameras.main.midPoint;
            const camW = (720 / 3);
            const rOffset = pMath.Between(-camW / 2, camW / 2);

            new Fireball(this.scene, camX + rOffset, this.y);
          });
        }
      }
      else {
        console.warn('Move index not implemented', this.moveIndex);
      }
    }
    else {
      this.scene.endEncounter();
    }
  }

  update() {
    const {t} = this;

    if (!this.defeated && this.moveIndex === 0) {
      this.setFlipX(t.x <= this.x);
    }

    // Moves that require an update loop
    if (this.moveIndex === 1) {
      const speed = 0.1;
      const dx = pMath.Interpolation.SmootherStep(speed, this.x, t.x);
      this.setX(dx);
    }

    if (this.alpha <= 0) {
      this.scene.endEncounter();
      this.scene.willow.setFrame(1); // Refactor me!
    }
  }
}