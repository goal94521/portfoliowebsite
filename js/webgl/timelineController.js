
var TimelineController = function(index){
	this.initialize(index);
}

TimelineController.prototype.initialize = function(index){
	var self = this;
	switch (index){
		case 0:  // editorial
			this.timelineStates = [
				//{ startTime: 0, endTime: 0, state: ANIMATION_STATE_ENUM.INTRO},
				//{ startTime: 3.1, endTime: 4.5, state: ANIMATION_STATE_ENUM.SLIDER},	
			];
			this.timelineStops = [
				{ time: 0, duration: 600, elements: [
					{ elem: "#editorial_image_1_1", values: { y: 0 } },
				]},
				{ time: 100, duration: 800, elements: [
					{ elem: "#editorial_image_1_2", values: { y: 0 } }
				]},
				{ time: 600, duration: 600, elements: [
					{ elem: "#editorial_image_2_1", values: { y: 0 } }
				]},
				{ time: 600, duration: 500, elements: [
					{ elem: "#editorial_image_2_2", values: { y: 0 } }
				]},
				/*
				{ time: 0.5, type: "callback", function(){
					webgl.enabled = true;
				}},
				// intro, initial position
				{ time: 0, duration: 0, elements: [
					{ elem: "cameraPos", values: { x: 0, y: 0, z: 0 } }, 
					{ elem: "cameraRot", values: { x: 0, y: 0, z: 0 } },
					{ elem: "dots", values: { x: 0, y: -300, z: 0 } },
				    { elem: "ceilDots", values: { x: 0, y: 1000, z: 0 } },
		        	{ elem: "carousel", values: { x: 0, y: -5, z: -100 } },
		    		{ elem: "#web-gl .btn-next-section img", values: { opacity: 1, y: 0, ease: Circ.easeInOut }},
				]}*/
			];
			this.timelineDuration = 10236;
			break; 
		default:
			this.timelineDuration = 0;
			this.timelineStates = [];
			this.timelineStops = [];
			break;
	}

	this.invalidate();
	this.createTimeline();
}

TimelineController.prototype.createTimeline = function(){
	this.targetTime = 0;
	this.timeline = gsap.timeline({ paused: true });

	for (var i = 0; i < this.timelineStops.length; i++){
		var ts = this.timelineStops[i];
		if (ts.type == 'callback'){
			this.timeline.add(ts.function, ts.time);
		}else{
			// tweens
			for (var j = 0; j < ts.elements.length; j++){
				var e = ts.elements[j];
				var tweenElement = e.elem;
				var tween = TweenLite.to(tweenElement, ts.duration, e.values);
				this.timeline.add(tween, ts.time);
			}			
		}
	}
}

TimelineController.prototype.invalidate = function(){
	if (this.timeline){
		gsap.globalTimeline.invalidate();
		this.timeline.invalidate();
	}
}

TimelineController.prototype.addAnimationTime = function(time){
	if (this.lastTween)
		this.lastTween.kill();

	this.targetTime = Utils.clamp(this.targetTime + time, 0, this.timelineDuration);

	var duration = 0.3; // Utils.clamp(Math.abs(this.targetTime - this.timeline.time()), 0, 0);
	//this.lastTween = this.timeline.tweenTo(this.targetTime);
	this.lastTween = gsap.to(this.timeline, { duration: duration, time: this.targetTime, ease: "easeInOut"});
}


