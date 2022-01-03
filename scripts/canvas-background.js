class Ball {
    static count = 0;
    static balls = [];
    constructor(x, y, vx = 0, vy = 0, radius = 15) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.radius = radius;
        this.color = colors[Math.floor(Math.random() * 9)];
        this.id = Ball.count;
        Ball.count++;
    }

    // Add velocity to all balls with a range of -50 to 50
    // Invoked by user by clicking on image
    static agitate() {
        for (ball of Ball.balls) {
            ball.vx += Math.floor(Math.random() * 101) - 50;
            ball.vy += Math.floor(Math.random() * 101) - 50;
        }
    }

    // Clear all balls out of the balls array
    // Invoked by user via button
    static resetBalls() {
        Ball.balls.length = 0;
        Ball.count = 0;
    }

    // Add a ball with a random x, vx, and vy
    // Invoked 20 times on script load, and the user via button
    static addBall() {
        Ball.balls.push(new Ball(Math.random() * ctx.canvas.width + 15, 20,
            Math.random() * 31 - 15, Math.random() * 31 - 15));
    }
}

// Called every 16ms, basically the game loop
function simulate() {
    update();
    draw();
}

// Updates the position and velocity of all balls on screen
function update() {
    for (ball of Ball.balls) {
        // Add current velocity
        ball.x += ball.vx
        ball.y += ball.vy

        // check walls: left, right, bottom, then top
        // walls absorb 20% of velocity on their axis, and 1% from the other
        if (ball.x - ball.radius <= 0) {
            ball.vx = -ball.vx * .8;
            ball.vy = ball.vy * .99;
            ball.x = ball.radius;
        }
        if (ball.x + ball.radius >= ctx.canvas.width) {
            ball.vx = -ball.vx * .8;
            ball.vy = ball.vy * .99;
            ball.x = ctx.canvas.width - ball.radius;
        }
        if (ball.y - ball.radius <= 0) {
            ball.vx = ball.vx * .99;
            ball.vy = -ball.vy * .8;
            ball.y = ball.radius;
        }
        if (ball.y + ball.radius >= ctx.canvas.height) {
            ball.vx = ball.vx * .99;
            // The extra math is so i can remove the gravity gained from travelling out of bounds.
            // Find the ratio we travelled OOB out of the total movement, multiply by gravity to get the extra.
            ball.vy = -ball.vy * .8 + ((ball.y + ball.radius) - ctx.canvas.height) / ball.vy * gravity;
            ball.y = ctx.canvas.height - ball.radius;
        }

        // N^2, but i feel anything more complex would just be overengineering
        for (ball2 of Ball.balls) {
            if (ball.id == ball2.id) {
                continue;
            }

            // Check if ball and otherBall have collided using pythag. thrm.
            const distance = Math.sqrt((ball.x - ball2.x)*(ball.x - ball2.x) + (ball.y - ball2.y)*(ball.y - ball2.y));
            const radiusSum = ball.radius + ball2.radius;
            if (distance <= radiusSum) {
                // Push balls out of each other equally
                const overlap = (distance - radiusSum) / 2;
                ball.x -= overlap * (ball.x - ball2.x) / distance;
                ball.y -= overlap * (ball.y - ball2.y) / distance;
                ball2.x += overlap * (ball.x - ball2.x) / distance;
                ball2.y += overlap * (ball.y - ball2.y) / distance;
            }
        }

        // Gravity and speed limits
        ball.vy += gravity;
        if (ball.vx > speedLimit) {
            ball.vx = speedLimit;
        }
        if (ball.vx < -speedLimit) {
            ball.vx = -speedLimit;
        }
        if (ball.vy > speedLimit) {
            ball.vy = speedLimit;
        }
        if (ball.vy < -speedLimit) {
            ball.vy = -speedLimit;
        }
    }
}

// Draws each ball to the screen, called after update
function draw() {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    for (ball of Ball.balls) {
        ctx.beginPath();
        ctx.fillStyle = ball.color;
        ctx.arc(ball.x, ball.y, ball.radius, 0, 2 * Math.PI);
        ctx.fill();
    }
}

// Called once on simulation start and for any resize event
function resize() {
    ctx.canvas.width = document.getElementById('html').offsetWidth;
    ctx.canvas.height = document.getElementById('html').offsetHeight;
}

/*
// Make a clock?
function clock() {
  const date = new Date();
  document.getElementById("").innerHTML = date.toLocaleTimeString();
}
*/

window.addEventListener('resize', resize);
const canvas = document.querySelector('#canvas-background');
const ctx = canvas.getContext('2d');
const colors = ['NavajoWhite', 'Crimson', 'DarkMagenta', 'DodgerBlue', 'Blue', 'Chartreuse', 'OrangeRed', 'Violet', 'Yellow'];
let gravity = 2;
let speedLimit = 50;

// Start simulation, delayed by 100ms
setTimeout(() => {
    resize()
    setInterval(simulate, 16);
    for (let i = 0; i < 20; i++) {
        Ball.addBall();
    }
}, 100);