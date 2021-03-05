function RenderTemplate(template, variables) {
  let result = template;

  // &copy; -> ©
  result = DecodeHTML(result);

  // {skip}{}{/skip} => {skip}&bl;&br;{/skip}
  result = ExcapeBracketsInSkipBlock(result);

  // \ {{ }} => \\ { }
  result = EncodeExcapedCharicters(result);

  // {block/} => {block}{/block}
  result = EndBlocks(result);

  // {js} -> {eval}js{/eval}
  result = FormatEvalBlocks(result);

  // {button}{/button} => <button></button>
  result = RenderBlocks(result);

  // &bl;&br; => {}
  result = DecodeBrackets(result);

  result = EvalTemplate(result, variables);

  return result;
}

function DecodeHTML(html) {
  let textarea = document.createElement("textarea");
  textarea.innerHTML = html
  return textarea.value;
}

function ExcapeBracketsInSkipBlock(html) {
  let result = html;

  // {skip}{}{/skip} => {skip}&bl;&br;{/skip}
  let left = /({skip}.+?){(.+?{\/skip})/s;
  let right = /({skip}.+?)}(.+?{\/skip})/s;
  result = RegexReplaceAll(result, left, match =>
    match[1] + '&bl;' + match[2]);
  result = RegexReplaceAll(result, right, match =>
    match[1] + '&br;' + match[2]);

  return result;
}

function EncodeExcapedCharicters(html) {
  let result = html;

  result = result.replaceAll('\\', '\\\\') // \ => \\
    .replaceAll('{{', '&bl;')
    .replaceAll('}}', '&br;')
  return result;
}

function EndBlocks(template) {
  // {block/} => {block}{/block}
  let regex = /{((\w+)( [^}]+)?)\/}/s;
  return RegexReplaceAll(template, regex, match => {
    let [undefined, start, end] = match;
    return '{' + start + '}' + '{/' + end + '}';
  });
}

function FormatEvalBlocks(template) {
  // {js} -> {eval}js{/eval}
  let regex = /{(([^{/ ]*?)( [^{]*?)?)}(?!.*{\/\2}.*)/gs;
  return template.replace(regex, '{eval}$1{/eval}');
}

function RenderBlocks(template) {
  // {block arguments}content{/block}
  let regex = /{(\w+)(?: ([^}]+))?}((?!.*{(\w+)( [^}]+)?}.*{\/\4}.*).*){\/\1}/s;
  return RegexReplaceAll(template, regex, RenderBlock);
}

function RenderBlock(match) {
  // {blockname argument}content{/blockname}
  let [undefined, blockName, argument, content] = match;
  let attributes = GetPerams(argument);
  let args = argument?.split(' ');
  let exportData = {
    argument,
    args,
    content,
    attributes
  };
  return replaceBlock(blockName, exportData);
}

function GetPerams(text) {
  let attributes = {}
  let regex = /(\w+)(?:="([^"]*?)")?/ // name="value" or name
  if (!text?.match(regex)) return {};
  let encoded = AttributeEncodeBoxBrackets(text);
  RegexReplaceAll(encoded, regex, match => {
    let [_, name, value] = match;
    attributes[name] = value || true;
    return '';
  });
  return attributes;
}

function replaceBlock(blockName, exportData) {
  let block = GetTemplateBlock(blockName);
  if (block.replace) return block.replace(exportData);
  else if (block.run) return '`;' + block.run(exportData) + ';result+=`';
  else if (block.eval) return '`;result += (' + block.eval(exportData) + ');result+=`';
  else if (block.tag) {
    let unused = '';
    let result = '';
    Object.keys(exportData.attributes).forEach((name) => {
      if (!block?.ignore?.find(a => a == name))
        unused += ` ${name}="${exportData.attributes[name]}"`
    })

    if (block.label && exportData.attributes.label) result +=
      `<label class="form-label" for="form-${exportData.attributes.name}">${exportData.attributes.label}</label>`

    result += block.tag({
      unused,
      ...exportData
    })
    return result;
  } else return exportData.content;
}

