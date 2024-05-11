import { Scene, Math as pMath } from 'phaser';

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
        this.add.sprite(padding + i * margin, padding, 'ui-heart', 0).setScale(2).setAlpha(0)
      );
    }

    this.cover = this.add.graphics();
    this.cover.fillStyle(0x000000, 1);
    this.cover.fillRect(0, 0, 720, 720);

    this.pauseCover = this.add.graphics();
    this.pauseCover.fillStyle(0x000000, 1);
    this.pauseCover.fillRect(0, 0, 720, 720);
    this.pauseCover.setAlpha(0);

    this.playBtn = this.add.image(720 / 2, 720 / 2, 'ui-play');
    this.playBtn.setOrigin(0.5);
    this.playBtn.setScale(4);
    this.playBtn.setVisible(false);

    this.distanceTo = this.add.text(720 - (padding * 2.5), (padding * 1.5), '', {
      fontFamily: 'monospace',
      fontSize: 32,
      color: '#000'
    });
    this.distanceTo.setOrigin(0.5, 1);
    this.distanceTo.setData('active', false);

    this.quote1 = this.add.text(720 / 2, 720 / 2 - 60, "“We must fight to preserve what we have, inside and out…", {
      fontFamily: 'Serif',
      color: '#FFF',
      fontSize: 20,
      align: 'right'
    });
    this.quote1.setOrigin(0.5);
    this.quote2 = this.add.text(720 / 2, 720 / 2 - 30, "But recall at close of day we are all on the same team.”", {
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

    const introCredits = this.add.text(720 / 2, 720 / 2, "A game by Kirk M. (@saricden)\n\nFeaturing voice acting by 'The Grandmaster Cheeto'", {
      align: 'center',
      fontFamily: 'serif',
      fontSize: 28,
      color: '#000'
    });
    introCredits.setOrigin(0.5);
    introCredits.setAlpha(0);

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
        targets: [introCredits],
        alpha: 1,
        duration: 1000,
        delay: 7000
      });

      this.tweens.add({
        targets: [introCredits],
        alpha: 0,
        duration: 1000,
        delay: 7000 + 1000 + 4000
      });

      this.tweens.add({
        targets: [this.cover, this.quote1, this.quote2, this.quote3],
        alpha: 0,
        duration: 4000,
        delay: 3000,
        onComplete: () => {
          this.parentScene.speak('isiah', 1, 2000)
            .then(() => this.parentScene.speak('isiah', 2, 20))
            .then(() => this.parentScene.speak('roberto', 1))
            .then(() => this.parentScene.speak('isiah', 3, 500))
            .then(() => this.parentScene.speak('isiah', 4, 0))
            .then(() => this.parentScene.speak('roberto', 2, 500))
            .then(() => {
              this.parentScene.activateRoberto();
            });
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
      },
      padding: {
        x: 5,
        y: 1
      }
    }).setOrigin(0.5, 1).setVisible(false);

    this.time.delayedCall(1150, () => {
      // this.cameras.main.shake(); // just shake text?
    });
  }

  update() {
    const {hp} = this.parentScene.hero;
    const hpPerHeart = 2;

    for (let i = 0; i < this.hearts.length; i++) {
      const heartHP = Math.max(Math.min(hpPerHeart, hp - i * hpPerHeart), 0);
      const frame = 2 - heartHP;

      this.hearts[i].setFrame(frame);
    }

    if (this.distanceTo.getData('active') === true) {
      const {willow} = this.parentScene;
      const {hero} = this.parentScene;
      const d2t = pMath.Distance.Between(hero.x, hero.y, willow.x, willow.y);
      this.distanceTo.setText((d2t / 600).toFixed(2) + 'km');
    }
  }
}