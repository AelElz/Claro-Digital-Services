/*
 * Every string on the page, in one place.
 *
 * Copy is the clarodigi.com home page, translated to English. Nothing here
 * is invented: each block maps to a section of the live site.
 */

/*
 * The full-screen menu behind the burger.
 *
 * A second, flatter way through the site: the pill nav moves between chapters
 * of the home page, this moves between pages. About, Work and Insights have
 * no page yet, so they point at the path they will live at and the router
 * shows the "still being built" page, the same honest dead end the footer
 * links use.
 *
 * Declared before `nav`, because the nav's Home menu is built from it: object
 * literals are evaluated in order, so reading it the other way round would
 * hit the temporal dead zone.
 */
export const menu = {
  open: 'Open menu',
  close: 'Close menu',
  links: [
    { label: 'Home', to: '/' },
    { label: 'About', to: '/about' },
    { label: 'Work', to: '/work' },
    { label: 'Insights', to: '/insights' },
    { label: 'Contact', to: '/contact' },
  ],
  legal: [
    { label: 'Privacy Policy', to: '/legal/privacy-policy' },
    { label: 'Terms of Service', to: '/legal/terms-of-service' },
  ],
  copyright: '© Claro Digital Services SARL · 2026',
}

/*
 * The live nav carries two more entries, Blog and FAQ, which are separate
 * routes rather than home-page sections. This is a single-page build, so the
 * pill holds only what it can actually scroll to.
 */
export const nav = {
  links: [
    /*
     * `menu` turns a chapter link into a hover menu, and Home carries it: the
     * pages are the one thing the pill nav cannot otherwise reach, since
     * every other entry is a chapter of this page.
     *
     * The entries are the burger menu's own, minus Home itself, rather than a
     * second copy of the same four destinations. One list, so the two can
     * never drift apart.
     */
    { label: 'Home', href: '#home', menu: menu.links.filter((link) => link.to !== '/') },
    { label: 'The Agency', href: '#agency' },
    { label: 'Services', href: '#services' },
    { label: 'Solutions', href: '#sectors' },
    { label: 'Work', href: '#work' },
    { label: 'Clients', href: '#testimonial' },
    { label: 'Contact', href: '#contact' },
  ],
  signIn: 'Sign in',
}

export const hero = {
  eyebrow: 'Clarodigi · Morocco',
  name: 'Claro Digital',
  tagline: 'AI & development agency, Morocco.',
  subtitle:
    'Custom solutions for companies building for the long term. Development, automation, strategic support.',
  primary: 'Start a project',
  secondary: 'See our work',
  stats: [
    { value: '70', suffix: '+', label: 'Projects delivered' },
    { value: '4.8', suffix: '/5', label: 'Satisfaction' },
    { value: '12', suffix: '+', label: 'Cities in Morocco' },
  ],
}

export const formula = {
  eyebrow: 'Our formula',
  title: 'The formula for success.',
  lede: 'Every Claro engagement follows the same architecture, the one that has delivered 70+ projects without a single unreported delay.',
  steps: [
    {
      n: '01',
      title: 'Strategy',
      body: 'Before we design, we diagnose. Business model, market, objectives. We align on the vision before writing the first line of code.',
    },
    {
      n: '02',
      title: 'Design',
      body: 'Technical architecture, UX, design system. We design with precision and build what lasts, not what gets rebuilt in 18 months.',
    },
    {
      n: '03',
      title: 'Growth',
      body: 'Launch is not the end. We stay engaged: optimisation, automation, new projects. A partner that evolves with you.',
    },
  ],
}

export const services = {
  eyebrow: 'Your success starts here',
  title: 'What do you want to accomplish?',
  items: [
    {
      kicker: 'Custom Development',
      title: 'Code that performs.',
      body: 'Next.js, React, TypeScript. Applications that scale, stand the test of time and evolve with your business. Every line of code written to last.',
    },
    {
      kicker: 'Business Applications',
      title: 'The bespoke tool for your team.',
      body: 'CRM, ERP, dashboards, client portals. We build the internal tools your team will use every day, without friction and without compromise.',
    },
    {
      kicker: 'AI Transformation',
      title: 'Intelligence in the service of efficiency.',
      body: 'AI agents, automated workflows, API integrations. We industrialise your repetitive processes to free your team for high-value work.',
    },
    {
      kicker: 'Digital Transformation',
      title: 'Your business, reinvented.',
      body: 'Digital audit, positioning, brand architecture. We define the "why" before the "how", a strategic foundation before the first line of code.',
    },
  ],
  cta: 'Explore the service',
}

