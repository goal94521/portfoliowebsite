
let Site = {
	StateEnum: { PRELOADER: 1, FRONT_SCREEN: 2, CONTENT_SCREEN: 3},
	BannerStateEnum: { WAIT_MOVE: 0, STEADY: 1, DRAGGING: 2, MOVING_NEXT: 3, IMAGE_PREVIEW: 4, IMAGE_PREVIEW_TRANSITION: 5 },
	bannerCanvas: null,
	bannerContext: null,
	webGLCanvas: null,
	offscreenCanvas: null,
	offscreenContext: null,
	currentContent: null,
	mousePosition: { x: -1000, y: -1000 },
	mouseDown: false,
	dragged: false,
	distortIntensity: 0,
	MIN_DISTORT_INTENSITY: 0,
	MAX_DISTORT_INTENSITY: 1,
	maxDistortions: 6,
	distortions: [],
	bannerTween: null,
	bannerState: 0,
	SNAP_TIME: 1.2,
	SNAP_TIME_PREVIEW: 2,
	WHEEL_ANIM_INCREASE: 0.15,
	WHEEL_ANIM_TIME: 0.35,
	WHEEL_ANIM_CAP_TIME: 1,
	targetBannerWheel: 0,
	lastSnappedImage: null,
	zoom: 1,
	zoomTarget: 1,
	zoomTween: false,
	MIN_ZOOM: 1,
	MAX_ZOOM: 1.05,
	imagePreviewShear: 0,
	imagePreviewTargetShear: 0,
	imagePreviewShearAmount: 0.4,
	time: 0,
	lastTimestamp: 0
};

Site.state = Site.StateEnum.FRONT_SCREEN; // todo change to preloader

// base rotation offset is 
Site.wordRotationOffset	= Math.PI * 1.5; // 
Site.wordRotationSpeed = 1 / 2600;
Site.wordRotation = 0;

Site.bannerCamera = { x: 0, y: 0 };
Site.bannerFolder = "resources/images/topbanner/";

Site.bannerImages = [ 
	{ src: "top_banner_1.png", number: "01", label: "EDITORIAL", contentId: "editorial-content" }, 
	{ src: "top_banner_2.png", number: "02", label: "E.COMM", contentId: "ecommerce-content" }, 
	{ src: "top_banner_3.png", number: "03", label: "AGENCY", contentId: "agency-content" }, 
	{ src: "top_banner_4.png", number: "04", label: "JEWELRY", contentId: "jewelry-content" }, 
	{ src: "top_banner_5.png", number: "05", label: "BEAUTY", contentId: "beauty-content" },
	{ src: "top_banner_6.png", number: "06", label: "UX", contentId: "ux-content" }, 
];

Site.initialize = function(){
	this.initializeBanner();
	this.initializeTimelines();
	this.setEvents();
	this.requestLoop();
}

Site.initializeTimelines = function(){
	for (var i = 0; i < this.bannerImages.length; i++){
		let bimg = this.bannerImages[i];
		bimg.timeline = new TimelineController(i);
	}
}

Site.requestLoop = function(){
	requestAnimationFrame((timestamp) => this.loop(timestamp));
}

Site.loop = function(timestamp){
	this.delta = (timestamp - this.lastTimestamp) / 1000;
	this.time += this.delta;
	this.lastTimestamp = timestamp;

	this.calculateImagePreview();
	this.calculateImagePositions();
	this.calculateWordRotation();

	// markers management
	this.setSelectionDotsOpacity();
	this.setStageMarkerPosition();
	
	this.renderBanner();
	this.requestLoop();
}




Site.mouseOnNextImagePreview = function(){

	viewportwidth = document.getElementsByTagName('body')[0].clientWidth;
		
	 
	if (viewportwidth < 600) {
			dividermobilepreviewright = 1;
		} else {
			dividermobilepreviewright = 0.97;
		}

	return this.mousePosition.x > this.offscreenCanvas.width * dividermobilepreviewright; /*change this from 0.97 to 1 when on mobile*/ 
}
Site.mouseOnPreviousImagePreview = function(){

	viewportwidth = document.getElementsByTagName('body')[0].clientWidth;

	if (viewportwidth < 600) {
		
			dividermobilepreviewleft = 0;
		}
		else {
			dividermobilepreviewleft = 0.03;
		}


	return this.mousePosition.x < this.offscreenCanvas.width * dividermobilepreviewleft; /*change this from 0.03 to 0 when on mobile*/
}

