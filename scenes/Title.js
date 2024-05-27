import { Scene } from "phaser";
import { Fire } from "../sprites/Fire";
import { credits } from "../utils/credits";

export class Title extends Scene {
  constructor() {
    super('scene-title');
  }

  create() {
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

    const menuItems = [
      {
        label: "Play Game",
        enter: () => {
          begin();
        }
      },
      {
        label: "Settings",
        enter: () => {

        }
      },
      {
        label: "Credits",
        enter: () => {
          this.tweens.add({
            targets: [cover],
            alpha: 1,
            duration: 1000
          });

          this.tweens.add({
            targets: [creditText],
            alpha: 1,
            duration: 1000,
            delay: 750
          });
        },
        back: () => {
          this.tweens.add({
            targets: [cover],
            alpha: 0,
            duration: 500
          });

          this.tweens.add({
            targets: [creditText],
            alpha: 0,
            duration: 500
          });
        }
      }
    ];

    const creditText = this.add.text(720 / 2, 720 / 2, credits, {
      fontFamily: 'serif',
      color: '#FFF',
      fontSize: 22,
      align: 'center'
    });

    creditText.setOrigin(0.5);
    creditText.setDepth(30);
    creditText.setAlpha(0);

    this.menuIndex = 0;
    this.menuBtns = [];
    this.menuUnlocked = false;
    let menuY = 275;
    const menuMargin = 75;

    menuItems.forEach((item, i) => {
      const isLast = (i === menuItems.length - 1);
      this.menuBtns[i] = this.add.text(720 / 2, menuY, item.label, {
        fontFamily: 'monospace',
        color: '#FFF',
        fontSize: 28,
        padding: {
          y: 2,
          x: 20
        }
      });
      
      this.menuBtns[i].setOrigin(0.5);
      this.menuBtns[i].setDepth(10);
      this.menuBtns[i].setAlpha(0);
      this.menuBtns[i].setData('enter', item.enter);
      this.menuBtns[i].setData('back', item.back);

      let onComplete = () => {};

      if (isLast) {
        onComplete = () => {
          this.menuUnlocked = true;
        };
      }

      this.tweens.add({
        targets: [this.menuBtns[i]],
        delay: 1000 + (1000 * (i + 1)),
        alpha: 1,
        duration: 1000,
        onComplete
      });

      menuY += menuMargin;
    });

    this.sound.play('ost-title');
    
    const bg = this.add.image(0, 0, 'ui-title-bg');
    bg.setOrigin(0, 0);

    const logo = this.add.image(720 / 2, 125, 'ui-logo');
    logo.setScale(0.4);
    logo.setAlpha(0);
    
    this.tweens.add({
      targets: [logo],
      alpha: 1,
      duration: 1500,
      delay: 1000
    });

    const cover = this.add.graphics();

    cover.fillStyle(0x000000);
    cover.fillRect(0, 0, 720, 720);
    cover.setDepth(20);

    this.tweens.add({
      targets: [cover],
      alpha: 0,
      duration: 5000
    });

    window.addEventListener('touchstart', () => document.documentElement.classList.add('virtual'));

    this.input.keyboard.on('keydown', async (e) => {
      document.documentElement.classList.remove('virtual');

      if (e.key === '.') {
        this.menuEnter();
      }
      else if (e.key === '/') {
        this.menuBack();
      }
      else if (e.key === 'w') {
        this.menuUp();
      }
      else if (e.key === 's') {
        this.menuDown();
      }
    });
  }

  menuUp() {
    if (this.menuUnlocked) {
      if (this.menuIndex === 0) {
        this.menuIndex = this.menuBtns.length - 1;
      }
      else {
        this.menuIndex--;
      }
    }
  }

  menuDown() {
    if (this.menuUnlocked) {
      if (this.menuIndex === this.menuBtns.length - 1) {
        this.menuIndex = 0;
      }
      else {
        this.menuIndex++;
      }
    }
  }

  menuEnter() {
    if (this.menuUnlocked) {
      this.menuBtns[this.menuIndex].getData('enter')();
    }
  }

  menuBack() {
    if (this.menuUnlocked) {
      this.menuBtns[this.menuIndex].getData('back')();
    }
  }

  update() {
    if (this.menuUnlocked) {
      this.menuBtns.forEach((item) => {
        item.setBackgroundColor('transparent');
      });
  
      this.menuBtns[this.menuIndex].setBackgroundColor('rgba(255, 255, 255, 0.25)');
    }
  }
}