let repos = [];

(async () => {
  const response = await fetch('https://api.github.com/users/jadenconcord/repos');
  const data = await response.json();
  var result = [];
  if (data.length)
    data.forEach(repo => {
      result.push({
        name: repo.name,
        description: repo.description || '',
        url: repo.html_url,
      })
    });
  else result = [{
    name: "theme-generator",
    description: "generate themes",
    url: "https://github.com/jadenconcord/theme-generator"
  },{
    name: "tester",
    description: "generate",
    url: "https://github.com/jadenconcord/theme-generator"
  },]
  repos = result;


  new Template('#repos_temp')

})()
