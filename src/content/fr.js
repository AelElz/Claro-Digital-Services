/*
 * Every French string on the page.
 *
 * This is the twin of `en.js` and must keep exactly the same shape: same
 * keys, same array lengths, same object fields. A key that exists on one side
 * and not the other renders `undefined` in the other language, and nothing
 * warns you: the page simply loses a line of copy.
 *
 * Two things deliberately do NOT translate:
 *
 *   `to:` paths     Routes are locale-independent. /about stays /about in
 *                   both, because the router matches on the path and there
 *                   is no /a-propos to match. The label is what changes.
 *   proper nouns    Client and case-study names are used to build /work/…
 *                   slugs, so KLIT, Overto, Pastaleena and the rest are the
 *                   same string in both files and both resolve to the same
 *                   URL whichever language you are reading in.
 *
 * French punctuation takes a non-breaking space before `? ! : ;`, written as
 * ` ` rather than as the character itself. The escape is visible in the
 * source; the character is not, and an invisible space is the kind of thing
 * that gets deleted by accident and never noticed. It matters because a
 * normal space lets a line break leave the `?` stranded on its own line.
 */

const menu = {
  open: 'Ouvrir le menu',
  close: 'Fermer le menu',
  language: 'Langue',
  links: [
    { label: 'Accueil', to: '/' },
    { label: 'À propos', to: '/about' },
    { label: 'Réalisations', to: '/work' },
    { label: 'Insights', to: '/insights' },
    { label: 'Contact', to: '/contact' },
  ],
  legal: [
    { label: 'Politique de confidentialité', to: '/legal/privacy-policy' },
    { label: 'Conditions d’utilisation', to: '/legal/terms-of-service' },
  ],
  copyright: '© Claro Digital Services SARL · 2026',
}

const nav = {
  links: [
    { label: 'Accueil', href: '#home', menu: menu.links.filter((link) => link.to !== '/') },
    { label: 'L’agence', href: '#agency' },
    { label: 'Services', href: '#services' },
    { label: 'Solutions', href: '#sectors' },
    { label: 'Réalisations', href: '#work' },
    { label: 'Clients', href: '#testimonial' },
    { label: 'Contact', href: '#contact' },
  ],
  signIn: 'Connexion',
}

const hero = {
  eyebrow: 'Clarodigi · Maroc',
  /* Split on the space for the word-by-word reveal, so it stays two words. */
  name: 'Claro Digital',
  tagline: 'Agence IA et développement, Maroc.',
  subtitle:
    'Des solutions sur mesure pour les entreprises qui construisent sur le long terme. Développement, automatisation, accompagnement stratégique.',
  primary: 'Démarrer un projet',
  secondary: 'Voir nos réalisations',
  stats: [
    { value: '70', suffix: '+', label: 'Projets livrés' },
    { value: '4,8', suffix: '/5', label: 'Satisfaction' },
    { value: '12', suffix: '+', label: 'Villes au Maroc' },
  ],
}

const formula = {
  eyebrow: 'Notre formule',
  title: 'La formule du succès.',
  lede: 'Chaque mission Claro suit la même architecture, celle qui a permis de livrer plus de 70 projets sans un seul retard non signalé.',
  steps: [
    {
      n: '01',
      title: 'Stratégie',
      body: 'Avant de concevoir, nous diagnostiquons. Modèle économique, marché, objectifs. Nous nous alignons sur la vision avant d’écrire la première ligne de code.',
    },
    {
      n: '02',
      title: 'Conception',
      body: 'Architecture technique, UX, design system. Nous concevons avec précision et construisons ce qui dure, pas ce qui sera reconstruit dans 18 mois.',
    },
    {
      n: '03',
      title: 'Croissance',
      body: 'Le lancement n’est pas la fin. Nous restons engagés\u00A0: optimisation, automatisation, nouveaux projets. Un partenaire qui évolue avec vous.',
    },
  ],
}

