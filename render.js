const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let updateInterval;
let frames = 0;

function init() {
    frames = 0;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (updateInterval != null) {
        window.clearInterval(updateInterval);
    }
    
    let resX = window.innerWidth;
    let resY = window.innerHeight;

    ctx.canvas.width  = resX;
    ctx.canvas.height = resY;

    canvas.style.width = resX;
    canvas.style.height = resY;

    let maskX = resX / 2;

    if (resY / 2 / 277 * 1756 < maskX) {
        maskX = resY / 2 / 277 * 1756;
    }

    let maskY = Math.round(maskX / 1756 * 277)
    maskX = Math.round(maskX);

    let maskLB = resX / 2 - maskX / 2;
    let maskRB = resX / 2 + maskX / 2;
    let maskTB = resY / 2 + maskY / 2;
    let maskBB = resY / 2 - maskY / 2;

    let particleCount = Math.round(resX * resY / 500)

    noise.seed(Math.random());

    let flowfield = []
    
    for (let x = 0; x < resX; x++) {
        for (let y = 0; y < resY; y++) {
            let rad = noise.perlin2(x / 128, y / 128) * Math.PI;
            let vx = Math.cos(rad);
            let vy = Math.sin(rad);
            flowfield.push([vx, vy]);
            /*ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + vx * 10, y + vy * 10);
            ctx.strokeStyle = "#ffffff";
            ctx.globalAlpha = 0;
            ctx.stroke();*/
        }
    }

    noise.seed(Math.random());

    let maskOffset = []
    
    for (let x = 0; x < resX; x++) {
        for (let y = 0; y < resY; y++) {
            maskOffset.push([noise.perlin2(x / 24, y / 24) * 8, noise.perlin2(x / 24, y / 24) * 12]);
        }
    }
    
    let particles = [];
    
    for (let i = 0; i < particleCount; i++) {
        particles.push([Math.random() * resX, Math.random() * resY]);
    }
    
    updateInterval = window.setInterval(function() {
        for (let i = 0; i < particleCount; i++) {
            let particle = particles[i];
            let nx = Math.round(particle[0]);
            let ny = Math.round(particle[1]);
    
            if (nx < 0 || nx >= resX || ny < 0 || ny >= resY) {
                particles[i] = [Math.random() * resX, Math.random() * resY];
                continue;
            }
            
            let flow = flowfield[nx * resY + ny];
            let newPos = [particle[0] + flow[0] * 2, particle[1] + flow[1] * 2, particle[2]];
    
            ctx.beginPath();
            ctx.moveTo(particle[0], particle[1]);
            ctx.lineTo(newPos[0], newPos[1]);

            let mpx = newPos[0] + maskOffset[nx * resY + ny][0];
            let mpy = newPos[1] + maskOffset[nx * resY + ny][1];

            if (mpx < maskLB || mpx > maskRB || mpy < maskBB || mpy > maskTB) {
                if (newPos[2] == true && Math.random() < .2) {
                    newPos[2] = false;
                }
            } else {
                let ix = Math.round((mpx - maskLB) / maskX * 1756);
                let iy = Math.round((mpy - maskBB) / maskY * 277);
                let masked = mask[ix * 277 + iy];

                if (masked == true) {
                    newPos[2] = true;
                } else {
                    if (Math.random() < .2) {
                        newPos[2] = false;
                    }
                }
            }
            ctx.strokeStyle = newPos[2] == true ? "#7F00FF" : "#3F00FF";
            ctx.globalAlpha = newPos[2] == true ? .5 : .05;
            ctx.stroke();
    
            particles[i] = newPos;
        }

        frames++;

        if (frames == 15000) {
            init();
        }
    }, 1000 / 60);
}

addEventListener("resize", init);

init()
