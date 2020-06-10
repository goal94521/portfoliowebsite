

var Utils = {};

Utils.captureCanvasMousePosition = function(event, canvas, mousePosition){
    mousePosition = mousePosition || {};
    var rect = canvas.getBoundingClientRect();
    mousePosition.x = event.clientX - rect.left;
    mousePosition.y = event.clientY - rect.top;
    return mousePosition;
}

/* Interactive utils */
Utils.KEY_ENUM = {
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    
    ALT: 18,
    CONTROL: 17,
    ENTER: 13,
    ESCAPE: 27,
    SHIFT: 16,
    SPACE: 32,

    "1": 49, "2": 50, "3": 51, "4": 52, "5": 53,
    "6": 54, "7": 55, "8": 56, "9": 57, "0": 58,

    A: 65, B: 66, C: 67, D: 68, E: 69, F: 70, G: 71,
    H: 72, I: 73, J: 74, K: 75, L: 76, M: 77, N: 78,
    O: 79, P: 80, Q: 81, R: 82, S: 83, T: 84, U: 85,
    V: 86, W: 87, X: 88, Y: 89, Z: 90
};

Utils.isRightClick = function(event){
    return event.button == 2;
}

Utils.isLeftClick = function(event){
    return event.button == 0;
}

Utils.constraintInteger = function(obj, field, defaultValue){
    if (obj){
        var value = parseInt(obj[field]);
        if (isNaN(value)){
            value = defaultValue;
        }
        obj[field] = value;
    }
}

Utils.constraintNumber = function(obj, field, defaultValue){
    if (obj){
        var value = parseFloat(obj[field]);
        if (isNaN(value)){
            value = defaultValue;
        }
        obj[field] = value;
    }
}

Utils.wait = function(t){
    return new Promise(function(resolve, reject){
        setTimeout(resolve, t);
    });
}

/* DATE FUNCTIONS */
var ONE_MINUTE = 1000 * 60;
var ONE_HOUR = 1000 * 60 * 60;
var ONE_DAY = 1000 * 60 * 60 * 24;

// Converts a date to UTC in order to print it with current timezone
function convertToUTC(d){
	return new Date(d.getTime() + d.getTimezoneOffset() * 60 * 1000);
}

Utils.convertFromUTC = function(d){
    return new Date(d.getTime() - d.getTimezoneOffset() * 60 * 1000);
}

Utils.roundDateToMinute = function(d){
    return new Date(Math.round(d.getTime() / ONE_MINUTE) * ONE_MINUTE);
}

Utils.UTCEqualsMinuteWithoutTime = function(d1, d2){
    d1 = convertToUTC(d1);
    d2 = convertToUTC(d2);
    return (d1.getFullYear() == d2.getFullYear() && d1.getMonth() == d2.getMonth() && d1.getDate() == d2.getDate() && d1.getHours() == d2.getHours() && d1.getMinutes() == d2.getMinutes());
}

function UTCEqualsDatesWithoutTime(d1, d2, printEverything){
    if (printEverything){
        console.log("begin comparation - " + Charts.chartManager.chartContext.getActiveSymbol());
        console.log(d1);
        console.log(d2);    
    }
    d1 = convertToUTC(d1);
    d2 = convertToUTC(d2);
    if (printEverything){
        console.log(d1);
        console.log(d2);
        console.log(d1.getFullYear(), d2.getFullYear(), d1.getMonth(), d2.getMonth(), d1.getDate(), d2.getDate());
        console.log("end comparation");   
    }
	return (d1.getFullYear() == d2.getFullYear() && d1.getMonth() == d2.getMonth() && d1.getDate() == d2.getDate());
}

/* Given a number of milisecond, returns how many complete days are in the period */
function numberOfDays(milis){
	return milis / (1000 * 60 * 60 * 24);
}

/* Given a number of milisecond, returns how many complete days are in the period */
Utils.numberOfMinutes = function(milis){
	return milis / (1000 * 60);
}

/* Given a number of days, returns how many milliseconds are in the period */
function daysToMillis(days){
	return days * 24 * 60 * 60 * 1000;
}

Date.prototype.toUTCString = function(format){
    return convertToUTC(this).toString(format);
}

