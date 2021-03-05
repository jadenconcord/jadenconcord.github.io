function format(command, value) {
  document.execCommand(command, false, value);
}

var textarea = document.getElementById('page');
textarea.addEventListener('keydown', function(e) {
  if (e.key == "Tab") {
    format('insertText', '\t')
    e.preventDefault();
  }
  if (e.key == "F12") {
    if (e.shiftKey) {
      format('insertUnorderedlist');
      e.preventDefault();
    } else {
      format('insertOrderedlist');
      e.preventDefault();
    }
  }
  if (e.ctrlKey) {
    if (e.key == "l") {
      format('justifyLeft');
      e.preventDefault();
    }
    if (e.key == "r") {
      format('justifyRight');
      e.preventDefault();
    }
    if (e.key == "e") {
      format('justifyCenter');
      e.preventDefault();
    }
    if (e.key == "b") {
      format('bold');
      e.preventDefault();
    }
    if (e.key == "i") {
      format('italic');
      e.preventDefault();
    }
    if (e.key == "u") {
      format('underline');
      e.preventDefault();
    }
    if (e.key == "=" || e.key == "+") {
      format('increaseFontSize');
      e.preventDefault();
    }
    if (e.key == "-") {
      format('decreaseFontSize');
      e.preventDefault();
    }
  }
});

function changeFont() {
  format('fontName', document.getElementById('font').value);
}

function pageClick() {
  document.getElementById('font').value = "";
}

let saveBefore = '<!DOCTYPE html><html><body style="background: #333; margin: 0"><section style="box-sizing:border-box;max-width:8.5in;min-height:11in;padding:1in;background: #fff;margin:0 auto;">'
let saveAfter = '</section></body></html>'

function download() {
  var json_string = saveBefore + document.querySelector('#page').innerHTML + saveAfter;
  var link = document.createElement('a');
  link.download = fileName;
  var blob = new Blob([json_string], {type: 'text/plain'});
  link.href = window.URL.createObjectURL(blob);
  link.click();
}

function promptColor(after){
  let el = document.createElement('input');
  el.type = 'color';
  el.onchange = after;
  el.click();
}

function openFile(input){
  var reader = new FileReader();
  reader.onload = function(){
    var text = reader.result;
    document.querySelector('#page').innerHTML = text.replace(/^.+?<section.+?>(.+?)<\/section><\/body><\/html>/s, '$1');
  };
  if(input.files[0])
  reader.readAsText(input.files[0]);
}

let fileName = 'document.html';

function setFileName(value){
  fileName = value;
  document.querySelector('title').innerText = value;
}
