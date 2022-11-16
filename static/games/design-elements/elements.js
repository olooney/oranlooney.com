function init() { 
    canvas = document.getElementById("myCanvas"); 
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    context = canvas.getContext("2d");
}   

function clear() {
    context.clearRect(0, 0, canvas.width, canvas.height);
}

function line(x, y, x2, y2, color) {
    context.strokeStyle = color;
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x2, y2);
    context.filter = 'blur(1.5px)';
    context.stroke();
    context.filter = 'blur(0.5px)';
    context.stroke();
}

function circle(x, y, r, color) {
    context.fillStyle = color;
    context.beginPath();
    context.arc(x, y, r, 0, 2*Math.PI, false);
    context.filter = 'blur(0.5px)';
    context.fill();
}

function hexagon(x, y, r, color, r2) {
    context.strokeStyle = color;
    context.beginPath();
    context.moveTo(x, y - r);
    for (i=1; i<7; i++ ) {
        x2 = x + r * Math.sin(Math.PI*i/3);
        y2 = y - r * Math.cos(Math.PI*i/3);
        context.lineTo(x2, y2);
    }
    context.filter = 'blur(0.25px)';
    context.stroke();

    if ( r2 ) {
        for (i=0; i<6; i++ ) {
            x2 = x + r * Math.sin(Math.PI*i/3);
            y2 = y - r * Math.cos(Math.PI*i/3);
            circle(x2, y2, r2 * ( 1 + 0.25 * ((i+1)%2)), color);
        }
    }
}

function sineWave(x, y, amplitude, period, phase, n, step, width, alphaWidth, color) {
    context.beginPath();
    context.moveTo(x, y + amplitude * Math.sin(phase) * Math.exp(-n*step/(2*width)));
    context.strokeStyle = color;
    context.filter = 'blur(0.25px)';

    for ( let i=1; i<n; i++ ) {
        let point = [ 
            x + i * step, 
            y + amplitude * Math.sin(2 * Math.PI * i * step / period + phase) * Math.exp(-Math.abs(i-n/2)*step/width)
        ];
        context.lineTo(...point);
        if ( i % 50 === 0 ) {
            context.globalAlpha = 0.8 * Math.exp(-Math.abs((i-25)-n/2)*step/alphaWidth);
            context.stroke();
            context.beginPath();
            context.moveTo(...point);
        }
    }

    context.stroke();
}

function isometric(x, y, z) {
    return [
        70 + 18*x - 22*y,
        90 - 12*x - 9*y - 22*z
    ];
}

function isosquare(x, y, z, e, color) {
    context.strokeStyle = color;
    context.beginPath();
    context.moveTo(...isometric(x - e, y - e, z));
    context.lineTo(...isometric(x - e, y + e, z));
    context.lineTo(...isometric(x + e, y + e, z));
    context.lineTo(...isometric(x + e, y - e, z));
    context.closePath();

    context.strokeStyle = color;
    context.filter = 'blur(0.5px)';
    context.stroke();

    let ga = context.globalAlpha;
    context.globalAlpha = context.globalAlpha/2;
    context.fillStyle = color;
    context.fill();
    context.globalAlpha = ga;
}

function isocube(x, y, z, e, color) {
    context.strokeStyle = color;
    context.beginPath();
    context.moveTo(...isometric(x - e, y - e, z - e));
    context.lineTo(...isometric(x - e, y + e, z - e));
    context.lineTo(...isometric(x + e, y + e, z - e));
    context.lineTo(...isometric(x + e, y - e, z - e));
    context.lineTo(...isometric(x - e, y - e, z - e));

    context.lineTo(...isometric(x - e, y - e, z + e));
    context.lineTo(...isometric(x - e, y + e, z + e));
    context.lineTo(...isometric(x + e, y + e, z + e));
    context.lineTo(...isometric(x + e, y - e, z + e));
    context.lineTo(...isometric(x - e, y - e, z + e));

    context.moveTo(...isometric(x - e, y + e, z - e));
    context.lineTo(...isometric(x - e, y + e, z + e));

    context.moveTo(...isometric(x + e, y + e, z - e));
    context.lineTo(...isometric(x + e, y + e, z + e));

    context.moveTo(...isometric(x + e, y - e, z - e));
    context.lineTo(...isometric(x + e, y - e, z + e));

    context.filter = 'blur(0.5px)';
    context.stroke();

    circle(...isometric(x - e, y - e, z - e), 2, color);
    circle(...isometric(x - e, y + e, z - e), 2, color);
    circle(...isometric(x + e, y + e, z - e), 2, color);
    circle(...isometric(x + e, y - e, z - e), 2, color);
    circle(...isometric(x - e, y - e, z + e), 2, color);
    circle(...isometric(x - e, y + e, z + e), 2, color);
    circle(...isometric(x + e, y + e, z + e), 2, color);
    circle(...isometric(x + e, y - e, z + e), 2, color);
}	

