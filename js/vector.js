class Vector{

  constructor(x,y){
    this.x = x;
    this.y = y;
  }

  add(v){
    return new Vector(this.x + v.x, this.y + v.y);
  };

  distSquared(v){
    return Math.pow(this.x - v.x, 2) + Math.pow(this.y - v.y, 2);
  };

  distance(v){
    return Math.sqrt(this.distSquared(v));
  };

  multiplyBy(s){
    return new Vector(this.x * s, this.y * s);
  };

  neg(){
    return new Vector(-this.x, -this.y);
  };

  magnitude(){
    return this.distance(new Vector(0, 0));
  };

  normalize(){
    var magnitude = this.magnitude();
    if (magnitude === 0) return new Vector(0, 0);

    return new Vector(this.x / magnitude, this.y / magnitude);
  };

  subtract(v){
    return this.add(v.neg());
  };

  divideBy(s){
    return this.multiplyBy(1 / s);
  };

  limit(s){
    if (this.magnitude() > s) return this.normalize().multiplyBy(s);

    return this;
  };

  angle(p1, p2){
    var v1 = this.subtract(p1).normalize(),
      v2 = this.subtract(p2).normalize(),
      cos = Math.round((v1.x * v2.x + v1.y * v2.y) * 10000) / 10000;

    return Math.acos(cos);
  };

}

module.exports = Vector;
