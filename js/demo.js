var ticker = require("ticker"),
  debounce = require("debounce"),
  Boids = require("./"),
  Vector = require("./vector"),
  Boid = require("./boid"),
  simpleheat = require("simpleheat");

var anchor = document.createElement("a"),
  canvas = document.createElement("canvas"),
  ctx = canvas.getContext("2d"),
  boids = new Boids();

canvas.tabIndex = 1000;

var heat = simpleheat(canvas);
heat.max(20);
heat.radius(6, 2);

var clickedHeatMap = false;
var keyPressed = false;
var food = [[100,80, 50],[-100,-100, 50]];

window.onresize = debounce(function() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  heat.resize();
  heat.clear();
}, 100);
window.onresize();

anchor.setAttribute("href", "#");
anchor.appendChild(canvas);
document.body.style.margin = "0";
document.body.style.padding = "0";
document.body.appendChild(anchor);


canvas.oncontextmenu = function (evt) {
  evt.preventDefault();
};

canvas.addEventListener('keydown', evt => {
  if (evt.keyCode === 70) keyPressed = !keyPressed;
});

canvas.addEventListener('mousedown', evt =>{
  if(evt.button === 2){
    clickedHeatMap = !clickedHeatMap;
  }else if(evt.button === 0){
    var mouseX = evt.clientX - canvas.width/2,
      mouseY = evt.clientY - canvas.height/2;

    if(keyPressed){
      food.push([mouseX, mouseY, 50]);
    }else {
      var randX = Math.random(),
        randY = Math.random();
      boids.boids.push(new Boid(new Vector(mouseX, mouseY), new Vector(randX, randY)));
    }
  }
});

ticker(window, 60)
  .on("tick", function() {
    boids.tick();
  })
  .on("draw", function() {
    var boidData = boids.boids,
      halfHeight = canvas.height / 2,
      halfWidth = canvas.width / 2;

    if (clickedHeatMap) {
      heat.draw();
    } else {
      canvas.width += 0;
      ctx.fillStyle = "rgb(0,0,0)"; // '#FFF1EB'
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      food.forEach((val, arr, ind) => {
        ctx.beginPath();
        ctx.arc(val[0] + halfWidth, val[1] + halfHeight, val[2], 0, 2 * Math.PI);
        ctx.fillStyle = "rgba(255,255,255, 0.1)";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(val[0] + halfWidth, val[1] + halfHeight, 5, 0, 2 * Math.PI)
        ctx.fillStyle = "rgba(255,255,255, 0.1)";
        ctx.fill();
      });
    }
    ctx.fillStyle = "white";
    for (var i = 0, l = boidData.length, x, y; i < l; i += 1) {
      x = boidData[i].position.x;
      y = boidData[i].position.y;
      boidData[i].position.x =
        x > halfWidth ? -halfWidth : -x > halfWidth ? halfWidth : x;
      boidData[i].position.y =
        y > halfHeight ? -halfHeight : -y > halfHeight ? halfHeight : y;
      ctx.fillRect(x + halfWidth, y + halfHeight, 6, 6);
    }
    if(heat._data.length > 100000){
      heat._data.splice(0,1000);
    }

  });


module.exports.food = food;
module.exports.heat = heat;
module.exports.canvasW = canvas.width;
module.exports.canvasH = canvas.height;


