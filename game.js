import phaser from 'phaser';

export class Game extends phaser.Scene {
    constructor () {
        super({
            key: 'game',
            physics: {
              default: 'arcade',
              arcade: {
                  // debug: true,
                  // gravity: 0 // We don't need gravity for this game
              }
          }
        });

        // prob better way to get sizes?
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.graphics = null;

        this.sats = [];
        this.rocketLine = null;
        this.lineColor = 0xFF0000;// 0xFFFFFF;
        this.lineWidth = 6;
        this.power = 0;
        this.cursor = null;
        this.group;
        this.center;
        this.rocketFlying = false;
        this.rocketFired = false;
        this.rocketStartPoint;
        this.circlePoints = 4;
        this.bandLength = 300;
        this.bandSpeed = 0.008;
        this.bandWidth = 20;
        this.orbitReady = true;
        this.currentCollider;
        this.score = 0;
        this.textHolder;
        this.enemyDelay = 1000;
        this.startPointSat;
        this.started = false;
        this.startLoopPoint;
    }
    create () {

      this.rocket = this.physics.add.image(this.width/2, this.height/2, 'rocket');
      this.planet = this.physics.add.staticImage(this.width/2, this.height/2, 'planet');
      this.planet.setCircle(250/2);

      this.graphics = this.add.graphics();
      this.graphics.lineStyle(this.lineWidth, this.lineColor, 0.6);

      this.cursor = this.add.image(0, 0, 'rocket').setVisible(false);

      let collider = this.physics.add.overlap(this.rocket, this.planet, ()=>{
        console.log('collided');
      }, (a,b)=>{
        if(this.rocketFlying&&phaser.Math.Distance.Between(a.x,a.y,b.x,b.y)<(250/2)-30){
          console.log('collided with planet');
          this.resetRocketPosition();
        }
        return false;
      }, this);

      this.rocketStartPoint = new Phaser.Geom.Point(this.width/2+this.planet.width/2, this.height/2);

      this.center = new Phaser.Geom.Point(this.width/2, this.height/2);

      this.satPoint = new Phaser.Geom.Point(0,0);

      this.groupSats = this.add.group();

      this.startPointSat = phaser.Math.RotateAroundDistance(this.satPoint, this.width/2, this.height/2, phaser.Math.DegToRad(360/this.circlePoints), 250);
      // console.log('sat point', this.startPointSat);
      // this.physics.add.staticImage(this.width/2, this.height/2, 'rocket');


      for(let i=0; i<this.circlePoints; i++) {
        const tempSatPoint = phaser.Math.RotateAroundDistance(this.satPoint, this.width/2, this.height/2, phaser.Math.DegToRad(360/this.circlePoints), 250);
        
        const tempSat = this.physics.add.image(tempSatPoint.x, tempSatPoint.y, 'sat');
        // console.log('point', tempSatPoint);

        // this.sats.push(tempSat);
        tempSat.setData('enemy', true);
        this.groupSats.add(tempSat);

        // this.sats.push(this.physics.add.image(phaser.Math.RotateAround(this.satPoint, this.width/2, this.height/2, Math.PI/2*i), 'sat'));
      }

      // const tempSat = this.physics.add.image(this.width/2, this.height/2, 'sat');
      // tempSat.setData('enemy', true);
      // this.groupSats.add(tempSat);

      // this.resetRocketPosition();


      this.currentCollider = this.physics.add.collider(this.rocket, this.groupSats, (a,b)=>{
        console.log('crash');
        b.setAccelerationX(20);
        this.groupSats.remove(b);
        this.resetRocketPosition();
      }, null, this);

      this.add.text(10, 10, 'Launch satellites, increase your score by having more of your satellites in orbit. Click to launch (power is red line length)!', {
        fontSize: 20, 
          wordWrap: {
            width: this.width - 20
          }
        }
      );

      this.textHolder = this.add.text(10, this.height-60, 'Score: 0', {fontSize: 30});

      // enemy to launch at interval, not working 
      // this.timedEnemyLaunch = this.time.addEvent({ delay: this.enemyDelay, callback: this.launchEnemy, callbackScope: this, loop: true });
    
    }
    update () {

      phaser.Actions.RotateAroundDistance(this.groupSats.getChildren(), this.center, this.bandSpeed, this.bandLength);

      if(!this.started){
        this.started = true;
        this.startLoopPoint = {x:this.groupSats.getChildren()[0].x, y:this.groupSats.getChildren()[0].y};
        // console.log('start', this.groupSats.getChildren()[0]);
      }
      if (this.input.activePointer){
        if(this.rocketLine){      
          this.rocketLine.clear();
          this.graphics = this.add.graphics();
          this.graphics.lineStyle(this.lineWidth, this.lineColor, 0.6);           
        }

        this.rocketLine = this.graphics.lineBetween(this.rocketStartPoint.x, this.rocketStartPoint.y, this.input.activePointer.position.x, this.input.activePointer.position.y);
        this.cursor.setPosition(this.input.activePointer.position.x, this.input.activePointer.position.y); 
        this.power = phaser.Math.Distance.Between(this.width/2, this.height/2, this.input.activePointer.position.x, this.input.activePointer.position.y);  // {x:this.input.activePointer.position.x, y:this.input.activePointer.position.y}; // phaser.Math.Distance.Between(this.width/2, this.height/2, this.input.activePointer.position.x, this.input.activePointer.position.y);
      }

      
      const rocketDistance = phaser.Math.Distance.Between(this.width/2, this.height/2, this.rocket.x, this.rocket.y);
      if(rocketDistance>this.bandLength-this.bandWidth/2 && rocketDistance<this.bandLength+this.bandWidth/2){
        const dx = this.rocket.body.deltaAbsX();
        const dy = this.rocket.body.deltaAbsY();

        if(dx+dy < 3.6 && this.orbitReady){
          const tempSat = this.physics.add.image(this.rocket.x, this.rocket.y, 'rocket');
          tempSat.setData('enemy', false);
          this.resetRocketPosition();
          this.groupSats.add(tempSat);
          // this.testScore();
        } 
      }

      if(this.rocket.x>this.width||this.rocket.x<0||this.rocket.y>this.height||this.rocket.y<0){ // ||(this.rocketFlying&&phaser.Math.Distance.Between(this.rocket.x,this.rocket.y,this.width/2,this.height/2)<1)
        this.resetRocketPosition();
      }

      if (this.input.activePointer.isDown && !this.rocketFired) {
        console.log('fired');
        this.physics.accelerateToObject(this.rocket, this.planet, 60, 300, 300);

        this.physics.moveToObject(this.rocket, this.cursor, this.power/2);

        this.rocketFlying = true;
        this.rocket.visible = true;
        this.rocketFired = true;

        // setTimeout(()=>{
        //   this.rocketFlying = true;
        // }, 500);
      }

      // add a sat from the enemy other side of planet?
      // if(this.bandLength.x)

      if(this.groupSats.getLength()*this.rocket.width >= 2*Math.PI*this.bandLength){
        this.restartGame();
      }

    
    }

