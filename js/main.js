let repos = [];
let articles = [];
let projects = [];

(async () => {

  const projectsRes = await fetch('projects.json');
  let projectsParse = await projectsRes.text();
  projects = JSON.parse(projectsParse).projects.reverse();

  const reposRes = await fetch('https://api.github.com/users/jadenconcord/repos');
  repos = await reposRes.json();


  const articleRes = await fetch('https://dev.to/api/articles?username=jadenconcord');
  articles = await articleRes.json();


  new Template('#repos_temp')

})()
