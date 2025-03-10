const fs = require('fs');
const path = require('path');

// Define the base path for the project
const basePath = process.argv[2] || 'kung-gestion';

// Function to create a directory if it doesn't exist
function createDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
}

// Function to create a file with content
function createFile(filePath, content = '') {
  const dir = path.dirname(filePath);
  createDirectory(dir);
  
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content);
    console.log(`Created file: ${filePath}`);
  }
}

// Function to create TypeScript/TSX files with basic content
function createTSXPage(filePath, pageName) {
  const content = `import React from 'react'

export default function ${pageName}() {
  return (
    <div>
      <h1>${pageName}</h1>
    </div>
  )
}
`;
  createFile(filePath, content);
}

// Function to create API route files
function createAPIRoute(filePath, routeName) {
  const content = `import { NextRequest, NextResponse } from 'next/server'

export async function GET(req) {
  return NextResponse.json({ message: "${routeName} fetched successfully" })
}

export async function POST(req) {
  return NextResponse.json({ message: "${routeName} created successfully" })
}
`;
  createFile(filePath, content);
}

// Function to create component files
function createComponent(filePath, componentName) {
  const content = `import React from 'react'

interface ${componentName}Props {
  // Define your props here
}

export function ${componentName}({ }) {
  return (
    <div>
      <h2>${componentName} Component</h2>
    </div>
  )
}
`;
  createFile(filePath, content);
}

// Function to create type definition files
function createTypeDefinition(filePath, typeName) {
  const content = `export interface ${typeName} {
  id: string
  name: string
  createdAt: Date
  updatedAt: Date
}
`;
  createFile(filePath, content);
}

