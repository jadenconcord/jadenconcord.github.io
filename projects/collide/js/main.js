// https://spicyyoghurt.com/tutorials/html5-javascript-game-development/collision-detection-physics

var objects = [];

var rand = (min, max) => Math.floor((Math.random() * max+1) + min);

var playerID;
var playerMove = {x: 0, y: 0}

function circleIntersect(x1, y1, r1, x2, y2, r2) {
    r1 /= 2;
    r2 /= 2;
    let squareDistance = (x1-x2)*(x1-x2) + (y1-y2)*(y1-y2);
    return squareDistance <= ((r1 + r2) * (r1 + r2))
}

function rectIntersect(x1, y1, w1, h1, x2, y2, w2, h2) {
    if (x2 > w1 + x1 || x1 > w2 + x2 || y2 > h1 + y1 || y1 > h2 + y2){
        return false;
    }
    return true;
}

function liniarLength(x, y, l){
  var ds = Math.pow(y/x,2)
  var h = (l*Math.sqrt(1+ds))/(1+ds);
  var k = y/x*h;
  if(x<0){
    h=-h
    k=-k
  }
  if(x==0){
    if(y>0){
      h=0;
      k=l;
    }
    else{
      h=0;
      k=-l;
    }
  }
  return {
    x: h,
    y: k,
  };
}

class ball{
  constructor(x, y, r, color, dencity=1, mx=0, my=0){
    this.x = x;
    this.y = y;
    this.r = r;
    this.color = color;
    this.m = {x: mx, y: my};
    this.mass = this.r * this.r * Math.PI * dencity;
    this.bounce = 0.9;
    this.fricton = 0.99;
    this.dencity = dencity;
  }
  update(){
    objects.forEach(a => {
      if(circleIntersect(this.x, this.y, this.r, a.x, a.y, a.r) && a != this){

        let vCollision = {x: a.x - this.x, y: a.y - this.y};
        let distance = Math.sqrt((a.x-this.x)*(a.x-this.x) + (a.y-this.y)*(a.y-this.y));
        let vCollisionNorm = {x: vCollision.x / distance, y: vCollision.y / distance};
        let vRelativeVelocity = {x: this.m.x - a.m.x, y: this.m.y - a.m.y};
        let speed = vRelativeVelocity.x * vCollisionNorm.x + vRelativeVelocity.y * vCollisionNorm.y;
        let impulse = 2 * speed / (this.mass + a.mass);
        let deltaX = (this.x-a.x)
        let deltaY = (this.y-a.y)

        let bounce = this.bounce * a.bounce;

        if (speed > 0){
          this.m.x -= (impulse * a.mass * vCollisionNorm.x * bounce);
          this.m.y -= (impulse * a.mass * vCollisionNorm.y * bounce);
          a.m.x += (impulse * this.mass * vCollisionNorm.x * bounce);
          a.m.y += (impulse * this.mass * vCollisionNorm.y * bounce);
        }

        if(true){
          var correction = liniarLength(deltaX, deltaY, (this.r+a.r)/2-distance);
          stroke(255);
          var massRatio;
          if(this.mass < a.mass)massRatio = this.mass/a.mass;
          else massRatio = 1-a.mass/this.mass;

          this.aax = this.x + correction.x;
          this.aay = this.y + correction.y;
          this.x += correction.x*(1-massRatio);
          this.y += correction.y*(1-massRatio);
          a.x -= correction.x*massRatio;
          a.y -= correction.y*massRatio;
        }
      }
    })

    this.x += this.m.x;
    this.y += this.m.y;

    this.m.y += 0.1;

    if(this.x < 0){
      this.x = 0;
      this.m.x *= -this.bounce;
    }
    if(this.x > windowWidth){
      this.x = windowWidth;
      this.m.x *= -this.bounce;
    }
    if(this.y < 0){
      this.y = 0;
      this.m.y *= -this.bounce;
    }
    if(this.y > windowHeight-this.r/2){
      this.y = windowHeight-this.r/2;
      this.m.y = 0;
    }

    this.m.x *= this.fricton;
    this.m.y *= this.fricton;
  }
  draw(){
    stroke('#ffffff00')
    fill(this.color)
    circle(this.x, this.y, this.r);
  }
}






function setup() {
  createCanvas(windowWidth, windowHeight);

  // for (var i = 0; i < 10; i++) {
  //   objects.push(new ball(rand(0, windowWidth), rand(0, windowHeight), rand(20, 50), ['red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'purple', 'pink'][rand(0,7)]));
  // }

  for (var i = 0; i < 100; i++) {
    objects.push(new ball(rand(0, windowWidth), rand(0, windowHeight), rand(10, 50), ['red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'purple', 'pink'][1], 200));
  }
  for (var i = 0; i < 10; i++) {
    objects.push(new ball(rand(0, windowWidth), rand(0, windowHeight), rand(50, 100), ['red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'purple', 'pink'][0], 2000));
  }
  for (var i = 0; i < 100; i++) {
    objects.push(new ball(rand(0, windowWidth), rand(0, windowHeight), rand(10, 50), ['red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'purple', 'pink'][5], 34));
  }
  for (var i = 0; i < 10; i++) {
    objects.push(new ball(rand(0, windowWidth), rand(0, windowHeight), rand(10, 50), '#fff1', 0.0749));
  }

  playerID = objects.length;
  objects[objects.length] = new ball(windowWidth/2, windowHeight/2, 50, 'white', 100)
}

function draw() {
  objects[playerID].m.x += playerMove.x;
  objects[playerID].m.y += playerMove.y;

  objects.forEach((a) => {
    a.update();
  });
  background(16);
  objects.forEach((a) => {
    a.draw();
  });

}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function mouseClicked() {
    valueX = mouseX%255;
    valueY = mouseY%255;
    objects.push(new ball(mouseX, mouseY, 50, 'red', 1000, 1))
}


function keyPressed() {

  switch (key) {
    case 'w':
      playerMove.y = -1; break;
    case 's':
      playerMove.y = 1; break;
    case 'a':
      playerMove.x = -1; break;
    case 'd':
      playerMove.x = 1; break;
  }
}

function keyReleased() {
  switch (key) {
    case 'w':
      playerMove.y = 0; break;
    case 's':
      playerMove.y = 0; break;
    case 'a':
      playerMove.x = 0; break;
    case 'd':
      playerMove.x = 0; break;
  }
}
