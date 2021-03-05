


// Needs to be cleaned!



var saveLayoutTimeout;


function dragItem(e){
  var query = 'aside section[page="'+e.target.getAttribute('page')+'"]';
  e.dataTransfer.setData("text", query);

  var element = e.target;

  requestAnimationFrame(function () {
    element.style.display = 'none';
  });
}

function itemDrop(e){
  var target = e.target.tagName == 'SECTION' ? e.target : e.target.parentNode;
  e.preventDefault();
  var el = $(e.dataTransfer.getData('text'));
  dragReorder(target.getAttribute('page'), el.getAttribute('page'))
  el.style.display = '';
  target.style.margin = 0;
  document.querySelectorAll('aside section').forEach(a => a.style.margin = 0)
  target.outerHTML += el.outerHTML;
  el.outerHTML = '';
}

function itemDropReplace(e){
  var target = e.target.tagName == 'SECTION' ? e.target : e.target.parentNode;
  e.preventDefault();
  var el = $(e.dataTransfer.getData('text'));
  dragReorder(target.getAttribute('page'), el.getAttribute('page'))
  target.outerHTML = el.outerHTML;

}


function itemDragEnter(e){
  var el = e.target.tagName == 'SECTION' ? e.target : e.target.parentElement;
  el = el.tagName == 'SECTION' ? el : el.parentElement;

  // if(el.offsetTop + 57 + 25 - e.clientY > 0) el.style.marginTop = '50px';
  // else el.style.marginBottom = '50px';
  el.style.marginBottom = '50px';
}

function itemDragLeave(e){
  console.log(e);

  if(e.relatedTarget && e.relatedTarget.nodeName != 'SECTION' &&
     e.relatedTarget.nodeName != 'ASIDE')return;
  if(e.target.style){
    event.target.style.margin = 0
  }
}


function dragReorder(h, k){
  var result = []
  sidebarItems.forEach(a => {
    if(a.url == k)return;
    if(a.url == h){
      result.push(a);
      result.push(sidebarItems.find(c => c.url == k))
      return;
    }
    result.push(a);
  })
  sidebarItems = result;

  backup();

  $('aside .bottom').style.marginBottom = 0;
  clearTimeout(saveLayoutTimeout);
  saveLayoutTimeout = setTimeout(() => {
    $('aside .bottom').style.marginBottom = '-49px';
  }, 5000)

}
