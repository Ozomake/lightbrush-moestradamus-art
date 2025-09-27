# Deployment Architecture

## Deployment Pipeline Overview

```mermaid
graph TB
    subgraph "Development Environment"
        DEV_CODE[Source Code]
        DEV_BUILD[Development Build]
        DEV_SERVER[Vite Dev Server]
        DEV_TOOLS[Development Tools]
    end

    subgraph "Build Pipeline"
        BUILD_TRIGGER[Build Trigger]
        INSTALL[Install Dependencies]
        LINT[Lint & Format]
        TEST[Run Tests]
        TYPE_CHECK[Type Check]
        BUILD_PROD[Production Build]
        BUNDLE_ANALYSIS[Bundle Analysis]
        ASSET_OPT[Asset Optimization]
    end

    subgraph "Quality Gates"
        COVERAGE_CHECK[Coverage Check]
        PERFORMANCE_CHECK[Performance Check]
        SECURITY_SCAN[Security Scan]
        BUNDLE_SIZE[Bundle Size Check]
        DEPENDENCY_AUDIT[Dependency Audit]
    end

    subgraph "Deployment Stages"
        STAGING[Staging Environment]
        SMOKE_TESTS[Smoke Tests]
        INTEGRATION_TEST[Integration Tests]
        PRODUCTION[Production Environment]
        HEALTH_CHECK[Health Checks]
    end

    subgraph "Infrastructure"
        EXPRESS_SERVER[Express Server]
        PM2[PM2 Process Manager]
        STATIC_FILES[Static File Serving]
        MONITORING[Monitoring Services]
        LOGS[Log Management]
    end

    DEV_CODE --> BUILD_TRIGGER
    DEV_BUILD --> INSTALL
    DEV_SERVER --> LINT
    DEV_TOOLS --> TEST

    BUILD_TRIGGER --> INSTALL
    INSTALL --> LINT
    LINT --> TEST
    TEST --> TYPE_CHECK
    TYPE_CHECK --> BUILD_PROD
    BUILD_PROD --> BUNDLE_ANALYSIS
    BUNDLE_ANALYSIS --> ASSET_OPT

    ASSET_OPT --> COVERAGE_CHECK
    COVERAGE_CHECK --> PERFORMANCE_CHECK
    PERFORMANCE_CHECK --> SECURITY_SCAN
    SECURITY_SCAN --> BUNDLE_SIZE
    BUNDLE_SIZE --> DEPENDENCY_AUDIT

    DEPENDENCY_AUDIT --> STAGING
    STAGING --> SMOKE_TESTS
    SMOKE_TESTS --> INTEGRATION_TEST
    INTEGRATION_TEST --> PRODUCTION
    PRODUCTION --> HEALTH_CHECK

    HEALTH_CHECK --> EXPRESS_SERVER
    EXPRESS_SERVER --> PM2
    PM2 --> STATIC_FILES
    STATIC_FILES --> MONITORING
    MONITORING --> LOGS

    style DEV_CODE fill:#e1f5fe
    style BUILD_PROD fill:#f3e5f5
    style COVERAGE_CHECK fill:#e8f5e8
    style STAGING fill:#fff3e0
    style EXPRESS_SERVER fill:#fce4ec
```

## Build System Architecture

### 1. Vite Build Configuration
```mermaid
graph TD
    subgraph "Vite Configuration"
        CONFIG[vite.config.ts]
        PLUGINS[Vite Plugins]
        ALIASES[Path Aliases]
        OPTIMIZATION[Build Optimization]
    end

    subgraph "Build Plugins"
        REACT[React Plugin]
        TS[TypeScript Plugin]
        BUNDLE_MONITOR[Bundle Monitor Plugin]
        PERFORMANCE[Performance Plugin]
    end

    subgraph "Bundle Optimization"
        CODE_SPLITTING[Code Splitting]
        TREE_SHAKING[Tree Shaking]
        MINIFICATION[Minification]
        COMPRESSION[Asset Compression]
    end

    subgraph "Output Structure"
        ASSETS[Asset Directory]
        CHUNKS[JavaScript Chunks]
        CSS[Stylesheet Files]
        STATIC[Static Assets]
    end

    CONFIG --> REACT
    PLUGINS --> TS
    ALIASES --> BUNDLE_MONITOR
    OPTIMIZATION --> PERFORMANCE

    REACT --> CODE_SPLITTING
    TS --> TREE_SHAKING
    BUNDLE_MONITOR --> MINIFICATION
    PERFORMANCE --> COMPRESSION

    CODE_SPLITTING --> ASSETS
    TREE_SHAKING --> CHUNKS
    MINIFICATION --> CSS
    COMPRESSION --> STATIC
```

