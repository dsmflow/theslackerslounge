# The Slackers Lounge - Technical Stack

## Core Technologies

### Frontend
- **Framework**: React v18.3.1
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Routing**: React Router DOM v6.22.3

### AI & Interactive Features
- Monaco Editor Integration
- Anthropic AI SDK
- OpenAI SDK v4.29.0
- Deepgram SDK v3.9.0
- Firebase v10.14.1

### Development Tools
- ESLint v9.9.1
- PostCSS
- TypeScript
- Vite
- pnpm (package manager)

## Type Safety Configuration

### TypeScript Settings
```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2022",
    "lib": ["ES2023"],
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### Key Type Safety Features
- Strict mode enabled
- Modern ECMAScript target (ES2022)
- ES2023 library support
- Unused code detection
- Switch statement fallthrough prevention
- Strict module detection

## Project Structure

```
/
├── arcade/          # Game implementations (Snake, AI Pong)
├── src/            # Main application source code
├── public/         # Static assets
├── dist/           # Build output
└── config files    # Various configuration files
```

### Configuration Files
- `tsconfig.json` - Base TypeScript configuration
- `tsconfig.app.json` - Application-specific TS config
- `tsconfig.node.json` - Node-specific TS config
- `vite.config.ts` - Vite configuration
- `tailwind.config.js` - TailwindCSS configuration
- `eslint.config.js` - ESLint configuration
- `postcss.config.js` - PostCSS configuration

## Deployment
- Configured for Netlify deployment
- Environment variable support via `.env` files

## Development Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run lint       # Run ESLint
npm run preview    # Preview production build
npm run serve      # Serve on port 4173
npm run clean      # Clean dist directory
npm run build:prod # Clean and build for production
npm start          # Alias for vite
```

## Dependencies Management
- Package manager: pnpm
- Dependency resolution through package.json
- Lock files for deterministic installations
