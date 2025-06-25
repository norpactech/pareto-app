# 🚀 Pareto UI Starter

> **Production-ready Angular starter with AWS Cognito authentication, Material Design theming, and dark mode support**

A modern Angular 19 application template that gets you from zero to production in minutes. Built with enterprise-grade authentication, responsive design, and developer experience in mind.

## 🎯 Why Choose This Starter?

✅ **Skip weeks of setup** - Authentication, theming, and user management ready out of the box  
✅ **Production-ready** - Built with enterprise patterns and best practices  
✅ **AWS Cognito integrated** - Secure, scalable authentication without the complexity  
✅ **Modern Angular** - Latest Angular 19 with standalone components and inject() pattern  
✅ **Beautiful UI** - Custom Material Design theme with perfect dark/light mode support  

## 🔗 Resources

- **📦 [GitHub Repository](https://github.com/your-username/pareto-ui-starter)** - Source code and documentation
- **🐛 [Report Issues](https://github.com/your-username/pareto-ui-starter/issues)** - Bug reports and feature requests
- **� [Discussions](https://github.com/your-username/pareto-ui-starter/discussions)** - Questions and community support

## ✨ Features

### 🔐 Complete Authentication System
- **AWS Cognito Integration** - Secure cloud-based authentication
- **Sign Up/Sign In** - Email-based registration with verification
- **Password Recovery** - Forgot password and reset functionality
- **Email Verification** - Automatic email verification flow
- **Session Management** - Automatic token refresh and expiration handling
- **Remember Me** - Persistent login sessions

### 👥 User Management
- **User Profiles** - Complete profile creation and editing
- **Profile Validation** - Required profile completion flow
- **User CRUD Operations** - Full user management interface
- **Profile Guards** - Route protection based on profile completion

### 🎨 Modern UI/UX
- **Material Design** - Custom green theme with consistent styling
- **Light/Dark Mode** - System preference detection with manual toggle
- **Responsive Design** - Mobile-first approach with hamburger navigation
- **Accessibility** - ARIA labels, keyboard navigation, screen reader support
- **Loading States** - Comprehensive loading indicators and error handling

### 🛡️ Security & Performance
- **Route Guards** - Authentication and profile completion protection
- **HTTP Interceptors** - Automatic token attachment and error handling
- **Lazy Loading** - Optimized module loading for better performance
- **Type Safety** - Full TypeScript implementation with strict mode

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18.19.0 or higher
- **npm** 9.0.0 or higher
- **Angular CLI** 19.2.15 or higher

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd pareto-ui-starter

# Install dependencies
npm install

# Set up environment variables (copy and configure)
cp .env.example .env.local
```

## ⚡ Quick Start (5 Minutes)

```bash
# 1. Clone and install
git clone https://github.com/your-username/pareto-ui-starter.git
cd pareto-ui-starter && npm install

# 2. Configure your AWS Cognito settings
# Edit the local environment file with your Cognito settings
# See environment configuration section below for details

# 3. Start the development server
npm start
```

🎉 **That's it!** Open `http://localhost:4200` and start building.

### Environment Configuration

Configure your AWS Cognito settings in the environment files:

```typescript
// src/environments/environment.local.ts
export const environment = {
  production: false,
  cognito: {
    region: 'us-east-1',
    userPoolId: 'your-user-pool-id',
    userPoolClientId: 'your-client-id'
  },
  apiUrl: 'http://localhost:3000/api'
};
```

## 🏃‍♂️ Development

### Development Server

```bash
# Local development (default)
npm start
# or
npm run start:local

# Development environment
npm run start:dev

# Production mode testing
npm run start:prod
```

Navigate to `http://localhost:4200/`. The application will automatically reload when you change source files.

### Building

```bash
# Production build
npm run build

# Environment-specific builds
npm run build:local
npm run build:dev
npm run build:prod
```

Build artifacts will be stored in the `dist/` directory.

## 🧪 Testing

### Running Tests

The application includes comprehensive testing infrastructure:

```bash
# Run unit tests
npm test

# Run specific integration tests
npm run test:integration

# Run with coverage
npm run test:coverage
```

### VS Code Integration

Several VS Code tasks are available via Command Palette (`Ctrl+Shift+P`):

- **Run Health Check Test** - Basic API connectivity test
- **Run UserService Integration Test** - Comprehensive service testing
- **Run Simple Test Runner** - Basic functionality validation

Access via: `Terminal` → `Run Task...` or `Ctrl+Shift+P` → `Tasks: Run Task`

## 📱 Application Flow

### User Journey

1. **Unauthenticated Users**
   - See home page without navigation menu
   - Can access sign-in/sign-up forms (always in light theme)
   - Can view help page

2. **New Users (After Sign-up)**
   - Email verification required
   - Redirected to profile creation
   - Hamburger menu appears after profile completion

3. **Authenticated Users with Profile**
   - Full access to all features
   - Hamburger menu open by default
   - Can manage profile, access user management
   - Theme toggle available

### Navigation Structure

```
/ (Home)
├── /auth/
│   ├── /signin - Sign in form
│   ├── /signup - Sign up form
│   ├── /forgot-password - Password recovery
│   ├── /reset-password - Password reset
│   └── /verify-email - Email verification
├── /users/
│   ├── /profile - User profile management
│   └── / - User list (authenticated users)
├── /help - Help and support
└── /dashboard - User dashboard (future feature)
```

## 🎨 Theming

### Theme System
- **Auto-detection** - Respects system dark/light preference
- **Manual toggle** - Theme toggle button for authenticated users
- **Persistent** - Theme preference saved to localStorage
- **Comprehensive** - Covers all components including Material Dialog

### Auth Forms
Authentication forms always use light theme for optimal contrast and accessibility, regardless of the global theme setting.

## 🏗️ Architecture

### Project Structure

```
src/
├── app/
│   ├── auth/              # Authentication module
│   │   ├── components/    # Auth UI components
│   │   ├── guards/        # Route guards
│   │   ├── interceptors/  # HTTP interceptors
│   │   ├── providers/     # Auth providers (Cognito, Firebase)
│   │   └── services/      # Auth services
│   ├── shared/            # Shared utilities
│   │   ├── models/        # Data models and DTOs
│   │   ├── services/      # Shared services
│   │   └── utils/         # Utility functions
│   ├── user/              # User management
│   └── themes/            # Global theming
├── environments/          # Environment configurations
└── tests/                 # Integration tests
```

### Key Technologies

- **Angular 19** - Latest Angular framework
- **Angular Material** - UI component library
- **AWS Cognito** - Authentication service
- **RxJS** - Reactive programming
- **TypeScript** - Type-safe development
- **SCSS** - Enhanced CSS with variables and mixins

## 🔧 Configuration

### Environment Files

| File | Purpose | Usage |
|------|---------|-------|
| `environment.local.ts` | Local development | `npm start` |
| `environment.dev.ts` | Development server | `npm run start:dev` |
| `environment.prod.ts` | Production | `npm run start:prod` |

### VS Code Settings

The project includes optimized VS Code configuration:
- Debugging configurations
- Task runners for testing
- ESLint integration
- Angular Language Service

## 🚀 Deployment

### Build Commands

```bash
# Development deployment
npm run deploy:dev

# Production deployment  
npm run deploy:prod
```

### Environment Information

```bash
# View available environments
npm run env:info
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🚀 Deployment

Deploy your app to popular hosting platforms:

### Netlify
1. Connect your GitHub repository to Netlify
2. Use the included `netlify.toml` configuration
3. Deploy automatically on every push to main

### Vercel  
1. Import your GitHub repository to Vercel
2. Use the included `vercel.json` configuration
3. Deploy automatically with zero configuration

### Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build:prod
firebase deploy
```

### GitHub Pages
Push to `main` branch - automatic deployment via GitHub Actions is configured!

## 🌟 Community & Support

### Getting Help
- **📚 README.md** - This file contains complete setup and usage instructions
- **🐛 [Issues](https://github.com/your-username/pareto-ui-starter/issues)** - Bug reports and feature requests  
- **💬 [Discussions](https://github.com/your-username/pareto-ui-starter/discussions)** - Questions and community chat

### Show Your Support
If this starter saves you time, please consider:
- ⭐ **Star this repository** on GitHub
- 🐦 **Share it** on social media
- 📝 **Write a blog post** about your experience
- 🤝 **Contribute** to the project

### What's Coming Next
- [ ] **Stripe Integration** - Complete payment processing
- [ ] **Multi-tenancy Support** - SaaS-ready architecture  
- [ ] **Admin Dashboard** - User management interface
- [ ] **API Client** - REST client with caching
- [ ] **PWA Support** - Offline functionality
- [ ] **Docker Support** - Containerized deployment
- [ ] **Storybook Integration** - Component library

*Suggestions welcome in GitHub Issues!*

##  License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👏 Acknowledgments

- Built with [Angular CLI](https://angular.dev/tools/cli)
- UI components from [Angular Material](https://material.angular.io/)
- Authentication powered by [AWS Cognito](https://aws.amazon.com/cognito/)

---

**Copyright (c) 2025 Northern Pacific Technologies, LLC**

*A modern, scalable Angular application starter for enterprise-grade projects.*