const services = {
  eyebrow: 'Votre réussite commence ici',
  title: 'Que voulez-vous accomplir\u00A0?',
  items: [
    {
      kicker: 'Développement sur mesure',
      title: 'Du code qui performe.',
      body: 'Next.js, React, TypeScript. Des applications qui montent en charge, résistent au temps et évoluent avec votre activité. Chaque ligne de code écrite pour durer.',
    },
    {
      kicker: 'Applications métier',
      title: 'L’outil sur mesure de votre équipe.',
      body: 'CRM, ERP, tableaux de bord, portails clients. Nous construisons les outils internes que votre équipe utilisera chaque jour, sans friction et sans compromis.',
    },
    {
      kicker: 'Transformation IA',
      title: 'L’intelligence au service de l’efficacité.',
      body: 'Agents IA, workflows automatisés, intégrations API. Nous industrialisons vos processus répétitifs pour libérer votre équipe sur les tâches à forte valeur.',
    },
    {
      kicker: 'Transformation digitale',
      title: 'Votre activité, réinventée.',
      body: 'Audit digital, positionnement, architecture de marque. Nous définissons le « pourquoi » avant le « comment », une base stratégique avant la première ligne de code.',
    },
  ],
  cta: 'Explorer le service',
}

const work = {
  eyebrow: 'Portfolio · vue 2026',
  title: '70+ missions, 12 villes, 4,8/5 de moyenne.',
  lede: 'Une sélection de missions et le résultat obtenu pour chacune.',
  columnLeft: 'Missions sélectionnées',
  columnResult: 'Résultat',
  items: [
    { client: 'KLIT', city: 'Casablanca', result: '4 M DH de commandes · 100+ restaurants' },
    { client: 'Overto', city: 'Tanger', result: '45 pages · PageSpeed 95+' },
    { client: 'Perfect Drive', city: 'Rabat', result: '4 activités digitalisées · 4,9/5' },
    { client: 'Startup Olympus', city: 'Rabat', result: '50+ entrepreneurs incubés' },
    {
      client: 'Kintsugi People',
      city: 'Casablanca',
      result: 'Partenariat de 3 ans · réservation intégrée',
    },
  ],
  footnote: 'Clarodigi · depuis 2022 · aucun retard non signalé',
}

const sectors = {
  eyebrow: 'Secteurs',
  title: 'Nous comprenons votre secteur.',
  lede: 'Nous avons livré dans 6 secteurs, avec des résultats mesurables à chaque fois. Votre marché a ses propres enjeux. Nos solutions aussi.',
  stats: [
    { value: '30', suffix: '+', label: 'Projets livrés' },
    { value: '5', suffix: '/5', label: 'Satisfaction client' },
    { value: '12', suffix: '+', label: 'Villes couvertes' },
  ],
  items: [
    {
      name: 'Retail & E-commerce',
      title: 'Vendez plus, automatisez tout.',
      body: 'Les commerçants et les boutiques en ligne font face à des parcours clients fragmentés et à des opérations chronophages. Chaque point de friction est un prospect perdu.',
      points: [
        'Boutique Shopify / WooCommerce optimisée pour la conversion',
        'Tunnel de commande testé en A/B et personnalisé',
        'Commandes, stocks et service après-vente automatisés',
      ],
      caseStudy: 'Pastaleena',
    },
    {
      name: 'Immobilier & Services',
      title: 'Transformez vos prospects en clients.',
      body: 'L’immobilier et les services de proximité perdent des leads faute d’une présence digitale solide\u00A0: visibilité faible, aucun formulaire, relance manuelle.',
      points: [
        'Site vitrine premium avec un référencement local solide',
        'CRM et formulaires de qualification automatique',
        'Relance et nurturing des prospects automatisés',
      ],
      caseStudy: 'R7 Immo',
    },
    {
      name: 'Restaurants & Lifestyle',
      title: 'Du clic à la table, sans friction.',
      body: 'Les restaurants et les lieux lifestyle manquent de systèmes intégrés pour gérer les réservations, les menus et la fidélisation à grande échelle.',
      points: [
        'Menu digital interactif et réservation en ligne',
        'Gestion automatisée des avis Google et des réseaux sociaux',
        'Fidélisation par email et WhatsApp automatisés',
      ],
      caseStudy: 'Santos',
    },
    {
      name: 'Santé & Bien-être',
      title: 'Inspirez confiance avant le premier rendez-vous.',
      body: 'Les cliniques, les coachs et les marques de bien-être ont besoin d’une présence digitale qui rassure, inspire et convertit avant le premier contact.',
      points: [
        'Identité digitale premium et charte de marque complète',
        'Réservation en ligne intégrée et automatisée',
        'Contenu éditorial SEO pour attirer les bons clients',
      ],
      caseStudy: 'Kintsugi People',
    },
    {
      name: 'Startups & Tech',
      title: 'Lancez vite, montez en charge sans dette technique.',
      body: 'Les startups ont besoin d’un MVP solide, d’une architecture évolutive et d’une exécution qui ne sacrifie pas la qualité à la vitesse.',
      points: [
        'MVP Next.js prêt pour la production en 4 à 8 semaines',
        'Architecture évolutive et maintenable dès le premier jour',
        'Automatisation CI/CD, monitoring et alerting',
      ],
      caseStudy: 'Overto',
    },
    {
      name: 'Conseil & B2B',
      title: 'Installez votre crédibilité en ligne.',
      body: 'Les cabinets de conseil et les prestataires B2B ont besoin d’une présence digitale à la hauteur de leur expertise, qui inspire confiance dès la première impression.',
      points: [
        'Site corporate premium digne d’un cabinet de référence',
        'Contenu de thought leadership et blog stratégique',
        'Génération de leads B2B et automatisation du nurturing',
      ],
      caseStudy: 'KLIT',
    },
  ],
  caseLabel: 'Étude de cas',
  caseCta: 'Voir le projet',
}

