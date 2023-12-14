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

    let particleCount = Math.max(Math.round(resX * resY / 500), 1);

    noise.seed(Math.random());

    let flowfield = []
    
    for (let x = 0; x < resX; x++) {
        for (let y = 0; y < resY; y++) {
            let rad = noise.perlin2(x / 384, y / 384) * 2;
            flowfield.push(rad)
        }
    }

    noise.seed(Math.random());

    for (let x = 0; x < resX; x++) {
        for (let y = 0; y < resY; y++) {
            let i = x * resY + y;
            let rad = Math.PI * (noise.perlin2(x / 192, y / 192) + flowfield[i]);
            let vx = Math.cos(rad);
            let vy = Math.sin(rad);
            flowfield[i] = [vx, vy];
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
    let particles2 = [];
    
    for (let i = 0; i < particleCount; i++) {
        particles.push([Math.random() * resX, Math.random() * resY, 0, 0]);
    }

    for (let i = 0; i < particleCount; i++) {
        particles2.push([Math.random() * resX, Math.random() * resY, 0, 0]);
    }
    
    updateInterval = window.setInterval(function() { 
        for (let i = 0; i < particleCount; i++) {
            let particle = particles[i];
            let nx = Math.round(particle[0]);
            let ny = Math.round(particle[1]);
    
            if (nx < 0 || nx >= resX || ny < 0 || ny >= resY) {
                particles[i] = [Math.random() * resX, Math.random() * resY, 0, 0];
                continue;
            }
            
            let flow = flowfield[nx * resY + ny];
            let nvx = particle[2] + flow[0];
            let nvy = particle[3] + flow[1];
            let magnitude = Math.sqrt(nvx * nvx + nvy * nvy);
            nvx /= magnitude;
            nvy /= magnitude;
            
            let newPos = [particle[0] + nvx, particle[1] + nvy, nvx, nvy, particle[4]];
    
            ctx.beginPath();
            ctx.moveTo(particle[0], particle[1]);
            ctx.lineTo(newPos[0], newPos[1]);

            let mpx = newPos[0] + maskOffset[nx * resY + ny][0];
            let mpy = newPos[1] + maskOffset[nx * resY + ny][1];

            if (mpx < maskLB || mpx > maskRB || mpy < maskBB || mpy > maskTB) {
                if (newPos[4] == true && Math.random() < .2) {
                    newPos[4] = false;
                }
            } else {
                let ix = Math.round((mpx - maskLB) / maskX * 1756);
                let iy = Math.round((mpy - maskBB) / maskY * 277);
                let masked = mask[ix * 277 + iy];

                if (masked == true) {
                    newPos[4] = true;
                } else {
                    if (Math.random() < .2) {
                        newPos[4] = false;
                    }
                }
            }
            ctx.strokeStyle = newPos[4] == true ? "#7F00FF" : "#3F00FF";
            ctx.globalAlpha = newPos[4] == true ? .5 : .05;
            ctx.stroke();
    
            particles[i] = newPos;
        }

        for (let i = 0; i < particleCount; i++) {
            let particle = particles2[i];
            let nx = Math.round(particle[0]);
            let ny = Math.round(particle[1]);
    
            if (nx < 0 || nx >= resX || ny < 0 || ny >= resY) {
                particles2[i] = [Math.random() * resX, Math.random() * resY, 0, 0];
                continue;
            }
            
            let flow = flowfield[nx * resY + ny];
            let nvx = particle[2] - flow[0];
            let nvy = particle[3] - flow[1];
            let magnitude = Math.sqrt(nvx * nvx + nvy * nvy);
            nvx /= magnitude;
            nvy /= magnitude;
            
            let newPos = [particle[0] + nvx, particle[1] + nvy, nvx, nvy, particle[4]];
    
            ctx.beginPath();
            ctx.moveTo(particle[0], particle[1]);
            ctx.lineTo(newPos[0], newPos[1]);

            let mpx = newPos[0] + maskOffset[nx * resY + ny][0];
            let mpy = newPos[1] + maskOffset[nx * resY + ny][1];

            if (mpx < maskLB || mpx > maskRB || mpy < maskBB || mpy > maskTB) {
                if (newPos[4] == true && Math.random() < .2) {
                    newPos[4] = false;
                }
            } else {
                let ix = Math.round((mpx - maskLB) / maskX * 1756);
                let iy = Math.round((mpy - maskBB) / maskY * 277);
                let masked = mask[ix * 277 + iy];

                if (masked == true) {
                    newPos[4] = true;
                } else {
                    if (Math.random() < .2) {
                        newPos[4] = false;
                    }
                }
            }
            ctx.strokeStyle = newPos[4] == true ? "#BBBBBB" : "#FFFFFF";
            ctx.globalAlpha = newPos[4] == true ? .5 : .05;
            ctx.stroke();
    
            particles2[i] = newPos;
        }

        frames++;

        if (frames == 8196) {
            init();
        }
    }, 1000 / 60);
}

addEventListener("resize", init);

init()
