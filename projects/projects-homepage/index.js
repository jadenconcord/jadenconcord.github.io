var express = require('express');
var bodyParser = require('body-parser');
var database = require('./db.js');

var {exec} = require('child_process');

var db = new database('data.json');
var publicDatabase = new database('../jadenconcord.github.io/projects.json');
var data = db.data;
var projects = data.projects;

var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.text());
app.use(express.static('projects'));
app.use(express.static('..'));

// app.get('/', function(req, res){
//    res.send("Hello world!");
// });

app.get('/', (req, res) => res.send('projects/index.html'));

app.get('/getprojects', (req, res) => {
  res.send(JSON.stringify(projects));
})

app.post('/api', (req, res) => {

  let data = JSON.parse(req.body);
  let action = data.action;

  if(action == "create")res.send(createProject(data));
  else if(action == "add")res.send(addProject(data));
  else if(action == "develop")res.send(developProject(data));
  else if(action == "remove")res.send(removeProject(data));
  else if(action == "hide")res.send(hideProject(data));
  else if(action == "edit")res.send(editProject(data));
  else res.send({error: true, message: "Action not found"});
})

function createProject(data){
  createProjectFromTemplate(data.template, data.dir);
  pushProject(data);


  return { message: "Project Created" }
}

function addProject(data){
  pushProject(data);
  return { message: "Project Added" }
}

function developProject({dir}){
  exec('atom ~/Projects/'+dir);
  return { message: "Opened editor" }
}

function removeProject({dir}){
  deleteProjectFolder(dir);
  spliceProject(dir);
  return { message: "Project moved to trash" }
}

function hideProject({dir}){
  spliceProject(dir);
  return { message: "Hid Project from database" }
}

function editProject(data){
  let changes = data;
  let index = projects.findIndex(current => current.dir == data.dir);
  delete changes.action;
  delete changes.dir;
  projects[index] = {...projects[index], ...changes};
  backup()
  return { message: "Made changes to project" }
}

////////////////////////////////////////////////////////////////////////////////

function pushProject({name, dir, type, private, icon, color1, color2}){
  projects.push({ name, dir, type, private, icon,
    grad: [color1, color2] });
  backup()
}

function createProjectFromTemplate(template, dir){
  exec('cp -r ../templates/'+template+' ../'+dir)
}

function spliceProject(dir){
  projects.splice(projects.findIndex(current => current.dir == dir), 1);
  backup()
}

function deleteProjectFolder(dir){
  exec('mv ../'+dir+' ../.trash');
}

app.listen(1111);


function backup(){
  db.write();
  updatePublic();
}

function updatePublic(){
  exec('rm -r ../jadenconcord.github.io/projects/*', console.log);
  publicDatabase.data.projects = projects.filter(project => {
    if(!project.private){
      exec('mkdir ../jadenconcord.github.io/projects/'+project.dir, console.log);
      exec('cp -r ../'+project.dir+'/* ../jadenconcord.github.io/projects/'+project.dir, console.log);
      return true;
    }
    return false;
  });
  publicDatabase.write();
}




// var db = require('./db.js')
//
// db1 = new db('data.json') // Create database class from data.json
// db2 = new db('data2.json')
// data = db1.data; // Make pointer to the data
// data.runId++;
// console.log('\x1b[7m\x1b[32m%s\x1b[0m', ' Server Started #' + data.runId + " \n");
// console.log(data.user[0]) // Log the first users in the database
//
// db1.write(); // Make changes to the file. Default data.json
// db1.encrypt("pass");
// console.log("decrypted:")
// db1.decrypt("pass");
// console.log(data)
//
// /* // Update the database file every second
//
// setInterval(function () {
//   db1.write();
// }, 1000)
//
// */
