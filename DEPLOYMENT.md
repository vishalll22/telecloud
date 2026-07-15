# 🚀 TeleCloud Complete Server Deployment Guide

This guide gives you exact, step-by-step instructions to deploy **TeleCloud** to any live production server or cloud platform.

Because we configured TeleCloud as a **Single-Port Production Stack** (`server.js` serves both your backend API and your built Vite frontend SPA on port `4000`), you can deploy it in several easy ways:

---

## ⭐️ Method 1: One-Click Docker Deployment on VPS (Recommended & Easiest)

This works on any **Linux Server / VPS** (Ubuntu 20.04/22.04/24.04, Debian, CentOS on DigitalOcean, AWS EC2, Linode, Hetzner, or Oracle Cloud Free Tier).

### Step 1: Connect to your Server
SSH into your VPS terminal from your computer:
```bash
ssh root@your_server_ip_address
```

### Step 2: Install Git & Docker (if not installed)
```bash
# Update system and install required tools
sudo apt update && sudo apt install -y git curl

# Install Docker & Docker Compose via official script
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

### Step 3: Clone or Upload Your TeleCloud Project
If your project is on GitHub / GitLab:
```bash
git clone https://github.com/yourusername/telecloud.git
cd telecloud
```
*(If uploading locally via SFTP/FileZilla, just upload your `telecloud/` folder onto `/var/www/telecloud` and `cd /var/www/telecloud`)*

### Step 4: Launch TeleCloud in Production Mode
Run this single command inside the project directory:
```bash
docker compose up -d --build
```
- Docker will compile your React frontend with Vite, setup the Node backend, create a persistent volume (`telecloud_data`) so your user databases and encrypted keys are safe even after restarts, and bind to port `4000`.

### Step 5: Verify & Access
Your application is now live! Open your browser and go to:
`http://your_server_ip_address:4000`

---

## 🌐 Method 2: Adding Custom Domain + HTTPS (Free SSL via Nginx & Let's Encrypt)

To access TeleCloud securely via `https://drive.yourdomain.com`:

### Step 1: Point Your Domain DNS
Go to your domain registrar (Cloudflare, Namecheap, GoDaddy) and add an **A Record**:
- **Name:** `drive` (or `@` for root domain)
- **Content:** `your_server_ip_address`

### Step 2: Install Nginx & Certbot SSL
```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

### Step 3: Create Nginx Reverse Proxy Configuration
Create a configuration file for your domain:
```bash
sudo nano /etc/nginx/sites-available/telecloud
```
Paste the following inside (replace `drive.yourdomain.com` with your domain):
```nginx
server {
    listen 80;
    server_name drive.yourdomain.com;

    client_max_body_size 500M; # Allow large file uploads through proxy

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```
Save and exit (`Ctrl+O`, `Enter`, `Ctrl+X`).

### Step 4: Enable Site & Obtain Free SSL Certificate
```bash
# Enable Nginx configuration
sudo ln -s /etc/nginx/sites-available/telecloud /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# Generate automatic Let's Encrypt HTTPS Certificate
sudo certbot --nginx -d drive.yourdomain.com
```
Follow the quick 2-prompt wizard, and your site is instantly live with **lock 🔒 HTTPS**!

---

## 📦 Method 3: Traditional PM2 Node.js Deployment (Without Docker)

If you prefer running Node directly on your VPS without Docker containers:

### Step 1: Install Node.js v20+ and PM2 Process Manager
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

### Step 2: Build & Start TeleCloud
```bash
cd telecloud/frontend
npm install && npm run build

cd ../backend
npm install

# Set production environment and start with PM2
export NODE_ENV=production
export PORT=4000
export JWT_SECRET=your_secure_random_secret_here

pm2 start server.js --name "telecloud"
pm2 save
pm2 startup
```
Your app will now run 24/7, restart automatically on server reboot, and serve both frontend and API on port `4000`!

---

## ☁️ Method 4: Free/Cloud PaaS Platforms (Render / Railway / Fly.io)

### On Render / Railway:
1. Connect your GitHub repository to **Render** or **Railway**.
2. Select **Dockerfile** as the build method (TeleCloud includes a multi-stage `Dockerfile` automatically configured for production).
3. Set the Environment Variables under your service settings:
   - `PORT`: `4000`
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: `any_long_secret_key`
4. Add a **Persistent Disk/Volume** mounted to `/app/backend/data` (so your user database and file metadata persist between redeploys).
5. Click **Deploy**!
