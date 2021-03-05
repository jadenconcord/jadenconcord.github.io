console.log("hello");
var doc = document.documentElement.scrollTop
window.onscroll = function() {onScroll()}

var down = false

onScroll();

function onScroll(){
  var y = (window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0)
  if(isNaN(parseInt(y))) y = 0

  header = document.getElementsByTagName('header')[0]
  if(y>0 && !down){
    header.className += "down"
    document.getElementById('header-logo').src = "img/thecircle-white.svg"
    down = true
  }
  else if (y<=0 && down){
    header.className = ""
    document.getElementById('header-logo').src = "img/thecircle.svg"
    down = false
  }

  var title = document.getElementsByClassName('title-section')[0]
  title.style.transform = 'translateY('+y/2+'px)'
}