### 2. Build Output Structure
```
dist/
├── assets/
│   ├── index-[hash].js           # Main application bundle
│   ├── vendor-react-[hash].js    # React vendor bundle
│   ├── three-core-[hash].js      # Three.js core bundle
│   ├── three-fiber-[hash].js     # React Three Fiber bundle
│   ├── ui-animation-[hash].js    # Animation libraries bundle
│   ├── state-[hash].js          # State management bundle
│   ├── routing-[hash].js        # Router bundle
│   ├── icons-[hash].js          # Icon bundle
│   └── styles-[hash].css        # Compiled stylesheets
├── index.html                   # Main HTML entry point
└── favicon.ico                  # Application favicon
```

## CI/CD Pipeline Architecture

### 1. GitHub Actions Workflow
```mermaid
graph LR
    subgraph "Trigger Events"
        PUSH[Push to Main]
        PR[Pull Request]
        RELEASE[Release Tag]
        SCHEDULE[Scheduled Build]
    end

    subgraph "Build Matrix"
        NODE_18[Node.js 18]
        NODE_20[Node.js 20]
        UBUNTU[Ubuntu Latest]
        PARALLEL[Parallel Jobs]
    end

    subgraph "Pipeline Steps"
        CHECKOUT[Checkout Code]
        SETUP[Setup Environment]
        CACHE[Cache Dependencies]
        INSTALL_DEPS[Install Dependencies]
        SECURITY[Security Audit]
        LINT_FORMAT[Lint & Format]
        TYPE_SAFETY[Type Checking]
        UNIT_TESTS[Unit Tests]
        BUILD_APP[Build Application]
        BUNDLE_CHECK[Bundle Analysis]
    end

    subgraph "Deployment Steps"
        ARTIFACT[Upload Artifacts]
        DEPLOY_STAGING[Deploy to Staging]
        SMOKE_TEST[Smoke Tests]
        DEPLOY_PROD[Deploy to Production]
        ROLLBACK[Rollback Plan]
    end

    PUSH --> NODE_18
    PR --> NODE_20
    RELEASE --> UBUNTU
    SCHEDULE --> PARALLEL

    NODE_18 --> CHECKOUT
    NODE_20 --> SETUP
    UBUNTU --> CACHE
    PARALLEL --> INSTALL_DEPS

    CHECKOUT --> SECURITY
    SETUP --> LINT_FORMAT
    CACHE --> TYPE_SAFETY
    INSTALL_DEPS --> UNIT_TESTS
    SECURITY --> BUILD_APP
    LINT_FORMAT --> BUNDLE_CHECK

    TYPE_SAFETY --> ARTIFACT
    UNIT_TESTS --> DEPLOY_STAGING
    BUILD_APP --> SMOKE_TEST
    BUNDLE_CHECK --> DEPLOY_PROD
    ARTIFACT --> ROLLBACK
```

### 2. GitHub Actions Configuration
```yaml
name: Build and Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  release:
    types: [published]

jobs:
  build:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20]

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Security audit
        run: npm audit --audit-level=moderate

      - name: Lint and format
        run: |
          npm run lint
          npm run lint:fix

      - name: Type checking
        run: npx tsc --noEmit

      - name: Run tests with coverage
        run: npm run test:coverage

      - name: Build application
        run: npm run build

      - name: Bundle analysis
        run: npm run build:analyze

      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: dist-${{ matrix.node-version }}
          path: dist/

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - name: Download build artifacts
        uses: actions/download-artifact@v4
        with:
          name: dist-20

      - name: Deploy to staging
        run: |
          # Deployment commands
          echo "Deploying to staging environment"

      - name: Run smoke tests
        run: |
          # Smoke test commands
          echo "Running smoke tests"

      - name: Deploy to production
        if: success()
        run: |
          # Production deployment commands
          echo "Deploying to production"
```

## Production Environment

### 1. Express Server Configuration
```mermaid
graph TD
    subgraph "Express Application"
        APP[Express App]
        MIDDLEWARE[Security Middleware]
        STATIC[Static File Serving]
        ERROR[Error Handling]
    end

    subgraph "Security Layer"
        HELMET[Helmet.js]
        CSP[Content Security Policy]
        CORS[CORS Configuration]
        RATE_LIMIT[Rate Limiting]
        HSTS[HSTS Headers]
    end

    subgraph "Performance Layer"
        COMPRESSION[Gzip Compression]
        CACHING[Cache Headers]
        ETAG[ETag Generation]
        STATIC_OPT[Static Optimization]
    end

    subgraph "Monitoring Layer"
        ACCESS_LOG[Access Logging]
        ERROR_LOG[Error Logging]
        METRICS[Performance Metrics]
        HEALTH[Health Endpoints]
    end

    APP --> HELMET
    MIDDLEWARE --> CSP
    STATIC --> CORS
    ERROR --> RATE_LIMIT

    HELMET --> COMPRESSION
    CSP --> CACHING
    CORS --> ETAG
    RATE_LIMIT --> STATIC_OPT

    COMPRESSION --> ACCESS_LOG
    CACHING --> ERROR_LOG
    ETAG --> METRICS
    STATIC_OPT --> HEALTH
```