const testimonial = {
  eyebrow: 'Ils nous font confiance',
  title: 'Ce que disent nos clients.',
  quote:
    'En tant que fondatrice de Kintsugi People, mon expérience avec Claro a été exceptionnelle. Leur équipe m’a accompagnée avec une écoute attentive et une ponctualité irréprochable. Je recommande chaleureusement leurs services à tout entrepreneur qui souhaite donner vie à sa vision digitale.',
  author: 'Asmaa Niang',
  role: 'Fondatrice, Kintsugi People',
  metric: '5 semaines',
  metricLabel: 'Identité digitale premium livrée dans les délais',
  cta: 'Lire l’étude de cas',
  shotAlt: 'La page d’accueil de Kintsugi People, réalisée par Claro Digital',
  shotCursor: 'Voir la page',
  shotHref: 'https://kintsugi-people.com/',
}

const contact = {
  eyebrow: 'Rendez-vous ouverts pour les prochaines semaines',
  display: 'Commençons.',
  title: ['Prêt à construire', 'quelque chose', 'qui dure\u00A0?'],
  body: 'Parlons de votre projet. Nous répondons en moins de 24 heures et construisons des partenariats qui durent.',
  cta: 'Démarrer un projet',
  email: 'contact@clarodigi.com',
  ticker: ['70+ projets livrés', '★ Clarodigi · Maroc ★', '4,8/5 sur Google'],
}

