import { GameObjects } from 'phaser';

const {Container} = GameObjects;

export class Moth extends Container {
  constructor(scene, x, y) {
    super(scene, x, y, []);

    this.sprite = scene.add.sprite(0, 0, 'moth');
  }
}