export const work = {
  eyebrow: 'Portfolio · 2026 view',
  title: '70+ engagements, 12 cities, 4.8/5 average.',
  lede: 'Selected engagements and the result each one delivered.',
  columnLeft: 'Selected engagements',
  columnResult: 'Result',
  items: [
    { client: 'KLIT', city: 'Casablanca', result: '4M DH in orders · 100+ restaurants' },
    { client: 'Overto', city: 'Tangier', result: '45 pages · PageSpeed 95+' },
    { client: 'Perfect Drive', city: 'Rabat', result: '4 activities digitalised · 4.9/5' },
    { client: 'Startup Olympus', city: 'Rabat', result: '50+ entrepreneurs incubated' },
    {
      client: 'Kintsugi People',
      city: 'Casablanca',
      result: '3-year partnership · integrated booking',
    },
  ],
  footnote: 'Clarodigi · since 2022 · no unreported delay',
}

export const sectors = {
  eyebrow: 'Sectors',
  title: 'We understand your sector.',
  lede: 'We have delivered across 6 sectors, with measurable results every time. Your market has its own stakes. So do our solutions.',
  stats: [
    { value: '30', suffix: '+', label: 'Projects delivered' },
    { value: '5', suffix: '/5', label: 'Client satisfaction' },
    { value: '12', suffix: '+', label: 'Cities covered' },
  ],
  items: [
    {
      name: 'Retail & E-commerce',
      title: 'Sell more, automate everything.',
      body: 'Retailers and online stores face fragmented customer journeys and time-consuming operations. Every point of friction is a lost prospect.',
      points: [
        'Shopify / WooCommerce store optimised for conversion',
        'A/B tested and personalised checkout funnel',
        'Automated orders, stock and after-sales',
      ],
      caseStudy: 'Pastaleena',
    },
    {
      name: 'Real Estate & Services',
      title: 'Turn prospects into clients.',
      body: 'Real estate and local services lose leads for want of a solid digital presence: weak visibility, no forms, manual follow-up.',
      points: [
        'Premium showcase site with strong local SEO',
        'CRM and automatic qualification forms',
        'Automated follow-up and prospect nurturing',
      ],
      caseStudy: 'R7 Immo',
    },
    {
      name: 'Restaurants & Lifestyle',
      title: 'From click to table, without friction.',
      body: 'Restaurants and lifestyle venues lack integrated systems to handle reservations, menus and customer loyalty at scale.',
      points: [
        'Interactive digital menu & online booking',
        'Automated Google review and social media management',
        'Loyalty through automated email and WhatsApp',
      ],
      caseStudy: 'Santos',
    },
    {
      name: 'Health & Wellbeing',
      title: 'Inspire trust before the first appointment.',
      body: 'Clinics, coaches and wellbeing brands need a digital presence that reassures, inspires and converts before the first contact.',
      points: [
        'Premium digital identity and complete brand book',
        'Integrated, automated online booking',
        'SEO editorial content to attract the right clients',
      ],
      caseStudy: 'Kintsugi People',
    },
    {
      name: 'Startups & Tech',
      title: 'Launch fast, scale without technical debt.',
      body: "Startups need a solid MVP, a scalable architecture and execution that doesn't trade quality for speed.",
      points: [
        'Production-ready Next.js MVP in 4 to 8 weeks',
        'Scalable, maintainable architecture from day one',
        'CI/CD automation, monitoring and alerting',
      ],
      caseStudy: 'Overto',
    },
    {
      name: 'Consulting & B2B',
      title: 'Establish your credibility online.',
      body: 'Consulting firms and B2B providers need a digital presence that reflects their level of expertise and inspires trust from the first impression.',
      points: [
        'Premium corporate site worthy of a leading firm',
        'Thought leadership content and a strategic blog',
        'B2B lead generation and nurturing automation',
      ],
      caseStudy: 'KLIT',
    },
  ],
  caseLabel: 'Case study',
  caseCta: 'View the project',
}

