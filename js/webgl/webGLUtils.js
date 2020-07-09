
var wgl = {};

wgl.setContext = function (gl) {
	this.gl = gl;
}

// just passes the position to the fragment shader
wgl.defaultVertexShader = `
	void main() {
		gl_Position = vec4(position, 0, 1.0);
	}
`;

// applies webglshader from source to target
wgl.applyShader = function (source, target, vertShdr, fragShdr, gl, uniforms) {
	if (gl) this.setGLContext (gl);

	vertShaderSrc = vertShaderSrc || this.defaultVertexShader;

	const prog = this.createProgram (vertShdr, fragShdr); 
	this.setImageProcessingGeometry (prog);
	this.setUniforms (program, uniforms);
	this.prepareSourceImage (source);

	this.gl.drawArrays (this.gl.TRIANGLES, 0, 6);
}

wgl.resizeAndClear = function () {
	this.gl.viewport (0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
	this.gl.clearColor (1.0, 0.8, 0.1, 1.0);
	this.gl.clear (this.gl.COLOR_BUFFER_BIT);
}

// 'private' methods

wgl.createShader = function (src, type) {
	const shader = this.gl.createShader (type);
	this.gl.shaderSource (shader, src);
	this.gl.compileShader (shader);
	this.compileLog = this.gl.getShaderInfoLog (shader);
	return shader;
}
	
wgl.createProgram = function (vertShdr, fragShdr) {
	const vsh = this.createShader (vertShdr, this.gl.VERTEX_SHADER);
	const fsh = this.createShader (fragShdr, this.gl.FRAGMENT_SHADER);

	const program = this.gl.createProgram ();
	this.gl.attachShader (program, vsh);
	this.gl.attachShader (program, fsh);
	this.gl.linkProgram (program);
	this.gl.useProgram (program);

	return program;
}

// creates minimum geometry to use webgl
wgl.setImageProcessingGeometry = function (program) {
	  const verts = new Float32Array ([
		-1, -1, -1, 1, 1, 1,
		-1, -1, 1, 1, 1, -1,
	]);

	const vxb = this.gl.createBuffer ();
	this.gl.bindBuffer (this.gl.ARRAY_BUFFER, vxb);
	this.gl.bufferData (this.gl.ARRAY_BUFFER, verts, this.gl.STATIC_DRAW);

	const positionLocation = this.gl.getAttribLocation (program, 'position');
	this.gl.vertexAttribPointer (positionLocation, 2, this.gl.FLOAT, false, 0, 0);
	this.gl.enableVertexAttribArray (positionLocation);
}

wgl.createImageTexture = function (image) {
	const texture = this.gl.createTexture ();
	this.gl.activeTexture (this.gl.TEXTURE0);
	this.gl.bindTexture (this.gl.TEXTURE_2D, texture);
	this.gl.texImage2D (this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);

	this.gl.texParameteri (this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
	this.gl.texParameteri (this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
	this.gl.texParameteri (this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
	this.gl.texParameteri (this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
}

wgl.setUniform = function (program, type, name, value) {
	var location = this.gl.getUniformLocation (program, name);

	if (location) {
		switch (type) {
			case this.gl.FLOAT:
				if (value instanceof Array) {
					this.gl.uniform1fv (location, value);
				}
				else this.gl.uniform1f (location, value);

				break;

			case this.gl.FLOAT_VEC2:
				this.gl.uniform2fv (location, value);
				break;
		}
	}
	else console.log ("Uniform " + name + " not found");
}

wgl.setUniforms = function (prog, uniforms) {
	Object.keys (uniforms).forEach (function (key) {
		this.setUniform (prog, uniforms[key].type, key, uniforms[key].value);
	});
}

