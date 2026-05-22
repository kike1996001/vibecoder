// All templates with detailed configurations
export const TEMPLATES = {
  // Original templates
  landing: {
    id: 'landing',
    name: 'Landing Page',
    description: 'Modern marketing landing page with hero, features, pricing, CTA',
    icon: 'Globe',
    category: 'marketing',
    baseCredits: 10,
    features: ['Hero Section', 'Feature Grid', 'Pricing Plans', 'Newsletter Signup', 'Footer'],
    aiProvider: 'anthropic', // default provider
    tags: ['marketing', 'conversion', 'fast-build'],
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-adf4e565db18?w=500&h=300&fit=crop',
  },
  saas: {
    id: 'saas',
    name: 'SaaS Dashboard',
    description: 'Business intelligence dashboard with charts, analytics, user management',
    icon: 'BarChart3',
    category: 'business',
    baseCredits: 15,
    features: ['Dashboard', 'Analytics Charts', 'User Management', 'API Endpoints', 'Authentication'],
    aiProvider: 'anthropic',
    tags: ['business', 'analytics', 'enterprise'],
    thumbnail: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=500&h=300&fit=crop',
  },
  ecommerce: {
    id: 'ecommerce',
    name: 'E-Commerce Store',
    description: 'Full-featured online store with products, cart, checkout, payments',
    icon: 'ShoppingCart',
    category: 'commerce',
    baseCredits: 15,
    features: ['Product Catalog', 'Shopping Cart', 'Checkout', 'Payment Integration', 'Order Management'],
    aiProvider: 'anthropic',
    tags: ['ecommerce', 'payments', 'shopping'],
    thumbnail: 'https://images.unsplash.com/photo-1523206489230-c012066a36a7?w=500&h=300&fit=crop',
  },
  admin: {
    id: 'admin',
    name: 'Admin Panel',
    description: 'Management system for data, users, permissions, reports',
    icon: 'SettingsIcon',
    category: 'business',
    baseCredits: 12,
    features: ['Data Tables', 'User Management', 'Permissions', 'Reports', 'Settings'],
    aiProvider: 'anthropic',
    tags: ['admin', 'management', 'enterprise'],
    thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop',
  },

  // NEW TEMPLATES (Phase 2)
  blog: {
    id: 'blog',
    name: 'Blog & CMS',
    description: 'Content management system with posts, categories, search, comments',
    icon: 'BookOpen',
    category: 'content',
    baseCredits: 12,
    features: ['Posts Management', 'Categories', 'Search', 'Comments', 'Tags & Filters'],
    aiProvider: 'anthropic',
    tags: ['content', 'blog', 'cms'],
    thumbnail: 'https://images.unsplash.com/photo-1516534775068-bb57e39c5f67?w=500&h=300&fit=crop',
  },
  marketplace: {
    id: 'marketplace',
    name: 'Marketplace',
    description: 'Vendor platform with multi-seller support, listings, orders, escrow',
    icon: 'Store',
    category: 'commerce',
    baseCredits: 18,
    features: ['Vendor Dashboard', 'Product Listings', 'Order Management', 'Escrow', 'Reviews'],
    aiProvider: 'anthropic',
    tags: ['marketplace', 'vendors', 'ecommerce'],
    thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop',
  },
  community: {
    id: 'community',
    name: 'Community Forum',
    description: 'Discussion platform with threads, topics, moderation, user profiles',
    icon: 'Users',
    category: 'social',
    baseCredits: 14,
    features: ['Threads', 'Topics', 'User Profiles', 'Moderation', 'Reputation System'],
    aiProvider: 'anthropic',
    tags: ['community', 'forum', 'social'],
    thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop',
  },
  cms: {
    id: 'cms',
    name: 'Headless CMS',
    description: 'Flexible content management with API, versioning, workflows',
    icon: 'Database',
    category: 'content',
    baseCredits: 16,
    features: ['Content Collections', 'API Endpoints', 'Versioning', 'Publishing Workflow', 'Media Library'],
    aiProvider: 'anthropic',
    tags: ['cms', 'headless', 'api'],
    thumbnail: 'https://images.unsplash.com/photo-1516534775068-bb57e39c5f67?w=500&h=300&fit=crop',
  },
  analytics: {
    id: 'analytics',
    name: 'Analytics Dashboard',
    description: 'Real-time analytics with metrics, trends, reports, data visualization',
    icon: 'TrendingUp',
    category: 'analytics',
    baseCredits: 16,
    features: ['Real-time Metrics', 'Charts & Graphs', 'Custom Reports', 'Data Export', 'Alerts'],
    aiProvider: 'anthropic',
    tags: ['analytics', 'data', 'reporting'],
    thumbnail: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=500&h=300&fit=crop',
  },
};

// Template categories for filtering
export const TEMPLATE_CATEGORIES = {
  marketing: { name: 'Marketing', color: 'bg-orange-500' },
  business: { name: 'Business', color: 'bg-blue-500' },
  commerce: { name: 'Commerce', color: 'bg-purple-500' },
  content: { name: 'Content', color: 'bg-green-500' },
  social: { name: 'Social', color: 'bg-pink-500' },
  analytics: { name: 'Analytics', color: 'bg-indigo-500' },
};

export function getTemplate(id: string) {
  return TEMPLATES[id as keyof typeof TEMPLATES];
}

export function getAllTemplates() {
  return Object.values(TEMPLATES);
}

export function getTemplatesByCategory(category: string) {
  return Object.values(TEMPLATES).filter(t => t.category === category);
}

export function getNewTemplates() {
  return ['blog', 'marketplace', 'community', 'cms', 'analytics'].map(
    id => TEMPLATES[id as keyof typeof TEMPLATES]
  );
}
