const carCanvas = document.getElementById('carCanvas');
carCanvas.width = 200;
const networkCanvas = document.getElementById('networkCanvas');
networkCanvas.width = 500;

const carCtx = carCanvas.getContext('2d');
const networkCtx = networkCanvas.getContext('2d');
const road = new Road(carCanvas.width/2,carCanvas.width*0.9,3);
const car = new Car(road.getLaneCenter(1),100,30,50,'AI');
const traffics = [
    new Car(road.getLaneCenter(1),-100,30,50,'DUMMY',2),
];

animate();

function animate(time){
    for(let i = 0; i < traffics.length; i++) {
        traffics[i].update(road.borders,[]);
    }
    car.update(road.borders,traffics);
    carCanvas.height = window.innerHeight;
    networkCanvas.height = window.innerHeight;

    carCtx.save();

    carCtx.translate(0,-car.y+carCanvas.height*0.7); // Camera follows car
    road.draw(carCtx);
    for(let i = 0; i < traffics.length; i++) {
        traffics[i].draw(carCtx,"yellow");
    }
    car.draw(carCtx,"blue");

    carCtx.restore();

    networkCtx.lineDashOffset = -time/50;   
    Visualizer.drawNetwork(networkCtx,car.brain);
    requestAnimationFrame(animate);
}