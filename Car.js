class Car {
    constructor(x, y, width, height, type, maxSpeed = 3) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.speed = 0;
        this.acceleration = 0.2;
        this.maxSpeed = maxSpeed;
        this.friction = 0.05;
        this.angle = 0;
        this.damaged = false;
        this.useAI = type == 'AI';

        if (type != 'DUMMY') {
            this.sensor = new Sensor(this);
            this.brain = new NeuralNetwork([this.sensor.rayCount, 10, 4]);
        }

        this.controls = new Controls(type);
    }

    update(roadBorders,traffic) {
        if (!this.damaged) {
            this.#move();
            this.polygon = this.#createPolygon();
            this.damaged = this.#accessDamage(roadBorders,traffic);
        }
        if (this.sensor) { 
            this.sensor.update(roadBorders,traffic); 
            const offsets = this.sensor.readings.map(s=>s==null?0:1-s.offset);
            const outputs=NeuralNetwork.feedForward(offsets,this.brain);

            if(this.useAI){
                this.controls.forward=outputs[0];
                this.controls.left=outputs[1];
                this.controls.right=outputs[2];
                this.controls.reverse=outputs[3];
            }
        }

    }

    #accessDamage(roadBorders,traffic) {
        for (let i = 0; i < roadBorders.length; i++) {
            if (polysIntersect(this.polygon, roadBorders[i])) {
                return true;
            }
        }
        for (let i = 0; i < traffic.length; i++) {
            if (polysIntersect(this.polygon, traffic[i].polygon)) {
                return true;
            }
        }
        return false;
    }

    #createPolygon() {
        const points = [];
        const rad = Math.hypot(this.width, this.height) / 2;
        const alpha = Math.atan2(this.width, this.height);
        points.push({
            x: this.x - Math.sin(this.angle - alpha) * rad,
            y: this.y - Math.cos(this.angle - alpha) * rad
        })
        points.push({
            x: this.x - Math.sin(this.angle + alpha) * rad,
            y: this.y - Math.cos(this.angle + alpha) * rad
        })
        points.push({
            x: this.x - Math.sin(Math.PI + this.angle - alpha) * rad,
            y: this.y - Math.cos(Math.PI + this.angle - alpha) * rad
        })
        points.push({
            x: this.x - Math.sin(Math.PI + this.angle + alpha) * rad,
            y: this.y - Math.cos(Math.PI + this.angle + alpha) * rad
        })
        return points;
    }

    #move() {
        if (this.controls.forward) {
            this.speed += this.acceleration;
        }
        if (this.controls.reverse) {
            this.speed -= this.acceleration;
        }
        // If speed is greater than MaxSpeed, set speed to MaxSpeed
        if (this.speed > this.maxSpeed) {
            this.speed = this.maxSpeed;
        }
        // If speed is less than -MaxSpeed/2, set speed to -MaxSpeed/2
        if (this.speed < -this.maxSpeed / 2) {
            this.speed = -this.maxSpeed / 2;
        }
        // If speed is greater than 0, decrease speed by friction
        if (this.speed > 0) {
            this.speed -= this.friction;
        }
        // If speed is less than 0, increase speed by friction
        if (this.speed < 0) {
            this.speed += this.friction;
        }
        // If speed is less than friction, set speed to 0
        if (this.speed < this.friction && this.speed > -this.friction) {
            this.speed = 0;
        }
        if (this.speed != 0) {
            const flip = this.speed > 0 ? 1 : -1; // If speed is positive, flip is 1, else flip is -1 (for reverse)
            if (this.controls.left) {
                this.angle += 0.03 * flip;
            }
            if (this.controls.right) {
                this.angle -= 0.03 * flip;
            }
        }
        this.x -= Math.sin(this.angle) * this.speed;
        this.y -= Math.cos(this.angle) * this.speed;
    }

    draw(ctx,color,drawSensors = false) {
        ctx.fillStyle = this.damaged ? 'grey' : color;
        ctx.beginPath();
        ctx.moveTo(this.polygon[0].x, this.polygon[0].y);
        for (let i = 1; i < this.polygon.length; i++) {
            ctx.lineTo(this.polygon[i].x, this.polygon[i].y);
        }
        ctx.fill();
        if (this.sensor && drawSensors) this.sensor.draw(ctx);
    }
}