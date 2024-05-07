import { Scene, Math as pMath, Geom } from 'phaser';
import { Crab } from '../sprites/Crab';
import { Hero } from '../sprites/Hero';

export class Demo extends Scene {
  constructor() {
    super('scene-demo');
  }

  create() {
    const doc = document.documentElement;
    const bgCtx = document.querySelector('.bg').getContext('2d');

    const map = this.add.tilemap('map');
    const tiles = map.addTilesetImage('tileset2', 'tileset2', 16, 16, 1, 2);
    const ground = map.createLayer('ground', tiles);
    const ground1 = map.createLayer('ground1', tiles);
    const ground2 = map.createLayer('ground2', tiles);
    const ground3 = map.createLayer('ground3', tiles);
    const ground4 = map.createLayer('ground4', tiles);

    ground.postFX.addBloom(undefined, undefined, undefined, undefined, 2);
    ground1.postFX.addBloom(undefined, undefined, undefined, undefined, 2);
    ground2.postFX.addBloom(undefined, undefined, undefined, undefined, 2);
    ground3.postFX.addBloom(undefined, undefined, undefined, undefined, 2);
    ground4.postFX.addBloom(undefined, undefined, undefined, undefined, 2);

    ground.setCollisionByProperty({ collides: true });
    ground1.setCollisionByProperty({ collides: true });
    ground2.setCollisionByProperty({ collides: true });
    ground3.setCollisionByProperty({ collides: true });
    ground4.setCollisionByProperty({ collides: true });

    ground4.setDepth(-4);
    ground3.setDepth(-5);
    ground2.setDepth(-6);
    ground1.setDepth(-7);
    ground.setDepth(-8);

    // Parallax mesh
    this.sand = this.add.plane(200, map.heightInPixels - 100, 'parallax');
    // this.sand.setScrollFactor(0);
    this.sand.postFX.addBloom();

    this.sand.height = 3000;
    this.sand.width = map.widthInPixels;
    this.sand.rotateX += 70;
    // this.sand.viewPosition.z = 2;

    this.sand.uvScale(20, 20);
    // this.sand.setPerspective(720, 720, 100);
    this.sand.setViewHeight(300);
    this.sand.setDepth(-10);

    this.sand.setVisible(false);

    const bg1 = this.add.tileSprite(0, (720 * 0.33), 720, 720, 'bg-1');
    bg1.setOrigin(0, 0);
    bg1.setScrollFactor(0);
    bg1.setDepth(-10);
    bg1.setScale(1, 0.5);
    bg1.setAlpha(0.2);
    bg1.setAlpha(0);

    this.enemies = [];

    map.getObjectLayer('sprites').objects.forEach((obj) => {
      if (obj.name === 'hero') {
        const hero = new Hero(this, obj.x, obj.y);
        this.hero = hero;
        this.physics.add.collider(ground, this.hero);
        this.physics.add.collider(ground1, this.hero);
        this.physics.add.collider(ground2, this.hero);
        this.physics.add.collider(ground3, this.hero);
        this.physics.add.collider(ground4, this.hero);
      }
      else if (obj.name === 'hand') {
        const {x, y, width} = obj;

        const hand = this.add.sprite(x, y, 'hand');

        hand.setOrigin(0.5, 0.8);

        const handGrab = () => {
          const delay = pMath.Between(500, 2000);
          
          this.time.delayedCall(delay, () => {
            if (this.hero.x >= x && this.hero.x <= x + width) {
              hand.setX(this.hero.x);
              
              hand.play({
                key: 'grab-attack',
                repeat: 0
              });
            }
            else {
              handGrab();
            }
          });
        }

        hand.on('animationcomplete', () => handGrab());

        hand.play({
          key: 'grab-attack',
          repeat: 0
        });
        hand.setDepth(10);

        this.enemies.push(hand);
      }
      else if (obj.name === 'crab') {
        const {x, y} = obj;
        
        const crab = new Crab(this, x, y);

        this.physics.add.collider(ground, crab);

        crab.setDepth(0);

        this.enemies.push(crab);
      }
      else if (obj.name === 'shipwreck') {
        const shipwreck = this.add.sprite(obj.x, obj.y, 'shipwreck');
        shipwreck.setOrigin(0.5, 0.89);
        shipwreck.setDepth(-1);
      }
    });

    this.skipIntro = false;

    this.cameras.main.setZoom(3);
    // this.cameras.main.setZoom(1);

    if (this.skipIntro) {
      this.cameras.main.startFollow(this.hero);
    }
    else {
      this.cameras.main.pan(this.hero.x, this.hero.y, 7000);
    }
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.setBackgroundColor(0x8899AA);

    this.renderer.on('postrender', () => {
      bgCtx.clearRect(0, 0, 720, 720);
      bgCtx.drawImage(this.mainCanvas, 0, 0);
    });

    // Controller
    this.gamepad = null;

    this.input.gamepad.once('connected', (pad) => {
      doc.classList.add('novirtual');
      this.gamepad = pad;

      this.input.gamepad.on('down', (pad, btn) => {
        if (btn.index === 0) {
          this.hero.actionA();
        }
        else if (btn.index === 1) {
          this.hero.actionB();
        }
      });
    });

    this.input.keyboard.on('keydown', (e) => {
      doc.classList.add('novirtual');

      if (e.key === '.') {
        this.hero.actionA();
      }
      else if (e.key === '/') {
        this.hero.actionB();
      }
      else if (e.key === ' ') {
        this.game.renderer.snapshot((img) => {
          doc.append(img);
        });
      }
      else if (e.key === 'w') {
        this.hero.lookingUp = true;
      }
    });

    this.input.keyboard.on('keyup', (e) => {
      if (e.key === 'w') {
        this.hero.lookingUp = false;
      }
    });

    window.addEventListener('touchstart', () => {
      doc.classList.remove('novirtual');
    });

    const dUp = document.querySelector('.up');
    this.vUp = false;
    const dRi = document.querySelector('.ri');
    this.vRi = false;
    const dDo = document.querySelector('.do');
    this.vDo = false;
    const dLe = document.querySelector('.le');
    this.vLe = false;

    const handlePointer = (e) => {
      let pageX = -100;
      let pageY = -100;
      if (e.targetTouches[0]) {
        pageX = e.targetTouches[0].pageX;
        pageY = e.targetTouches[0].pageY;
      }
      const targetEle = document.elementFromPoint(pageX, pageY);

      this.vRi = (targetEle === dRi);
      this.vLe = (targetEle === dLe);
    }

    document.addEventListener('touchstart', handlePointer);
    document.addEventListener('touchmove', handlePointer);
    document.addEventListener('touchend', handlePointer);

    const bA = document.querySelector('.a');
    const bB = document.querySelector('.b');

    bA.addEventListener('touchstart', () => this.hero.actionA());
    bB.addEventListener('touchstart', () => this.hero.actionB());

    // Speaking indicator
    this.speaker = this.add.image(0, 0, 'ui-speaking');
    this.speaker.setData('target', null);

    // Assign class vars
    this.bg1 = bg1;
    this.mainCanvas = document.getElementById('game');
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.ostL1 = this.sound.add('ost-desert-top', { volume: 0.5 });
    this.ostL2 = this.sound.add('ost-desert-combat', { volume: 0 });

    this.scene.launch('scene-hud', { parentScene: this });

    this.ostL1.play({ loop: true });
    this.ostL2.play({ loop: true });

    this.hud = this.scene.get('scene-hud');

    this.roberto = this.add.sprite(this.hero.x - 200, this.hero.y + 30, 'roberto');
    this.roberto.setData('following', false);
    this.roberto.play({ key: 'roberto-fly', repeat: -1 });
  }

