const carCanvas = document.getElementById('carCanvas');
carCanvas.width = 200;
const networkCanvas = document.getElementById('networkCanvas');
networkCanvas.width = 900;

const carCtx = carCanvas.getContext('2d');
const networkCtx = networkCanvas.getContext('2d');
const road = new Road(carCanvas.width / 2, carCanvas.width * 0.9, 3);

const N = 100;
const cars = generateCars(N);
let bestCar = cars[0];
if(localStorage.getItem('bestBrain')) {
    for(let i = 0; i < cars.length; i++) {
        cars[i].brain = JSON.parse(localStorage.getItem('bestBrain'));
        if(i != 0) {
            NeuralNetwork.mutate(cars[i].brain,0.1);
        }
    }
    
}

const traffics = [
    new Car(road.getLaneCenter(1), -100, 30, 50, 'DUMMY', 2),
    new Car(road.getLaneCenter(0), -300, 30, 50, 'DUMMY', 2),
    new Car(road.getLaneCenter(2), -300, 30, 50, 'DUMMY', 2),
    new Car(road.getLaneCenter(2), -500, 30, 50, 'DUMMY', 2),
    new Car(road.getLaneCenter(1), -550, 30, 50, 'DUMMY', 2),
    new Car(road.getLaneCenter(0), -720, 30, 50, 'DUMMY', 2),
    new Car(road.getLaneCenter(1), -730, 30, 50, 'DUMMY', 2),
    new Car(road.getLaneCenter(2), -950, 30, 50, 'DUMMY', 2),
    new Car(road.getLaneCenter(0), -1020, 30, 50, 'DUMMY', 2),
    new Car(road.getLaneCenter(1), -1130, 30, 50, 'DUMMY', 2),
    new Car(road.getLaneCenter(0), -1150, 30, 50, 'DUMMY', 2),
];

animate();

function saveBestCar() {
    localStorage.setItem('bestBrain', JSON.stringify(bestCar.brain));
}

function discardBestCar() {
    localStorage.removeItem('bestBrain');
}

function generateCars(n) {
    const cars = [];
    for (let i = 0; i < n; i++) {
        cars.push(new Car(road.getLaneCenter(1), 100, 30, 50, 'AI'));
    }
    return cars;
}

function animate(time) {
    for (let i = 0; i < traffics.length; i++) {
        traffics[i].update(road.borders, []);
    }
    for (let i = 0; i < cars.length; i++) {
        cars[i].update(road.borders, traffics);
    }

    bestCar = cars.find(c => c.y == Math.min(...cars.map(c => c.y))); // Create a new array with all the car's y values and find the minimum


    carCanvas.height = window.innerHeight;
    networkCanvas.height = window.innerHeight;

    carCtx.save();
    carCtx.translate(0, -bestCar.y + carCanvas.height * 0.7); // Camera follows car

    road.draw(carCtx);
    for (let i = 0; i < traffics.length; i++) {
        traffics[i].draw(carCtx, "yellow");
    }
    carCtx.globalAlpha = 0.2;
    for (let i = 0; i < cars.length; i++) {
        cars[i].draw(carCtx, "blue");
    }
    carCtx.globalAlpha = 1;
    bestCar.draw(carCtx, "blue", true);
    carCtx.restore();

    networkCtx.lineDashOffset = -time / 50;
    Visualizer.drawNetwork(networkCtx, bestCar.brain);
    requestAnimationFrame(animate);
}