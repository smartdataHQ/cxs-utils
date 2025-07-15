# CXS-Utils Documentation App

A comprehensive documentation application built with Next.js, TypeScript, and Tailwind CSS, designed to showcase and explain the CXS utilities.

## Table of Contents

- [Installation](#installation)
- [Running the Application](#running-the-application)
- [File Organization](#file-organization)
- [Project Maintenance](#project-maintenance)

## Installation

### Prerequisites

Before installing this package, ensure you have the following:

- Node.js (version 18.x or higher recommended)
- npm (version 8.x or higher) or yarn (version 1.22.x or higher)

### Setup Instructions

Install dependencies:

```bash
npm install
# or
yarn install
```

This will install all the necessary dependencies listed in the `package.json` file, including:
- Next.js (v13.5.1)
- React (v18.2.0)
- TypeScript (v5.2.2)
- Tailwind CSS (v3.3.3)
- Markdoc (for documentation rendering)
- Various Radix UI components for the interface

## Running the Application

### Development Mode

To run the application in development mode with hot-reload:

```bash
npm run dev
# or
yarn dev
```

This will start the development server on [http://localhost:3000](http://localhost:3000).

### Building for Production

To create a production build:

```bash
npm run build
# or
yarn build
```

### Starting the Production Server

After building, you can start the production server:

```bash
npm run start
# or
yarn start
```

### Linting

To check for linting issues:

```bash
npm run lint
# or
yarn lint
```

## File Organization

The project follows a standard Next.js structure with some customizations:

```
/docs
├── app/                    # Next.js 13+ App Router structure
│   ├── docs/               # Documentation routes
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout component
│   └── page.tsx            # Home page component
├── components/             # Reusable React components
├── docs/                   # Documentation source files
├── hooks/                  # Custom React hooks
├── lib/                    # Utility functions and shared logic
├── public/                 # Static assets
├── .gitignore              # Git ignore rules
├── components.json         # Components configuration
├── next-env.d.ts           # Next.js TypeScript declarations
├── next.config.js          # Next.js configuration
├── package.json            # NPM package definition
├── postcss.config.js       # PostCSS configuration
├── tailwind.config.ts      # Tailwind CSS configuration
└── tsconfig.json           # TypeScript configuration
```

### Key Folders and Files

- **/app**: Contains the main application code, using the Next.js 13+ App Router pattern.
- **/components**: Reusable UI components organized by functionality.
- **/docs**: Source content for the documentation.
- **/hooks**: Custom React hooks for shared stateful logic.
- **/lib**: Utility functions, helpers, and shared business logic.
- **package.json**: Defines the project dependencies and scripts.
- **tailwind.config.ts**: Configuration for Tailwind CSS, including theme customizations.

## Project Maintenance

### Adding New Documentation

1. Create new documentation files in the `/docs` directory.
2. Documentation uses Markdoc format - refer to existing files for formatting examples.
3. Update navigation structures if necessary to include new documentation.

### Updating Dependencies

Periodically update dependencies to ensure security and access to new features:

```bash
npm update
# or
yarn upgrade
```

For major version updates, review the changelog of each dependency before upgrading.


### Troubleshooting

Common issues:

1. **Build errors**: Make sure all dependencies are installed correctly
2. **Styling issues**: Check Tailwind configuration and class usage
3. **Content not updating**: Clear the `.next` cache folder and rebuild

