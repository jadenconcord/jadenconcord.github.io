var popup = new prompter('popup');
var content = new Component('#content');



page(user.currentPage || sidebarItems[0].url);

runExtentions('onStart')

function format(command, value) {
    document.execCommand(command, false, value);
}
function textEditKey(e){
  if(e.key == "Tab"){
    e.preventDefault();
    format('insertHTML', '&nbsp;&nbsp;&nbsp;&nbsp;');
  }
}


if(user.theme != 'Default')changeTheme(themes.findIndex(a => a.name == user.theme));
