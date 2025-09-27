export interface PortfolioProject {
  id: string;
  title: string;
  category: 'projection' | 'interactive' | 'installation' | 'festival' | 'guerrilla' | 'corporate';
  venue?: string;
  location: string;
  description: string;
  shortDescription: string;
  image: string;
  images: string[];
  year: string;
  client: string;
  duration?: string;
  budget?: string;
  attendees?: string;
  equipment: string[];
  techniques: string[];
  challenges: string[];
  outcomes: string[];
  testimonial?: {
    quote: string;
    author: string;
    title: string;
  };
  beforeAfter?: {
    before: string;
    after: string;
  };
  technical: {
    projectors: number;
    lumens: string;
    resolution: string;
    software: string[];
    setup_time: string;
    content_duration: string;
  };
  behindScenes?: {
    setupPhotos: string[];
    teamNotes: string;
    timelapseVideo?: string;
  };
  awards?: string[];
  pressLinks?: string[];
  gameConnection?: {
    achievement: string;
    tryDemo: string;
  };
  featured: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  specialty: string[];
  bio: string;
  image: string;
  projects: string[];
  social?: {
    linkedin?: string;
    instagram?: string;
    website?: string;
  };
}

export interface CompanyMilestone {
  year: string;
  title: string;
  description: string;
  projects?: string[];
  achievement?: string;
}

