let $ = document.querySelector.bind(document);
let $$ = document.querySelectorAll.bind(document);
let $id = document.getElementById.bind(document);
let $class = document.getElementsByClassName.bind(document);
let $tag = document.getElementsByTagName.bind(document);

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

function onEnter(func, argument){
  if(event.key == "Enter")func(argument);
}
