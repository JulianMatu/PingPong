//select canvas
const cvs = document.getElementById("pong");
const ctx = cvs.getContext("2d");

//gameplay constants
const collideMaxAngle = Math.PI/4;
const computerLevel = 0.3;
const speedInc = 0.5;
const speedMax = 20;
const speedInit = 7;

//create the user paddle
const user = {
    x : 0,
    y : cvs.height/2 - 100/2,
    width : 10,
    height : 100,
    color : "WHITE",
    score : 0
}

//create the com paddle
const com = {
    x : cvs.width - 10,
    y : cvs.height/2 - 100/2,
    width : 10,
    height : 100,
    color : "WHITE",
    score : 0
}

//create ball
const ball = {
    x : cvs.width/2,
    y : cvs.height/2,
    radius : 10,
    speed : speedInit,
    velocityX : speedInit,
    velocityY : speedInit,
    color : "WHITE"
}

//create the net
const net = {
    x : cvs.width/2 - 1,
    y : 0,
    width : 2,
    height : 10,
    color : "WHITE"
}

//draw rect function
function drawRect(x,y,w,h,color){
    ctx.fillStyle = color;
    ctx.fillRect(x,y,w,h);
}

//draw circle
function drawCircle(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();

    //lateral coords, radius, starting angle, stopping angle, direction
    ctx.arc(x, y, r, 0, Math.PI*2, false);
    ctx.closePath();
    ctx.fill();
}

//draw Text
function drawText(text, x, y, color){
    ctx.fillStyle = color;
    ctx.font = "45px fantasy";
    ctx.fillText(text, x, y);
}

//draw net
function drawNet() {
    for(let i = 0; i <= cvs.height; i+=15) {
        drawRect(net.x, net.y + i, net.width, net.height, net.color);
    }
}

//render the game
function render() {
    //clear canvas
    drawRect(0, 0, cvs.width, cvs.height, "BLACK");

    //draw net
    drawNet();

    //draw the score
    drawText(user.score, cvs.width/4, cvs.height/5, "WHITE");
    drawText(com.score, 3*cvs.width/4, cvs.height/5, "WHITE");

    //draw paddles
    drawRect(user.x, user.y, user.width, user.height, user.color);
    drawRect(com.x, com.y, com.width, com.height, com.color);

    //draw the ball
    drawCircle(ball.x, ball.y, ball.radius, ball.color);
}

//control user paddle
cvs.addEventListener("mousemove", movePaddle);

function movePaddle(evt) {
    let rect = cvs.getBoundingClientRect();

    user.y = evt.clientY - rect.top - user.height/2;
}

//collision detection
function collision(b, p) {
    //defining the top, bottom, left, and right sides of the ball and player for readablity
    b.top = b.y - b.radius;
    b.bottom = b.y + b.radius;
    b.left = b.x - b.radius;
    b.right = b.x + b.radius

    p.top = p.y;
    p.bottom = p.y + p.height;
    p.left = p.x;
    p.right = p.x + p.width;

    return b.right > p.left && b.bottom > p.top && b.left < p.right && p.top < p.bottom;
}

//reset ball after goal
function resetBall(b) {
    ball.x = cvs.width/2;
    ball.y = cvs.height/2;

    ball.speed = speedInit;

    //goes towards the paddle that scored
    ball.velocityX = (b) ? speedInit : -speedInit;
    ball.velocityY = speedInit;
}

//update function
function update() {
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;

    //simple AI to control the com paddle
    com.y += (ball.y - (com.y + com.height/2)) * computerLevel;

    //inverse the velY if the ball hits the top or bottom of the canvas
    if (ball.y + ball.radius >= cvs.height || ball.y - ball.radius <= 0) {
        ball.velocityY = -ball.velocityY;
    }

    //if the ball is on the left side, the user is the player. Otherwise the com is the player.
    let player = (ball.x < cvs.width/2) ? user : com;

    if (collision(ball, player)) {
        //where the ball hit the paddle
        let collidePoint = ball.y - (player.y + player.height/2);

        //normalize the collision point
        collidePoint = collidePoint/(player.height/2);

        //calculate angle
        let angleRad = collidePoint*collideMaxAngle;

        //x direction is flipped when the com paddle hits the ball
        let direction = (ball.x < cvs.width/2) ? 1 : -1;

        //change the velocity x and y
        ball.velocityX = ball.speed * Math.cos(angleRad) * direction;
        ball.velocityY = ball.speed * Math.sin(angleRad);

        //everytime the ball hits the paddle, increase speed, up to speedMax
        if (ball.speed < speedMax) {
            ball.speed += speedInc;
        }    
    }

    //update the score if ball crosses the edge
    if(ball.x - ball.radius < 0) {
        //com scores
        com.score++;
        resetBall(true);
    } else if (ball.x + ball.radius > cvs.width) {
        //user scores
        user.score++;
        resetBall(false);
    }
}

//game init
function game(){
    update();
    render();
}

//loop
const framePerSecond = 50;
setInterval(game, 1000/framePerSecond);