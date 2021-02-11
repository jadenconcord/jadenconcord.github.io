let repos = [];
let articles = [];

(async () => {
  const reposRes = await fetch('https://api.github.com/users/jadenconcord/repos');
  repos = await reposRes.json();


  const articleRes = await fetch('https://dev.to/api/articles?username=jadenconcord');
  articles = await articleRes.json();


  new Template('#repos_temp')

})()
