import { ProviderFactory } from './providers/factory.ts';
import { ProviderType } from './providers/types.ts';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const SYSTEM_PROMPT = `You are an expert full-stack developer and UI/UX designer specializing in generating production-ready applications.

## CORE REQUIREMENTS:
1. **Code Quality**: Generate ONLY valid, runnable, production-grade code. ZERO placeholders, TODOs, or incomplete implementations.
2. **TypeScript**: Strict typing. No 'any' types. Full type safety.
3. **Styling**: Tailwind CSS exclusively. No inline styles. Mobile-first responsive design.
4. **Components**: Use shadcn/ui, Framer Motion, Lucide React icons. Composable architecture.
5. **Architecture**: Clean separation of concerns. Custom hooks. Reusable utilities.

## GENERATION RULES:

### Templates:
- **Landing Page**: Hero section, features, CTA, testimonials, footer. SEO-optimized.
- **SaaS Dashboard**: Sidebar nav, header, stats cards, charts (with recharts), tables, modals.
- **eCommerce Store**: Product grid, filters, cart, checkout flow, payment integration ready.
- **Admin Panel**: Data tables, CRUD forms, analytics, user management, permissions.

### Code Standards:
- Directory structure: Components organized by feature, not by type
- Naming: PascalCase components, camelCase functions/variables
- Error handling: Try-catch, validation, user feedback
- Performance: Code splitting, lazy loading, memoization where needed
- Accessibility: ARIA labels, semantic HTML, keyboard navigation

### Design System:
- Colors: Modern palette with primary, secondary, accent, neutral shades
- Typography: Scale with clear hierarchy (h1-h6, body, caption)
- Spacing: Consistent 4px grid system (4, 8, 12, 16, 24, 32...)
- Radius: sm, md, lg, xl for all components
- Shadows: Subtle depth with consistent shadow system

### Dependencies:
- React 18+, TypeScript 5+, Next.js 14+ (when needed)
- Tailwind CSS 3.4+, shadcn/ui latest
- Framer Motion, Lucide React, clsx
- Include ALL dependency versions in response

## OUTPUT FORMAT:
Return ONLY valid JSON with:
{
  "title": "App title",
  "description": "What the app does",
  "files": [{ "path": "src/...", "content": "...", "language": "tsx" }],
  "dependencies": { "react": "^18.0.0", ... },
  "devDependencies": { ... },
  "designTokens": { colors, typography, spacing, ... }
}

## CRITICAL CHECKLIST:
- ✅ App is fully functional and complete
- ✅ No syntax errors or missing imports
- ✅ All components properly typed
- ✅ Responsive and mobile-friendly
- ✅ Accessible and semantic HTML
- ✅ Professional design, not amateur
- ✅ Ready for production deployment
- ✅ Proper error handling throughout
`;

function buildGeneratePrompt(prompt: string, type: string, currentFiles: any[], template?: string) {
  if (type === 'refine' && Array.isArray(currentFiles)) {
    const filesContext = currentFiles
      .map((file) => `### ${file.path}\n\`\`\`${file.language}\n${file.content}\n\`\`\``)
      .join('\n\n');

    return `You are refining an existing application.

## CURRENT APPLICATION:
${filesContext}

## REFINEMENT REQUEST:
${prompt}

## INSTRUCTIONS:
- Return COMPLETE updated files
- Maintain existing functionality unless explicitly changed
- Keep all imports and dependencies
- Improve code quality if possible
- Make incremental, focused improvements
- Return ONLY modified or new files
- Ensure app remains fully functional

Return valid JSON with "files" array containing only changed/new files.`;
  }

  const templateGuide = template ? `\n\n## TEMPLATE TYPE: ${template.toUpperCase()}\n${getTemplateGuide(template)}` : '';
  
  return `Create a complete, production-ready web application.

## USER REQUEST:
${prompt}

## REQUIREMENTS:
- Generate ALL necessary files for a complete, working application
- Use React 18, TypeScript, Tailwind CSS, shadcn/ui
- Implement responsive design (mobile-first)
- Add proper error handling and validation
- Create a professional, polished design
- Include proper file structure and organization
- Add meaningful animations with Framer Motion
- Use Lucide React icons
- Ensure accessibility (ARIA, semantic HTML)
- Production-ready code quality${templateGuide}

Return ONLY valid JSON matching the required format.`;
}

