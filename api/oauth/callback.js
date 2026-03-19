export default async function handler(req, res) {
    const code = req.query.code;
  
    const response = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });
  
    const data = await response.json();
  
    // 返回给 Decap CMS
    res.json({
      token: data.access_token,
    });
  }