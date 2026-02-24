export const navLinks = [
  { href: '#about', label: 'About' },
  { href: '#stack', label: 'Stack' },
  { href: '#roadmap', label: 'Roadmap' },
  { href: '#projects', label: 'Projects' },
]

export const techCategories = [
  {
    icon: 'memory',
    title: 'Core ML',
    skills: ['PyTorch', 'TensorFlow', 'Scikit-learn', 'XGBoost', 'HuggingFace'],
  },
  {
    icon: 'dns',
    title: 'Infrastructure',
    skills: ['Docker', 'Kubernetes', 'Terraform', 'AWS (SageMaker)'],
  },
  {
    icon: 'account_tree',
    title: 'Ops & Pipeline',
    skills: ['MLflow', 'Airflow', 'DVC', 'GitHub Actions', 'Jenkins'],
  },
  {
    icon: 'terminal',
    title: 'Languages',
    skills: ['Python', 'Go', 'Bash', 'SQL'],
  },
]

export const experiences = [
  {
    period: '2023 — Present',
    location: 'San Francisco, CA',
    isCurrent: true,
    role: 'MLOps Engineer Intern',
    company: 'DataCore Systems',
    bullets: [
      'Implemented a CI/CD pipeline for model retraining using GitHub Actions and AWS SageMaker, reducing deployment time by 40%.',
      'Optimized Docker container images for inference services, shrinking image size by 60% and improving cold start times.',
      'Collaborated with data scientists to version control datasets using DVC and S3.',
    ],
  },
  {
    period: '2022 — 2023',
    location: 'Remote',
    isCurrent: false,
    role: 'Junior Data Engineer',
    company: 'TechFlow Analytics',
    bullets: [
      'Built ETL pipelines processing 500GB+ daily data using Apache Airflow and PostgreSQL.',
      'Developed Python scripts to automate data quality checks, catching 95% of schema anomalies before production.',
      'Maintained documentation for data infrastructure and API endpoints.',
    ],
  },
]

export const projects = [
  {
    title: 'Distributed Training Cluster',
    description:
      'Automated infrastructure for distributed PyTorch training jobs across multiple GPU nodes using Ray and Kubernetes.',
    tags: ['Kubernetes', 'Ray', 'AWS'],
    href: '#',
    result: '10x faster iteration',
    highlight: true,
  },
  {
    title: 'Model Drift Monitor',
    description:
      'Real-time drift detection system for deployed models. Integrates with Slack for alerts and triggers automated retraining.',
    tags: ['Python', 'Prometheus', 'Grafana'],
    href: '#',
    result: '95% alert accuracy',
    highlight: false,
  },
  {
    title: 'Sentiment API',
    description:
      'High-throughput REST API for sentiment analysis serving a BERT model. Optimized for < 50ms latency.',
    tags: ['FastAPI', 'Docker', 'Redis'],
    href: '#',
    result: '< 50ms latency',
    highlight: false,
  },
]