let PreviousArgument;

let TemplateBlocks = [{
    name: 'if',
    replace: a =>
      `\`;if(${TryEval.start}${PreviousArgument = a.argument}${TryEval.end}){result+=\`${a.content}\`};result+=\``
  },
  {
      name: 'else',
      replace: a =>
        `\`;if(!(${PreviousArgument})){result+=\`${a.content}\`};result+=\``
  },
  {
    name: 'eval',
    eval: a => a.content,
  },
  {
    name: 'run',
    run: a => a.content,
  },
  {
    name: 'repeat',
    run: a => {
      let i = a.args[1] || 'i';
      return 'for(let ' + i + '=1; ' + i + '<' + (Number(a.args[0]) + 1) + '; ' + i + '++){result+=`' + a.content + '`;}';
    }
  },
  {
    name: 'each',
    run: a => a.args[0] +
      '.forEach((' + a.args[1] + (a.args[2] ? ',' + a.args[2] : '') + ')\
       => {result+=`' + a.content + '`;})',
  },
  {
    name: 'skip',
    replace: a => a.content,
  },
  {
    name: 'input',
    tag: a => `<input type="text" id="form-${a.attributes.name}" ${a.unused}/>`,
    ignore: ['label', 'id'],
    label: true,
  },
  {
    name: 'range',
    tag: a => `<input type="range" name="${a.attributes.name}" id="form-${a.attributes.name}" ${a.unused}/>`,
    ignore: ['label', 'id'],
    label: true,
  },
  {
    name: 'date',
    tag: a => `<input type="date" name="${a.attributes.name}" ${a.unused}/>`,
    ignore: ['label', 'id'],
    label: true,
  },
  {
    name: 'time',
    tag: a => `<input type="time" name="${a.attributes.name}" id="form-${a.attributes.name}" ${a.unused}/>`,
    ignore: ['label', 'id'],
    label: true,
  },
  {
    name: 'color',
    tag: a => `<div class="color-wrap">
    <input class="reset-input" value="${a.attributes.value}" name="${a.attributes.name}" id="form-${a.attributes.name}" placeholder="#XXXXXX"
    type="text" onkeyup="document.getElementById('color-${a.attributes.name}').value = this.value" ${a.unused}>
    <input id="color-${a.attributes.name}" value="${a.attributes.value}" type="color" onchange="document.getElementById('form-${a.attributes.name}').value = this.value">
    </div>`,
    ignore: ['label', 'id', 'onkeyup', 'value'],
    label: true,
  },
  {
    name: 'select',
    tag: a => `<select name="${a.attributes.name}" id="form-${a.attributes.name}" ${a.unused}>
      \`+CommaLangArray(\`${a.attributes.options}\`, 'name', 'text', 'default').reduce((d, c) => d+'<option value="'+c.name+'" '+(c.default ? 'selected' : '')+' '+(c.name == 'disabled' ? 'disabled' : '')+'>'+c.text+'</option>', '')+\`
    </select>`,
    ignore: ['label', 'id', 'options'],
    label: true,
  },
  {
    name: 'switch',
    tag: a => `<br><label class="switch">
    <input type="checkbox" name="${a.attributes.name}" id="form-${a.attributes.name}" ${a.unused}>
    <span class="slider"></span>
    </label><label for="form-${a.attributes.name}" class="switch-label">${a.attributes.label}</label>`
  },
  {
    name: 'checkbox',
    tag: a => `<label class="checkbox">${a.attributes.label}
      <input type="checkbox" name="${a.attributes.name}" onchange="${a.attributes.toggle ? `ToggleDisplayById('${a.attributes.toggle}', this)` : ''};${a.attributes.onchange || ''}" ${a.unused}>
      <span class="checkmark"></span>
    </label>`,
    ignore: ['label', 'id', 'onchange'],
  },
  {
    name: 'radio',
    tag: a => `${CommaLangArray(a.attributes.options, 'text', 'name', 'default').reduce((d, c) => {
      return d+`<label class="radio" ${a.unused}>${c.text}
                  <input type="radio" value="${c.name}" name="${a.name}" ${c.default ? 'checked' : ''}>
                  <span class="checkmark"></span>
                </label>`;
    }, '')}`,
    label: true,
  },
  {
    name: 'textarea',
    tag: a => `<textarea name="${a.attributes.name}" ${a.attributes.unused}>${a.content || a.attributes.value}</textarea>`,
    label: true,
  },
  {
    name: 'button',
    tag: a => {
      let result = `<button ${a.unused}>${a.content || a.attributes.value}</button>`;
      if (a.attributes.center) result = '<div class="center">' + result + '</div>';
      return result;
    }
  },
  {
    name: 'center',
    tag: a => `<div class="center" ${a.unused}>${a.content}</div>`,
  }
];

