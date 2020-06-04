
var Preloader = {};

Preloader.currentWord = 0;
Preloader.wordCount = 5;

Preloader.intervalId = setInterval(function(){

	document.getElementById('word-image-' + Preloader.currentWord).style.display = "none";
	document.getElementById('hand-image-' + Preloader.currentWord).style.display = "none";

	Preloader.currentWord++;
	Preloader.currentWord = Preloader.currentWord % Preloader.wordCount;

	document.getElementById('word-image-' + Preloader.currentWord).style.display = "inline-block";
	document.getElementById('hand-image-' + Preloader.currentWord).style.display = "block";

}, 700);

Preloader.clear = function(){
	clearInterval(Preloader.intervalId);

	gsap.to('#preloader', 2, { top: "-100vh" });
}


