// Defining Variables
let canvas, context;
let graphCanvas,graphContext;
let persons = new Array();
let elapsedTime;
let timer = null;


// Creating the object via a class and giving the object properties
class Person {
    constructor(status) {
        this.x = 0;
        this.y = 0;
        this.r = 10;
        this.v = 0;
        this.angle = 0;
        this.status = status;
    }
    // Storing this.r (radius property) into the "newRadius" variable which is used for slider (user input)
    updateRadius(newRadius) {
        this.r = newRadius;
    }
    // Storing this.v (velocity property) into the "newVelocity" variable which is used for slider (user input)
    updateVelocity(newVelocity) {
        this.v = newVelocity;
    }

    move() {
        console.log("move");
        this.x += this.v * Math.cos(this.angle);
        this.y += this.v * Math.sin(this.angle);
        if((this.x < this.r)||(this.x > canvas.width - this.r)) {
            this.angle = Math.PI - this.angle;
            if(this.x < newRadius) this.x = this.r;
            if(this.x > canvas.width - this.r) {
                this.x = canvas.width - this.r;
            }
        }
        if((this.y < this.r)||(this.y > canvas.height - this.r)) {
            this.angle = Math.PI*2 - this.angle;
            if(this.y < newRadius) this.y = this.r;
            if(this.y > canvas.height - this.r) {
                this.y = canvas.height - this.r;
            }
        }
    }

    collide(target) {
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const d  = (dx ** 2 + dy ** 2)**0.5;
        if(d<this.r*2){
            if(this.status == "infected") target.status = "infected";
            if(target.status == "infected") this.status = "infected";
            target.angle = Math.atan2(dy,dx);
            this.angle = Math.PI - this.angle + target.angle *2;
            if((this.v > 0)&&(target.v > 0)) {
                target.v = this.v;
            }
            this.move();
            target.move();
        }
    }

    draw() {
        context.strokeStyle = "#fafafa";
        context.fillStyle = "#10e831";
        if (this.status == "infected") context.fillStyle = "#e60202";
        context.beginPath();
        context.arc(this.x,this.y,this.r,0,Math.PI*2);
        context.fill();
        context.stroke();
    }
}

const init = () => {
    canvas = document.getElementById("city");
    context = canvas.getContext("2d");
    graphCanvas = document.getElementById("graph");
    graphContext = graphCanvas.getContext("2d");
    initCanvas();
    
    var elem = document.getElementById('num');
    var human = document.getElementById('populationValue');
    var elem1 = document.getElementById("num1");
    var size = document.getElementById("radiusValue");
    var elem2 = document.getElementById("num2");
    var speed = document.getElementById("velocityValue");
    var rangeValue = function (elem, human, elem1, size, elem2, speed) {
    return function(evt){
        human.innerHTML = elem.value;
        size.innerHTML = elem1.radius;
        self.r = document.getElementById("num1").radius;
        self.v = document.getElementById("num2").speed;
    }
    }
    elem.addEventListener('input', rangeValue(elem, human));
    elem1.addEventListener('input', rangeValue(elem1, size));
    elem2.addEventListener('input', rangeValue(elem2, speed));
}

const initCanvas = () => {
    context.clearRect(0,0,canvas.width,canvas.height);
    graphContext.clearRect(0,0,graphCanvas.width,graphCanvas.height);
    graphContext.strokeStyle = "#6666FF";
    graphContext.beginPath();
    graphContext.moveTo(0,graphCanvas.height/2);
    graphContext.stroke();
    persons = [];
    const num = document.getElementById("num").value;
    for (let i = 0; i<100; i++) {
        const person = new Person("negative");
        if (i==0) person.status = "infected";
        if (i < num) {
            person.v = document.getElementById("num2").value;  
            person.angle = Math.random() * Math.PI+2;
            person.r = document.getElementById("num1").value; // <-- when i use this sometimes when the ball hits the edge of the canvas the
            //ball just decides to disappear
        }
        persons.push(person);
    }
    for (let i=persons.length-1; i>0; i--) {
        let j = Math.floor(Math.random()*i);
        [persons[i],persons[j]] = [persons[j],persons[i]];
    }
    for (let y=0; y<10; y++) {
        for (let x=0; x<10; x++) {
            const index = x + y * 10;
            persons[index].x = x * 60 + 30;
            persons[index].y = y * 60 + 30;
            persons[index].draw();
        }
    }
}

const startSim = () => {
    initCanvas();
    elapsedTime = 0;
    if (timer != null) clearInterval(timer);
    timer = setInterval(simulate);
}

const simulate = () => {
    for (const person of persons) {
        person.move();
        for (const target of persons) {
            if(person != target) person.collide(target);
        }
    }
    let cnt = 0;
    context.clearRect(0,0,canvas.width,canvas.height);
    for (const person of persons) {
        person.draw();
        if(person.status == "infected") cnt++;
    }
    graphContext.strokeStyle = "#FF0000";
    graphContext.beginPath();
    graphContext.moveTo(elapsedTime,graphCanvas.height);
    graphContext.lineTo(elapsedTime,graphCanvas.height - cnt);
    graphContext.stroke();
    elapsedTime++;

    // elapsedTime must be smaller than a number that is the same width as the (graph) canvas.
    if(elapsedTime >= 1000) {
        clearInterval(timer);
        timer = null;
    }
}
