import { ProviderFactory } from './providers/factory';
import { ProviderType } from './providers/types';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

const SYSTEM_PROMPT_WEB = `You are an expert full-stack web developer and UI/UX designer specializing in generating production-ready web applications.

## CORE REQUIREMENTS:
1. **Code Quality**: Generate ONLY valid, runnable, production-grade code. ZERO placeholders, TODOs, or incomplete implementations.
2. **TypeScript**: Strict typing. No 'any' types. Full type safety.
3. **Styling**: Tailwind CSS exclusively. No inline styles. Mobile-first responsive design.
4. **Components**: Use shadcn/ui, Framer Motion, Lucide React icons. Composable architecture.
5. **Architecture**: Clean separation of concerns. Custom hooks. Reusable utilities.
6. **Web Standards**: React 18+, TypeScript 5+, semantic HTML, accessibility (WCAG 2.1)

## OUTPUT FORMAT:
Return ONLY valid JSON with:
{
  "title": "App title",
  "description": "What the app does",
  "files": [{ "path": "src/...", "content": "...", "language": "tsx" }],
  "dependencies": { "react": "^18.0.0", "react-dom": "^18.0.0", "tailwindcss": "^4.0.0", ... },
  "devDependencies": { ... },
  "designTokens": { colors, typography, spacing, ... }
}

## CRITICAL CHECKLIST:
- ✅ App is fully functional and complete
- ✅ No syntax errors or missing imports
- ✅ All components properly typed
- ✅ Responsive and mobile-friendly
- ✅ Accessible and semantic HTML
- ✅ Professional design
- ✅ Ready for production deployment
`;

const SYSTEM_PROMPT_MOBILE = `You are an expert React Native and mobile app developer specializing in generating production-ready native mobile applications.

## CORE REQUIREMENTS:
1. **Code Quality**: Generate ONLY valid, runnable, production-grade code. ZERO placeholders, TODOs, or incomplete implementations.
2. **TypeScript**: Strict typing. No 'any' types. Full type safety.
3. **Styling**: React Native StyleSheet exclusively. Native platform-specific styling where needed.
4. **Components**: Use React Native Gesture Handler, Reanimated 2 for animations. Composable architecture.
5. **Architecture**: Clean separation of concerns. Custom hooks. Reusable utilities.
6. **Mobile Standards**: React Native 0.73+, TypeScript 5+, native iOS/Android best practices

## OUTPUT FORMAT:
Return ONLY valid JSON with:
{
  "title": "App title",
  "description": "What the app does",
  "files": [{ "path": "app/...", "content": "...", "language": "tsx" }],
  "dependencies": { "react-native": "^0.73.0", "expo": "^50.0.0", "react-native-gesture-handler": "^2.14.0", ... },
  "devDependencies": { ... },
  "designTokens": { colors, typography, spacing, ... }
}

## CRITICAL CHECKLIST:
- ✅ App is fully functional and complete
- ✅ No syntax errors or missing imports
- ✅ All components properly typed
- ✅ Works on iOS and Android
- ✅ Native look and feel
- ✅ Performance optimized
- ✅ Ready for production deployment
`;

export function getSystemPrompt(appType?: 'web' | 'mobile'): string {
  return appType === 'mobile' ? SYSTEM_PROMPT_MOBILE : SYSTEM_PROMPT_WEB;
}

export default function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, type = 'generate', currentFiles, template, provider = 'anthropic', appType = 'web' } = req.body || {};
  
  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt' });
  }

  const SYSTEM_PROMPT = getSystemPrompt(appType);
  const userContent = buildGeneratePrompt(prompt, type, currentFiles, template, appType);

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

function buildGeneratePrompt(prompt: string, type: string, currentFiles: any[], template?: string, appType?: 'web' | 'mobile') {
  if (type === 'refine' && Array.isArray(currentFiles)) {
    const filesContext = currentFiles
      .map((file) => `### ${file.path}\n\`\`\`${file.language}\n${file.content}\n\`\`\``)
      .join('\n\n');

    return `You are refining an existing ${appType === 'mobile' ? 'mobile' : 'web'} application.

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

  const templateGuide = template ? `\n\n## TEMPLATE TYPE: ${template.toUpperCase()}\n${getTemplateGuide(template, appType)}` : '';
  
  return `Create a complete, production-ready ${appType === 'mobile' ? 'React Native mobile' : 'web'} application.

## USER REQUEST:
${prompt}

## REQUIREMENTS:
- Generate ALL necessary files for a complete, working application
${appType === 'mobile' 
  ? `- Use React Native 0.73+, TypeScript, Expo (managed workflow)
- Implement responsive design for iOS and Android
- Use native components and APIs where applicable
- Add proper error handling and validation
- Create a professional, polished design
- Use React Native Gesture Handler and Reanimated
- Use Expo Icons and SVG
- Ensure accessibility (screen readers, touch targets)` 
  : `- Use React 18, TypeScript, Tailwind CSS, shadcn/ui
- Implement responsive design (mobile-first)
- Add proper error handling and validation
- Create a professional, polished design
- Include proper file structure and organization
- Add meaningful animations with Framer Motion
- Use Lucide React icons
- Ensure accessibility (ARIA, semantic HTML)`}
- Production-ready code quality${templateGuide}

Return ONLY valid JSON matching the required format.`;
}

function getTemplateGuide(template: string, appType?: 'web' | 'mobile'): string {
  if (appType === 'mobile') {
    return getMobileTemplateGuide(template);
  }
  return getWebTemplateGuide(template);
}

function getWebTemplateGuide(template: string): string {
  const templates: Record<string, string> = {
    landing: `### LANDING PAGE - Complete Web Structure:
...existing landing guide...`,
    saas: `### SAAS DASHBOARD - Enterprise Web Structure:
...existing saas guide...`,
    ecommerce: `### ECOMMERCE STORE - Full Web Shop:
...existing ecommerce guide...`,
    admin: `### ADMIN PANEL - Complete Web Management:
...existing admin guide...`,
  };
  return templates[template] || '';
}

function getMobileTemplateGuide(template: string): string {
  const templates: Record<string, string> = {
    landing: `### MOBILE LANDING - App Onboarding:
- Welcome screen with hero image
- Feature showcase (scrollable cards)
- Social proof (testimonials)
- CTA to sign up/download
- Navigation tabs at bottom (React Navigation)
- Push notification setup ready`,
    saas: `### MOBILE SAAS - Dashboard App:
- Bottom tab navigation (Dashboard, Projects, Profile)
- Dashboard tab: Key metrics, charts (react-native-svg-charts)
- Projects tab: List view with pagination
- Profile tab: User info, settings
- Modal for creating/editing items
- Real-time data updates
- Offline support with AsyncStorage`,
    ecommerce: `### MOBILE ECOMMERCE - Shopping App:
- Tab navigation: Home, Search, Cart, Profile
- Home tab: Featured products, categories
- Product detail: Image carousel, specs, reviews
- Cart: Item management, checkout button
- Search: Autocomplete, filters
- Profile: Orders, wishlist, settings
- Stripe mobile checkout integration`,
    admin: `### MOBILE ADMIN - Management App:
- Side drawer navigation (React Navigation Drawer)
- Dashboard: Key metrics, charts
- List views: Users, projects, content
- Add/edit modals: Forms with validation
- Real-time notifications
- Biometric authentication support
- Data sync and offline capability`,
  };
  return templates[template] || '';
}
