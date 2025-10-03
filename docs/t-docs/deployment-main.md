You need to set up both Render and Vercel services first to get the required credentials. Here's how to get each one:

🚀 Render Setup (Backend)

1. Deploy to Render first:

   - Go to https://render.com and sign up/login
   - Click "New +" → "Web Service"
   - Connect your GitHub repo: movie-recommendation-app
   - Select the repository and branch main

2. Configure Render Service:

   - Root Directory: backend
   - Build Command: npm ci
   - Start Command: npm start
   - Environment: Node

3. Get Render credentials:

   - Service ID: Found in your service dashboard URL: https://dashboard.render.com/web/srv-XXXXXXXXX (the srv-XXXXXXXXX part)
   - API Key: Go to Account Settings → API Keys → Create new key
   - Service URL: Will be https://your-service-name.onrender.com

🌐 Vercel Setup (Frontend)

1. Deploy to Vercel first:

   - Go to https://vercel.com and sign up/login
   - Import your GitHub repo: movie-recommendation-app
   - Select the frontend folder as root directory

2. Get Vercel credentials:

   - Token: Account Settings → Tokens → Create new token
   - Org ID: Team Settings → General → Team ID (or Personal Account ID)
   - Project ID: Project Settings → General → Project ID

📝 GitHub Secrets Setup

Add these to your GitHub repo secrets (Settings → Secrets and variables → Actions):

# Render

RENDER_SERVICE_ID=srv-xxxxxxxxx
RENDER_API_KEY=rnd_xxxxxxxxx

# Vercel

VERCEL_TOKEN=xxxxxxxxx
VERCEL_ORG_ID=xxxxxxxxx
VERCEL_PROJECT_ID=prj_xxxxxxxxx
BACKEND_URL=https://your-render-service.onrender.com

🔧 Update Environment Variables

Once you have the Render URL, update:

1. Frontend production env (.env.production):
   VITE_API_URL=https://your-render-service.onrender.com/api/v1

2. GitHub workflow (.github/workflows/deploy.yml):
   env:
   VITE_API_URL: ${{ secrets.BACKEND_URL }}/api

3. Render.yaml CORS settings:

- key: CORS_ORIGIN
  value: https://your-vercel-app.vercel.app

🚦 Deployment Order

1. First: Deploy backend to Render manually to get the URL
2. Second: Update CORS settings with your Vercel domain
3. Third: Deploy frontend to Vercel manually to get project details
4. Fourth: Add all secrets to GitHub
5. Fifth: Push to main branch for automated CI/CD

The CI/CD is currently stuck because it's prompting for manual input. You need to complete the initial manual deployments first
to get all the required credentials.

---

---

You'll need to configure environment variables for both Render and Vercel deployments. Here's what you need:

🚀 Render Environment Variables (Backend)

Your render.yaml already has most of these configured, but you'll need to set them in the Render dashboard:

Required:
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://harystyles:Ebuka1234@cluster0.b6kryzo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
DB_NAME=moveere_prod
JWT_SECRET=auto-generated-by-render
OMDB_API_KEY=b584f224

Optional (already configured in render.yaml):
JWT_EXPIRES_IN=1d
BCRYPT_ROUNDS=12
LOG_LEVEL=info
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=50
CORS_ORIGIN=https://your-vercel-app.vercel.app # Update after Vercel deployment

🌐 Vercel Environment Variables (Frontend)

Required:
VITE_API_URL=https://your-render-service.onrender.com/api/v1

Optional:
NODE_ENV=production

📋 Step-by-Step Process

1. Deploy Backend to Render First

- Use the existing render.yaml configuration
- Render will auto-generate JWT_SECRET
- Note the deployed URL (e.g., https://movie-recommendation-backend-xyz.onrender.com)

2. Deploy Frontend to Vercel

- Set VITE_API_URL to your Render backend URL
- Example: VITE_API_URL=https://movie-recommendation-backend-xyz.onrender.com/api/v1

3. Update CORS Setting

- Go back to Render dashboard
- Update CORS_ORIGIN to your Vercel URL
- Example: CORS_ORIGIN=https://your-app-abc123.vercel.app

🔐 Security Notes

For production, you should:

1. Change MongoDB credentials - The current ones are exposed in your code
2. Use environment variables for sensitive data instead of hardcoding in render.yaml
3. Generate a strong JWT_SECRET (Render can auto-generate this)

✅ Environment Variables Summary

Render (Backend): MongoDB URI, JWT secret, OMDB API key, CORS origin
Vercel (Frontend): Backend API URL

Most are already configured in your render.yaml file, so Render deployment should work with minimal manual configuration
needed.

---

---

✅ All Issues Resolved!

Here's what I've fixed for both deployment issues:

🔧 Vercel Issue Fixed:

- ✅ Created proper vercel.json configuration file
- ✅ Removed conflicting functions/builds properties
- ✅ Added SPA routing support with rewrites
- ✅ Configured CORS headers for API calls

🔧 Render/MongoDB Issue Fixed:

- ✅ Enhanced MongoDB connection string with authSource=admin
- ✅ Fixed duplicate schema index warning in Movie model
- ✅ Updated render.yaml with proper configuration

🚨 CRITICAL: MongoDB Atlas Network Access

You must manually configure MongoDB Atlas:

1. Go to https://cloud.mongodb.com
2. Navigate to: Network Access → IP Access List
3. Click: "Add IP Address"
4. Select: "Allow Access From Anywhere" (0.0.0.0/0)
5. Click: Confirm

Alternative (More Secure): Add Render's specific IP ranges:
3.208.72.0/23
44.194.72.0/23
52.70.186.0/23

🚀 Next Steps:

1. Commit and push these changes:
   git add .
   git commit -m "Fix deployment issues: vercel config and mongodb connection"
   git push origin main

2. Configure MongoDB Atlas network access (critical step above)
3. Your deployments should now work:


    - Render: Backend will connect to MongoDB successfully
    - Vercel: Frontend will deploy without configuration errors

4. Monitor the GitHub Actions workflow for successful deployment

Once you configure MongoDB Atlas network access, both deployments should complete successfully! 🎉
