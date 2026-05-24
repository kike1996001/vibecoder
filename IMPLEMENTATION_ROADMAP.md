# 🚀 VIBECODER LOVABLE REPLICATION - IMPLEMENTATION ROADMAP

**Duración total**: 14-15 días laborales  
**Stack**: React 18 + TypeScript + Tailwind CSS + Vite  
**Objetivo**: Transformar Vibecoder en producto Lovable-equivalent

---

## 📅 TIMELINE OVERVIEW

```
Week 1:
├─ Day 1-2:   Foundation (colors, layout, components)
├─ Day 3-4:   Home + Hero
├─ Day 5-6:   Templates + Resources
└─ Day 7:     Projects Management

Week 2:
├─ Day 8-9:   Animations + Integrations
├─ Day 10:    Testing + Polish
├─ Day 11:    Performance
└─ Day 12-15: Deploy + Bug fixes
```

---

## 🏗️ SPRINT 1: FOUNDATION (Days 1-2)

### Objetivo
Establecer base visual: colores, componentes básicos, layout principal

### Tasks

#### 1.1 Update Tailwind Config
**File**: `tailwind.config.js`
**Changes**:
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#F5F3FF',
          500: '#8B6BFF',
          600: '#6B5BFF',
          700: '#5B4BEF',
        },
        gradient: {
          lovable: 'linear-gradient(135deg, #4B7FFF 0%, #FF50B4 50%, #FF6B35 100%)',
        },
      },
      spacing: {
        sidebar: '280px',
      },
      fontSize: {
        h1: ['48px', '1.2'],
        h2: ['36px', '1.2'],
        h3: ['28px', '1.3'],
      },
    },
  },
};
```

**Time**: 30 min

#### 1.2 Crear componentes básicos
**Files**:
- `src/components/ui/Button.tsx` (actualizar con 3 variantes)
- `src/components/ui/Badge.tsx` (nuevo)
- `src/components/ui/Input.tsx` (actualizar)
- `src/components/ui/Card.tsx` (nuevo)

**Button.tsx variants**:
```typescript
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'icon';

interface ButtonProps {
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  ...props
}) => {
  // Implementar 3 variantes
};
```

**Time**: 1.5 hours

#### 1.3 Crear Sidebar component
**File**: `src/components/layout/Sidebar.tsx`

**Estructura**:
```typescript
export const Sidebar: React.FC = () => {
  return (
    <aside className="w-sidebar bg-gray-50 border-r border-gray-200 h-screen sticky top-0 overflow-y-auto">
      {/* Top section */}
      <div className="p-4">
        {/* Logo + Workspace dropdown */}
      </div>
      
      {/* Navigation */}
      <nav className="space-y-2 px-2">
        {/* Nav items */}
      </nav>
      
      {/* Bottom section */}
      <div className="absolute bottom-0 left-0 right-0 border-t">
        {/* Share, Upgrade, Avatar */}
      </div>
    </aside>
  );
};
```

**Time**: 2 hours

#### 1.4 Crear Layout principal
**File**: `src/components/layout/DashboardLayout.tsx`

**Estructura**:
```typescript
export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar - hidden on mobile */}
      <div className="hidden md:block">
        <Sidebar />
      </div>
      
      {/* Mobile sidebar - drawer */}
      {sidebarOpen && (
        <MobileSidebar onClose={() => setSidebarOpen(false)} />
      )}
      
      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {/* Top bar - hamburger + logo + avatar */}
        {children}
      </main>
    </div>
  );
};
```

**Time**: 1.5 hours

#### 1.5 Crear nuevo Logo 3D
**File**: `src/components/ui/Logo.tsx`

**Especificación**:
```typescript
// SVG gradiente 3D con dos colores: azul → morado
// Size: 32x32 (customizable)
// Animación suave de rotación 3D