export const portfolioProjects: PortfolioProject[] = [
  {
    id: 'red-rocks-cosmic-journey',
    title: 'Cosmic Journey: Red Rocks Reimagined',
    category: 'projection',
    venue: 'Red Rocks Amphitheater',
    location: 'Morrison, Colorado',
    description: 'A breathtaking 360-degree projection mapping experience that transformed Red Rocks\' iconic sandstone formations into a living canvas of cosmic imagery. This ambitious project combined cutting-edge technology with artistic vision to create an otherworldly experience for 9,400 attendees over three nights.',
    shortDescription: 'Massive projection mapping installation transforming Red Rocks into cosmic landscape',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1200&h=800&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&h=800&fit=crop'
    ],
    year: '2024',
    client: 'Red Rocks Park and Amphitheater',
    duration: '3 nights',
    budget: '$750,000',
    attendees: '28,200 total',
    equipment: [
      '24x Barco UDX-4K32 Projectors',
      '12x Custom Rigging Systems',
      '8x Disguise 4x4pro Media Servers',
      '16x Meyer Sound Arrays',
      'Climate-Controlled Control Room'
    ],
    techniques: [
      '3D Scanning & Photogrammetry',
      'Real-time Weather Integration',
      'Audience Motion Tracking',
      'Spatial Audio Design',
      'Color Temperature Adaptation'
    ],
    challenges: [
      'Extreme weather conditions and wind exposure',
      'Complex rock surface geometry mapping',
      'Environmental protection requirements',
      'Multi-night content variation',
      'Audience safety in natural amphitheater'
    ],
    outcomes: [
      'Sold out all three nights within 2 hours',
      '94% audience satisfaction rating',
      'Featured in National Geographic',
      'Winner: Best Large-Scale Installation 2024',
      'Tourism boost: 23% increase in Red Rocks bookings'
    ],
    testimonial: {
      quote: 'Lightbrush transformed our sacred venue into something truly transcendent. The technical mastery combined with artistic vision created an experience our visitors will never forget.',
      author: 'Maria Santos',
      title: 'Director of Operations, Red Rocks Park'
    },
    beforeAfter: {
      before: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
      after: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&h=600&fit=crop'
    },
    technical: {
      projectors: 24,
      lumens: '768,000 total',
      resolution: '4K per projector',
      software: ['TouchDesigner', 'MadMapper Pro', 'Disguise', 'Notch'],
      setup_time: '5 days',
      content_duration: '45 minutes'
    },
    behindScenes: {
      setupPhotos: [
        'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop'
      ],
      teamNotes: 'Incredible collaboration with park rangers and environmental specialists to ensure zero impact on this natural wonder.',
      timelapseVideo: 'https://player.vimeo.com/video/example'
    },
    awards: ['Best Large-Scale Installation 2024', 'Environmental Stewardship Award'],
    pressLinks: ['National Geographic Feature', 'Colorado Tourism Board'],
    gameConnection: {
      achievement: 'Red Rocks Master',
      tryDemo: 'Experience mini Red Rocks projection in our game'
    },
    featured: true
  },
  {
    id: 'cervantes-immersive-ballroom',
    title: 'The Electric Ballroom Experience',
    category: 'interactive',
    venue: 'Cervantes Masterpiece Ballroom',
    location: 'Denver, Colorado',
    description: 'A permanent interactive installation that transforms the historic ballroom into a responsive environment. Motion sensors, LED arrays, and projection mapping work in harmony to create a space that literally dances with the audience, making every night a unique experience.',
    shortDescription: 'Permanent interactive installation that responds to audience movement and music',
    image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&h=800&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=800&fit=crop'
    ],
    year: '2023',
    client: 'Cervantes Masterpiece Ballroom',
    duration: 'Permanent installation',
    budget: '$425,000',
    attendees: '150,000+ annually',
    equipment: [
      '16x Kinect Azure Sensors',
      '8x Epson Pro L25000U Projectors',
      '200m+ LED Strip Arrays',
      '4x TouchDesigner Servers',
      'Custom DMX Controllers'
    ],
    techniques: [
      'Real-time Motion Tracking',
      'Beat Detection & Music Sync',
      'Crowd Density Visualization',
      'Predictive Animation Systems',
      'Multi-user Interaction Design'
    ],
    challenges: [
      'Historic building integration constraints',
      'Nightly setup/breakdown automation',
      'Multiple artist technical requirements',
      'Crowd safety in responsive environment',
      'Maintenance accessibility'
    ],
    outcomes: [
      '340% increase in repeat bookings',
      'Featured venue for major touring acts',
      'International venue technology benchmark',
      'Zero safety incidents in 18 months',
      'Social media engagement up 580%'
    ],
    testimonial: {
      quote: 'The Lightbrush installation has completely changed our venue. Artists specifically request to play here now because of the interactive experience it creates for their fans.',
      author: 'Jay Bianchi',
      title: 'Owner, Cervantes Masterpiece Ballroom'
    },
    technical: {
      projectors: 8,
      lumens: '200,000 total',
      resolution: 'WUXGA per projector',
      software: ['TouchDesigner', 'Max/MSP', 'MadMapper', 'Custom Motion Engine'],
      setup_time: 'Permanent (15 min daily calibration)',
      content_duration: 'Infinite/Generative'
    },
    behindScenes: {
      setupPhotos: [
        'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&h=600&fit=crop'
      ],
      teamNotes: 'Working within a historic venue required creative solutions for cable management and structural integration.'
    },
    gameConnection: {
      achievement: 'Interactive Master',
      tryDemo: 'Play our motion-tracking mini-game'
    },
    featured: true
  },
  {
    id: 'night-lights-denver-installation',
    title: 'Urban Canvas: Night Lights Denver',
    category: 'installation',
    venue: 'Various Denver Locations',
    location: 'Downtown Denver, Colorado',
    description: 'A month-long citywide installation featuring synchronized projections across 12 downtown buildings, creating Denver\'s largest coordinated light art experience. Citizens could interact with installations via mobile app, creating a truly participatory urban art piece.',
    shortDescription: 'Citywide synchronized projection installation across 12 downtown buildings',
    image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200&h=800&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1520637836862-4d197d17c12a?w=1200&h=800&fit=crop'
    ],
    year: '2024',
    client: 'City of Denver Arts Council',
    duration: '30 days',
    budget: '$1,200,000',
    attendees: '500,000+ estimated',
    equipment: [
      '48x Building-Mounted Projectors',
      '12x Central Control Units',
      '24x Weather Protection Systems',
      'Citywide Fiber Network',
      'Mobile App Integration'
    ],
    techniques: [
      'Multi-Building Synchronization',
      'Public Mobile App Integration',
      'Weather-Adaptive Programming',
      'Traffic Pattern Integration',
      'Real-time Social Media Feed'
    ],
    challenges: [
      'Multi-stakeholder coordination',
      'Weather durability requirements',
      'City infrastructure integration',
      'Public safety considerations',
      ' 24/7 technical monitoring'
    ],
    outcomes: [
      '$12M estimated economic impact',
      'International media coverage',
      '450,000 mobile app downloads',
      'Model for other cities worldwide',
      'Extended for additional 2 weeks by popular demand'
    ],
    testimonial: {
      quote: 'Night Lights Denver didn\'t just light up our buildings - it lit up our entire community spirit. Lightbrush created something that brought our city together.',
      author: 'Rebecca Martinez',
      title: 'Director, Denver Arts Council'
    },
    technical: {
      projectors: 48,
      lumens: '1,920,000 total',
      resolution: 'Mixed 4K/HD',
      software: ['Custom Network Sync', 'TouchDesigner', 'Web App Backend'],
      setup_time: '3 weeks',
      content_duration: '6 hours nightly'
    },
    awards: ['International Association of Urban Arts - Grand Prize 2024'],
    gameConnection: {
      achievement: 'City Illuminator',
      tryDemo: 'Control virtual Denver buildings'
    },
    featured: true
  },
  {
    id: 'psychedelic-dome-coachella',
    title: 'Psychedelic Cosmos Dome',
    category: 'festival',
    venue: 'Various Festival Locations',
    location: 'National Festival Circuit',
    description: 'Our flagship 60-foot geodesic dome creates 360-degree immersive experiences for festival-goers. Housing up to 200 people at a time, the dome features fulldome projection, spatial audio, and interactive floor elements that respond to music and movement.',
    shortDescription: 'Mobile 60-foot geodesic dome with 360-degree projection and spatial audio',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&h=800&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=1200&h=800&fit=crop'
    ],
    year: '2023-2024',
    client: 'Multiple Festival Promoters',
    duration: '18 festivals, 3-day average',
    attendees: '180,000+ total experiences',
    equipment: [
      '12x Fulldome Projectors',
      '60ft Geodesic Dome Structure',
      '32-Channel Spatial Audio System',
      'Interactive Floor Projection',
      'Climate Control System'
    ],
    techniques: [
      'Fulldome Content Production',
      'Spatial Audio Design',
      'Mobile Structure Engineering',
      'Crowd Flow Management',
      'Multi-Festival Logistics'
    ],
    challenges: [
      'Transportation between festivals',
      'Rapid setup/breakdown requirements',
      'Weather protection systems',
      'Power infrastructure variations',
      'Content customization per festival'
    ],
    outcomes: [
      'Booked at 18 major festivals',
      '96% visitor satisfaction rating',
      'Featured at Coachella, Burning Man, Electric Forest',
      'Inspired 3 permanent dome installations',
      'International touring opportunities'
    ],
    technical: {
      projectors: 12,
      lumens: '300,000 total',
      resolution: '4K fulldome',
      software: ['Fulldome Software', 'TouchDesigner', 'Spatial Audio Suite'],
      setup_time: '8 hours',
      content_duration: '20-minute cycles'
    },
    gameConnection: {
      achievement: 'Festival Legend',
      tryDemo: 'Experience dome projection simulation'
    },
    featured: true
  },
  {
    id: 'guerrilla-lightbomb-series',
    title: 'Urban Lightbomb Series',
    category: 'guerrilla',
    location: 'Various Urban Locations',
    description: 'Spontaneous, unauthorized projection art pieces that transform ordinary urban surfaces into spectacular displays. These pop-up installations last 15-30 minutes and are designed to surprise and delight communities while sparking conversations about public space and art accessibility.',
    shortDescription: 'Guerrilla projection art series creating surprise urban installations',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1200&h=800&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1520637736862-4d197d17c12a?w=1200&h=800&fit=crop'
    ],
    year: '2023-2024',
    client: 'Independent Art Project',
    duration: '24 installations',
    attendees: '50,000+ surprise encounters',
    equipment: [
      'Portable Battery Projectors',
      'Stealth Setup Equipment',
      'Mobile Content Systems',
      'Quick Deploy Stands',
      'Emergency Breakdown Kits'
    ],
    techniques: [
      'Rapid Deployment Systems',
      'Site-Specific Content Creation',
      'Community Engagement',
      'Social Media Documentation',
      'Legal Risk Management'
    ],
    challenges: [
      'Unauthorized installation risks',
      'Equipment portability limitations',
      'Weather vulnerability',
      'Community reception variability',
      'Documentation vs. stealth balance'
    ],
    outcomes: [
      '2.3M social media impressions',
      'Featured in street art documentaries',
      'Inspired city-sponsored programs',
      'Zero legal issues or complaints',
      'Community art program partnerships'
    ],
    technical: {
      projectors: 2,
      lumens: '8,000 portable',
      resolution: 'HD portable',
      software: ['Mobile TouchDesigner', 'Pre-rendered Content'],
      setup_time: '5 minutes',
      content_duration: '15-30 minutes'
    },
    gameConnection: {
      achievement: 'Guerrilla Artist',
      tryDemo: 'Plan your own lightbomb mission'
    },
    featured: false
  },
  {
    id: 'corporate-google-headquarters',
    title: 'Google Headquarters Innovation Summit',
    category: 'corporate',
    venue: 'Google Boulder',
    location: 'Boulder, Colorado',
    description: 'A sophisticated projection mapping installation for Google\'s annual Innovation Summit, transforming their Boulder headquarters atrium into an interactive data visualization space. The installation showcased real-time company metrics and allowed employees to interact with company data through gesture control.',
    shortDescription: 'Interactive corporate installation featuring real-time data visualization',
    image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1200&h=800&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1485796826113-174aa68fd81b?w=1200&h=800&fit=crop'
    ],
    year: '2024',
    client: 'Google Inc.',
    duration: '3-day summit',
    budget: '$200,000',
    attendees: '800 employees',
    equipment: [
      '6x Corporate-Grade Projectors',
      'Leap Motion Controllers',
      'Real-time Data Integration',
      'Corporate Network Integration',
      'Backup Systems'
    ],
    techniques: [
      'Real-time Data Visualization',
      'Gesture Control Interface',
      'Corporate Brand Integration',
      'Multi-user Interaction',
      'Privacy-Compliant Design'
    ],
    challenges: [
      'Corporate security requirements',
      'Real-time data integration',
      'Professional appearance standards',
      'Multi-stakeholder approvals',
      'Confidential information handling'
    ],
    outcomes: [
      'Highest summit engagement scores ever',
      'Follow-up installations at 3 other offices',
      'Featured in Google\'s annual report',
      'Template for future corporate events',
      'Employee satisfaction: 98%'
    ],
    testimonial: {
      quote: 'Lightbrush transformed our data into an experience. Our employees are still talking about the Innovation Summit months later.',
      author: 'David Chen',
      title: 'Head of Employee Experience, Google Boulder'
    },
    technical: {
      projectors: 6,
      lumens: '120,000 total',
      resolution: '4K mixed',
      software: ['TouchDesigner', 'Google API Integration', 'Leap Motion SDK'],
      setup_time: '2 days',
      content_duration: '8 hours daily'
    },
    gameConnection: {
      achievement: 'Corporate Innovator',
      tryDemo: 'Visualize data with gesture controls'
    },
    featured: false
  }
];

