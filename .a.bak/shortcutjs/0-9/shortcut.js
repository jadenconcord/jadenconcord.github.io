let $ = document.querySelector;
let $$ = document.querySelectorAll;
let $id = document.getElementById;
let $class = document.getElementsByClassName;
let $tag = document.getElementsByTagName;

// https://dev.to/jadenconcord/attempt-to-simplify-the-fetch-api-178b
let fetcher = (url, options) => {
  options = {
    parse: 'text',
    ...options
  }

  return (done) => {
    return (error) => {
      try {
        fetch(url).then(x => x[options.parse]()).then(done).catch(error);
      } catch (err) {
        error(err);
      }
    }
  }
}

function getTemplate(id) {
  return document.getElementById(id).innerHTML;
}

function emptyElement(el){
  while (el.firstChild) el.removeChild(el.firstChild);
}
