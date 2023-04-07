const vs = `
  attribute vec2 coord;
  
  void main(void) {
    gl_Position = vec4(coord, 0.0, 1.0);
  }  
`;

const fs = `
  uniform mediump float millisecs;
  
  void main(void) {
    mediump float osc = (sin(millisecs/1000.0) + 1.0) / 2.0;
    gl_FragColor = vec4(osc, osc, osc, 1.0);
  }
`;

var gl = document.querySelector("canvas").getContext("webgl");

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

const millisecsPtr = gl.getUniformLocation(prog, "millisecs");
const start = new Date().getTime();

window.setInterval(function() {
    gl.uniform1f(millisecsPtr, (new Date().getTime())-start);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}, 50);