Date.prototype.withoutTime = function(){
	return Date(Date.UTC(this.getUTCFullYear(), this.getUTCMonth(), this.getUTCDate()));
}

Date.prototype.isLeapYear = function() {
    var year = this.getFullYear();
    if((year & 3) != 0) return false;
    return ((year % 100) != 0 || (year % 400) == 0);
};

// Get Day of Year
Date.prototype.getDOY = function(utc) {
    var dayCount = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
    var mn = this.getMonth();
    var dn = this.getDate();
    if (utc){
    	mn = this.getUTCMonth();
    	dn = this.getUTCDate();
    }
    var dayOfYear = dayCount[mn] + dn;
    if(mn > 1 && this.isLeapYear()) dayOfYear++;
    return dayOfYear;
};

var hasStdTimezoneOffset = null;
var maxStdTimezoneOffset = null;
Date.prototype.stdTimezoneOffset = function() {
    var jan = new Date(this.getFullYear(), 0, 1);
    var jul = new Date(this.getFullYear(), 6, 1);
    return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
}

Date.prototype.dstDifference = function() {
	return maxStdTimezoneOffset - this.getTimezoneOffset();
}

Date.prototype.dst = function() {
	if (hasStdTimezoneOffset == null){
		maxStdTimezoneOffset = stdTimezoneOffset();
		hasStdTimezoneOffset = this.getTimezoneOffset() < maxStdTimezoneOffset;
	}
	return hasStdTimezoneOffset;
}

Date.prototype.addMinutes = function(date, minutes) {
    this.setTime(date.getTime() + minutes * 60000);
}

/* STRING FUNCTIONS */

function pad(str, padValue, before, toLength){
	var i;
	var returnStr = str;
	for (i = str.length; i < toLength; i++){
		if (before){
			returnStr = padValue + returnStr;
		}else{
			returnStr = returnStr + padValue;
		}
	}
	return returnStr;
}

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

String.prototype.replaceAt = function(index, rep) {
    return this.substr(0, index) + rep + this.substr(index + rep.length);
}

// removes whitespaces from a string
function removeBlankSpaces(str){
	var strOut = "";
	for (var i = 0; i < str.length; i++){
		if (str[i] != " " && str[i] != "\t" && str[i] != "\r" && str[i] != "\n"){
			// add the character
			strOut += str[i];
		}

	}
	return strOut;
}