  speak(speaker, lineNum, pause) {
    return new Promise((resolve) => {
      const dialog = {
        isiah: [
          "",
          "Damage report.",
          "I said damage report!", // Get Ku to retry
          "I don't have time for this.",
          "Let's -"
        ],
        roberto: [
          "",
          "With all due respect sir - cool your jets.",
          "Sir please - I understand that tensions are high right now...",
          "But I advise you to take a deep breath and keep calm.",
          "Anyways, the ship is broken."
        ]
      };
      const line = this.sound.add(`vo-${speaker}${lineNum}`);

      this.speaker.setData('target', (speaker === 'isiah' ? this.hero : this.roberto));
  
      function sleep(ms) {
        return new Promise((resolve) => {
          setTimeout(resolve, ms);
        });
      }
  
      line.once('complete', async () => {
        this.hud.subtitle.setVisible(false);
        this.speaker.setData('target', null);
        
        if (pause) await sleep(pause);
        line.destroy();
        resolve(line);
      });
      
      this.hud.subtitle.setVisible(true);
      this.hud.subtitle.setText(dialog[speaker][lineNum]);
  
      line.play();
    });
  }

  activateRoberto() {
    this.speak('roberto', 3, 1000)
      .then(() => {
        this.speak('roberto', 4);
        this.cameras.main.pan(this.hero.x, this.hero.y, 100, 'Linear', false, (c, p) => {
          (p === 1) && this.cameras.main.startFollow(this.hero);
        });
      });
    this.roberto.setData('following', true);
  }

  update() {
    const camX = this.cameras.main.scrollX;

    this.bg1.tilePositionX = camX / 5;
    // this.sand.panX(-camX * 0.0001);

    this.hero.update();

    // Roberto follow
    if (this.roberto.getData('following')) {
      const speed = 0.12;
      const dx = pMath.Interpolation.SmootherStep(speed, this.roberto.x, this.hero.x - 10);
      const dy = pMath.Interpolation.SmootherStep(speed, this.roberto.y, this.hero.y - 20);

      this.roberto.setPosition(dx, dy);
      this.roberto.setFlipX(this.roberto.x > this.hero.x);
    }

    // Speaker indicator
    if (this.speaker.getData('target') === null) {
      this.speaker.setPosition(0, 0);
    }
    else {
      const t = this.speaker.getData('target');
      const {x, y, displayHeight} = t;
      
      this.speaker.setPosition(x, y - (displayHeight / 3) - 15);
    }

    // Adaptive music (distance-based)
    const dangerThreshold = 300;
    let nearestEnemy = null;
    let d2e = null;

    this.enemies.forEach((s) => {
      const d = pMath.Distance.Between(this.hero.x, this.hero.y, s.x, s.y);

      if (d2e === null || d < d2e) {
        nearestEnemy = s; // Don't technically need to know which enemy is the nearest yet but might be helpful
        d2e = d;
      }

      s.update();
    });

    if (d2e < dangerThreshold) {
      this.ostL2.setVolume(1 - (d2e / dangerThreshold));
    }
    else {
      this.ostL2.setVolume(0);
    }
  }
}