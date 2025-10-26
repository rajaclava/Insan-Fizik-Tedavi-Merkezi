# Design Guidelines - İnsan Fizik Tedavi ve Rehabilitasyon Merkezi

## Design Approach
**Selected Approach:** Healthcare reference-based design inspired by modern medical platforms with trust-building aesthetics. Drawing from leading healthcare providers like Mayo Clinic's clarity, Cleveland Clinic's professionalism, and modern wellness platforms' warmth.

**Core Principles:**
- Trust and professionalism through clean layouts
- Accessibility for all age groups (large touch targets, readable text)
- Calming, reassuring visual atmosphere
- Quick path to action (call, WhatsApp, appointment)

## Color System (User-Specified)
- Primary: Açık Mavi (#3cb3d9) - CTAs, accents, links
- Background: Beyaz (#ffffff) - main backgrounds, cards
- Dark: Koyu Lacivert (#0e2240) - headers, text, footers
- Supporting: Light blue tints (#e8f7fc), gray neutrals (#f8f9fa)

## Typography
**Font Families:** Poppins (primary) via Google Fonts CDN
- Headings: Poppins SemiBold (600) - professional yet approachable
- Body: Poppins Regular (400) - excellent readability
- Accents: Poppins Medium (500) - buttons, labels

**Scale:**
- Hero H1: text-5xl lg:text-6xl (48-60px) - commanding presence
- Section H2: text-3xl lg:text-4xl (36-48px) - clear hierarchy
- Card H3: text-xl lg:text-2xl (24-30px) - scannable
- Body: text-base lg:text-lg (16-18px) - comfortable reading
- Small: text-sm (14px) - meta info, captions

## Layout System
**Spacing Units:** Tailwind's 4, 6, 8, 12, 16, 20, 24 for consistent rhythm
- Section padding: py-16 lg:py-24 (generous breathing room)
- Card padding: p-6 lg:p-8
- Element gaps: gap-4 to gap-8
- Container: max-w-7xl mx-auto px-4 lg:px-8

**Grid Patterns:**
- Services: 3-column grid (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
- Team: 4-column grid (lg:grid-cols-4) with photo emphasis
- Testimonials: 2-column alternating layout
- Mobile: Always single column for clarity

## Component Library

### Navigation
- Sticky header with subtle shadow on scroll
- Logo left, navigation center, CTA buttons right
- Mobile: Hamburger menu with full-screen overlay
- WhatsApp and phone icons always visible in header

### Hero Section
- Full-width background image (physiotherapy session, bright clinical setting)
- Overlay: gradient from transparent to dark (#0e2240 at 40% opacity)
- Centered content with max-w-4xl
- Large heading + supporting text + dual CTAs (Call + WhatsApp)
- Minimum height: h-[600px] lg:h-[700px]
- Buttons with backdrop-blur-sm bg-white/10 treatment

### Service Cards
- White background with subtle shadow (shadow-md hover:shadow-xl)
- Image at top (aspect-ratio-16/9, rounded-t-xl)
- Icon overlay on image (medical icons from Font Awesome)
- Title, 150-200 word description, WhatsApp CTA
- Smooth hover lift: transition-transform hover:-translate-y-1

### Team Member Cards
- Circular professional photos (w-48 h-48, rounded-full)
- Name in Poppins SemiBold, title in Medium
- Brief bio text (100 words)
- Clean white background with border

### Testimonial Cards
- Quoted text in larger font (text-lg)
- Patient name and treatment type below
- Subtle left border accent (border-l-4 border-blue-400)
- Light background (#f8f9fa)

### Contact Form
- Large input fields (h-12, text-lg) for accessibility
- Floating labels or clear placeholder text
- Primary button with full-width on mobile
- Form validation states with color feedback

### Footer
- Dark background (#0e2240) with white text
- 4-column layout: About, Quick Links, Services, Contact
- Social media icons (Instagram, Facebook, YouTube) with hover glow
- Address, phone, WhatsApp prominently displayed

### Floating Elements
- Fixed WhatsApp button: bottom-6 right-6, large (w-16 h-16)
- Green (#25D366) with white icon, subtle pulse animation
- Click-to-call phone button on mobile: sticky bottom bar

## Page-Specific Layouts

### Ana Sayfa (Homepage)
1. Hero with large image + dual CTAs
2. About preview (2-column: text + image, py-20)
3. Services grid (3-4 cards, py-20)
4. Statistics/achievements (4-column numbers, bg-blue-50, py-16)
5. Team preview (3 members, py-20)
6. Testimonials (2-column alternating, py-20)
7. Location + contact (Google Maps embed + info, py-20)

### Hizmetler (Services)
- Service detail pages: hero image + comprehensive description
- Related services sidebar
- Appointment CTA throughout content

### Blog
- Card grid with featured image, title, excerpt, read time
- Category filters as pills
- Featured post at top (larger card)

### İletişim (Contact)
- Split layout: Form left (60%), Info + Map right (40%)
- Working hours clearly displayed
- Emergency contact highlighted

## Images
**Required Images:**
1. **Hero Image:** Professional physiotherapist with patient, bright clinical environment, warm interaction (1920x800px minimum)
2. **Service Cards:** Each service gets dedicated image (manual therapy hands, exercise equipment, treatment room)
3. **Team Photos:** Circular headshots in clinical setting, professional attire
4. **About Section:** Clinic interior, modern equipment, welcoming space
5. **Blog:** Relevant stock photos for each article topic

**Image Treatment:**
- Slight gradient overlays for text readability
- Rounded corners (rounded-xl) for consistency
- Lazy loading for performance
- WebP format with JPEG fallbacks

## Interaction Design
- Smooth scroll behavior (scroll-smooth)
- Subtle hover effects on all clickable elements
- Form field focus states with border-blue-400
- Mobile: Larger touch targets (min 44x44px)
- Page transitions: fade-in content on scroll (use Intersection Observer)

## Accessibility
- ARIA labels on all interactive elements
- Keyboard navigation support
- High contrast ratios (WCAG AA minimum)
- Alt text on all images describing medical context
- Form labels always visible
- Focus indicators clearly visible

## Responsive Breakpoints
- Mobile: 320px - 768px (stack everything)
- Tablet: 768px - 1024px (2-column grids)
- Desktop: 1024px+ (full multi-column layouts)