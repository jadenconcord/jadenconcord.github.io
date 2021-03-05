var level = 1;
var answers = []
var answer = 0;
var points = 0;

startLevel();

function startLevel() {
  console.log("points", points);
  if(level > 1 || points > 0){
    level += points;
  }
  points = 0;
  var variance = 60*4 - level*4;
  answer = random(0, 2);
  var correct = {
    w: random(50, 700),
    h: random(50, 250)
  }
  $('#level-display').innerText = level;

  $('#box').styles({
    width: correct.w+'px',
    height: correct.h+'px'
  })

  $('#options').innerHTML = '';

  for (var i = 0; i < 3; i++) {
    if(answer == i){
      $('#options').innerHTML += `<li onclick="correct(this)">${correct.w}x${correct.h}</li>`
    }
    else {
      var rx = correct.w + random(Math.round(variance/2), variance) * (random(0, 1) || -1);
      var ry = correct.h + random(Math.round(variance/4), Math.round(variance/2)) * (random(0, 1) || -1);
      rx = Math.abs(rx)
      ry = Math.abs(ry)
      $('#options').innerHTML += `<li onclick="incorrect(this)">${rx}x${ry}</li>`
    }
  }
}


function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function correct(self){
  self.className = "correct"
  self.onclick = undefined;
  if(points==0)points=1;

  setTimeout(() => {
    startLevel();
  }, 1000)
}

function incorrect(self){
  self.className = "incorrect"
  self.onclick = undefined;
  points--;
}
