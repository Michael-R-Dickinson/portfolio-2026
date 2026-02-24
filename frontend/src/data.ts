export const navLinks = [
  { href: '#about', label: './About' },
  { href: '#stack', label: './Stack' },
  { href: '#roadmap', label: './Roadmap' },
  { href: '#projects', label: './Projects' },
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
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDkULgfoNdUSvPO5Q3zbZXCSSbv3Mz1rsW54n0jNkg5e__8mjP2EJ_VBuJsc49cdu32YSgURGLaIz4xJVcHkHVUu_pvy3oR3tohI-vJv1ydTB_OSjOxwkd2BZkI_Q1RGChS2uPB_J4Bu9_M4aZ5oFZyzi8QIh6GO180OkHDGe-y3gcO_x0oNqrdIQcWEn6NWWgTrscdmt2yWDlBUmbXHgkQG4rK2p4QjvJt8m-lAy_s6n5pRs6Y1STD2R0ibwxoiYLSkuagcD4Ou9jc',
    imageAlt: 'Abstract blockchain digital network visualization',
    href: '#',
  },
  {
    title: 'Model Drift Monitor',
    description:
      'Real-time drift detection system for deployed models. Integrates with Slack for alerts and triggers automated retraining.',
    tags: ['Python', 'Prometheus', 'Grafana'],
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDcHZMipbigE-J9ki17SgG1LFyp04ZR8MVrrVYoxoNFUqQBpkr209ZpXl_7ebjF7ZBsxEODip3nNIyUACZcmVtIrqGhplUZay-uhwAm69v1TiFmnlt09tydYHoDq7w25zXHBNCqNzaqQ0Dna2ZU1Fm21h5mQ2dPg8zjY_zNMJy98osJeG8de2bGwYM6ogIIDcMV5ojbrHZtHFD2rQsKUw3n_o29ABOKmL0WU-iq156D_jmhRk18weSfY1aKhlS6sBKr7N432leeTISO',
    imageAlt: 'Data analytics dashboard charts on dark screen',
    href: '#',
  },
  {
    title: 'Sentiment API',
    description:
      'High-throughput REST API for sentiment analysis serving a BERT model. Optimized for < 50ms latency.',
    tags: ['FastAPI', 'Docker', 'Redis'],
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB-e1QcMEHYYt56AeMlkZdNb_M6wtdflYvV-ymywG0uLXvDQ38xD1bTcGdDK81fK7exjUguXm_p9J_Wu21LG26QPgBxNPrG7uz8oyfkGxERoH-Z-vPLDzeTkCteA3e-cvc4y4Fo6_hT0Mjd36ZOVdZlbkV0X3KdxeXE0xYFIvwIiHdC3SbFlXTHTbpBEKQHeGcKnrwswLrJM3pw8QYLkxOxiv8yOwuIpsWE66fJvk3rJD5V8_TfQ-Y4c8snHZdYF5VZ61ZueBvSIRgi',
    imageAlt: 'Abstract geometric neural network nodes connection',
    href: '#',
  },
]