export const Logo3D: React.FC<{ size?: number }> = ({ size = 32 }) => {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size}>
      <defs>
        <linearGradient id="logo-gradient" x1="0%" x2="100%">
          <stop offset="0%" stopColor="#4B7FFF" />
          <stop offset="100%" stopColor="#6B5BFF" />
        </linearGradient>
      </defs>
      {/* 3D shape */}
    </svg>
  );
};
```

**Time**: 1 hour

### Sprint 1 Deliverables
- ✅ Tailwind config con colores Lovable
- ✅ Componentes Button, Badge, Input, Card
- ✅ Sidebar funcional
- ✅ Layout dashboard base
- ✅ Logo 3D

**Total Sprint 1**: ~7.5 hours

---

## 🏠 SPRINT 2: HOME + HERO (Days 3-4)

### Objetivo
Crear home page con hero input prominente y gradiente animado

### Tasks

#### 2.1 Hero Gradient Component
**File**: `src/components/ui/HeroGradient.tsx`

```typescript
export const HeroGradient: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      {/* Animated gradient background */}
      <div 
        className="absolute inset-0 bg-gradient-to-r from-blue-600 via-pink-500 to-orange-500 animate-gradient"
        style={{
          backgroundSize: '200% 200%',
          animation: 'gradientShift 18s ease infinite',
        }}
      />
      
      {/* Content overlay */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
```

**CSS animation** (add to globals):
```css
@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
```

**Time**: 1 hour

#### 2.2 Hero Input Component
**File**: `src/components/chat/HeroInput.tsx`

```typescript
interface HeroInputProps {
  onSubmit: (prompt: string) => void;
  placeholder?: string;
}

export const HeroInput: React.FC<HeroInputProps> = ({ 
  onSubmit, 
  placeholder = "Ask Vibecoder to create..." 
}) => {
  const [value, setValue] = useState('');
  
  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <div className="bg-white rounded-3xl shadow-2xl p-4 flex items-center gap-2">
        {/* + button */}
        <button className="w-10 h-10 rounded-lg hover:bg-gray-100">
          <Plus size={20} />
        </button>
        
        {/* Input */}
        <input 
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="flex-1 outline-none border-none text-base"
        />
        
        {/* Mic button */}
        <button className="w-10 h-10 rounded-lg hover:bg-gray-100">
          <Mic size={20} />
        </button>
        
        {/* Send button */}
        <button 
          onClick={() => {
            onSubmit(value);
            setValue('');
          }}
          className="w-10 h-10 rounded-lg bg-purple-600 hover:bg-purple-700 text-white"
        >
          <ArrowUp size={20} />
        </button>
      </div>
    </div>
  );
};
```

**Time**: 2 hours

#### 2.3 Typewriter Effect
**File**: `src/components/ui/Typewriter.tsx`

```typescript
interface TypewriterProps {
  text: string;
  speed?: number;
}

export const Typewriter: React.FC<TypewriterProps> = ({ 
  text, 
  speed = 50 
}) => {
  const [displayText, setDisplayText] = useState('');
  
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayText(text.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
      }
    }, speed);
    
    return () => clearInterval(interval);
  }, [text, speed]);
  
  return <span>{displayText}</span>;
};
```

**Time**: 1 hour

#### 2.4 Home Page
**File**: `src/pages/Home.tsx` (rewrite)

```typescript
export const Home: React.FC = () => {
  const navigate = useNavigate();
  
  const handlePrompt = (prompt: string) => {
    // Navigate to workspace with prompt
    navigate('/workspace', { state: { initialPrompt: prompt } });
  };
  
  return (
    <DashboardLayout>
      <HeroGradient>
        <div className="flex flex-col items-center justify-center min-h-screen px-4 py-20">
          {/* Badge */}
          <Badge className="mb-6">
            🔵 New
            <span className="ml-2">Create and share skills</span>
          </Badge>
          
          {/* Title */}
          <h1 className="text-h1 text-center mb-16 max-w-2xl">
            <Typewriter text="Ready to build, Delfina?" />
          </h1>
          
          {/* Hero Input */}
          <HeroInput onSubmit={handlePrompt} />
          
          {/* Templates section */}
          <div className="mt-32 w-full">
            <TemplateGallery />
          </div>
        </div>
      </HeroGradient>
    </DashboardLayout>
  );
};
```

**Time**: 1.5 hours

#### 2.5 Make Home responsive
**Tasks**:
- Font sizes reduce on mobile
- Hero input 56px → 72px responsive
- Padding ajustable por breakpoint
- Touch-friendly buttons

**Time**: 1 hour

### Sprint 2 Deliverables
- ✅ Animated gradient hero
- ✅ Hero input component (72px, 4 buttons)
- ✅ Typewriter effect
- ✅ Home page completa
- ✅ Responsive design

**Total Sprint 2**: ~7 hours

---

## 📚 SPRINT 3: TEMPLATES + RESOURCES (Days 5-6)

### Objective
Crear galería de templates con grid responsive

### Tasks

#### 3.1 Template Card Component
**File**: `src/components/ui/TemplateCard.tsx`

```typescript
interface Template {
  id: string;
  name: string;
  description: string;
  image: string;
  gradient?: string;
}

