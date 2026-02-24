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
    skills: ['AWS', 'Docker', 'GitHub Actions CI/CD', 'Git'],
  },
  {
    icon: 'account_tree',
    title: 'Frameworks & APIs',
    skills: ['Flask', 'FastAPI', 'PostgreSQL', 'SQLAlchemy'],
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
- Built Pandas + NumPy data pipeline with validation and normalization for 100K+ telemetry data points
- Deployed low-latency **WebRTC** aerial image streaming for real-time drone feeds during autonomous flight — deployed to AWS with EC2 signaling server and S3 persistence`,
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

export const projects = [
  {
    title: 'Multimodal Suicide Prevention Research',
    description:
      'Novel self-attention architecture fusing BERT with Vision Transformer (ViT) for multimodal (image + text) suicidal ideation detection. Awarded American Psychological Association Achievement Award.',
    tags: ['PyTorch', 'NumPy', 'OpenCV'],
    href: '#',
    result: '96% accuracy',
    highlight: true,
  },
  {
    title: 'Job Application Automation Platform',
    description:
      'Browser extension + cloud platform automating job applications with LLM-powered resume tailoring. Uses text-embeddings + cosine similarity for form field classification across 50+ portals.',
    tags: ['React', 'AWS Lambda', 'Bedrock'],
    href: '#',
    result: '30+ applications/hour',
    highlight: false,
  },
  {
    title: 'DubHacks 2025 — E2E Test Automation',
    description:
      'End-to-end testing platform converting natural language to Playwright scripts via OpenAI Agents and MCP. FastAPI backend orchestrates containerized execution of 20+ concurrent jobs with live result streaming.',
    tags: ['FastAPI', 'Playwright', 'OpenAI'],
    href: '#',
    result: 'sub-60s generation',
    highlight: false,
  },
]

export const roadmapNodes = [
  {
    title: 'UBC Computer Science',
    label: 'commit: Sep 2022',
    description:
      'Enrolled in CS + Honours Mathematics at UBC. Became a Teaching Assistant for CPSC 110 (Systematic Program Design).',
    side: 'left' as const,
    isCurrent: false,
    isFuture: false,
  },
  {
    title: 'First Engineering Roles',
    label: 'commit: 2022–2024',
    description:
      'Data Science intern at SheerID; built CV pipelines and financial ETL systems at Twenty Ideas.',
    side: 'right' as const,
    isCurrent: false,
    isFuture: false,
  },
  {
    title: 'Drone Systems & Agentic AI',
    label: 'HEAD -> main',
    description:
      'Leading drone ground comms at UBC UAS (National 2nd Place, AEAC 2025). Built agentic workflow engines at DevSwarm.',
    side: 'left' as const,
    isCurrent: true,
    isFuture: false,
  },
  {
    title: 'ML Research & Graduate Studies',
    label: 'branch: feature/research',
    description:
      'Pursuing deeper ML research and graduate studies in AI/ML systems.',
    side: 'right' as const,
    isCurrent: false,
    isFuture: true,
  },
]
