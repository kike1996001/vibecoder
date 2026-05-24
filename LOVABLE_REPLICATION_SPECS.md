# 🎯 VIBECODER - LOVABLE REPLICATION SPECIFICATIONS

**Objetivo**: Transformar Vibecoder en un producto a nivel de Lovable.dev con interfaz, comportamiento y servicios equivalentes.

**Status**: ✅ Análisis completado | ⏳ Implementación pendiente

---

## 📋 TABLA DE CONTENIDOS
1. [Estructura General](#estructura-general)
2. [Componentes Visuales](#componentes-visuales)
3. [Paleta de Colores](#paleta-de-colores)
4. [Sistema de Tipografía](#sistema-de-tipografía)
5. [Animaciones](#animaciones)
6. [Responsive Design](#responsive-design)
7. [Rutas y Navegación](#rutas-y-navegación)
8. [Implementación por Sprint](#implementación-por-sprint)

---

## 🏗️ ESTRUCTURA GENERAL

### Layout Dashboard (Desktop)
```
┌──────────────────────────────────────────────────────────────┐
│ Logo/hamburger          Navigation                   Avatar   │
├──────────┬───────────────────────────────────────────────────┤
│ SIDEBAR  │                                                   │
│ 280px    │        MAIN CONTENT AREA                         │
│          │        (responsive width)                         │
│          │                                                   │
│          ├───────────────────────────────────────────────────┤
│          │ Scrollable content                                │
│          │                                                   │
│          │                                                   │
└──────────┴───────────────────────────────────────────────────┘
```

### Puntos de Quiebre Responsive
```
Desktop: 1366px+ (full layout)
Tablet:  768px-1365px (sidebar colapsable)
Mobile:  < 768px (sidebar drawer)
```

---

## 🎨 COMPONENTES VISUALES

### 1. SIDEBAR (280px width)

**Estructura**:
```
┌─────────────────────────────────────┐
│  [≡] Logo - "Vibecoder"            │ (Top bar mobile)
├─────────────────────────────────────┤
│  Logo Icon (32x32)                  │
│  "Workspace" Dropdown               │
│  ───────────────────────────────    │
│  🏠 Home                            │
│  🔍 Search (Ctrl+K)                 │
│  📚 Resources                       │
│  🔗 Integrations                    │
│  ───────────────────────────────    │
│  📂 Projects                        │
│  ───────────────────────────────    │
│                                     │
│  (Space for scrolling)              │
│                                     │
│  ───────────────────────────────    │
│  📤 Share & Earn                    │
│  ⚡ Upgrade Pro                    │
│  👤 Settings                       │
└─────────────────────────────────────┘
```

**Comportamiento**:
- Sticky: No scrollea con main content
- Desktop: Siempre visible
- Tablet: Colapsable (botón hamburguesa)
- Mobile: Drawer drawer animado

**Especificaciones**:
- Background: #F3F4F6
- Border-right: 1px #E5E7EB
- Font: 14px, #1F2937
- Active item background: #E5E7EB
- Hover: #F5F5F5

---

### 2. HERO INPUT (Componente Crítico)

**Ubicación**: Top del main content (o en Home/Dashboard)

**Especificaciones dimensionales**:
```
Desktop:
- Altura: 72px
- Ancho: 100% (max 920px)
- Padding: 16px

Tablet:
- Altura: 64px
- Ancho: 100% (max 800px)
- Padding: 12px

Mobile:
- Altura: 56px
- Ancho: 100% (max 100%)
- Padding: 10px
```

**Estructura interna** (flex horizontal, gap 8px):
```
┌────────────────────────────────────────────┐
│ [+] │ Ask Lovable to...  │ 🎙️ │ ↑        │
│ 40x │ (flex-grow)        │ 40x │ 40x      │
│ 40  │                    │ 40  │ 40       │
└────────────────────────────────────────────┘
```

**Botones internos**:

**+ Button (File upload)**
- Size: 40x40
- Icon: Plus (lucide-react)
- Background: transparent
- Hover: #F5F5F5
- Border-radius: 8px
- Tooltip: "Attach file"

**Input field**
- Placeholder: "Ask Vibecoder to create..."
- Font: 16px, #1F2937
- Color: #1F2937
- Background: transparent
- Border: none
- Outline: none
- Auto-resize on type (max 200px height)

**🎙️ Button (Voice)**
- Size: 40x40
- Icon: Mic (lucide-react)
- Background: transparent
- Hover: #F5F5F5
- Border-radius: 8px
- Disabled initially
- Tooltip: "Voice input"

**↑ Button (Send)**
- Size: 40x40
- Icon: ArrowUp (lucide-react)
- Background: #6B5BFF (purple)
- Hover: #5B4BEF (darker)
- Active: brightness 95%
- Color: white
- Border-radius: 8px
- Cursor: pointer
- Font-weight: 500

**Estilos contenedor**:
- Background: white
- Border-radius: 24px
- Box-shadow: 0 20px 50px rgba(0,0,0,0.15)
- Border: 1px solid #E5E7EB
- Transition: all 200ms ease

**Estados**:
- Default: gray border, light shadow
- Focus: purple ring (#6B5BFF), shadow aumenta
- Hover: shadow aumenta
- Active (typing): ring morado

---

### 3. HERO SECTION (Home/Dashboard)

**Gradiente background**:
```css
background: linear-gradient(135deg, 
  #4B7FFF 0%,      /* Azul */
  #FF50B4 50%,     /* Magenta */
  #FF6B35 100%     /* Naranja */
);

/* Animación suave */
animation: gradientShift 18s ease infinite;

@keyframes gradientShift {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
```

**Contenido centrado**:
```
┌────────────────────────────────────────┐
│ "🔵 New                               │
│ "Create and share skills" →           │
│                                       │
│ "Ready to build, Delfina?"            │
│ (Typewriter effect)                   │
│                                       │
│ [Hero Input goes here]                │
│                                       │
└────────────────────────────────────────┘
```

**Badge "New"**:
- Background: #3B82F6
- Color: white
- Padding: 4px 12px
- Border-radius: 20px
- Font: 12px bold
- Margin-bottom: 16px

**Título**:
- Font-size: 48px (desktop), 36px (tablet), 28px (mobile)
- Font-weight: 700
- Color: #1F2937
- Margin: 32px 0 16px

**Subtítulo con link**:
- Font-size: 14px
- Color: #3B82F6
- Underline on hover
- Margin-bottom: 32px

---

### 4. TEMPLATE GALLERY

**Grid layout**:
```
Desktop:  3 columnas (300px cada una)
Tablet:   2 columnas (350px cada una)
Mobile:   1 columna (100%)
Gap:      24px
```

**Card estructura**:
```
┌──────────────────┐
│  Image (16:9)    │ ← Gradiente preview
├──────────────────┤
│ Template Name    │ ← 16px bold
│ Description      │ ← 14px gray
├──────────────────┤
│ [Use Template] ↗ │ ← Button
└──────────────────┘
```

**Card especificaciones**:
- Border-radius: 12px
- Overflow: hidden
- Background: white
- Box-shadow: 0 4px 12px rgba(0,0,0,0.08)
- Transition: all 200ms ease

**Card hover**:
- Image scale: 1.05
- Shadow: 0 12px 24px rgba(0,0,0,0.12)
- Transform: translateY(-2px)

**Image**:
- Height: 180px
- Object-fit: cover
- Background: linear-gradient()

---

### 5. PROJECTS PAGE (Empty State)

**Estructura**:
```
┌─────────────────────────────────────────────┐
│                                             │
│  ❤️  (Heart icon, large)                    │
│                                             │
│  "Start building your first project"        │
│  (36px bold, centered)                      │
│                                             │
│  "Create your first project to get started" │
│  (16px gray, centered)                      │
│                                             │
│  [Start Building]                           │
│  (Primary button, purple)                   │
│                                             │
│  3D Gradient illustration (morado)          │
│                                             │
└─────────────────────────────────────────────┘
```

---

### 6. BUTTONS - SISTEMA COMPLETO

**Primary (CTA principal)**:
```css
Background: linear-gradient(135deg, #6B5BFF, #5B4BEF)
Color: white
Padding: 12px 24px
Border-radius: 8px
Font-weight: 500
Border: none
Cursor: pointer
Transition: all 150ms ease

Hover:
  filter: brightness(1.1)
  box-shadow: 0 8px 20px rgba(107, 91, 255, 0.3)

Active:
  filter: brightness(0.95)
```

**Secondary (Outlined)**:
```css
Background: transparent
Border: 2px solid #D1D5DB
Color: #1F1F1F
Padding: 10px 22px
Border-radius: 8px
Font-weight: 500
Cursor: pointer
Transition: all 150ms ease

Hover:
  background: #F5F5F5
  border-color: #9CA3AF

Active:
  background: #EEEEEE
  border-color: #6B7280
```

**Tertiary (Ghost)**:
```css
Background: transparent
Border: none
Color: #6B7280
Padding: 8px 16px
Border-radius: 8px
Font-weight: 500
Cursor: pointer
Transition: all 150ms ease

Hover:
  background: #F5F5F5
  color: #1F2937

Active:
  background: #EEEEEE
  color: #1F1F1F
```

**Icon Button**:
```css
Background: transparent
Width: 40px
Height: 40px
Border-radius: 8px
Display: flex
Align-items: center
Justify-content: center
Cursor: pointer
Transition: all 150ms ease

Hover:
  background: #F5F5F5

Active:
  background: #EEEEEE
```

---

## 🌈 PALETA DE COLORES

### Colores Primarios (Gradiente Lovable)
```
Azul:         #4B7FFF    rgb(75, 127, 255)
Magenta:      #FF50B4    rgb(255, 80, 180)
Naranja:      #FF6B35    rgb(255, 107, 53)
Púrpura:      #6B5BFF    rgb(107, 91, 255)
```

### Colores Secundarios
```
Azul claro:   #3B82F6    rgb(59, 130, 246)
Verde:        #10B981    rgb(16, 185, 129)
Rojo:         #EF4444    rgb(239, 68, 68)
Amarillo:     #F59E0B    rgb(245, 158, 11)
```

### Grises (Neutros)
```
Muy claro:    #F8F8F8    rgb(248, 248, 248)
Claro:        #F5F5F5    rgb(245, 245, 245)
Claro-med:    #EEEEEE    rgb(238, 238, 238)
Medio:        #D1D5DB    rgb(209, 213, 219)
Med-oscuro:   #9CA3AF    rgb(156, 163, 175)
Oscuro:       #6B7280    rgb(107, 114, 128)
Muy oscuro:   #374151    rgb(55, 65, 81)
Negro:        #1F1F1F    rgb(31, 31, 31)
```

### Aplicación por elemento
```
Sidebar background:     #F3F4F6
Sidebar active:         #E5E7EB
Sidebar hover:          #F5F5F5
Main background:        #FFFFFF
Section alt bg:         #F8F8F8
Border color:           #D1D5DB
Text primary:           #1F1F1F
Text secondary:         #6B7280
Text tertiary:          #9CA3AF
Button primary:         #6B5BFF → #5B4BEF
Button secondary:       border #D1D5DB
Input background:       #FFFFFF
Input placeholder:      #9CA3AF
Link color:             #3B82F6
```

### Tailwind Config Update
```javascript
colors: {
  primary: {
    50: '#F5F3FF',
    100: '#EBE7FF',
    200: '#D5C8FF',
    300: '#BFA8FF',
    400: '#A989FF',
    500: '#8B6BFF',  // Main purple
    600: '#6B5BFF',  // Button color
    700: '#5B4BEF',  // Hover
    800: '#4B3BDF',
    900: '#3B2BCF',
  },
  gradient: {
    lovable: 'linear-gradient(135deg, #4B7FFF 0%, #FF50B4 50%, #FF6B35 100%)',
  },
}
```

---

## ✍️ SISTEMA DE TIPOGRAFÍA

### Font Stack
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 
             'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell',
             'Fira Sans', 'Droid Sans', 'Helvetica Neue',
             sans-serif;
```

### Scale

**Headings**:
```
H1: 48px (desktop) / 36px (mobile), 700, line-height 1.2
H2: 36px (desktop) / 28px (mobile), 700, line-height 1.2
H3: 28px (desktop) / 24px (mobile), 600, line-height 1.3
H4: 24px / 20px (mobile), 600, line-height 1.3
H5: 20px / 18px (mobile), 600, line-height 1.4
H6: 16px, 600, line-height 1.4
```

**Body**:
```
Body Large:  16px, 400, line-height 1.6
Body:        14px, 400, line-height 1.6
Body Small:  12px, 400, line-height 1.5
```

**UI**:
```
Label:       12px, 500, line-height 1.4
Button:      14px, 500, line-height 1.4
Caption:     12px, 400, line-height 1.5
```

---

## 🎬 ANIMACIONES

### Gradiente Hero (Infinita)
```css
@keyframes gradientShift {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

animation: gradientShift 18s ease infinite;
background-size: 200% 200%;
```

### Fade-in on Scroll
```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

animation: fadeIn 600ms ease-out;
```

### Stagger (para múltiples elementos)
```css
.fade-in-stagger:nth-child(1) { animation-delay: 0ms; }
.fade-in-stagger:nth-child(2) { animation-delay: 100ms; }
.fade-in-stagger:nth-child(3) { animation-delay: 200ms; }
.fade-in-stagger:nth-child(n+4) { animation-delay: calc(100ms * (n - 1)); }
```

### Button Hover
```css
@keyframes buttonHover {
  from {
    filter: brightness(1);
    box-shadow: 0 4px 12px rgba(107, 91, 255, 0.15);
  }
  to {
    filter: brightness(1.1);
    box-shadow: 0 8px 20px rgba(107, 91, 255, 0.3);
  }
}

button:hover {
  animation: buttonHover 150ms ease forwards;
}
```

### Input Focus
```css
@keyframes inputFocus {
  from { box-shadow: 0 0 0 0 rgba(107, 91, 255, 0.15); }
  to { box-shadow: 0 0 0 3px rgba(107, 91, 255, 0.15); }
}

input:focus {
  animation: inputFocus 200ms ease forwards;
}
```

---

## 📱 RESPONSIVE DESIGN

### Breakpoints
```javascript
mobile:    < 640px
tablet:    640px - 1023px
desktop:   1024px+

Tailwind: sm, md, lg, xl, 2xl
```

### Layout changes

**Mobile** (< 768px):
- Sidebar: Hidden drawer (hamburger toggle)
- Hero Input: 56px height
- Grid templates: 1 column
- Font sizes: -2px
- Padding: reduced 12px

**Tablet** (768px - 1366px):
- Sidebar: Visible, colapsable
- Hero Input: 64px height
- Grid templates: 2 columns
- Font sizes: -1px
- Padding: reduced 16px

**Desktop** (1366px+):
- Sidebar: Always visible 280px
- Hero Input: 72px height
- Grid templates: 3 columns
- Full font sizes
- Full padding 24px

### Navigation mobile
```
┌─────────────────────┐
│ [≡] Logo  Search👤  │ ← Top bar
├─────────────────────┤
│ [Drawer Sidebar]    │ ← Slides in from left
│                     │
└─────────────────────┘
```

---

## 🗺️ RUTAS Y NAVEGACIÓN

### Router Structure
```
/                     → Landing page (no autenticado)
/dashboard            → Home (autenticado)
/dashboard/projects   → Projects list/management
/dashboard/resources  → Templates gallery
/dashboard/search     → Search results
/settings             → Account settings
/settings/billing     → Billing & credits
/workspace/:id        → Project editor
/auth/login          → Login
/auth/signup         → Signup
```

### Sidebar Navigation
```
Home
  → /dashboard

Search
  → /dashboard/search (Ctrl+K)

Resources
  → /dashboard/resources

Integrations
  → /dashboard/integrations

Projects
  → /dashboard/projects

Settings
  → /settings

Share & Earn
  → Modal overlay

Upgrade Pro
  → /settings/billing
```

---

## 📊 IMPLEMENTACIÓN POR SPRINT

### Sprint 1: FOUNDATION (Days 1-2)
**Objetivo**: Establecer estructura base y colores

- [x] Tailwind config: nuevos colores
- [x] Componentes básicos: Button, Badge, Input
- [ ] Logo con gradiente 3D
- [ ] Sidebar component
- [ ] Layout principal (sidebar + main)

**Deliverable**: Dashboard funcional con sidebar y layout base

---

### Sprint 2: HERO & HOME (Days 3-4)
**Objetivo**: Crear home page con hero input

- [ ] Hero gradient animado
- [ ] Hero input (72px con botones)
- [ ] Home page layout
- [ ] Typewriter effect título
- [ ] Responsive home

**Deliverable**: Home page completa con hero funcional

---

### Sprint 3: TEMPLATES (Days 5-6)
**Objetivo**: Galería de templates

- [ ] Template gallery grid
- [ ] Template cards responsive
- [ ] Hover animations
- [ ] Browse all link
- [ ] Template selection flow

**Deliverable**: Templates gallery funcional

---

### Sprint 4: PROJECTS (Days 7-8)
**Objetivo**: Gestión de proyectos

- [ ] Projects page layout
- [ ] Empty state design
- [ ] Create project flow
- [ ] Projects list view
- [ ] Project actions (edit, delete, duplicate)

**Deliverable**: Projects management básico

---

### Sprint 5: RESOURCES (Days 9-10)
**Objetivo**: Página de recursos

- [ ] Resources page layout
- [ ] Template categorization
- [ ] Search/filter templates
- [ ] Use template flow
- [ ] Responsive grid

**Deliverable**: Resources section completa

---

### Sprint 6: ANIMATIONS (Days 11-12)
**Objetivo**: Pulir animaciones y transiciones

- [ ] Smooth page transitions
- [ ] Scroll animations
- [ ] Element stagger effects
- [ ] Loading states
- [ ] Micro-interactions

**Deliverable**: UI altamente polida y fluida

---

### Sprint 7: INTEGRATIONS (Days 13-14)
**Objetivo**: Conectar servicios y backend

- [ ] Integrar con API generate
- [ ] Supabase auth
- [ ] Project persistence
- [ ] Template API
- [ ] Credit system display

**Deliverable**: Stack completo integrado

---

### Sprint 8: DEPLOY & POLISH (Day 15)
**Objetivo**: Finalización y despliegue

- [ ] Testing en todos los dispositivos
- [ ] Performance optimization
- [ ] SEO checks
- [ ] Build production
- [ ] Vercel deploy

**Deliverable**: 🚀 Lovable-equivalent en producción

---

## 📝 CHECKLIST IMPLEMENTACIÓN

### UI/UX
- [ ] Sidebar con todos los items
- [ ] Hero input 72px con 4 botones
- [ ] Gradiente animado
- [ ] Template gallery 3 columnas
- [ ] Projects empty state
- [ ] Buttons primarios/secundarios
- [ ] Responsive design completo
- [ ] Animaciones suaves
- [ ] Colores exactos Lovable

### Funcionalidad
- [ ] Navegación entre páginas
- [ ] Search funcional (Ctrl+K)
- [ ] Create project flow
- [ ] Template selection
- [ ] User settings
- [ ] Billing page
- [ ] Credits display

### Integración
- [ ] API /generate conectado
- [ ] Supabase auth funcional
- [ ] Projects en base de datos
- [ ] User preferences guardadas
- [ ] Analytics eventos

### Performance
- [ ] Build size < 500KB gzipped
- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1

---

## 🚀 PRÓXIMOS PASOS

1. **Ahora**: Revisar esta especificación
2. **Luego**: Comenzar Sprint 1 (Foundation)
3. **Después**: Implementar por sprint en orden
4. **Final**: Testing y deploy a producción

**Tiempo total estimado**: 14-15 días laborales

---

**Versión**: 1.0  
**Fecha**: 2025-01-21  
**Estado**: Ready for Implementation
