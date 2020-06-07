
var WebGLUtils = {};

WebGLUtils.setGLContext = function(gl){
	this.gl = gl;
}

// just passes the position to the fragment shader
WebGLUtils.defaultVertexShader = `
	void main() {
  		gl_Position = vec4(position, 0, 1.0);
  	}
`;

// applies webglshader from source to target
WebGLUtils.applyShader = function(source, target, vertShaderSrc, fragShaderSrc, gl, uniforms){
	if (gl)
		this.setGLContext(gl);

	vertShaderSrc = vertShaderSrc || this.defaultVertexShader;

  	const program = this.createProgram(vertShaderSrc, fragShaderSrc); 
  	this.setImageProcessingGeometry(program);
  	this.setUniforms(program, uniforms);
  	this.prepareSourceImage(source);

  	this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
}

WebGLUtils.resizeAndClear = function(){
	this.gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
	this.gl.clearColor(1.0, 0.8, 0.1, 1.0);
	this.gl.clear(this.gl.COLOR_BUFFER_BIT);
}

// 'private' methods

WebGLUtils.createShader = function(source, type){
	const shader = this.gl.createShader(type);
  	this.gl.shaderSource(shader, source);
  	this.gl.compileShader(shader);
  	this.compileLog = this.gl.getShaderInfoLog(shader);
  	return shader;
}
	
WebGLUtils.createProgram = function(vertShaderSrc, fragShaderSrc){
	const vertShader = this.createShader(vertShaderSrc, this.gl.VERTEX_SHADER);
	const fragShader = this.createShader(fragShaderSrc, this.gl.FRAGMENT_SHADER);

	const program = this.gl.createProgram();
  	this.gl.attachShader(program, vertShader);
  	this.gl.attachShader(program, fragShader);
  	this.gl.linkProgram(program);
  	this.gl.useProgram(program);

  	return program;
}

// creates minimum geometry to use webgl
WebGLUtils.setImageProcessingGeometry = function(program){
	  const vertices = new Float32Array([
    	-1, -1,
    	-1, 1,
    	1, 1,

    	-1, -1,
    	1, 1,
    	1, -1,
  	]);

  	const vertexBuffer = this.gl.createBuffer();
  	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);
  	this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);

  	const positionLocation = this.gl.getAttribLocation(program, 'position');
  	this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);
  	this.gl.enableVertexAttribArray(positionLocation);
}

WebGLUtils.prepareSourceImage = function(image){
  	const texture = this.gl.createTexture();
  	this.gl.activeTexture(this.gl.TEXTURE0);
  	this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
  	this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);

  	this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
  	this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
  	this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
  	this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
}

WebGLUtils.setUniforms = function(program, uniforms){
	uniforms.map((u) => this.setUniform(program, u.type, u.name, u.value));
}

WebGLUtils.setUniform = function(program, type, name, value) {
	var location = this.gl.getUniformLocation(program, name);

	switch (type){
		case this.gl.FLOAT:
			this.gl.uniform1f(location, value);
			break;
		case this.gl.FLOAT_VEC2:
			this.gl.uniform2fv(location, value);
			break;
	}
}