export const testimonial = {
  eyebrow: 'Trusted testimonials',
  title: 'What our clients say.',
  quote:
    'As the founder of Kintsugi People, my experience with Claro has been exceptional. Their team supported me with attentive listening and impeccable punctuality. I warmly recommend their services to any entrepreneur looking to bring their digital vision to life.',
  author: 'Asmaa Niang',
  role: 'Founder, Kintsugi People',
  metric: '5 weeks',
  metricLabel: 'Premium digital identity delivered on time',
  cta: 'Read the case study',
  shotAlt: 'The Kintsugi People home page, built by Claro Digital',
  shotCursor: 'See page',
  /* The live client site, so it opens in a new tab. */
  shotHref: 'https://kintsugi-people.com/',
}

export const contact = {
  eyebrow: 'Booking calls for the coming weeks',
  display: "Let's begin.",
  title: ['Ready to build', 'something', 'that lasts?'],
  body: 'Let’s talk about your project. We reply in under 24 hours and build partnerships that last.',
  cta: 'Start a project',
  email: 'contact@clarodigi.com',
  ticker: ['70+ projects delivered', '★ Clarodigi · Morocco ★', '4.8/5 on Google'],
}

/*
 * Turns a label into the path its page would live at. Most of these pages do
 * not exist yet, which is the point: the link carries an honest destination
 * and the router shows the "still being built" page, instead of every dead
 * link quietly dumping the visitor on the contact section.
 */
export const slug = (label) =>
  label
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

/*
 * The /sign-in page.
 *
 * This is a front-end prototype: there is no backend, so there is no real
 * authentication behind it and nothing it can verify. The notice is part of
 * the page on purpose, so nobody types a password they use elsewhere into a
 * form that cannot protect it.
 */
export const auth = {
  eyebrow: 'Account',
  signIn: {
    title: 'Welcome back.',
    lede: 'Sign in to follow your project, review deliverables and message the team.',
    submit: 'Sign in',
    switchPrompt: 'New here?',
    switchAction: 'Create an account',
  },
  signUp: {
    title: 'Create your account.',
    lede: 'One account for your brief, your files and every project you run with us.',
    submit: 'Create account',
    switchPrompt: 'Already have an account?',
    switchAction: 'Sign in',
  },
  labels: {
    name: 'Full name',
    email: 'Email',
    password: 'Password',
    confirm: 'Confirm password',
    show: 'Show password',
    hide: 'Hide password',
    forgot: 'Forgot your password?',
    remember: 'Keep me signed in',
    strength: 'Password strength',
    capsLock: 'Caps Lock is on',
  },
  placeholders: {
    name: 'Youssef El Amrani',
    email: 'you@example.com',
    password: 'At least 8 characters',
  },
  errors: {
    name: 'Please enter your name.',
    email: 'Enter a valid email address.',
    passwordShort: 'Use at least 8 characters.',
    passwordCommon: 'That password is too easy to guess.',
    confirm: 'The two passwords do not match.',
  },
  strengthLabels: ['Very weak', 'Weak', 'Fair', 'Strong', 'Very strong'],
  notice: {
    title: 'Prototype, not a real account system',
    body: 'This page has no server behind it, so nothing can be verified, saved or kept private. Please do not enter a password you use anywhere else.',
  },
  demoResult: 'The form is valid. There is no backend connected, so nothing was sent and your password was not stored.',
}

