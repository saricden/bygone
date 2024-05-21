import { Scene } from "phaser";

export class Title extends Scene {
  constructor() {
    super('scene-title');
  }

  create() {
    const bg = this.add.image(0, 0, 'ui-temp-title');
    bg.setOrigin(0, 0);

    const text = this.add.text(720 / 2, 720 / 2, 'Press any button to begin.', {
      fontFamily: 'monospace',
      color: '#FFF',
      fontSize: 22
    });

    text.setOrigin(0.5);
    text.setAlpha(0);

    const cover = this.add.graphics();

    cover.fillStyle(0x000000);
    cover.fillRect(0, 0, 720, 720);

    this.tweens.add({
      targets: [cover],
      alpha: 0,
      duration: 5000,
      onComplete: () => {
        this.tweens.add({
          targets: [text],
          alpha: 1,
          duration: 1000
        });
      }
    });

    const begin = () => {
      this.tweens.add({
        targets: [cover],
        alpha: 1,
        duration: 500,
        onComplete: () => {
          this.scene.start('scene-demo');
        }
      });
    };

    this.input.keyboard.once('keydown', begin)
    window.addEventListener('touchstart', begin, { once: true });
    window.addEventListener('touchstart', () => document.documentElement.classList.add('virtual'));
  }
}