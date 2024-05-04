import { Scene } from 'phaser';

export class Hud extends Scene {
  constructor() {
    super('scene-hud');
  }

  init({parentScene}) {
    this.parentScene = parentScene;
  }

  create() {
    const {maxHp} = this.parentScene.hero;
    this.hearts = [];
    const padding = 30;
    const margin = 50;

    for (let i = 0; i < (maxHp / 2); i++) {
      this.hearts.push(
        this.add.sprite(padding + i * margin, padding, 'ui-heart', 0).setScale(2)
      );
    }
  }

  update() {
    const {hp} = this.parentScene.hero;
    const hpPerHeart = 2;

    for (let i = 0; i < this.hearts.length; i++) {
      const heartHP = Math.max(Math.min(hpPerHeart, hp - i * hpPerHeart), 0);
      const frame = 2 - heartHP;

      this.hearts[i].setFrame(frame);
    }
  }
}