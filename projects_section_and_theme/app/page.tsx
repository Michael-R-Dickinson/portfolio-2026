'use client'

import { useEffect, useRef, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Github, Linkedin, Mail, ExternalLink, Terminal, Database, Brain, Cloud, Code2, TrendingUp, Award, Calendar, GraduationCap, Sparkles } from 'lucide-react'

export default function Portfolio() {
  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Animated Background */}
      <ParticleBackground />
      
      {/* Noise Texture Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')] z-50" />

      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <HeroSection />
        
        {/* About Summary */}
        <AboutSection />
        
        {/* Career Roadmap */}
        <CareerRoadmap />
        
        {/* Experience Section */}
        <ExperienceSection />
        
        {/* Projects Section */}
        <ProjectsSection />
        
        {/* Skills Section */}
        <SkillsSection />
        
        {/* Footer */}
        <Footer />
      </div>
    </div>
  )
}

function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    
    const particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      size: number
    }> = []
    
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 1
      })
    }
    
    function animate() {
      if (!ctx || !canvas) return
      
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Draw connections
      ctx.strokeStyle = 'rgba(96, 165, 250, 0.1)'
      ctx.lineWidth = 0.5
      
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const distance = Math.sqrt(dx * dx + dy * dy)
          
          if (distance < 150) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }
      
      // Draw and update particles
      particles.forEach(particle => {
        ctx.fillStyle = 'rgba(96, 165, 250, 0.4)'
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fill()
        
        particle.x += particle.vx
        particle.y += particle.vy
        
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1
      })
      
      requestAnimationFrame(animate)
    }
    
    animate()
    
    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" />
}

function HeroSection() {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0)
  const phrases = [
    'Training pipelines at scale.',
    'Deploying models to production.',
    'Bridging research and infrastructure.'
  ]
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])
  
  return (
    <section className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-4xl animate-fade-in-up">
        <h1 className="text-5xl md:text-7xl font-heading font-bold text-balance">
          Michael Dickinson
        </h1>
        <p className="text-2xl md:text-3xl text-muted-foreground font-heading">
          MLOps & Machine Learning Engineer
        </p>
        <div className="h-8 flex items-center justify-center">
          <p className="text-lg md:text-xl font-mono text-primary animate-pulse">
            <Terminal className="inline-block w-5 h-5 mr-2" />
            <span key={currentPhraseIndex} className="animate-fade-in">
              {phrases[currentPhraseIndex]}
            </span>
          </p>
        </div>
      </div>
    </section>
  )
}