const auth = {
  eyebrow: 'Compte',
  signIn: {
    title: 'Content de vous revoir.',
    lede: 'Connectez-vous pour suivre votre projet, consulter les livrables et échanger avec l’équipe.',
    submit: 'Se connecter',
    switchPrompt: 'Nouveau ici\u00A0?',
    switchAction: 'Créer un compte',
  },
  signUp: {
    title: 'Créez votre compte.',
    lede: 'Un seul compte pour votre brief, vos fichiers et chaque projet mené avec nous.',
    submit: 'Créer le compte',
    switchPrompt: 'Vous avez déjà un compte\u00A0?',
    switchAction: 'Se connecter',
  },
  labels: {
    name: 'Nom complet',
    email: 'Email',
    password: 'Mot de passe',
    confirm: 'Confirmer le mot de passe',
    show: 'Afficher le mot de passe',
    hide: 'Masquer le mot de passe',
    forgot: 'Mot de passe oublié\u00A0?',
    remember: 'Rester connecté',
    strength: 'Force du mot de passe',
    capsLock: 'La touche Verr. Maj est activée',
  },
  placeholders: {
    name: 'Youssef El Amrani',
    email: 'vous@exemple.com',
    password: 'Au moins 8 caractères',
  },
  errors: {
    name: 'Veuillez saisir votre nom.',
    email: 'Saisissez une adresse email valide.',
    passwordShort: 'Utilisez au moins 8 caractères.',
    passwordCommon: 'Ce mot de passe est trop facile à deviner.',
    confirm: 'Les deux mots de passe ne correspondent pas.',
  },
  strengthLabels: ['Très faible', 'Faible', 'Moyen', 'Fort', 'Très fort'],
  notice: {
    title: 'Un prototype, pas un vrai système de comptes',
    body: 'Cette page n’a aucun serveur derrière elle\u00A0: rien ne peut être vérifié, enregistré ni gardé confidentiel. N’y saisissez pas un mot de passe dont vous vous servez ailleurs.',
  },
  demoResult:
    'Le formulaire est valide. Aucun backend n’est connecté\u00A0: rien n’a été envoyé et votre mot de passe n’a pas été stocké.',
}

const method = {
  eyebrow: 'Notre méthode',
  title: 'Notre façon de travailler.',
  lede: 'Une approche rigoureuse en 4 phases, éprouvée sur plus de 70 projets, qui assure la réussite de chaque collaboration.',
  deliverablesLabel: 'Livrables',
  phases: [
    {
      n: '01',
      title: 'Découverte & diagnostic',
      body: 'Avant d’écrire la moindre ligne de code, nous comprenons votre activité. Audit de l’existant, analyse des besoins, définition des KPI et cartographie des processus à optimiser.',
      deliverables: ['Rapport d’audit digital', 'Brief fonctionnel', 'Proposition détaillée'],
    },
    {
      n: '02',
      title: 'Architecture & conception',
      body: 'Chaque solution est architecturée pour performer sur la durée. Recherche UX, wireframes validés et stack technique choisie pour son évolutivité et sa maintenabilité.',
      deliverables: [
        'Maquettes UX/UI',
        'Architecture technique',
        'Feuille de route de développement',
      ],
    },
    {
      n: '03',
      title: 'Développement & tests',
      body: 'Développement agile avec des points hebdomadaires, des tests continus et des livraisons incrémentales. Vous voyez le projet prendre forme à chaque sprint.',
      deliverables: ['Sprints de deux semaines', 'Tests automatisés', 'Démos régulières'],
    },
    {
      n: '04',
      title: 'Déploiement & support',
      body: 'Mise en production sans accroc, formation de vos équipes et accompagnement après le lancement. Nous ne disparaissons pas à la livraison.',
      deliverables: ['Déploiement sans interruption', 'Formation des équipes', 'Support continu'],
    },
  ],
  principlesTitle: 'Nos principes',
  principles: [
    {
      title: 'Transparence totale',
      body: 'Accès complet à l’avancement, au code source et aux KPI en temps réel.',
    },
    {
      title: 'Orientés résultats',
      body: 'Chaque décision technique est guidée par l’impact business, pas par la technologie pour elle-même.',
    },
    {
      title: 'Collaboration directe',
      body: 'Vous travaillez directement avec les développeurs. Aucun intermédiaire, aucune perte d’information.',
    },
    {
      title: 'Qualité sans compromis',
      body: 'Tests rigoureux, revue de code systématique, performance optimisée dès le premier jour.',
    },
  ],
  stats: [
    { value: '70', suffix: '+', label: 'Projets' },
    { value: '100', suffix: '%', label: 'Satisfaction' },
    { value: '3', suffix: '+', label: 'Années' },
  ],
  ctaTitle: 'Prêt à commencer\u00A0?',
  ctaBody: 'Rencontrons-nous pour comprendre votre enjeu. Audit gratuit livré sous 48 h.',
  ctaPrimary: 'Démarrer un projet',
  ctaSecondary: 'Études de cas',
}

