// OLD VERSION

let DEVMODE = {};

function RenderTemplate(template, local){
  let result = DecodeHTML(template);
  result = EncodeBraces(template);
  result = AutoEndBlocks(result);
  result = FormatTemplateVariables(result);
  result = ReplaceTemplateBlocks(result);
  result = UnEncode(result);
  return EvalTemplate('let result = `'+result+'`; return result;', local);
}

function AutoEndBlocks(template){
  // {block/} => {block}{/block}
  let regex = /{((\w+)( [^}]+)?)\/}/s;
  return RegexReplace(template, regex, a => {
    return '{'+a[1]+'}' + '{/'+a[2]+'}';
  });
}

function FormatTemplateVariables(template){
  // {js} -> {eval}js{/eval}
  let regex = /{(([^{/ ]*?)( [^{]*?)?)}(?!.*{\/\2}.*)/gs;
  return template.replace(regex, '{eval}$1{/eval}');
}

function ReplaceTemplateBlocks(template){
  // {block arguments}content{/block}
  let regex = /{(\w+)( [^}]+)?}((?!.*{(\w+)( [^}]+)?}.*{\/\4}.*).*){\/\1}/s;
  return RegexReplace(template, regex, ReplaceBlock);
}

function EvalTemplate(text, local={}){
  try {
    return Function(Object.keys(local) + '', text)(...Object.values(local))
  }
  catch (error){
    if(DEVMODE)console.log(text);
    console.error("Error Evaluating template: "+error.message+': Line: '+error.lineNumber+'\n\n'+
      text.split('\n')[error.lineNumber-3]+'\n'+" ".repeat(error.columnNumber-1)+'^\n');
    return '';
  }
}

function RegexReplace(text, regex, getReplacement){
  let safe = 1000;
  let result = text;
  while(result.match(regex) && --safe > 0){
    let match = result.match(regex);
    result = result.replace(match[0], getReplacement(match))
  }
  safe <= 0 && console.error('RegexReplace: loop has no end');
  return result;
}

function ReplaceBlock(match){
  let arg = (match[2]||' ').substring(1);
  let [content, name, perams, args] = [match[3], match[1], GetPerams(arg), arg.split(' ')];
  let func = TemplateBlocks[name] || TemplateBlocks.defaultBlock;
  let exportData = { arg,content,name,perams,args,func };
  return '`;try{result+=`'+func(exportData)+'`}catch(e){console.error(e.message);result+=DEVMODE ? "[ERROR: "+e.message+"]" : ""};result+=`';
}

function GetPerams(text){
  if(!text)return {};
  let regex = /(\w+)(="(.*?)")?/ // name="value" or name
  let result = {}
  RegexReplace(text, regex, match => {
    result[match[1]] = match[3] === undefined ? true : match[3];
    return '';
  });
  return result;
}

function UnEncode(html){
  return html.replaceAll('&bl;', '{')
  .replaceAll('&br;', '}')
  .replaceAll('&and;', '&')
  .replaceAll('&lt;', '<')
  .replaceAll('&gt;', '>')
}

function EncodeBraces(html){
  let left = /({skip}.+?){(.+?{\/skip})/s;
  let right = /({skip}.+?)}(.+?{\/skip})/s;
  let result = html;
  // result = result.replaceAll(left, '$1&bl;$2')
  // result = result.replaceAll(right, '$1&br;$2')
  result = RegexReplace(result, left, match => {
    return match[1] + '&bl;' + match[2];
  })
  result = RegexReplace(result, right, match => {
    return match[1] + '&br;' + match[2];
  })
  result = result.replaceAll('\\', '\\\\')
  return result.replaceAll('{{', '&bl;').replaceAll('}}', '&br;')
}

function DecodeHTML(html) {
    let textarea = document.createElement("textarea");
    textarea.innerHTML = html
    let result = textarea.value;
    return result;
}

// Default Blocks
let TemplateBlocks = {
  eval: a => '`;result+='+a.content.replaceAll('\\\\', '\\')+';result+=`',
  repeat: a => {
    let i = a.args[1] || 'i';
    return '`;for(let '+i+'=1; '+i+'<'+(Number(a.args[0])+1)+'; '+i+'++){result+=`'+a.content+'`;}result += `';
  },
  if: a => '`;if('+a.arg+'){result+=`'+a.content+'`;}result += `',
  each: a => {
    return '`;'+a.args[0]+'.forEach('+a.args[1]+' => {result+=`'+a.content+'`;});result += `';
  },
  debug: a => '`;result+=console.log('+a.arg+') || "";result+=`',
  skip: a => a.content,

  defaultBlock: a => {
    console.warn('Template block "'+a.name+'" is not defined');
    return DEVMODE ? '[ERROR: block "'+a.name+'" does not exist]' : '';
  },
}

