import { Scene, Math as pMath, Geom } from 'phaser';
import { Crab } from '../sprites/Crab';
import { Hero } from '../sprites/Hero';
import { Villain } from '../sprites/Villain';
import { loadFFmpeg, recordGameplay, transcode, audio } from '../utils/ffmpeg';
import { saveAs } from 'file-saver';
import { Fire } from '../sprites/Fire';

export class Demo extends Scene {
  constructor() {
    super('scene-demo');
  }

  create() {
    const btnRec = document.querySelector('.record');
    loadFFmpeg().then(() => {
      this.sound.destination.connect(audio);
      btnRec.classList.add('ready');
    });

    const doc = document.documentElement;
    const map = this.add.tilemap('map');
    const tiles = map.addTilesetImage('tileset2', 'tileset2', 16, 16, 1, 2);
    this.ground = map.createLayer('ground', tiles);
    this.ground1 = map.createLayer('ground1', tiles);
    this.ground2 = map.createLayer('ground2', tiles);
    this.ground3 = map.createLayer('ground3', tiles);
    this.ground4 = map.createLayer('ground4', tiles);

    document.addEventListener('fullscreenchange', () => {
      if (document.fullscreenElement) {
        this.scene.resume();
        this.hud.scene.resume();
        this.hud.pauseCover.setAlpha(0);
        this.hud.playBtn.setVisible(false);
        this.sound.setVolume(1);
      }
      else {
        this.sound.setVolume(0);
        this.hud.pauseCover.setAlpha(0.75);
        this.hud.playBtn.setVisible(true);
        this.hud.scene.pause();
        this.scene.pause();
      }
    });

    this.ground.postFX.addBloom(undefined, undefined, undefined, undefined, 2);
    this.ground1.postFX.addBloom(undefined, undefined, undefined, undefined, 2);
    this.ground2.postFX.addBloom(undefined, undefined, undefined, undefined, 2);
    this.ground3.postFX.addBloom(undefined, undefined, undefined, undefined, 2);
    this.ground4.postFX.addBloom(undefined, undefined, undefined, undefined, 2);

    this.ground.setCollisionByProperty({ collides: true });
    this.ground1.setCollisionByProperty({ collides: true });
    this.ground2.setCollisionByProperty({ collides: true });
    this.ground3.setCollisionByProperty({ collides: true });
    this.ground4.setCollisionByProperty({ collides: true });

    this.ground4.setDepth(-4);
    this.ground3.setDepth(-5);
    this.ground2.setDepth(-6);
    this.ground1.setDepth(-7);
    this.ground.setDepth(-8);

    // Parallax mesh
    this.sand = this.add.plane(200, map.heightInPixels - 100, 'parallax');
    // this.sand.setScrollFactor(0);
    // this.sand.postFX.addBloom();

    this.sand.height = 3000;
    this.sand.width = map.widthInPixels;
    this.sand.rotateX += 70;
    // this.sand.viewPosition.z = 2;

    this.sand.uvScale(20, 20);
    // this.sand.setPerspective(720, 720, 100);
    this.sand.setViewHeight(300);
    this.sand.setDepth(-10);

    this.sand.setVisible(false);

    const bg1 = this.add.tileSprite(0, (720 * 0.45), 720, 720, 'bg-1');
    bg1.setOrigin(0, 0);
    bg1.setScrollFactor(0, 0.2);
    bg1.setDepth(-10);
    bg1.setScale(1, 0.5);
    bg1.postFX.addBloom(0xE5D7AE, -5, -5, 2);

    const bg2 = this.add.tileSprite(0, (720 * 0.5), 720, 720, 'bg-2');
    bg2.setOrigin(0, 0);
    bg2.setScrollFactor(0, 0.4);
    bg2.setDepth(-10);
    bg2.setScale(1, 0.5);
    bg2.postFX.addBloom(0xE5D7AE, -5, -5, 2);

    this.sun = this.add.image(720 / 2 - 100, 720 / 2 - 100, 'sun');
    this.sun.setDepth(-100);
    this.sun.setScrollFactor(0);
    // sun.postFX.addGlow(0xFF0000, 25, 0, false, 0.1, 100);
    this.sun.postFX.addBloom(0xFFFFFF, undefined, undefined, 400);
    this.sun.postFX.addBlur(0, 0, 10);

    this.tweens.add({
      targets: [this.sun],
      angle: 360,
      loop: true,
      duration: 100000
    });

    this.enemies = [];
    this.allSprites = [];

    map.getObjectLayer('sprites').objects.forEach((obj) => {
      if (obj.name === 'hero') {
        const hero = new Hero(this, obj.x, obj.y);
        this.hero = hero;
        this.physics.add.collider(this.ground, this.hero);
        this.physics.add.collider(this.ground1, this.hero);
        this.physics.add.collider(this.ground2, this.hero);
        this.physics.add.collider(this.ground3, this.hero);
        this.physics.add.collider(this.ground4, this.hero);
      }
      else if (obj.name === 'crab') {
        const {x, y} = obj;
        
        const crab = new Crab(this, x, y);

        this.physics.add.collider(this.ground, crab);
        this.physics.add.collider(this.ground1, crab);
        this.physics.add.collider(this.ground2, crab);
        this.physics.add.collider(this.ground3, crab);
        this.physics.add.collider(this.ground4, crab);

        crab.setDepth(0);

        this.enemies.push(crab);
        this.allSprites.push(crab);
      }
      else if (obj.name === 'shipwreck') {
        const shipwreck = this.add.sprite(obj.x, obj.y, 'shipwreck');
        shipwreck.setOrigin(0.5, 0.89);
        shipwreck.setDepth(-1);
        this.allSprites.push(shipwreck);
      }
      else if (obj.name === 'willow') {
        this.willow = this.add.sprite(obj.x, obj.y, 'willow');
        this.willow.setOrigin(0.5, 0.85);
        this.willow.setDepth(-1);
        this.allSprites.push(this.willow);
      }
      else if (obj.name === 'intro-gate') {
        this.introGate = this.physics.add.sprite(obj.x, obj.y, 'px');
        this.introGate.setVisible(false);
        this.introGate.setOrigin(0, 0);
        this.introGate.setBodySize(obj.width, obj.height);
        this.introGate.body.setAllowGravity(false);
        this.introGate.body.setImmovable(true);
        this.introGateCollider = this.physics.add.collider(this.hero, this.introGate);
      }
      else if (obj.name.startsWith('trip')) {
        const {x, y} = obj;
        
        const trip = this.add.sprite(x, y, 'px');
        trip.setVisible(false);
        trip.setData('trip', obj.name);

        this.enemies.push(trip);
      }
      else if (obj.name === 'fire') {
        const {x, y} = obj;
        const {value: depth} = obj.properties[0];

        const fire = new Fire(this, x, y, depth);
        this.allSprites.push(fire);
      }
    });

    this.villain = new Villain(this, 0, 0);
    this.villain.setVisible(false);

    this.devMode = (process.env.NODE_ENV === 'development');
    // this.devMode = false;
    const devMarker = map.getObjectLayer('sprites').objects.find((obj) => obj.name === 'devMode');
    this.devStartX = devMarker.x;
    this.devStartY = devMarker.y;
    
    this.cameras.main.setZoom(3);
    // this.cameras.main.setZoom(1);

    if (this.devMode) {
      this.cameras.main.startFollow(this.hero);
      this.hero.setPosition(this.devStartX, this.devStartY);
      this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels)
    }
    else {
      this.cameras.main.pan(this.hero.x, -700, 10);
      this.time.delayedCall(20, () => {
        this.cameras.main.pan(this.hero.x, this.hero.y, 20000, 'Linear');

        this.time.delayedCall(20000, () => this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels));
      });
      
    }
    this.cameras.main.setBackgroundColor(0x6694B6);

    this.renderer.on('prerender', () => {
      // Speaker indicator
      if (this.speaker.getData('target') === null) {
        this.speaker.setPosition(0, 0);
      }
      else {
        const t = this.speaker.getData('target');
        const {x, y, displayHeight} = t;
        
        this.speaker.setPosition(x, y - (displayHeight / 3) - 15);
      }
    });

    // Controller
    this.gamepad = null;

    this.input.gamepad.once('connected', (pad) => {
      doc.classList.remove('virtual');
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

    let recording = false;

    this.input.keyboard.on('keydown', async (e) => {
      doc.classList.remove('virtual');

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
      else if (e.key === 'r' && !recording) {
        recording = true;

        const canvas = document.getElementById('game');
        const filename = `Bygone${Date.now()}.mp4`;
  
        lRec.textContent = 'Recording...';
        btnRec.classList.add('recording');
  
        const video = await recordGameplay(canvas);
        lRec.textContent = 'Transcoding...';
        btnRec.classList.remove('recording');
        btnRec.classList.add('transcoding');
  
        const blob = await transcode(video.url, filename, icoRec);
        btnRec.classList.remove('transcoding');
        lRec.textContent = 'Done.';
  
        saveAs(blob);
        
        recording = false;
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

    const dUp = document.querySelector('.up');
    this.vUp = false;
    const dRi = document.querySelector('.ri');
    this.vRi = false;
    const dDo = document.querySelector('.do');
    this.vDo = false;
    const dLe = document.querySelector('.le');
    this.vLe = false;
    const lRec = document.querySelector('.record .label');
    const icoRec = document.querySelector('.record .circle');

    btnRec.addEventListener('touchstart', async () => {
      if (!recording) {
        recording = true;

        const canvas = document.getElementById('game');
        const filename = `Bygone${Date.now()}.mp4`;
  
        lRec.textContent = 'Recording...';
        btnRec.classList.add('recording');
  
        const video = await recordGameplay(canvas);
        lRec.textContent = 'Transcoding...';
        btnRec.classList.remove('recording');
        btnRec.classList.add('transcoding');
  
        const blob = await transcode(video.url, filename, icoRec);
        btnRec.classList.remove('transcoding');
        lRec.textContent = 'Done.';
  
        saveAs(blob);
        
        recording = false;
      }
    });

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

      if ((this.vRi || this.vLe) && navigator.vibrate) {
        navigator.vibrate(50);
      }
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
    this.speaker.setScale(0.75);

    // Assign class vars
    this.bg1 = bg1;
    this.bg2 = bg2;
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.ostL1 = this.sound.add('ost-desert-top', { volume: 0.5 });
    this.ostL2 = this.sound.add('ost-desert-combat', { volume: 0 });
    this.ostL3 = this.sound.add('ost-desert-boss', { volume: 0 });

    this.inEncounter = false;

    this.ostL2.on('looped', () => {
      // Adaptive music (distance-based)
      const dangerThreshold = 300;
      let nearest = null;
      let d2e = null;

      this.enemies.forEach((s) => {
        const d = pMath.Distance.Between(this.hero.x, this.hero.y, s.x, s.y);

        if (s.hp !== 0 && (d2e === null || d < d2e)) {
          nearest = s;
          d2e = d;
        }

        s.update();
      });

      if (!this.inEncounter && d2e < dangerThreshold) {
        if (nearest !== null && nearest.getData('trip')) {
          this.startEncounter(nearest);
        }
      }
      else if (this.inEncounter) {
        this.villain.teleport();
      }
    })

    this.scene.launch('scene-hud', { parentScene: this });

    this.hud = this.scene.get('scene-hud');

    this.roberto = this.add.sprite(this.hero.x - 200, this.hero.y + 30, 'roberto');
    this.roberto.setData('following', false);
    this.roberto.play({ key: 'roberto-fly', repeat: -1 });

    this.storyStep = 1;
    this.injuredCrab = false;
    this.killedCrab = false;

    this.sfxAudible = new Map();

    this.sound.play('sfx-crash');

    this.gameOver = false;
  }

  startEncounter(marker) {
    this.inEncounter = true;

    this.cameras.main.flash(1000);
    this.ostL3.setVolume(0.5);
    this.cameras.main.stopFollow();

    let {y: camY} = this.cameras.main.midPoint;

    // Magic numbers ftw
    if (camY !== 520) {
      camY -= 85;
    }

    this.cameras.main.pan(this.hero.x, camY);
    this.roberto.setVisible(false);
    this.ground.setAlpha(0.35);
    this.cameras.main.setBackgroundColor(0xFFFFFF);
    this.bg1.setAlpha(0.28);
    this.bg2.setAlpha(0.11);
    this.sun.setAlpha(0.15);
    this.villain.emerge(marker);

    marker.setPosition(0, 0);
  }

  endEncounter() {
    this.inEncounter = false;
    this.cameras.main.flash(1000);
    this.ostL3.setVolume(0);
    this.cameras.main.pan(this.hero.x, this.hero.y, 200, undefined, false, (c, p) => {
      if (p === 1) {
        this.cameras.main.startFollow(this.hero);
      }
    });
    this.roberto.setVisible(true);
    this.ground.setAlpha(1);
    this.cameras.main.setBackgroundColor(0x6694B6);
    this.bg1.setAlpha(1);
    this.bg2.setAlpha(1);
    this.sun.setAlpha(1);
    this.villain.setAlpha(1);
    this.villain.setVisible(false);
    this.villain.setPosition(0, 0);
    this.ostL2.setVolume(0);
  }

  speak(speaker, lineNum, pause) {
    return new Promise((resolve) => {
      const dialog = {
        isiah: [
          "",
          "Damage report.",
          "I said damage report!",
          "I don't have time for this.",
          "Let's -",
          "Perhaps it's an outpost of some kind.",
          "Honestly, I don't know.",
          "It's - a tree.",
          "Curious..."
        ],
        roberto: [
          "",
          "With all due respect sir - cool your jets.",
          "Sir please - I understand that tensions are high right now...",
          "But I advise you to take a deep breath and keep calm.",
          "My sensors indicate very little organic life in this desert.",
          "However there seems to be a large concentration 10km out.",
          "Lifeform ahead - seems harmless though.",
          "Don't bother it.",
          "Why'd you kill it?",
          "I wonder how its alive - all the way out here...",
          "Why did my sensors pick it up - it looks dead."
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
    if (!this.devMode) {
      this.speak('roberto', 3, 1000)
        .then(() => {
          this.cameras.main.pan(this.hero.x, this.hero.y, 100, 'Linear', false, (c, p) => {
            if (p === 1) {
              this.cameras.main.startFollow(this.hero);
              this.ostL1.play({ loop: true });
              this.ostL2.play({ loop: true });
              this.ostL3.play({ loop: true });
              this.hud.tweens.add({
                targets: [...this.hud.hearts],
                alpha: 1,
                duration: 1000
              });
              this.introGateCollider.active = false;
            }
          });
        });
    }
    else {
      this.ostL1.play({ loop: true });
      this.ostL2.play({ loop: true });
      this.ostL3.play({ loop: true });
      this.hud.tweens.add({
        targets: [...this.hud.hearts],
        alpha: 1,
        duration: 1000
      });
      this.introGateCollider.active = false;
      this.hud.distanceTo.setData('active', true);
    }
    this.roberto.setData('following', true);
  }

  update(time, delta) {
    const camX = this.cameras.main.scrollX;

    this.bg1.tilePositionX = camX / 5;
    this.bg2.tilePositionX = camX / 2;

    this.hero.update();
    this.villain.update();
    const {x: heroX} = this.hero;

    // Encounter special behaviour
    if (this.inEncounter) {
      const {x: leftX} = this.cameras.main.worldView;
      const rightX = leftX + (720 / 3);

      if (this.hero.x < leftX) {
        this.hero.setX(rightX);
      }
      else if (this.hero.x > rightX) {
        this.hero.setX(leftX);
      }
    }

    // Story stepper
    if (!this.devMode) {
      if (this.storyStep === 1 && heroX > 400) {
        this.storyStep++;
        this.speak('roberto', 4, 300)
          .then(() => this.speak('roberto', 5, 500))
          .then(() => {
            this.hud.distanceTo.setData('active', true);
            this.speak('isiah', 5)
          });
      }
      else if (this.storyStep === 2 && heroX > 2800) {
        this.storyStep++;
        this.speak('roberto', 6);
      }
      else if (this.storyStep === 3 && heroX > 10000) {
        this.storyStep++;
        this.tweens.add({
          targets: [this.ostL1],
          volume: 0,
          duration: 2000
        });
        this.speak('isiah', 7, 1500)
          .then(() => {
            if (!this.killedCrab) {
              return this.speak('roberto', 9, 3000);
            }
            else {
              return this.speak('roberto', 10, 3000);
            }
          })
          .then(() => this.speak('isiah', 8))
          .then(() => {
            this.cameras.main.stopFollow();
            this.cameras.main.pan(this.hero.x, 0, 10000, 'Linear');
            this.hud.tweens.add({
              targets: [this.hud.cover],
              alpha: 1,
              duration: 3000,
              onComplete: () => {
                this.hud.tweens.add({
                  targets: [this.hud.quote1, this.hud.quote3],
                  alpha: 1,
                  duration: 3000
                });
                this.hud.tweens.add({
                  targets: [this.hud.quote2],
                  alpha: 1,
                  duration: 3000,
                  delay: 1000,
                  onComplete: () => {
                    this.scene.pause();
                  }
                });
              }
            });
          });
      }
    }

    // Roberto follow
    if (this.roberto.getData('following')) {
      const speed = 0.12;
      const dx = pMath.Interpolation.SmootherStep(speed, this.roberto.x, this.hero.x - 20);
      const dy = pMath.Interpolation.SmootherStep(speed, this.roberto.y, this.hero.y - 40);

      this.roberto.setPosition(dx, dy);
      this.roberto.setFlipX(this.roberto.x > this.hero.x);
    }

    // Adaptive music (distance-based)
    const dangerThreshold = 300;
    let nearestEnemy = null;
    let d2e = null;

    this.enemies.forEach((s) => {
      const d = pMath.Distance.Between(this.hero.x, this.hero.y, s.x, s.y);

      if (s.hp !== 0 && (d2e === null || d < d2e)) {
        nearestEnemy = s; // Don't technically need to know which enemy is the nearest yet but might be helpful
        d2e = d;
      }

      s.update();
    });

    if (this.inEncounter) {
      this.ostL2.setVolume(1);
    }
    else if (d2e !== null && d2e < dangerThreshold) {
      // Idk.
      this.ostL2.setVolume(1 - (d2e / dangerThreshold));
    }
    else {
      this.ostL2.setVolume(0);
    }

    // Spatial looping sounds
    this.allSprites.forEach((s) => {
      if (s && s.sfxSpatialKey) {
        const {x: camX, y: camY} = this.cameras.main.midPoint;
        const d2s = pMath.Distance.Between(camX, camY, s.x, s.y);

        if (d2s >= s.sfxSpatialThreshold) {
          if (this.sfxAudible.has(s.sfxSpatialKey)) {
            const sfx = this.sfxAudible.get(s.sfxSpatialKey);
            sfx.stop();
            sfx.destroy();
            this.sfxAudible.delete(s.sfxSpatialKey);
          }
        }
        else {
          if (this.sfxAudible.has(s.sfxSpatialKey)) {
            const sfx = this.sfxAudible.get(s.sfxSpatialKey);

            if (typeof sfx.setVolume !== 'function') {
              debugger;
            }

            sfx.setVolume(1 - (d2s / s.sfxSpatialThreshold));
          }
          else {
            const sfx = this.sound.add(s.sfxSpatialKey, { volume: 0, loop: true });

            sfx.play();

            this.sfxAudible.set(s.sfxSpatialKey, sfx);
          }
        }
      }
    });
  }
}