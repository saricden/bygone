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

    this.cover = this.add.graphics();
    this.cover.fillStyle(0x000000, 1);
    this.cover.fillRect(0, 0, 720, 720);

    this.quote1 = this.add.text(720 / 2, 720 / 2 - 60, "“We must all fight to preserve what we have, inside and out…", {
      fontFamily: 'Serif',
      color: '#FFF',
      fontSize: 20,
      align: 'right'
    });
    this.quote1.setOrigin(0.5);
    this.quote2 = this.add.text(720 / 2, 720 / 2 - 30, "But recall at the close of day that we are on the same team.”", {
      fontFamily: 'Serif',
      color: '#FFF',
      fontSize: 20,
      align: 'right'
    });
    this.quote2.setOrigin(0.5);
    this.quote2.setAlpha(0);
    this.quote3 = this.add.text(720 / 2, 720 / 2 + 20, "- Unknown", {
      fontFamily: 'Serif',
      color: '#FFF',
      fontSize: 20,
      align: 'right'
    });
    this.quote3.setOrigin(0.5);

    if (this.parentScene.skipIntro) {
      setTimeout(() => {
        this.parentScene.activateRoberto();
        this.cover.setAlpha(0);
        this.quote1.setAlpha(0);
        this.quote2.setAlpha(0);
        this.quote3.setAlpha(0);
      }, 500);
    }
    else {
      this.tweens.add({
        targets: [this.cover, this.quote1, this.quote2, this.quote3],
        alpha: 0,
        duration: 4000,
        delay: 2000,
        onComplete: () => {
          // promises?
          this.parentScene.speak('isiah', 1, 2000)
            .then(() => this.parentScene.speak('isiah', 2, 20))
            .then(() => this.parentScene.speak('roberto', 1))
            .then(() => this.parentScene.speak('isiah', 3, 500))
            .then(() => this.parentScene.speak('isiah', 4, 0))
            .then(() => this.parentScene.speak('roberto', 2, 500))
            .then(() => {
              this.parentScene.activateRoberto();
            })
        }
      });
    }

    this.subtitle = this.add.text(720 / 2, 720 - 40, 'subtitles go hereeeeee', {
      fontFamily: 'sans',
      fontSize: 20,
      color: '#FFF',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      align: 'center',
      wordWrap: {
        width: 720 - 80
      }
    }).setOrigin(0.5, 1).setVisible(false);
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