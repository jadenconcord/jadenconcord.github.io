


function rep(text, name, value) {
  if(value == undefined)return text;
  var exp = RegExp(`\\{${name}\\=\\w+\\}`, 'g')
  // Make it replace {name=default} with value : fix expresion
  text = text.replace(exp, value)
  return text.replace(new RegExp("{" + name + "}", "g"), value);
}

function reps(text, arr) {
  for (var i in arr) {
    text = rep(text, i, arr[i]);
  }
  text = text.replace("/{\w+}/g", '')

  return text;
}

function repClean(text) {
  var pattern = /\{\w+\=(\w+)\}/g
  text = text.replace(pattern, "$1")

  var pattern = /(\{(\w+)\}|\{([a-zA-Z].+)\=([a-zA-Z].+)\})/g
  text = text.replace(pattern, "")

  return text
}

function repLogic(text, arr, count=100){
  if(arr == undefined)return text;

  // If statements
  exp = /\{+if([0-9][0-9]?)? (.*?)\}((?:.|\n)+?){\/if\1}/

  for(var i = 0; i < 2; i++){
    var result = text.match(exp)
    if(result == undefined)break;

    if(arr[result[2]] == undefined) arr[result[2]] = false;

    if(arr[result[2]]){
      text = text.replace(result[0], result[3])
    }
    else{
      text = text.replace(result[0], '')
    }
  }

  // If not

  exp = /\{+if([0-9][0-9]?)? \!(.*?)\}((?:.|\n)+?){\/if\1}/

  for(var i = 0; i < 100; i++){
    var result = text.match(exp)
    if(result == undefined)break;

    if(arr[result[2]] == undefined);

    else if(arr[result[2]]){
      text = text.replace(result[0], '')
    }
    else{
      text = text.replace(result[0], result[3])
    }
  }

  exp = /\{+loop (.*?)\}((?:.|\n)+?){\/loop}/;

  // Loop
  for(var i = 0; i < 100; i++){
    var result = text.match(exp)
    if(result == undefined)break;

    if(arr[result[1]] == undefined);
    else{
      var responce = '';

      for(i in arr[result[1]]){
        var part = reps(result[2], arr[result[1]][i])
        part = repLogic(part, arr[result[1]][i])
        responce += part;
      }
      text = text.replace(result[0], responce)
    }
  }
  // For statements
  exp = /\{+for (.*?)\}((?:.|\n)+?){\/for}/;

  for(var i = 0; i < 100; i++){
    var result = text.match(exp)
    if(result == undefined)break;

    if(arr[result[1]] == undefined);
    else{
      var responce = '';

      for(i in arr[result[1]]){
        var part = reps(result[2], arr[result[1]][i])
        part = repLogic(part, arr[result[1]][i])
        responce += part;
      }
      text = text.replace(result[0], responce)
    }
  }

  // else if(arr[result[1]]){
  //   text = text.replace(exp, '$2')
  // }
  // else{
  //   text = text.replace(result[0], '')
  // }

  if(count <= 0)return text;

  return repLogic(text, arr, count - 1);
}


function repit(input, template){
  var result = reps(input, template);
  result = repLogic(result, template);
  return repClean(result);
}