const about = {
  eyebrow: 'À propos',
  title: 'Un studio construit pour durer.',
  lede: 'Claro est une agence IA et développement basée à Tanger. Nous construisons les logiciels sur lesquels les entreprises tournent vraiment\u00A0: applications sur mesure, outils internes, workflows automatisés. Pas des démos, ni des prototypes discrètement reconstruits dix-huit mois plus tard.',

  stage: {
    eyebrow: 'Ce que nous faisons',
    title: 'Dites-nous ce dont vous avez besoin.',
    lede: 'La plupart des missions commencent par une phrase. Les nôtres commencent par une conversation sur ce que cette phrase demande vraiment.',
    /* Typed one after another in the prompt bar, lowercase on purpose: these
       are meant to read like a brief someone actually types. */
    prompts: [
      'on a tout ce qu’il vous faut',
      'construisez-moi une plateforme de réservation',
      'automatisez mon back-office',
      'mettez un agent IA sur ma boîte support',
      'faites charger tout ça plus vite',
    ],
  },

  story: {
    eyebrow: 'D’où nous venons',
    title: 'Notre histoire',
    paragraphs: [
      'Claro a commencé en 2022 avec une conviction\u00A0: la plupart des logiciels échouent bien avant la première ligne de code. Ils échouent dans le brief, là où personne ne s’était accordé sur ce à quoi ressemblait la réussite.',
      'Nous avons donc mis le diagnostic en premier. Modèle économique, marché, objectif, contrainte. Ensuite seulement nous concevons, et ensuite seulement nous construisons. C’est plus long à démarrer et bien plus court à finir.',
      'Soixante-dix missions plus tard, dans douze villes, cet ordre n’a pas changé. La règle que nous nous imposons non plus\u00A0: aucun retard ne reste non signalé.',
    ],
  },

  principles: {
    eyebrow: 'Notre façon de travailler',
    title: 'Quatre choses sur lesquelles nous ne transigeons pas.',
    items: [
      {
        n: '01',
        title: 'Le diagnostic avant la conception',
        body: 'Nous demandons ce dont l’entreprise a besoin avant de demander à quoi doit ressembler l’écran. Le brief est là où les projets se gagnent ou se perdent.',
      },
      {
        n: '02',
        title: 'Construit pour vous être remis',
        body: 'Votre code est lisible, documenté et vous appartient. Aucun verrouillage, aucune boîte noire, rien que nous serions seuls à savoir faire tourner.',
      },
      {
        n: '03',
        title: 'L’IA là où elle a sa place',
        body: 'Des agents et de l’automatisation pour le travail répétitif qui épuise une équipe. Pas comme une étiquette sur la facture.',
      },
      {
        n: '04',
        title: 'Le dire tôt',
        body: 'Si quelque chose glisse, vous l’apprenez de nous le jour où nous l’apprenons. C’est cette seule habitude qui explique le chiffre ci-dessous.',
      },
    ],
  },

  stats: [
    { value: '70', suffix: '+', label: 'Missions livrées' },
    { value: '4,8', suffix: '/5', label: 'Satisfaction client' },
    { value: '12', suffix: '+', label: 'Villes au Maroc' },
    { value: '2022', suffix: '', label: 'Actifs depuis' },
  ],

  cta: {
    title: 'Un projet en tête\u00A0?',
    body: 'Dites-nous ce que vous cherchez à construire. Nous vous dirons ce que cela demande vraiment, avant que vous ne vous engagiez.',
    action: 'Démarrer un projet',
    secondary: 'Voir notre méthode',
  },
}

/*
 * L'index /work, porté depuis clarodigi.com/fr/projets.
 *
 * Trente-six missions clients en ligne. `slug`, `name` et `tags` sont
 * indépendants de la langue et doivent rester identiques à en.js, au
 * caractère près : le slug construit /work/<slug> et nomme la capture dans
 * public/work/<slug>.webp, et les clés de tag pilotent le filtre et la
 * teinte du field. Seuls `body` et `result` se traduisent.
 */