### 2. Express Server Implementation
```javascript
// Production Express Server
const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8175;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "blob:", "https:"],
      connectSrc: ["'self'", "wss:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      frameSrc: ["'none'"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Performance middleware
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});
app.use(limiter);

// Static file serving with caching
app.use(express.static(path.join(__dirname, 'dist'), {
  maxAge: '1y',
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.set('Cache-Control', 'no-cache');
    }
  }
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## Process Management with PM2

### 1. PM2 Configuration
```mermaid
graph TD
    subgraph "PM2 Ecosystem"
        CONFIG[ecosystem.config.js]
        PROCESS[Process Configuration]
        CLUSTER[Cluster Mode]
        MONITORING[Process Monitoring]
    end

    subgraph "Process Management"
        START[Process Start]
        RESTART[Auto Restart]
        SCALE[Scaling]
        LOAD_BALANCE[Load Balancing]
    end

    subgraph "Monitoring Features"
        CPU[CPU Monitoring]
        MEMORY[Memory Monitoring]
        LOGS[Log Management]
        ALERTS[Alert System]
    end

    subgraph "Production Features"
        GRACEFUL[Graceful Shutdown]
        ZERO_DOWNTIME[Zero Downtime Reload]
        HEALTH_MONITOR[Health Monitoring]
        CRASH_RECOVERY[Crash Recovery]
    end

    CONFIG --> START
    PROCESS --> RESTART
    CLUSTER --> SCALE
    MONITORING --> LOAD_BALANCE

    START --> CPU
    RESTART --> MEMORY
    SCALE --> LOGS
    LOAD_BALANCE --> ALERTS

    CPU --> GRACEFUL
    MEMORY --> ZERO_DOWNTIME
    LOGS --> HEALTH_MONITOR
    ALERTS --> CRASH_RECOVERY
```

### 2. PM2 Ecosystem Configuration
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'lightbrush-website',
    script: 'server.js',
    cwd: '/home/server/lightbrush-website',
    instances: 'max', // Use all CPU cores
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 8175
    },
    env_staging: {
      NODE_ENV: 'staging',
      PORT: 8176
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    min_uptime: '10s',
    max_restarts: 10,
    kill_timeout: 5000,
    listen_timeout: 8000,
    shutdown_with_message: true
  }]
};
```

## Deployment Strategies

### 1. Blue-Green Deployment
```mermaid
graph TB
    subgraph "Blue Environment (Current)"
        BLUE_LB[Load Balancer]
        BLUE_SERVER[Production Server]
        BLUE_HEALTH[Health Check]
        BLUE_TRAFFIC[Live Traffic]
    end

    subgraph "Green Environment (New)"
        GREEN_SERVER[Staging Server]
        GREEN_DEPLOY[New Deployment]
        GREEN_TEST[Integration Tests]
        GREEN_READY[Ready State]
    end

    subgraph "Switch Process"
        TRAFFIC_SWITCH[Traffic Switch]
        HEALTH_VERIFY[Health Verification]
        ROLLBACK_PLAN[Rollback Ready]
        COMPLETE[Deployment Complete]
    end

    BLUE_LB --> BLUE_SERVER
    BLUE_SERVER --> BLUE_HEALTH
    BLUE_HEALTH --> BLUE_TRAFFIC

    GREEN_DEPLOY --> GREEN_SERVER
    GREEN_SERVER --> GREEN_TEST
    GREEN_TEST --> GREEN_READY

    GREEN_READY --> TRAFFIC_SWITCH
    BLUE_TRAFFIC --> HEALTH_VERIFY
    TRAFFIC_SWITCH --> ROLLBACK_PLAN
    HEALTH_VERIFY --> COMPLETE
```

### 2. Rolling Deployment
```mermaid
sequenceDiagram
    participant LB as Load Balancer
    participant S1 as Server 1
    participant S2 as Server 2
    participant S3 as Server 3
    participant Deploy as Deployment System

    Deploy->>S1: Stop accepting new requests
    Deploy->>S1: Wait for active requests to complete
    Deploy->>S1: Deploy new version
    Deploy->>S1: Health check
    Deploy->>LB: Route traffic to S1

    Deploy->>S2: Stop accepting new requests
    Deploy->>S2: Wait for active requests to complete
    Deploy->>S2: Deploy new version
    Deploy->>S2: Health check
    Deploy->>LB: Route traffic to S2

    Deploy->>S3: Stop accepting new requests
    Deploy->>S3: Wait for active requests to complete
    Deploy->>S3: Deploy new version
    Deploy->>S3: Health check
    Deploy->>LB: Route traffic to S3

    Deploy->>Deploy: Deployment Complete
```

