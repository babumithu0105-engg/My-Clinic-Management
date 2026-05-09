# Vercel Deployment Guide

Complete steps to deploy the clinic management app to Vercel with automatic deployments on code updates.

---

## Prerequisites

✅ **GitHub account** (free)  
✅ **Vercel account** (free tier)  
✅ **Supabase project** running (Phase 1 complete)  
✅ **Git repository** on GitHub  
✅ **Environment variables** configured locally (.env.local)

---

## Step 1: Prepare Your Git Repository

### 1.1 Ensure All Changes Are Committed

Check your git status:
```bash
git status
```

Expected output: `nothing to commit, working tree clean`

If you have uncommitted changes:
```bash
git add .
git commit -m "Phase 3: Design system + logo integration"
```

### 1.2 Push to GitHub Main Branch

If you haven't pushed recently:
```bash
git push origin main
```

Verify on GitHub:
- Go to https://github.com/YOUR_USERNAME/clinic-app
- Confirm latest commit appears on main branch
- Check that `.env.local` is NOT in the repository (should be in .gitignore)

---

## Step 2: Create Vercel Account & Connect GitHub

### 2.1 Sign Up / Log In to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"** (or **"Log In"** if you have an account)
3. Select **"Continue with GitHub"**
4. Authorize Vercel to access your GitHub account
5. Complete setup (no credit card needed for free tier)

### 2.2 Import Your Repository

1. On Vercel dashboard, click **"Add New..."** → **"Project"**
2. Select **"Import Git Repository"**
3. Paste your repository URL: `https://github.com/YOUR_USERNAME/clinic-app`
4. Click **"Import"**
   - Vercel will detect Next.js project automatically
   - Framework preset: **Next.js** ✓
   - Build command: `next build` ✓
   - Output directory: `.next` ✓

---

## Step 3: Configure Environment Variables

### 3.1 Add Environment Variables to Vercel

On the **Environment Variables** page during project setup:

**Add each variable individually:**

| Variable | Value | Notes |
|----------|-------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | From Supabase dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key | From Supabase dashboard → Settings → API |
| `NEXT_PUBLIC_APP_NAME` | My Clinic Management | Display name |
| `NEXT_PUBLIC_APP_URL` | https://your-vercel-url.vercel.app | Set after first deploy |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key | ⚠️ CRITICAL: Keep secret! |
| `JWT_SECRET` | Your JWT secret (min 32 chars) | Same as .env.local |
| `JWT_EXPIRES_IN` | 24h | Token expiry duration |
| `BCRYPT_SALT_ROUNDS` | 12 | Password hashing rounds |

### 3.2 Copy Values from .env.local

Open your local `.env.local` file:
```bash
cat .env.local
```

Copy each value and paste into Vercel environment variable fields.

**⚠️ IMPORTANT:** 
- `SUPABASE_SERVICE_ROLE_KEY` is sensitive — Vercel will hide it after input
- `JWT_SECRET` should be the exact same value as your local .env.local
- Do NOT share these values with anyone

### 3.3 Select Environments

For each variable, check:
- ☑️ **Production** (for production deployments)
- ☑️ **Preview** (for branch previews)
- ☑️ **Development** (optional, for local development via `vercel env pull`)

---

## Step 4: Deploy

### 4.1 Click "Deploy"

After adding all environment variables:
1. Click **"Deploy"** button
2. Vercel will start the build process
3. Watch the build logs in real-time
4. Expected build time: **2-3 minutes**

### 4.2 Monitor the Build

Build process:
```
⏳ Building...
✓ Analyzed 147 files
✓ Generated optimized production build (9.2 MB)
✓ Build completed in 45 seconds
✓ Deployment complete
```

If the build fails:
1. Check the **"Build Logs"** tab
2. Common issues:
   - Missing environment variables → Add them and redeploy
   - TypeScript errors → Fix locally, commit, push, and redeploy
   - Missing dependencies → Run `npm install`, commit package-lock.json, push

### 4.3 Get Your Deployment URL

After successful deployment:
- **Production URL:** `https://your-project-name.vercel.app`
- **Short alias:** Click "Copy URL" button
- Share this URL with testers

---

## Step 5: Post-Deployment Verification

### 5.1 Test Login Flow

1. Open your Vercel URL in a browser
2. Should redirect to `/login`
3. Log in with demo credentials (if you added test data to Supabase):
   ```
   Email: demo@clinic.com
   Password: Demo@123
   ```

### 5.2 Test All User Roles

- **Receptionist:** `/app/receptionist`
- **Doctor:** `/app/doctor`
- **Admin:** `/app/admin`
- **Component Preview:** `/dev-preview`
- **Health Check:** `/api/health`

### 5.3 Verify Environment Setup

Test health endpoint to confirm Supabase connection:
```bash
curl https://your-vercel-url.vercel.app/api/health
```

