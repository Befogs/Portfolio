const vs = `
  attribute vec2 coord;
  
  void main(void) {
    gl_Position = vec4(coord, 0.0, 1.0);
  }  
`;

const fs = `
  uniform mediump vec2 points[32];
  uniform mediump float shades[32];
  uniform mediump float saturations[32];
  uniform mediump float hue;
  uniform mediump float width;
  
  mediump vec3 hsv2rgb(mediump vec3 c)
  {
      mediump vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
      mediump vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
      return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
  }
  
  void main(void) {
    mediump float d = 10000.0;
    mediump float shade;
    mediump float saturation;
    
    for (int i = 0; i < 32; i++) {
      for (mediump float j = 0.0; j < 9.0; j++) {
        mediump float nd = sqrt(pow(gl_FragCoord.x - points[i].x + mod(j, 3.0) * width - width, 2.0) + pow(gl_FragCoord.y - points[i].y + floor(j / 3.0) * 400.0 - 400.0, 2.0));
  
        if (nd < d) {
          d = nd;
          shade = shades[i];
          saturation = saturations[i];
        }
      }
    }
    
    gl_FragColor = vec4(hsv2rgb(vec3(hue, saturation, shade)), 1.0);
  }
`;

const canvas = document.querySelector("canvas")
const gl = canvas.getContext("webgl");

const vertShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertShader, vs);
gl.compileShader(vertShader);

const fragShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragShader, fs);
gl.compileShader(fragShader);

if (!gl.getShaderParameter(fragShader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(fragShader));
}

const prog = gl.createProgram();
gl.attachShader(prog, vertShader);
gl.attachShader(prog, fragShader);
gl.linkProgram(prog);
gl.useProgram(prog);

const vertBuf = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertBuf);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,1,  -1,-1,  1,-1, 1,1]), gl.STATIC_DRAW);

const coordPtr = gl.getAttribLocation(prog, "coord");
gl.vertexAttribPointer(coordPtr, 2, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(coordPtr);
gl.clearColor(1,0,0,1);

const huePtr = gl.getUniformLocation(prog, "hue");
const pointsPtr = gl.getUniformLocation(prog, "points");
const shadesPtr = gl.getUniformLocation(prog, "shades");
const saturationsPtr = gl.getUniformLocation(prog, "saturations");
const widthPtr = gl.getUniformLocation(prog, "width");
const start = new Date().getTime();
let hue = Math.random();

let lid, cid;
let lastX = 0;

function resize() {
  if (window.innerWidth == lastX) {
    return;
  }

  lastX = window.innerWidth;
  
  window.clearInterval(lid);

  canvas.width = window.innerWidth;
  gl.viewport(0, 0, canvas.width, 400);
  
  let points = [];
  let velocities = [];
  let shades = [];
  let saturations = [];
  
  for (let i = 0; i < window.innerWidth / (1920 / 32); i++) {
    points.push(Math.random() * window.innerWidth, Math.random() * 400);
    velocities.push((Math.random() - .5) / 10, (Math.random() - .5) / 10);
    shades.push(Math.random() * .5 + .5);
    saturations.push(Math.random() * .5 + .5);
  }
  
  let lastTime = new Date().getTime()
  
  cid = window.setInterval(function() {
    let newTime = new Date().getTime();
    let deltaTime = newTime - lastTime;
    
    for (let i = 0; i < 32; i++) {
      points[i * 2] = points[i * 2] + velocities[i * 2] * deltaTime;
  
      if (points[i * 2] < 0) {
        points[i * 2] += window.innerWidth;
      } else if (points[i * 2] > window.innerWidth) {
        points[i * 2] -= window.innerWidth;
      }
      
      points[i * 2 + 1] = points[i * 2 + 1] + velocities[i * 2 + 1] * deltaTime;
  
      if (points[i * 2 + 1] < 0) {
        points[i * 2 + 1] += 400;
      } else if (points[i * 2 + 1] > 400) {
        points[i * 2 + 1] -= 400;
      }
    }
    
    gl.uniform1f(huePtr, hue);
    gl.uniform2fv(pointsPtr, new Float32Array(points));
    gl.uniform1fv(shadesPtr, new Float32Array(shades));
    gl.uniform1fv(saturationsPtr, new Float32Array(saturations));
    gl.uniform1f(widthPtr, window.innerWidth);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

    hue = (hue + deltaTime / 100000) % 1;
    lastTime = newTime;
  }, 1000 / 60);

  lid = cid;
}

window.onresize = resize;

resize();
