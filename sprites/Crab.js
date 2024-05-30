import { Math as pMath } from 'phaser';
import { Enemy } from './classes/Enemy';

export class Crab extends Enemy {
  constructor(scene, x, y) {
    super(scene, x, y, 'crab', 10);

    this.state = 'move';
    this.direction = (Math.random() > 0.5 ? -1 : 1);
    if (this.direction === 1) this.setFlipX(true);
    this.prevDirection = -1;
    this.speed = 30;
    
    this.body.setSize(24, 20);
    this.body.setOffset(6, 6);

    this.play({
      key: 'Crab-Walk',
      repeat: -1
    }, true);

    this.scene.physics.add.overlap(
      this,
      this.scene.hero.atkb,
      () => {
        this.damage(
          1,
          this.scene.hero,
          () => this.state === 'defend',
          () => {
            if (this.state !== 'defend') {
              const dir = (this.scene.hero.x <= this.x ? 1 : -1);
              this.body.setVelocityX(dir * 100);
            }
            else {
              const dir = (this.scene.hero.x >= this.x ? 1 : -1);
              this.scene.hero.body.setVelocityX(dir * 50);
            }

            if (!this.scene.injuredCrab) {
              this.scene.injuredCrab = true;
              this.scene.speak('roberto', 7);
            }
          }
      );
      },
      () => this.allowDamage
    );
  }

  update() {
    const {hero} = this.scene;
    const {key: anim} = this.anims.currentAnim;
    const heroFacing = (hero.flipX === this.flipX);
    const d2h = pMath.Distance.Between(hero.x, hero.y, this.x, this.y);

    if (this.state === 'move') {
      // Bounce off walls
      if (this.body.blocked.left) {
        this.direction = 1;
        this.setFlipX(true);
      }
      else if (this.body.blocked.right) {
        this.direction = -1;
        this.setFlipX(false);
      }

      // Defend if it 'sees' hero
      if (d2h < 50 && heroFacing) {
        this.state = 'defend';
        this.prevDirection = this.direction;
      }

      this.play({key: 'Crab-Walk', repeat: -1}, true);
    }
    else if (this.state === 'defend') {
      this.direction = 0;

      if (d2h > 100) {
        this.state = 'move';
        this.direction = this.prevDirection;
      }
      
      if (anim !== 'Crab-Defend') this.play({key: 'Crab-Defend', repeat: 0}, true);
    }

    this.body.setVelocityX(this.direction * this.speed);
  }
}