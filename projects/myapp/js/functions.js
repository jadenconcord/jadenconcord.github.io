


// Page

function page(url, e){

  runExtentions('onPage', url)


  currentPage = url;
  backup();

  // If the item close button was clicked dont change page
  if(e && e.target.classList.contains('button'))return;

  if(sidebarItems.find(a => a.url == url)) // If an item with url esists make it active
  sidebarItems.forEach(item => {
    item.active = url == item.url;
  });

  else { // Add item to sidebar with the url
    sidebarItems.forEach(a => a.active = false); // set all items to inactive
    var page = pages.find(a => a.url == url);
    if(page)sidebarItems.push({...page, active: true});
  }

  content.getTemplate(url, () => {
  }, (status, msg)=>{
    errorStatus = status;
    errorMessage = msg;
    content.getTemplate('page/404.xml')
    runExtentions('onPageLoad', 'page/404.xml')
  });
  generateSidebar(sidebarItems);
  runExtentions('onPageLoad', url)
}

function generateSidebar(items){
  let result = '';
  items.forEach((item, i) => {
    var buttonAction = '';
    if(item.button == 'close')buttonAction = `closeItem('${item.url}')`
    else if(item.button == 'extension')buttonAction = `page('page/extentions.xml')`;
    if(item.show != false);
    result += `
      <section page="${item.url}" draggable="true" ondragover="event.preventDefault()"
      ondragstart="dragItem(event)" ondrop="itemDrop(event)"
      ondragenter="itemDragEnter(event)"
      ondragleave="itemDragLeave(event)"
      ondragend="event.target.style.display=''"
      onclick="page('${item.url}', event)" ${item.active ? 'class="active"' : ''}>
        <i class="icon">${item.icon}</i>
        <span>${item.name}</span>
        ${item.button ? `<i class="button"
        ${buttonAction ? 'onclick="'+buttonAction+'"' : ''}>
        ${item.button}</i>` : ''}
      </section>
    `
  });
  result += `<div class="bottom"><button>Save</button></div>`
  $('aside').innerHTML = result;
}

function closeItem(url){
  sidebarItems.splice(sidebarItems.findIndex(a => a.url == url), 1);
  backup();
  generateSidebar(sidebarItems);
}


// Extentions / Themes

function genExtentions(){
  var result = '';
  extentions.forEach((a, i) => {
    if(!user.extentions.find(b => b.name == a.name))
    result += `<section>
      <div class="top">
        <i>${a.icon}</i>
        <span>${a.name}</span>
        <button class="b1 theme" onclick="installExtention(${i}, event)">Install</button>
      </div>
      <p>${a.description}</p>
    </section>`
  })
  return result;
}

function genInstalledExtentions(){
  var result = '';
  user.extentions.forEach((a, i) => {
    result += `<section>
      <div class="top">
        <i>${a.icon}</i>
        <span>${a.name}</span>
        <button class="b1" onclick="removeExtention(${i})">Remove</button>
      </div>
      <p>${a.description}</p>
    </section>`
  })
  return result;
}

async function installExtention(i, e){
  e.target.innerHTML = 'Installing...';
  e.target.classList.remove('theme');
  e.target.onclick = null;
  try{
    var a = await fetch(extentions[i].url);
    var b = await a.json();
  }catch (err){
    console.error(err);
    e.target.innerHTML = 'Error';
    return;
  }
  user.extentions.push({...extentions[i], data:b});
  page('page/extentions.xml');
  eval(b.onInstall);
  eval(b.onStart);
  backup();
}

function removeExtention(i){
  eval(user.extentions[i].data.onRemove)
  user.extentions.splice(i, 1);
  backup();
  page('page/extentions.xml');
}

var currentExtention;

function setExtentionValue(name, value){
  currentExtention.data[name] = value;
}
function getExtentionValue(name){
  return currentExtention.data[name];
}

function runExtentions(key, input){
  user.extentions.forEach((a, i) => {
    currentExtention = user.extentions[i];
    try{
      var result = a.data[key] && eval(a.data[key]);
      if(typeof result == 'function')result(input)
    }catch(err){
      console.error('Extention: '+a.name+': '+err);
    }
  })
}

function genThemes(){
  var result = '';
  themes.forEach((a, i) => {
    result += `<section class="theme-box">
      <div class="top">
        <i>brush</i>
        <span>${a.name}</span>
        <button class="${a.name == user.theme ? 'b1 disabled' : 'b1 theme'}" onclick="changeTheme(${i}, event)">${a.name == user.theme ? 'Active' : 'Use'}</button>
      </div>
      <p>${a.description}</p>
    </section>`
  })
  return result;
}

function changeTheme(i, e){
  if(e){
    $$('.box1-outer section div button').forEach((a) => {
      a.innerHTML = 'Use';
      a.classList.add('theme');
      a.classList.remove('disabled');
    })
    e.target.innerHTML = 'Active'
    e.target.classList.remove('theme');
    e.target.classList.add('disabled');
  }
  user.theme = themes[i].name;
  console.log(themes[i].url);
  $('#stylesheet').href = themes[i].url;
  backup();
}

// user

function resetData(){
  popup.prompt('Are you sure you want to clear your data?', (result) => {
    console.log(result);
    if(result.submitButton == 2){
      localStorage.removeItem('myapp');
      window.location.reload();
    }
  }, 'Cancel', 'Delete', 'All your account data will be removed')
}