function GetTemplateBlock(blockName) {
  return TemplateBlocks.find(block => block.name == blockName) || {
    name: 'default',
    func: a => a.content,
  };
}



function AttributeEncodeBoxBrackets(text) {
  return text
    .replaceAll('[[', '&boxl')
    .replaceAll(']]', '&boxr')
    .replaceAll('[', '`+'+TryEval.start)
    .replaceAll(']', TryEval.end+'+`')
    .replaceAll('&boxl', '[')
    .replaceAll('&boxr', ']')
}

function DecodeBrackets(html) {
  return html.replaceAll('&bl;', '{')
    .replaceAll('&br;', '}')
    .replaceAll('&a;', '&')
}

function EvalTemplate(text, variables = {}) {
  let js = 'let result = `' + text + '\`; return result;';
  try {
    return Function(Object.keys(variables) + '', js)(...Object.values(variables))
  } catch (error) {
    console.error(js);
    console.error(error);
    console.error("Error Evaluating template: " + error.message + ': Line: ' + error.lineNumber + '\n\n' +
      text.split('\n')[error.lineNumber - 3] + '\n' + " ".repeat(error.columnNumber - 1) + '^\n');
    return '';
  }
}



///////////////////
function RegexReplaceAll(text, regex, getReplacement) {
  let limit = 1000;
  let result = text;
  while (result.match(regex) && --limit > 0) {
    let match = result.match(regex);
    result = result.replace(match[0], getReplacement(match))
  }
  limit > 1000 && console.error('RegexReplace: 1000 limit reached, loop may not have an end');
  return result;
}








function Template(query, variables={}) {
  let templateElement = document.querySelector(query + ' > template');
  let queryElement = document.querySelector(query);

  if (!queryElement)
    console.error('Error Template: query "' + query + '" was not found')
  else if (!templateElement)
    console.error('Error Template: no template found inside "' + query + '"')

  return {
    query: query,
    template: templateElement.innerHTML,
    variables: variables,
    update() {
      let variables, template;

      if (typeof arguments[0] == 'object')
        [variables, template] = [arguments[0] || this.variables, arguments[1] || this.template];
      else
        [variables, template] = [arguments[1] || this.variables, arguments[0] || this.template];

      this.variables = {...this.variables, ...variables};
      this.template = template;

      document.querySelector(this.query).innerHTML =
        RenderTemplate(this.template, this.variables);

      return this;
    },
    getData() {
      return GetFormData(document.querySelector(this.query));
    },
    link() {
      let variableNames = [...arguments];
      return (...values) => {
        this.update(variableNames.reduce((current, name, i) =>
          current = {
            ...current,
            [name]: values[i]
          }, {}))
      }
    }
  }
}

let TryEval = {start:'(()=>{let RES;try{RES=',
end:'}catch(e){} return RES||\'\'})()'};