// calculate animation for when holding the mouse on the sides of the screen
Site.calculateImagePreview = function(){
	let withinCollisionArea = this.mouseOnNextImagePreview() || this.mouseOnPreviousImagePreview();
	switch (this.bannerState){
		case this.BannerStateEnum.STEADY:
			if (withinCollisionArea){
				// should transition to image preview
				this.killImagePreviewTween();
				this.imagePreviewTargetShear = this.imagePreviewShearAmount;
				if (this.mouseOnNextImagePreview())
					this.imagePreviewTargetShear *= -1;

				this.bannerState = this.BannerStateEnum.IMAGE_PREVIEW;
				this.imagePreviewTween = gsap.to(this, { duration: 0.4, imagePreviewShear: this.imagePreviewTargetShear, distortIntensity: this.MAX_DISTORT_INTENSITY })
			}	
			break;
		case this.BannerStateEnum.IMAGE_PREVIEW:
			if (!withinCollisionArea){
				this.killImagePreviewTween();
				this.bannerState = this.BannerStateEnum.IMAGE_PREVIEW_TRANSITION;
				this.imagePreviewTween = gsap.to(this, { duration: 0.8, imagePreviewShear: 0, ease: "elastic.out(1, 0.5)", distortIntensity: this.MIN_DISTORT_INTENSITY });				
				this.imagePreviewTween.eventCallback("onComplete", () => {
					if (this.bannerState == this.BannerStateEnum.IMAGE_PREVIEW_TRANSITION){
						this.bannerState = this.BannerStateEnum.STEADY;
					}
				});
			}
			break;
	}
}

Site.killImagePreviewTween = function(){
	if (this.imagePreviewTween){
		this.imagePreviewTween.kill();
	}
}

Site.initializeBanner = function(){
	this.initializeDistortions();
	this.bannerCanvas = document.getElementById('top-banner-canvas');
	this.bannerContext = this.bannerCanvas.getContext('2d');
	this.offscreenCanvas = document.createElement('canvas');
	this.offscreenContext = this.offscreenCanvas.getContext('2d');
	this.webGLCanvas = document.createElement('canvas');

	this.setCanvasSize();

	// initializeImage positions
	this.initializeImagePositions();
	this.centerImage(this.bannerImages[0]);

	this.lastSnappedImage = this.bannerImages[0];

	this.moveBanner(0);

	this.bannerState = this.BannerStateEnum.WAIT_MOVE;
}

Site.getCanvasWidth = function(){
	return this.offscreenCanvas.width;
	
}

Site.initializeImagePositions = function(){
	let x = 0;
	const canvasWidth = this.getCanvasWidth();
	for (let i = 0; i < this.bannerImages.length; i++){
		this.bannerImages[i].x = x;
		x += canvasWidth;
	}
}

Site.getImageIndex = function(bimg){
	return this.bannerImages.indexOf(bimg);
}

Site.centerImage = function(centerImage){

	let centerIndex = this.getImageIndex(centerImage);

	// // changes text in canvas based on screen width
	let divider; 

	switch (viewportwidth > 600) {
		case false: {
			let divider = 10;
			break;
		}
		case true: {
			let divider = 2;
		break;
		}
		default: 
			console.log('resolution could not be detected')
			break;
	}

	let half = Math.floor(this.bannerImages.length / divider); /*sets banner image size. 2 for desktop, 10 is good for onload on mobile*/

	let centerx = centerImage.x;
	const canvasWidth = this.getCanvasWidth();
	for (let i = 1; i <= half; i++){
		let bimg = this.bannerImages[(centerIndex + i) % this.bannerImages.length];
		bimg.x = centerx + i * canvasWidth;
	}
	for (let i = 1; i <= half; i++){
		let bimg = this.bannerImages[(centerIndex - i + this.bannerImages.length) % this.bannerImages.length];
		bimg.x = centerx - i * canvasWidth;
	}
}

