function $(query) {
  var result = document.querySelector(query);

  result.styles = function(styles) {
    for (var style in styles) {
      result.style[style] = styles[style];
    }
  };
  result.hide = function(){
    result.style.display = 'none';
  }
  result.show = function(display=""){
    result.style.display = display;
  }
  result.toggle = function(display=""){
    if(result.style.display == "none")result.style.display = display;
    else result.style.display = "none";
  }


  return result;
}

function $$(query) {
  var result = document.querySelectorAll(query);

  result.styles = function(styles) {
    for (var el = 0; el < result.length; el++) {
      for (var style in styles) {
        result[el].style[style] = styles[style];
      }
    }
  };
  result.hide = function() {
    result.forEach((c) => {
      if(c.style != undefined)
        c.style.display = "none";
    })
  }
  result.show = function(display=""){
    result.forEach((c) => {
      if(c.style != undefined)
        c.style.display = display;
    })
  }
  result.toggle = function(display="", invert=false){
    result.forEach((c) => {
      if (c.style.display == "none" || (!c.style.display && invert))c.style.display = display;
      else c.style.display = "none";
    })
  }

  return result;
}

function days_between(date1, date2) {
    const ONE_DAY = 1000 * 60 * 60 * 24;
    const differenceMs = date2 - date1;
    return Math.round(differenceMs / ONE_DAY);
}