const workPage = {
  title: 'Les réalisations, et pour qui.',
  lede: 'Développement sur mesure, e-commerce, design web et automatisation, livrés pour des PME et des cabinets de conseil partout au Maroc depuis 2022. Chaque mission ci-dessous est en ligne.',

  /* Small facts under the headline. `36` is asserted here and checked
     against projects.length by the page, so the two cannot drift. */
  meta: [
    { value: '36', suffix: '', label: 'projets sur cette page' },
    { value: '5', suffix: '', label: 'avec un résultat publié' },
    { value: '12', suffix: '+', label: 'villes' },
    { value: '2022', suffix: '', label: 'depuis' },
  ],

  /* `key` is locale-independent; only `label` translates. 'all' is not a
     tag, it is the absence of a filter. */
  filterLabel: 'Filtrer l’index par discipline',
  filters: [
    { key: 'all', label: 'Tout' },
    { key: 'web', label: 'Développement web' },
    { key: 'ecommerce', label: 'E-commerce' },
    { key: 'design', label: 'Design web' },
    { key: 'mobile', label: 'Application mobile' },
  ],
  resultsLabel: 'projets affichés',
  resultLabel: 'Résultat',

  projects: [
    {
      slug: 'mernissi-motors',
      name: 'MM Motorsports',
      tags: ['web'],
      body: 'Développement d’un showroom virtuel.',
    },
    {
      slug: 'klit',
      name: 'KLIT',
      tags: ['ecommerce'],
      body: 'Plateforme e-commerce moderne.',
      result: '4 M DH de commandes · 100+ restaurants',
    },
    {
      slug: 'overto',
      name: 'Overto',
      tags: ['design'],
      body: 'Solutions digitales innovantes.',
      result: '45 pages · PageSpeed 95+',
    },
    {
      slug: 'tarik-rami-immobilier',
      name: 'Tarik Rami Immobilier',
      tags: ['web'],
      body: 'Plateforme immobilière professionnelle.',
    },
    {
      slug: 'perfect-drive',
      name: 'Perfect Drive',
      tags: ['design'],
      body: 'Location de voitures de luxe à Nador.',
      result: '4 activités digitalisées · 4,9/5',
    },
    {
      slug: 'zaphs',
      name: 'Zaphs',
      tags: ['ecommerce'],
      body: 'Boutique en ligne moderne.',
    },
    {
      slug: 'chorouk-market',
      name: 'Chorouk Market',
      tags: ['ecommerce', 'mobile'],
      body: 'Place de marché en ligne.',
    },
    {
      slug: 'startup-olympus',
      name: 'Startup Olympus',
      tags: ['web'],
      body: 'Incubateur africain.',
      result: '50+ entrepreneurs incubés',
    },
    {
      slug: 'cineride-log',
      name: 'Cineride Log',
      tags: ['design'],
      body: 'Logistique pour les productions cinéma et audiovisuel au Maroc.',
    },
    {
      slug: 'pastaleena',
      name: 'Pastaleena',
      tags: ['ecommerce'],
      body: 'Pâtes artisanales marocaines sans gluten.',
    },
    {
      slug: 'kintsugi-people',
      name: 'Kintsugi People',
      tags: ['design'],
      body: 'Plateforme de développement personnel.',
      result: 'Partenariat de 3 ans · réservation intégrée',
    },
    {
      slug: 'winhub',
      name: 'Winhub',
      tags: ['web'],
      body: 'SaaS de gestion financière automatisée, IA et OCR.',
    },
    {
      slug: 'wriqa',
      name: 'Wriqa',
      tags: ['design'],
      body: 'Solutions digitales créatives.',
    },
    {
      slug: 'up-up',
      name: 'Up & Up',
      tags: ['design'],
      body: 'Agence de communication digitale.',
    },
    {
      slug: 'declic-conseil',
      name: 'Déclic Conseil',
      tags: ['design'],
      body: 'Conseil en transformation digitale.',
    },
    {
      slug: 'assurances-lafia',
      name: 'Assurances Lafia',
      tags: ['design'],
      body: 'Plateforme de courtage en assurance.',
    },
    {
      slug: 'munch-mate',
      name: 'Munch-mate',
      tags: ['ecommerce'],
      body: 'Développement d’un site e-commerce.',
    },
    {
      slug: 'i-love-amlou',
      name: 'I Love Amlou',
      tags: ['ecommerce'],
      body: 'Amlou marocain sain.',
    },
    {
      slug: 'keshrise',
      name: 'Keshrise',
      tags: ['design'],
      body: 'Architectes de la transformation de marque.',
    },
    {
      slug: 'redinmo-tanger',
      name: 'Redinmo Tanger',
      tags: ['web'],
      body: 'Plateforme d’agence immobilière.',
    },
    {
      slug: 'next-level-car',
      name: 'Next Level Car',
      tags: ['design'],
      body: 'Location de voitures premium à Casablanca.',
    },
    {
      slug: 'santos',
      name: 'Santos',
      tags: ['ecommerce'],
      body: 'Mode féminine, boutique en ligne.',
    },
    {
      slug: 'maison-121',
      name: 'Maison 121',
      tags: ['ecommerce'],
      body: 'Vêtements techniques et sportswear.',
    },
    {
      slug: 'r7immo',
      name: 'R7immo',
      tags: ['web'],
      body: 'Agence immobilière à Tanger, 20 ans de marché.',
    },
    {
      slug: 'rackdiscount',
      name: 'Rackdiscount',
      tags: ['ecommerce'],
      body: 'Rayonnages et systèmes de stockage industriel.',
    },
    {
      slug: 'turmag',
      name: 'Turmag',
      tags: ['design'],
      body: 'Conseil industriel et inspection tierce partie.',
    },
    {
      slug: 'erzad-immobilier',
      name: 'Erzad Immobilier',
      tags: ['web'],
      body: 'Plateforme immobilière moderne.',
    },
    {
      slug: 'padelista',
      name: 'Padelista',
      tags: ['ecommerce'],
      body: 'Plateforme e-commerce dédiée au padel.',
    },
    {
      slug: 'o-maadness',
      name: 'O-MAADNESS',
      tags: ['design'],
      body: 'Portfolio digital.',
    },
    {
      slug: 'socco-immo',
      name: 'Socco Immo',
      tags: ['web'],
      body: 'La maison de vos rêves, à un clic.',
    },
    {
      slug: 'groupe-babati',
      name: 'Groupe Babati',
      tags: ['design'],
      body: 'Site vitrine pour un groupe industriel.',
    },
    {
      slug: 'expat-watan',
      name: 'Expat Watan',
      tags: ['design'],
      body: 'Plateforme pour les expatriés.',
    },
    {
      slug: 'tangiervisit',
      name: 'TangierVisit',
      tags: ['design'],
      body: 'Excursions, location de véhicules et expériences de luxe à Tanger.',
    },
    {
      slug: 'xcite-mena',
      name: 'XCITE MENA',
      tags: ['design'],
      body: 'Site d’une agence de communication.',
    },
    {
      slug: 'diyae-immobilier',
      name: 'Diyae Immobilier',
      tags: ['web'],
      body: 'Solutions digitales pour l’immobilier.',
    },
    {
      slug: 'savo',
      name: 'Savo',
      tags: ['web'],
      body: 'E-learning\u00A0: langues, soutien scolaire et méthodes de travail.',
    },
  ],

  stats: [
    { value: '70', suffix: '+', label: 'Missions livrées' },
    { value: '4,8', suffix: '/5', label: 'Satisfaction client' },
    { value: '12', suffix: '+', label: 'Villes au Maroc' },
    { value: '2022', suffix: '', label: 'Actifs depuis' },
  ],

  cta: {
    title: 'Envie de figurer sur cette page\u00A0?',
    body: 'Votre projet mérite une équipe qui se soucie du résultat, pas seulement de la livraison. Dites-nous ce que vous construisez et nous vous dirons ce que cela demande vraiment.',
    action: 'Démarrer un projet',
    secondary: 'Voir notre méthode',
  },
}

