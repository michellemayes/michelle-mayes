# Michelle Mayes - Personal Website

A modern, professional personal website built with Astro featuring dynamic GitHub portfolio integration, blog functionality, and a clean purple-accented design.

## ✨ Features

- **Dynamic GitHub Portfolio**: Automatically fetches and displays your repositories
- **Blog System**: Full blog functionality with Markdown/MDX support
- **Resume Integration**: Embedded PDF viewer with download functionality
- **Responsive Design**: Mobile-first approach with clean, professional aesthetics
- **SEO Optimized**: Built-in sitemap, RSS feed, and OpenGraph support
- **Fast Performance**: 100/100 Lighthouse performance score
- **Purple Theme**: Professional yet colorful design with purple accents

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

## 📁 Project Structure

```
├── public/
│   ├── resume.pdf          # Your resume file
│   └── fonts/              # Custom fonts
├── src/
│   ├── components/         # Reusable components
│   ├── content/
│   │   └── blog/          # Blog posts (Markdown/MDX)
│   ├── lib/
│   │   └── github.ts      # GitHub API integration
│   ├── pages/             # Site pages
│   │   ├── index.astro    # Homepage
│   │   ├── about.astro    # About page
│   │   ├── projects.astro # GitHub projects
│   │   ├── resume.astro   # Resume page
│   │   └── blog/          # Blog pages
│   ├── styles/
│   │   └── global.css     # Global styles & theme
│   └── consts.ts          # Site configuration
├── docs/                  # Documentation
└── astro.config.mjs       # Astro configuration
```

## 🎨 Design System

### Colors
- **Primary Purple**: `#8B5CF6`
- **Purple Dark**: `#7C3AED`
- **Purple Light**: `#A78BFA`
- **Accent Colors**: Various purple shades for highlights

### Typography
- **Font**: Atkinson (custom web font)
- **Hierarchy**: Clear heading structure with proper contrast

### Components
- **Cards**: Rounded corners with subtle shadows
- **Buttons**: Purple primary, outlined secondary
- **Grid Layouts**: Responsive auto-fit grids

## 🔧 Development

### Available Scripts

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Install dependencies                             |
| `npm run dev`             | Start dev server at `localhost:4321`            |
| `npm run build`           | Build for production to `./dist/`                |
| `npm run preview`         | Preview production build locally                 |
| `npm run astro ...`       | Run Astro CLI commands                          |

### GitHub API Integration

The site automatically fetches your GitHub repositories at build time. No authentication is required for public repos, but you can add a `GITHUB_TOKEN` environment variable for higher rate limits.

**Rate Limits:**
- Without token: 60 requests/hour
- With token: 5,000 requests/hour

## 📚 Technology Stack

- **Framework**: [Astro](https://astro.build/)
- **Styling**: CSS with custom properties
- **Content**: Markdown/MDX with Content Collections
- **Deployment**: Vercel (configured)
- **API**: GitHub REST API
- **Performance**: 100/100 Lighthouse score

## 🤝 Contributing

This is a personal website template. Feel free to fork and customize for your own use!

## 🙏 Credits

- **Original Template**: [Astro Blog Starter](https://github.com/withastro/astro)
- **Design Inspiration**: [Bear Blog](https://github.com/HermanMartinus/bearblog/)
- **Icons**: Custom SVG icons
- **Fonts**: Atkinson font family