interface TemplateCardProps {
  template: Template;
  onSelect: (template: Template) => void;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({ 
  template, 
  onSelect 
}) => {
  return (
    <div 
      className="rounded-lg overflow-hidden bg-white shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer group"
      onClick={() => onSelect(template)}
    >
      {/* Image */}
      <div className="h-48 overflow-hidden">
        <img 
          src={template.image}
          alt={template.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      
      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-base mb-2">{template.name}</h3>
        <p className="text-gray-600 text-sm mb-4">{template.description}</p>
        
        <button className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors">
          Use Template ↗
        </button>
      </div>
    </div>
  );
};
```

**Time**: 1 hour

#### 3.2 Template Gallery Grid
**File**: `src/components/ui/TemplateGallery.tsx`

```typescript
export const TemplateGallery: React.FC = () => {
  const templates = [
    { id: '1', name: 'LovableSlides', description: 'Presentation builder', image: '...' },
    { id: '2', name: 'AssetWise', description: 'Equipment tracker', image: '...' },
    // ... más templates
  ];
  
  return (
    <div className="px-4 py-16 bg-white">
      <h2 className="text-center text-h2 mb-4">Vibecoder templates</h2>
      <p className="text-center text-gray-600 mb-12">
        Choose a template or start from scratch
      </p>
      
      {/* Grid responsive */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {templates.map(template => (
          <TemplateCard 
            key={template.id}
            template={template}
            onSelect={handleSelect}
          />
        ))}
      </div>
      
      <div className="text-center mt-12">
        <button className="text-purple-600 hover:text-purple-700 font-semibold">
          Browse all templates →
        </button>
      </div>
    </div>
  );
};
```

**Time**: 1 hour

#### 3.3 Resources Page
**File**: `src/pages/Resources.tsx`

```typescript
export const Resources: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="px-4 py-12">
        <h1 className="text-h2 mb-4">Resources</h1>
        <p className="text-gray-600 mb-12">
          Start from a template to build your next project
        </p>
        
        {/* Templates grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Template cards */}
        </div>
      </div>
    </DashboardLayout>
  );
};
```

**Time**: 1.5 hours

#### 3.4 Search Integration
**File**: `src/components/ui/SearchBar.tsx`

```typescript
export const SearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  
  const handleSearch = (q: string) => {
    setQuery(q);
    // Filter templates by query
  };
  
  return (
    <div className="relative">
      <input 
        type="text"
        placeholder="Search templates..."
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        className="w-full px-4 py-2 rounded-lg border border-gray-300"
      />
      
      {results.length > 0 && (
        <div className="absolute top-12 left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg">
          {/* Results */}
        </div>
      )}
    </div>
  );
};
```

**Time**: 1 hour

### Sprint 3 Deliverables
- ✅ Template card component
- ✅ Gallery grid responsive
- ✅ Resources page
- ✅ Search functionality
- ✅ Browse templates link

**Total Sprint 3**: ~5 hours

---

## 📁 SPRINT 4: PROJECTS (Days 7-8)

### Objective
Gestión básica de proyectos

### Tasks

#### 4.1 Projects Empty State
**File**: `src/pages/Projects.tsx`

```typescript
export const Projects: React.FC = () => {
  const [projects, setProjects] = useState([]);
  
  if (projects.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <Heart size={64} className="text-gray-300 mb-6" />
          
          <h1 className="text-h2 text-center mb-2">
            Start building your first project
          </h1>
          
          <p className="text-gray-600 mb-8">
            Create your first project to get started
          </p>
          
          <Button onClick={() => navigate('/workspace')}>
            Start Building
          </Button>
          
          {/* Gradient illustration */}
          <div className="mt-16 w-48 h-48 bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400 rounded-full opacity-20" />
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <div className="px-4 py-12">
        <h1 className="text-h2 mb-8">Projects</h1>
        
        {/* Projects grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};
```

**Time**: 2 hours

#### 4.2 Project Card
**File**: `src/components/ui/ProjectCard.tsx`

```typescript
interface Project {
  id: string;
  name: string;
  thumbnail?: string;
  updatedAt: Date;
  type: string;
}

export const ProjectCard: React.FC<{ project: Project }> = ({ project }) => {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
      {/* Thumbnail */}
      <div className="h-40 bg-gradient-to-br from-blue-400 via-pink-400 to-orange-400" />
      
      <div className="p-4">
        <h3 className="font-semibold mb-2">{project.name}</h3>
        <p className="text-sm text-gray-600 mb-4">
          Updated {formatDate(project.updatedAt)}
        </p>
        
        {/* Actions */}
        <div className="flex gap-2">
          <Button size="sm" variant="primary">Edit</Button>
          <Button size="sm" variant="secondary">Share</Button>
        </div>
      </div>
    </div>
  );
};
```

**Time**: 1 hour

#### 4.3 Create Project Flow
**File**: `src/components/modals/CreateProjectModal.tsx`

```typescript
export const CreateProjectModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState('web');
  
  const handleCreate = async () => {
    // Create project in database
    const project = await createProject({ name, type });
    navigate(`/workspace/${project.id}`);
  };
  
  return (
    <Modal onClose={onClose}>
      <h2 className="text-h3 mb-6">Create New Project</h2>
      
      <Input 
        placeholder="Project name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      
      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="web">Web App</option>
        <option value="mobile">Mobile App</option>
        <option value="landing">Landing Page</option>
      </select>
      
      <div className="flex gap-2 mt-6">
        <Button onClick={handleCreate}>Create</Button>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
      </div>
    </Modal>
  );
};
```

**Time**: 1.5 hours

### Sprint 4 Deliverables
- ✅ Projects page con empty state
- ✅ Project card component
- ✅ Create project flow
- ✅ Projects list view

**Total Sprint 4**: ~4.5 hours

---

## ✨ SPRINT 5: ANIMATIONS + INTEGRATIONS (Days 9-10)

### Objective
Pulir animaciones y conectar con backend

### Tasks

#### 5.1 Page Transition Animations
**File**: `src/lib/animations.ts`

```typescript
export const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 },
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};
```

**Time**: 1 hour

#### 5.2 Integrate with /api/generate
**File**: `src/services/aiService.ts` (update)

```typescript
export const generateProject = async (prompt: string, options: GenerateOptions) => {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, ...options }),
  });
  
  if (!response.ok) throw new Error('Generation failed');
  
  const reader = response.body?.getReader();
  // Handle streaming...
};
```

**Time**: 1 hour

#### 5.3 Connect Supabase for Projects
**File**: `src/services/projectService.ts`

```typescript
import { supabase } from '@/lib/supabase/client';

