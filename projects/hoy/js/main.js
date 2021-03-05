let content = new Template('.content', false);
let sidebar = new Template('aside', false);
let currentPage = 0;

let setSidebarItmes = sidebar.link('items');

let sidebarItems = [{
  name: "Todo",
  active: true
}, {
  name: "Today"
}, {
  name: "Schedule"
}, {
  name: "View Today"
}];

let tasks = JSON.parse(localStorage.getItem('hoyTasks')) || [];
let blocks = JSON.parse(localStorage.getItem('hoyBlocks')) || [-1,-1,-1,-1,-1,-1,-1,-1];
let idCounter = tasks.reduce((b, item) =>
  b = Number(item.id) > b ? Number(item.id) : b, 0)+1;


function selectItem(id = 0) {
  currentPage = id;
  sidebarItems.forEach((item, i) => item.active = i == id);
  setSidebarItmes(sidebarItems);
  updateContent(id);

  if(id == 3)loadTimer();
}

function updateContent(id) {
  content.update({}, getTemplate('page' + id))
}

function getTaskOptions(blockId){
  let id = Number(blockId-1);
  var result = 'off:-';
  tasks.forEach((task,i) => {
    if(task.today)
      result += ','+(blocks[id] == task.id ? '!' : '')+task.id+':'+task.name
  });
  return result;
}



function addTask(){
  tasks.push({
    name: document.querySelector('#add-task-input').value || 'unnamed',
    today: false,
    id: idCounter++,
  })
  content.update();
  document.querySelector('#add-task-input').focus();
  backup();
}

function removeTask(i){
  tasks.splice(i, 1);
  backup();
  content.update();
}

function changeToday(id, checked){
  tasks[id].today = checked;
  backup();
}

function setBlock(blockId, self){
  let id = Number(blockId-1);
  blocks[id] = Number(self.value);
  backup();
}

function getBlockTask(blockId){
  let id = Number(blockId-1);
  let task = tasks.find(task => task.id == blocks[id])
  return task ? task.name : 'Nothing';
}

function backup(){
  localStorage.setItem('hoyTasks', JSON.stringify(tasks));
  localStorage.setItem('hoyBlocks', JSON.stringify(blocks));
}


let startTime = new Date(localStorage.getItem('hoyTime'));
let timerInterval;

function loadTimer(){
  if(localStorage.getItem('hoyTimeRunning') == "true"){
    resumeTimer();
    return;
  }else if(localStorage.getItem('hoyStopTime')){
    startTime = new Date((new Date()).getTime()-localStorage.getItem('hoyStopTime'));
    updateTimer();
    document.querySelector('.start-timer').textContent = "RESUME";
    document.querySelector('.start-timer').onclick = resumePausedTimer;
  }
}

function resumePausedTimer(){
  startTime = new Date((new Date()).getTime()-localStorage.getItem('hoyStopTime'));
  resumeTimer();
}

function startTimer(){
  localStorage.setItem('hoyTimeRunning', true);
  backup();
  startTime = new Date();

  resumeTimer();
}

function stopTimer(){
  localStorage.setItem('hoyTimeRunning', false);
  localStorage.setItem('hoyStopTime', ((new Date()).getTime()) - startTime.getTime());
  backup();
  clearInterval(timerInterval);
  document.querySelector('.start-timer').textContent = "START";
  document.querySelector('.start-timer').classList.add('b2');
  document.querySelector('.start-timer').onclick = resumePausedTimer;
}

function resumeTimer(){
  document.querySelector('.start-timer').textContent = "STOP";
  document.querySelector('.start-timer').classList.remove('b2');
  document.querySelector('.start-timer').onclick = stopTimer;

  timerInterval = setInterval(() => {
    if(currentPage == 3)updateTimer();
  }, 100)
}

function updateTimer(){
  let time = Math.round(((new Date()).getTime()-startTime.getTime())/1000)
  let seconds = time;
  let minutes = Math.floor(time/60);
  let hours = Math.floor(minutes/60);

  if(minutes/60 >= 8){
    localStorage.removeItem('hoyTime');
    startTimer();
    stopTimer();
    alert('FINISHED!')
  }

  // let hours = Math.round
  seconds = seconds % 60;
  minutes = minutes % 60;
  if(minutes < 10)minutes = '0' + minutes;
  if(seconds < 10)seconds = '0' + seconds;
  if(hours < 10)hours = '0' + hours;
  document.querySelector('.clock').innerText = hours + ':' + minutes + ':' + seconds;

  selectBlockTime(time);
}

let currentBlock;

function selectBlockTime(time){
  let block = Math.floor(time/60/60)+1;
  let name = '.block';
  if((block*60*60)-time<=900){
    name = '.break'
  }
  document.querySelectorAll('.block').forEach(block => block.classList.remove('active'))
  document.querySelectorAll('.break').forEach(block => block.classList.remove('active'))
  document.querySelector(name+block).classList.add('active');

  if(currentBlock != name + block){
    if(name == ".block"){
      new Audio('error.mp3').play();
      for(var i = 0; i < 30; i++){
        setTimeout(()=>{new Audio('error.mp3').play()}, i*5)
      }
    }else{
      new Audio('sucsess.mp3').play();
      for(var i = 0; i < 30; i++){
        setTimeout(()=>{new Audio('sucsess.mp3').play()}, i*5)
      }
    }
  }
  currentBlock = name + block;
}

function addToTimer(){
  startTime.setTime(startTime.getTime() - 1000*60*5);
  updateTimer();
}
function subFromTimer(){
  startTime.setTime(startTime.getTime() + 1000*60*5);
  updateTimer();
}

window.onload = function() {
  selectItem();
}