Utils.printPrice = function(p){
    if (p != undefined){
        p = p.toFixed(2);
        var parts = p.split('.');
        return numberWithCommas(parts[0]) + "." + parts[1];
    }else{
        return "N/A";
    }
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/* MATH FUNCTIONS */

Utils.clamp = function(value, min, max){
	return Math.max(Math.min(value,max),min);
}

function formatTo2decimalPlaces(num){
	return parseFloat(Math.round(num * 100) / 100).toFixed(2);
}

function formatToSingleDecimalPlace(num){
	return parseFloat(Math.round(num * 10) / 10).toFixed(1);
}

/* Returns logarithm of x in base y*/
function baseLog(x, y) {
  return Math.log(x) / Math.log(y);
}

// Given a rect defined by x1, y1, x2, y2, and an outside point x3,
// returns the y value of the rect for x3.
function linearExtrapolation(x1, y1, x2, y2, x3){
	return (y1 + (x3 - x1) * (y2 - y1) / (x2 - x1));
}

// this names are backwards...

// Given a rect defined by startX, startY, endX, endY, and an internal point interY,
// returns the x value of the rect for interY
Utils.lerp = function(startX, endX, interX, startY, endY){
    return Utils.linearInterpolation(startY, endY, interX, startX, endX);
}

Utils.slerp = function(start, end, t){
    return Utils.linearInterpolation(0, 1, t, start, end);
}

Utils.linearInterpolation = function(startX, endX, interY, startY, endY){
    var yInterval = endY - startY;
    var fraction = (interY - startY) / yInterval;
    return (startX + (endX - startX) * fraction);
}

function reverseLinearInterpolation(startX, endX, interX, startY, endY){
	var xInterval = endX - startX;
	var fraction = (interX - startX) / xInterval;
	return (startY + (endY - startY) * fraction);
}

function logarithmicInterpolation(startX, endX, interY, startY, endY){
	var a = (baseLog(endY, 10) - baseLog(startY, 10)) / (endX - startX);
	var b = baseLog(startY, 10) - a * startX;
	return (baseLog(interY, 10) - b) / a;
}

function reverseLogarithmicInterpolation(startX, endX, interX, startY, endY){
	var a = (baseLog(endY, 10) - baseLog(startY, 10)) / (endX - startX);
	var b = baseLog(startY, 10) - a * startX;
	return (Math.pow(10, a * interX + b));
}

/* DISTANCE FUNCTIONS */

/*
* Calculates the distance between a point and an infinite line. 
* x1, y1: Coordinates of the first point that defines the line
* x2, y2: Coordinates of the second point that defines the line
* xp, yp: Coordinates of the point to test
*/
function distanceLinePoint(x1, y1, x2, y2, xp, yp){
	var ydif = (y2-y1);
	var xdif = (x2-x1);
	var denominator = Math.sqrt(ydif * ydif + xdif * xdif);
	if (denominator != 0){
		return (Math.abs(ydif * xp - xdif * yp + x2*y1 - y2*x1) / denominator);
	}else{
		return 0;
	}
}

function sqr(x){
	return x * x;
}

function distSqr(x1,y1, x2,y2) { 
	return sqr(x1 - x2) + sqr(y1 - y2); 
}

function dist(x1, y1, x2, y2){
	return Math.sqrt(distSqr(x1,y1,x2,y2));
}

function distSqr3d(x1, y1, z1, x2, y2, z2) { 
	return sqr(x1 - x2) + sqr(y1 - y2) + sqr(z1 - z2); 
}

function dist3d(x1, y1, z1, x2, y2, z2){
	return Math.sqrt(distSqr(x1,y1,x2,y2));
}

function pointsOrientation(px, py, qx, qy, rx, ry) { 
    var val = (qy - py) * (rx - qx) - 
              (qx - px) * (ry - qy); 
  
    if (val == 0) return 0;  // colinear 
  
    return (val > 0)? 1: 2; // clock or counterclock wise 
} 

function onSegment(px, py, qx, qy, rx, ry) 
{ 
    if (qx <= Math.max(px, rx) && qx >= Math.min(px, rx) && 
        qy <= Math.max(py, ry) && qy >= Math.min(py, ry)) 
       return true; 
  
    return false; 
} 

// The main function that returns true if line segment 'p1q1' 
// and 'p2q2' intersect. 
function doIntersect(p1x, p1y, q1x, q1y, p2x, p2y, q2x, q2y) 
{ 
    // Find the four orientations needed for general and 
    // special cases 
    var o1 = pointsOrientation(p1x, p1y, q1x, q1y, p2x, p2y); 
    var o2 = pointsOrientation(p1x, p1y, q1x, q1y, q2x, q2y); 
    var o3 = pointsOrientation(p2x, p2y, q2x, q2y, p1x, p1y); 
    var o4 = pointsOrientation(p2x, p2y, q2x, q2y, q1x, q1y); 
  
    // General case 
    if (o1 != o2 && o3 != o4) 
        return true; 
  
    // Special Cases 
    // p1, q1 and p2 are colinear and p2 lies on segment p1q1 
    if (o1 == 0 && onSegment(p1x, p1y, p2x, p2y, q1x, q1y)) return true; 
  
    // p1, q1 and q2 are colinear and q2 lies on segment p1q1 
    if (o2 == 0 && onSegment(p1x, p1y, q2x, q2y, q1x, q1y)) return true; 
  
    // p2, q2 and p1 are colinear and p1 lies on segment p2q2 
    if (o3 == 0 && onSegment(p2x, p2y, p1x, p1y, q2x, q2y)) return true; 
  
     // p2, q2 and q1 are colinear and q1 lies on segment p2q2 
    if (o4 == 0 && onSegment(p2x, p2y, q1x, q1y, q2x, q2y)) return true; 
  
    return false; // Doesn't fall in any of the above cases 
} 

/* COLOR FUNCTIONS */
function hightlightColor (color) {
    var f = parseInt(color.slice(1),16),
    	R = f >> 16,
    	G = f >> 8 & 0x00FF,
    	B = f & 0x0000FF;
    	var hsv = RGBtoHSV(R, G, B);

    	if (hsv.v < 0.5){
    		hsv.v += 0.4;
    	}else{
    		hsv.v -= 0.4;
    	}

    	var rgb = HSVtoRGB(hsv.h, hsv.s, hsv.v);
    	R = rgb.r;
    	G = rgb.g;
    	B = rgb.b;
    	/*
    	if (R > 200 || G > 200 || B > 200){
    		// Make color darker
    		ret = "#" + pad(Math.round((clamp((R * 0.8),0,255) << 16) + (clamp(G * 0.8, 0, 255) << 8) + clamp(B * 0.8,0,255)).toString(16), "0", true, 6) ;
    	}else{
    		// Make color brighter
    		ret = "#" + pad(Math.round((clamp(((R + 20) * 1.2),0,255) << 16) + (clamp(((G + 20) * 1.2),0,255) << 8) + clamp(((B + 20) * 1.2),0,255)).toString(16), "0", true, 6);
    	}*/
    	ret = rgbToHexString(R,G,B);
    	return ret;
    //return "#"+(0x1000000 + (Math.round((t-R)*p)+R) * 0x10000 + (Math.round((t-G)*p)+G) * 0x100 + (Math.round((t-B)*p)+B)).toString(16).slice(1);
}

function rgbToHexString(R,G,B){
	return "#" + pad(Math.round((clamp(R,0,255) << 16) + (clamp(G,0,255) << 8) + clamp(B,0,255)).toString(16), "0", true, 6)
}

// returns N different colors, evenly spaced in the color wheel
function getColorWheelSet(n, randomStart){

	var colors = [];
	var h = randomStart? Math.random() : 0;
	var s = 1;
	var v = 1;
	var separation = 1 / n;
	for (var i = 0; i < n; i++){
		h += separation;
		if (h > 1){
			h -= 1;
		}
		var rgbColor = HSVtoRGB(h,s,v);
		colors.push(rgbToHexString(rgbColor.r, rgbColor.g, rgbColor.b));
	}

	return colors;
}

function hexToRGBA(hex, alpha){
    var c;
    alpha = alpha == undefined? 1 : alpha;
    if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
        c= hex.substring(1).split('');
        if(c.length== 3){
            c= [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c = '0x'+c.join('');
        return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+',' + alpha + ')';
    }
    return '';
}
/*
Utils.RGBtoHSV = function(r, g, b) {
    if (arguments.length === 1) {
        g = r.g, b = r.b, r = r.r;
    }
    var max = Math.max(r, g, b), min = Math.min(r, g, b),
        d = max - min,
        h,
        s = (max === 0 ? 0 : d / max),
        v = max / 255;

    switch (max) {
        case min: h = 0; break;
        case r: h = (g - b) + d * (g < b ? 6: 0); h /= 6 * d; break;
        case g: h = (b - r) + d * 2; h /= 6 * d; break;
        case b: h = (r - g) + d * 4; h /= 6 * d; break;
    }

    return {
        h: h,
        s: s,
        v: v
    };
}
*/

Utils.RGBtoHSV = function (r, g, b) {
    let rabs, gabs, babs, rr, gg, bb, h, s, v, diff, diffc;
    rabs = r / 255;
    gabs = g / 255;
    babs = b / 255;
    v = Math.max(rabs, gabs, babs),
    diff = v - Math.min(rabs, gabs, babs);
    diffc = c => (v - c) / 6 / diff + 1 / 2;
    if (diff == 0) {
        h = s = 0;
    } else {
        s = diff / v;
        rr = diffc(rabs);
        gg = diffc(gabs);
        bb = diffc(babs);

        if (rabs === v) {
            h = bb - gg;
        } else if (gabs === v) {
            h = (1 / 3) + rr - bb;
        } else if (babs === v) {
            h = (2 / 3) + gg - rr;
        }
        if (h < 0) {
            h += 1;
        }else if (h > 1) {
            h -= 1;
        }
    }
    return {
        h: h,
        s: s,
        v: v
    };
}

function HSVtoRGB(h, s, v) {
    var r, g, b, i, f, p, q, t;
    if (arguments.length === 1) {
        s = h.s, v = h.v, h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}

/* PROBABILITY */

/* Returns a random with normal distribution, defined by mean and stdev */
function randomNormalDistribution(mean, stdev) {
  return (((Math.random()*2-1)+(Math.random()*2-1)+(Math.random()*2-1))*stdev+mean);
}

/* Returns a random value between minValue and maxValue */
function randomUniformDistribution(minValue, maxValue){
	var intervalSize = maxValue - minValue;
	return (minValue + Math.random() * intervalSize);
}

/* Returns a random integer between minValue and maxValue */
function randomInteger(minValue, maxValue){
	var intervalSize = maxValue - minValue + 1;
	var targetValue = minValue + Math.floor(Math.random() * intervalSize)
	return (targetValue > maxValue ? maxValue : targetValue);
}

/* Returns a random boolean value */
function randomBoolean(){
	return (Math.random() > 0.5);
}

/* HTML functions */
function emptySelect(selectBox){
	var i;
    for(i = selectBox.options.length - 1 ; i >= 0 ; i--){
        selectBox.remove(i);
    }
}

/*  MISCELANEOUS FUNCTIONS  */

// return a promise that always resolve (even if the original promise fails)
Utils.promiseAlwaysResolve = function(otherP){
    var p = new Promise(function(resolve, reject){
        otherP.then(resolve);
        otherP.catch(function(error){
            resolve(null);
        });
    });
    return p;
}

Utils.promiseSome = function(promiseArray){
    var promiseAllArray = [];

    for (var i = 0; i < promiseArray.length; i++){
        promiseAllArray.push(Utils.promiseAlwaysResolve(promiseArray[i]));
    }

    return Promise.all(promiseAllArray);
}

Utils.autoResolvePromise = function(){
    return new Promise(function(resolve, reject){
        resolve();
    });
}

Utils.savePropertiesToObject = function(obj1, obj2, propertiesToUpdate){
    for (var i = 0; i < propertiesToUpdate.length; i++){
        obj1[propertiesToUpdate[i]] = obj2[propertiesToUpdate[i]];
    }
}

Utils.objectToArray = function(obj, keyPropName){
    var keys = Object.keys(obj);
    var objectArray = [];
    for (var i = 0; i < keys.length; i++){
        var key = keys[i];
        var o = obj[key];
        o[keyPropName] = key;
        objectArray.push(o);
    }
    return objectArray;
}

Utils.sortObjectByKeys = function(obj){
    var sortable = [];
    // pass properties to an array
    for (var o in obj){
        sortable.push([o, obj[o]]);
    }
    // sort the array
    sortable.sort(function(a, b) {
        if (a[0] > b[0]){
            return 1;
        }else if (a[0] < b[0]){
            return -1;
        }else{
            return 0;            
        } 
    });
    obj = {};
    // pass elements to the object back
    for (var i = 0; i < sortable.length; i++){
        obj[sortable[i][0]] = sortable[i][1];
    }
    return obj;
}

function selectTextInInput(input) {
    if (input && input.value){
        input.setSelectionRange(0, input.value.length);
    }
}

function toPercentageStr(r){
	return (r * 100).toFixed(2) + "%";
}

// alias for 'toPercentageStr'
Utils.formatPercentage = function(r){
    return toPercentageStr(r);
}

function fromPercentageStr(s){
	var r = parseFloat(s.substring(0, s.length - 1));
	return r / 100;
}

// creates a non recursive copy of an object (only first level objects will be copied)
function createCopyObject(obj){
	var copyObj = {};
	for (var a in obj){
		copyObj[a] = obj[a];
	}
	return copyObj;
}

Utils.basicAuthenticationEncode = function(id, pass){
    return btoa(id + ":" + pass);
}

function dataURItoBlob(dataURI) {
    // convert base64/URLEncoded data component to raw binary data held in a string
    var byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0)
        byteString = atob(dataURI.split(',')[1]);
    else
        byteString = unescape(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to a typed array
    var ia = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ia], {type:mimeString});
}

function isBrowserIE(){
	var ua = window.navigator.userAgent;
	var rv = false;

 	if (ua.indexOf('MSIE ') > 0) { // IE 10 or older
 		rv = true;
 	}

	if (ua.indexOf('Trident/') > 0) { // IE 11
		rv = true;
	}
	return rv;
}

function blockCursor(){
	document.body.style.cursor = 'wait';
}

function defaultCursor(){
	document.body.style.cursor = 'default';
}

function getCurrentURL(){
	return new URL(window.location.href);
}

function getCurrentURLParameters(){
	return window.location.search.substring(1);
}

function numberFromPXString(str){
	var index = str.indexOf("px");
	return parseFloat(str.substring(0, index));
}


/*
// Given a rect defined by points (x1, y1) and (x2, y2),
// Returns the other coordinate of a point in the rect, where the first coordinate is either interX or interY
function pointInRect(x1, y1, x2, y2, interX, interY){
	var a = y1 - y2;
	var b = x2 - x1;
	var c = (x1 - x2) * y1 + (y2 - y1) * x1;
	if (interX != undefined){

	}else if (interY != undefined){

	}
}
*/

function copyToClipboard(text){
	var textArea = document.createElement("textarea");
	textArea.style.position = 'fixed';
  	textArea.style.top = 0;
  	textArea.style.left = 0;
	textArea.style.width = '2em';
  	textArea.style.height = '2em';
	textArea.style.padding = 0;
	textArea.style.border = 'none';
  	textArea.style.outline = 'none';
  	textArea.style.boxShadow = 'none';
	textArea.style.background = 'transparent';
	textArea.value = text;
	document.body.appendChild(textArea);
	textArea.select();
	document.execCommand('copy');
	document.body.removeChild(textArea);
}

/* COLLISION DETECTION FUNCTIONS  */


/*
*  Given a point (x,y) and a target rectangle (centerX, centerY, width, height),
   returns true if the point collides with the rectangle.
*/
function rect2dCollisionDetection(x, y, centerX, centerY, width, height){
	return ((x >= centerX - width / 2) && (x <= centerX + width / 2)
		&& (y >= centerY - height / 2) && (y <= centerY + height / 2));
}

/*
*  Given a point (x,y) and a target ellipse (centerX, centerY, xRadius, yRadius),
   returns true if the point collides with the ellipse.
*/
function ellipse2dCollisionDetection(x, y, centerX, centerY, xRadius, yRadius){
	return (Math.pow(x - centerX, 2) / Math.pow(xRadius,2) + Math.pow(y - centerY, 2) / Math.pow(yRadius,2)) <= 1;
}


/* DEBUG FUNCTIONS */
function drawMousePosition(context, mousePosition){
	context.save();
	context.beginPath();
	context.strokeStyle = "black";
	context.globalAlpha = 0.9;
	context.moveTo(mousePosition.x, 0);
	context.lineTo(mousePosition.x, context.canvas.height);

	context.moveTo(0, mousePosition.y);
	context.lineTo(context.canvas.width, mousePosition.y);

	context.fillStyle = "black";
	context.fillText("(" + formatTo2decimalPlaces(mousePosition.x) + "  ,  " + formatTo2decimalPlaces(mousePosition.y) + ")", mousePosition.x + 5, mousePosition.y - 5);

	context.stroke();
	context.closePath();
	context.restore();
}

function dataURLtoFile(dataurl, filename) {
    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {type:mime});
}

