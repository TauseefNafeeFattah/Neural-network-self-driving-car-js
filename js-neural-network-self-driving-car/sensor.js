class Sensor{
  constructor(car){
    this.car = car;
    this.rayCount=5;
    this.rayLength=150;
    this.raySpread=Math.PI/2;

    this.rays=[];
    this.readings=[];
  }

  update(roadBorders, traffic){
    this.#castRays();
    this.readings=[];
    // get offsets for each of the rays
    for (var i = 0; i < this.rays.length; i++) {
      this.readings.push(this.#getReadings(this.rays[i],roadBorders,traffic));
    }
  }

  #getReadings(ray,roadBorders,traffic){
    // get the distance of the intersection between rays and road borders or
    // traffic and the car
    let touches=[];

    for(var i = 0;i<roadBorders.length;i++){
      const touch=getIntersection(ray[0],ray[1],roadBorders[i][0],roadBorders[i][1]);
      if(touch){
        touches.push(touch);
      }
    }

    for(var i=0; i<traffic.length;i++){
      const poly=traffic[i].polygon;
      for(var j=0;j<poly.length;j++){
        const value=getIntersection(
          ray[0],ray[1],poly[j],poly[(j+1)%poly.length]
        );
        if (value){
          touches.push(value);
        }
      }
    }

    if(touches.length==0){
      return null;
    }else{
      const offsets=touches.map(e=>e.offset);
      const minOffset=Math.min(...offsets);
      return touches.find(e=>e.offset==minOffset);
    }
  }

  #castRays(){
    // create the rays
    this.rays=[];
    for(var i =0; i<this.rayCount;i++){

      const rayAngle=lerp(
        this.raySpread/2,
        -this.raySpread/2,
        this.rayCount==1?0.5:i/(this.rayCount-1)
      )+this.car.angle;

      const start={x:this.car.x,y:this.car.y};
      const end={
        x:this.car.x-Math.sin(rayAngle)*this.rayLength,
        y:this.car.y-Math.cos(rayAngle)*this.rayLength
      };
      this.rays.push([start,end]);
    }
  }

  draw(context){
    for(var i=0;i<this.rayCount;i++){
      let end=this.rays[i][1];
      if(this.readings[i]){
        end=this.readings[i];
      }
      context.beginPath();
      context.lineWidth=2;
      context.strokeStyle="yellow";
      // draw till the intersection
      context.moveTo(this.rays[i][0].x,this.rays[i][0].y);
      context.lineTo(end.x,end.y);
      context.stroke();

      context.beginPath();
      context.lineWidth=2;
      context.strokeStyle="black"

      // draw after the intersection to the end
      context.moveTo(this.rays[i][1].x,this.rays[i][1].y);
      context.lineTo(end.x,end.y);
      context.stroke();

    }
  }
}
