
function Wgl (gl) {
	var vxbQuad;
	var vxbStrip;

	// just passes the position to the fragment shader
	var defaultVertShdr = `
		void main() {
			gl_Position = vec4(position, 0, 1.0);
		}
	`;

	// applies webglshader from source to target
	this.applyShader = function (source, target, vertShdr, fragShdr, gl, uniforms) {
		let prog = this.createProgram (vertShdr, fragShdr); 
		this.setImageProcessingGeometry (prog);
		this.setUniforms (prog, uniforms);
		this.prepareSourceImage (source);
	}

	this.resizeAndClear = function () {
		gl.viewport (0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
		gl.clearColor (1.0, 0.8, 0.1, 1.0);
		gl.clear (gl.COLOR_BUFFER_BIT);
	}

	// 'private' methods

	function createShader (src, type) {
		let shader = gl.createShader (type);
		gl.shaderSource (shader, src);
		gl.compileShader (shader);
		var log = gl.getShaderInfoLog (shader);

		if (log.length) {
			console.log (log);
		}

		return shader;
	}
		
	this.createProgram = function (vertShdr, fragShdr) {
		vertShdr = vertShdr || defaultVertShdr;
		let vsh = createShader (vertShdr, gl.VERTEX_SHADER);
		let fsh = createShader (fragShdr, gl.FRAGMENT_SHADER);
		let prog = gl.createProgram ();

		gl.attachShader (prog, vsh);
		gl.attachShader (prog, fsh);
		gl.linkProgram (prog);

		var log = gl.getProgramInfoLog (prog);

		if (log.length) {
			console.log (log);
		}

		return prog;
	}

	this.resize = function (w, h) {
		gl.viewport (0, 0, w, h);
	}
	
	this.setProgram = function (prog) {
		gl.useProgram (prog);
	}

	function setAttribute (prog, type, name) {
		let loc = gl.getAttribLocation (prog, name);

		if (loc != -1) {
			switch (type) {
				case gl.FLOAT:
					gl.vertexAttribPointer (loc, 1, gl.FLOAT, false, 0, 0);
					break;

				case gl.FLOAT_VEC2:
					gl.vertexAttribPointer (loc, 2, gl.FLOAT, false, 0, 0);
					break;
			}

			gl.enableVertexAttribArray (loc);
		}
		else console.log ("Attribute " + name + " not found");
	}

	// creates minimum geometry to use webgl
	this.buildQuad = function () {
		let verts = new Float32Array ([
			0, 0, 0, 1, 1, 1,
			0, 0, 1, 1, 1, 0,
		]);

		vxbQuad = gl.createBuffer ();
		gl.bindBuffer (gl.ARRAY_BUFFER, vxbQuad);
		gl.bufferData (gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
	}

	this.drawQuad = function () {
		gl.bindBuffer (gl.ARRAY_BUFFER, vxbQuad);
		setAttribute (prog, gl.FLOAT_VEC2, 'position');
		gl.drawArrays (gl.TRIANGLES, 0, 6);
	}

	this.buildStrip = function (num) {
		let step = 1 / num;
		let verts = new Float32Array ();

		for (var idx = 0; idx < num; ++idx) {
			verts.push (0, step * idx, 1, step * idx);
		}

		vxbStrip = gl.createBuffer ();
		gl.bindBuffer (gl.ARRAY_BUFFER, vxbStrip);
		gl.bufferData (gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
	}

	this.drawStrip = function (num) {
		gl.bindBuffer (gl.ARRAY_BUFFER, vxbStrip);
		setAttribute (prog, gl.FLOAT_VEC2, 'position');
		gl.drawArrays (gl.TRIANGLE_STRIP, 0, num << 1);
	}

	this.createImageTexture = function (image) {
		let tex = gl.createTexture ();
		gl.bindTexture (gl.TEXTURE_2D, tex);
		gl.texParameteri (gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri (gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri (gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri (gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texImage2D (gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
		return tex;
	}

	function setUniform (prog, type, name, value) {
		var loc = gl.getUniformLocation (prog, name);

		if (loc != -1) {
			switch (type) {
				case gl.FLOAT:
					if (value instanceof Array) {
						gl.uniform1fv (loc, value);
					}
					else gl.uniform1f (loc, value);

					break;

				case gl.FLOAT_VEC2:
					gl.uniform2fv (loc, value);
					break;

				case gl.TEXTURE0:
					gl.activeTexture (gl.TEXTURE0);
					gl.bindTexture (gl.TEXTURE_2D, value);
					gl.uniform1i (loc, 0);
					break;

				case gl.TEXTURE1:
					gl.activeTexture (gl.TEXTURE1);
					gl.bindTexture (gl.TEXTURE_2D, value);
					gl.uniform1i (loc, 1);
					break;
			}
		}
		else console.log ("Uniform " + name + " not found");
	}

	this.setUniforms = function (prog, uniforms) {
		Object.keys (uniforms).forEach (function (key) {
			setUniform (prog, uniforms[key].type, key, uniforms[key].value);
		});
	}
}
