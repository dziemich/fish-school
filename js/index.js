var Vector = require("./vector"),
  Boid = require("./boid"),
  demo = require("./demo");


class Boids {

  constructor() {
    this.speedLimit = 1;
    this.accelerationLimit = 0.03;
    this.separationDistance = 25;
    this.separationDistanceSq = Math.pow(this.separationDistance, 2);
    this.alignmentDistance = 60;
    this.alignmentDistanceSq = Math.pow(this.alignmentDistance, 2);
    this.cohesionDistance = 60;
    this.cohesionDistanceSq = Math.pow(this.cohesionDistance, 2);
    this.separationForce = 2;
    this.cohesionForce = 1;
    this.alignmentForce = 1;

    this.maxDistSq = Math.max(
      this.separationDistanceSq,
      this.cohesionDistanceSq,
      this.alignmentDistanceSq
    );

    var boids = (this.boids = []);

    for(var i = 0; i<100; i++){
      var randX = Math.random(),
        randY = Math.random();
      boids.push(new Boid(new Vector(10+i, 10-i), new Vector(randX, randY)));
    }
  }

  findNeighbors(point) {
    let neighbors = (this.neighbors = []);
    for (let i = 0; i < this.boids.length; i++) {
      let boid = this.boids[i];

      if (point === boid.position) {
        continue;
      }

      let distSq = boid.position.distSquared(point);
      if (distSq < this.maxDistSq) {
        neighbors.push({
          neighbor: this.boids[i],
          distSq: distSq
        });
      }
    }
    return neighbors;
  }

  calculateCohesion(boid, neighbors) {
    var total = new Vector(0, 0),
      distSq,
      target,
      count = 0;

    for (var i = 0; i < neighbors.length; i++) {
      target = neighbors[i].neighbor;
      if (boid === target) {
        continue;
      }

      distSq = neighbors[i].distSq;
      if (
        distSq < this.cohesionDistanceSq &&
        isInFrontOf(boid, target.position)
      ) {
        total = total.add(target.position);
        count++;
      }
    }

    if (count === 0) {
      return new Vector(0, 0);
    }

    return total
    .divideBy(count)
    .subtract(boid.position)
    .normalize()
    .subtract(boid.speed)
    .limit(this.accelerationLimit);
  }

  calculateSeparation(boid, neighbors) {
    var total = new Vector(0, 0),
      target,
      distSq,
      count = 0;

    for (var i = 0; i < neighbors.length; i++) {
      target = neighbors[i].neighbor;
      if (boid === target) {
        continue;
      }

      distSq = neighbors[i].distSq;
      if (distSq < this.separationDistanceSq) {
        total = total.add(
          target.position
          .subtract(boid.position)
          .normalize()
          .divideBy(target.position.distance(boid.position))
        );
        count++;
      }
    }

    if (count === 0) {
      return new Vector(0, 0);
    }

    return total
    .divideBy(count)
    .normalize()
    .add(boid.speed) // Adding speed instead of subtracting because separation is repulsive
    .limit(this.accelerationLimit);
  }

  calculateAlignment(boid, neighbors) {
    var total = new Vector(0, 0),
      target,
      distSq,
      count = 0;

    for (var i = 0; i < neighbors.length; i++) {
      target = this.neighbors[i].neighbor;
      if (boid === target) {
        continue;
      }

      distSq = neighbors[i].distSq;
      if (
        distSq < this.alignmentDistanceSq &&
        isInFrontOf(boid, target.position)
      ) {
        total = total.add(target.speed);
        count++;
      }
    }

    if (count === 0) {
      return new Vector(0, 0);
    }

    return total
    .divideBy(count)
    .normalize()
    .subtract(boid.speed)
    .limit(this.accelerationLimit);
  }

  searchFood(boid) {
    var boidX = boid.position.x,
      boidY = boid.position.y;

    var vec;
    var removeInd;

    demo.food.forEach((val, ind, arr) => {
      var foodX = val[0],
        foodY = val[1],
        rad = val[2];

      var dist = Math.sqrt(Math.pow(boidX - foodX, 2) + Math.pow(boidY - foodY, 2));

      if (Math.floor(dist) === 0) {
          removeInd = ind;
      }

      if (dist < rad) {
        var factX = boidX > foodX ? -1 : 1,
          factY = boidY > foodY ? -1 : 1,
          absX = Math.abs(boidX - foodX),
          absY = Math.abs(boidY - foodY),
          sum = absX + absY;

        vec = new Vector((factX*absX)/sum, (factY*absY)/sum);
      }
    });

    if (removeInd !== undefined) {
      demo.food.splice(removeInd, 1);
    }
    if(vec !== undefined){
      return vec;
    }
    return boid.speed;
  }

  static addDataToHeatMap(boid){
    var x = boid.position.x,
      y = boid.position.y,
      halfWidth = demo.canvasW/2,
      halfHeight = demo.canvasH/2;

    var heatX = (x+halfWidth);//- Math.floor(x+halfWidth) > 0.5 ? Math.ceil(x+halfWidth) : Math.floor(x+halfWidth);
    var heatY = (y+halfHeight);//- Math.floor(y+halfHeight) > 0.5 ? Math.ceil(y+halfHeight) : Math.floor(y+halfHeight);
    demo.heat.add([heatX, heatY, 1]);
  }

  tick() {
    var boid;

    for (var i = 0; i < this.boids.length; i++) {
      boid = this.boids[i];
      this.neighbors = this.findNeighbors(boid.position);

      boid.acceleration = this.calculateCohesion(boid, this.neighbors)
      .multiplyBy(this.cohesionForce)
      .add(this.calculateAlignment(boid, this.neighbors).multiplyBy(
        this.alignmentForce))
      .subtract(this.calculateSeparation(boid, this.neighbors).multiplyBy(
        this.separationForce));
    }

    for (var j = 0; j < this.boids.length; j++) {
      boid = this.boids[j];
      var old = boid.speed,
        searched = this.searchFood(boid).limit(this.speedLimit);

      boid.speed = old === searched ? boid.speed.add(boid.acceleration).limit(this.speedLimit) : searched;
      boid.position = boid.position.add(boid.speed);

      Boids.addDataToHeatMap(boid);

      delete boid.acceleration;
    }
  }
}

function isInFrontOf(boid, point) {
  return (
    boid.position.angle(boid.position.add(boid.speed), point) <= Math.PI / 3
  );

}

module.exports = Boids;