    restartGame(){
      this.scene.restart();
    }

    launchEnemy(){

      const result = this.groupSats.getChildren().filter((aSat) => {
        // console.log('len', phaser.Math.Distance.Between(aSat.x, aSat.y, this.startLoopPoint.x, this.startLoopPoint.y));
        if(phaser.Math.Distance.Between(aSat.x, aSat.y, this.startLoopPoint.x, this.startLoopPoint.y)>this.rocket.width*2){
          return true;
        }else{
          return false;
        }  
      });
      // console.log('launch', result);
      if(result.length>0){
        const tempSat = this.physics.add.image(0, 0, 'sat'); // this.width/2 - this.bandLength
        tempSat.setData('enemy', true);
        this.groupSats.add(tempSat);
      }
      // else{
      //   this.physics.remove(tempSat);
      // }
    }

    testScore() {
      this.score = 0;
      this.groupSats.getChildren().forEach(aSat => {
        if(!aSat.getData('enemy')){
          this.score+=10;
        }
      });

      this.textHolder.setText(`score: ${this.score}`);
    }

    resetRocketPosition(){
      // this.rocket.visible = false;
      this.testScore();
      this.rocketFired = false;
      this.orbitReady = true;
      this.rocketFlying = false;
      this.rocket.setPosition(this.rocketStartPoint.x, this.rocketStartPoint.y);
      this.rocket.setAcceleration(0);
      this.rocket.setVelocity(0);
    }
}