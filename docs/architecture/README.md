# Lightbrush Website Architecture Documentation

## Overview

This comprehensive architecture documentation provides detailed insights into the design, structure, and implementation of the Lightbrush website - an immersive 3D projection mapping experience built with React, Three.js, and modern web technologies.

## Architecture Documents

### 1. [System Architecture Overview](./01-system-architecture.md)
High-level system design showing the technology stack, component relationships, and architectural principles.

**Key Topics:**
- Technology stack visualization
- System boundaries and layers
- Architecture principles and patterns
- Performance-first design approach
- Security-focused implementation

### 2. [Component Architecture](./02-component-architecture.md)
Detailed React component hierarchy and interaction patterns.

**Key Topics:**
- React component hierarchy
- Provider pattern implementation
- 3D scene component structure
- Game system components
- Simulator components
- Component communication patterns

### 3. [Data Flow Architecture](./03-data-flow-diagram.md)
State management system using Zustand with comprehensive data flow patterns.

**Key Topics:**
- Zustand store architecture
- State subscription patterns
- Unidirectional data flow
- State persistence strategies
- Performance optimization through selective subscriptions

### 4. [3D Rendering Pipeline](./04-3d-rendering-pipeline.md)
Three.js integration and 3D graphics rendering architecture.

**Key Topics:**
- React Three Fiber integration
- Shader system architecture
- Projection mapping pipeline
- Sacred geometry rendering
- Performance optimization strategies
- Asset loading and management

### 5. [Performance Architecture](./05-performance-architecture.md)
Comprehensive performance optimization system and monitoring strategies.

**Key Topics:**
- Performance monitoring system
- Resource management and pooling
- Lazy loading and code splitting
- Adaptive quality systems
- Animation management
- Performance budgets and enforcement

### 6. [Security Architecture](./06-security-architecture.md)
Multi-layered security implementation protecting against common web vulnerabilities.

**Key Topics:**
- Content Security Policy (CSP)
- Security headers implementation
- Error boundary security
- Input validation and sanitization
- Authentication and authorization
- Data protection and PII handling

### 7. [Testing Architecture](./07-testing-architecture.md)
Comprehensive testing strategy covering unit, integration, and performance testing.

**Key Topics:**
- Vitest framework configuration
- Component testing strategies
- 3D component testing with mocks
- Store testing patterns
- Coverage requirements and reporting
- CI/CD test integration

### 8. [Deployment Architecture](./08-deployment-architecture.md)
Production deployment pipeline and infrastructure management.

**Key Topics:**
- Build system configuration
- CI/CD pipeline implementation
- Production environment setup
- PM2 process management
- Monitoring and observability
- Security and disaster recovery

## Technology Stack Summary

### Frontend Technologies
- **React 19.1.1** - Modern UI framework with latest features
- **TypeScript 5.8.3** - Type-safe JavaScript development
- **Vite 7.1.7** - Fast build tool and development server
- **Tailwind CSS 4.1.13** - Utility-first CSS framework

### 3D Graphics & Animation
- **Three.js 0.180.0** - WebGL 3D graphics library
- **React Three Fiber 9.3.0** - React renderer for Three.js
- **React Three Drei 10.7.6** - Useful helpers and abstractions
- **Framer Motion 12.23.22** - Production-ready motion library

### State Management & Data
- **Zustand 5.0.8** - Lightweight state management
- **Custom stores** - Game-specific state management
- **Local storage** - Client-side persistence

### Development & Quality Assurance
- **Vitest 3.2.4** - Fast unit test framework
- **Testing Library** - Simple and complete testing utilities
- **ESLint 9.36.0** - Code linting and formatting
- **Husky 9.1.7** - Git hooks for quality assurance

### Production & Deployment
- **Express 5.1.0** - Node.js web application framework
- **Helmet 8.1.0** - Security middleware
- **PM2** - Production process manager
- **Terser 5.44.0** - JavaScript minification

## Key Architectural Principles

### 1. Component-Based Architecture
- Modular React components with clear responsibilities
- Reusable UI components in dedicated directories
- 3D components separated from regular UI components
- Provider pattern for cross-cutting concerns