// Form Blocks
TemplateBlocks = {...TemplateBlocks,
  inputText: a => `<label class="form-label" for="form-${a.perams.name}">${a.perams.label || ''}</label>
  <input type="text" ${a.perams.pattern ? 'pattern="'+a.perams.pattern+'"' : ''} value="${a.perams.value || a.content || ''}" name="${a.perams.name}" id="form-${a.perams.name}" placeholder="${a.perams.placeholder}" ${a.perams.required ? 'required' : ''}/>`,
  inputRange: a => `<label class="form-label" for="form-${a.perams.name}">${a.perams.label || ''}</label>
  <input type="range" value="${a.perams.value || a.content || 0}" name="${a.perams.name}" step="${a.perams.step || 1}" id="form-${a.perams.name}"/>`,
  inputDate: a => `<label class="form-label">${a.perams.label || ''}</label>
  <input type="date" value="${a.perams.value || a.content || ''}" name="${a.perams.name}"/>`,
  inputTime: a => `<label class="form-label">${a.perams.label || ''}</label>
  <input type="time" value="${a.perams.value || a.content || ''}" name="${a.perams.name}"/>`,
  inputColor: a => `<label class="form-label">${a.perams.label || ''}</label><div class="color-wrap">
  <input class="reset-input" name="${a.perams.name}" id="colorInput_${a.perams.name}" placeholder="#XXXXXX"
  value="${a.perams.value}" type="text" onkeyup="document.getElementById('colorInput_${a.perams.name}-inputbox').value = this.value">
  <input id="colorInput_${a.perams.name}-inputbox" value="${a.perams.value}" type="color" onchange="document.getElementById('colorInput_${a.perams.name}').value = this.value">
  </div>`,
  inputSelect: a => `<label class="form-label">${a.perams.label || ''}</label>
  <select name="${a.perams.name}" ${a.perams.multiple ? 'multiple' : ''}>
    ${CommaLangArray(a.perams.options, 'name', 'text', 'default').reduce((d, c) => d+'<option value="'+c.name+'" '+(c.default ? 'selected' : '')+' '+(c.name == 'disabled' ? 'disabled' : '')+'>'+c.text+'</option>', '')}
  </select>`,
  inputSwitch: a => `<br><label class="switch">
  <input type="checkbox" onchange="${a.perams.onchange || ''}" name="${a.perams.name}" id="switch-${a.perams.name}" ${a.perams.checked ? 'checked' : ''}>
  <span class="slider"></span>
  </label><label for="switch-${a.perams.name}" class="switch-label">${a.perams.label}</label>`,
  inputCheckbox: a => `<label class="checkbox">${a.perams.label}
    <input type="checkbox" name="${a.perams.name}" ${a.perams.checked ? 'checked' : ''} ${a.perams.toggle ? `onchange="ToggleDisplayById('${a.perams.toggle}', this)"` : ''}>
    <span class="checkmark"></span>
  </label>`,
  inputRadio: a => `<br><label class="form-label">${a.perams.label || ''}</label>
  ${CommaLangArray(a.perams.options, 'text', 'name', 'default').reduce((d, c) => {
    return d+`<label class="radio">${c.text}
                <input type="radio" value="${c.name}" name="${a.name}" ${c.default ? 'checked' : ''}>
                <span class="checkmark"></span>
              </label>`;
  }, '')}`,
  inputTextarea: a => `<label class="form-label">${a.perams.label || ''}</label>
  <textarea name="${a.perams.name}" style="height: ${a.perams.height}px" placeholder="${a.perams.placeholder || ''}">${a.content || a.perams.value || ''}</textarea>`,
}

function CreateTemplateBlock(blockName, blockFunction){
  TemplateBlocks[blockName] = blockFunction;
}

function CommaLangArray(text, name="name", value="value", def="def"){
  let detect = /^((,|^)!?\w+:[^,]+)+,?$/
  let rx = /(!?)(\w+):([^,]+)/
  let result = [];
  if(!text.match(detect))return text;
  while(text.match(rx)){
    let match = text.match(rx);
    let i = result.length
    result[i] = {};
    result[i][name] = match[2];
    result[i][value] = match[3];
    result[i][def] = match[1] == '!';
    text = text.replace(match[0], '')
  }
  return result;
}

function GetFormData(container){
  var result = {};
  container.childNodes.forEach(a => {
    if(a.tagName == "INPUT" || a.tagName == "TEXTAREA"){
      result[a.name || 'undefined'] = a.value;
    }
    else if(a.tagName == "SELECT"){
      result[a.name || 'undefined'] = a.options[a.selectedIndex].value;
    }
    else if(a.classList && (a.classList.contains('checkbox') || a.classList.contains('switch'))){
      result[a.children[0].name || 'undefined'] = a.children[0].checked;
    }
    else if(a.classList && a.classList.contains('radio')){
      if(a.children[0].checked)
        result[a.children[0].name || 'undefined'] = a.children[0].value;
    }
    else if(a.classList && a.classList.contains('color-wrap')){
      result[a.children[0].name || 'undefined'] = a.children[0].value;
    }
    else{
      result = {...result, ...GetFormData(a)};
    }
  })
  return result;
}