Expected response:
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2026-05-09T10:30:00Z"
}
```

If status is "error", check:
- Supabase credentials in Vercel environment variables
- Supabase project is running (check Supabase dashboard)
- Network connectivity from Vercel to Supabase

### 5.4 Check Browser Console

Open DevTools (F12) and check:
- ✅ No 401/403 errors (auth failures)
- ✅ No CORS errors
- ✅ No missing environment variable warnings
- ✅ Logo loads correctly from `/logo.png`

---

## Step 6: Enable Auto-Deployments

### 6.1 Automatic Deployments on Push

By default, Vercel automatically deploys when you push to GitHub:

**To main branch:**
```bash
git push origin main
# Vercel deploys to production automatically
```

**To other branches:**
```bash
git checkout -b feature/new-feature
# ... make changes ...
git push origin feature/new-feature
# Vercel creates a preview deployment
```

### 6.2 View Deployment History

In Vercel dashboard:
1. Click **"Deployments"** tab
2. See all past deployments
3. Rollback to previous version if needed
4. View build logs for any deployment

### 6.3 Configure Auto-Deployments (Optional)

In **Project Settings** → **Git**:
- **Production Branch:** `main`
- **Preview Branches:** `dev`, `staging` (optional)
- **Ignored Build Step:** (leave empty unless you have monorepo)

---

## Step 7: Custom Domain (Optional)

### 7.1 Connect Custom Domain

If you have a domain (e.g., `clinic.example.com`):

1. In Vercel, go **Domains**
2. Enter your domain name
3. Vercel provides nameserver details
4. Update your domain registrar's nameservers
5. DNS propagation: 24-48 hours

### 7.2 Free Alternatives

- Use Vercel's free subdomain: `your-project.vercel.app`
- Use a free .tk domain from Freenom
- Use GitHub Pages + Vercel subdomain

---

## Step 8: Monitor & Maintain

### 8.1 Performance Monitoring

In Vercel dashboard → **Analytics**:
- Page load times
- API response times
- Error rates
- Bandwidth usage

### 8.2 Log Real Requests

In **Deployments** → Click any deployment:
- View **"Logs"** tab
- See real HTTP requests
- Debug issues in production

### 8.3 Automatic Updates

Vercel handles:
- ✅ SSL certificates (free, auto-renew)
- ✅ DDoS protection
- ✅ Global CDN caching
- ✅ Automatic scaling

---

## Step 9: Environment Updates

### 9.1 Update Environment Variables

If you need to change a variable (e.g., JWT_SECRET):

1. Go to **Settings** → **Environment Variables**
2. Click the variable to edit
3. Enter new value
4. Click **"Save"**
5. Vercel prompts: **"Deploy to production?"**
   - Click **"Deploy"** to apply immediately
   - Or wait for next git push

### 9.2 Add New Environment Variables

1. Click **"Add"** button
2. Enter variable name and value
3. Select environments (Production, Preview, Development)
4. Click **"Save"**
5. Trigger a new deployment to apply

---

## Step 10: Troubleshooting

### Build Fails: "Command failed"

**Solution:**
```bash
# Locally verify build works
npm run build

# Fix any errors, then commit and push
git add .
git commit -m "Fix build errors"
git push origin main
```

### Deployment Fails: "Health check timeout"

**Solution:**
- Vercel waits 60 seconds for `/health` endpoint
- Ensure `/api/health` responds within timeout
- Check Supabase is reachable from Vercel
- Add health check endpoint logging

### Login Not Working in Production

**Possible causes:**
- `JWT_SECRET` doesn't match between local and Vercel
- `SUPABASE_SERVICE_ROLE_KEY` is invalid
- Supabase RLS policies rejecting requests
- CORS issues (check Supabase CORS settings)

**Debug steps:**
```bash
# Check health endpoint
curl https://your-vercel-url.vercel.app/api/health

# View logs in Vercel dashboard
# Look for 401/403 errors in Deployments → Logs
```

### Logo Not Showing

**Solution:**
- Verify `public/logo.png` is committed to GitHub
- Check network tab in DevTools
- Image should load from `https://your-vercel-url.vercel.app/logo.png`

---

## Production Checklist

Before going live:

- [ ] All environment variables added to Vercel
- [ ] `/api/health` endpoint responds successfully
- [ ] Login works with test credentials
- [ ] All three dashboards load (receptionist, doctor, admin)
- [ ] `/dev-preview` route accessible
- [ ] Logo displays correctly
- [ ] Mobile responsive (test on phone browser)
- [ ] No console errors (check DevTools)
- [ ] Database queries working (test patient search if available)
- [ ] Error handling graceful (test with invalid credentials)
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] Custom domain configured (if using one)

---

## Post-Deployment Maintenance

### Weekly
- Monitor Vercel analytics for errors
- Check application logs for issues

### Monthly
- Review deployment history
- Verify all features still working
- Update environment variables if needed

### Before Major Updates
- Test locally with `npm run build`
- Create feature branch for development
- Use Vercel preview deployments for testing
- Merge to main only after verification

---

## Rollback Procedure

If something breaks in production:

1. Go to Vercel **Deployments**
2. Find the last known-good deployment
3. Click **"..." menu** → **"Promote to Production"**
4. Vercel redeploys that version immediately
5. Fix the issue locally
6. Commit and push to redeploy

---

## Cost

Vercel free tier includes:
- ✅ **12 serverless function invocations per day** (plenty for clinic app)
- ✅ **Unlimited deployments**
- ✅ **Unlimited preview deployments**
- ✅ **100 GB bandwidth per month**
- ✅ **Global edge network**
- ✅ **Free SSL certificates**

For a small clinic (~10-50 daily users), you'll stay well within free tier limits.

---

## Summary

```
┌─────────────────────────────────┐
│  Your App on Vercel             │
├─────────────────────────────────┤
│ • Auto-deploys on git push      │
│ • Global CDN for fast loading   │
│ • Free SSL/HTTPS                │
│ • Automatic scaling             │
│ • 99.95% uptime SLA             │
│ • Easy rollbacks                │
│ • Real-time logs & analytics    │
└─────────────────────────────────┘
```

**Your app is now:**
- ✅ Live on the internet
- ✅ Accessible from anywhere
- ✅ Auto-updating on code changes
- ✅ Monitored 24/7
- ✅ Production-ready

---

## Next Steps

1. **Deploy now** → Follow Steps 1-5 above
2. **Test thoroughly** → Use production URL with real data
3. **Share with team** → Give them the Vercel URL
4. **Continue development** → Git push automatically updates deployment
5. **Monitor** → Check Vercel dashboard for errors

Need help? Check Vercel docs: https://vercel.com/docs
