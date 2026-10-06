// All site copy lives here; components read from this file.

export type Link = { label: string; href: string }

export const profile = {
  name: 'Michael Dickinson',
  shortBio:
    'I build perception software for use on edge and robotic devices.',
  education: {
    school: 'University of British Columbia',
    degree: 'Computer Science + Honours Mathematics (Double Major)',
    gpa: '4.3/4.33',
    grad: 'Apr 2028',
  },
  currently: [
    'Undergrad researcher @ MUX Lab (UBC)',
    'Software Team Lead @ UBC Uncrewed Aircraft Systems',
  ],
  location: 'Vancouver, BC',
  email: 'michael.dickinson.r@gmail.com',
}

export const links: Link[] = [
  { label: 'GitHub', href: 'https://github.com/Michael-R-Dickinson' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/michael-r-dickinson/' },
  { label: 'Resume', href: '/resume.pdf' },
  { label: 'Email', href: 'mailto:michael.dickinson.r@gmail.com' },
]

export const about = [
  'CS + Honours Math double major at UBC, graduating April 2028.',
  'I work where infrastructure, mathematics, and ML meet: SLAM, 3D reconstruction, real-time detection, and the telemetry links that keep an autonomous aircraft talking to the ground.',
  'Heading toward autonomy, perception, and robotics.',
]

export type Project = {
  id: string
  title: string
  subtitle: string
  description: string
  highlights: string[]
  tags: string[]
  href?: string
  kind: 'research' | 'autonomy' | 'web'
}

export const projects: Project[] = [
  {
    id: 'livenexus',
    title: 'LiveNexus',
    subtitle: 'Live 3D reconstruction with Gaussian Splatting (first-author, submitted to CHI 2027)',
    description:
      'Real-time mixed-reality pipeline that detects moving objects in a live Quest 3 RGB-D stream, registers them into a 3D Gaussian Splatting scene, removes them, and inpaints the hole.',
    highlights: [
      'Ego-motion-compensated motion segmentation: PnP-RANSAC on SEA-RAFT optical flow',
      'Multi-view 3DGS segmentation over ~1M Gaussians via signed Leiden clustering',
      'RTAB-Map localization on the reconstructed scene, <5cm pose error on Bonn',
      '7 → 15 fps by parallelizing SLAM, flow, and YOLO',
    ],
    tags: ['Python', 'PyTorch', 'CUDA', '3DGS', 'RTAB-Map', 'ZeroMQ', 'Docker'],
    kind: 'research',
  },
  {
    id: 'uas',
    title: 'UBC UAS Autonomy Stack',
    subtitle: 'Software Team Lead, 20+ members, 4th nationally at AEAC 2026',
    description:
      'Autonomy, perception, and telemetry for UBC’s competition drone: SLAM, onboard target detection, and the command link to the flight controller.',
    highlights: [
      'cuVSLAM from a RealSense RGB-D feed for autonomous flight',
      'YOLO + ROS2 target detection on a Jetson Orin Nano, 89% accuracy',
      'ROS2–MAVLink command/telemetry link over RFD900x, tested in ArduPilot SITL',
      'Telemetry with packet-loss recovery out to 10km, 99% uptime at competition',
    ],
    tags: ['ROS2', 'C++', 'Python', 'YOLO', 'Jetson'],
    kind: 'autonomy',
  },
  {
    id: 'bert-vit',
    title: 'BERT + ViT Multimodal Research',
    subtitle: 'American Psychological Association Achievement Award',
    description:
      'Self-attention architecture fusing BERT with a Vision Transformer for image + text analysis, 85% accuracy at detecting suicidal ideation across 5,000 posts.',
    highlights: ['Cross-modal attention fusion', 'APA Achievement Award, Mar 2024'],
    tags: ['PyTorch', 'Transformers', 'NumPy', 'OpenCV'],
    kind: 'research',
  },
  {
    id: 'gcom',
    title: 'UAS GCOM',
    subtitle: 'Ground communication software for UBC UAS',
    description:
      'Ground station for UBC’s competition drone. Talks to the Cube Orange flight controller over MAVLink via pymavlink, and shows the aircraft’s live video streams over WebRTC.',
    highlights: [
      'Autonomous takeoff, landing, and waypoint navigation',
      'Live video streams from the aircraft over WebRTC',
    ],
    tags: ['Python', 'pymavlink', 'MAVLink', 'WebRTC', 'Cube Orange'],
    kind: 'web',
  },
  {
    id: 'fastest',
    title: 'FasTest (DubHacks 2025)',
    subtitle: 'Natural language → Playwright E2E tests',
    description:
      'OpenAI Agents + MCP turn plain-English test specs into Playwright scripts; a FastAPI backend runs 20+ containerized jobs concurrently and streams results live.',
    highlights: ['Tests generated in under 60s', 'Runs in under 5s each'],
    tags: ['FastAPI', 'Playwright', 'OpenAI', 'Docker'],
    href: 'https://github.com/costasvallejos/FasTest',
    kind: 'web',
  },
]

export type TimelineEntry = {
  id: string
  year: string // short label, e.g. "'22" style handled by concept
  date: string // human date range
  title: string
  org: string
  description: string
  tags: string[]
  status: 'past' | 'current' | 'future'
}

export const timeline: TimelineEntry[] = [
  {
    id: 'sheerid',
    year: '2022',
    date: 'Apr – Sep 2022',
    title: 'Data Science Intern',
    org: 'SheerID',
    description:
      'Selenium scraping that found 10,000+ students for targeted promotions and drove 1,000+ conversions for clients like Google and AT&T.',
    tags: ['Python', 'Pandas', 'Selenium', 'Postgres'],
    status: 'past',
  },
  {
    id: 'twenty-ideas',
    year: '2023',
    date: 'Apr 2023 – Jul 2024',
    title: 'Software Engineer',
    org: 'Twenty Ideas',
    description:
      'Computer vision for truck damage assessment (70% less manual inspection), Terraform IaC, and CI/CD on AWS Fargate + ECS.',
    tags: ['OpenCV', 'PyTorch', 'Terraform', 'AWS'],
    status: 'past',
  },
  {
    id: 'devswarm',
    year: '2025',
    date: 'Jun – Sep 2025',
    title: 'Software Engineering Intern',
    org: 'DevSwarm',
    description:
      'Built an agentic workflow engine (78% success on complex refactors) and anomaly detection over 10K+ LLM sessions.',
    tags: ['TypeScript', 'Node.js', 'LLMs', 'Electron'],
    status: 'past',
  },
  {
    id: 'uas',
    year: '2024',
    date: 'Sep 2024 – Present',
    title: 'Software Team Lead',
    org: 'UBC Uncrewed Aircraft Systems',
    description:
      'Leading 20+ engineers on autonomy, SLAM, and telemetry. Placed 4th nationally at AEAC 2026.',
    tags: ['ROS2', 'MAVLink', 'cuVSLAM', 'YOLO'],
    status: 'current',
  },
  {
    id: 'mux',
    year: '2026',
    date: 'May 2026 – Present',
    title: 'Undergraduate Researcher',
    org: 'MUX Lab, UBC',
    description:
      'LiveNexus: live Gaussian Splatting reconstruction with dynamic-object removal. Supported by a $10,395 WLIURA research award.',
    tags: ['3DGS', 'SLAM', 'PyTorch', 'CUDA'],
    status: 'current',
  },
  {
    id: 'chi',
    year: '2027',
    date: 'Apr 2027',
    title: 'CHI 2027',
    org: 'ACM CHI',
    description: 'First-author paper on live 3D reconstruction, submitted.',
    tags: ['Research'],
    status: 'future',
  },
  {
    id: 'grad',
    year: '2028',
    date: 'Apr 2028',
    title: 'Graduate',
    org: 'UBC: CS + Honours Math',
    description: 'BSc, double major in Computer Science and Honours Mathematics.',
    tags: [],
    status: 'future',
  },
  {
    id: 'target',
    year: 'Next',
    date: '2028 →',
    title: 'Autonomy / Perception Engineer',
    org: 'Robotics',
    description: 'Building perception and autonomy for robots that operate in the real world.',
    tags: ['Autonomy', 'Perception', 'Robotics'],
    status: 'future',
  },
]