export const teamMembers: TeamMember[] = [
  {
    id: 'alex-chen',
    name: 'Alex Chen',
    role: 'Creative Director & Co-Founder',
    specialty: ['Projection Mapping', 'Creative Vision', 'Client Relations'],
    bio: 'With 12 years in immersive media, Alex pioneered many of the projection techniques now standard in the industry. Former technical director at major venues across Colorado.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    projects: ['red-rocks-cosmic-journey', 'cervantes-immersive-ballroom', 'night-lights-denver-installation'],
    social: {
      linkedin: 'https://linkedin.com/in/alexchen',
      instagram: 'https://instagram.com/alexchen_lightbrush'
    }
  },
  {
    id: 'sarah-williams',
    name: 'Sarah Williams',
    role: 'Technical Director',
    specialty: ['TouchDesigner', 'System Architecture', 'Hardware Integration'],
    bio: 'Sarah brings deep technical expertise from her background in live event production and software engineering. She ensures every installation runs flawlessly.',
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b641?w=400&h=400&fit=crop',
    projects: ['red-rocks-cosmic-journey', 'psychedelic-dome-coachella', 'corporate-google-headquarters'],
    social: {
      linkedin: 'https://linkedin.com/in/sarahwilliams'
    }
  },
  {
    id: 'marcus-rodriguez',
    name: 'Marcus Rodriguez',
    role: 'Content Creator',
    specialty: ['Motion Graphics', 'Interactive Design', 'Spatial Audio'],
    bio: 'Marcus creates the stunning visuals and audio experiences that bring our installations to life. His background in fine arts meets cutting-edge technology.',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
    projects: ['cervantes-immersive-ballroom', 'guerrilla-lightbomb-series', 'psychedelic-dome-coachella'],
    social: {
      instagram: 'https://instagram.com/marcusvisuals',
      website: 'https://marcusrodriguez.art'
    }
  },
  {
    id: 'elena-vasquez',
    name: 'Elena Vasquez',
    role: 'Project Manager',
    specialty: ['Logistics', 'Client Relations', 'Risk Management'],
    bio: 'Elena orchestrates our complex installations with precision and grace. Her event production background ensures every project delivers on time and on budget.',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    projects: ['night-lights-denver-installation', 'red-rocks-cosmic-journey', 'corporate-google-headquarters']
  }
];