// Function to generate the entire project structure
function generateProjectStructure() {
  console.log(`Generating project structure for: ${basePath}`);
  
  // Create the base directory
  createDirectory(basePath);
  
  // Create app directory structure
  // Auth pages
  createTSXPage(`${basePath}/app/(auth)/sign-in/page.tsx`, 'SignIn');
  createTSXPage(`${basePath}/app/(auth)/sign-up/page.tsx`, 'SignUp');
  createFile(`${basePath}/app/(auth)/layout.tsx`, `import React from 'react'

export default function AuthLayout({ children }) {
  return (
    <div className="auth-layout">
      {children}
    </div>
  )
}
`);

  // Dashboard pages
  createTSXPage(`${basePath}/app/(dashboard)/dashboard/page.tsx`, 'Dashboard');
  
  // Projects pages
  createTSXPage(`${basePath}/app/(dashboard)/projects/page.tsx`, 'Projects');
  createTSXPage(`${basePath}/app/(dashboard)/projects/new/page.tsx`, 'NewProject');
  createTSXPage(`${basePath}/app/(dashboard)/projects/[projectId]/page.tsx`, 'ProjectDetails');
  createTSXPage(`${basePath}/app/(dashboard)/projects/[projectId]/settings/page.tsx`, 'ProjectSettings');
  
  // Parts pages
  createTSXPage(`${basePath}/app/(dashboard)/projects/[projectId]/parts/page.tsx`, 'Parts');
  createTSXPage(`${basePath}/app/(dashboard)/projects/[projectId]/parts/[partId]/page.tsx`, 'PartDetails');
  
  // Order Lists pages
  createTSXPage(`${basePath}/app/(dashboard)/projects/[projectId]/parts/[partId]/order-lists/page.tsx`, 'OrderLists');
  createTSXPage(`${basePath}/app/(dashboard)/projects/[projectId]/parts/[partId]/order-lists/[orderListId]/page.tsx`, 'OrderListDetails');
  createTSXPage(`${basePath}/app/(dashboard)/projects/[projectId]/parts/[partId]/order-lists/[orderListId]/items/page.tsx`, 'OrderItems');
  
  // Manufacturers pages
  createTSXPage(`${basePath}/app/(dashboard)/manufacturers/page.tsx`, 'Manufacturers');
  createTSXPage(`${basePath}/app/(dashboard)/manufacturers/new/page.tsx`, 'NewManufacturer');
  createTSXPage(`${basePath}/app/(dashboard)/manufacturers/[manufacturerId]/page.tsx`, 'ManufacturerDetails');
  
  // Products pages
  createTSXPage(`${basePath}/app/(dashboard)/products/page.tsx`, 'Products');
  createTSXPage(`${basePath}/app/(dashboard)/products/[productId]/page.tsx`, 'ProductDetails');
  
  // Other dashboard pages
  createTSXPage(`${basePath}/app/(dashboard)/comparisons/page.tsx`, 'Comparisons');
  createTSXPage(`${basePath}/app/(dashboard)/settings/page.tsx`, 'Settings');
  
  // Dashboard layout
  createFile(`${basePath}/app/(dashboard)/layout.tsx`, `import React from 'react'
import { Sidebar } from '@/components/layouts/sidebar'
import { Navbar } from '@/components/layouts/navbar'

export default function DashboardLayout({ children }) {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="content">
        <Navbar />
        <main>
          {children}
        </main>
      </div>
    </div>
  )
}
`);

  // API routes
  // Projects API
  createAPIRoute(`${basePath}/app/api/projects/route.ts`, 'Projects');
  createAPIRoute(`${basePath}/app/api/projects/[projectId]/route.ts`, 'Project');
  createAPIRoute(`${basePath}/app/api/projects/[projectId]/parts/route.ts`, 'Parts');
  createAPIRoute(`${basePath}/app/api/projects/[projectId]/parts/[partId]/route.ts`, 'Part');
  createAPIRoute(`${basePath}/app/api/projects/[projectId]/parts/[partId]/order-lists/route.ts`, 'OrderLists');
  createAPIRoute(`${basePath}/app/api/projects/[projectId]/parts/[partId]/order-lists/[orderListId]/route.ts`, 'OrderList');
  createAPIRoute(`${basePath}/app/api/projects/[projectId]/parts/[partId]/order-lists/[orderListId]/items/route.ts`, 'OrderItems');
  
  // Manufacturers API
  createAPIRoute(`${basePath}/app/api/manufacturers/route.ts`, 'Manufacturers');
  createAPIRoute(`${basePath}/app/api/manufacturers/[manufacturerId]/route.ts`, 'Manufacturer');
  
  // Products API
  createAPIRoute(`${basePath}/app/api/products/route.ts`, 'Products');
  createAPIRoute(`${basePath}/app/api/products/[productId]/route.ts`, 'Product');
  createAPIRoute(`${basePath}/app/api/products/compare/route.ts`, 'ProductComparison');
  
  // Root layout and page
  createFile(`${basePath}/app/layout.tsx`, `import '@/styles/globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Kung-Gestion',
  description: 'Project management application',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
`);

  createTSXPage(`${basePath}/app/page.tsx`, 'Home');
  
  // Components
  // Create empty shadcn UI components directory
  createDirectory(`${basePath}/components/ui`);
  createFile(`${basePath}/components/ui/.gitkeep`);
  
  // Forms
  createComponent(`${basePath}/components/forms/project-form.tsx`, 'ProjectForm');
  createComponent(`${basePath}/components/forms/part-form.tsx`, 'PartForm');
  createComponent(`${basePath}/components/forms/order-list-form.tsx`, 'OrderListForm');
  createComponent(`${basePath}/components/forms/order-item-form.tsx`, 'OrderItemForm');
  createComponent(`${basePath}/components/forms/manufacturer-form.tsx`, 'ManufacturerForm');
  createComponent(`${basePath}/components/forms/product-form.tsx`, 'ProductForm');
  
  // Layouts
  createComponent(`${basePath}/components/layouts/sidebar.tsx`, 'Sidebar');
  createComponent(`${basePath}/components/layouts/navbar.tsx`, 'Navbar');
  createComponent(`${basePath}/components/layouts/footer.tsx`, 'Footer');
  
  // Tables
  createComponent(`${basePath}/components/tables/projects-table.tsx`, 'ProjectsTable');
  createComponent(`${basePath}/components/tables/manufacturers-table.tsx`, 'ManufacturersTable');
  createComponent(`${basePath}/components/tables/products-table.tsx`, 'ProductsTable');
  createComponent(`${basePath}/components/tables/comparison-table.tsx`, 'ComparisonTable');
  
  // Modals
  createComponent(`${basePath}/components/modals/confirm-delete.tsx`, 'ConfirmDelete');
  createComponent(`${basePath}/components/modals/export-pdf.tsx`, 'ExportPDF');
  
  // Shared components
  createComponent(`${basePath}/components/shared/data-table.tsx`, 'DataTable');
  createComponent(`${basePath}/components/shared/search-filter.tsx`, 'SearchFilter');
  createComponent(`${basePath}/components/shared/loading-spinner.tsx`, 'LoadingSpinner');
  
  // Lib directories
  // DB
  createFile(`${basePath}/lib/db/schema.ts`, `// Define your database schema here
import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'

export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Add more tables as needed
`);

  createFile(`${basePath}/lib/db/client.ts`, `import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// Create PostgreSQL connection
const connectionString = process.env.DATABASE_URL || ''
const client = postgres(connectionString)
export const db = drizzle(client, { schema })
`);
  
  // Utils
  createFile(`${basePath}/lib/utils/format-data.ts`, `export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}
`);

  createFile(`${basePath}/lib/utils/export-utils.ts`, `import { jsPDF } from 'jspdf'
import 'jspdf-autotable'

export function exportToPDF(data: any[], filename: string): void {
  // Implementation for PDF export
  console.log('Exporting to PDF:', data, filename)
}

export function exportToCSV(data: any[], filename: string): void {
  // Implementation for CSV export
  console.log('Exporting to CSV:', data, filename)
}
`);

  createFile(`${basePath}/lib/utils/comparison-utils.ts`, `export function compareProducts(productIds: string[]) {
  // Implementation for product comparison
  console.log('Comparing products:', productIds)
  return []
}
`);
  
  // Auth
  createFile(`${basePath}/lib/clerk/auth.ts`, `import { auth, currentUser } from '@clerk/nextjs'

export async function getCurrentUserDetails() {
  const user = await currentUser()
  return user
}

export function getAuth() {
  return auth()
}
`);
  
  // Supabase
  createFile(`${basePath}/lib/supabase/client.ts`, `import { createClient } from '@supabase/supabase-js'

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
export const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseKey)
`);
  
  // Types
  createTypeDefinition(`${basePath}/lib/types/project.ts`, 'Project');
  createTypeDefinition(`${basePath}/lib/types/part.ts`, 'Part');
  createTypeDefinition(`${basePath}/lib/types/order-list.ts`, 'OrderList');
  createTypeDefinition(`${basePath}/lib/types/order-item.ts`, 'OrderItem');
  createTypeDefinition(`${basePath}/lib/types/manufacturer.ts`, 'Manufacturer');
  createTypeDefinition(`${basePath}/lib/types/product.ts`, 'Product');
  
  // Public directory
  createDirectory(`${basePath}/public/images`);
  createFile(`${basePath}/public/images/logo.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="#4f46e5" />
  <text x="50" y="50" font-family="Arial" font-size="24" fill="white" text-anchor="middle" dominant-baseline="middle">KG</text>
</svg>
`);
  createFile(`${basePath}/public/favicon.ico`, '');
  
  // Styles
  createFile(`${basePath}/styles/globals.css`, `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 48%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
`);
  
  // Root files
  createFile(`${basePath}/middleware.ts`, `import { authMiddleware } from '@clerk/nextjs'

export default authMiddleware({
  publicRoutes: ['/'],
})

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}
`);

  createFile(`${basePath}/next.config.js`, `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: true,
  },
}

module.exports = nextConfig
`);

  createFile(`${basePath}/tailwind.config.js`, `/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
`);

  createFile(`${basePath}/tsconfig.json`, `{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
`);

  createFile(`${basePath}/package.json`, `{
  "name": "kung-gestion",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@clerk/nextjs": "^4.23.2",
    "@hookform/resolvers": "^3.1.1",
    "@radix-ui/react-alert-dialog": "^1.0.4",
    "@radix-ui/react-dialog": "^1.0.4",
    "@radix-ui/react-dropdown-menu": "^2.0.5",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-select": "^1.2.2",
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-toast": "^1.1.4",
    "@supabase/supabase-js": "^2.31.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "drizzle-orm": "^0.27.2",
    "jspdf": "^2.5.1",
    "jspdf-autotable": "^3.5.31",
    "lucide-react": "^0.263.1",
    "next": "13.4.12",
    "postgres": "^3.3.5",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "react-hook-form": "^7.45.2",
    "recharts": "^2.7.2",
    "tailwind-merge": "^1.14.0",
    "tailwindcss-animate": "^1.0.6",
    "typescript": "5.1.6",
    "zod": "^3.21.4"
  },
  "devDependencies": {
    "@types/node": "20.4.5",
    "@types/react": "18.2.17",
    "@types/react-dom": "18.2.7",
    "autoprefixer": "10.4.14",
    "eslint": "8.46.0",
    "eslint-config-next": "13.4.12",
    "postcss": "8.4.27",
    "tailwindcss": "3.3.3"
  }
}
`);

  createFile(`${basePath}/README.md`, `# Kung-Gestion

A project management application for tracking projects, parts, manufacturers, and products.

## Features

- User authentication with Clerk
- Project management
- Parts management
- Order list tracking
- Manufacturer database
- Product catalog
- Product comparison

## Getting Started

1. Clone the repository
2. Install dependencies with \`bun install\` or \`npm install\`
3. Set up environment variables
4. Run the development server with \`bun dev\` or \`npm run dev\`

## Tech Stack

- Next.js 13 (App Router)
- TypeScript
- Tailwind CSS
- Clerk Authentication
- Supabase
- Drizzle ORM

## Folder Structure

\`\`\`
kung-gestion/
├── app/
│   ├── (auth)/
│   ├── (dashboard)/
│   ├── api/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/
│   ├── forms/
│   ├── layouts/
│   ├── tables/
│   ├── modals/
│   └── shared/
├── lib/
│   ├── db/
│   ├── utils/
│   ├── clerk/
│   ├── supabase/
│   └── types/
├── public/
│   ├── images/
│   └── favicon.ico
├── styles/
│   └── globals.css
└── ... config files
\`\`\`
`);

  console.log('Project structure generated successfully!');
}

// Run the generator
generateProjectStructure();