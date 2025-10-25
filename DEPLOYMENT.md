# 🚀 Deployment Guide for WebShop

## ❌ Why Netlify Won't Work
Your application is a **Node.js backend with SQLite database**, but **Netlify only supports static sites**. You need a platform that supports:
- Node.js runtime
- Database storage
- Server-side processing

## ✅ Recommended Deployment Options

### 🥇 **Option 1: Railway (Recommended)**
**Best for beginners - Easiest deployment**

#### Steps:
1. **Sign up**: Go to [railway.app](https://railway.app) and create an account
2. **Connect GitHub**: Link your GitHub account
3. **Deploy**: 
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your webshop repository
   - Railway will automatically detect it's a Node.js app
4. **Access**: Your app will be live at `https://your-app-name.railway.app`

#### Features:
- ✅ Free tier (500 hours/month)
- ✅ Automatic HTTPS
- ✅ SQLite database support
- ✅ Automatic deployments from GitHub
- ✅ No configuration needed

---

### 🥈 **Option 2: Render**
**Good alternative with free tier**

#### Steps:
1. **Sign up**: Go to [render.com](https://render.com) and create an account
2. **Create Web Service**:
   - Connect your GitHub repository
   - Choose "Web Service"
   - Build Command: `npm install`
   - Start Command: `npm start`
3. **Deploy**: Click "Create Web Service"

#### Features:
- ✅ Free tier available
- ✅ Automatic HTTPS
- ✅ SQLite database support
- ✅ Easy setup

---

### 🥉 **Option 3: Heroku**
**More complex but powerful**

#### Steps:
1. **Sign up**: Go to [heroku.com](https://heroku.com)
2. **Install Heroku CLI**: Download from [devcenter.heroku.com](https://devcenter.heroku.com)
3. **Deploy**:
   ```bash
   heroku create your-app-name
   git push heroku main
   ```

#### Features:
- ⚠️ No free tier (paid plans only)
- ✅ Very reliable
- ⚠️ Requires PostgreSQL for production (not SQLite)

---

## 🎯 **Quick Start with Railway (Recommended)**

### Step 1: Prepare Your Repository
Your project is already configured with:
- ✅ `package.json` with correct start script
- ✅ `railway.json` configuration file
- ✅ `Procfile` for deployment
- ✅ Database initialization code

### Step 2: Deploy to Railway
1. **Push to GitHub**: Make sure your code is on GitHub
2. **Go to Railway**: Visit [railway.app](https://railway.app)
3. **Sign up**: Create account with GitHub
4. **New Project**: Click "New Project" → "Deploy from GitHub repo"
5. **Select Repository**: Choose your webshop repository
6. **Deploy**: Railway will automatically deploy your app

### Step 3: Access Your App
- Your app will be live at: `https://your-app-name.railway.app`
- Admin panel: `https://your-app-name.railway.app/admin/login.html`
- Default login: `admin` / `admin123`

---

## 🔧 **Environment Variables (Optional)**

If you need to customize settings, add these in Railway dashboard:

```env
NODE_ENV=production
PORT=3000
```

---

## 📊 **Monitoring Your Deployment**

### Railway Dashboard:
- View logs in real-time
- Monitor resource usage
- Restart services if needed
- View deployment history

### Health Check:
Your app includes a health check at the root URL (`/`)

---

## 🆘 **Troubleshooting**

### Common Issues:

1. **Build Fails**:
   - Check that all dependencies are in `package.json`
   - Ensure `npm start` works locally

2. **Database Issues**:
   - SQLite database is created automatically
   - Admin credentials are initialized on first run

3. **App Not Loading**:
   - Check Railway logs for errors
   - Ensure PORT environment variable is set

4. **Admin Login Issues**:
   - Default credentials: `admin` / `admin123`
   - Change them via admin settings after first login

---

## 🎉 **Success!**

Once deployed, your webshop will be:
- ✅ Live on the internet
- ✅ Accessible from anywhere
- ✅ Secure with HTTPS
- ✅ Auto-updating from GitHub pushes

**Admin Access**: `https://your-app-name.railway.app/admin/login.html`
**Default Login**: `admin` / `admin123`