const notFound = {
  eyebrow: '404',
  title: 'Cette page est encore en construction.',
  body: 'Nous ne l’avons pas encore terminée. Tout le reste est en ligne, alors regardez autour de vous, ou dites-nous ce que vous cherchiez et nous vous y conduirons.',
  pathLabel: 'Vous avez demandé',
  home: 'Retour à l’accueil',
  contact: 'Démarrer un projet',
}

const contactPage = {
  eyebrow: 'Contact',
  title: 'Lançons votre projet.',
  lede: 'Décrivez ce dont vous avez besoin, nous répondons sous 24 heures.',
  fields: [
    {
      /* `name` is the field's identity, not copy: it keys the form state and
         must match its twin in en.js. Only `label` and `placeholder` move. */
      name: 'name',
      label: 'Nom',
      type: 'text',
      placeholder: 'Youssef El Amrani',
      required: true,
      max: 80,
      autoComplete: 'name',
    },
    {
      name: 'company',
      label: 'Entreprise',
      type: 'text',
      placeholder: 'Acme SARL',
      max: 80,
      autoComplete: 'organization',
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      placeholder: 'vous@exemple.com',
      required: true,
      max: 254,
      autoComplete: 'email',
    },
    {
      name: 'phone',
      label: 'Téléphone',
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
        'Choisir un service',
        'Développement sur mesure',
        'Applications métier',
        'Transformation IA',
        'Transformation digitale',
      ],
    },
    {
      name: 'source',
      label: 'Comment nous avez-vous connus\u00A0?',
      type: 'select',
      required: true,
      options: [
        'Choisir une option',
        'Recherche Google',
        'Un article de votre blog',
        'LinkedIn',
        'Instagram',
        'Recommandation ou bouche-à-oreille',
        'Publicité en ligne',
        'Autre',
      ],
    },
    {
      name: 'budget',
      label: 'Budget du projet',
      type: 'text',
      placeholder: 'ex. 20 000 - 50 000 MAD',
      max: 60,
    },
    {
      name: 'project',
      label: 'Décrivez votre projet',
      type: 'textarea',
      placeholder: 'Décrivez votre projet, vos objectifs, vos délais...',
      required: true,
      max: 2000,
    },
  ],
  submit: 'Envoyer',
  /* Subject line of the mailto the form composes. */
  mailSubject: 'Demande de projet',
  emailLabel: 'Email',
  email: 'contact@clarodigi.com',
  addressLabel: 'Adresse',
  address: 'Tanger, Maroc',
  phoneLabel: 'Téléphone',
  phone: '+212 715-659-190',
  back: 'Retour à l’accueil',
}