## Monitoring and Observability

### 1. Production Monitoring
```mermaid
graph TD
    subgraph "Application Metrics"
        RESPONSE_TIME[Response Time]
        ERROR_RATE[Error Rate]
        THROUGHPUT[Throughput]
        AVAILABILITY[Availability]
    end

    subgraph "Infrastructure Metrics"
        CPU_USAGE[CPU Usage]
        MEMORY_USAGE[Memory Usage]
        DISK_USAGE[Disk Usage]
        NETWORK[Network I/O]
    end

    subgraph "Business Metrics"
        USER_ENGAGEMENT[User Engagement]
        CONVERSION[Conversion Rate]
        PERFORMANCE_BUDGET[Performance Budget]
        ERROR_TRACKING[Error Tracking]
    end

    subgraph "Alerting System"
        THRESHOLD[Threshold Monitoring]
        ESCALATION[Alert Escalation]
        NOTIFICATION[Notifications]
        INCIDENT[Incident Management]
    end

    RESPONSE_TIME --> CPU_USAGE
    ERROR_RATE --> MEMORY_USAGE
    THROUGHPUT --> DISK_USAGE
    AVAILABILITY --> NETWORK

    CPU_USAGE --> USER_ENGAGEMENT
    MEMORY_USAGE --> CONVERSION
    DISK_USAGE --> PERFORMANCE_BUDGET
    NETWORK --> ERROR_TRACKING

    USER_ENGAGEMENT --> THRESHOLD
    CONVERSION --> ESCALATION
    PERFORMANCE_BUDGET --> NOTIFICATION
    ERROR_TRACKING --> INCIDENT
```

### 2. Health Check Implementation
```javascript
// Health Check Endpoint
app.get('/health', (req, res) => {
  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    loadavg: os.loadavg(),
    version: process.env.npm_package_version || 'unknown',
    environment: process.env.NODE_ENV || 'development',
    checks: {
      server: 'healthy',
      memory: process.memoryUsage().heapUsed < 500 * 1024 * 1024 ? 'healthy' : 'warning',
      disk: 'healthy', // Add disk space check
      database: 'healthy' // Add database connectivity check if applicable
    }
  };

  const isHealthy = Object.values(healthCheck.checks)
    .every(status => status === 'healthy');

  res.status(isHealthy ? 200 : 503).json(healthCheck);
});

// Readiness check for Kubernetes/Docker
app.get('/ready', (req, res) => {
  // Check if application is ready to serve traffic
  const isReady = true; // Add your readiness logic
  res.status(isReady ? 200 : 503).json({ ready: isReady });
});
```

## Security in Production

### 1. Production Security Measures
- **HTTPS Enforcement**: SSL/TLS certificates with automatic renewal
- **Security Headers**: Comprehensive security headers via Helmet.js
- **Rate Limiting**: Request rate limiting to prevent abuse
- **Input Validation**: Server-side input validation and sanitization
- **Error Handling**: Secure error responses that don't leak sensitive information

### 2. Infrastructure Security
- **Firewall Configuration**: Proper network firewall rules
- **Access Control**: Limited SSH access with key-based authentication
- **Regular Updates**: Automated security updates for system packages
- **Backup Strategy**: Regular encrypted backups with tested restore procedures

## Performance Optimization

### 1. Production Optimizations
- **Asset Compression**: Gzip compression for all static assets
- **CDN Integration**: Content delivery network for global performance
- **Cache Strategy**: Aggressive caching with proper cache invalidation
- **Bundle Optimization**: Code splitting and tree shaking for minimal bundle sizes

### 2. Monitoring and Alerts
- **Performance Budgets**: Automated alerts for performance regressions
- **Error Tracking**: Real-time error monitoring and alerting
- **Uptime Monitoring**: Continuous availability monitoring
- **Resource Utilization**: CPU, memory, and disk usage monitoring

## Disaster Recovery

### 1. Backup Strategy
- **Automated Backups**: Daily automated backups of critical data
- **Multiple Locations**: Geographically distributed backup storage
- **Tested Restoration**: Regular restoration testing procedures
- **Version Control**: Source code backup through Git repositories

### 2. Incident Response
- **Monitoring Alerts**: Automated alerting for critical issues
- **Escalation Procedures**: Clear escalation paths for different severity levels
- **Communication Plan**: Status page and communication protocols
- **Post-Mortem Process**: Learning from incidents to prevent recurrence