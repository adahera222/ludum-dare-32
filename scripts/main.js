var viewport, win, then, now, fps, ctx, width, height;
var TWO_PI = 2*Math.PI;
var viewportModifier = 1;

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
}

function draw() {
  ctx.fillStyle="#FF0000";
  ctx.fillRect(0,0,width*viewportModifier,height*viewportModifier);
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

setup();
