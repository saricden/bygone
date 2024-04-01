import { Scene } from 'phaser';

export class Hud extends Scene {
  constructor() {
    super('scene-hud');
  }

  create() {
    this.maxHP = 6;
    this.hp = 6;
    this.hearts = [];
    const padding = 30;
    const margin = 50;

    for (let i = 0; i < (this.maxHP / 2); i++) {
      this.hearts.push(
        this.add.sprite(padding + i * margin, padding, 'ui-heart', 0).setScale(2)
      );
    }
  }
}