/* The /method page, taken from clarodigi.com/en/method (already English). */
export const method = {
  eyebrow: 'Our method',
  title: 'How we work.',
  lede: 'A rigorous 4-phase approach, tested on 70+ projects, that ensures the success of every collaboration.',
  deliverablesLabel: 'Deliverables',
  phases: [
    {
      n: '01',
      title: 'Discovery & Diagnosis',
      body: 'Before writing a single line of code, we understand your business. Audit of existing systems, needs analysis, KPI definition, and mapping of processes to optimize.',
      deliverables: ['Digital audit report', 'Functional brief', 'Detailed proposal'],
    },
    {
      n: '02',
      title: 'Architecture & Design',
      body: 'Every solution is architected for long-term performance. UX research, validated wireframes, and tech stack chosen for scalability and maintainability.',
      deliverables: ['UX/UI mockups', 'Technical architecture', 'Development roadmap'],
    },
    {
      n: '03',
      title: 'Development & Testing',
      body: 'Agile development with weekly check-ins, continuous testing, and incremental deliverables. You see the project take shape at every sprint.',
      deliverables: ['Bi-weekly sprints', 'Automated tests', 'Regular demos'],
    },
    {
      n: '04',
      title: 'Deployment & Support',
      body: "Smooth production launch, team training, and post-launch support. We don't disappear after delivery.",
      deliverables: ['Zero-downtime deployment', 'Team training', 'Ongoing support'],
    },
  ],
  principlesTitle: 'Our principles',
  principles: [
    {
      title: 'Full transparency',
      body: 'Complete access to progress, source code, and real-time KPIs.',
    },
    {
      title: 'Results-driven',
      body: 'Every technical decision is guided by business impact, not technology for its own sake.',
    },
    {
      title: 'Direct collaboration',
      body: 'You work directly with developers. No middlemen, no information loss.',
    },
    {
      title: 'Quality without compromise',
      body: 'Rigorous testing, systematic code review, performance optimized from day one.',
    },
  ],
  stats: [
    { value: '70', suffix: '+', label: 'Projects' },
    { value: '100', suffix: '%', label: 'Satisfaction' },
    { value: '3', suffix: '+', label: 'Years' },
  ],
  ctaTitle: 'Ready to start?',
  ctaBody: "Let's meet and understand your challenge. Free audit delivered within 48h.",
  ctaPrimary: 'Start a project',
  ctaSecondary: 'Case studies',
}

/*
 * Shown for any route that has no page yet, instead of quietly dumping the
 * visitor back on the contact section as if the link had worked.
 */
/*
 * The /about page.
 *
 * Every number here is one the home page already claims, so the two cannot
 * drift apart: 70+ engagements, 4.8/5, 12 cities, founded 2022, Tangier.
 * Nothing is invented, and there are no named people, because we have no
 * roster to put behind the names.
 */
export const about = {
  eyebrow: 'About us',
  title: 'A studio built for the long term.',
  lede: 'Claro is an AI and development agency in Tangier. We build the software companies actually run on: custom applications, internal tools, automated workflows. Not demos, not prototypes that quietly get rebuilt in eighteen months.',

  stage: {
    eyebrow: 'What we do',
    title: 'Tell us what you need.',
    lede: 'Most engagements start as a sentence. Ours start as a conversation about what that sentence is really asking for.',
    /*
     * Typed one after another in the prompt bar. Written to sound like the
     * briefs we actually receive, not like feature bullets.
     */
    prompts: [
      'we got everything you need',
      'build me a booking platform',
      'automate my back office',
      'put an AI agent on my support inbox',
      'make the whole thing load faster',
    ],
  },

  story: {
    eyebrow: 'Where we come from',
    title: 'Our story',
    paragraphs: [
      'Claro started in 2022 with one conviction: most software fails long before anyone writes a line of code. It fails in the brief, where nobody agreed what success looked like.',
      'So we put the diagnosis first. Business model, market, objective, constraint. Only then do we design, and only then do we build. It takes longer to start and far less time to finish.',
      'Seventy engagements later, across twelve cities, that order has not changed. Neither has the rule we hold ourselves to: no delay goes unreported.',
    ],
  },

  principles: {
    eyebrow: 'How we work',
    title: 'Four things we will not trade away.',
    items: [
      {
        n: '01',
        title: 'Diagnosis before design',
        body: 'We ask what the business needs before we ask what the screen should look like. The brief is where projects are won or lost.',
      },
      {
        n: '02',
        title: 'Built to be handed over',
        body: 'Your code is readable, documented and yours. No lock-in, no black box, nothing that only we know how to run.',
      },
      {
        n: '03',
        title: 'AI where it earns its place',
        body: 'Agents and automation for the repetitive work that drains a team. Not as a label on the invoice.',
      },
      {
        n: '04',
        title: 'Say it early',
        body: 'If something slips, you hear it from us the day we know. That single habit is why the number below is what it is.',
      },
    ],
  },

  stats: [
    { value: '70', suffix: '+', label: 'Engagements delivered' },
    { value: '4.8', suffix: '/5', label: 'Client satisfaction' },
    { value: '12', suffix: '+', label: 'Cities in Morocco' },
    { value: '2022', suffix: '', label: 'Building since' },
  ],

  cta: {
    title: 'Have a project in mind?',
    body: 'Tell us what you are trying to build. We will tell you what it really takes, before you commit to anything.',
    action: 'Start a project',
    secondary: 'See our method',
  },
}

