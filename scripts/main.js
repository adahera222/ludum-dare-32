var viewport, win, then, now, fps, ctx, width, height;
var TWO_PI = 2*Math.PI;
var viewportModifier = 1;

var keysDown = {};
var car = {
  width:50,
  height:100,
  angle:0.75*TWO_PI,
  positionX:750,
  positionY:75,
  velocityX:0,
  velocityY:0,
  angularVelocity:0,
  drag:0.95,
  angularDrag:0.85,
  power:3000,
  turnSpeed:30
};
var roads = [
  {
    type:'circular',
    center:[500,-350],
    arc:[0, 1.5*Math.PI],
    radius:1500,
    ctrClockwise:false
  },
  {
    type:'horizontal',
    start:0,
    end:1000,
    y:0
  },
  {
    type:'horizontal',
    start:0,
    end:500,
    y:-1000
  },
  {
    type:'circular',
    center:[500,-1350],
    arc:[1.5*Math.PI, 0.5*Math.PI],
    radius:500,
    ctrClockwise:false
  },
  {
    type:'circular',
    center:[0,-350],
    arc:[0.5*Math.PI, 1.5*Math.PI],
    radius:500,
    ctrClockwise:false
  },
  {
    type:'vertical',
    start:-2850,
    end:-350,
    x:1850
  },
  {
    type:'circular',
    center:[1700,-2850],
    arc:[Math.PI, 0],
    radius:300,
    ctrClockwise:false
  },
  {
    type:'circular',
    center:[1100,-2850],
    arc:[0, Math.PI],
    radius:300,
    ctrClockwise:false
  },
  {
    type:'circular',
    center:[500,-2850],
    arc:[Math.PI, 0],
    radius:300,
    ctrClockwise:false
  },
  {
    type:'circular',
    center:[-400,-2850],
    arc:[0, Math.PI],
    radius:600,
    ctrClockwise:false
  },
  {
    type:'vertical',
    start:-4000,
    end:-2850,
    x:-1150
  }
];
var timeLeft = 60000;
var carImg;
var childImg;
var childTaken = false;

function setup() {
  carImg = document.getElementById('car-img');
  childImg = document.getElementById('child-img');
  setupRAF();
  viewport = document.getElementById('viewport');
  ctx = viewport.getContext('2d');
  win = $(window);
  width = 1000;
  height = 1000;
  resize();
  $(window).on('resize', resize);

  $(window).on('click', start);
}

function start() {
  $('.prompt').hide();
  timeLeft = 60000;
  car.positionX = 750;
  car.positionY = 75;
  childTaken = false;

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
  timeLeft -= dt;

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

  var onRoad = false;
  for(var i=0; i<roads.length; i++) {
    var road = roads[i];
    if(road.type==='horizontal') {
      if(car.positionX<=road.end && car.positionX>=road.start
        && car.positionY<=road.y+300 && car.positionY>=road.y) {
        onRoad = true;
        break;
      }
    }
    else if(road.type==='vertical') {
      if(car.positionY<=road.end && car.positionY>=road.start
        && car.positionX<=road.x+300 && car.positionX>=road.x) {
        onRoad = true;
        break;
      }
    }
    else if(road.type==='circular') {
      var fromCenter = [road.center[0]-car.positionX, road.center[1]-car.positionY];
      var distFromCenter = distance(road.center[0], road.center[1], car.positionX, car.positionY);
      var angle = Math.atan2(fromCenter[1], fromCenter[0])+Math.PI;
      if(distFromCenter<=road.radius+150 && distFromCenter>=road.radius-150) {
        if(road.arc[1]>road.arc[0]) {
          if(angle<=road.arc[1] && angle>=road.arc[0]) {
            onRoad = true;
            break;
          }
        }
        else {
          if(angle > Math.PI)
            angle -= Math.PI;
          else
            angle += Math.PI;
          if(angle<=road.arc[0] && angle>=road.arc[1]) {
            onRoad = true;
            break;
          }
        }
      }
    }
  }

  if(!onRoad) {
    // car.velocityX*=0.25;
    // car.velocityY*=0.25;
  }

  car.positionX += car.velocityX*elapsedSeconds;
  car.positionY += car.velocityY*elapsedSeconds;
  car.velocityX *= car.drag;
  car.velocityY *= car.drag;
  car.angle += car.angularVelocity*elapsedSeconds;
  car.angularVelocity *= car.angularDrag;

  if(car.positionX<=-950 && car.positionX>=-1050 && car.positionY<=-3850 && car.positionY>=-3950) {
    childTaken = true;
  }
}

