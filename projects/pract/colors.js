var level = 1;
var answers = []
var answer = 0;
var points = 0;

startLevel();

function startLevel() {
  if(level > 1 || points > 0){
    level += points;
  }
  points = 0;
  var variance = 60*4 - level*4;
  answer = random(0, 2);
  var correct = {
    r: random(0, 255),
    g: random(0, 255),
    b: random(0, 255),
  }
  $('#level-display').innerText = level;

  var codeAnswer = correct.r.toString(16)+" "+correct.g.toString(16)+" "+correct.b.toString(16);
  var colorCode = correct.r.toString(16)+''+correct.g.toString(16)+''+correct.b.toString(16);

  console.log("code",codeAnswer)
  console.log("#",colorCode)

  $('#box').styles({
    background: '#'+colorCode,
  })

  $('#options').innerHTML = '';

  for (var i = 0; i < 3; i++) {
    console.log("-----------")
    if(answer === i){
      $('#options').innerHTML += `<li onclick="correct(this)">${codeAnswer}</li>`
    }
    else {
      var change = (start) => {
        start += random(Math.round(variance/2), variance) * (random(0,1) || -1)
        start = Math.abs(start)
        if(start > 255)start = 255 - (start-255)
        return start;
      }
      console.log("correct", correct);
      var mod = {
        r: change(correct.r),
        g: change(correct.g),
        b: change(correct.b)
      };
      console.log("changed", mod)
      var code = mod.r.toString(16)+" "+
                 mod.g.toString(16)+" "+
                 mod.b.toString(16);
      $('#options').innerHTML += `<li onclick="incorrect(this)">${code}</li>`
      console.log("result", code)
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
