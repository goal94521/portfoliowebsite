
let Site = {
	StateEnum: { PRELOADER: 1, FRONT_SCREEN: 2, CONTENT_SCREEN: 3},
	bannerCanvas: null,
	offscreenCanvas: null,
	offscreenContext: null,
	currentContent: null,
	mousePosition: { x: -1000, y: -1000 },
	mouseDown: false,
	dragged: false,
	distortIntensity: 0.5,
};

Site.state = Site.StateEnum.FRONT_SCREEN; // todo change to preloader


Site.wordRotationOffset = 4.35;
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

	// markers management
	this.setSelectionDotsOpacity();
	this.setStageMarkerPosition();
	
	this.renderBanner(timestamp);
	this.requestLoop();
}

Site.initializeBanner = function(){
	this.bannerCanvas = document.getElementById('top-banner-canvas');
	this.offscreenCanvas = document.createElement('canvas');
	this.offscreenContext = this.offscreenCanvas.getContext('2d');

	// initializeImage positions
	let x = 0;
	for (let i = 0; i < this.bannerImages.length; i++){
		this.bannerImages[i].x = x;
		x += this.bannerImages[i].image.width;
	}

	this.moveBanner(0);
}

Site.setCanvasSize = function(argument) {
	this.offscreenCanvas.width = window.innerWidth;
	this.offscreenCanvas.height = window.innerHeight;

	this.bannerCanvas.width = window.innerWidth;
	this.bannerCanvas.height = window.innerHeight;
}

Site.getBannerWidth = function(){
	return this.bannerCanvas.width * this.bannerImages.length;
}

Site.render2DCanvas = function(){
	for (let i = 0; i < this.bannerImages.length; i++){
		let bimg = this.bannerImages[i];
		let dimensions = Utils.resizeImage(bimg.image, this.offscreenCanvas.width, this.offscreenCanvas.height, true);
		this.offscreenContext.drawImage(bimg.image, bimg.x + this.bannerCamera.x, 0, dimensions.width, dimensions.height);
	}
	this.drawSectionName();
}

Site.getImageCenterX = function(bimg){
	return bimg.x + bimg.image.width / 2;
}

Site.getCurrentImage = function(){
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
	this.renderWebGLBanner();
}

Site.render2DBanner = function(){
	var context = this.bannerCanvas.getContext('2d');
	context.drawImage(this.offscreenCanvas, 0, 0);
}

Site.renderWebGLBanner = function(){
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
	if (this.mouseDown && this.state == this.StateEnum.FRONT_SCREEN){
		let deltaX = this.mousePosition.x - oldX;
		this.dragged = true;
		this.moveBanner(deltaX);
	}
}

Site.moveBanner = function(deltaX){
	this.bannerCamera.x += deltaX;
	this.calculateWordRotation();
}

Site.calculateWordRotation = function() {
	this.wordRotation = this.wordRotationOffset + this.bannerCamera.x * this.wordRotationSpeed;
}

Site.onmouseup = function(event){
	this.captureMousePosition(event);
	this.mouseDown = false;
}

Site.onmousedown = function(event){
	this.captureMousePosition(event);
	this.mouseDown = true;
	this.dragged = false;
}

