# Personal Website Build Plan

## Overview

Transform the existing Astro blog starter into a complete personal website with automated GitHub portfolio integration, blog functionality, about page, and social links. The site will feature a professional yet colorful design with purple accents and minimalist aesthetics.

## Key Changes

### 1. Site Configuration & Branding

**Files:** `src/consts.ts`, `astro.config.mjs`

- Update site title, description, and URL in `src/consts.ts`
- Add GitHub username and social media links as constants
- Configure proper Vercel deployment settings in `astro.config.mjs`

### 2. Homepage Redesign

**File:** `src/pages/index.astro`

- Create minimalist hero section with professional introduction
- Add "Latest Blog Posts" section showing 3-4 recent posts
- Add "Featured Projects" section displaying pinned/recent GitHub repos
- Implement purple accent colors throughout
- Make it responsive and clean

### 3. GitHub Portfolio Page

**New file:** `src/pages/projects.astro`

- Fetch repositories dynamically from GitHub API at build time
- Display repo cards with: name, description, language, stars, and link
- Filter out forks and show only original repos (or make it configurable)
- Sort by updated date or stars
- Use purple accents for interactive elements
- No authentication needed for public repos

### 4. Navigation & Header Updates

**File:** `src/components/Header.astro`

- Update navigation: Home, Blog, Projects, About
- Replace default social icons with: GitHub, X/Twitter, LinkedIn, Email
- Update links to your actual profiles
- Maintain responsive design

### 5. About Page Enhancement

**File:** `src/pages/about.astro`

- Replace lorem ipsum with structured layout for personal bio
- Add sections for: background, skills/technologies, current work
- Include professional headshot placeholder
- Link to resume/CV if available
- Purple accent styling

### 6. Resume Page

**New file:** `src/pages/resume.astro`
**New file:** `public/resume.pdf` (placeholder)

- Create dedicated resume page with embedded PDF viewer
- Add prominent download button for PDF resume
- Provide fallback link for browsers that don't support PDF embed
- Responsive design that works on mobile (show download option prominently)
- Instructions for user to add their actual resume.pdf file to `/public` directory

### 7. Footer Updates

**File:** `src/components/Footer.astro`

- Add your name and current year
- Include social links
- Add email contact

### 8. Styling & Theme

**Files:** `src/styles/global.css`, component styles

- Implement purple color scheme as CSS variables
- Maintain professional, clean aesthetic
- Ensure good contrast and readability
- Add subtle animations/transitions
- Keep it fast and lightweight

### 9. GitHub API Integration

**New file:** `src/lib/github.ts`

- Create utility function to fetch repos from GitHub API
- Handle pagination if needed
- Cache/process data at build time (Astro does this automatically)
- Type definitions for repository data

### 10. Vercel Deployment Configuration

**New file:** `vercel.json` (if needed)

- Ensure build commands are correct
- Set up environment variables if needed for API rate limits
- Configure domains/redirects if applicable

### 11. Documentation

**New directory:** `docs/`
**New file:** `docs/PLANNING.md`
**Update file:** `README.md`

- Create `docs/` directory for project documentation
- Move this implementation plan to `docs/PLANNING.md` for reference
- Rewrite `README.md` to include:
  - Project overview and features
  - How the project was generated (Astro blog starter template)
  - Local development setup instructions
  - How to customize (add resume PDF, update social links, etc.)
  - Deployment instructions for Vercel
  - Optional: GitHub token setup for higher API rate limits
  - Technology stack and dependencies

## Implementation Notes

- GitHub API allows 60 requests/hour without authentication, sufficient for build-time fetches
- For better rate limits, can add `GITHUB_TOKEN` environment variable in Vercel
- Astro's static site generation will fetch GitHub data at build time
- Consider adding a webhook or scheduled rebuild to keep portfolio updated
- All existing blog functionality will be preserved
- RSS feed and sitemap already configured for SEO

## Design Approach

- Purple as primary accent color (#8B5CF6 or similar)
- Clean typography with good hierarchy
- Card-based layouts for blog posts and projects
- Subtle hover effects and transitions
- Mobile-first responsive design
- Fast load times (Astro's default performance)

## Completed Tasks

- [x] Update site configuration with personal branding and social links
- [x] Create GitHub API integration utility to fetch repositories
- [x] Implement purple-accented professional theme with CSS variables
- [x] Redesign homepage with hero, latest posts, and featured projects sections
- [x] Build dynamic projects page with GitHub repository cards
- [x] Update header navigation and social icons
- [x] Enhance about page with structured personal information
- [x] Create resume page with embedded PDF viewer and download link
- [x] Update footer with personal information and links
- [x] Create documentation directory and planning file
