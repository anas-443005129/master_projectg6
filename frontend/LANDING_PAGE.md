# DevOps AI - Landing Page

## 🎨 Design Overview

A premium, modern landing page for a DevOps AI Agent featuring:

### Visual Features

- **Glassmorphism Design**: Frosted glass effects with backdrop blur
- **MongoDB-Inspired Green Theme**: Custom green color palette (`hsl(142 76% 45%)`)
- **Animated Gradients**: Flowing background gradients and borders
- **Micro-interactions**: Hover lifts, scale animations, pulse effects
- **Glow Effects**: Ambient lighting and shadows on key elements

### Sections

1. **Hero Section**

   - Video background with demo playback
   - Animated floating cards showing deployment success
   - Stats showcase (10k+ users, 99.9% uptime)
   - Primary and secondary CTAs

2. **Features Grid**

   - 9 feature cards with icons
   - Hover animations and glass effects
   - Covers: Deployments, Git Ops, Security, Performance, Multi-Cloud, etc.

3. **How It Works**

   - 4-step process walkthrough
   - Large images with gradient overlays
   - Alternating layout for visual interest

4. **Use Cases**

   - 6 specialized use case cards
   - Each with unique gradient color scheme
   - Expandable benefits lists

5. **Testimonials**

   - 6 customer testimonials
   - Avatar images with ratings
   - Glass card styling

6. **Call-to-Action**

   - Prominent final CTA section
   - Trust indicators (AWS, Google Cloud, Azure logos)
   - Multiple conversion paths

7. **Footer**
   - Comprehensive link structure
   - Social media integration
   - Newsletter signup

## 🚀 Route Structure

```
/                    → Landing page (default)
/login               → Authentication
/register            → Sign up
/chat                → Main chat application (after auth)
```

## 🎬 Assets Used

### Images

- `/images/devops-1.png` - Step 1: Connect Repository
- `/images/devops-2.png` - Step 2: Configure Pipeline
- `/images/devops-3.png` - Step 3: Deploy
- `/images/devops-4.png` - Step 4: Monitor
- `/images/demo-thumbnail.png` - Video poster image

### Video

- `/images/devops-video.mp4` - Hero section demo video

## 🎨 Design System

### Colors

- **Primary**: `hsl(142 76% 45%)` (MongoDB Green)
- **Background Light**: `hsl(120 20% 98%)`
- **Background Dark**: `hsl(160 20% 8%)`

### Utility Classes (from globals.css)

- `.glass` / `.glass-dark` - Glassmorphism effects
- `.glass-card` / `.glass-card-dark` - Card glassmorphism
- `.gradient-primary` - Green gradient background
- `.text-gradient` - Gradient text effect
- `.hover-lift` - Hover elevation animation
- `.glow-green` / `.glow-green-lg` - Glow shadows
- `.animated-border` - Rotating gradient border
- `.pulse-glow` - Pulsing glow animation
- `.shimmer` - Shimmer overlay effect

## 🔧 Components

### Landing Components

- `navbar.tsx` - Sticky navigation with mobile menu
- `hero.tsx` - Hero section with video and stats
- `features.tsx` - Features grid
- `how-it-works.tsx` - Step-by-step process
- `use-cases.tsx` - Use case cards
- `testimonials.tsx` - Customer testimonials
- `cta.tsx` - Final call-to-action
- `footer.tsx` - Footer with links
- `scroll-to-top.tsx` - Animated scroll button

## 📱 Responsive Design

All components are fully responsive:

- **Mobile**: Single column, stacked elements
- **Tablet**: 2-column grids
- **Desktop**: 3-column grids, side-by-side layouts

## ⚡ Performance Features

- **Framer Motion**: Smooth scroll animations
- **Lazy Loading**: Images load on scroll
- **Video Optimization**: Autoplay with poster image
- **Glass Effects**: Hardware-accelerated transforms

## 🎯 Key Interactions

1. **Smooth Scroll**: Navigation links smoothly scroll to sections
2. **Hover Effects**: Cards lift and glow on hover
3. **Animated Entrance**: Sections fade in as you scroll
4. **Video Autoplay**: Hero video plays automatically (muted)
5. **Floating Elements**: Cards float with parallax effect

## 🚀 Getting Started

The landing page is the default route (`/`) and will be shown to all visitors before authentication.

To view:

```bash
cd frontend
pnpm run dev
```

Then visit `http://localhost:3000`

## 🎨 Customization

To customize:

1. **Copy**: Update copy in each component file
2. **Images**: Replace images in `/public/images/`
3. **Colors**: Modify theme in `/app/globals.css`
4. **Sections**: Add/remove sections in `/app/(landing)/page.tsx`

## 📊 Mock Day Ready

This landing page is designed to impress for your mock day presentation:

- Premium visual design that stands out
- Professional animations and interactions
- Clear value proposition
- Social proof and trust indicators
- Mobile-optimized for demo on any device