function draw() {
  var vpm = viewportModifier;
  ctx.clearRect(0, 0, viewportWidth, viewportHeight);

  ctx.translate(viewportWidth/2, viewportHeight/2);
  ctx.translate(-car.positionX*vpm, -car.positionY*vpm);
  ctx.beginPath();
  roads.forEach(function(road) {
    if(road.type === 'horizontal') {
      var roadLength = road.end-road.start;
      ctx.fillStyle='black';
      ctx.fillRect(road.start*vpm, road.y*vpm, roadLength*vpm, 300*vpm);
      ctx.strokeStyle = 'yellow';
      ctx.beginPath();
      ctx.moveTo(road.start*vpm, (road.y+145)*vpm);
      ctx.lineTo(road.end*vpm, (road.y+145)*vpm);
      ctx.lineWidth = 5*vpm;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(road.start*vpm, (road.y+155)*vpm);
      ctx.lineTo(road.end*vpm, (road.y+155)*vpm);
      ctx.lineWidth = 5*vpm;
      ctx.stroke();
    }
    else if(road.type === 'vertical') {
      var roadLength = road.end-road.start;
      ctx.fillStyle='black';
      ctx.fillRect(road.x*vpm, road.start*vpm, 300*vpm, roadLength*vpm);
      ctx.strokeStyle = 'yellow';
      ctx.beginPath();
      ctx.moveTo((road.x+145)*vpm, road.start*vpm);
      ctx.lineTo((road.x+145)*vpm, road.end*vpm);
      ctx.lineWidth = 5*vpm;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo((road.x+155)*vpm, road.start*vpm);
      ctx.lineTo((road.x+155)*vpm, road.end*vpm);
      ctx.lineWidth = 5*vpm;
      ctx.stroke();
    }
    else if(road.type === 'circular') {
      ctx.fillStyle = 'black';
      ctx.beginPath();
      ctx.arc(road.center[0]*vpm, road.center[1]*vpm, (road.radius+150)*vpm, road.arc[0], road.arc[0]+Math.PI, road.ctrClockwise);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(road.center[0]*vpm, road.center[1]*vpm, (road.radius+150)*vpm, road.arc[1]-Math.PI, road.arc[1], road.ctrClockwise);
      ctx.fill();
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(road.center[0]*vpm, road.center[1]*vpm, (road.radius-150)*vpm, 0, TWO_PI);
      ctx.fill();
      ctx.strokeStyle = 'yellow';
      ctx.beginPath();
      ctx.arc(road.center[0]*vpm, road.center[1]*vpm, (road.radius+5)*vpm, road.arc[0], road.arc[1], road.ctrClockwise);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(road.center[0]*vpm, road.center[1]*vpm, (road.radius-5)*vpm, road.arc[0], road.arc[1], road.ctrClockwise);
      ctx.stroke();
    }
  });
  
  ctx.font=(30*vpm)+'px Helvetica';
  ctx.fillStyle='red';
  ctx.fillText('path for cheaters',-150*vpm,-2025*vpm);

  if(!childTaken) {
    ctx.drawImage(childImg, -1000*vpm, -3900*vpm, 50*vpm, 50*vpm);
  }

  ctx.translate(car.positionX*vpm, car.positionY*vpm);
  ctx.rotate(car.angle);
  ctx.fillStyle='#FF0000';
  ctx.drawImage(carImg, -car.width/2*vpm, -car.height/2*vpm, car.width*vpm, car.height*vpm);
  if(childTaken) {
    ctx.drawImage(childImg, -car.width/2*vpm, 0, 50*vpm, 50*vpm);
  }
  ctx.rotate(-car.angle);
  ctx.translate(-viewportWidth/2, -viewportHeight/2);

  ctx.fillStyle = 'black';
  ctx.strokeStyle = 'white';
  ctx.beginPath();
  ctx.font=(30*vpm)+'px Helvetica';
  var secs = ~~(timeLeft/1000);
  ctx.strokeText(secs+' seconds',50*vpm,50*vpm);
  ctx.fillText(secs+' seconds',50*vpm,50*vpm);
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

function distance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x2-x1, 2) + Math.pow(y2-y1, 2));
}

setup();