function AboutSection() {
  const stats = [
    { label: '4.33 GPA', icon: GraduationCap },
    { label: '3 Internships', icon: Code2 },
    { label: '96% Model Accuracy', icon: TrendingUp },
    { label: 'National 2nd Place – AEAC 2025', icon: Award }
  ]
  
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, index) => (
            <Card 
              key={index} 
              className="p-6 bg-card/50 backdrop-blur border-border hover:border-primary transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 group cursor-pointer hover:-translate-y-1"
            >
              <div className="flex flex-col items-center space-y-3 text-center">
                <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm md:text-base font-semibold text-balance leading-tight">
                  {stat.label}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

function CareerRoadmap() {
  const [visibleNodes, setVisibleNodes] = useState<number[]>([])
  const sectionRef = useRef<HTMLDivElement>(null)
  
  const completedMilestones = [
    {
      title: 'SheerID Data Science Intern',
      date: '2022',
      description: 'First real industry data work, building production ML pipelines',
      tech: ['Python', 'Pandas', 'scikit-learn']
    },
    {
      title: 'APA Achievement Award',
      date: '2023',
      description: 'Multimodal suicide prevention research using BERT + ViT, 96% accuracy',
      tech: ['BERT', 'ViT', 'PyTorch', 'Transformers']
    },
    {
      title: 'Twenty Ideas SWE Intern',
      date: '2023',
      description: 'Built CI/CD pipelines, AWS infrastructure with Fargate/ECS',
      tech: ['AWS', 'Docker', 'GitHub Actions', 'ECS']
    },
    {
      title: 'UBC UAS Ground Comms Lead',
      date: '2024',
      description: 'Real-time systems engineering, National 2nd Place at AEAC 2025',
      tech: ['C++', 'Real-time Systems', 'Radio Comms']
    },
    {
      title: 'DevSwarm Intern',
      date: '2024',
      description: 'Built agentic workflow engine with LLM integration',
      tech: ['LLMs', 'Python', 'Workflow Orchestration']
    },
    {
      title: 'DubHacks 2025',
      date: '2025',
      description: 'E2E test automation platform with intelligent test generation',
      tech: ['TypeScript', 'Playwright', 'AI Testing']
    }
  ]
  
  const futureMilestones = [
    {
      title: 'Summer 2026 MLOps/MLE Internship',
      date: '2026',
      description: 'Tier 1/2 tech company focused on model deployment at scale',
      tech: ['Target Role']
    },
    {
      title: 'NSERC USRA Research',
      date: '2026',
      description: 'Undergraduate research in computer vision or multimodal ML',
      tech: ['Research']
    },
    {
      title: 'Open-Source Contributions',
      date: '2026-2027',
      description: 'Contributing to MLOps tooling (MLflow, Kubeflow, etc.)',
      tech: ['Open Source']
    },
    {
      title: 'Full-time MLE Role',
      date: '2028',
      description: 'Model deployment at scale post-graduation',
      tech: ['Career Goal']
    }
  ]
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0')
            setVisibleNodes((prev) => [...new Set([...prev, index])])
          }
        })
      },
      { threshold: 0.3 }
    )
    
    const nodes = sectionRef.current?.querySelectorAll('.milestone-node')
    nodes?.forEach((node) => observer.observe(node))
    
    return () => observer.disconnect()
  }, [])
  
  return (
    <section ref={sectionRef} className="py-20 px-4 bg-card/20">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-heading font-bold text-center mb-4">
          Career Roadmap
        </h2>
        <p className="text-center text-muted-foreground mb-16 text-balance">
          {'From first internship to full-time MLE'}
        </p>
        
        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          {/* Completed Side */}
          <div className="space-y-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-1 flex-1 bg-primary rounded" />
              <h3 className="text-xl font-heading font-semibold">Completed</h3>
              <div className="h-1 flex-1 bg-primary rounded" />
            </div>
            
            {completedMilestones.map((milestone, index) => (
              <div
                key={index}
                data-index={index}
                className={`milestone-node relative pl-8 border-l-2 border-primary transition-all duration-500 ${
                  visibleNodes.includes(index) ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
                }`}
              >
                <div className="absolute left-0 top-0 w-4 h-4 -ml-[9px] rounded-full bg-primary shadow-lg shadow-primary/50" />
                <Card className="p-4 bg-card/80 backdrop-blur hover:bg-card transition-all hover:border-primary group">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-heading font-semibold text-lg group-hover:text-primary transition-colors">
                      {milestone.title}
                    </h4>
                    <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
                      {milestone.date}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {milestone.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {milestone.tech.map((tech, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </Card>
              </div>
            ))}
          </div>
          
          {/* Future Side */}
          <div className="space-y-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-1 flex-1 bg-gradient-to-r from-primary/50 to-primary/20 rounded" />
              <h3 className="text-xl font-heading font-semibold">Future</h3>
              <div className="h-1 flex-1 bg-gradient-to-l from-primary/50 to-primary/20 rounded" />
            </div>
            
            {futureMilestones.map((milestone, index) => (
              <div
                key={index}
                data-index={index + completedMilestones.length}
                className={`milestone-node relative pl-8 border-l-2 border-dashed border-primary/50 transition-all duration-500 ${
                  visibleNodes.includes(index + completedMilestones.length) ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
                }`}
              >
                <div className="absolute left-0 top-0 w-4 h-4 -ml-[9px] rounded-full bg-primary/50 shadow-lg shadow-primary/30 animate-pulse" />
                <Card className="p-4 bg-card/40 backdrop-blur border-dashed hover:bg-card/60 transition-all hover:border-primary group">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-heading font-semibold text-lg group-hover:text-primary transition-colors">
                        {milestone.title}
                      </h4>
                      <Sparkles className="w-4 h-4 text-primary/60" />
                    </div>
                    <span className="text-xs font-mono text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                      {milestone.date}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {milestone.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {milestone.tech.map((tech, i) => (
                      <Badge key={i} variant="outline" className="text-xs border-dashed">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function ExperienceSection() {
  const experiences = [
    {
      company: 'DevSwarm',
      role: 'Software Engineering Intern',
      period: '2024',
      highlights: [
        'Built agentic workflow engine integrating LLM capabilities for intelligent task orchestration',
        'Implemented real-time collaboration features for multi-agent systems',
        'Optimized model inference pipelines reducing latency by 40%'
      ],
      tech: ['Python', 'LLMs', 'FastAPI', 'Redis', 'Docker'],
      color: 'from-blue-500/10 to-cyan-500/10'
    },
    {
      company: 'Twenty Ideas',
      role: 'Software Engineering Intern',
      period: '2023',
      highlights: [
        'Designed and deployed CI/CD pipelines using GitHub Actions and AWS',
        'Built containerized microservices with Docker, deployed on ECS/Fargate',
        'Implemented infrastructure as code with Terraform for reproducible deployments'
      ],
      tech: ['AWS ECS', 'Docker', 'GitHub Actions', 'Terraform', 'Python'],
      color: 'from-purple-500/10 to-pink-500/10'
    },
    {
      company: 'SheerID',
      role: 'Data Science Intern',
      period: '2022',
      highlights: [
        'Developed production ML pipelines for identity verification systems',
        'Built data preprocessing and feature engineering workflows',
        'Implemented A/B testing framework for model performance evaluation'
      ],
      tech: ['Python', 'Pandas', 'scikit-learn', 'SQL', 'AWS S3'],
      color: 'from-green-500/10 to-emerald-500/10'
    }
  ]
  
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-heading font-bold text-center mb-4">
          Experience
        </h2>
        <p className="text-center text-muted-foreground mb-16 text-balance">
          {'Building production systems and ML infrastructure'}
        </p>
        
        <div className="grid gap-6">
          {experiences.map((exp, index) => (
            <Card 
              key={index}
              className="p-6 bg-card/50 backdrop-blur hover:bg-card transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 group hover:-translate-y-1 border-l-4 border-l-transparent hover:border-l-primary"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-heading font-bold group-hover:text-primary transition-colors">
                    {exp.company}
                  </h3>
                  <p className="text-lg text-muted-foreground">{exp.role}</p>
                </div>
                <span className="text-sm font-mono text-muted-foreground bg-muted px-3 py-1 rounded mt-2 md:mt-0 w-fit">
                  {exp.period}
                </span>
              </div>
              
              <ul className="space-y-2 mb-4">
                {exp.highlights.map((highlight, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary mt-1.5">•</span>
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
              
              <div className="flex flex-wrap gap-2">
                {exp.tech.map((tech, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {tech}
                  </Badge>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

function ProjectsSection() {
  const projects = [
    {
      title: 'Multimodal Suicide Prevention Research',
      description: 'Deep learning model combining BERT and Vision Transformers for suicide risk assessment',
      result: '96% accuracy',
      tech: ['BERT', 'ViT', 'PyTorch', 'Transformers', 'Python'],
      highlight: true,
      award: 'APA Achievement Award 2023',
      link: '#'
    },
    {
      title: 'E2E Test Automation Platform',
      description: 'AI-powered test generation platform built at DubHacks 2025',
      result: 'Sub-60s test generation',
      tech: ['TypeScript', 'Playwright', 'GPT-4', 'React'],
      highlight: false,
      link: '#'
    },
    {
      title: 'Agentic Workflow Engine',
      description: 'LLM-powered task orchestration system with multi-agent collaboration',
      result: '95% autofill success',
      tech: ['Python', 'LangChain', 'FastAPI', 'Redis'],
      highlight: false,
      link: '#'
    },
    {
      title: 'UBC UAS Ground Communications',
      description: 'Real-time telemetry and command systems for autonomous aircraft',
      result: 'National 2nd Place AEAC 2025',
      tech: ['C++', 'Radio Protocols', 'Real-time Systems'],
      highlight: false,
      link: '#'
    },
    {
      title: 'ML Pipeline Orchestration',
      description: 'Scalable training pipeline with experiment tracking and model versioning',
      result: '10x faster iteration',
      tech: ['MLflow', 'Kubeflow', 'Docker', 'K8s'],
      highlight: false,
      link: '#'
    }
  ]
  
  return (
    <section className="py-20 px-4 bg-card/20">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-heading font-bold text-center mb-4">
          Projects
        </h2>
        <p className="text-center text-muted-foreground mb-16 text-balance">
          {'Research, infrastructure, and intelligent systems'}
        </p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
          {projects.map((project, index) => (
            <Card 
              key={index}
              className={`p-6 bg-card/50 backdrop-blur hover:bg-card transition-all duration-300 group hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10 border-border hover:border-primary flex flex-col ${
                project.highlight ? 'md:col-span-2 md:row-span-2 lg:col-span-2 lg:row-span-2' : ''
              }`}
            >
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <h3 className={`font-heading font-bold group-hover:text-primary transition-colors text-balance ${
                    project.highlight ? 'text-2xl' : 'text-xl'
                  }`}>
                    {project.title}
                  </h3>
                  <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 ml-2" />
                </div>
                
                {project.award && (
                  <div className="flex items-center gap-2 mb-3 text-primary">
                    <Award className="w-4 h-4" />
                    <span className="text-sm font-semibold">{project.award}</span>
                  </div>
                )}
                
                <p className={`text-muted-foreground mb-4 ${
                  project.highlight ? 'text-base' : 'text-sm'
                }`}>
                  {project.description}
                </p>
                
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-4">
                  <TrendingUp className="w-4 h-4" />
                  {project.result}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-4">
                {project.tech.map((tech, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {tech}
                  </Badge>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

function SkillsSection() {
  const skills = {
    'Languages': [
      { name: 'Python', level: 95 },
      { name: 'TypeScript', level: 85 },
      { name: 'C++', level: 75 },
      { name: 'SQL', level: 80 }
    ],
    'ML/Data': [
      { name: 'PyTorch', level: 90 },
      { name: 'TensorFlow', level: 80 },
      { name: 'Transformers', level: 85 },
      { name: 'scikit-learn', level: 90 },
      { name: 'Pandas', level: 95 }
    ],
    'Infrastructure': [
      { name: 'AWS', level: 85 },
      { name: 'Docker', level: 90 },
      { name: 'Kubernetes', level: 75 },
      { name: 'MLflow', level: 80 },
      { name: 'GitHub Actions', level: 85 }
    ],
    'Frontend': [
      { name: 'React', level: 80 },
      { name: 'Next.js', level: 75 },
      { name: 'Tailwind', level: 85 }
    ]
  }
  
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-heading font-bold text-center mb-4">
          Technical Skills
        </h2>
        <p className="text-center text-muted-foreground mb-16 text-balance">
          {'Full-stack ML engineering from model to deployment'}
        </p>
        
        <div className="grid md:grid-cols-2 gap-8">
          {Object.entries(skills).map(([category, items]) => (
            <Card key={category} className="p-6 bg-card/50 backdrop-blur border-border">
              <h3 className="text-xl font-heading font-bold mb-6 flex items-center gap-2">
                {category === 'Languages' && <Code2 className="w-5 h-5 text-primary" />}
                {category === 'ML/Data' && <Brain className="w-5 h-5 text-primary" />}
                {category === 'Infrastructure' && <Cloud className="w-5 h-5 text-primary" />}
                {category === 'Frontend' && <Database className="w-5 h-5 text-primary" />}
                {category}
              </h3>
              <div className="space-y-4">
                {items.map((skill) => (
                  <div key={skill.name} className="group">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium group-hover:text-primary transition-colors">
                        {skill.name}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">
                        {skill.level}%
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all duration-1000 group-hover:from-primary group-hover:to-primary"
                        style={{ width: `${skill.level}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="py-12 px-4 border-t border-border bg-card/30 backdrop-blur">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h3 className="font-heading font-bold text-lg mb-1">Michael Dickinson</h3>
            <p className="text-sm text-muted-foreground">
              Open to Summer 2026 MLOps & MLE opportunities
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-3 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-all hover:scale-110"
            >
              <Github className="w-5 h-5" />
            </a>
            <a 
              href="https://linkedin.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-3 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-all hover:scale-110"
            >
              <Linkedin className="w-5 h-5" />
            </a>
            <a 
              href="mailto:michael@example.com"
              className="p-3 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-all hover:scale-110"
            >
              <Mail className="w-5 h-5" />
            </a>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-border text-center">
          <p className="text-xs text-muted-foreground font-mono">
            {'Last updated: February 2026 • Built with Next.js & Tailwind CSS'}
          </p>
        </div>
        
        {/* Code Snippet Easter Egg */}
        <div className="mt-8 p-4 bg-muted/30 rounded-lg border border-border/50 font-mono text-xs overflow-x-auto">
          <div className="flex items-center gap-2 mb-2 text-muted-foreground">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/50" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
              <div className="w-3 h-3 rounded-full bg-green-500/50" />
            </div>
            <span className="ml-2">model_pipeline.py</span>
          </div>
          <pre className="text-muted-foreground">
            <code>{`def deploy_model(model, version):
    """Deploy ML model to production with monitoring."""
    container = containerize(model, version)
    endpoint = deploy_to_k8s(container)
    setup_monitoring(endpoint)
    return endpoint.url`}</code>
          </pre>
        </div>
      </div>
    </footer>
  )
}
