export default function handler(req, res) {
    const client_id = process.env.GITHUB_CLIENT_ID;
    const redirect_uri = `${process.env.BASE_URL}/api/oauth/callback`;
  
    const githubAuthURL = `https://github.com/login/oauth/authorize?client_id=${client_id}&redirect_uri=${redirect_uri}&scope=repo`;
  
    res.redirect(githubAuthURL);
  }