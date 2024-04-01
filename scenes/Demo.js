import { Scene, Math as pMath } from 'phaser';

export class Demo extends Scene {
  constructor() {
    super('scene-demo');
  }

  actionA() {
    if (this.hero.body.blocked.down) {
      this.hero.setVelocityY(-this.jump);
    }
  }

  actionB() {
    if (this.hero.getData('slashing') === false) {
      this.hero.setData('slashing', true);
      this.hero.play({
        key: 'hero-slash',
        repeat: 0
      });
      this.hero.once('animationcomplete', () => {
        this.hero.setData('slashing', false);
      });
    }
  }

  create() {
    const doc = document.documentElement;
    const bgCtx = document.querySelector('.bg').getContext('2d');

    const map = this.add.tilemap('map-desert1', 16, 16);
    const tiles = map.addTilesetImage('sand-and-cave', 'tiles-sand-and-cave', 16, 16, 1, 2);
    const ground = map.createLayer('ground', tiles);
    const fg = map.createLayer('fg', tiles);
    const bg = map.createLayer('bg', tiles);

    fg.setDepth(10);
    ground.setDepth(-1);
    bg.setDepth(-5);

    const bg1 = this.add.tileSprite(0, (720 * 0.33), 720, 720, 'bg-1');
    bg1.setOrigin(0, 0);
    bg1.setScrollFactor(0);
    bg1.setDepth(-10);
    bg1.setScale(1, 0.5);

    const hero = this.physics.add.sprite(0, 0, 'hero');
    hero.body.setSize(15, 32);
    hero.body.offset.y = 35;
    hero.setOrigin(0.5, 1);

    hero.setData('slashing', false);

    map.getObjectLayer('sprites').objects.forEach((obj) => {
      if (obj.name === 'hero') {
        hero.setPosition(obj.x, obj.y);
      }
      else if (obj.name === 'hand') {
        const {x, y, width} = obj;

        const hand = this.add.sprite(x, y, 'hand');

        hand.setOrigin(0.5, 0.8);

        const handGrab = () => {
          const delay = pMath.Between(500, 2000);
          
          this.time.delayedCall(delay, () => {
            if (hero.x >= x && hero.x <= x + width) {
              hand.setX(hero.x);
              
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

      }
    });

    ground.setCollisionByProperty({ collides: true });

    this.physics.add.collider(ground, hero);

    this.cameras.main.setZoom(3);
    this.cameras.main.startFollow(hero);
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
        console.log(btn.index);

        if (btn.index === 0) {
          this.actionA();
        }
        else if (btn.index === 1) {
          this.actionB();
        }
      });
    });

    this.input.keyboard.on('keydown', (e) => {
      doc.classList.add('novirtual');

      if (e.key === '.') {
        this.actionA();
      }
      else if (e.key === '/') {
        this.actionB();
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

    bA.addEventListener('touchstart', () => this.actionA());
    bB.addEventListener('touchstart', () => this.actionB());

    // Assign class vars
    this.hero = hero;
    this.bg1 = bg1;
    this.speed = 200;
    this.jump = 400;
    this.mainCanvas = document.getElementById('game');
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
  }

  update() {
    const camX = this.cameras.main.scrollX;

    this.bg1.tilePositionX = camX / 5;
    

    let left = false;
    let right = false;
    if (this.gamepad) {
      left = this.gamepad.left;
      right = this.gamepad.right;
    }
    const {vLe, vRi, keyA, keyD} = this;

    if (left || vLe || keyA.isDown) {
      this.hero.setVelocityX(-this.speed);
      if (this.hero.getData('slashing') === false) this.hero.setFlipX(true);
    }
    else if (right || vRi || keyD.isDown) {
      this.hero.setVelocityX(this.speed);
      if (this.hero.getData('slashing') === false) this.hero.setFlipX(false);
    }
    else {
      this.hero.setVelocityX(0);
    }

    const {x: vx, y: vy} = this.hero.body.velocity;
    const grounded = this.hero.body.blocked.down;

    if (this.hero.getData('slashing') === false) {
      if (grounded) {
        if (vx === 0) {
          this.hero.play({
            key: 'hero-idle',
            repeat: -1
          }, true);
        }
        else {
          this.hero.play({
            key: 'hero-run',
            repeat: -1
          }, true);
        }
      }
      else {
        if (vy <= 0) {
          this.hero.play({
            key: 'hero-jump',
            repeat: -1
          }, true);
        }
        else {
          this.hero.play({
            key: 'hero-fall',
            repeat: -1
          }, true);
        }
      }
    }
    else {
      if (this.hero.body.velocity.y === 0) this.hero.setVelocityX(0);
    }
  }
}