function getTemplateGuide(template: string): string {
  const templates: Record<string, string> = {
    landing: `
### LANDING PAGE - Complete Structure:

**Sections Required:**
1. Navigation bar (sticky): Logo, menu items, CTA button
2. Hero section: Headline, subheadline, hero image/video, CTA button
3. Features grid (3-4 features): Icon, title, description, benefits
4. Testimonials carousel: Avatar, name, role, quote, rating
5. Pricing table (if applicable): Tiers, features, CTAs
6. FAQ accordion: Common questions with expandable answers
7. Final CTA section: Email signup or download
8. Footer: Links, social media, copyright

**Components to Create:**
- Navigation (with mobile menu)
- Hero (with gradient background)
- FeatureCard (reusable)
- TestimonialSlider (with autoplay)
- PricingTable (with feature comparison)
- FAQSection (with accordion)
- Newsletter signup
- Footer

**Styling:**
- Gradient backgrounds (violet to fuchsia)
- Smooth scrolling
- Hover animations on CTAs
- Mobile-first responsive
- Dark mode support
- Glassmorphism effects on cards

**SEO:**
- Semantic HTML (section, article, etc)
- Proper heading hierarchy
- Meta descriptions
- Open Graph tags (structure in HTML)
- Schema markup for structured data
    `,
    saas: `
### SAAS DASHBOARD - Enterprise Structure:

**Core Layout:**
1. Sidebar navigation: Collapsible, with icons, active states
2. Top bar: Logo/brand, breadcrumbs, search, notifications, profile menu
3. Main content area: Dashboard with widgets, charts, tables

**Pages to Create:**
- Dashboard (main): Key metrics, charts, recent activity
- Projects/Items: Data table with sorting, filtering, pagination
- Create/Edit views: Forms with validation
- User Management: Admin panel for users and roles
- Settings: Preferences, billing, integrations
- Reports: Analytics and export functionality

**Components:**
- DataTable (sortable, filterable, paginated)
- StatsCard (with trend indicators)
- LineChart, BarChart, PieChart (recharts)
- Modal for CRUD operations
- FormBuilder (reusable form component)
- Sidebar navigation
- Top navigation bar

**Features:**
- Real-time updates (simulate with intervals)
- Export to CSV functionality
- Date range filters
- Search functionality
- Role-based UI elements
- Loading states and skeletons
- Error boundaries
- Toast notifications

**Database Structure (in comments):**
- Users table: id, name, email, role, created_at
- Projects table: id, user_id, name, status, created_at
- Activities table: id, user_id, action, timestamp
    `,
    ecommerce: `
### ECOMMERCE STORE - Full Shop Structure:

**Pages Required:**
1. Product Listing: Grid/list view, filters, sorting, search
2. Product Detail: Images gallery, description, specs, reviews
3. Shopping Cart: Items, quantities, totals, checkout button
4. Checkout: Shipping, payment info, order summary
5. Order Success: Confirmation, tracking info
6. Order History: Past purchases, tracking links
7. User Account: Profile, saved addresses, payment methods
8. Search Results: Dynamic filtering

**Components:**
- ProductCard: Image, name, price, rating, add to cart
- ProductGallery: Multiple images, zoom, thumbnails
- FilterSidebar: Price range, categories, ratings
- CartDrawer: Quick view, modify quantities, remove
- CheckoutForm: Form with validation
- ReviewSection: Star ratings, comments, helpful votes
- PaymentForm: Stripe integration placeholder
- OrderConfirmation

**Features:**
- Product search and autocomplete
- Advanced filtering (price, rating, category)
- Product comparison
- Wishlist functionality
- Reviews and ratings system
- Stock management (show availability)
- Size/color variants
- Coupon/promo code support
- Cart persistence (localStorage)
- Order tracking

**State Management:**
- Global cart state (Zustand/Context)
- User authentication state
- Filter state (persist to URL params)
- Product inventory state

**Payment Ready:**
- Stripe checkout integration (mock for now)
- Credit card form (PCI compliant approach)
- Order creation and storage
    `,
    admin: `
### ADMIN PANEL - Complete Management System:

**Pages Required:**
1. Dashboard: Statistics, charts, recent activities
2. Users Management: List, create, edit, delete, role assignment
3. Content Management: CRUD for main resources
4. Analytics: Charts, reports, data exports
5. Settings: System config, user preferences
6. Activity Logs: Audit trail of all actions
7. API Keys: Management interface
8. Backups: Manual backup triggers

**Components:**
- DataTable: Advanced with bulk actions, inline editing
- UserForm: With role/permission checkboxes
- ChartPanel: Customizable dashboard widgets
- ActivityLog: Sortable, filterable event history
- PermissionMatrix: Role-based access control UI
- FileUpload: With progress and validation
- DateRangePicker: For report filtering
- ExportButton: CSV, PDF exports

**Features:**
- Bulk actions (select multiple, delete, export)
- Advanced search and filtering
- Inline editing
- Real-time statistics
- Export to CSV/PDF
- Pagination with custom page size
- Column visibility toggle
- Sort multiple columns
- Custom date ranges

**User Management:**
- Create users with role assignment
- Edit user details
- Reset passwords
- Deactivate/activate users
- Assign permissions
- Bulk user import

**Content Sections:**
- CRUD for each resource type
- Validation with error messages
- Duplicate/copy functionality
- Archive instead of delete
- Version history/changelog

**Security:**
- CSRF token handling
- Input validation
- Rate limiting UI elements
- Activity audit logs
- IP logging
- Failed attempt tracking

**Access Control:**
- Role-based menu visibility
- Permission-based features
- Super admin override
- Audit all sensitive actions
    `,
  };

  return templates[template] || '';
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, type = 'generate', currentFiles, template, provider = 'anthropic' } = req.body || {};
  
  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt' });
  }

  const userContent = buildGeneratePrompt(prompt, type, currentFiles, template);

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    // Get provider dynamically
    const selectedProvider = ProviderFactory.getProvider(provider as ProviderType);

    // Call provider's generate or refine method
    const onStream = (text: string) => {
      res.write(`data: ${JSON.stringify({ chunk: text })}\n\n`);
    };

    const result = type === 'refine' 
      ? await selectedProvider.refine(userContent, currentFiles, SYSTEM_PROMPT, onStream)
      : await selectedProvider.generate(userContent, SYSTEM_PROMPT, onStream);

    res.write(`data: ${JSON.stringify({ done: true, result })}\n\n`);
    res.end();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
}