/**
 * Draws a rounded rectangle using the current state of the canvas.
 * If you omit the last three params, it will draw a rectangle
 * outline with a 5 pixel border radius
 * @param {CanvasRenderingContext2D} ctx
 * @param {Number} x The top left x coordinate
 * @param {Number} y The top left y coordinate
 * @param {Number} width The width of the rectangle
 * @param {Number} height The height of the rectangle
 * @param {Number} [radius = 5] The corner radius; It can also be an object
 *                 to specify different radii for corners
 * @param {Number} [radius.tl = 0] Top left
 * @param {Number} [radius.tr = 0] Top right
 * @param {Number} [radius.br = 0] Bottom right
 * @param {Number} [radius.bl = 0] Bottom left
 * @param {Boolean} [fill = false] Whether to fill the rectangle.
 * @param {Boolean} [stroke = true] Whether to stroke the rectangle.
 */
function roundRect(ctx, x, y, width, height, fill, stroke, radius) {
	if (typeof stroke == 'undefined') {
		stroke = true;
	}
	if (typeof radius === 'undefined') {
		radius = 5;
	}
	if (typeof radius === 'number') {
		radius = {tl: radius, tr: radius, br: radius, bl: radius};
	} else {
		var defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
		for (var side in defaultRadius) {
			radius[side] = radius[side] || defaultRadius[side];
		}
	}
	ctx.beginPath();
	ctx.moveTo(x + radius.tl, y);
	ctx.lineTo(x + width - radius.tr, y);
	ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
	ctx.lineTo(x + width, y + height - radius.br);
	ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
	ctx.lineTo(x + radius.bl, y + height);
	ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
	ctx.lineTo(x, y + radius.tl);
	ctx.quadraticCurveTo(x, y, x + radius.tl, y);
	ctx.closePath();
	if (fill) {
		ctx.fill();
	}
	if (stroke) {
		ctx.stroke();
	}
}

