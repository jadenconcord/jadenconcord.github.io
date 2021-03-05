function $(query) {
  var result = document.querySelector(query);

  result.styles = function(styles) {
    for (var style in styles) {
      result.style[style] = styles[style];
    }
  };

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

  return result;
}
