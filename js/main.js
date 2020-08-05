
function aboutPageOpen() {
    var element = document.getElementById("about-page-content");
    element.classList.add("display-about");
    
    document.querySelectorAll('.designer-name').forEach(item => {
        item.classList.add('turn-text-white');
    });
 
    document.querySelectorAll('.nav-span').forEach(item => {
        item.classList.add('turn-to-white');
    });
 }
function aboutPageClose() {
    var element = document.getElementById("about-page-content");
    element.classList.remove("display-about");

    document.querySelectorAll('.designer-name').forEach(item => {
        item.classList.remove('turn-text-white');
    });

    document.querySelectorAll('.nav-span').forEach(item => {
        item.classList.remove('turn-to-white');
    });
} 

var viewportwidth;
 var viewportheight;
  
 // the more standards compliant browsers (mozilla/netscape/opera/IE7) use window.innerWidth and window.innerHeight
  
 if (typeof window.innerWidth != 'undefined')
 {
      viewportwidth = window.innerWidth,
      viewportheight = window.innerHeight
 }
  
// IE6 in standards compliant mode (i.e. with a valid doctype as the first line in the document)
 
 else if (typeof document.documentElement != 'undefined'
     && typeof document.documentElement.clientWidth !=
     'undefined' && document.documentElement.clientWidth != 0)
 {
       viewportwidth = document.documentElement.clientWidth,
       viewportheight = document.documentElement.clientHeight
 }
  
 // older versions of IE
  
 else
 {
       viewportwidth = document.getElementsByTagName('body')[0].clientWidth,
       viewportheight = document.getElementsByTagName('body')[0].clientHeight
 }




 // page content distort 

 const body = document.body,
                scrollWrap = document.getElementsByClassName("smooth-scroll-wrapper")[0],
                height = scrollWrap.getBoundingClientRect().height - 1,
                speed = 0.001;

            var offset = 0;

            body.style.height = Math.floor(height) + "px";

            function smoothScroll() {
                offset += (window.pageYOffset - offset) * speed;

                var scroll = "translateY(-" + offset + "px) translateZ(0)";
                scrollWrap.style.transform = scroll;

                callScroll = requestAnimationFrame(smoothScroll);
            }

            smoothScroll();
            const content = document.querySelector("section");
            let currentPos = window.pageYOffset;

            const callDistort = function () {
                const newPos = window.pageYOffset;
                const diff = newPos - currentPos;
                const speed = diff * 0.08;

                content.style.transform = "skewY(" + speed + "deg)";
                currentPos = newPos;
                requestAnimationFrame(callDistort);
            };
            callDistort();



//function that prevents doubleclick error on menu buttons when initialising menu spin
window.onload = function(){ 
var editorial = document.getElementById("editorial-page");
if (editorial)
{
    editorial.addEventListener("click", editorialPageOpen());
}

var ecomp = document.getElementById("ecomm-page");
if (ecomp)
{
    ecomp.addEventListener("click", ecommPageOpen());
}

var agency = document.getElementById("agency-page");
if (agency)
{
    agency.addEventListener("click", agencyPageOpen());
}

var jewelryp = document.getElementById("jewelry-page");
if (jewelryp)
{
    jewelryp.addEventListener("click", jewelryPageOpen());
}

var beauty = document.getElementById("beauty-page");
if (beauty)
{
    beauty.addEventListener("click", beautyPageOpen());
}

var uxp = document.getElementById("ux-page");
if (uxp)
{
    uxp.addEventListener("click", uxPageOpen());
}
}

//menu button actions



function ecommPageOpen() {
    

 document.querySelector('#ecomm-page').addEventListener('click', event => {
    document.querySelectorAll('#ecommerce-content').forEach(item => {
        item.style.cssText = "display: block; margin-top: -100px; position: relative;";
    });
    document.querySelectorAll('#editorial-content, #agency-content, #jewelry-content, #beauty-content, #ux-content, #about-content').forEach(item => {
        item.style.display = "none"; 
    });

    // Site.transitionToContent(event)
    Site.snapBannerToImage(Site.bannerImages[1]);
 })
}


function agencyPageOpen() {
    document.querySelectorAll('#agency-content').forEach(item => {
        item.style.cssText = "display: block; margin-top: -100px; position: relative;";
    });
    document.querySelectorAll('#ecommerce-content, #editorial-content, #jewelry-content, #beauty-content, #ux-content, #about-content').forEach(item => {
        item.style.display = "none"; 
    });
    // Site.transitionToContent(event)
    Site.snapBannerToImage(Site.bannerImages[2]);
 }

 function jewelryPageOpen() {
    document.querySelectorAll('#jewelry-content').forEach(item => {
        item.style.cssText = "display: block; margin-top: -100px; position: relative;";
    });
    document.querySelectorAll('#ecommerce-content, #editorial-content, #agency-content, #beauty-content, #ux-content, #about-content').forEach(item => {
        item.style.display = "none"; 
    });
    // Site.transitionToContent(event)
    Site.snapBannerToImage(Site.bannerImages[3]);
 }
 
 function beautyPageOpen() {
    document.querySelectorAll('#beauty-content').forEach(item => {
        item.style.cssText = "display: block; margin-top: -100px; position: relative;";
    });
    document.querySelectorAll('#ecommerce-content, #editorial-content, #agency-content, #jewelry-content, #ux-content, #about-content').forEach(item => {
        item.style.display = "none"; 
    });
    // Site.transitionToContent(event)
    Site.snapBannerToImage(Site.bannerImages[4]);
 }

 function uxPageOpen() {
    document.querySelectorAll('#ux-content').forEach(item => {
        item.style.cssText = "";
    });
    document.querySelectorAll('#ecommerce-content, #editorial-content, #agency-content, #jewelry-content, #beauty-content, #about-content').forEach(item => {
        item.style.display = "none"; 
    });
    // Site.transitionToContent(event)
    Site.snapBannerToImage(Site.bannerImages[5]);
 }

 function editorialPageOpen() {
    document.querySelectorAll('#editorial-content').forEach(item => {
        item.style.cssText = "display: block; margin-top: -100px; position: relative;";
    });
    document.querySelectorAll('#ecommerce-content, #agency-content, #jewelry-content, #beauty-content, #ux-content, #about-content').forEach(item => {
        item.style.display = "none"; 
    });
    // Site.transitionToContent(event)
    Site.snapBannerToImage(Site.bannerImages[0]);
 }

 function scrollToTop() { 
    window.scrollTo(0, 0); 

    document.querySelectorAll('#ecommerce-content, #editorial-content, #agency-content, #jewelry-content, #ux-content, #about-content, #beauty-content').forEach(item => {
        item.style.display = "none"; 
    });
} 