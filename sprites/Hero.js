import { GameObjects } from 'phaser';

const {Sprite, Rectangle} = GameObjects;

export class Hero extends Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'hero');
    this.scene = scene;
    this.speed = 200;
    this.jump = 400;
    this.damage = 0;
    this.maxHp = 6;
    this.hp = this.maxHp;

    this.scene.add.existing(this);
    this.scene.physics.world.enable(this);

    this.body.setSize(15, 32);
    this.body.offset.y = 35;
    this.setOrigin(0.5, 1);

    this.setData('slashing', false);

    this.atkb = new Rectangle(scene, x, y, 14, 32, 0xFF0000, 0);
    this.scene.add.existing(this.atkb);
    this.scene.physics.world.enable(this.atkb);
    this.atkb.body.setAllowGravity(false);

    this.doDoubleSlash = false;
    this.on('animationupdate', ({key}, {index}) => {
      if (key === 'hero-slash') {
        if (index === 2) {
          const dir = (this.flipX ? -1 : 1);
          const xs = 16;
          const ys = -12;

          this.scene.sound.play('sfx-slash1');
  
          this.atkb.setPosition(this.x + (dir * xs), this.y + ys);
        }
      }
      else if (key === 'hero-backslash') {
        if (index === 2) {
          const dir = (this.flipX ? -1 : 1);
          const xs = 16;
          const ys = -12;

          this.scene.sound.play('sfx-slash2');
  
          this.atkb.setPosition(this.x + (dir * xs), this.y + ys);
        }
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
      else {
        this.setData('slashing', false);
        this.doDoubleSlash = false;
      }
    });
  }

  actionA() {
    if (this.body.blocked.down) {
      this.body.setVelocityY(-this.jump);
    }
  }

  actionB() {
    if (this.getData('slashing') === false) {
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

    if (this.alpha < 1) {
      this.alpha += 0.0025;
    }

    if (this.damage === 0) {
      if (left || vLe || keyA.isDown) {
        this.body.setVelocityX(-this.speed);
        if (this.getData('slashing') === false) this.setFlipX(true);
      }
      else if (right || vRi || keyD.isDown) {
        this.body.setVelocityX(this.speed);
        if (this.getData('slashing') === false) this.setFlipX(false);
      }
      else {
        this.body.setVelocityX(0);
      }
    }
    else {

      if (this.alpha === 1) {
        this.damage = 0;
      }
    }

    if (this.alpha < 1) {
      this.play({
        key: 'hero-damage',
        repeat: -1
      });
      this.body.setVelocityX(this.damage * 150);
    }
    else if (this.getData('slashing') === false) {
      if (grounded) {
        if (vx === 0) {
          this.play({
            key: 'hero-idle',
            repeat: -1
          }, true);
        }
        else {
          this.play({
            key: 'hero-run',
            repeat: -1
          }, true);
        }
      }
      else {
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
    else {
      if (this.body.velocity.y === 0) this.body.setVelocityX(0);
    }
  }
}