const footer = {
  blurb: 'Notre équipe de développeurs talentueux est là pour transformer vos idées en réalité.',
  columns: [
    {
      title: 'Nos services',
      links: [
        'Développement sur mesure',
        'Applications métier',
        'Transformation IA',
        'Transformation digitale',
        'Conseil digital',
        'Conduite du changement',
        'FAQ',
      ],
    },
    {
      title: 'Intelligence artificielle',
      links: [
        'Chatbot IA',
        'Agents IA',
        'RAG & bases de connaissances',
        'IA générative',
        'Agence IA Maroc',
        'Agence IA Casablanca',
        'Agence IA Rabat',
        'Agence IA Tanger',
      ],
    },
  ],
  contactTitle: 'Contact',
  phone: '+212 715-659-190',
  email: 'contact@clarodigi.com',
  address: 'Boulevard Mohammed V, Tanger 90000',
  contactCta: 'Nous contacter',
  legal: '© Claro Digital Services SARL · 2026 · Clarodigi · est. 2022 · Tanger',
  legalLinks: ['Politique de confidentialité', 'Mentions légales'],
}

const meta = {
  title: 'Claro Digital · Agence IA et développement, Maroc',
  description:
    'Claro Digital, agence IA et développement au Maroc. Des solutions sur mesure pour les entreprises qui construisent sur le long terme.',
}

const a11y = {
  primaryNav: 'Principale',
  siteMenu: 'Menu du site',
  pages: 'Pages',
  sectors: 'Secteurs',
  logoHome: 'Claro, accueil',
}

export default {
  meta,
  a11y,
  menu,
  nav,
  hero,
  formula,
  services,
  work,
  sectors,
  testimonial,
  contact,
  auth,
  method,
  about,
  workPage,
  notFound,
  contactPage,
  footer,
}