/* DEGREES AND RADIANS */

function degreesToRadians(angle){
	return angle * Math.PI / 180;
}

function radiansToDegress(angle){
	return angle * 180 / Math.PI;
}

/* Image functions*/
Utils.resizeImage = function(selectedImage, maxWidth, maxHeight, fillContainer){
    var isVideo = selectedImage instanceof HTMLVideoElement;
    var imageWidth = isVideo? selectedImage.videoWidth : selectedImage.width;
    var imageHeight = isVideo? selectedImage.videoHeight : selectedImage.height;

    var resize = { width : 0, height: 0 };
    if (fillContainer){ 
        if ((imageWidth / maxWidth) < (imageHeight / maxHeight)){
            // width drives 
            resize.width = maxWidth;
            resize.x = 0;
            resize.height = imageHeight * maxWidth / imageWidth;
            resize.y = resize.height - maxHeight / 2;
        }else{
            resize.width = imageWidth * maxHeight / imageHeight;
            resize.x = resize.width - maxWidth / 2;
            resize.height = maxHeight;
            resize.y = 0;
        }
    }else{
        if (maxWidth > imageWidth && maxHeight > imageHeight){
            resize.width = imageWidth;
            resize.height = imageHeight;
        }else if (maxWidth < imageWidth && maxHeight > imageHeight){
            resize.height = imageHeight  * maxWidth / imageWidth;
            resize.width = maxWidth;
        }else if (maxWidth > imageWidth && maxHeight < imageHeight){
            resize.width = imageWidth * maxHeight / imageHeight;
            resize.height = maxHeight;
        }else{
            // neither width or height are sufficient
            if ((imageWidth / maxWidth) > (imageHeight / maxHeight)){
                // width drives 
                resize.width = maxWidth;
                resize.height = imageHeight * maxWidth / imageWidth;
            }else{
                resize.width = imageWidth * maxHeight / imageHeight;
                resize.height = maxHeight;
            }
        }       
    }
    return resize;
}