let FormValueMethods = [{
    tags: ["INPUT", "TEXTAREA"],
    name: el => el.name || 'undefined',
    value: el => el.value,
  },
  {
    tags: ["SELECT"],
    name: el => el.name || 'undefined',
    value: el => el.options[el.selectedIndex].value,
  },
  {
    condition: el =>
      el?.classList?.contains('checkbox') || el?.classList?.contains('switch'),
    name: el => el.children[0].name || 'undefined',
    value: el => el.children[0].checked,
  },
  {
    condition: el => el?.classList?.contains('radio') && el.children[0].checked,
    name: el => el.children[0].name || 'undefined',
    value: el => el.children[0].value,
  },
  {
    condition: el => el?.classList?.contains('color-wrap'),
    name: el => el.children[0].name || 'undefined',
    value: el => el.children[0].value,
  }
]

function GetFormData(container) {
  var result = {};
  container.childNodes.forEach(el => {
    let data = GetItemData(el);
    if (data) result[data.name] = data.value;
    else if (el.hasChildNodes())
      result = {
        ...result,
        ...GetFormData(el)
      };
  })
  return result;
}

function GetItemData(el) {
  let result = null;
  FormValueMethods.every(method => {
    if (method.tags) {
      let condition = method.tags.reduce((current, tagName) =>
        tagName == el.tagName || current, false);
      if (condition) {
        result = {
          name: method.name(el),
          value: method.value(el)
        };
        return false;
      }
    } else if (method.condition) {
      if (method.condition(el)) {
        result = {
          name: method.name(el),
          value: method.value(el)
        }
        return false;
      }
    }
    return true;
  })
  return result;
}


function Prompter(options = {}, template = '') {
  let result = {};

  options = {
    closeBlur: true,
    lockScroll: true,
    ...options
  }

  let id = Math.floor(Math.random() * 1000000);
  let popup = GeneratePrompter(options, template);

  result = {
    element: popup,
    template: template,
    options: options,
    variables: {},
    id: id,
    show() {
      let variables, template;

      if (typeof arguments[0] == 'object')
        [variables, template] = [arguments[0] || this.variables, arguments[1] || this.template];
      else
        [variables, template] = [arguments[1] || this.variables, arguments[0] || this.template];

      if (options.lockScroll) {
        document.body.style.overflowY = 'hidden';
      }

      [this.variables, this.template] = [variables, template];

      this.element.firstChild.innerHTML = RenderTemplate(template, variables);
      this.element.style.display = '';

      let focused = false;
      this.element.firstChild.childNodes.forEach(child => {
        if(child.tabIndex == 0 && !focused){
          child.focus()
          focused = true;
        }
      });

      return this;
    },
    hide() {
      this.element.style.display = 'none';
      document.body.style.overflowY = '';
      return this;
    },
    close() {
      return this.hide(...arguments);
    },
    remove() {
      this.element.remove();
      return this;
    },
    getData() {
      return GetFormData(this.element);
    },
    alert(message){
      this.show(`<span style="font-size: 1.5rem">${message}</span><br><br>
        <div class="box" style="text-align: right">
          <button onclick="this.offsetParent.prompter.hide()" class="b1">OK</button>
        </div>`);
    }
  }

  popup.firstChild.prompter = result;

  return result;
}

function GeneratePrompter(options, template) {
  let popup = document.createElement('div');
  let section = document.createElement('section');
  let templateElement = document.createElement('template');
  templateElement.innerHTML = template;
  section.appendChild(templateElement);
  popup.appendChild(section);
  popup.classList.add('prompter');
  popup.style.display = 'none';
  section.style.position = 'relative';
  if (options.closeBlur) popup.onclick = (e) => {
    if (e.target.classList.contains('prompter')) e.target.style.display = 'none';
    document.body.style.overflowY = '';
  }
  document.body.appendChild(popup);

  return popup;
}


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


function CommaLangArray(text, name = "name", value = "value", def = "def") {
  let detect = /^((,|^)!?\w+:[^,]+)+,?$/
  let rx = /(!?)(\w+):([^,]+)/
  let result = [];
  if (!text.match(detect)) return text;
  while (text.match(rx)) {
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

function ToggleDisplayById(id, self) {
  let el = document.getElementById(id);
  self.checked || el.nodeName == 'DETAILS' ? el.style.display = '' : el.style.display = 'none';
  el.open = self.checked;
}
