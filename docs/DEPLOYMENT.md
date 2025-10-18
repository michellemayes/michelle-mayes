# Deployment Guide

This guide covers how to deploy your personal website to various hosting platforms.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone this repository**
   ```bash
   git clone <your-repo-url>
   cd michelle-mayes
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:4321`

## 🛠️ Customization

### 1. Personal Information

Update `src/consts.ts` with your information:

```typescript
export const SITE_TITLE = 'Your Name';
export const SITE_DESCRIPTION = 'Your personal description';
export const GITHUB_USERNAME = 'your-github-username';
export const SOCIAL_LINKS = {
  github: 'https://github.com/your-username',
  twitter: 'https://twitter.com/your-username',
  linkedin: 'https://linkedin.com/in/your-username',
  email: 'mailto:your-email@example.com',
};
export const SITE_URL = 'https://your-domain.vercel.app';
```

### 2. Add Your Resume

1. Replace `public/resume.pdf` with your actual resume
2. Update the filename in `src/pages/resume.astro` if needed

### 3. Customize About Page

Edit `src/pages/about.astro` to include:
- Your personal background
- Skills and technologies
- Current focus areas
- Professional photo (replace the emoji placeholder)

### 4. Blog Posts

Add new blog posts in `src/content/blog/` as Markdown files with frontmatter:

```markdown
---
title: "Your Post Title"
description: "Post description"
pubDate: 2024-01-01
tags: ["tag1", "tag2"]
---

Your post content here...
```

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will automatically detect Astro and configure the build

3. **Set Environment Variables** (Optional)
   - Add `GITHUB_TOKEN` in Vercel dashboard for higher API rate limits
   - This allows more frequent GitHub API calls

### Manual Deployment

```bash
npm run build
# Deploy the ./dist folder to your hosting provider
```

### Other Hosting Options

- **Netlify**: Similar to Vercel, supports Astro out of the box
- **GitHub Pages**: Requires static build, works well with Astro
- **Cloudflare Pages**: Fast global CDN, easy GitHub integration
- **AWS S3 + CloudFront**: For advanced users who want full control