export const companyTimeline: CompanyMilestone[] = [
  {
    year: '2019',
    title: 'Lightbrush Founded',
    description: 'Started in Alex\'s garage with a single projector and big dreams',
    achievement: 'First guerrilla projection at Union Station'
  },
  {
    year: '2020',
    title: 'First Major Venue Partnership',
    description: 'Cervantes Masterpiece Ballroom becomes our testing ground',
    projects: ['cervantes-immersive-ballroom']
  },
  {
    year: '2021',
    title: 'Festival Circuit Launch',
    description: 'Psychedelic Dome debuts at Electric Forest',
    projects: ['psychedelic-dome-coachella']
  },
  {
    year: '2022',
    title: 'Corporate Market Entry',
    description: 'First major corporate client opens new revenue streams',
    achievement: 'Google partnership established'
  },
  {
    year: '2023',
    title: 'Red Rocks Milestone',
    description: 'Landing Red Rocks contract - a Colorado artist\'s dream',
    projects: ['red-rocks-cosmic-journey']
  },
  {
    year: '2024',
    title: 'Citywide Recognition',
    description: 'Night Lights Denver puts us on the international map',
    projects: ['night-lights-denver-installation'],
    achievement: 'International awards and recognition'
  }
];

export const projectCategories = [
  { id: 'all', name: 'All Projects', color: 'from-blue-500 to-purple-600' },
  { id: 'projection', name: 'Projection Mapping', color: 'from-blue-500 to-cyan-500' },
  { id: 'interactive', name: 'Interactive', color: 'from-purple-500 to-pink-500' },
  { id: 'installation', name: 'Installations', color: 'from-green-500 to-blue-500' },
  { id: 'festival', name: 'Festival', color: 'from-yellow-500 to-orange-500' },
  { id: 'guerrilla', name: 'Guerrilla Art', color: 'from-red-500 to-pink-500' },
  { id: 'corporate', name: 'Corporate', color: 'from-gray-500 to-blue-500' }
];

export const venues = [
  'Red Rocks Amphitheater',
  'Cervantes Masterpiece Ballroom',
  'Various Denver Locations',
  'Various Festival Locations',
  'Google Boulder'
];