let favicon = document.querySelector('link[rel="shortcut icon"]').href || '/favicon.ico'

let SCSSJSCreated = false;

let widget = document.createElement('div');
widget.className = 'theme-widget';
widget.tabIndex = '-1';
widget.innerHTML = `
<div><img src="${favicon}" width="16" height="16" alt="">Change Theme</div>
<section>
  <div class="center"><h3>Change Theme</h3></div>
  <label class="form-label" for="formwidget-varient">Varient</label>
  <select id="formwidget-varient" autocomplete="off" onchange="widgetUpdateTheme()">
    <option value="0" disabled selected>Select Varient</option>
    <option value="1">Dark</option>
    <option value="2">Light</option>
    <option value="3">Dark With Light Content</option>
    <option value="4">Light with Dark parts</option>
  </select><br>
  <label class="form-label" for="formwidget-theme">Theme</label>
  <select id="formwidget-theme" autocomplete="off" onchange="widgetUpdateTheme()">
    <option value="css/theme.scss" selected>Default</option>
    <option value="https://jadenconcord.github.io/a/themes/flat-remix.scss">Flat Remix</option>
    <option value="https://jadenconcord.github.io/a/themes/default-for-theme-generator.scss">Theme gen theme</option>
    <option value="https://jadenconcord.github.io/a/themes/kimi.scss">Kimi</option>
    <option value="https://jadenconcord.github.io/a/themes/material.scss">Material</option>
  </select><br>
</section>
`

document.body.appendChild(widget);

async function widgetUpdateTheme(){
  let varient = document.querySelector('#formwidget-varient').value;
  let theme = document.querySelector('#formwidget-theme').value;

  widgetBackup(theme, varient);

  let themeRes = await fetch(theme);
  let themeScss = await themeRes.text();

  let mainRes = await fetch('css/main.scss');
  let mainScss = await mainRes.text();

  let elementalRes = await
    fetch('https://jadenconcord.github.io/a/elementalcss/0-9/elemental.scss')
  let elementalScss = await elementalRes.text();

  let sassjs = document.createElement('script');
  sassjs.src = 'https://jadenconcord.github.io/a/themes/sass/sass.js';

  sassjs.onload = () => {
    let style = document.createElement('style');
    style.className = 'theme';

    let text = mainScss;

    text = text.replace(/@import .+theme.+/, themeScss);
    text = text.replace(/@import .+elemental.+/, elementalScss);
    text = text.replace(/\$theme-type: \d/, '$theme-type: '+varient)

    new Sass('/jadenconcord.github.io/a/themes/sass/sass.worker.js').compile(text, (compiled) => {
      style.innerHTML = compiled.text;
    })
    document.head.appendChild(style);
  }

  // document.head.appendChild(sassSync);
  // document.head.appendChild(sassWorker);
  document.head.appendChild(sassjs)
  setTimeout(() => {
    document.querySelector('link[href="css/main.css"]')?.remove();
  }, 2000)
}


function widgetBackup(url, varient){
  localStorage.setItem('THEME-URL', url);
  localStorage.setItem('THEME-VARIENT', varient);
}


if(localStorage.getItem('THEME-URL') || localStorage.getItem('THEME-VARIENT')){
  let varient = localStorage.getItem('THEME-VARIENT') || 0;
  let url = localStorage.getItem('THEME-URL') || 'css/main.scss';
  console.log(url);
  document.querySelector('#formwidget-varient').value = varient;
  document.querySelector('#formwidget-theme').value = url;

  if(url != 'css/main.scss')widgetUpdateTheme();
}
