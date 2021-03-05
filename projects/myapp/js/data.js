var errorStatus = 404;
var errorMessage = 'Unknown';
var localDataMode = true;
var user = localStorage.getItem('myapp') ? JSON.parse(localStorage.getItem('myapp')) : getUserData();
var currentPage;
var installExtentionTimeout;

var pages = [
  {
    icon: 'home',
    name: 'Home',
    url: 'page/home.xml',
    active: true,
  },{
    icon: 'dashboard',
    name: 'Dashboard',
    url: 'page/dashboard.xml',
    button: 'close'
  },{
    icon: 'settings',
    name: 'Options',
    url: 'page/options.xml',
    button: 'close'
  },{
    icon: 'account_circle',
    name: 'Account',
    url: 'page/account.xml',
    button: 'close'
  },{
    icon: 'edit',
    name: 'Editor',
    url: 'page/editor.xml',
    button: 'close'
  },{
    icon: 'notifications',
    name: 'Notifications',
    url: 'page/notifications.xml',
    button: 'close'
  },{
    icon: 'extension',
    name: 'Extentions',
    url: 'page/extentions.xml',
    button: 'close'
  },{
    icon: 'brush',
    name: 'Themes',
    url: 'page/themes.xml',
    button: 'close'
  },{
    icon: 'code',
    name: 'Dev',
    url: 'page/extention/devmode.xml',
    button: 'extension'
  },{
    icon: 'calendar_today',
    name: 'Myday',
    url: 'page/myday.xml',
    button: 'close'
  },
]

var extentions = [
  {
    name: 'Dev Mode',
    icon: 'code',
    description: 'Enable dev mode to get acesss to development tools',
    url: 'extention/devmode.json',
  },{
    name: 'Hide Home',
    icon: 'home',
    description: 'Hide the default home menu page on the sidebar',
    url: 'extention/hidehome.json',
  },{
    name: 'Page URL',
    icon: 'language',
    description: 'Turn the search input into a page URL browser',
    url: 'extention/pageurl.json',
  },{
    name: 'Collapse Sidebar',
    icon: 'view_sidebar',
    description: 'Enables you to collapse the sidebar to just the icons',
    url: 'extention/collapsesidebar.json',
  },{
    name: 'Hide Search',
    icon: 'search_off',
    description: 'Hide the useless search input on the header',
    url: 'extention/hidesearch.json',
  },{
    name: 'Custom Avitar',
    icon: 'account_circle',
    description: 'Pick avitar icon and color',
    url: 'extention/customavitar.json',
  },
];

var themes = [
  {
    name: 'Default',
    description: 'The default dark, red theme',
    url: 'css/theme/default_theme.css',
  },
  {
    name: 'Light Theme',
    description: 'Its the default theme but white',
    url: 'css/theme/light.css',
  },
  {
    name: 'Arc Dark',
    description: 'The blue dark Arc theme',
    url: 'css/theme/arc_dark.css',
  },
  {
    name: 'Material',
    description: 'Material Theme White',
    url: 'css/theme/material.css',
  },
  {
    name: 'Kimi',
    description: 'Colorful dark theme purple',
    url: 'css/theme/kimi.css',
  },
  {
    name: 'Whiter White',
    description: 'The super white theme',
    url: 'css/theme/whiter.css',
  },
  {
    name: 'Flat Remix',
    description: 'Half dark theme',
    url: 'css/theme/flatremix.css',
  },
]


function getUserData(){
  return {
    username: '',
    name: '',
    pages: ['page/home.xml', 'page/dashboard.xml'],
    currentPage: 'page/home.xml',
    extentions: [],
    theme: 'Default',
  };
}

function backup(){
  localStorage.setItem('myapp', JSON.stringify({
    ...user,
    pages: sidebarItems.map(a => a.url),
    currentPage: currentPage,
  }))
}




var sidebarItems = user.pages.map(a => pages.find(b => b.url == a))
sidebarItems.forEach((a, i) => {
  if(!a)sidebarItems.splice(i);
})
