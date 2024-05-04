import { Scene, Math as pMath } from 'phaser';
import { Crab } from '../sprites/Crab';
import { Hero } from '../sprites/Hero';

export class Demo extends Scene {
  constructor() {
    super('scene-demo');
  }

  create() {
    const doc = document.documentElement;
    const bgCtx = document.querySelector('.bg').getContext('2d');

    const map = this.add.tilemap('map-desert1', 16, 16);
    const tiles = map.addTilesetImage('sand-and-cave', 'tiles-sand-and-cave', 16, 16, 1, 2);
    const ground = map.createLayer('ground', tiles);
    const fg = map.createLayer('fg', tiles);
    const bg = map.createLayer('bg', tiles);

    ground.setCollisionByProperty({ collides: true });

    fg.setDepth(10);
    ground.setDepth(-1);
    bg.setDepth(-5);

    const bg1 = this.add.tileSprite(0, (720 * 0.33), 720, 720, 'bg-1');
    bg1.setOrigin(0, 0);
    bg1.setScrollFactor(0);
    bg1.setDepth(-10);
    bg1.setScale(1, 0.5);

    this.enemies = [];

    map.getObjectLayer('sprites').objects.forEach((obj) => {
      if (obj.name === 'hero') {
        const hero = new Hero(this, obj.x, obj.y);
        this.hero = hero;
        this.physics.add.collider(ground, this.hero);
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
    });

    this.cameras.main.setZoom(3);
    this.cameras.main.startFollow(this.hero);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.setBackgroundColor(0xDDEEFF);

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

    // Assign class vars
    this.bg1 = bg1;
    this.mainCanvas = document.getElementById('game');
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.ostL1 = this.sound.add('ost-desert-top');
    this.ostL2 = this.sound.add('ost-desert-combat', { volume: 0 });

    this.scene.launch('scene-hud', { parentScene: this });

    this.ostL1.play({ loop: true });
    this.ostL2.play({ loop: true });
  }

  update() {
    const camX = this.cameras.main.scrollX;

    this.bg1.tilePositionX = camX / 5;

    this.hero.update();

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