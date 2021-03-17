// Defining Variables (not in the global scope as 'var' is not used)
let canvas, context;
let graphCanvas,graphContext;
let persons = new Array();
let elapsedTime;
let timer = null;


// Creating the object via a class and giving the object properties
class Person {
    // Using the contructor method to create and initialize an object of the class "Person".
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
    // Move function to move the circle by adding velocity onto the x and y coordinate and multiplying by cos(angle) 
    // if x coordinate and sin(angle) if y coordinate as well as collision on both the left and right of the canvas/walls.
    move() {
        console.log("move");
        this.x += this.v * Math.cos(this.angle);
        this.y += this.v * Math.sin(this.angle);
        if((this.x < this.r)||(this.x > canvas.width - this.r)) {
            this.angle = Math.PI - this.angle;
            if(this.x < self.r) this.x = this.r;
            if(this.x > canvas.width - this.r) {
                this.x = canvas.width - this.r;
            }
        }
        // Collision for the bottom and top of the canvas/walls.
        if((this.y < this.r)||(this.y > canvas.height - this.r)) {
            this.angle = Math.PI*2 - this.angle;
            if(this.y < self.r) this.y = this.r;
            if(this.y > canvas.height - this.r) {
                this.y = canvas.height - this.r;
            }
        }
    }
    // Collision function for hitting a target (another circle).
    collide(target) {
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        // Pythagoras Theorm is used to calculate the distance between the two circles (hypotenuse) for variable 'd' when both the opposite and adjacent sides are known.
        //c^2 = a^2 + b^2
        const d  = (dx ** 2 + dy ** 2)**0.5;
        // If the distance between the two circles is smaller than the diamater of one of the circles:
        if(d<this.r*2) {
            // Give the 'infected' status (changes the color of the circle to red in the 'draw()' function)
            if(this.status == "infected") target.status = "infected";
            if(target.status == "infected") this.status = "infected";
            // Changes the direction of the ball to the realistic collision angle.
            target.angle = Math.atan2(dy,dx);
            this.angle = Math.PI - this.angle + target.angle *2;
            if((this.v > 0)&&(target.v > 0)) {
                this.v = target.v;
                target.v = this.v;
            }
            // Calls the move function for both the circle and the target (the circle that is collided with)
            this.move();
            target.move();
        }
    }
    // Draw function to draw the circle and change the color to red if the status is "infected".
    draw() {
        context.strokeStyle = "#fafafa";
        context.fillStyle = "#10e831";
        if (this.status == "infected") context.fillStyle = "#e60202";
        context.beginPath();
        // Calls the 'arc' method and inputs the x and y coordinates, radius, 0 and PI*2 = 360 degrees
        context.arc(this.x,this.y,this.r,0,Math.PI*2);
        // Calls the 'fill' method
        context.fill();
        // Calls the 'stroke' method
        context.stroke();
    }
}
// Constant function which is called in the HTML file.
const init = () => {
    // Defines variables inside the constant function to refer to the canvases.
    canvas = document.getElementById("city");
    context = canvas.getContext("2d");
    graphCanvas = document.getElementById("graph");
    graphContext = graphCanvas.getContext("2d");
    initCanvas();
    //  Used to link slider values to their relative variable values for the modifiers.
    var elem = document.getElementById('num');
    var human = document.getElementById('populationValue');
    var elem1 = document.getElementById("num1");
    var size = document.getElementById("radiusValue");
    var elem2 = document.getElementById("num2");
    var speed = document.getElementById("velocityValue");
    var rangeValue = function (elem, human, elem1, size, elem2, speed) {
    // Returns the event that has occured regarding the value of the sliders and linking them to their relative variables.
    return function(evt){
        human.innerHTML = elem.value;
        size.innerHTML = elem1.radius;
        self.r = document.getElementById("num1").radius;
        self.v = document.getElementById("num2").speed;
    }
    }
    // Event Listeners that check for any user input regarding the variables.
    elem.addEventListener('input', rangeValue(elem, human));
    elem1.addEventListener('input', rangeValue(elem1, size));
    elem2.addEventListener('input', rangeValue(elem2, speed));
}
// Constant function which is later called by the "startSim()" function which is called by the HTML user input button.
// This function contains properties for the HTML canvas.
const initCanvas = () => {
    context.clearRect(0,0,canvas.width,canvas.height);
    graphContext.clearRect(0,0,graphCanvas.width,graphCanvas.height);
    graphContext.strokeStyle = "#6666FF";
    graphContext.beginPath();
    graphContext.moveTo(0,graphCanvas.height/2);
    graphContext.stroke();
    // Defining a 'persons' empty list variable
    persons = [];
    // Defining a constant variable that stores the value of the slider with id "num".
    const num = document.getElementById("num").value;
    for (let i = 0; i<100; i++) {
        const person = new Person("negative");
        if (i==0) person.status = "infected";
        if (i < num) {
            person.v = document.getElementById("num2").value;  
            person.r = document.getElementById("num1").value; 
            person.angle = Math.random() * Math.PI+2;
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
// Starts the simulation and calls the initCanvas function to draw the canvas and state relevant properties etc.
const startSim = () => {
    initCanvas();
    // Defines variable 'elapsedTime'
    elapsedTime = 0;
    // Checks if timer is not equal to 0 and if so clears the interval which has been set by setInterval() function before that.
    if (timer != null) clearInterval(timer);
    // Start an interval for the 'simulation()' function.
    timer = setInterval(simulation);
}
// Constant function called 'simulation'
const simulation = () => {
    // Creates a for loop to loop the 'move()' function regarding variable 'person'
    for (const person of persons) {
        person.move();
        // Creates a for loop to check if the person is not equal to the target, if so then it will call the "collide()" function
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
    // Sets the color of the graph
    graphContext.strokeStyle = "#FF0000";
    // Calls the beginPath method in relation to the canvas of the graph
    graphContext.beginPath();
    // Calls the moveTo method in relation to the canvas of the graph and inputs the elapsed time and the height of the canvas of the graph.
    graphContext.moveTo(elapsedTime,graphCanvas.height);
    // Calls the lineTo method in relation to the canvas of the graph and inputs the elapsed time and the 
    // height of the canvas of the graph subtract the current amount of infected people
    graphContext.lineTo(elapsedTime,graphCanvas.height - cnt);
    // Calls the stroke method in relation to the canvas of the graph
    graphContext.stroke();
    // Increments the 'elapsedTime' variable
    elapsedTime++;

    // elapsedTime must be smaller than a number that is the same width as the (graph) canvas 
    // otherwise will go past the end of the canvas or not reach the end of the canvas
    if(elapsedTime >= 1000) {
        // Clears the interval which has been set by setInterval() function before that.
        clearInterval(timer);
        // Makes the timer variable equal to 0
        timer = null;
    }
}