class Template{
    constructor(query, update=true){
      var templateElement = document.querySelector(query + ' > template');
      var queryElement = document.querySelector(query);
      this.query = query;
      if(!templateElement)
        console.error('Error Template: no template inside "'+query+'"')
      else if(!queryElement)
        console.error('Error Template: query "'+query+'" does not not exist')
      this.template = templateElement.innerHTML;
      this.local = {test: true};
      if(update)this.update();
    }
    update(local=this.local, template){
      this.template = template || this.template;
      document.querySelector(this.query).innerHTML =
        RenderTemplate(this.template, local);
    }
    getData(){
      return GetFormData(document.querySelector(this.query))
    }
    link(name){
      var names = [...arguments]
      return (...values) => {
        var local = {};
        names.forEach((a, i) => {
          if(values[i])local[a] = values[i];
        })
        this.update(local);
      }
    }
}

function CreatePrompterElement(options, template){
  let id = PrompterList.length;
  let query = '#popup-'+id+' section';
  let el = document.createElement('div');
  let beforeHTML = '';
  el.id = 'popup-'+id;
  el.innerHTML = `<section><template>${template}</template></section>`;
  el.classList.add('prompter');
  if(options.closeIcon)beforeHTML = '<div class="closeicon" onclick="{close}"></div>';
  if(options.width)el.firstChild.style.width = options.width + 'px';
  if(options.height)el.firstChild.style.height = options.height + 'px';
  el.style.display = 'none';
  el.setAttribute('popupid', id);
  document.body.appendChild(el);

  return {el, id, query, beforeHTML};
}

let PrompterList = [];

class Prompter extends Template{
  constructor(options={}, template=""){
    options = {closeBlur:true,lockScroll:true,...options};
    let element = CreatePrompterElement(options, template);

    super(element.query);

    if(options.closeBlur)element.el.onclick = this.hide;
    this.id = element.id;
    this.beforeHTML = element.beforeHTML;
    this.options = options;

    this.setLocal();

    PrompterList[element.id] = this;
  }
  show(template=this.template){
    this.update(this.local, this.beforeHTML + template);
    if(this.options.lockScroll)document.querySelector('html').style.overflow = 'hidden';
    document.querySelector('#popup-'+this.id).style.display = '';
    document.querySelector('#popup-'+this.id+' input',
    '#popup-'+this.id+' button',
    '#popup-'+this.id+' [tabindex="0"]',)?.focus();
  }
  hide(id=this.id){
    if(this.getAttribute){
      id = this.getAttribute('popupid');
      if(event.target.id != "popup-"+id)return;
    }
    document.querySelector('html').style.overflowY = '';
    document.querySelector('#popup-'+id).style.display = 'none';
  }
  alert(message, after){
    this.show(`<span style="font-size: 1.5rem">${message}</span><br><br>
      <div class="box" style="text-align: right">
        <button onclick="{close}" class="b1">OK</button>
      </div>`)
  }
  setLocal(local={}){
    this.local = {
      ...this.local,
      ...local,
      close: 'PrompterList['+this.id+'].hide()',
      prompter: 'PrompterList['+this.id+']',
    };
  }
  setTemplate(template=this.template){
    this.template = template;
  }
  updateLocal(local={}){
    this.setLocal(local);
    this.update(local)
  }
}

class Prompter2 extends Template{
  constructor(options={}, template=""){
    options = {closeBlur:true,lockScroll:true,...options};
    let popup = CreatePrompterElement(options, template);
    super(popup.query);
    if(options.closeBlur)popup.el.onclick = this.hide;
    this.id = popup.id;
    this.beforeHTML = popup.beforeHTML;
    this.options = options;
    PrompterList[popup.id] = this;
    this.setLocal({});
  }
  show(local, template=''){
    // focus
    if(typeof local == 'string'){ // swap arguments
      let buffer = local;
      local = template;
      template = buffer;
    }
    this.setLocal(local);
    this.update(this.local, this.beforeHTML + template);
    if(this.options.lockScroll)document.querySelector('html').style.overflow = 'hidden';
    document.querySelector('#popup-'+this.id).style.display = '';
    document.querySelector('#popup-'+this.id+' input',
    '#popup-'+this.id+' button',
    '#popup-'+this.id+' [tabindex="0"]',).focus();
  }
  hide(id=this.id){
    if(this.getAttribute){
      id = this.getAttribute('popupid');
      if(event.target.id != "popup-"+id)return;
    }
    document.querySelector('html').style.overflowY = '';
    document.querySelector('#popup-'+id).style.display = 'none';
  }
  setLocal(local={}){
    this.local = {
      ...this.local,
      ...local,
      close: 'PrompterList['+this.id+'].hide()',
      prompter: 'PrompterList['+this.id+']',
    };
  }
  alert(message, after){
    this.show(`${message}<br><br>
      <div class="box" style="text-align: right">
        <button onclick="{close}" class="b1">OK</button>
      </div>`)
  }
}


// testing

function SafeEval(text){
  let regex = /(([^+-\=\*\/\%\|\<\>\! ])( +)?\(|=>|[^=!<>]=[^=])/;
  return text.match(regex) ? false : true;
}

// For Blocks

function ToggleDisplayById(id, self){
  let el = document.getElementById(id);
  self.checked || el.nodeName == 'DETAILS' ? el.style.display = '' : el.style.display = 'none';
  el.open = self.checked;
}
