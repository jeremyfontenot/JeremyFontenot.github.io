# GitHub Pages Deployment Guide

## Quick Setup

### 1. Create GitHub Repository
```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Portfolio website"

# Create repo on GitHub (skip if already exists)
# Then add remote:
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git

# Push to GitHub
git push -u origin main
```

### 2. Enable GitHub Pages
1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Under "Source", select **main** branch
4. Select **/ (root)** folder
5. Click **Save**
6. Your site will be live at: `https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/`

### 3. Custom Domain (Optional)
If using a custom domain (like jeremyfontenot.online):

1. Create a file named `CNAME` in your repository root
2. Add your domain name (one line): `jeremyfontenot.online`
3. In your domain registrar (e.g., Namecheap, GoDaddy):
   - Add an **A record** pointing to GitHub's IPs:
     - `185.199.108.153`
     - `185.199.109.153`
     - `185.199.110.153`
     - `185.199.111.153`
   - Or add a **CNAME record** for `www` pointing to `YOUR-USERNAME.github.io`
4. In GitHub Settings → Pages, enter your custom domain
5. Enable "Enforce HTTPS"

## File Structure Verified ✓

All paths are now **relative** (not absolute), which is required for GitHub Pages:
- ✓ `fontawesome/css/all.min.css` (was `/fontawesome/...`)
- ✓ `js/particles.min.js` (was `/js/...`)
- ✓ All image paths are relative: `Images/...`

## Deployment Checklist

- [x] Fixed absolute paths to relative
- [x] Created README.md
- [x] Created .gitignore
- [x] No code errors detected
- [ ] Push to GitHub
- [ ] Enable GitHub Pages in repository settings
- [ ] (Optional) Configure custom domain

## Testing Locally

To test your site locally before deploying:

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Or use VS Code Live Server extension
```

Then visit: `http://localhost:8000`

## Updates

To update your site after changes:
```bash
git add .
git commit -m "Update website content"
git push
```

GitHub Pages will automatically rebuild and deploy within 1-2 minutes.

## Troubleshooting

**Site not loading?**
- Check Settings → Pages is enabled
- Wait 2-3 minutes after first push
- Check repository is **public**

**Missing styles/images?**
- Verify all paths are relative (no leading `/`)
- Check file names match exactly (case-sensitive on Linux)

**Custom domain not working?**
- DNS changes can take 24-48 hours
- Verify CNAME file exists in root
- Check DNS records with: `dig YOUR-DOMAIN.com`
