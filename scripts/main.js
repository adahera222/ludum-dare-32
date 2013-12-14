var viewport, win, then, now, fps, ctx, width, height;
var TWO_PI = 2*Math.PI;
var viewportModifier = 1;

var keysDown = {};
var car = {
  width:50,
  height:100,
  angle:0,
  positionX:500,
  positionY:500,
  velocityX:0,
  velocityY:0,
  angularVelocity:0,
  drag:0.99,
  angularDrag:0.9,
  power:1000,
  turnSpeed:30
};

function setup() {
  setupRAF();
  viewport = document.getElementById('viewport');
  ctx = viewport.getContext('2d');
  win = $(window);
  width = 1000;
  height = 1000;
  resize();
  $(window).on('resize', resize);

  start();
}

function start() {
  then = Date.now();
  requestAnimationFrame(frame);
}

function frame() {
  now = Date.now();
  update(now-then);
  draw();
  requestAnimationFrame(frame);
  then = now;
}

function update(dt) {
  fps = ~~(1000/dt);
  elapsedSeconds = dt/1000;

  if(keysDown[38]) { // forward
    car.velocityY -= Math.cos(car.angle)*car.power*elapsedSeconds;
    car.velocityX += Math.sin(car.angle)*car.power*elapsedSeconds;
  }
  else if(keysDown[40]) { // backward
    car.velocityY += Math.cos(car.angle)*car.power*elapsedSeconds;
    car.velocityX -= Math.sin(car.angle)*car.power*elapsedSeconds;
  }

  if(keysDown[37] && !keysDown[39]) { // left
    car.angularVelocity -= car.turnSpeed*elapsedSeconds;
  }
  else if(keysDown[39] && !keysDown[37]) { // right
    car.angularVelocity += car.turnSpeed*elapsedSeconds;
  }

  car.positionX += car.velocityX*elapsedSeconds;
  car.positionY += car.velocityY*elapsedSeconds;
  car.velocityX *= car.drag;
  car.velocityY *= car.drag;
  car.angle += car.angularVelocity*elapsedSeconds;
  car.angularVelocity *= car.angularDrag;
}

function draw() {
  var vpm = viewportModifier;
  ctx.clearRect(0, 0, width*vpm, height*vpm);
  ctx.fillStyle="#FF0000";
  ctx.translate(car.positionX*vpm, car.positionY*vpm);
  ctx.rotate(car.angle);
  ctx.fillRect(-car.width/2*vpm, -car.height/2*vpm, car.width*vpm, car.height*vpm);
  ctx.rotate(-car.angle);
  ctx.translate(-car.positionX*vpm, -car.positionY*vpm);
}

var viewportWidth, viewportHeight;
function resize() {
  viewportWidth = $(window).width()-20;
  viewportModifier = viewportWidth/width;
  viewportHeight = $(window).height()-20;
  viewport.width = viewportWidth;
  viewport.height = viewportHeight;
}

var setupRAF = function() {
  var lastTime = 0;
  var vendors = ['ms', 'moz', 'webkit', 'o'];
  for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
    window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] 
       || window[vendors[x]+'CancelRequestAnimationFrame'];
  }

  if (!window.requestAnimationFrame)
    window.requestAnimationFrame = function(callback, element) {
    var currTime = new Date().getTime();
    var timeToCall = Math.max(0, 16 - (currTime - lastTime));
    var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
      timeToCall);
    lastTime = currTime + timeToCall;
    return id;
  };

  if (!window.cancelAnimationFrame)
    window.cancelAnimationFrame = function(id) {
      clearTimeout(id);
  };
}

addEventListener("keydown", function (e) {
  keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function (e) {
  delete keysDown[e.keyCode];
}, false);

setup();