/*
* Calculates the distance between a point and an infinite line.
* x1, y1: Coordinates of the first point that defines the line
* x2, y2: Coordinates of the second point that defines the line
* xp, yp: Coordinates of the point to test
*/
function distanceLinePoint(x1, y1, x2, y2, xp, yp){
	var ydif = (y2-y1);
	var xdif = (x2-x1);
	var denominator = Math.sqrt(ydif * ydif + xdif * xdif);
	if (denominator != 0){
		return (Math.abs(ydif * xp - xdif * yp + x2*y1 - y2*x1) / denominator);
	}else{
		return 0;
	}
}

function sqr(x) {
	return x * x
}

function dist2(x1,y1, x2,y2) {
	return sqr(x1 - x2) + sqr(y1 - y2);
}

Utils.dist = function(x1, y1, x2, y2){
	return Math.sqrt(dist2(x1,y1,x2,y2));
}

function distToSegmentSquared(x1, y1, x2, y2, xp, yp) {
  var l2 = dist2(x1, y1, x2, y2);
  if (l2 == 0) return dist2(xp, yp, x1, y1);
  var t = ((xp - x1) * (x2 - x1) + (yp - y1) * (y2 - y1)) / l2;
  t = Math.max(0, Math.min(1, t));
  var nx1 = x1 + t * (x2 - x1);
  var ny1 = y1 + t * (y2 - y1);
  return dist2(xp, yp, nx1, ny1);
}

function distToSegment(x1, y1, x2, y2, xp, yp) {
	return Math.sqrt(distToSegmentSquared(x1, y1, x2, y2, xp, yp));
}
