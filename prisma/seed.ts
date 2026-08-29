import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // ==================== USERS ====================
  const passwordHash = await bcrypt.hash("Admin@123", 12);

  const superAdmin = await prisma.user.upsert({
    where: { email: "superadmin@softcell.com" },
    update: {},
    create: {
      email: "superadmin@softcell.com",
      password: passwordHash,
      name: "Super Admin",
      role: "SUPERADMIN",
      isActive: true,
      isEmailVerified: true,
      jobTitle: "System Administrator",
      department: "IT",
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@softcell.com" },
    update: {},
    create: {
      email: "admin@softcell.com",
      password: passwordHash,
      name: "Admin User",
      role: "ADMIN",
      isActive: true,
      isEmailVerified: true,
      jobTitle: "Platform Admin",
      department: "Operations",
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: "manager@softcell.com" },
    update: {},
    create: {
      email: "manager@softcell.com",
      password: passwordHash,
      name: "Project Manager",
      role: "MANAGER",
      isActive: true,
      isEmailVerified: true,
      jobTitle: "Senior Project Manager",
      department: "Delivery",
    },
  });

  const marketer = await prisma.user.upsert({
    where: { email: "marketer@softcell.com" },
    update: {},
    create: {
      email: "marketer@softcell.com",
      password: passwordHash,
      name: "Marketing Lead",
      role: "MARKETER",
      isActive: true,
      isEmailVerified: true,
      jobTitle: "Marketing Manager",
      department: "Marketing",
    },
  });

  const clientUser = await prisma.user.upsert({
    where: { email: "client@example.com" },
    update: {},
    create: {
      email: "client@example.com",
      password: passwordHash,
      name: "Client User",
      role: "CLIENT",
      isActive: true,
      isEmailVerified: true,
      jobTitle: "CTO",
      department: "Technology",
    },
  });

  console.log("✅ Users seeded");

  // ==================== ROLES ====================
  const roles = [
    {
      name: "SUPERADMIN",
      displayName: "Super Administrator",
      description: "Full system access",
      permissions: ["*"],
      isSystem: true,
    },
    {
      name: "ADMIN",
      displayName: "Administrator",
      description: "Administrative access",
      permissions: [
        "users.*",
        "content.*",
        "settings.*",
        "analytics.read",
        "leads.*",
      ],
      isSystem: true,
    },
    {
      name: "MANAGER",
      displayName: "Manager",
      description: "Project and team management",
      permissions: ["content.*", "projects.*", "leads.*", "analytics.read"],
      isSystem: true,
    },
    {
      name: "MARKETER",
      displayName: "Marketer",
      description: "Marketing and content management",
      permissions: ["content.*", "campaigns.*", "analytics.read", "leads.read"],
      isSystem: true,
    },
    {
      name: "CLIENT",
      displayName: "Client",
      description: "Client portal access",
      permissions: ["projects.read", "deliverables.read", "milestones.read"],
      isSystem: true,
    },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: { ...role, permissions: role.permissions as any },
    });
  }
  console.log("✅ Roles seeded");

  // ==================== SETTINGS ====================
  const settings = [
    {
      key: "site_name",
      value: "SoftCell Technologies",
      type: "string",
      group: "general",
      label: "Site Name",
    },
    {
      key: "site_logo",
      value: "",
      type: "string",
      group: "general",
      label: "Site Logo URL",
    },
    {
      key: "site_tagline",
      value: "Enterprise Software & AI Solutions",
      type: "string",
      group: "general",
      label: "Tagline",
    },
    {
      key: "site_description",
      value:
        "Leading provider of enterprise software, fintech solutions, and AI-powered platforms.",
      type: "text",
      group: "seo",
      label: "Site Description",
    },
    {
      key: "contact_email",
      value: "info@softcell.com",
      type: "string",
      group: "general",
      label: "Contact Email",
    },
    {
      key: "contact_phone",
      value: "+1 (866) 573-9604",
      type: "string",
      group: "general",
      label: "Contact Phone",
    },
    {
      key: "contact_address",
      value: "123 Innovation Drive, Tech Park, CA 94025",
      type: "text",
      group: "general",
      label: "Address",
    },
    {
      key: "social_linkedin",
      value: "https://linkedin.com/company/softcell",
      type: "string",
      group: "social",
      label: "LinkedIn",
    },
    {
      key: "social_twitter",
      value: "https://twitter.com/softcell",
      type: "string",
      group: "social",
      label: "Twitter",
    },
    {
      key: "social_github",
      value: "https://github.com/softcell",
      type: "string",
      group: "social",
      label: "GitHub",
    },
    {
      key: "social_facebook",
      value: "https://facebook.com/softcell",
      type: "string",
      group: "social",
      label: "Facebook",
    },
    {
      key: "analytics_enabled",
      value: "true",
      type: "boolean",
      group: "analytics",
      label: "Enable Analytics",
    },
    {
      key: "chatbot_enabled",
      value: "true",
      type: "boolean",
      group: "chatbot",
      label: "Enable Chatbot",
    },
    {
      key: "newsletter_enabled",
      value: "true",
      type: "boolean",
      group: "newsletter",
      label: "Enable Newsletter",
    },
    {
      key: "maintenance_mode",
      value: "false",
      type: "boolean",
      group: "system",
      label: "Maintenance Mode",
    },
  ];

  for (const s of settings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: {},
      create: s,
    });
  }
  console.log("✅ Settings seeded");

  // ==================== PAGES ====================
  const pages = [
    {
      slug: "home",
      title: "Home",
      description: "Welcome to SoftCell Technologies",
      status: "PUBLISHED" as const,
      template: "home",
      order: 0,
      authorId: superAdmin.id,
      metaTitle: "SoftCell Technologies - Enterprise Software & AI Solutions",
      metaDescription:
        "Leading provider of enterprise software, fintech solutions, and AI-powered platforms.",
    },
    {
      slug: "about",
      title: "About Us",
      description: "Learn about our company",
      status: "PUBLISHED" as const,
      template: "default",
      order: 1,
      authorId: superAdmin.id,
      metaTitle: "About SoftCell Technologies",
      metaDescription:
        "Discover our mission, vision, and the team behind SoftCell Technologies.",
    },
    {
      slug: "services",
      title: "Our Services",
      description: "Explore our service offerings",
      status: "PUBLISHED" as const,
      template: "services",
      order: 2,
      authorId: superAdmin.id,
    },
    {
      slug: "products",
      title: "Our Products",
      description: "Discover our product suite",
      status: "PUBLISHED" as const,
      template: "products",
      order: 3,
      authorId: superAdmin.id,
    },
    {
      slug: "case-studies",
      title: "Case Studies",
      description: "See our success stories",
      status: "PUBLISHED" as const,
      template: "case-studies",
      order: 4,
      authorId: superAdmin.id,
    },
    {
      slug: "blog",
      title: "Blog",
      description: "Latest insights and articles",
      status: "PUBLISHED" as const,
      template: "blog",
      order: 5,
      authorId: superAdmin.id,
    },
    {
      slug: "careers",
      title: "Careers",
      description: "Join our team",
      status: "PUBLISHED" as const,
      template: "careers",
      order: 6,
      authorId: superAdmin.id,
    },
    {
      slug: "contact",
      title: "Contact Us",
      description: "Get in touch with us",
      status: "PUBLISHED" as const,
      template: "contact",
      order: 7,
      authorId: superAdmin.id,
    },
    {
      slug: "privacy-policy",
      title: "Privacy Policy",
      description: "Our privacy policy",
      status: "PUBLISHED" as const,
      template: "legal",
      order: 8,
      authorId: superAdmin.id,
    },
    {
      slug: "terms-of-service",
      title: "Terms of Service",
      description: "Terms and conditions",
      status: "PUBLISHED" as const,
      template: "legal",
      order: 9,
      authorId: superAdmin.id,
    },
  ];

  for (const page of pages) {
    await prisma.page.upsert({
      where: { slug: page.slug },
      update: {},
      create: page,
    });
  }

  // Add blocks to home page
  const homePage = await prisma.page.findUnique({ where: { slug: "home" } });
  if (homePage) {
    const existingBlocks = await prisma.pageBlock.count({
      where: { pageId: homePage.id },
    });
    if (existingBlocks === 0) {
      await prisma.pageBlock.createMany({
        data: [
          {
            pageId: homePage.id,
            type: "hero",
            order: 0,
            content: {
              title: "Transforming Businesses Through Technology",
              subtitle:
                "Enterprise software, AI solutions, and fintech platforms that drive growth and innovation.",
              ctaText: "Get Started",
              ctaLink: "/contact",
              backgroundImage: "/images/hero-bg.jpg",
            },
          },
          {
            pageId: homePage.id,
            type: "services-grid",
            order: 1,
            content: {
              title: "Our Services",
              subtitle:
                "Comprehensive technology solutions for modern enterprises",
              showCount: 6,
            },
          },
          {
            pageId: homePage.id,
            type: "products-showcase",
            order: 2,
            content: {
              title: "Our Products",
              subtitle: "Innovative products built for scale",
              showCount: 4,
            },
          },
          {
            pageId: homePage.id,
            type: "stats",
            order: 3,
            content: {
              title: "By The Numbers",
              items: [
                { label: "Projects Delivered", value: "500+" },
                { label: "Happy Clients", value: "200+" },
                { label: "Team Members", value: "150+" },
                { label: "Years Experience", value: "15+" },
              ],
            },
          },
          {
            pageId: homePage.id,
            type: "testimonials",
            order: 4,
            content: { title: "What Our Clients Say", showCount: 3 },
          },
          {
            pageId: homePage.id,
            type: "clients-logos",
            order: 5,
            content: { title: "Trusted By", showFeatured: true },
          },
          {
            pageId: homePage.id,
            type: "cta",
            order: 6,
            content: {
              title: "Ready to Transform Your Business?",
              subtitle: "Let's discuss how we can help you achieve your goals.",
              ctaText: "Contact Us",
              ctaLink: "/contact",
            },
          },
        ],
      });
    }
  }
  console.log("✅ Pages seeded");

  // ==================== SERVICES ====================
  const services = [
    {
      name: "Custom Software Development",
      slug: "custom-software-development",
      description:
        "End-to-end custom software solutions tailored to your business needs.",
      longDescription:
        "We design, develop, and deploy custom software solutions that address your unique business challenges. Our team of experienced engineers leverages cutting-edge technologies to build scalable, secure, and maintainable applications.",
      icon: "Code",
      highlights: [
        "Full-stack development",
        "Cloud-native architecture",
        "Agile methodology",
        "DevOps integration",
      ],
      technologies: [
        "React",
        "Node.js",
        "Python",
        "AWS",
        "Docker",
        "Kubernetes",
      ],
      status: "PUBLISHED" as const,
      order: 0,
    },
    {
      name: "AI & Machine Learning",
      slug: "ai-machine-learning",
      description:
        "Harness the power of artificial intelligence to drive business innovation.",
      longDescription:
        "Our AI and ML solutions help businesses automate processes, gain insights from data, and create intelligent applications. From natural language processing to computer vision, we deliver AI solutions that create real business value.",
      icon: "Brain",
      highlights: [
        "Predictive analytics",
        "Natural language processing",
        "Computer vision",
        "Recommendation engines",
      ],
      technologies: [
        "TensorFlow",
        "PyTorch",
        "OpenAI",
        "LangChain",
        "Python",
        "MLflow",
      ],
      status: "PUBLISHED" as const,
      order: 1,
    },
    {
      name: "Fintech Solutions",
      slug: "fintech-solutions",
      description: "Secure and compliant financial technology platforms.",
      longDescription:
        "We build robust fintech solutions including payment processing systems, digital banking platforms, and financial analytics tools. Our solutions are designed with security, compliance, and scalability at their core.",
      icon: "Wallet",
      highlights: [
        "Payment processing",
        "Digital banking",
        "Regulatory compliance",
        "Risk management",
      ],
      technologies: ["Stripe", "Plaid", "Blockchain", "Node.js", "PostgreSQL"],
      status: "PUBLISHED" as const,
      order: 2,
    },
    {
      name: "Cloud & DevOps",
      slug: "cloud-devops",
      description: "Cloud migration, infrastructure, and DevOps automation.",
      longDescription:
        "We help organizations migrate to the cloud, optimize their infrastructure, and implement DevOps practices for faster, more reliable software delivery.",
      icon: "Cloud",
      highlights: [
        "Cloud migration",
        "Infrastructure as Code",
        "CI/CD pipelines",
        "Monitoring & observability",
      ],
      technologies: [
        "AWS",
        "Azure",
        "GCP",
        "Terraform",
        "Kubernetes",
        "Jenkins",
      ],
      status: "PUBLISHED" as const,
      order: 3,
    },
    {
      name: "Mobile App Development",
      slug: "mobile-app-development",
      description: "Native and cross-platform mobile applications.",
      longDescription:
        "We create beautiful, performant mobile applications for iOS and Android. Whether you need a native app or a cross-platform solution, our mobile team delivers exceptional user experiences.",
      icon: "Smartphone",
      highlights: [
        "iOS & Android",
        "Cross-platform (React Native)",
        "UI/UX design",
        "App Store optimization",
      ],
      technologies: ["React Native", "Swift", "Kotlin", "Flutter", "Firebase"],
      status: "PUBLISHED" as const,
      order: 4,
    },
    {
      name: "Cybersecurity",
      slug: "cybersecurity",
      description:
        "Comprehensive security solutions to protect your digital assets.",
      longDescription:
        "Our cybersecurity services help organizations identify vulnerabilities, implement robust security measures, and maintain compliance with industry standards.",
      icon: "Shield",
      highlights: [
        "Penetration testing",
        "Security audits",
        "Compliance (SOC2, ISO 27001)",
        "Incident response",
      ],
      technologies: ["SIEM", "WAF", "Zero Trust", "Encryption", "IAM"],
      status: "PUBLISHED" as const,
      order: 5,
    },
  ];

  for (const svc of services) {
    await prisma.service.upsert({
      where: { slug: svc.slug },
      update: {},
      create: svc,
    });
  }
  console.log("✅ Services seeded");

  // ==================== PRODUCTS ====================
  const products = [
    {
      name: "SoftCell ERP",
      slug: "softcell-erp",
      description:
        "Enterprise Resource Planning platform for modern businesses.",
      longDescription:
        "A comprehensive ERP solution that integrates finance, HR, supply chain, and operations into a single platform. Built for scalability and customization.",
      icon: "LayoutDashboard",
      categoryBadge: "Enterprise Platform",
      features: [
        "Financial management",
        "HR & payroll",
        "Supply chain",
        "Business intelligence",
        "Custom workflows",
      ],
      technologies: [
        "React 18.2",
        "Node.js LTS",
        "PostgreSQL vPS",
        "Redis SE",
        "Docker Cluster",
      ],
      status: "PUBLISHED" as const,
      order: 0,
    },
    {
      name: "PayFlow Pro",
      slug: "payflow-pro",
      description: "Next-generation payment processing platform.",
      longDescription:
        "A secure, PCI-DSS compliant payment processing platform supporting multiple payment methods, currencies, and real-time transaction monitoring.",
      icon: "CreditCard",
      categoryBadge: "Fintech",
      features: [
        "Multi-currency support",
        "Real-time monitoring",
        "Fraud detection",
        "API-first design",
        "PCI-DSS compliant",
      ],
      technologies: ["Node.js", "Stripe", "PostgreSQL", "Redis", "Kafka"],
      status: "PUBLISHED" as const,
      order: 1,
    },
    {
      name: "InsightAI",
      slug: "insight-ai",
      description: "AI-powered business intelligence and analytics platform.",
      longDescription:
        "Transform your data into actionable insights with our AI-powered analytics platform. Features natural language querying, predictive analytics, and automated reporting.",
      icon: "BarChart3",
      categoryBadge: "Analytics",
      features: [
        "Natural language queries",
        "Predictive analytics",
        "Automated reports",
        "Custom dashboards",
        "Data connectors",
      ],
      technologies: [
        "Python",
        "TensorFlow",
        "React",
        "Apache Spark",
        "Elasticsearch",
      ],
      status: "PUBLISHED" as const,
      order: 2,
    },
    {
      name: "SecureVault",
      slug: "securevault",
      description: "Enterprise-grade identity and access management.",
      longDescription:
        "A comprehensive IAM solution providing SSO, MFA, role-based access control, and compliance reporting for enterprise organizations.",
      icon: "Lock",
      categoryBadge: "Security",
      features: [
        "Single Sign-On",
        "Multi-factor auth",
        "RBAC",
        "Compliance reporting",
        "Directory integration",
      ],
      technologies: ["Go", "React", "PostgreSQL", "LDAP", "OAuth2/OIDC"],
      status: "PUBLISHED" as const,
      order: 3,
    },
  ];

  for (const prod of products) {
    await prisma.product.upsert({
      where: { slug: prod.slug },
      update: { categoryBadge: (prod as any).categoryBadge },
      create: prod,
    });
  }
  console.log("✅ Products seeded");

  // ==================== BLOG CATEGORIES & TAGS ====================
  const categories = [
    {
      name: "Technology",
      slug: "technology",
      description: "Latest in technology trends",
      order: 0,
    },
    {
      name: "AI & Machine Learning",
      slug: "ai-ml",
      description: "AI and ML insights",
      order: 1,
    },
    {
      name: "Fintech",
      slug: "fintech",
      description: "Financial technology news",
      order: 2,
    },
    {
      name: "Cloud Computing",
      slug: "cloud",
      description: "Cloud infrastructure and services",
      order: 3,
    },
    {
      name: "Cybersecurity",
      slug: "cybersecurity",
      description: "Security best practices",
      order: 4,
    },
    {
      name: "Company News",
      slug: "company-news",
      description: "Updates from SoftCell",
      order: 5,
    },
  ];

  const createdCategories: any[] = [];
  for (const cat of categories) {
    const c = await prisma.blogCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    createdCategories.push(c);
  }

  const tags = [
    { name: "JavaScript", slug: "javascript" },
    { name: "Python", slug: "python" },
    { name: "React", slug: "react" },
    { name: "Node.js", slug: "nodejs" },
    { name: "AI", slug: "ai" },
    { name: "DevOps", slug: "devops" },
    { name: "Security", slug: "security" },
    { name: "Startup", slug: "startup" },
    { name: "Enterprise", slug: "enterprise" },
    { name: "Tutorial", slug: "tutorial" },
  ];

  for (const tag of tags) {
    await prisma.blogTag.upsert({
      where: { slug: tag.slug },
      update: {},
      create: tag,
    });
  }

  // Blog Posts
  const blogPosts = [
    {
      title: "The Future of Enterprise AI in 2025",
      slug: "future-enterprise-ai-2025",
      excerpt:
        "Explore how AI is transforming enterprise operations and what to expect in the coming year.",
      content:
        "Artificial intelligence continues to reshape how enterprises operate. From automated customer service to predictive maintenance, AI is becoming an integral part of business strategy.\n\n## Key Trends\n\n1. **Generative AI Integration** - More businesses are integrating generative AI into their workflows.\n2. **AI-Powered Decision Making** - Real-time analytics and AI-driven insights are becoming standard.\n3. **Ethical AI** - Organizations are prioritizing responsible AI development.\n\n## What This Means for Your Business\n\nThe adoption of AI is no longer optional for enterprises that want to remain competitive. Our team at SoftCell has been at the forefront of implementing AI solutions that deliver measurable ROI.",
      authorId: marketer.id,
      status: "PUBLISHED" as const,
      publishedAt: new Date("2025-01-15"),
      readTime: 5,
      viewCount: 1250,
    },
    {
      title: "Building Scalable Fintech Platforms: A Complete Guide",
      slug: "building-scalable-fintech-platforms",
      excerpt:
        "Learn the architecture patterns and best practices for building fintech platforms that scale.",
      content:
        "Building a fintech platform requires careful consideration of security, compliance, and scalability. In this guide, we share our experience building payment processing systems and digital banking platforms.\n\n## Architecture Considerations\n\n- **Microservices Architecture** - Break down your platform into manageable services.\n- **Event-Driven Design** - Use event sourcing for transaction processing.\n- **Security First** - Implement PCI-DSS compliance from day one.\n\n## Technology Stack\n\nWe recommend a modern stack including Node.js or Go for backend services, React for the frontend, and PostgreSQL with Redis for data management.",
      authorId: marketer.id,
      status: "PUBLISHED" as const,
      publishedAt: new Date("2025-02-01"),
      readTime: 8,
      viewCount: 890,
    },
    {
      title: "DevOps Best Practices for Enterprise Teams",
      slug: "devops-best-practices-enterprise",
      excerpt:
        "Essential DevOps practices that every enterprise development team should adopt.",
      content:
        "DevOps is more than just tools—it's a culture shift that enables faster, more reliable software delivery.\n\n## Core Practices\n\n1. **Infrastructure as Code** - Manage your infrastructure using version-controlled code.\n2. **CI/CD Pipelines** - Automate your build, test, and deployment processes.\n3. **Monitoring & Observability** - Implement comprehensive monitoring from the start.\n4. **Security Integration** - Shift security left with DevSecOps practices.\n\n## Tools We Recommend\n\n- Terraform for IaC\n- GitHub Actions or Jenkins for CI/CD\n- Prometheus + Grafana for monitoring\n- SonarQube for code quality",
      authorId: admin.id,
      status: "PUBLISHED" as const,
      publishedAt: new Date("2025-01-20"),
      readTime: 6,
      viewCount: 670,
    },
  ];

  for (const post of blogPosts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: {},
      create: post,
    });
  }
  console.log("✅ Blog seeded");

  // ==================== TEAM MEMBERS ====================
  const teamMembers = [
    {
      name: "Mustafa Rahman",
      position: "Chief Executive Officer",
      department: "Executive",
      bio: "Mustafa is a visionary leader with 20+ years of experience in enterprise software. He co-founded SoftCell with a mission to democratize enterprise technology for businesses worldwide.",
      linkedIn: "https://linkedin.com/in/mustafa-rahman",
      order: 0,
      isLeadership: true,
      status: "PUBLISHED" as const,
    },
    {
      name: "Sarah Al-Fayed",
      position: "Chief Technology Officer",
      department: "Executive",
      bio: "Sarah drives SoftCell's technology strategy with deep expertise in AI, cloud architecture, and distributed systems. She leads a team of world-class engineers.",
      linkedIn: "https://linkedin.com/in/sarah-al-fayed",
      order: 1,
      isLeadership: true,
      status: "PUBLISHED" as const,
    },
    {
      name: "David Chen",
      position: "Head of Security",
      department: "Security",
      bio: "David oversees all security operations and compliance initiatives, ensuring SoftCell and its clients maintain the highest standards of data protection and regulatory adherence.",
      linkedIn: "https://linkedin.com/in/david-chen",
      order: 2,
      isLeadership: true,
      status: "PUBLISHED" as const,
    },
    {
      name: "Md Arif Patwary",
      position: "User Experience Designer",
      department: "Design",
      bio: "Arif crafts intuitive and visually compelling user experiences. His design philosophy bridges human-centered design with enterprise-grade functionality.",
      linkedIn: "https://linkedin.com/in/arif-patwary",
      order: 3,
      isLeadership: false,
      status: "PUBLISHED" as const,
    },
    {
      name: "Arif Sensei",
      position: "AI Specialist",
      department: "Design",
      bio: "Arif Sensei brings a unique blend of AI expertise and creative vision, designing intelligent systems that push the boundaries of what enterprise software can achieve.",
      linkedIn: "https://linkedin.com/in/arif-sensei",
      order: 4,
      isLeadership: false,
      status: "PUBLISHED" as const,
    },
    {
      name: "Al Influencer (Arif)",
      position: "Graphics Designer",
      department: "Design",
      bio: "A creative powerhouse who brings brands to life through bold visual storytelling and cutting-edge graphic design for SoftCell's product suite.",
      linkedIn: "https://linkedin.com/in/al-influencer",
      order: 5,
      isLeadership: false,
      status: "PUBLISHED" as const,
    },
    {
      name: "James Thompson",
      position: "Senior Software Engineer",
      department: "Engineering",
      bio: "Full-stack developer with expertise in React, Node.js, and cloud technologies.",
      order: 6,
      isLeadership: false,
      status: "PUBLISHED" as const,
    },
  ];

  for (const member of teamMembers) {
    const existing = await prisma.teamMember.findFirst({
      where: { name: member.name },
    });
    if (!existing) await prisma.teamMember.create({ data: member });
  }
  console.log("✅ Team members seeded");

  // ==================== CLIENTS ====================
  const clients = [
    {
      name: "TechCorp Global",
      logo: "https://ui-avatars.com/api/?name=TechCorp+Global&size=200&background=3b82f6&color=fff&bold=true",
      website: "https://techcorp.example.com",
      industry: "Technology",
      description: "Global technology conglomerate",
      iconType: "Monitor",
      isFeatured: true,
      order: 0,
      status: "PUBLISHED" as const,
    },
    {
      name: "FinanceFirst Bank",
      logo: "https://ui-avatars.com/api/?name=FinanceFirst+Bank&size=200&background=10b981&color=fff&bold=true",
      website: "https://financefirst.example.com",
      industry: "Banking",
      description: "Leading digital bank",
      iconType: "Landmark",
      isFeatured: true,
      order: 1,
      status: "PUBLISHED" as const,
    },
    {
      name: "HealthPlus Systems",
      logo: "https://ui-avatars.com/api/?name=HealthPlus+Systems&size=200&background=ef4444&color=fff&bold=true",
      website: "https://healthplus.example.com",
      industry: "Healthcare",
      description: "Healthcare technology provider",
      iconType: "Heart",
      isFeatured: true,
      order: 2,
      status: "PUBLISHED" as const,
    },
    {
      name: "RetailMax",
      logo: "https://ui-avatars.com/api/?name=RetailMax&size=200&background=f59e0b&color=fff&bold=true",
      website: "https://retailmax.example.com",
      industry: "Retail",
      description: "E-commerce platform",
      iconType: "ShoppingCart",
      isFeatured: true,
      order: 3,
      status: "PUBLISHED" as const,
    },
    {
      name: "EduTech Academy",
      logo: "https://ui-avatars.com/api/?name=EduTech+Academy&size=200&background=8b5cf6&color=fff&bold=true",
      website: "https://edutech.example.com",
      industry: "Education",
      description: "Online learning platform",
      iconType: "BookOpen",
      isFeatured: false,
      order: 4,
      status: "PUBLISHED" as const,
    },
    {
      name: "GreenEnergy Corp",
      logo: "https://ui-avatars.com/api/?name=GreenEnergy+Corp&size=200&background=059669&color=fff&bold=true",
      website: "https://greenenergy.example.com",
      industry: "Energy",
      description: "Renewable energy solutions",
      iconType: "Zap",
      isFeatured: false,
      order: 5,
      status: "PUBLISHED" as const,
    },
  ];

  for (const client of clients) {
    const existing = await prisma.client.findFirst({
      where: { name: client.name },
    });
    if (existing) {
      await prisma.client.update({
        where: { id: existing.id },
        data: { iconType: (client as any).iconType },
      });
    } else {
      await prisma.client.create({ data: client });
    }
  }
  console.log("✅ Clients seeded");

  // ==================== CERTIFICATIONS ====================
  const certifications = [
    {
      name: "ISO 27001",
      slug: "iso-27001",
      description: "Information Security Management System certification",
      certificateNumber: "IS-2024-001",
      issuedDate: new Date("2024-01-15"),
      expiryDate: new Date("2027-01-15"),
      isFeatured: true,
      order: 0,
      status: "PUBLISHED" as const,
    },
    {
      name: "SOC 2 Type II",
      slug: "soc2-type-ii",
      description: "Service Organization Control 2 compliance",
      certificateNumber: "SOC2-2024-002",
      issuedDate: new Date("2024-03-01"),
      isFeatured: true,
      order: 1,
      status: "PUBLISHED" as const,
    },
    {
      name: "PCI DSS",
      slug: "pci-dss",
      description: "Payment Card Industry Data Security Standard",
      certificateNumber: "PCI-2024-003",
      issuedDate: new Date("2024-06-01"),
      expiryDate: new Date("2025-06-01"),
      isFeatured: true,
      order: 2,
      status: "PUBLISHED" as const,
    },
    {
      name: "GDPR Compliant",
      slug: "gdpr",
      description: "General Data Protection Regulation compliance",
      isFeatured: true,
      order: 3,
      status: "PUBLISHED" as const,
    },
    {
      name: "AWS Advanced Partner",
      slug: "aws-advanced-partner",
      description: "Amazon Web Services Advanced Consulting Partner",
      isFeatured: false,
      order: 4,
      status: "PUBLISHED" as const,
    },
  ];

  for (const cert of certifications) {
    await prisma.certification.upsert({
      where: { slug: cert.slug },
      update: {},
      create: cert,
    });
  }
  console.log("✅ Certifications seeded");

  // ==================== CASE STUDIES ====================
  const customSoftwareService = await prisma.service.findUnique({
    where: { slug: "custom-software-development" },
  });
  const fintechService = await prisma.service.findUnique({
    where: { slug: "fintech-solutions" },
  });
  const aiService = await prisma.service.findUnique({
    where: { slug: "ai-machine-learning" },
  });

  const caseStudies = [
    {
      title: "Digital Banking Transformation for FinanceFirst",
      slug: "digital-banking-transformation",
      clientName: "FinanceFirst Bank",
      industry: "Banking",
      challenge:
        "FinanceFirst needed to modernize their legacy banking system to support digital-first customers while maintaining regulatory compliance.",
      solution:
        "We built a microservices-based digital banking platform with real-time transaction processing, AI-powered fraud detection, and a modern mobile app.",
      results:
        "The new platform increased customer acquisition by 40%, reduced transaction processing time by 60%, and achieved PCI-DSS compliance.",
      metrics: [
        { label: "Customer Growth", value: "+40%" },
        { label: "Processing Speed", value: "+60%" },
        { label: "Cost Reduction", value: "35%" },
      ],
      roiPercentage: 35,
      implementationPhases: [
        {
          phase: "01",
          title: "Data Integration & Synthesis",
          description:
            "Consolidated siloed data streams from 100+ ERP instances into a unified Azure-based data lake. Established real-time pipelines for POS telemetry, regional logistics, and external macroeconomic indicators.",
        },
        {
          phase: "02",
          title: "Neural Model Training",
          description:
            "Deployed Transformer-based forecasting models optimized for time-series retail data. Models underwent iterative training cycles using 10 years of historical performance data across diverse demographic segments.",
        },
        {
          phase: "03",
          title: "Automated Replenishment Rollout",
          description:
            "Integrated AI outputs directly into procurement workflows. Reorder triggers are now autonomously generated, verified by multi-agent validation, and executed via API integration with supplier networks.",
        },
      ],
      technologies: [
        "Node.js",
        "React Native",
        "PostgreSQL",
        "Kafka",
        "Kubernetes",
      ],
      serviceId: fintechService?.id,
      authorId: admin.id,
      order: 0,
      status: "PUBLISHED" as const,
      publishedAt: new Date("2025-01-10"),
    },
    {
      title: "AI-Powered Supply Chain Optimization",
      slug: "ai-supply-chain-optimization",
      clientName: "RetailMax Global",
      industry: "Retail",
      challenge:
        "RetailMax was struggling with inventory management and demand forecasting across 500+ stores globally. The existing system lacked real-time data integration and predictive capabilities.",
      solution:
        "We developed an AI-powered supply chain optimization system using machine learning for demand forecasting and automated inventory management, integrated with a Tier IV military-grade security architecture.",
      results:
        "Achieved seamless, secure, and uninterrupted operations across the entire 17,000 sq ft facility. The deployment resulted in a near-zero latency environment and eliminated previous bottleneck issues.",
      metrics: [
        { label: "SQ FT Coverage", value: "17,000" },
        { label: "Network Uptime", value: "100%" },
        { label: "Security Level", value: "Tier IV" },
      ],
      roiPercentage: 25,
      implementationPhases: [
        {
          phase: "01",
          title: "Data Integration & Synthesis",
          description:
            "Consolidated siloed data streams from 500+ store instances. Established real-time pipelines for inventory telemetry, regional logistics, and demand signal indicators.",
        },
        {
          phase: "02",
          title: "Neural Model Training",
          description:
            "Deployed Transformer-based forecasting models optimized for time-series retail data. Models underwent iterative training cycles using 10 years of historical performance data.",
        },
        {
          phase: "03",
          title: "Automated Replenishment Rollout",
          description:
            "Integrated AI outputs directly into procurement workflows. Reorder triggers are autonomously generated and executed via API integration with supplier networks.",
        },
      ],
      technologies: ["Python", "TensorFlow", "Apache Spark", "React", "AWS"],
      serviceId: aiService?.id,
      authorId: admin.id,
      order: 1,
      status: "PUBLISHED" as const,
      publishedAt: new Date("2025-01-20"),
    },
    {
      title: "Enterprise ERP Implementation for TechCorp",
      slug: "enterprise-erp-techcorp",
      clientName: "TechCorp Global",
      industry: "Technology",
      challenge:
        "TechCorp needed a unified ERP system to replace multiple disconnected legacy systems across 12 countries.",
      solution:
        "We implemented our SoftCell ERP platform with custom modules for multi-currency accounting, global HR management, and supply chain integration.",
      results:
        "Unified operations across all 12 countries, reduced operational costs by 25%, and improved reporting accuracy by 90%.",
      metrics: [
        { label: "Cost Reduction", value: "25%" },
        { label: "Reporting Accuracy", value: "90%" },
        { label: "Countries Unified", value: "12" },
      ],
      technologies: ["React", "Node.js", "PostgreSQL", "Redis", "Docker"],
      serviceId: customSoftwareService?.id,
      authorId: admin.id,
      order: 2,
      status: "PUBLISHED" as const,
      publishedAt: new Date("2024-12-15"),
    },
  ];

  for (const cs of caseStudies) {
    await prisma.caseStudy.upsert({
      where: { slug: cs.slug },
      update: {
        roiPercentage: (cs as any).roiPercentage,
        implementationPhases: (cs as any).implementationPhases as any,
      },
      create: {
        ...cs,
        metrics: cs.metrics as any,
        roiPercentage: (cs as any).roiPercentage,
        implementationPhases: (cs as any).implementationPhases as any,
      },
    });
  }
  console.log("✅ Case studies seeded");

  // ==================== TESTIMONIALS ====================
  const testimonials = [
    {
      clientName: "John Mitchell",
      company: "FinanceFirst Bank",
      position: "CTO",
      content:
        "SoftCell transformed our digital banking platform. Their expertise in fintech and security was exactly what we needed. The team delivered on time and exceeded our expectations.",
      rating: 5,
      industry: "Banking",
      isFeatured: true,
      order: 0,
      status: "PUBLISHED" as const,
    },
    {
      clientName: "Amanda Foster",
      company: "TechCorp Global",
      position: "VP of Operations",
      content:
        "The ERP implementation was seamless. SoftCell's team understood our complex requirements across multiple countries and delivered a solution that unified our operations.",
      rating: 5,
      industry: "Technology",
      isFeatured: true,
      order: 1,
      status: "PUBLISHED" as const,
    },
    {
      clientName: "Robert Chen",
      company: "RetailMax",
      position: "Head of Supply Chain",
      content:
        "The AI-powered supply chain system has been a game-changer. We've seen significant improvements in inventory management and customer satisfaction.",
      rating: 5,
      industry: "Retail",
      isFeatured: true,
      order: 2,
      status: "PUBLISHED" as const,
    },
    {
      clientName: "Dr. Sarah Williams",
      company: "HealthPlus Systems",
      position: "CEO",
      content:
        "Working with SoftCell on our healthcare platform was an excellent experience. They prioritized security and compliance while delivering an intuitive user experience.",
      rating: 4,
      industry: "Healthcare",
      isFeatured: false,
      order: 3,
      status: "PUBLISHED" as const,
    },
  ];

  for (const t of testimonials) {
    const existing = await prisma.testimonial.findFirst({
      where: { clientName: t.clientName },
    });
    if (!existing) await prisma.testimonial.create({ data: t });
  }
  console.log("✅ Testimonials seeded");

  // ==================== FAQ ====================
  const faqItems = [
    {
      question: "What industries do you serve?",
      answer:
        "We serve a wide range of industries including banking & finance, healthcare, retail, technology, energy, and education. Our solutions are adaptable to any industry with specific technology needs.",
      category: "General",
      order: 0,
      status: "PUBLISHED" as const,
    },
    {
      question: "How long does a typical project take?",
      answer:
        "Project timelines vary based on scope and complexity. A typical MVP takes 3-4 months, while enterprise implementations can take 6-12 months. We provide detailed timelines during the proposal phase.",
      category: "General",
      order: 1,
      status: "PUBLISHED" as const,
    },
    {
      question: "Do you provide ongoing support and maintenance?",
      answer:
        "Yes, we offer comprehensive support and maintenance packages including 24/7 monitoring, bug fixes, security updates, and feature enhancements. We also provide SLA-backed support tiers.",
      category: "Support",
      order: 2,
      status: "PUBLISHED" as const,
    },
    {
      question: "What is your development methodology?",
      answer:
        "We follow Agile/Scrum methodology with 2-week sprints, daily standups, and regular demos. This ensures transparency, flexibility, and continuous delivery of value.",
      category: "Process",
      order: 3,
      status: "PUBLISHED" as const,
    },
    {
      question: "How do you ensure data security?",
      answer:
        "Security is built into every layer of our solutions. We follow OWASP guidelines, implement encryption at rest and in transit, conduct regular security audits, and maintain compliance with standards like SOC2, ISO 27001, and PCI-DSS.",
      category: "Security",
      order: 4,
      status: "PUBLISHED" as const,
    },
    {
      question: "Can you integrate with our existing systems?",
      answer:
        "Absolutely. We specialize in system integration and have experience connecting with ERP systems, CRMs, payment gateways, legacy databases, and third-party APIs. We use modern integration patterns including REST APIs, webhooks, and message queues.",
      category: "Technical",
      order: 5,
      status: "PUBLISHED" as const,
    },
    {
      question: "What are your pricing models?",
      answer:
        "We offer flexible pricing models including fixed-price projects, time & materials, and dedicated team arrangements. The best model depends on your project scope and requirements. Contact us for a detailed quote.",
      category: "Pricing",
      order: 6,
      status: "PUBLISHED" as const,
    },
  ];

  for (const faq of faqItems) {
    const existing = await prisma.faqItem.findFirst({
      where: { question: faq.question },
    });
    if (!existing) await prisma.faqItem.create({ data: faq });
  }
  console.log("✅ FAQ seeded");

  // ==================== PARTNERS ====================
  const partners = [
    {
      name: "Amazon Web Services",
      logo: "/images/partners/aws.png",
      website: "https://aws.amazon.com",
      type: "Technology",
      description: "Advanced Consulting Partner",
      isFeatured: true,
      order: 0,
      status: "PUBLISHED" as const,
    },
    {
      name: "Microsoft Azure",
      logo: "/images/partners/azure.png",
      website: "https://azure.microsoft.com",
      type: "Technology",
      description: "Gold Partner",
      isFeatured: true,
      order: 1,
      status: "PUBLISHED" as const,
    },
    {
      name: "Google Cloud",
      logo: "/images/partners/gcp.png",
      website: "https://cloud.google.com",
      type: "Technology",
      description: "Premier Partner",
      isFeatured: true,
      order: 2,
      status: "PUBLISHED" as const,
    },
    {
      name: "Stripe",
      logo: "/images/partners/stripe.png",
      website: "https://stripe.com",
      type: "Fintech",
      description: "Verified Partner",
      isFeatured: true,
      order: 3,
      status: "PUBLISHED" as const,
    },
    {
      name: "OpenAI",
      logo: "/images/partners/openai.png",
      website: "https://openai.com",
      type: "AI",
      description: "API Partner",
      isFeatured: false,
      order: 4,
      status: "PUBLISHED" as const,
    },
  ];

  for (const partner of partners) {
    const existing = await prisma.partner.findFirst({
      where: { name: partner.name },
    });
    if (!existing) await prisma.partner.create({ data: partner });
  }
  console.log("✅ Partners seeded");

  // ==================== JOB LISTINGS ====================
  const jobs = [
    {
      title: "Senior Full-Stack Developer",
      slug: "senior-fullstack-developer",
      department: "Engineering",
      location: "San Francisco, CA (Hybrid)",
      type: "FULL_TIME" as const,
      description:
        "We are looking for an experienced full-stack developer to join our engineering team. You will work on enterprise applications using React, Node.js, and cloud technologies.",
      requirements:
        "- 5+ years of experience in full-stack development\n- Proficiency in React, TypeScript, and Node.js\n- Experience with PostgreSQL and Redis\n- Cloud experience (AWS/Azure/GCP)\n- Strong problem-solving skills",
      benefits:
        "- Competitive salary ($150K-$200K)\n- Health, dental, and vision insurance\n- 401(k) with company match\n- Flexible work arrangements\n- Professional development budget",
      salaryRange: "$150K - $200K",
      status: "OPEN" as const,
      publishedAt: new Date(),
    },
    {
      title: "AI/ML Engineer",
      slug: "ai-ml-engineer",
      department: "R&D",
      location: "Remote",
      type: "FULL_TIME" as const,
      description:
        "Join our AI research team to develop cutting-edge machine learning solutions for enterprise clients.",
      requirements:
        "- MS/PhD in Computer Science or related field\n- 3+ years of experience in ML/AI\n- Proficiency in Python, TensorFlow/PyTorch\n- Experience with NLP or Computer Vision\n- Published research is a plus",
      benefits:
        "- Competitive salary ($160K-$220K)\n- Full benefits package\n- Remote-first culture\n- Conference attendance budget\n- Research publication support",
      salaryRange: "$160K - $220K",
      status: "OPEN" as const,
      publishedAt: new Date(),
    },
    {
      title: "DevOps Engineer",
      slug: "devops-engineer",
      department: "Infrastructure",
      location: "New York, NY (Hybrid)",
      type: "FULL_TIME" as const,
      description:
        "We need a skilled DevOps engineer to manage our cloud infrastructure and CI/CD pipelines.",
      requirements:
        "- 4+ years of DevOps experience\n- Strong knowledge of AWS/Azure\n- Experience with Kubernetes and Docker\n- Terraform/Ansible proficiency\n- Monitoring tools (Prometheus, Grafana)",
      benefits:
        "- Competitive salary ($140K-$180K)\n- Full benefits package\n- Hybrid work model\n- On-call compensation\n- Learning & development budget",
      salaryRange: "$140K - $180K",
      status: "OPEN" as const,
      publishedAt: new Date(),
    },
  ];

  for (const job of jobs) {
    await prisma.jobListing.upsert({
      where: { slug: job.slug },
      update: {},
      create: job,
    });
  }
  console.log("✅ Job listings seeded");

  // ==================== CHATBOT QUESTIONS ====================
  const chatbotQuestions = [
    {
      question: "What services do you offer?",
      answer:
        "We offer Custom Software Development, AI & Machine Learning, Fintech Solutions, Cloud & DevOps, Mobile App Development, and Cybersecurity services. Visit our Services page to learn more!",
      category: "Services",
      keywords: ["services", "offer", "what do you do", "capabilities"],
      order: 0,
    },
    {
      question: "How can I contact you?",
      answer:
        "You can reach us through our Contact page, email us at info@softcell.com, or call us at +1 (866) 573-9604. We typically respond within 24 hours.",
      category: "Contact",
      keywords: ["contact", "reach", "email", "phone", "call"],
      order: 1,
    },
    {
      question: "Do you offer free consultations?",
      answer:
        "Yes! We offer a free initial consultation to discuss your project requirements and how we can help. Schedule one through our Contact page.",
      category: "Sales",
      keywords: ["consultation", "free", "meeting", "discuss", "quote"],
      order: 2,
    },
    {
      question: "What technologies do you work with?",
      answer:
        "We work with a wide range of technologies including React, Node.js, Python, AWS, Azure, GCP, Kubernetes, TensorFlow, and many more. Our team stays current with the latest technology trends.",
      category: "Technical",
      keywords: [
        "technology",
        "tech stack",
        "programming",
        "languages",
        "frameworks",
      ],
      order: 3,
    },
    {
      question: "Are you hiring?",
      answer:
        "We are always looking for talented individuals! Check our Careers page for current openings, or send your resume to careers@softcell.com.",
      category: "Careers",
      keywords: ["hiring", "jobs", "career", "work", "position", "opening"],
      order: 4,
    },
    {
      question: "Where are you located?",
      answer:
        "Our headquarters is at 123 Innovation Drive, Tech Park, CA 94025. We also have offices in New York and London, and support remote work globally.",
      category: "General",
      keywords: ["location", "office", "where", "address", "headquarter"],
      order: 5,
    },
  ];

  for (const q of chatbotQuestions) {
    const existing = await prisma.chatbotQuestion.findFirst({
      where: { question: q.question },
    });
    if (!existing) await prisma.chatbotQuestion.create({ data: q });
  }
  console.log("✅ Chatbot questions seeded");

  // ==================== CONTENT SNIPPETS ====================
  const snippets = [
    {
      key: "footer_about",
      title: "Footer About Text",
      content: {
        text: "SoftCell Technologies is a leading provider of enterprise software, fintech solutions, and AI-powered platforms. We help businesses transform through technology.",
      },
      type: "text",
    },
    {
      key: "cta_default",
      title: "Default CTA",
      content: {
        title: "Ready to Get Started?",
        subtitle: "Let's discuss how we can help transform your business.",
        buttonText: "Contact Us",
        buttonLink: "/contact",
      },
      type: "cta",
    },
    {
      key: "newsletter_cta",
      title: "Newsletter CTA",
      content: {
        title: "Stay Updated",
        subtitle:
          "Subscribe to our newsletter for the latest insights and updates.",
        placeholder: "Enter your email",
        buttonText: "Subscribe",
      },
      type: "cta",
    },
    {
      key: "hero_stats",
      title: "Hero Statistics",
      content: {
        items: [
          { label: "Projects", value: "500+" },
          { label: "Clients", value: "200+" },
          { label: "Team", value: "150+" },
          { label: "Years", value: "15+" },
        ],
      },
      type: "stats",
    },
  ];

  for (const s of snippets) {
    await prisma.contentSnippet.upsert({
      where: { key: s.key },
      update: {},
      create: { ...s, content: s.content as any },
    });
  }
  console.log("✅ Content snippets seeded");

  // ==================== SAMPLE LEADS ====================
  const leads = [
    {
      name: "Alex Johnson",
      email: "alex@startup.io",
      phone: "+1-555-0101",
      company: "Startup.io",
      message: "We need a custom CRM solution for our growing team.",
      source: "CONTACT_FORM" as const,
      status: "NEW" as const,
      score: 75,
      serviceInterest: "Custom Software Development",
      gdprConsent: true,
    },
    {
      name: "Maria Garcia",
      email: "maria@bigcorp.com",
      phone: "+1-555-0102",
      company: "BigCorp Inc",
      message:
        "Interested in your AI analytics platform for our retail operations.",
      source: "DEMO_FORM" as const,
      status: "QUALIFIED" as const,
      score: 90,
      assigneeId: manager.id,
      serviceInterest: "AI & Machine Learning",
      gdprConsent: true,
    },
    {
      name: "Tom Wilson",
      email: "tom@fintech.co",
      company: "FinTech Co",
      message: "Looking for payment processing integration.",
      source: "ORGANIC" as const,
      status: "CONTACTED" as const,
      score: 60,
      serviceInterest: "Fintech Solutions",
      gdprConsent: true,
    },
  ];

  for (const lead of leads) {
    const existing = await prisma.lead.findFirst({
      where: { email: lead.email },
    });
    if (!existing) await prisma.lead.create({ data: lead });
  }
  console.log("✅ Leads seeded");

  // ==================== LEAD SCORING RULES ====================
  const scoringRules = [
    {
      name: "Visited pricing page",
      description: "Lead visited the pricing or packages page",
      condition: "page_view:pricing",
      score: 10,
      isActive: true,
    },
    {
      name: "Downloaded whitepaper",
      description: "Lead downloaded a gated resource",
      condition: "resource_download:*",
      score: 20,
      isActive: true,
    },
    {
      name: "Submitted contact form",
      description: "Lead submitted a contact or quote form",
      condition: "form_submit:contact",
      score: 30,
      isActive: true,
    },
    {
      name: "Requested demo",
      description: "Lead requested a product demo",
      condition: "form_submit:demo",
      score: 40,
      isActive: true,
    },
    {
      name: "Visited multiple service pages",
      description: "Lead viewed 3+ service pages in one session",
      condition: "page_view_count:services:3",
      score: 15,
      isActive: true,
    },
    {
      name: "Returning visitor",
      description: "Lead has visited the site more than once",
      condition: "visit_count:2+",
      score: 5,
      isActive: true,
    },
  ];

  for (const rule of scoringRules) {
    const existing = await prisma.leadScoringRule.findFirst({
      where: { name: rule.name },
    });
    if (!existing) await prisma.leadScoringRule.create({ data: rule });
  }
  console.log("✅ Lead scoring rules seeded");

  // ==================== RESOURCES / KNOWLEDGE HUB ====================
  const resources = [
    {
      title: "Enterprise AI Implementation Guide",
      slug: "enterprise-ai-guide",
      description:
        "A comprehensive guide to implementing AI solutions in enterprise environments, covering strategy, architecture, and best practices.",
      type: "whitepaper",
      category: "AI & Machine Learning",
      tags: ["AI", "Enterprise", "Guide"],
      isGated: true,
      status: "PUBLISHED" as const,
      publishedAt: new Date("2025-01-01"),
    },
    {
      title: "Fintech Security Best Practices",
      slug: "fintech-security-best-practices",
      description:
        "Learn how to build secure fintech applications that comply with PCI-DSS, SOC2, and other regulatory standards.",
      type: "whitepaper",
      category: "Security",
      tags: ["Fintech", "Security", "Compliance"],
      isGated: true,
      status: "PUBLISHED" as const,
      publishedAt: new Date("2025-02-15"),
    },
    {
      title: "Cloud Migration Checklist",
      slug: "cloud-migration-checklist",
      description:
        "Step-by-step checklist for planning and executing a successful cloud migration project.",
      type: "ebook",
      category: "Cloud",
      tags: ["Cloud", "Migration", "DevOps"],
      isGated: false,
      status: "PUBLISHED" as const,
      publishedAt: new Date("2025-03-01"),
    },
    {
      title: "Building Scalable Microservices - Webinar Recording",
      slug: "scalable-microservices-webinar",
      description:
        "Watch our CTO discuss patterns and anti-patterns in microservices architecture.",
      type: "webinar",
      category: "Architecture",
      tags: ["Microservices", "Architecture", "Webinar"],
      isGated: true,
      status: "PUBLISHED" as const,
      publishedAt: new Date("2025-01-20"),
    },
    {
      title: "Digital Transformation ROI Calculator",
      slug: "digital-transformation-roi-calculator",
      description:
        "Calculate the potential return on investment for your digital transformation initiative.",
      type: "tool",
      category: "Business",
      tags: ["ROI", "Digital Transformation", "Calculator"],
      isGated: false,
      status: "PUBLISHED" as const,
      publishedAt: new Date("2025-02-01"),
    },
  ];

  for (const r of resources) {
    await prisma.resource.upsert({
      where: { slug: r.slug },
      update: {},
      create: r,
    });
  }
  console.log("✅ Resources seeded");

  // ==================== PRESS RELEASES ====================
  const pressReleases = [
    {
      title: "SoftCell Technologies Raises $50M Series C to Expand AI Platform",
      slug: "series-c-funding-announcement",
      content:
        'SoftCell Technologies, a leading provider of enterprise software and AI solutions, today announced the closing of a $50 million Series C funding round led by Innovation Ventures.\n\nThe funding will be used to expand the company\'s AI-powered analytics platform, InsightAI, and accelerate growth in the fintech sector.\n\n"This investment validates our vision of making enterprise AI accessible and actionable," said Sarah Chen, CEO of SoftCell Technologies. "We\'re excited to use these resources to help more businesses transform through technology."',
      excerpt:
        "SoftCell Technologies closes $50M Series C funding round to expand AI platform and fintech solutions.",
      source: "PR Newswire",
      status: "PUBLISHED" as const,
      publishedAt: new Date("2025-01-15"),
    },
    {
      title:
        "SoftCell Named a Leader in Gartner Magic Quadrant for Enterprise AI",
      slug: "gartner-magic-quadrant-leader",
      content:
        "SoftCell Technologies has been recognized as a Leader in the 2025 Gartner Magic Quadrant for Enterprise AI Platforms.\n\nThe recognition highlights SoftCell's comprehensive AI capabilities, strong customer satisfaction, and innovative approach to enterprise intelligence.\n\n\"Being named a Leader by Gartner is a testament to our team's dedication to building world-class AI solutions,\" said Michael Rodriguez, CTO of SoftCell Technologies.",
      excerpt:
        "SoftCell recognized as a Leader in the 2025 Gartner Magic Quadrant for Enterprise AI Platforms.",
      source: "Gartner",
      status: "PUBLISHED" as const,
      publishedAt: new Date("2025-02-01"),
    },
    {
      title:
        "SoftCell Partners with AWS to Launch Financial Services Accelerator",
      slug: "aws-financial-services-accelerator",
      content:
        "SoftCell Technologies and Amazon Web Services (AWS) today announced a strategic partnership to launch the Financial Services Accelerator program.\n\nThe program will help financial institutions rapidly deploy cloud-native solutions while maintaining regulatory compliance.\n\nThe accelerator includes pre-built templates, compliance frameworks, and dedicated support from both SoftCell and AWS teams.",
      excerpt:
        "New partnership with AWS to help financial institutions accelerate cloud adoption.",
      source: "Business Wire",
      status: "PUBLISHED" as const,
      publishedAt: new Date("2025-03-01"),
    },
  ];

  for (const pr of pressReleases) {
    await prisma.pressRelease.upsert({
      where: { slug: pr.slug },
      update: {},
      create: pr,
    });
  }
  console.log("✅ Press releases seeded");

  // ==================== PROJECTS ====================
  const techCorpClient = await prisma.client.findFirst({
    where: { name: "TechCorp Global" },
  });
  const financeFirstClient = await prisma.client.findFirst({
    where: { name: "FinanceFirst Bank" },
  });
  const retailMaxClient = await prisma.client.findFirst({
    where: { name: "RetailMax" },
  });
  const healthPlusClient = await prisma.client.findFirst({
    where: { name: "HealthPlus Systems" },
  });

  const projects = [
    {
      name: "TechCorp ERP Platform",
      slug: "techcorp-erp-platform",
      description:
        "Full enterprise resource planning system with multi-currency support, HR management, and supply chain modules across 12 countries.",
      clientId: techCorpClient?.id,
      serviceId: customSoftwareService?.id,
      budget: 450000,
      startDate: new Date("2024-06-01"),
      endDate: new Date("2025-03-31"),
      status: "IN_PROGRESS" as const,
      progress: 72,
    },
    {
      name: "FinanceFirst Digital Banking",
      slug: "financefirst-digital-banking",
      description:
        "Modern digital banking platform with real-time transaction processing, AI fraud detection, and mobile app.",
      clientId: financeFirstClient?.id,
      serviceId: fintechService?.id,
      budget: 680000,
      startDate: new Date("2024-03-15"),
      endDate: new Date("2025-01-31"),
      status: "COMPLETED" as const,
      progress: 100,
    },
    {
      name: "RetailMax AI Supply Chain",
      slug: "retailmax-ai-supply-chain",
      description:
        "AI-powered supply chain optimization with demand forecasting and automated inventory management for 500+ stores.",
      clientId: retailMaxClient?.id,
      serviceId: aiService?.id,
      budget: 320000,
      startDate: new Date("2024-09-01"),
      endDate: new Date("2025-06-30"),
      status: "IN_PROGRESS" as const,
      progress: 55,
    },
    {
      name: "HealthPlus Patient Portal",
      slug: "healthplus-patient-portal",
      description:
        "HIPAA-compliant patient portal with telemedicine, appointment scheduling, and electronic health records integration.",
      clientId: healthPlusClient?.id,
      serviceId: customSoftwareService?.id,
      budget: 280000,
      startDate: new Date("2025-01-10"),
      endDate: new Date("2025-09-30"),
      status: "IN_PROGRESS" as const,
      progress: 25,
    },
    {
      name: "SoftCell Internal Analytics Dashboard",
      slug: "internal-analytics-dashboard",
      description:
        "Internal analytics and reporting dashboard for monitoring business KPIs, team performance, and project metrics.",
      budget: 85000,
      startDate: new Date("2025-02-01"),
      endDate: new Date("2025-05-31"),
      status: "PLANNING" as const,
      progress: 10,
    },
    {
      name: "GreenEnergy IoT Platform",
      slug: "greenenergy-iot-platform",
      description:
        "IoT monitoring platform for renewable energy assets with real-time data collection, predictive maintenance, and reporting.",
      budget: 195000,
      startDate: new Date("2024-01-15"),
      endDate: new Date("2024-08-31"),
      status: "COMPLETED" as const,
      progress: 100,
    },
  ];

  for (const project of projects) {
    await prisma.project.upsert({
      where: { slug: project.slug },
      update: {},
      create: project,
    });
  }
  console.log("✅ Projects seeded");

  // ==================== ADDITIONAL PAGES WITH BLOCKS ====================
  const additionalPages = [
    {
      slug: "privacy-policy",
      title: "Privacy Policy",
      status: "PUBLISHED" as const,
      template: "legal",
      order: 10,
      authorId: superAdmin.id,
      metaTitle: "Privacy Policy - SoftCell Technologies",
    },
    {
      slug: "terms-of-service",
      title: "Terms of Service",
      status: "PUBLISHED" as const,
      template: "legal",
      order: 11,
      authorId: superAdmin.id,
      metaTitle: "Terms of Service - SoftCell Technologies",
    },
    {
      slug: "cookie-policy",
      title: "Cookie Policy",
      status: "PUBLISHED" as const,
      template: "legal",
      order: 12,
      authorId: superAdmin.id,
      metaTitle: "Cookie Policy - SoftCell Technologies",
    },
    {
      slug: "accessibility",
      title: "Accessibility Statement",
      status: "PUBLISHED" as const,
      template: "legal",
      order: 13,
      authorId: superAdmin.id,
      metaTitle: "Accessibility Statement - SoftCell Technologies",
    },
    {
      slug: "faq",
      title: "Frequently Asked Questions",
      status: "PUBLISHED" as const,
      template: "faq",
      order: 14,
      authorId: superAdmin.id,
      metaTitle: "FAQ - SoftCell Technologies",
    },
    {
      slug: "partners",
      title: "Partners & Integrations",
      status: "PUBLISHED" as const,
      template: "default",
      order: 15,
      authorId: superAdmin.id,
      metaTitle: "Partners - SoftCell Technologies",
    },
    {
      slug: "resources",
      title: "Resources & Knowledge Hub",
      status: "PUBLISHED" as const,
      template: "resources",
      order: 16,
      authorId: superAdmin.id,
      metaTitle: "Resources - SoftCell Technologies",
    },
    {
      slug: "newsroom",
      title: "Press & Newsroom",
      status: "PUBLISHED" as const,
      template: "newsroom",
      order: 17,
      authorId: superAdmin.id,
      metaTitle: "Newsroom - SoftCell Technologies",
    },
    {
      slug: "fintech-solutions",
      title: "Fintech Solutions",
      status: "PUBLISHED" as const,
      template: "fintech",
      order: 18,
      authorId: superAdmin.id,
      metaTitle: "Fintech Solutions - SoftCell Technologies",
    },
    {
      slug: "team",
      title: "Our Team",
      status: "PUBLISHED" as const,
      template: "team",
      order: 19,
      authorId: superAdmin.id,
      metaTitle: "Our Team - SoftCell Technologies",
    },
  ];

  for (const page of additionalPages) {
    await prisma.page.upsert({
      where: { slug: page.slug },
      update: {},
      create: page,
    });
  }

  // Add blocks to About page
  const aboutPage = await prisma.page.findUnique({ where: { slug: "about" } });
  if (aboutPage) {
    const existingAboutBlocks = await prisma.pageBlock.count({
      where: { pageId: aboutPage.id },
    });
    if (existingAboutBlocks === 0) {
      await prisma.pageBlock.createMany({
        data: [
          {
            pageId: aboutPage.id,
            type: "hero",
            order: 0,
            content: {
              title: "About SoftCell Technologies",
              subtitle:
                "Building the future of enterprise technology since 2010",
              backgroundGradient: true,
            },
          },
          {
            pageId: aboutPage.id,
            type: "text-image",
            order: 1,
            content: {
              title: "Our Story",
              text: "Founded in 2010, SoftCell Technologies began with a simple mission: make enterprise technology accessible, powerful, and beautiful. What started as a small team of passionate engineers has grown into a global technology company serving Fortune 500 clients across multiple industries.",
              imagePosition: "right",
            },
          },
          {
            pageId: aboutPage.id,
            type: "timeline",
            order: 2,
            content: {
              title: "Our Journey",
              items: [
                {
                  year: "2010",
                  title: "Founded",
                  description:
                    "SoftCell Technologies founded in Silicon Valley",
                },
                {
                  year: "2013",
                  title: "First Enterprise Client",
                  description: "Secured first Fortune 500 client",
                },
                {
                  year: "2016",
                  title: "AI Division Launched",
                  description: "Established dedicated AI research lab",
                },
                {
                  year: "2019",
                  title: "Global Expansion",
                  description: "Opened offices in London and Singapore",
                },
                {
                  year: "2022",
                  title: "Fintech Focus",
                  description: "Launched dedicated fintech solutions division",
                },
                {
                  year: "2025",
                  title: "500+ Projects",
                  description: "Surpassed 500 successful project deliveries",
                },
              ],
            },
          },
          {
            pageId: aboutPage.id,
            type: "team-leadership",
            order: 3,
            content: {
              title: "Leadership Team",
              subtitle: "Meet the people driving our vision",
              showLeadership: true,
            },
          },
          {
            pageId: aboutPage.id,
            type: "values",
            order: 4,
            content: {
              title: "Our Values",
              items: [
                {
                  icon: "Lightbulb",
                  title: "Innovation",
                  description:
                    "We push boundaries and embrace new technologies",
                },
                {
                  icon: "Shield",
                  title: "Integrity",
                  description:
                    "We build trust through transparency and honesty",
                },
                {
                  icon: "Users",
                  title: "Collaboration",
                  description:
                    "We believe the best solutions come from teamwork",
                },
                {
                  icon: "Target",
                  title: "Excellence",
                  description:
                    "We strive for the highest quality in everything we do",
                },
              ],
            },
          },
          {
            pageId: aboutPage.id,
            type: "partners-logos",
            order: 5,
            content: {
              title: "Our Partners & Certifications",
              showFeatured: true,
            },
          },
          {
            pageId: aboutPage.id,
            type: "cta",
            order: 6,
            content: {
              title: "Want to Join Our Team?",
              subtitle: "We are always looking for talented individuals.",
              ctaText: "View Careers",
              ctaLink: "/careers",
            },
          },
        ],
      });
    }
  }

  // Add blocks to Contact page
  const contactPage = await prisma.page.findUnique({
    where: { slug: "contact" },
  });
  if (contactPage) {
    const existingContactBlocks = await prisma.pageBlock.count({
      where: { pageId: contactPage.id },
    });
    if (existingContactBlocks === 0) {
      await prisma.pageBlock.createMany({
        data: [
          {
            pageId: contactPage.id,
            type: "hero",
            order: 0,
            content: {
              title: "Get In Touch",
              subtitle:
                "We'd love to hear about your project. Let's start a conversation.",
            },
          },
          {
            pageId: contactPage.id,
            type: "contact-form",
            order: 1,
            content: {
              title: "Send Us a Message",
              fields: [
                "name",
                "email",
                "company",
                "phone",
                "service",
                "message",
                "attachment",
              ],
              gdprRequired: true,
            },
          },
          {
            pageId: contactPage.id,
            type: "locations",
            order: 2,
            content: {
              title: "Our Offices",
              locations: [
                {
                  name: "Headquarters",
                  address: "123 Innovation Drive, Tech Park, CA 94025",
                  phone: "+1 (866) 573-9604",
                  email: "info@softcell.com",
                  hours: "Mon-Fri 9AM-6PM PST",
                },
                {
                  name: "New York",
                  address: "456 Broadway, Suite 800, New York, NY 10013",
                  phone: "+1 (555) 234-5678",
                  email: "ny@softcell.com",
                  hours: "Mon-Fri 9AM-6PM EST",
                },
                {
                  name: "London",
                  address: "10 Finsbury Square, London EC2A 1AF, UK",
                  phone: "+44 20 7123 4567",
                  email: "london@softcell.com",
                  hours: "Mon-Fri 9AM-6PM GMT",
                },
              ],
            },
          },
        ],
      });
    }
  }
  console.log("✅ Additional pages & blocks seeded");

  // ==================== NEWSLETTER SUBSCRIBERS (SAMPLE) ====================
  const subscribers = [
    {
      email: "subscriber1@example.com",
      name: "John Doe",
      isActive: true,
      segments: ["technology", "ai"],
      gdprConsent: true,
    },
    {
      email: "subscriber2@example.com",
      name: "Jane Smith",
      isActive: true,
      segments: ["fintech", "enterprise"],
      gdprConsent: true,
    },
    {
      email: "subscriber3@example.com",
      name: "Bob Wilson",
      isActive: true,
      segments: ["technology"],
      gdprConsent: true,
    },
  ];

  for (const sub of subscribers) {
    await prisma.newsletterSubscriber.upsert({
      where: { email: sub.email },
      update: {},
      create: sub,
    });
  }
  console.log("✅ Newsletter subscribers seeded");

  // ==================== HERO SLIDES ====================
  const existingHeroSlides = await prisma.heroSlide.count();
  if (existingHeroSlides === 0) {
    await prisma.heroSlide.createMany({
      data: [
        {
          title: "Transforming Businesses Through Technology",
          subtitle: "Enterprise Solutions",
          description:
            "We deliver cutting-edge software solutions, AI-powered platforms, and digital transformation services that drive growth and innovation for enterprises worldwide.",
          backgroundImage:
            "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1920&auto=format&fit=crop",
          ctaText: "Explore Solutions",
          ctaLink: "/services",
          secondaryCtaText: "Request Demo",
          secondaryCtaLink: "/contact",
          sortOrder: 0,
          isActive: true,
        },
        {
          title: "AI & Machine Learning Solutions",
          subtitle: "Next-Gen Intelligence",
          description:
            "Harness the power of artificial intelligence and machine learning to automate processes, gain insights, and stay ahead of the competition.",
          backgroundImage:
            "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1920&auto=format&fit=crop",
          ctaText: "Learn More",
          ctaLink: "/services",
          secondaryCtaText: "View Case Studies",
          secondaryCtaLink: "/case-studies",
          sortOrder: 1,
          isActive: true,
        },
        {
          title: "Secure & Scalable Cloud Infrastructure",
          subtitle: "Cloud Services",
          description:
            "Build, deploy, and scale your applications with our enterprise-grade cloud infrastructure and DevOps expertise.",
          backgroundImage:
            "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1920&auto=format&fit=crop",
          ctaText: "Get Started",
          ctaLink: "/contact",
          secondaryCtaText: "Our Products",
          secondaryCtaLink: "/products",
          sortOrder: 2,
          isActive: true,
        },
      ],
    });
    console.log("✅ Hero slides seeded");
  }

  // ==================== HOMEPAGE CONTENT SETTINGS ====================
  const homepageSettings = [
    { key: 'hero_stat_1', value: JSON.stringify({ number: '800+', label: 'Projects Delivered' }), type: 'string', group: 'homepage', label: 'Hero Stat 1' },
    { key: 'hero_stat_2', value: JSON.stringify({ number: '200+', label: 'Enterprise Clients' }), type: 'string', group: 'homepage', label: 'Hero Stat 2' },
    { key: 'hero_stat_3', value: JSON.stringify({ number: '150+', label: 'Team Members' }), type: 'string', group: 'homepage', label: 'Hero Stat 3' },
    { key: 'hero_stat_4', value: JSON.stringify({ number: '15+', label: 'Years Experience' }), type: 'string', group: 'homepage', label: 'Hero Stat 4' },
    { key: 'trust_badge_1', value: 'SOC 2 Certified', type: 'string', group: 'homepage', label: 'Trust Badge 1' },
    { key: 'trust_badge_2', value: '99.9% Uptime', type: 'string', group: 'homepage', label: 'Trust Badge 2' },
    { key: 'trust_badge_3', value: 'Global Delivery', type: 'string', group: 'homepage', label: 'Trust Badge 3' },
    { key: 'cta_heading', value: 'Ready to fortify your digital infrastructure?', type: 'string', group: 'homepage', label: 'CTA Heading' },
    { key: 'cta_subtext', value: 'Join 200+ enterprises that trust SoftCell for their digital transformation.', type: 'string', group: 'homepage', label: 'CTA Subtext' },
    { key: 'cta_primary_text', value: 'Schedule Tech Deep-Dive', type: 'string', group: 'homepage', label: 'CTA Primary Button' },
    { key: 'cta_secondary_text', value: 'Contact Sales', type: 'string', group: 'homepage', label: 'CTA Secondary Button' },
  ];

  for (const s of homepageSettings) {
    await prisma.setting.upsert({ where: { key: s.key }, update: {}, create: s });
  }
  console.log("✅ Homepage content settings seeded");

  // ==================== MAINTENANCE MODE ====================
  const existingMaintenance = await prisma.maintenanceMode.findFirst();
  if (!existingMaintenance) {
    await prisma.maintenanceMode.create({
      data: {
        isActive: false,
        message:
          "We are performing scheduled maintenance. Please check back soon.",
      },
    });
  }
  console.log("✅ System settings seeded");

  console.log("\n🎉 Seed completed successfully!");
  console.log("\n📋 Login Credentials:");
  console.log("  Super Admin: superadmin@softcell.com / Admin@123");
  console.log("  Admin:       admin@softcell.com / Admin@123");
  console.log("  Manager:     manager@softcell.com / Admin@123");
  console.log("  Marketer:    marketer@softcell.com / Admin@123");
  console.log("  Client:      client@example.com / Admin@123");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
