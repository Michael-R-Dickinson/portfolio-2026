export const navLinks = [
  { href: '#experience', label: 'Experience' },
  { href: '#projects', label: 'Projects' },
  { href: '#stack', label: 'Stack' },
  { href: '#roadmap', label: 'Roadmap' },
]

export const heroBio = `I combine my love for **infrastructure**, **mathematics** and **ML** to build deployable AI systems. Currently leading ground comms software for UBC's autonomous aircraft team.`

export const techCategories = [
  {
    icon: 'memory',
    title: 'ML & AI',
    skills: ['PyTorch', 'NumPy', 'Pandas', 'OpenCV', 'scikit-learn'],
  },
  {
    icon: 'terminal',
    title: 'Languages',
    skills: ['Python', 'TypeScript', 'C/C++', 'SQL', 'Java'],
  },
  {
    icon: 'dns',
    title: 'Infrastructure',
    skills: ['AWS', 'Docker', 'Docker Compose', 'GitHub Actions CI/CD'],
  },
  {
    icon: 'account_tree',
    title: 'Frameworks',
    skills: [
      'React.js',
      'Flask',
      'Django',
      'FastAPI',
      'PostgreSQL',
      'Git',
      'Playwright',
      'Jest',
    ],
  },
]

export const experiences = [
  {
    period: 'Sep 2024 — Present',
    location: 'Vancouver, BC',
    isCurrent: true,
    role: 'Ground Communications Software Engineer',
    company: 'UBC Uncrewed Aircraft Systems',
    description: `- Led Ground Communications subteam (6 members) to **National 2nd Place** at AEAC 2025
- Deployed low-latency **WebRTC** aerial image streaming for real-time drone feeds during autonomous flight — deployed to AWS with EC2 signaling server and S3 persistence
- Built Pandas + NumPy data pipeline with validation and normalization for 100K+ telemetry data points`,
  },
  {
    period: 'Jun 2025 — Sep 2025',
    location: 'Portland, OR',
    isCurrent: false,
    role: 'Software Engineering Intern',
    company: 'DevSwarm',
    description: `- Built anomaly detection system using statistical analysis and clustering to flag irregular code generation patterns across 10K+ sessions, reducing harmful tool use by 35%
- Designed agentic workflow engine enabling LLMs to autonomously plan, execute, and validate multi-step coding tasks with tool-use, achieving 78% success rate on complex refactoring operations`,
  },
  {
    period: 'Apr 2023 — Jul 2024',
    location: 'Eugene, OR',
    isCurrent: false,
    role: 'Software Engineer',
    company: 'Twenty Ideas',
    description: `- Developed computer vision pipeline using OpenCV and PyTorch for automated truck damage assessment, reducing manual inspection time by 70% and enabling instant repair cost estimates
- Built financial data ETL pipeline with SQL window-functions and time-series aggregations over 50K+ records with sub-second query latency
- Reduced QA turnaround times to < 20 minutes/build via GitHub Actions CI/CD pipeline with AWS Fargate + ECS deployments`,
  },
  {
    period: 'Apr 2022 — Sep 2022',
    location: 'Portland, OR',
    isCurrent: false,
    role: 'Data Science Intern',
    company: 'SheerID',
    description: `- Leveraged Selenium web scraping to locate 10,000+ students and provide custom promotions — led to 1,000+ conversions for clients including Google and AT&T
- Used SQLAlchemy + Pandas to scrub Postgres database, removing 300+ redundant user records`,
  },
]
type Project = {
  title: string
  description: string
  tags: string[]
  href: string
  result?: string
  highlight?: boolean
}

export const projects: Project[] = [
  {
    title: 'Job Application Automation Platform',
    description:
      'Browser extension + cloud platform automating job applications with LLM-powered resume tailoring. Uses text-embeddings + cosine similarity for form field classification across 50+ portals.',
    tags: ['React', 'AWS Lambda', 'Bedrock'],
    href: 'https://github.com/Michael-R-Dickinson/job-search-helper',
    // result: '30+ applications/hour',
    highlight: false,
  },
  {
    title: 'DubHacks 2025 — E2E Test Automation',
    description:
      'End-to-end testing platform converting natural language to Playwright scripts via OpenAI Agents and MCP. FastAPI backend orchestrates containerized execution of 20+ concurrent jobs with live result streaming.',
    tags: ['FastAPI', 'Playwright', 'OpenAI'],
    href: 'https://github.com/costasvallejos/FasTest',
    // result: 'sub-60s generation',
    highlight: false,
  },
  {
    title: 'Personal Portfolio Website',
    description:
      'This website! \n\nBuilt with React, Tailwind CSS, and Vite and deployed to AWS S3 + CloudFront.',
    tags: ['React', 'Tailwind CSS', 'AWS S3'],
    href: 'https://github.com/Michael-R-Dickinson/portfolio-2026',
  },
  {
    title: 'Tabletop Poker',
    description:
      'An app for playing in-person poker without physical chips. Connects players peer-to-peer with WebRTC for low-latency gameplay. Deployed with Terraform-managed AWS Lambda + API Gateway backend',
    tags: ['WebRTC', 'Terraform', 'AWS Lambda + API Gateway', 'React Native'],
    href: 'https://github.com/Michael-R-Dickinson/table-poker',
    highlight: false,
  },
]

type RoadmapNode = {
  title: string
  label: string
  description: string
  side?: 'left' | 'right'
  isCurrent: boolean
  isFuture: boolean
}

export const roadmapNodes: RoadmapNode[] = [
  {
    title: 'First Engineering Internships',
    label: '2022–2024',
    description:
      'Data Science intern at SheerID\n\nDeveloped fullstack and DevOps skills at Twenty Ideas.',
    side: 'left',
    isCurrent: false,
    isFuture: false,
  },
  {
    title: 'Received AI Research Award',
    label: 'Mar 2024',
    description:
      'Received American Psychological Association Achievement Award for research on suicidal ideation detection using transformer architecture with BERT and ViT.',
    isCurrent: false,
    isFuture: false,
  },
  {
    title: 'Gap-Year for Full-Time SWE',
    label: '2024',
    description:
      'Software Engineer at Twenty Ideas, focusing on infrastructure deployments and fullstack engineering.',
    side: 'left',
    isCurrent: false,
    isFuture: false,
  },
  {
    title: 'Enrolled in UBC Computer Science',
    label: 'Sep 2024',
    description:
      'Enrolled in CS + Honours Mathematics at UBC. \n\nBecame a Teaching Assistant for CPSC 110.\n\n4.3/4.33 GPA',
    side: 'right',
    isCurrent: false,
    isFuture: false,
  },
  {
    title: 'Joined UBC Uncrewed Aircraft Systems',
    label: 'Oct 2024',
    description:
      'Leading ground communications to national awards: 2nd Place AEAC 2025, 1st Nationally SUAS 2025.',
    side: 'left',
    isCurrent: false,
    isFuture: false,
  },
  {
    title: 'SWE Internship at DevSwarm',
    label: 'Summer 2025',
    description: 'Building LLM-powered coding tools and agentic workflows.',
    side: 'right',
    isCurrent: false,
    isFuture: false,
  },
  {
    title: 'Breaking into ML Ops and AI Systems',
    label: '2025',
    description:
      'Gaining experience in ML Ops and AI systems through internships and projects.',
    isCurrent: true,
    isFuture: false,
    side: 'left',
  },
  {
    title: 'Goal: Research Scientist in ML + Robotics',
    label: 'future-goal',
    description: 'Pursuing deeper ML and ML Ops Research.',
    side: 'right',
    isCurrent: false,
    isFuture: true,
  },
]