function banner() {
    context.font = "50px Verdana";
    context.letterSpacing = '25px';
    var gradient = context.createLinearGradient(canvas.width/2 - 800, 0, canvas.width/2 + 800, 100);
    gradient.addColorStop(0, hexcolor(50, 50 + 0*13, 250-0*13))
    gradient.addColorStop(1, hexcolor(50, 50 + 9*13, 250-9*13))
    context.fillStyle = gradient;
    context.textAlign = 'center';
    context.fillText("Design Elements", canvas.width/2, 75);
}


function draw() { 
    // strings
    context.globalAlpha = 0.5;
    for ( let i=0; i<10; i++ ) {
        color = hexcolor(50, 50 + (10-i)*13, 250-(10-i)*13);
        line(canvas.width - 50 + 20*Math.sin(0.01*frameIndex) - i*25, 0, canvas.width, canvas.height - i*40 - 100 + 20*Math.sin(0.01*frameIndex), color);
    }

    context.globalAlpha = 0.8;
    hexagon(55 + 5*Math.cos(0.01*frameIndex), canvas.height + 5*Math.sin(0.01*frameIndex) - 95, 50, hexcolor(50, 50 + 5*13, 250-5*13), 2.5);
    hexagon(63 + 2*Math.cos(0.015*frameIndex+5), canvas.height + 2*Math.sin(0.015*frameIndex+1) - 45, 30, hexcolor(50, 50 + 2*13, 250-2*13), 2.5);
    hexagon(90 + 5*Math.cos(0.01*frameIndex+7), canvas.height + 5*Math.sin(0.01*frameIndex+2) - 115, 40, hexcolor(50, 50 + 7*13, 250-7*13), 2);
    hexagon(145 + 6*Math.cos(0.015*frameIndex+4), canvas.height + 6*Math.sin(0.015*frameIndex+3) - 80, 35, hexcolor(50, 50 + 8*13, 250-8*13), 2);
    hexagon(190 + 4*Math.cos(0.015*frameIndex+1), canvas.height + 4*Math.sin(0.015*frameIndex+4) - 35, 15, hexcolor(50, 50 + 3*13, 250-3*13), 1.5);
    hexagon(40 + 5*Math.cos(0.015*frameIndex+2), canvas.height + 5*Math.sin(0.015*frameIndex+5) - 185, 20, hexcolor(50, 50 + 4*13, 250-4*13), 1.5);
    hexagon(18 + 3*Math.cos(0.015*frameIndex+3), canvas.height + 3*Math.sin(0.015*frameIndex+6) - 172, 13, hexcolor(50, 50 + 0*13, 250-0*13), 1);
    hexagon(95 + 5*Math.cos(0.015*frameIndex+6), canvas.height + 5*Math.sin(0.015*frameIndex+7) - 30, 20, hexcolor(50, 50 + 8*13, 250-8*13), 1.5);

    context.globalAlpha = 0.5;
    for ( let i=0; i<5; i++ ) {
        isosquare(0, 0, i * (0.5 + 0.05*Math.sin(0.03*frameIndex)), 1, hexcolor(50, 50 + (i+3)*13, 250-(i+3)*13));
    }
    isocube(0, 0, 1, 1.2, hexcolor(50, 50 + 7*13, 250-7*13));

    for ( let i=0; i<5; i++ ) {
        sineWave(
            0,
            canvas.height - 75,
            50 + 5*i,
            300,
            2 * Math.pow(i, 2.17) * Math.PI/6 - 0.003*frameIndex*(8-i),
            Math.ceil(canvas.width)+1,
            1,
            500 - i*40,
            400,
            hexcolor(50, 50 + (i*2)*13, 250-(i*2)*13)
        );
    }

    context.globalAlpha = 0.5;
    banner();
}


function hex(d) {
    var hex = d.toString(16);
    while (hex.length < 2) hex = "0" + hex;
    return hex;
}

function hexcolor(r, g, b) {
    return '#' + hex(r, 2) + hex(g, 2) + hex(b, 2);
}


requestAnimFrame = (function(callback) {
    return window.requestAnimationFrame || 
        window.webkitRequestAnimationFrame || 
        window.mozRequestAnimationFrame || 
        window.oRequestAnimationFrame || 
        window.msRequestAnimationFrame ||
        function(callback) { window.setTimeout(callback, 1000 / 60); };
})();

frameIndex = 0;
function mainLoop() {
    frameIndex++;	
    if ( frameIndex % 2 ) {
        clear();
        draw(frameIndex);
    }
    requestAnimFrame(mainLoop);
}

$(document).ready(function() {
    init();
    mainLoop();
});
$(window).resize(function() {
    init();
});	

