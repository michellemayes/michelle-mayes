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
- **Headings**: Inter throughout, with Caveat for the sticky note and JetBrains Mono for code
- **Loading**: fonts are self-hosted with Fontsource (Inter is preloaded), CSS is inlined into each page, and links are prefetched on hover
- **Hierarchy**: Clear heading structure with proper contrast

### Desktop OS theme
The whole site is styled as a Mac-style desktop ("Michelle OS"):
- **Menu bar** (`Header.astro`): navigation, a live clock, and the project currently being built
- **Dock** (`Footer.astro`): page links and contact shortcuts, pinned to the bottom on wide screens; on the homepage it also reopens closed windows
- **Window** (`Window.astro`): the one window component every page uses, so titlebars and traffic lights match everywhere. On inner pages the red light goes back to the desktop
- **Page shell** (`layouts/OsPage.astro`): menu bar, a single app window, and the dock, for every page except the homepage
- **UI kit** (`global.css`): shared `.mac-btn`, `.win-toolbar`, `.os-sidebar`, `.os-pill`, `.app-icon`, and `.os-group` classes
- **Apps**: the homepage is the desktop, with draggable windows. About is a contact card, Projects a Finder window with sidebar filters, Blog a Notes-style list, posts a document window, Resume a Preview window, and 404 an alert dialog
- **Page transitions**: cross-document View Transitions crossfade between pages, keep the menu bar and dock in place, and morph the app window (`global.css`)

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