Site.setCanvasSize = function() {
	let w = window.innerWidth;
	let h = window.innerHeight;
	this.offscreenCanvas.width = w;
	this.offscreenCanvas.height = h;
	this.bannerCanvas.width = w;
	this.bannerCanvas.height = h;
	this.webGLCanvas.width = w;
	this.webGLCanvas.height = h;
}

Site.getBannerWidth = function(){
	return this.bannerCanvas.width * this.bannerImages.length;
}

Site.distanceToImage = function(bimg){
	return Math.abs(-this.bannerCamera.x - bimg.x);
}

Site.calculateDistortIntensity = function(){
	switch (this.bannerState){
		case this.BannerStateEnum.STEADY:
		case this.BannerStateEnum.DRAGGING:
			if (this.lastSnappedImage){
				let distance = this.distanceToImage(this.lastSnappedImage);
				this.distortIntensity = Utils.lerp(0, this.getCanvasWidth(), distance, this.MIN_DISTORT_INTENSITY, this.MAX_DISTORT_INTENSITY);
			}
			break;
	}
}

Site.setShear = function(){
	let shearX = 0;
	switch (this.bannerState){
		case this.BannerStateEnum.STEADY:
			let minShear = 0;
			let maxShear = 0.07;
			shearX = Utils.lerp(0, this.offscreenCanvas.width / 2, this.distanceToImage(this.lastSnappedImage), 
				minShear, maxShear);
			break;
		case this.BannerStateEnum.IMAGE_PREVIEW:
		case this.BannerStateEnum.IMAGE_PREVIEW_TRANSITION:
			shearX = this.imagePreviewShear;
			break;
	}
	this.offscreenContext.transform(1, 0, shearX, 1, 0, 0);		
}

Site.render2DCanvas = function(){
	// set shear
	this.offscreenContext.save();
	this.setShear();

	for (let i = 0; i < this.bannerImages.length; i++){
		this.offscreenContext.save();
		this.offscreenContext.translate(this.offscreenCanvas.width / 2, this.offscreenCanvas.height / 2);
		this.offscreenContext.scale(this.zoom, this.zoom);
		this.offscreenContext.translate(-this.offscreenCanvas.width / 2, -this.offscreenCanvas.height / 2);

		let bimg = this.bannerImages[i];
		let targetWidth = this.offscreenCanvas.width;
		let targetHeight = this.offscreenCanvas.height;
		let dimensions = Utils.resizeImage(bimg.image, targetWidth, targetHeight, true);
		let xcoord = bimg.x + this.bannerCamera.x;		
		this.offscreenContext.drawImage(bimg.image, xcoord, 0, dimensions.width, dimensions.height);
		
		this.offscreenContext.restore();
	}
	this.offscreenContext.restore();
}

Site.getImageCenterX = function(bimg){
	return bimg.x + bimg.image.width / 2;
}