### 2. Performance-First Design
- Code splitting for optimal bundle sizes
- Resource pooling for 3D objects
- Lazy loading for heavy components
- Performance monitoring throughout the application

### 3. Type Safety
- Full TypeScript implementation
- Strict type checking enabled
- Interface definitions for all major components
- Generic components for maximum reusability

### 4. Security-Focused
- Content Security Policy implementation
- Secure headers via Helmet middleware
- Input validation and sanitization
- Error boundary protection with secure error handling

### 5. Scalable State Management
- Zustand for lightweight, scalable state
- Modular stores for different concerns
- Reactive state updates with subscriptions
- Optimized selectors for performance

## Development Workflow

### 1. Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests in watch mode
npm run test

# Type checking
npm run type-check

# Linting and formatting
npm run lint
npm run lint:fix
```

### 2. Testing
```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

### 3. Building for Production
```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Analyze bundle size
npm run build:analyze
```

### 4. Deployment
```bash
# Start production server with PM2
pm2 start ecosystem.config.js

# Monitor processes
pm2 status
pm2 logs

# Restart application
pm2 restart lightbrush-website
```

## Performance Targets

### Core Web Vitals
- **Largest Contentful Paint (LCP)**: < 2.5 seconds
- **First Input Delay (FID)**: < 100 milliseconds
- **Cumulative Layout Shift (CLS)**: < 0.1

### 3D Performance
- **Frame Rate**: 60 FPS target
- **Frame Time**: < 16.67ms
- **GPU Usage**: < 80%
- **Memory Usage**: < 500MB

### Bundle Performance
- **Total Bundle Size**: < 2MB
- **Initial Load**: < 500KB
- **Cache Hit Rate**: > 80%

## Security Standards

### Security Headers
- Content Security Policy (CSP)
- HTTP Strict Transport Security (HSTS)
- X-Frame-Options
- X-Content-Type-Options
- Referrer Policy

### Input Security
- Server-side validation
- XSS prevention
- SQL injection prevention
- CSRF protection

### Data Protection
- PII data masking
- Secure error handling
- Audit logging
- Access control

## Quality Assurance

### Test Coverage Requirements
- **Overall Coverage**: 80%
- **Critical Paths**: 90%
- **Security Functions**: 95%
- **UI Components**: 80%

### Code Quality Standards
- TypeScript strict mode
- ESLint configuration
- Prettier formatting
- Husky pre-commit hooks

## Getting Started

1. **Review System Architecture**: Start with [System Architecture Overview](./01-system-architecture.md)
2. **Understand Components**: Read [Component Architecture](./02-component-architecture.md)
3. **Learn Data Flow**: Study [Data Flow Architecture](./03-data-flow-diagram.md)
4. **Explore 3D Pipeline**: Dive into [3D Rendering Pipeline](./04-3d-rendering-pipeline.md)
5. **Performance Optimization**: Review [Performance Architecture](./05-performance-architecture.md)
6. **Security Implementation**: Understand [Security Architecture](./06-security-architecture.md)
7. **Testing Strategy**: Learn [Testing Architecture](./07-testing-architecture.md)
8. **Deployment Process**: Study [Deployment Architecture](./08-deployment-architecture.md)

## Contributing

When contributing to this project, please:

1. **Follow Architecture Principles**: Adhere to the established architectural patterns
2. **Maintain Type Safety**: Ensure all new code is properly typed
3. **Write Tests**: Maintain test coverage for new functionality
4. **Document Changes**: Update architecture documentation for significant changes
5. **Performance Conscious**: Consider performance implications of changes
6. **Security Aware**: Follow security best practices

## Support and Maintenance

For questions about the architecture or implementation:

1. **Review Documentation**: Check relevant architecture documents
2. **Examine Code**: Look at similar implementations in the codebase
3. **Run Tests**: Ensure your understanding with test execution
4. **Check Monitoring**: Review performance and error monitoring

This architecture documentation is a living document that evolves with the project. Regular updates ensure it remains accurate and useful for development, maintenance, and scaling decisions.