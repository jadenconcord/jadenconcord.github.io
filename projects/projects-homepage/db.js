var CryptoJS = require("crypto-js");

var fs = require('fs');
var path = require('path');

function jsonRead(relPath) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, relPath)));
}

function catFile(relPath) {
  return fs.readFileSync(path.join(__dirname, relPath));
}

function fwrite(file, data){
  data = JSON.stringify(data, null, 2)
  fs.writeFile(file,data,
      function(err) { 
        if (err) throw err;
        error = err
  });
}

function encrypt(msg, pass){
  return CryptoJS.AES.encrypt(msg, pass).toString();
}
function decrypt(enc, pass){
  return CryptoJS.AES.decrypt(enc, pass).toString(CryptoJS.enc.Utf8)
}

class db {
  constructor(path, options = {
    saveEnc: false,
    encFileEnding: '.enc',
    encPass: '', // Blank for not encrypted
    hideEncFiles: false
  }) {
    if(catFile(path) == "")fwrite(path, {});
    this.data = jsonRead(path);
    this.path = path;
  }
  read(path=this.path, pass) {
    if(pass==undefined)
      this.data = jsonRead(path)
    else
      this.data = decrypt(jsonRead(path), pass)
    return this.data;
  }
  write(path=this.path) {
    return fwrite(path, this.data);
  }
  encrypt(pass, path=this.path+'.enc'){
    return fwrite(path, encrypt(JSON.stringify(this.data), pass))
  }
  decrypt(pass, path=this.path+'.enc') {
    this.data = decrypt(path, pass)
    return this.data;
  }
}

module.exports = db 