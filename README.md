# Michelle Mayes - Personal Website

This is the source code for my personal website, built with [Astro](https://astro.build) and deployed on [Vercel](https://vercel.com) featuring dynamic GitHub portfolio integration and blog functionality.

## ✨ Features

- **Dynamic GitHub Portfolio**: Automatically fetches and displays your repositories
- **Blog System**: Full blog functionality with Markdown/MDX support
- **Resume Integration**: Embedded PDF viewer with download functionality
- **Responsive Design**: Mobile-first approach with clean, professional aesthetics
- **SEO Optimized**: Built-in sitemap, RSS feed, and OpenGraph support
- **Fast Performance**: 100/100 Lighthouse performance score
- **Purple Theme**: Professional yet colorful design with purple accents

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
- **Font**: Inter (Google Fonts)
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
- **Fonts**: Inter font family