export const notFound = {
  eyebrow: '404',
  title: 'This one is still being built.',
  body: "We haven't finished this page yet. Everything else is live, so have a look around, or tell us what you were after and we'll point you at it.",
  pathLabel: 'You asked for',
  home: 'Back to home',
  contact: 'Start a project',
}

/* The /contact page, translated from clarodigi.com/contact. */
export const contactPage = {
  eyebrow: 'Contact',
  title: "Let's start your project.",
  lede: 'Describe what you need and we reply within 24 hours.',
  fields: [
    {
      name: 'name',
      label: 'Name',
      type: 'text',
      placeholder: 'Youssef El Amrani',
      required: true,
      max: 80,
      autoComplete: 'name',
    },
    {
      name: 'company',
      label: 'Company',
      type: 'text',
      placeholder: 'Acme SARL',
      max: 80,
      autoComplete: 'organization',
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      placeholder: 'you@example.com',
      required: true,
      /* 254 is the longest address RFC 5321 permits. */
      max: 254,
      autoComplete: 'email',
    },
    {
      name: 'phone',
      label: 'Phone',
      type: 'tel',
      placeholder: '+212 6XX XXX XXX',
      max: 32,
      autoComplete: 'tel',
    },
    {
      name: 'service',
      label: 'Service',
      type: 'select',
      options: [
        'Choose a service',
        'Custom development',
        'Business applications',
        'AI transformation',
        'Digital transformation',
      ],
    },
    {
      name: 'source',
      label: 'How did you hear about us?',
      type: 'select',
      required: true,
      options: [
        'Choose an option',
        'Google search',
        'An article on your blog',
        'LinkedIn',
        'Instagram',
        'Referral or word of mouth',
        'Online advertising',
        'Other',
      ],
    },
    {
      name: 'budget',
      label: 'Budget for the project',
      type: 'text',
      placeholder: 'e.g. 20,000 - 50,000 MAD',
      max: 60,
    },
    {
      name: 'project',
      label: 'Describe your project',
      type: 'textarea',
      placeholder: 'Describe your project, your goals, your timeline...',
      required: true,
      max: 2000,
    },
  ],
  submit: 'Send',
  emailLabel: 'Email',
  email: 'contact@clarodigi.com',
  addressLabel: 'Address',
  address: 'Tangier, Morocco',
  phoneLabel: 'Phone',
  phone: '+212 715-659-190',
  back: 'Back to home',
}

export const footer = {
  blurb: 'Our team of talented developers is here to turn your ideas into reality.',
  columns: [
    {
      title: 'Our services',
      links: [
        'Custom Development',
        'Business Applications',
        'AI Transformation',
        'Digital Transformation',
        'Digital Consulting',
        'Change Management',
        'FAQ',
      ],
    },
    {
      title: 'Artificial intelligence',
      links: [
        'AI Chatbot',
        'AI Agents',
        'RAG & Knowledge Bases',
        'Generative AI',
        'AI Agency Morocco',
        'AI Agency Casablanca',
        'AI Agency Rabat',
        'AI Agency Tangier',
      ],
    },
  ],
  contactTitle: 'Contact',
  phone: '+212 715-659-190',
  email: 'contact@clarodigi.com',
  address: 'Boulevard Mohammed V, Tanger 90000',
  contactCta: 'Contact Us',
  legal: '© Claro Digital Services SARL · 2026 · Clarodigi · est. 2022 · Tangier',
  legalLinks: ['Privacy Policy', 'Legal Notice'],
}
