
let Site = {};
Site.StateEnum = { PRELOADER: 1, FRONT_SCREEN: 2, CONTENT_SCREEN: 3};
Site.bannerCanvas = null;
Site.offscreenCanvas = null;
Site.offscreenContext = null;
Site.state = Site.StateEnum.FRONT_SCREEN; // todo change to preloader
Site.mousePosition = { x: -1000, y: -1000 };
Site.mouseDown = false;
Site.distortIntensity = 0.5;

Site.bannerCamera = { x: 0, y: 0 };
Site.bannerFolder = "resources/images/topbanner/";
Site.bannerImages = [ { src: "designkk_kayako_kobayashi_aesthete03.png" }, { src: "designkk_kayako_kobayashi_aesthete09.png" }, { src: "designkk_kayako_kobayashi_beauty-8.png" }];

Site.initialize = function(){
	this.initializeBanner();
	this.setEvents();
	this.requestLoop();
}

Site.requestLoop = function(){
	requestAnimationFrame((timestamp) => this.loop(timestamp));
}

Site.loop = function(timestamp){
	this.renderBanner(timestamp);
	this.requestLoop();
}

Site.initializeBanner = function(){
	this.bannerCanvas = document.getElementById('top-banner-canvas');
	this.offscreenCanvas = document.createElement('canvas');
	this.offscreenContext = this.offscreenCanvas.getContext('2d');

	// initializeImage positions
	let x = -this.bannerImages[0].image.width;
	for (let i = 0; i < this.bannerImages.length; i++){
		this.bannerImages[i].x = x;
		x += this.bannerImages[i].image.width;
	}
}

Site.setCanvasSize = function(argument) {
	this.offscreenCanvas.width = window.innerWidth;
	this.offscreenCanvas.height = window.innerHeight;

	this.bannerCanvas.width = window.innerWidth;
	this.bannerCanvas.height = window.innerHeight;
}

Site.render2DCanvas = function(){
	for (let i = 0; i < this.bannerImages.length; i++){
		let bimg = this.bannerImages[i];
		let dimensions = Utils.resizeImage(bimg.image, this.offscreenCanvas.width, this.offscreenCanvas.height, true);
		this.offscreenContext.drawImage(bimg.image, bimg.x + this.bannerCamera.x, 0, dimensions.width, dimensions.height);
	}
}

Site.getBannerWebGLShader = function(){
	const vertShaderSource = `
    	attribute vec2 position;
    	varying vec2 texCoords;
    	void main() {
      		texCoords = (position + 1.0) / 2.0;
      		texCoords.y = 1.0 - texCoords.y;

      		gl_Position = vec4(position, 0, 1.0);
      	}
	`;

	const fragShaderSource = `
    	precision highp float;
    	varying vec2 texCoords;
    	uniform sampler2D uTexture;

    	uniform vec2 distorts[3];
    	uniform float disttest;
    	uniform float intensity;

    	vec4 blur(sampler2D uTexture, vec2 vUV){
      		vec2 offs_blur = vec2(0.005, 0.005);
      		vec4 color = texture2D(uTexture, vUV + vec2(         0.0,          0.0))*0.25;   

			color += texture2D(uTexture, vUV + vec2(-offs_blur.x, -offs_blur.y))*0.0625;
			color += texture2D(uTexture, vUV + vec2(         0.0, -offs_blur.y))*0.125;  
			color += texture2D(uTexture, vUV + vec2( offs_blur.x, -offs_blur.y))*0.0625;

			color += texture2D(uTexture, vUV + vec2(-offs_blur.x,          0.0))*0.125;
			color += texture2D(uTexture, vUV + vec2( offs_blur.x,          0.0))*0.125;  

			color += texture2D(uTexture, vUV + vec2(-offs_blur.x, offs_blur.y))*0.0625;
			color += texture2D(uTexture, vUV + vec2(         0.0, offs_blur.y))*0.125;   
			color += texture2D(uTexture, vUV + vec2( offs_blur.x, offs_blur.y))*0.0625; 

      		return color;
    	}

    	vec4 displace(sampler2D uTexture, vec2 vUV, float dst, float intensity){
    		vUV.x += dst * intensity;
    		vec4 color = texture2D(uTexture, vUV);
    		return color;
    	}

    	void main() {
    		vec4 color = texture2D(uTexture, texCoords);

    		for (int i = 0; i < 3; i++){
				float dist = distance(distorts[i], texCoords);
	    		if (dist < disttest){
	    			color = displace(uTexture, texCoords, disttest - dist, intensity);
	    			/*
		      		float warmth = 0.4;
		      		float brightness = 0.0;
		      		color.r += warmth;
		      		color.b -= warmth;
		      		color.rgb += brightness;
		      		*/
	    		}else{
					//color = blur(uTexture, texCoords);
	    		}
    		}

    		
		
      		gl_FragColor = color;
		}
  	`;

  	return { vert: vertShaderSource, frag: fragShaderSource };
}

Site.renderBanner = function(timestamp){
	this.distortIntensity = 0.4 * Math.sin(timestamp / 2000);
	this.setCanvasSize();
	this.render2DCanvas();
 
  	const gl = this.bannerCanvas.getContext('webgl');
 	WebGLUtils.setGLContext(gl);	
 	WebGLUtils.resizeAndClear();

	let shaders = this.getBannerWebGLShader();	

  	WebGLUtils.applyShader(this.offscreenCanvas, this.bannerCanvas, 
  		shaders.vert, shaders.frag, gl, 
  		[{ type: gl.FLOAT_VEC2, name: "distorts", value: [0.5, 0.5, 0.2, 0.2, 0.4, 0.9]}, { type: gl.FLOAT, name: "disttest", value: 0.1 }, 
  		{ type: gl.FLOAT, name: "intensity", value: this.distortIntensity }]);
}

Site.captureMousePosition = function(event){
	this.mousePosition.x = event.clientX;
	this.mousePosition.y = event.clientY;
}

Site.onmousemove = function(event){
	let oldX = this.mousePosition.x;
	this.captureMousePosition(event);
	if (this.mouseDown){
		let deltaX = this.mousePosition.x - oldX;
		this.bannerCamera.x += deltaX;
	}
}

Site.onmouseup = function(event){
	this.captureMousePosition(event);
	this.mouseDown = false;
}

Site.onmousedown = function(event){
	this.captureMousePosition(event);
	this.mouseDown = true;
}

Site.onmousewheel = function(event){

}

Site.onclick = function(event){

}

Site.setEvents = function(){
    document.addEventListener("mousemove", (event) => this.onmousemove(event));
    document.addEventListener("mouseup", (event) => this.onmouseup(event));
    document.addEventListener("mousedown", (event) => this.onmousedown(event));

	document.addEventListener("mousewheel", (event) => this.onmousewheel(event), {passive: false});

    document.addEventListener("click", (event) => this.onclick(event));

	//document.addEventListener("keydown", (event) => this.onkeydown(event));
    //document.addEventListener("keyup", (event) => this.onkeyup(event));
}

Site.loadBannerImages = function(){
	let promises = [];
	for (let i = 0; i < this.bannerImages.length; i++){
		this.bannerImages[i].image = new Image();		
		this.bannerImages[i].image.src = this.bannerFolder + this.bannerImages[i].src;
		let p = new Promise((resolve, reject) => {
			this.bannerImages[i].image.onload = resolve;
		});
		promises.push(p);
	}
	return Promise.all(promises);
}

Site.loadData = function(){
	let lbp = this.loadBannerImages();
	Promise.all([lbp]).then(() => {
		Preloader.clear();
		this.initialize();
	});
}

Site.loadData();
