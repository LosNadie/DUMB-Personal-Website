# Deployment Guide (GitHub + Mainland Access + Mobile Publishing)

## 1. Push to GitHub

Run locally in project root:

```bash
git init
git add .
git commit -m "feat: dumb website with backend studio"
git branch -M main
git remote add origin <YOUR_GITHUB_REPO_URL>
git push -u origin main
```

## 2. Prepare a server

- Recommended: Alibaba Cloud / Tencent Cloud lightweight server.
- If you want best mainland speed and stability: choose mainland node + ICP filing.
- If you want faster launch: choose HK node first.

## 3. Bootstrap server

```bash
bash deploy/scripts/server-bootstrap.sh
```

Before running, edit this file and replace:

- `REPO_URL` in `deploy/scripts/server-bootstrap.sh`

## 4. Configure backend env on server

```bash
cd /var/www/dumb-personal-website/backend
cp .env.example .env
```

Then edit `.env`:

- `JWT_SECRET` must be strong and random
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` set your own secure credentials
- `FRONTEND_ORIGIN` set your public website domain

## 5. Deploy

```bash
cd /var/www/dumb-personal-website
bash deploy/scripts/deploy.sh
```

## 6. Configure Nginx

```bash
sudo cp deploy/nginx/dumb.conf /etc/nginx/sites-available/dumb.conf
sudo ln -sf /etc/nginx/sites-available/dumb.conf /etc/nginx/sites-enabled/dumb.conf
sudo nginx -t
sudo systemctl reload nginx
```

Edit `/etc/nginx/sites-available/dumb.conf` and replace:

- `your-domain.com`

## 7. Enable HTTPS

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## 8. Mobile publishing

- Open `https://your-domain.com/studio` on phone browser
- Login with admin account
- Publish/edit/delete content
- Upload image/video from phone local file picker

## 9. Important notes

- Uploaded media is stored on server local disk under `backend/uploads/`.
- You should schedule backup for `backend/prisma/dev.db` and `backend/uploads/`.
- For production, do **not** keep weak admin password.