Site.onmousewheel = function(event){
	switch (this.state){
		case this.StateEnum.FRONT_SCREEN:
			this.moveBanner(event.deltaY);
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
	// add: if (this.overSteadyImage)
	if (this.state == this.StateEnum.FRONT_SCREEN && !this.dragged){
		let image = this.getCurrentImage();
		this.transitionToContent(image);
	}
}

Site.transitionToContent = function(bimg){
	// position canvas
	this.bannerCamera.x = -bimg.x;
	this.calculateWordRotation();

	document.getElementById(bimg.contentId).style.display = "block";
	this.state = this.StateEnum.CONTENT_SCREEN;
	this.currentContent = bimg;
}

Site.checkAndTransitionToFront = function(event){
	if (this.state == this.StateEnum.CONTENT_SCREEN){
		this.transitionToFront();
	}

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

Site.drawSectionName = function(){
	// draw rounded word
	var word = this.getBannerWords();
	var fontSize = this.offscreenContext.canvas.height / 5;

	this.offscreenContext.save();
	this.offscreenContext.font = fontSize + "px Arial";	

	this.offscreenContext.fillCircleText(word, this.offscreenCanvas.width / 2, 
		this.offscreenCanvas.width, this.offscreenCanvas.width * 0.75, 
		this.wordRotation, undefined, false);

	/*
	function drawStack(ctx){
		var w = ctx.canvas.width;
		var h = ctx.canvas.height;
    	var Ribbon = {maxChar: word.length, startX: (-w/3), startY: (3*h/2), 
              control1X: (-w/3), control1Y: 0, 
              control2X: (4*w/3), control2Y: 0, 
              endX: (4*w/3), endY: (3*h/2) };
    
	    fillRibbon(word, Ribbon, ctx); 
	}

	function fillRibbon(text, Ribbon, ctx){
		var textCurve = [];
		var ribbon = text.substring(0, Ribbon.maxChar);
		var curveSample = 1000;

		xDist = 0;
		var i = 0;
		for (i = 0; i < curveSample; i++){
			a = new bezier2(i/curveSample,Ribbon.startX,Ribbon.startY,Ribbon.control1X,Ribbon.control1Y,Ribbon.control2X,Ribbon.control2Y,Ribbon.endX,Ribbon.endY);
			b = new bezier2((i+1)/curveSample,Ribbon.startX,Ribbon.startY,Ribbon.control1X,Ribbon.control1Y,Ribbon.control2X,Ribbon.control2Y,Ribbon.endX,Ribbon.endY);
			c = new bezier(a,b);
			textCurve.push({bezier: a, curve: c.curve});
		}

		letterPadding = ctx.measureText(" ").width / 4; 
		w = ribbon.length;
		ww = Math.round(ctx.measureText(ribbon).width);

		totalPadding = (w-1) * letterPadding + Site.wordOffset;
		totalLength = ww + totalPadding;
		p = 0;

		cDist = textCurve[curveSample-1].curve.cDist;

		z = (cDist / 2) - (totalLength / 2);

		for (i = 0; i < curveSample; i++){
			if (textCurve[i].curve.cDist >= z){
				p = i;
				break;
			}
		}

		for (i = 0; i < w ; i++){
			ctx.save();
			ctx.translate(textCurve[p].bezier.point.x, textCurve[p].bezier.point.y);
			ctx.rotate(textCurve[p].curve.rad);
			ctx.fillText(ribbon[i], 0, 0);
			ctx.restore();
			
			x1 = ctx.measureText(ribbon[i]).width + letterPadding;
		    x2 = 0;	
			for (j=p;j < curveSample;j++){
				x2 = x2 + textCurve[j].curve.dist;
				if (x2 >= x1){
					p = j;
					break;
				}
			}
		}
	} //end FillRibon

	function bezier(b1, b2){
		//Final stage which takes p, p+1 and calculates the rotation, distance on the path and accumulates the total distance
		this.rad = Math.atan(b1.point.mY/b1.point.mX);
		this.b2 = b2;
		this.b1 = b1;
		dx = (b2.x - b1.x);
		dx2 = (b2.x - b1.x) * (b2.x - b1.x);
		this.dist = Math.sqrt( ((b2.x - b1.x) * (b2.x - b1.x)) + ((b2.y - b1.y) * (b2.y - b1.y)) );
		xDist = xDist + this.dist;
		this.curve = {rad: this.rad, dist: this.dist, cDist: xDist};
	}

	function bezierT(t,startX, startY,control1X,control1Y,control2X,control2Y,endX,endY){
		//calculates the tangent line to a point in the curve; later used to calculate the degrees of rotation at this point.
		this.mx = (3*(1-t)*(1-t) * (control1X - startX)) + ((6 * (1-t) * t) * (control2X - control1X)) + (3 * t * t * (endX - control2X));
		this.my = (3*(1-t)*(1-t) * (control1Y - startY)) + ((6 * (1-t) * t) * (control2Y - control1Y)) + (3 * t * t * (endY - control2Y));
	}

	function bezier2(t,startX, startY,control1X,control1Y,control2X,control2Y,endX,endY){
		//Quadratic bezier curve plotter
		this.Bezier1 = new bezier1(t,startX,startY,control1X,control1Y,control2X,control2Y);
		this.Bezier2 = new bezier1(t,control1X,control1Y,control2X,control2Y,endX,endY);
		this.x = ((1 - t) * this.Bezier1.x) + (t * this.Bezier2.x);
		this.y = ((1 - t) * this.Bezier1.y) + (t * this.Bezier2.y);
		this.slope = new bezierT(t,startX, startY,control1X,control1Y,control2X,control2Y,endX,endY);

		this.point = {t: t, x: this.x, y: this.y, mX: this.slope.mx, mY: this.slope.my};
	}
	function bezier1(t,startX, startY,control1X,control1Y,control2X,control2Y){
		//linear bezier curve plotter; used recursivly in the quadratic bezier curve calculation
		this.x = (( 1 - t) * (1 - t) * startX) + (2 * (1 - t) * t * control1X) + (t * t * control2X);
		this.y = (( 1 - t) * (1 - t) * startY) + (2 * (1 - t) * t * control1Y) + (t * t * control2Y);
	}

	drawStack(this.offscreenContext);
	*/
	this.offscreenContext.restore();
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
            width               : textWidth,
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
