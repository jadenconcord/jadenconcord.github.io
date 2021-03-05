let projectPopup = Prompter({}, getTemplate('addProject'));
projectPopup.variables = {value:{t:'a'}}
let removeProjectPopup = Prompter({width: 400}, getTemplate('removeProject'));



let messageTimeout;
let projectsCatch;
let starredTemplate = Template('#starred');
starredTemplate.template = getTemplate('projects-template');
let projectsTemplate = Template('#projects');

let getProjects = async () => {
  let res = await fetch('/getprojects');
  let result = await res.json();
  projectsCatch = result;
  return result;
}

let placeholderProjects = []

for (let i = 0; i < 6; i++){
  placeholderProjects.push({
    name: "&nbsp;",
    icon: "article",
    class: "placeholder",
    grad: ["#fff1", "#fff1"],
  })
}

showPlaceholder();

document.body.onload = () => {
  loadProjects();
}

////////////////////////////////////////////////////////////////////////////////

function showPlaceholder(){
  projectsTemplate.update({projects: placeholderProjects});
}

function loadProjects(){
  showPlaceholder();
  setTimeout(() => {setProjects()}, 500);
}

async function setProjects(){
  let projects = await getProjects();
  projectsTemplate.update({projects: projects.reverse()});
  starredTemplate.update({projects: projects.filter(project => project.star)});
}

function settingsPopup(){
  Prompter({width:300}).alert('Settings not yet implemented');
}

function message(text){
  $('.message').innerText = text;
  $('.message').style.display = 'block';

  messageTimeout = setTimeout(() => {
    $('.message').style.display = 'none';
  }, 5000)
}



async function post(action, data){
  let res = await fetch('/api', {
    method: 'POST',
    headers: {'Content-Type': 'text/plain'},
    body: JSON.stringify({action, ...data}),
  })
  let text = await res.text();
  let result = JSON.parse(text)
  if(result.error)console.error("API ERROR: "+result.message);
  message(result.message);
  return result;
}

////////////////////////////////////////////////////////////////////////////////


async function createProject(action){
  let data = projectPopup.getData()
  projectPopup.hide();

  res = await post(action, data);
  loadProjects();
}

function developProject(dir){
  post('develop', {dir});
}

async function removeProject(dir, action){
  removeProjectPopup.hide();
  let res = await post(action, {dir});
  loadProjects();
}

function starProject(self, dir){
  let starred = self.textContent == 'star'
  if(starred){
    self.textContent = 'star_outline';
    self.classList.remove('star');
  }else {
    self.textContent = 'star';
    self.classList.add('star');
  }

  post('edit', {dir, star: !starred})
}

function privateProject(self, dir){
  let private = self.textContent == 'lock';
  self.textContent = private ? 'public' : 'lock';

  post('edit', {dir, private: !private})
}

function promptEditProject(dir){
  let {name,type,icon,grad:[color1, color2]} = projectsCatch.find(current => current.dir == dir);
  projectPopup.show({name,type,icon,color1,color2,dir});
}

async function editProject(dir){
  projectPopup.close();
  let {name,type,icon,color1,color2} = projectPopup.getData();
  await post('edit', {dir, name, type, icon, grad: [color1, color2]});
  loadProjects();
}


////////////////////////////////////////////////////////////////////////////////


function setSearch(){
  search($('input[name="search"]').value);
}

function search(query){
  let condition = (a) => a.toLowerCase().indexOf(query) >= 0;
  projectsTemplate.update({
    projects: projectsCatch.filter(project => condition(project.name)),
  })
}

function redirect(url){
  window.location = url;
}

////////////////////////////////////////////////////////////////////////////////



let iconPopup = Prompter({width: 400}, `
  {input placeholder="Search" onkeyup="iconSearch(this.value)"/}
  <a href="https://material.io/icons" target="_blank">Material Icons</a><div class="iconlist">

  {skip}
    <div class="icons"><template>
      {each icons icon}
        <i title="{icon}" onclick="selectIcon('{icon}')" tabindex="0">{icon}</i>
      {/each}
    </template></div>
  {/skip}
`)
let iconTemplate;

function promptIcon(){
  iconPopup.show();
  iconTemplate = Template('.icons').update({icons:iconList});
}

function iconSearch(term){
  iconTemplate.update({icons:iconList.filter(icon => icon?.indexOf(term) >= 0)})
}

function selectIcon(icon){
  iconPopup.hide();
  $('input[name="icon"]').value = icon;
}
