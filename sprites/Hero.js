import { GameObjects, Math as pMath } from 'phaser';

const {Sprite, Rectangle} = GameObjects;

export class Hero extends Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'hero');
    this.scene = scene;
    this.speed = 120;
    this.jump = 275;
    this.damage = 0;
    this.maxHp = 6;
    this.hp = this.maxHp;
    this.lookingUp = false;
    this.doUppercut = false;

    this.scene.add.existing(this);
    this.scene.physics.world.enable(this);

    this.body.setSize(11, 32);
    this.body.offset.y = 35;
    this.setOrigin(0.5, 1);

    this.setData('slashing', false);

    this.atkb = new Rectangle(scene, x, y, 14, 32, 0xFF0000, 0);
    this.scene.add.existing(this.atkb);
    this.scene.physics.world.enable(this.atkb);
    this.atkb.body.setAllowGravity(false);

    this.doDoubleSlash = false;
    this.on('animationupdate', ({key}, {index}) => {
      if (key === 'hero-run') {
        if (index === 8) {
          const footprint = this.scene.add.image(this.x, this.y + 3, 'footprint1');
          const ri = pMath.Between(1, 3);
          this.scene.sound.play(`sfx-step${ri}`);

          footprint.setOrigin(0.5, 1);
          footprint.setDepth(-1);
          footprint.postFX.addBloom();

          this.scene.tweens.add({
            targets: [footprint],
            alpha: 0,
            duration: 2000,
            onComplete: () => {
              footprint.destroy();
            }
          });
        }
        else if (index === 4) {
          const footprint = this.scene.add.image(this.x, this.y + 3, 'footprint2');
          const ri = pMath.Between(1, 3);
          this.scene.sound.play(`sfx-step${ri}`);

          footprint.setOrigin(0.5, 1);
          footprint.setDepth(-1);
          footprint.postFX.addBloom();

          this.scene.tweens.add({
            targets: [footprint],
            alpha: 0,
            duration: 2000,
            onComplete: () => {
              footprint.destroy();
            }
          });
        }
      }
      else if (key === 'hero-slash' && index === 2) {
        const dir = (this.flipX ? -1 : 1);
        const xs = 16;
        const ys = -12;

        this.scene.sound.play('sfx-slash1', { volume: 0.5 });

        this.atkb.setPosition(this.x + (dir * xs), this.y + ys);
      }
      else if (key === 'hero-backslash' && index === 2) {
        const dir = (this.flipX ? -1 : 1);
        const xs = 16;
        const ys = -12;

        this.scene.sound.play('sfx-slash2', { volume: 0.5 });

        this.atkb.setPosition(this.x + (dir * xs), this.y + ys);
      }
      else {
        this.atkb.setPosition(0, 0);
      }
    });

    this.on('animationcomplete', ({key}) => {
      console.log(this.doDoubleSlash)
      if (key === 'hero-slash' && this.doDoubleSlash) {
        this.play({
          key: 'hero-backslash',
          repeat: 0
        });
      }
      else if (key === 'hero-uppercut') {
        this.lookingUp = false;
        this.doUppercut = false;
      }
      else {
        this.setData('slashing', false);
        this.doDoubleSlash = false;
      }
    });

    const particleConfig = {
      speedY: {
        min: -50,
        max: 50
      },
      speedX: {
        min: -50,
        max: 50
      },
      gravityY: 100,
      scale: { start: 2, end: 0 },
      alpha: [0.2, 0.5, 0.1, 0.3, 0.4, 0.9],
      tint: 0xAF8648
    };
    this.hasDoubleJumped = false;
    this.jumpPfx = this.scene.add.particles(0, 0, 'px', particleConfig);
    this.landPfx = this.scene.add.particles(0, 0, 'px', particleConfig);
    this.wasGrounded = false;
    this.hasLandedInitially = false;
  }

  actionA() {
    if (this.body.blocked.down) {
      this.body.setVelocityY(-this.jump);
      this.jumpPfx.setPosition(this.x, this.y);
      this.jumpPfx.explode(50);
      this.scene.sound.play('sfx-jump');
    }
    else if (!this.hasDoubleJumped) {
      this.body.setVelocityY(-this.jump);
      this.hasDoubleJumped = true;
      this.scene.sound.play('sfx-flip');

      this.play({
        key: 'hero-flip',
        repeat: 0
      }, true).chain({
        key: 'hero-fall',
        repeat: -1
      }, true);
    }
  }

  actionB() {
    if (this.body.blocked.down) {
      if (this.lookingUp) {
        this.play({
          key: 'hero-uppercut',
          repeat: 0
        }, true);
        this.doUppercut = true;
      }
      else if (this.getData('slashing') === false) {
        this.setData('slashing', true);
        this.play({
          key: 'hero-slash',
          repeat: 0
        });
      }
      else {
        this.doDoubleSlash = true;
      }
    }
  }

  inflictDamage(dmg, fromX) {
    if (this.alpha === 1) {
      const dir = (fromX <= this.x ? 1 : -1);
      this.damage = dmg * dir;
      this.body.setVelocityY(-1 * dmg * 300);
      this.hp -= dmg;

      this.alpha -= (dmg / this.hpd);

      if (dir === 1) {
        this.setFlipX(true);
      }
      else {
        this.setFlipX(false);
      }
    }
  }

  update() {
    let left = false;
    let right = false;
    if (this.scene.gamepad) {
      left = this.scene.gamepad.left;
      right = this.scene.gamepad.right;
    }
    const {vLe, vRi, keyA, keyD} = this.scene;
    const {x: vx, y: vy} = this.body.velocity;
    const grounded = this.body.blocked.down;
    const justLanded = (grounded !== this.wasGrounded);

    if (this.alpha < 1) {
      this.alpha += 0.0025;
    }

    if (justLanded && this.hasLandedInitially) {
      this.hasDoubleJumped = false;
      this.scene.sound.play('sfx-land');
      this.landPfx.setPosition(this.x, this.y);
      this.landPfx.explode(20);
    }
    else if (grounded && !this.hasLandedInitially) {
      this.hasLandedInitially = true;
    }

    if (!this.getData('slashing')) {
      if (left || vLe || keyA.isDown) {
        if (!this.lookingUp) this.body.setVelocityX(-this.speed);
        if (this.getData('slashing') === false) this.setFlipX(true);
      }
      else if (right || vRi || keyD.isDown) {
        if (!this.lookingUp) this.body.setVelocityX(this.speed);
        if (this.getData('slashing') === false) this.setFlipX(false);
      }
      else {
        this.body.setVelocityX(0);
      }
    }
    else {
      this.body.setVelocityX(0);
    }

    if (this.doUppercut) {
      // Do nothing lol
    }
    else if (this.getData('slashing') === false && !this.lookingUp) {
      if (grounded) {
        if (vx === 0) {
          this.play({
            key: 'hero-idle',
            repeat: -1
          }, true);
        }
        else if (!this.body.blocked.right && !this.body.blocked.left) {
          this.play({
            key: 'hero-run',
            repeat: -1
          }, true);
        }
      }
      else if (!this.hasDoubleJumped) {
        if (vy <= 0) {
          this.play({
            key: 'hero-jump',
            repeat: -1
          }, true);
        }
        else {
          this.play({
            key: 'hero-fall',
            repeat: -1
          }, true);
        }
      }
    }
    else if (this.lookingUp && grounded) {
      this.play({
        key: 'hero-lookup',
        repeat: -1
      }, true);
    }

    this.wasGrounded = grounded;
  }
}