Site.calculateCurrentImage = function(){
	let minDist = Infinity;
	let closest = null;
	for (let i = 0; i < this.bannerImages.length; i++){
		let bimg = this.bannerImages[i];
		let dist = Math.abs(this.getImageCenterX(bimg) + this.bannerCamera.x - this.offscreenCanvas.width / 2);
		if (dist < minDist){
			minDist = dist;
			closest = bimg;
		}
	}
	return closest;
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
    	uniform float aspect;
    	uniform sampler2D uTexture;

    	uniform float time;	
    	uniform float intensity;
    	uniform vec2 d_pos[6];
    	uniform float d_int[6];  
    	uniform float d_ena[6];    	
    	uniform float d_rad[6];

    	float random (in vec2 _st) {
    		return fract(sin(dot(_st.xy, vec2(12.9898,78.233))) * 43758.5453123);
		}

		float noise (in vec2 _st) {
		    vec2 i = floor(_st);
		    vec2 f = fract(_st);

		    // Four corners in 2D of a tile
		    float a = random(i);
		    float b = random(i + vec2(1.0, 0.0));
		    float c = random(i + vec2(0.0, 1.0));
		    float d = random(i + vec2(1.0, 1.0));

		    vec2 u = f * f * (3.0 - 2.0 * f);

		    return mix(a, b, u.x) +
		            (c - a)* u.y * (1.0 - u.x) +
		            (d - b) * u.x * u.y;
		}

		#define NUM_OCTAVES 2

		float fbm (in vec2 _st) {
			float v = 0.0;
			float a = 0.1;
			vec2 shift = vec2(100.0);

			// Rotate to reduce axial bias
			mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
			for (int i = 0; i < NUM_OCTAVES; ++i) {
				_st = rot * _st * 1.0 + shift;
				v += a * noise(_st);
				a *= 0.1;
			}
			return v;
		}

    	// displaces everything to the right according to distance
    	vec2 displace(vec2 vUV, float dst, float intensity){
    		vUV.x += dst * 0.2 * intensity;
    		vUV.y += dst * intensity;
    		return vUV;
    	}

    	void main() {


    		/*
    		vec2 coords = texCoords;
    		for (int i = 0; i < 6; i++){
				float dist = distance(d_pos[i], texCoords);
	    		if (dist < d_rad[i]){
	    			//color = displace(uTexture, texCoords, disttest - dist, intensity);
	    			coords = displace(coords, d_rad[i] - dist, d_int[i]);
	    		}
    		}
    		*/

    		vec2 othercoords = texCoords;
    		//float amount = fbm(othercoords * 10.0 + 1.0 * time);
    		othercoords *= 4.0;

    		vec2 coords = vec2(0.0, 0.0);

	  		coords.x = intensity * fbm(othercoords + 0.3 * time * 2.0);
  			//coords.y = fbm(othercoords + 0.1 * time * 0.1 * );

  			vec2 newcoords = texCoords + coords;
    		vec4 color = texture2D(uTexture, newcoords);

    		/*
    		for (int i = 0; i < 1; i++){
				float dist = abs(distorts[i].x - texCoords.x);
	    		if (dist < disttest){
	    			float intens = sin(10.0 * texCoords.y + time);
	    			color = displace(uTexture, texCoords, disttest - dist, intens);
	    		}
    		}*/
		
      		gl_FragColor = color;
		}
  	`;

  	return { vert: vertShaderSource, frag: fragShaderSource };
}

Site.initializeDistortions = function(){
	for (let i = 0; i < this.maxDistortions; i++){
		this.distortions.push(new Distortion());
	}
}

Site.renderBanner = function(){
	this.setCanvasSize();
	
	this.calculateDistortIntensity();	
	this.render2DCanvas();
	this.renderWebGLBanner();
	this.renderBannerCanvas();
}

// renders letters on top of weblg canvas
Site.renderBannerCanvas = function(){
	this.bannerContext.drawImage(this.webGLCanvas, 0, 0);
	this.drawSectionNames(this.bannerContext);
}

Site.getDistortionParameters = function(gl){
	let d_pos = [];
	let d_ena = [];
	let d_int = [];
	let d_rad = [];
	for (var i = 0; i < this.distortions.length; i++){
		let dist = this.distortions[i];
		d_pos.push(dist.x);
		d_pos.push(dist.y);
		d_ena.push(dist.enabled);
		d_int.push(dist.intensity);
		d_rad.push(dist.radius);
	}
	let parameters = [
		{ type: gl.FLOAT_VEC2, name: "d_pos", value: d_pos },		
		{ type: gl.FLOAT, name: "d_ena", value: d_ena },
		{ type: gl.FLOAT, name: "d_int", value: d_int },
		{ type: gl.FLOAT, name: "d_rad", value: d_rad },	
	];
	return parameters;
}

Site.getCanvasAspectRatio = function(){
	return this.bannerCanvas.width / this.bannerCanvas.height;
}

Site.renderWebGLBanner = function(){
	const gl = this.webGLCanvas.getContext('webgl');
 	WebGLUtils.setGLContext(gl);	
 	WebGLUtils.resizeAndClear();

	let shaders = this.getBannerWebGLShader();	

	let shaderParameters = [
		{ type: gl.FLOAT, name: "time", value: this.time },
		{ type: gl.FLOAT, name: "intensity", value: this.distortIntensity },
		{ type: gl.FLOAT, name: "aspect", value: this.getCanvasAspectRatio() },	
	];
	shaderParameters = shaderParameters.concat(this.getDistortionParameters(gl));

  	WebGLUtils.applyShader(this.offscreenCanvas, this.webGLCanvas, 
  		shaders.vert, shaders.frag, gl, shaderParameters);
}

Site.captureMousePosition = function(event){
	this.mousePosition.x = event.clientX;
	this.mousePosition.y = event.clientY;

	if (this.bannerState == this.BannerStateEnum.WAIT_MOVE)
		this.bannerState = this.BannerStateEnum.STEADY;

	if (this.state == this.StateEnum.FRONT_SCREEN)
		this.setZoomLevel();
}

Site.setZoomLevel = function(){
	let ySize = this.offscreenCanvas.height * 0.2;
	let xSize = this.offscreenCanvas.width * 0.7;

	let minY = this.offscreenCanvas.height / 2 - ySize / 2;
	let maxY = this.offscreenCanvas.height / 2 + ySize / 2;

	let minX = this.offscreenCanvas.width / 2 - xSize / 2;
	let maxX = this.offscreenCanvas.width / 2 + xSize / 2;

	let withinZoomRange = this.mousePosition.y > minY && this.mousePosition.y < maxY &&
		this.mousePosition.x > minX && this.mousePosition.x < maxX;

	let zoomChanged = false;
	if (withinZoomRange){
		if (this.zoomTarget == this.MIN_ZOOM){
			zoomChanged = true;
			this.zoomTarget = this.MAX_ZOOM;
		}
	}else{
		// outsize zoom area
		if (this.zoomTarget == this.MAX_ZOOM){ // should zoom out
			zoomChanged = true;
			this.zoomTarget = this.MIN_ZOOM;
		}
	}
	if (zoomChanged){
		if (this.zoomTween){
			this.zoomTween.kill();
		}
		this.zoomTween = gsap.to(this, { duration: 0.7, zoom: this.zoomTarget, ease: Quad.EaseInOut });
	}
}

Site.onmousemove = function(event){
	let oldX = this.mousePosition.x;
	this.captureMousePosition(event);
	if (this.mouseDown && this.state == this.StateEnum.FRONT_SCREEN){
		switch (this.bannerState){
			case this.BannerStateEnum.STEADY:
			case this.BannerStateEnum.DRAGGING:			
				let deltaX = this.mousePosition.x - oldX;
				this.dragged = true;
				this.moveBanner(deltaX);
				this.transitionToDraggingState();
				break;
		}
	}
}

Site.transitionToSteadyState = function(){
	this.bannerState = this.BannerStateEnum.STEADY;
}

Site.transitionToDraggingState = function(){
	// todo: if transitioning from IMAGE_PREVIEW, remove the shear?
	this.bannerState = this.BannerStateEnum.DRAGGING;
}

Site.moveBannerWheel = function(deltaX){
	// moves banner but with mouse wheel, triggering tween
	this.targetBannerWheel += deltaX;
	this.successiveWheels++;
	this.killBannerTweens();

	const duration = Math.min(this.WHEEL_ANIM_TIME + this.successiveWheels * this.WHEEL_ANIM_INCREASE, this.WHEEL_ANIM_CAP_TIME);

	this.wheelBannerTween = gsap.to(this.bannerCamera, { duration: this.WHEEL_ANIM_TIME, x: (this.bannerCamera.x + this.targetBannerWheel), ease: Quad.EaseInOut });
	this.wheelBannerTween.eventCallback('onComplete', () => {
		this.successiveWheels = 0;
		this.targetBannerWheel = 0;
		this.wheelBannerTween = null;
		this.snapBannerToClosest();
	});
}

Site.killBannerTweens = function(){
	if (this.wheelBannerTween){
		this.wheelBannerTween.kill();
		this.wheelBannerTween = null;
	}
	if (this.bannerTween){
		this.bannerTween.kill();
		this.bannerTween = null;
	}

}

Site.moveBanner = function(deltaX){
	this.bannerCamera.x += deltaX;
}

Site.calculateImagePositions = function(){
	let image = this.calculateCurrentImage();
	this.centerImage(image);
}

viewportwidth = document.getElementsByTagName('body')[0].clientWidth;


let dividercircleradius = 0.8;
window.onload = function(){ 
document.querySelector("#top-banner-canvas").onclick = function() {circleRadiusAdjust()};
function circleRadiusAdjust() {
	dividercircleradius = 10;
  }
//   const id = setInterval(frame, 10);
//   function frame() {
//   if (dividercircleradius = 0.8) {
// 	clearInterval(id);
//   } else {
// 	dividercircleradius++; 
// 	elem.style.value = dividercircleradius + '%'; 
//   }
// }
}

let wordRadius = Site.getWordCircleRadius = function() {
	return this.getCanvasWidth() * dividercircleradius; /* this needs to change from 0.8 to 10 when user clicks on the center. function needs to have a transition period, indicates how wound up the text */
} 

Site.calculateWordRotation = function() {
	for (var i = 0; i < this.bannerImages.length; i++){
		let bimg = this.bannerImages[i];
		bimg.angle = this.wordRotationOffset + (bimg.x + this.bannerCamera.x) / (0.7 * this.getWordCircleRadius()); // 0.7 is the amount of rotation
	}
}

Site.snapBannerToImage = function(image, fromPreview){
	let duration = fromPreview? this.SNAP_TIME_PREVIEW : this.SNAP_TIME;
	this.lastSnappedImage = image;
	this.bannerTween = gsap.to(this.bannerCamera, { duration: duration, x: -image.x, ease: "elastic.out(1,0.6)" });
	this.bannerTween.eventCallback('onComplete', () => {
		this.transitionToSteadyState();
	});
}

Site.snapBannerToClosest = function(){
	let image = this.calculateCurrentImage();
	this.snapBannerToImage(image);
}

Site.onmouseup = function(event){
	this.captureMousePosition(event);
	this.mouseDown = false;

	// trigger snapping
	if (this.state == this.StateEnum.FRONT_SCREEN){
		this.snapBannerToClosest();
	}
}

Site.onmousedown = function(event){
	this.captureMousePosition(event);
	this.mouseDown = true;
	this.dragged = false;

	if (this.state == this.StateEnum.FRONT_SCREEN){
		if (this.bannerTween){
			this.bannerTween.kill();
			this.bannerTween = null;
		}	
	}
}

Site.onmousewheel = function(event){
	switch (this.state){
		case this.StateEnum.FRONT_SCREEN:
			this.moveBannerWheel(event.deltaY / 4);
			break;
		case this.StateEnum.CONTENT_SCREEN:
			this.advanceTimeline(event.deltaY);
			break;
	}
}

Site.advanceTimeline = function(t){
	// todo: convert t to an appropiate unit system
	this.currentContent.timeline.addAnimationTime(t);
}
Site.onclick = function(event){
	let image;
	switch (this.state){
		case this.StateEnum.FRONT_SCREEN:
			switch (this.bannerState){
				case this.BannerStateEnum.STEADY:
					image = this.calculateCurrentImage();

					this.transitionToContent(image);
					break;
				case this.BannerStateEnum.IMAGE_PREVIEW:
					image = this.calculateCurrentImage();
					let index = this.getImageIndex(image);
					let indexUpdate = this.mouseOnNextImagePreview()? 1 : -1;
					let nextIndex = (index + indexUpdate + this.bannerImages.length) % this.bannerImages.length;
					let newImage = this.bannerImages[nextIndex];
					this.snapBannerToImage(newImage, true);
					this.bannerState = this.BannerStateEnum.STEADY;
					break;
			}
			break;
	}
}

Site.transitionToContent = function(bimg){
	// position canvas  
	this.bannerCamera.x = -bimg.x;

	const canvasstyle = document.getElementById("top-banner-canvas");
	canvasstyle.setAttribute("style", "object-position: -20% -100px; transition: all 0.7s ease-out;");

	const displaystyle = document.getElementById(bimg.contentId);
	displaystyle.setAttribute("style", "display: block; margin-top: -100px; position: relative; background: white;");

	this.state = this.StateEnum.CONTENT_SCREEN;
	this.currentContent = bimg;
}

Site.checkAndTransitionToFront = function(event){
	if (this.state == this.StateEnum.CONTENT_SCREEN){
		this.transitionToFront();
	}
	const canvasstyle = document.getElementById("top-banner-canvas");
	canvasstyle.setAttribute("style", "object-position: 0; transition: all 0.7s ease-out;");
	event.stopPropagation();
}

Site.transitionToFront = function(){
	this.state = this.StateEnum.FRONT_SCREEN;
	document.getElementById(this.currentContent.contentId).style.display = "none";
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

Site.setSelectionDotsOpacity = function(){
	const bannerProgression = this.getBannerCameraProgression();
	for (var i = 0; i < this.bannerImages.length; i++){
		const stageDot = document.getElementById('stage-dot-' + i);

		let distance = Math.abs(bannerProgression - (i / (this.bannerImages.length - 1)));
		let distanceLimit = 0.2;
		if (distance < distanceLimit){
			stageDot.style.opacity = distance / distanceLimit;
		}else{
			stageDot.style.opacity = 1;
		}
	}
}

Site.getBannerCameraProgression = function(){
	const bannerLength = this.getBannerWidth();
	return Utils.lerp(0, bannerLength - this.offscreenCanvas.width, (-this.bannerCamera.x) % bannerLength, 0, 1);
}

Site.setStageMarkerPosition = function(){
	const stageMarker = document.getElementById('selection-dot');
	const bannerProgression = this.getBannerCameraProgression();
	stageMarker.style.left =  (4 + Utils.lerp(0, 1, bannerProgression, 0, stageMarker.parentElement.offsetWidth - 26)) + "px";
}

Site.getBannerWords = function(){
	var words = "";
	this.bannerImages.map((bimg) => words += bimg.label + "    ");
	// todo: rearrange according to position;
	return words;
}

Site.drawSectionNames = function(context){
	// draw rounded word

	
	context.save();

// changes text in canvas based on screen width
	viewportwidth = document.getElementsByTagName('body')[0].clientWidth;
		
	if (viewportwidth < 600) {
			dividerfont = 10;
		}else {
			dividerfont = 5;
		}

	let fontSize = context.canvas.height / dividerfont; //this needs to change from 5 to 10 on mobile
	
	context.font = fontSize + "px PlayfairDisplay";	
	context.textAlign = "center";
	context.textBaseline = "top";
	

	let currentImage = this.calculateCurrentImage();
	let currentIndex = this.getImageIndex(currentImage);

	for (let i = -1; i <= 1; i++){
		let index = (currentIndex + i + this.bannerImages.length) % this.bannerImages.length;
		let bimg = this.bannerImages[index];
		let word = bimg.label;
		let radius = this.getWordCircleRadius();
		context.fillCircleText(word, context.canvas.width / 2, 
			context.canvas.height * 0.45 + radius, radius, bimg.angle, undefined, false);
	}
	
	fontSize = Math.min(context.canvas.height * 0.1, 80);
	context.font = fontSize + "px PlayfairDisplayItalic";	
	context.textBaseline = "bottom";
	
	for (let i = -1; i <= 1; i++){
		let index = (currentIndex + i + this.bannerImages.length) % this.bannerImages.length;
		let bimg = this.bannerImages[index];
		let word = bimg.number;
		
		let radius = this.getWordCircleRadius();
		context.fillCircleText(word, context.canvas.width / 2, 
			context.canvas.height * 0.45 + radius, radius, bimg.angle, undefined, false);
	}
	context.restore();
}


Site.loadData();

(function(){
    const FILL = 0;        // const to indicate filltext render
    const STROKE = 1;
    var renderType = FILL; // used internal to set fill or stroke text
    const multiplyCurrentTransform = true; // if true Use current transform when rendering
                                           // if false use absolute coordinates which is a little quicker
                                           // after render the currentTransform is restored to default transform
                                           
      
    // measure circle text
    // ctx: canvas context
    // text: string of text to measure
    // r: radius in pixels
    //
    // returns the size metrics of the text
    //
    // width: Pixel width of text
    // angularWidth : angular width of text in radians
    // pixelAngularSize : angular width of a pixel in radians
    var measure = function(ctx, text, radius){        
        var textWidth = ctx.measureText(text).width; // get the width of all the text
        return {
            width               : textWidth ,
            angularWidth        : (1 / radius) * textWidth,
            pixelAngularSize    : 1 / radius
        };
    }

    // displays text along a circle
    // ctx: canvas context
    // text: string of text to measure
    // x,y: position of circle center
    // r: radius of circle in pixels
    // start: angle in radians to start. 
    // [end]: optional. If included text align is ignored and the text is 
    //        scaled to fit between start and end;
    // [forward]: optional default true. if true text direction is forwards, if false  direction is backward
    var circleText = function (ctx, text, x, y, radius, start, end, forward) {
        var i, textWidth, pA, pAS, a, aw, wScale, aligned, dir, fontSize;
        if(text.trim() === "" || ctx.globalAlpha === 0){ // dont render empty string or transparent
            return;
        }
        if(isNaN(x) || isNaN(y) || isNaN(radius) || isNaN(start) || (end !== undefined && end !== null && isNaN(end))){ // 
            throw TypeError("circle text arguments requires a number for x,y, radius, start, and end.")
        }
        aligned = ctx.textAlign;        // save the current textAlign so that it can be restored at end
        dir = forward ? 1 : forward === false ? -1 : 1;  // set dir if not true or false set forward as true  
        pAS = 1 / radius;               // get the angular size of a pixel in radians
        textWidth = ctx.measureText(text).width; // get the width of all the text
        if (end !== undefined && end !== null) { // if end is supplied then fit text between start and end
            pA = ((end - start) / textWidth) * dir;
            wScale = (pA / pAS) * dir;
        } else {                 // if no end is supplied correct start and end for alignment
            // if forward is not given then swap top of circle text to read the correct direction
            if(forward === null || forward === undefined){
                if(((start % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2) > Math.PI){
                    dir = -1;
                }
            }
            pA = -pAS * dir ;
            wScale = -1 * dir;
            switch (aligned) {
            case "center":       // if centered move around half width
                start -= (pA * textWidth )/2;
                end = start + pA * textWidth;
                break;
            case "right":// intentionally falls through to case "end"
            case "end":
                end = start;
                start -= pA * textWidth;
                break;
            case "left":  // intentionally falls through to case "start"
            case "start":
                end = start + pA * textWidth;
            }
        }

        ctx.textAlign = "center";                     // align for rendering
        a = start;                                    // set the start angle
        for (var i = 0; i < text.length; i += 1) {    // for each character
            aw = ctx.measureText(text[i]).width * pA; // get the angular width of the text
            var xDx = Math.cos(a + aw / 2);           // get the yAxies vector from the center x,y out
            var xDy = Math.sin(a + aw / 2);
            if(multiplyCurrentTransform){ // transform multiplying current transform
                ctx.save();
                if (xDy < 0) { // is the text upside down. If it is flip it
                    ctx.transform(-xDy * wScale, xDx * wScale, -xDx, -xDy, xDx * radius + x, xDy * radius + y);
                } else {
                    ctx.transform(-xDy * wScale, xDx * wScale, xDx, xDy, xDx * radius + x, xDy * radius + y);
                }
            }else{
                if (xDy < 0) { // is the text upside down. If it is flip it
                    ctx.setTransform(-xDy * wScale, xDx * wScale, -xDx, -xDy, xDx * radius + x, xDy * radius + y);
                } else {
                    ctx.setTransform(-xDy * wScale, xDx * wScale, xDx, xDy, xDx * radius + x, xDy * radius + y);
                }
            }
            if(renderType === FILL){
                ctx.fillText(text[i], 0, 0);    // render the character
            }else{                    
                ctx.strokeText(text[i], 0, 0);  // render the character
            }
            if(multiplyCurrentTransform){  // restore current transform
                ctx.restore();
            }
            a += aw;                     // step to the next angle
        }
        // all done clean up.
        if(!multiplyCurrentTransform){
            ctx.setTransform(1, 0, 0, 1, 0, 0); // restore the transform
        }
        ctx.textAlign = aligned;            // restore the text alignment
    }
    // define fill text
    var fillCircleText = function(text, x, y, radius, start, end, forward){
        renderType = FILL;
        circleText(this, text, x, y, radius, start, end, forward);
    }
    // define stroke text
    var strokeCircleText = function(text, x, y, radius, start, end, forward){
        renderType = STROKE;
        circleText(this, text, x, y, radius, start, end, forward);
    }
    // define measure text
    var measureCircleTextExt = function(text,radius){
        return measure(this, text, radius);
    }
    // set the prototypes
    CanvasRenderingContext2D.prototype.fillCircleText = fillCircleText;
    CanvasRenderingContext2D.prototype.strokeCircleText = strokeCircleText;
	CanvasRenderingContext2D.prototype.measureCircleText = measureCircleTextExt;
	  
})();

