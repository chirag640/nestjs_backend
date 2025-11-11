# NextGen - Project Generator Platform

A full-stack code-generation platform that generates runnable NestJS skeletons based on user configuration through a NextJS 15 (App Router) wizard UI.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-16.0.1-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)

## 🚀 Features

- **Interactive Wizard UI** - Multi-step form with live validation
- **Dark Theme** - Modern, sleek UI matching the NextGen design system
- **Real-time Validation** - Zod schemas with React Hook Form
- **Code Generation** - Nunjucks templates with Prettier formatting
- **ZIP Download** - Instant download of generated project
- **CI/CD Ready** - GitHub Actions workflow included

## 🛠️ Technology Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Forms**: React Hook Form + Zod validation
- **Backend**: Next.js API Routes
- **Templates**: Nunjucks
- **Formatting**: Prettier
- **Packaging**: JSZip
- **Testing**: Vitest
- **CI/CD**: GitHub Actions

## 📦 Installation

```bash
npm install
```

## 🚦 Getting Started

1. **Start the development server:**

```bash
npm run dev
```

2. **Open your browser:**

Navigate to [http://localhost:3000](http://localhost:3000)

3. **Follow the wizard:**
   - **Step 1**: Configure project details (name, author, license, etc.)
   - **Step 2**: Configure database settings (ORM, provider, connection)

4. **Generate & Download:**

Click "Generate Project" to download your NestJS skeleton as a ZIP file.

## 🧪 Testing

```bash
# Run all tests
npm test

# Type checking
npm run typecheck

# Linting
npm run lint
```

## 📝 Scripts

| Script              | Description               |
| ------------------- | ------------------------- |
| `npm run dev`       | Start development server  |
| `npm run build`     | Build for production      |
| `npm start`         | Start production server   |
| `npm run lint`      | Run ESLint                |
| `npm run format`    | Format code with Prettier |
| `npm test`          | Run Vitest tests          |
| `npm run typecheck` | TypeScript type checking  |

## 🚀 Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 📄 License

MIT License

---

**Built with ❤️ using Next.js 15 and TypeScript**