export const createProject = async (name: string, type: string) => {
  const { data, error } = await supabase
    .from('projects')
    .insert([{ name, type, user_id: user?.id }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const getProjects = async () => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};
```

**Time**: 1.5 hours

#### 5.4 Scroll animations
**File**: `src/components/ui/ScrollReveal.tsx`

```typescript
export const ScrollReveal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: '-100px' });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
};
```

**Time**: 1 hour

### Sprint 5 Deliverables
- ✅ Smooth page transitions
- ✅ API integration working
- ✅ Projects persistence en DB
- ✅ Scroll animations
- ✅ Loading states

**Total Sprint 5**: ~5 hours

---

## 🧪 SPRINT 6: TESTING + POLISH (Days 11-12)

### Objective
Testing en todos los dispositivos y optimización

### Tasks

- [ ] Test en Chrome, Firefox, Safari
- [ ] Test responsive: mobile (320px), tablet (768px), desktop (1366px+)
- [ ] Test performance: LCP, FID, CLS
- [ ] Test accesibilidad: a11y, keyboard navigation
- [ ] Fix bugs encontrados
- [ ] Optimize images
- [ ] Minify CSS/JS
- [ ] Test en producción environment

**Time**: ~8 hours

---

## 🚀 SPRINT 7: DEPLOY + FINAL (Day 13-15)

### Objective
Despliegue a producción

### Tasks

- [ ] Final build: `npm run build`
- [ ] Test build locally
- [ ] Deploy a Vercel
- [ ] Verify en producción
- [ ] Monitor performance
- [ ] Fix last-minute bugs
- [ ] SEO checks

**Time**: ~4 hours

---

## 📊 TOTAL TIMELINE

```
Sprint 1 (Foundation):     ~7.5 hours  (Day 1-2)
Sprint 2 (Home):           ~7 hours    (Day 3-4)
Sprint 3 (Templates):      ~5 hours    (Day 5-6)
Sprint 4 (Projects):       ~4.5 hours  (Day 7)
Sprint 5 (Animations):     ~5 hours    (Day 8-9)
Sprint 6 (Testing):        ~8 hours    (Day 10-11)
Sprint 7 (Deploy):         ~4 hours    (Day 12-13)
Buffer & Polish:           ~6 hours    (Day 14-15)
─────────────────────────────────────
TOTAL:                     ~47 hours   (14-15 días @ 8h/día)
```

---

## 🎯 SUCCESS METRICS

- ✅ UI 100% similar a Lovable
- ✅ Performance: LCP < 2.5s, CLS < 0.1
- ✅ Responsive: funciona en 320px-2560px
- ✅ No console errors/warnings
- ✅ All animations smooth (60fps)
- ✅ Accessibility score > 90

---

## 🔗 REFERENCIAS

- [Lovable.dev](https://lovable.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion/)
- [React Documentation](https://react.dev)

---

**Versión**: 1.0  
**Fecha**: 2025-01-21  
**Estado**: Ready for Sprint 1
