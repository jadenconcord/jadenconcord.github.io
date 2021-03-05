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



function ajax(method, url, data, sucsess, error, timeout, ms=3000) {
  var Timeout;
  var xhr = new XMLHttpRequest();
  xhr.open(method, url);
  xhr.setRequestHeader("Accept", "application/json");
  xhr.onreadystatechange = function() {
    Timeout && clearTimeout(Timeout);
    if (xhr.readyState !== XMLHttpRequest.DONE) return;
    if (xhr.status === 200) {sucsess()} else {error()}
  };
  xhr.send(data);

  Timeout = setTimeout(function () {
    timeout();
  }, ms);


}
