# Lightbrush - 3D RPG Website

A cutting-edge React application that seamlessly integrates a 3D RPG game experience with modern web technologies. Built with TypeScript, Three.js, and React Three Fiber for immersive 3D graphics and gameplay.

## 🚀 Features

- **3D RPG Game Engine**: Full-featured RPG with Three.js-powered 3D graphics
- **Projection Simulator**: Advanced light projection mapping simulator with real-time 3D visualization
- **Interactive Portfolio**: Dynamic portfolio showcase with 3D equipment visualization and timeline
- **Modern React Stack**: Built with React 19.1.1, TypeScript, and Vite for optimal performance
- **Immersive Graphics**: Powered by Three.js and React Three Fiber for stunning 3D visuals
- **Responsive Design**: Tailwind CSS with dark theme and custom game-themed styling
- **State Management**: Zustand for efficient and scalable state management
- **Smooth Animations**: Framer Motion for fluid UI transitions and interactions
- **Optimized Performance**: Custom Vite configuration with code splitting and optimization

## 🛠 Tech Stack

### Core Framework
- **React 19.1.1** with TypeScript
- **Vite 7.1.7** as build tool and dev server
- **React Router DOM** for navigation

### 3D Graphics & Game Engine
- **Three.js** - 3D graphics library
- **React Three Fiber** - React renderer for Three.js
- **React Three Drei** - Useful helpers for React Three Fiber

### Styling & UI
- **Tailwind CSS 4.1.13** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Custom game theme** with dark mode support

### State Management
- **Zustand** - Lightweight state management

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI components (buttons, modals, etc.)
│   ├── 3d/             # Three.js/3D specific components
│   ├── layout/         # Layout components (header, footer, etc.)
│   ├── game/           # Game-specific components
│   ├── portfolio/      # Portfolio-specific components
│   ├── simulator/      # Projection simulator components
│   ├── providers/      # React context providers
│   └── optimized/      # Performance-optimized components
├── game/               # Game engine and logic
│   ├── engine/         # Core game engine systems
│   ├── entities/       # Game entities (player, NPCs, items)
│   ├── components/     # Game component systems
│   └── hooks/          # Game-specific hooks
├── pages/              # Route components
│   ├── home/           # Landing page
│   ├── game/           # Game interface
│   ├── portfolio/      # Portfolio showcase page
│   ├── simulator/      # Projection simulator page
│   └── about/          # About page
├── assets/             # Static assets
│   ├── models/         # 3D models (.glb, .gltf)
│   ├── textures/       # Texture files
│   ├── images/         # Images and sprites
│   └── audio/          # Sound effects and music
├── shaders/            # GLSL shader files
├── services/           # API and external service integrations
├── utils/              # Utility functions and helpers
├── hooks/              # Custom React hooks
├── store/              # Zustand store definitions
├── data/               # Static data and configuration
└── test/               # Test utilities and setup
```

## 🎮 Game Features

The integrated 3D RPG includes:
- **Character System**: Customizable player characters with stats and progression
- **3D World**: Fully explorable 3D environments with dynamic lighting
- **Quest System**: Engaging storylines and objectives
- **Inventory Management**: Items, equipment, and crafting systems
- **Combat System**: Real-time combat with magical abilities
- **Interactive NPCs**: Dialogue system and character interactions

## 🎨 Design System

### Color Palette
- **Primary Colors**: Blue gradient (`#0ea5e9` to `#0284c7`)
- **Dark Theme**: Custom dark color scheme (`#0f172a` to `#1e293b`)
- **Accent Colors**: Carefully chosen complementary colors for UI elements

### Typography
- **Headers**: Orbitron (futuristic, game-themed font)
- **Body Text**: Inter (clean, readable sans-serif)

### Animations
- **Float Animation**: Subtle floating effect for game elements
- **Glow Effects**: Dynamic glowing for interactive elements
- **Smooth Transitions**: Framer Motion powered animations

## 🚀 Getting Started

### Prerequisites
- Node.js (v20.19+ or v22.12+ - required for Vite 7)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd lightbrush-website
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173` (development server)

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint with auto-fix
- `npm run test` - Run Vitest tests
- `npm run test:ui` - Run Vitest with UI
- `npm run test:coverage` - Run tests with coverage report

## 🏗 Development

### Project Configuration

#### TypeScript Configuration
- Configured with Three.js types
- WebGL library support
- Strict type checking enabled

#### Vite Configuration
- Path aliases for clean imports (`@components`, `@game`, etc.)
- Optimized dependencies pre-bundling
- Code splitting for optimal loading
- Terser minification with console removal in production

#### Tailwind CSS 4.1.13
- Dark mode support with class-based switching
- Custom color palette and design tokens
- Game-specific component classes
- Custom animations and utilities
- PostCSS integration with autoprefixer

### Adding New Features

1. **3D Components**: Add to `src/components/3d/`
2. **Game Logic**: Implement in appropriate `src/game/` subdirectories
3. **UI Components**: Create in `src/components/ui/`
4. **Pages**: Add new routes in `src/pages/`
5. **State**: Define stores in `src/store/`

## 🎯 Performance Optimization

- **Code Splitting**: Automatic chunking by feature area
- **Asset Optimization**: Optimized 3D model loading
- **Bundle Analysis**: Separated vendor, UI, and game logic bundles
- **Tree Shaking**: Unused code elimination
- **Lazy Loading**: Route-based code splitting

## 🌟 Future Enhancements

- **Multiplayer Support**: WebSocket integration for multiplayer gameplay
- **Advanced Graphics**: Post-processing effects and shaders
- **Mobile Optimization**: Touch controls and responsive 3D rendering
- **Content Management**: Admin interface for game content
- **Analytics**: Player behavior and performance tracking

## 📄 License

This project is currently unlicensed. Please contact the project maintainers for licensing information.

## 🤝 Contributing

Contributions are welcome! Please read the contributing guidelines before submitting PRs.

## 📞 Support

For support and questions, please open an issue in the GitHub repository.

---

Built with ❤️ using React, Three.js, and modern web technologies.
