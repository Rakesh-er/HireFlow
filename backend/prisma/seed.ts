import { PrismaClient, UserRole, OrgRole, OrgStatus, JobStatus, EmploymentType, WorkplaceType, ApplicationStage, InterviewType, InterviewStatus, Recommendation } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting HireFlow Database Seeding...');

  // Default demo password: Password123!
  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 1. Super Admin
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@hireflow.io' },
    update: {},
    create: {
      name: 'Super Administrator',
      email: 'admin@hireflow.io',
      passwordHash,
      role: UserRole.SUPER_ADMIN,
      isVerified: true,
      isActive: true,
      phone: '+1 800 555 0199',
    },
  });
  console.log(`✓ Super Admin created: ${superAdmin.email}`);

  // 2. Demo Organization
  const acmeOrg = await prisma.organization.upsert({
    where: { slug: 'acme-corp' },
    update: {},
    create: {
      name: 'Acme Corporation',
      slug: 'acme-corp',
      description: 'A global technology powerhouse building the future of SaaS and distributed systems.',
      website: 'https://acme.example.com',
      industry: 'Software & Technology',
      companySize: '250-500',
      location: 'San Francisco, CA & Remote',
      status: OrgStatus.ACTIVE,
      subscriptions: {
        create: {
          plan: 'ENTERPRISE',
          status: 'ACTIVE',
        },
      },
    },
  });
  console.log(`✓ Organization created: ${acmeOrg.name}`);

  // 3. Recruiter User
  const recruiter = await prisma.user.upsert({
    where: { email: 'recruiter@acme.com' },
    update: {},
    create: {
      name: 'Sarah Jenkins',
      email: 'recruiter@acme.com',
      passwordHash,
      role: UserRole.RECRUITER,
      isVerified: true,
      isActive: true,
      phone: '+1 415 555 0142',
      organizationMembers: {
        create: {
          organizationId: acmeOrg.id,
          organizationRole: OrgRole.ADMIN,
        },
      },
    },
  });
  console.log(`✓ Recruiter created: ${recruiter.email}`);

  // 4. Hiring Manager User
  const hiringManager = await prisma.user.upsert({
    where: { email: 'manager@acme.com' },
    update: {},
    create: {
      name: 'David Vance',
      email: 'manager@acme.com',
      passwordHash,
      role: UserRole.HIRING_MANAGER,
      isVerified: true,
      isActive: true,
      phone: '+1 415 555 0188',
      organizationMembers: {
        create: {
          organizationId: acmeOrg.id,
          organizationRole: OrgRole.MEMBER,
        },
      },
    },
  });
  console.log(`✓ Hiring Manager created: ${hiringManager.email}`);

  // 5. Skills
  const skillsList = [
    'React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker',
    'AWS', 'GraphQL', 'Python', 'Tailwind CSS', 'Figma', 'Kubernetes', 'CI/CD'
  ];
  const skillRecords: Record<string, string> = {};
  for (const name of skillsList) {
    const s = await prisma.skill.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    skillRecords[name] = s.id;
  }
  console.log(`✓ ${skillsList.length} Skills ensured.`);

  // 6. Candidates
  const candidate1User = await prisma.user.upsert({
    where: { email: 'alex.rivera@example.com' },
    update: {},
    create: {
      name: 'Alex Rivera',
      email: 'alex.rivera@example.com',
      passwordHash,
      role: UserRole.CANDIDATE,
      isVerified: true,
      isActive: true,
      phone: '+1 650 555 0111',
      candidateProfile: {
        create: {
          headline: 'Senior Full Stack Engineer | React & Node Specialist',
          summary: 'Passionate developer with 6+ years experience architecting cloud solutions and performant UIs.',
          location: 'Seattle, WA',
          experienceYears: 6,
          currentCompany: 'CloudScale Inc',
          currentPosition: 'Senior Frontend Engineer',
          expectedSalary: 165000,
          noticePeriod: '2 weeks',
          resumeUrl: '/uploads/resumes/sample-alex-rivera-resume.pdf',
          portfolioUrl: 'https://alexrivera.dev',
          githubUrl: 'https://github.com/alexrivera-demo',
          linkedinUrl: 'https://linkedin.com/in/alexrivera-demo',
        },
      },
    },
    include: { candidateProfile: true },
  });

  if (candidate1User.candidateProfile) {
    await prisma.candidateSkill.upsert({
      where: { candidateId_skillId: { candidateId: candidate1User.candidateProfile.id, skillId: skillRecords['TypeScript'] } },
      update: {},
      create: { candidateId: candidate1User.candidateProfile.id, skillId: skillRecords['TypeScript'], proficiency: 'Expert' }
    });
    await prisma.candidateSkill.upsert({
      where: { candidateId_skillId: { candidateId: candidate1User.candidateProfile.id, skillId: skillRecords['React'] } },
      update: {},
      create: { candidateId: candidate1User.candidateProfile.id, skillId: skillRecords['React'], proficiency: 'Expert' }
    });
  }

  const candidate2User = await prisma.user.upsert({
    where: { email: 'elena.rostova@example.com' },
    update: {},
    create: {
      name: 'Elena Rostova',
      email: 'elena.rostova@example.com',
      passwordHash,
      role: UserRole.CANDIDATE,
      isVerified: true,
      isActive: true,
      phone: '+1 408 555 0123',
      candidateProfile: {
        create: {
          headline: 'Lead Product Designer & Design Systems Architect',
          summary: '8 years of end-to-end UX/UI product design for enterprise SaaS applications.',
          location: 'San Jose, CA',
          experienceYears: 8,
          currentCompany: 'DesignSphere',
          currentPosition: 'Staff Product Designer',
          expectedSalary: 175000,
          noticePeriod: '1 month',
          resumeUrl: '/uploads/resumes/sample-elena-rostova-resume.pdf',
          portfolioUrl: 'https://elenarostova.design',
          linkedinUrl: 'https://linkedin.com/in/elenarostova-demo',
        },
      },
    },
    include: { candidateProfile: true },
  });

  const candidate3User = await prisma.user.upsert({
    where: { email: 'marcus.chen@example.com' },
    update: {},
    create: {
      name: 'Marcus Chen',
      email: 'marcus.chen@example.com',
      passwordHash,
      role: UserRole.CANDIDATE,
      isVerified: true,
      isActive: true,
      phone: '+1 212 555 0177',
      candidateProfile: {
        create: {
          headline: 'Cloud Infrastructure & DevOps Engineer',
          summary: 'Specialized in Kubernetes orchestration, Terraform IaC, and zero-downtime CI/CD pipelines.',
          location: 'Austin, TX',
          experienceYears: 5,
          currentCompany: 'DevOpsLabs',
          currentPosition: 'DevOps Engineer',
          expectedSalary: 155000,
          noticePeriod: 'Immediate',
          resumeUrl: '/uploads/resumes/sample-marcus-chen-resume.pdf',
          githubUrl: 'https://github.com/marcuschen-demo',
        },
      },
    },
    include: { candidateProfile: true },
  });
  console.log(`✓ 3 Candidates created.`);

  // 7. Jobs
  const job1 = await prisma.job.upsert({
    where: { organizationId_slug: { organizationId: acmeOrg.id, slug: 'senior-full-stack-engineer' } },
    update: {},
    create: {
      organizationId: acmeOrg.id,
      createdBy: recruiter.id,
      title: 'Senior Full Stack Engineer',
      slug: 'senior-full-stack-engineer',
      description: 'We are seeking an experienced Senior Full Stack Engineer to drive our core web applications and microservices.',
      requirements: '• 5+ years of production experience with TypeScript and Node.js\n• Deep expertise in React and state management\n• Strong PostgreSQL relational schema design experience\n• Experience with Docker and microservices',
      responsibilities: '• Architect, build and maintain resilient web APIs\n• Collaborate closely with product managers and designers\n• Mentor junior and mid-level software engineers',
      employmentType: EmploymentType.FULL_TIME,
      workplaceType: WorkplaceType.HYBRID,
      experienceMin: 5,
      experienceMax: 9,
      salaryMin: 140000,
      salaryMax: 180000,
      location: 'San Francisco, CA / Remote',
      department: 'Engineering',
      openings: 2,
      status: JobStatus.PUBLISHED,
      publishedAt: new Date(),
    },
  });

  const job2 = await prisma.job.upsert({
    where: { organizationId_slug: { organizationId: acmeOrg.id, slug: 'lead-product-designer' } },
    update: {},
    create: {
      organizationId: acmeOrg.id,
      createdBy: recruiter.id,
      title: 'Lead Product Designer',
      slug: 'lead-product-designer',
      description: 'Lead the visual design and user experience across our entire suite of enterprise recruitment tools.',
      requirements: '• 6+ years of UX/UI experience in B2B SaaS\n• Expert mastery of Figma, design systems, and user research\n• Proven track record designing data-dense workflows',
      responsibilities: '• Define unified design systems and UI component specs\n• Conduct user research sessions with recruiters and candidates',
      employmentType: EmploymentType.FULL_TIME,
      workplaceType: WorkplaceType.REMOTE,
      experienceMin: 6,
      experienceMax: 10,
      salaryMin: 150000,
      salaryMax: 190000,
      location: 'Remote, US',
      department: 'Design',
      openings: 1,
      status: JobStatus.PUBLISHED,
      publishedAt: new Date(),
    },
  });

  const job3 = await prisma.job.upsert({
    where: { organizationId_slug: { organizationId: acmeOrg.id, slug: 'devops-cloud-architect' } },
    update: {},
    create: {
      organizationId: acmeOrg.id,
      createdBy: recruiter.id,
      title: 'DevOps & Cloud Architect',
      slug: 'devops-cloud-architect',
      description: 'Scale our cloud infrastructure across multi-region Kubernetes clusters with zero downtime.',
      requirements: '• AWS certified solutions architect\n• Strong Kubernetes, Terraform, and GitHub Actions experience',
      employmentType: EmploymentType.FULL_TIME,
      workplaceType: WorkplaceType.REMOTE,
      experienceMin: 4,
      experienceMax: 8,
      salaryMin: 145000,
      salaryMax: 175000,
      location: 'Remote',
      department: 'DevOps',
      openings: 1,
      status: JobStatus.PUBLISHED,
      publishedAt: new Date(),
    },
  });
  console.log(`✓ 3 Jobs created.`);

  // 8. Applications & Pipeline
  if (candidate1User.candidateProfile) {
    const app1 = await prisma.application.upsert({
      where: { jobId_candidateId: { jobId: job1.id, candidateId: candidate1User.candidateProfile.id } },
      update: {},
      create: {
        jobId: job1.id,
        candidateId: candidate1User.candidateProfile.id,
        resumeUrl: candidate1User.candidateProfile.resumeUrl || '/uploads/resumes/sample-alex.pdf',
        coverLetter: 'I am excited to apply for the Senior Full Stack Engineer role at Acme Corp. With 6 years building TypeScript microservices and React UIs, I can hit the ground running.',
        status: ApplicationStage.INTERVIEW,
        source: 'CAREERS_PAGE',
        stageHistory: {
          create: [
            {
              previousStage: null,
              newStage: ApplicationStage.APPLIED,
              changedBy: recruiter.id,
              notes: 'Application received via Careers portal.',
            },
            {
              previousStage: ApplicationStage.APPLIED,
              newStage: ApplicationStage.SCREENING,
              changedBy: recruiter.id,
              notes: 'Resume matches stack requirements.',
            },
            {
              previousStage: ApplicationStage.SCREENING,
              newStage: ApplicationStage.INTERVIEW,
              changedBy: recruiter.id,
              notes: 'Passed initial screening call. Scheduled technical interview.',
            },
          ],
        },
      },
    });

    // 9. Interview & Feedback for App 1
    const interviewTime = new Date();
    interviewTime.setDate(interviewTime.getDate() + 2);
    interviewTime.setHours(14, 0, 0, 0);

    const interview = await prisma.interview.create({
      data: {
        applicationId: app1.id,
        interviewerId: hiringManager.id,
        scheduledAt: interviewTime,
        duration: 60,
        interviewType: InterviewType.TECHNICAL,
        meetingLink: 'https://meet.google.com/hrc-tech-acme',
        status: InterviewStatus.SCHEDULED,
        notes: 'Technical assessment: System architecture and live coding in TypeScript.',
      },
    });
    console.log(`✓ Interview scheduled for application: ${app1.id}`);
  }

  if (candidate2User.candidateProfile) {
    await prisma.application.upsert({
      where: { jobId_candidateId: { jobId: job2.id, candidateId: candidate2User.candidateProfile.id } },
      update: {},
      create: {
        jobId: job2.id,
        candidateId: candidate2User.candidateProfile.id,
        resumeUrl: candidate2User.candidateProfile.resumeUrl || '/uploads/resumes/sample-elena.pdf',
        coverLetter: 'I have spent the last 8 years mastering design systems and user research for enterprise SaaS.',
        status: ApplicationStage.SHORTLISTED,
        source: 'LINKEDIN',
        stageHistory: {
          create: [
            {
              previousStage: null,
              newStage: ApplicationStage.APPLIED,
              changedBy: recruiter.id,
              notes: 'Referred from LinkedIn.',
            },
            {
              previousStage: ApplicationStage.APPLIED,
              newStage: ApplicationStage.SHORTLISTED,
              changedBy: recruiter.id,
              notes: 'Portfolio is world-class.',
            },
          ],
        },
      },
    });
  }

  if (candidate3User.candidateProfile) {
    await prisma.application.upsert({
      where: { jobId_candidateId: { jobId: job3.id, candidateId: candidate3User.candidateProfile.id } },
      update: {},
      create: {
        jobId: job3.id,
        candidateId: candidate3User.candidateProfile.id,
        resumeUrl: candidate3User.candidateProfile.resumeUrl || '/uploads/resumes/sample-marcus.pdf',
        coverLetter: 'DevOps enthusiast looking to optimize cloud cost and build automated delivery pipelines.',
        status: ApplicationStage.APPLIED,
        source: 'CAREERS_PAGE',
        stageHistory: {
          create: [
            {
              previousStage: null,
              newStage: ApplicationStage.APPLIED,
              changedBy: null,
              notes: 'Direct application from web form.',
            },
          ],
        },
      },
    });
  }

  // 10. Sample System Settings
  await prisma.systemSetting.upsert({
    where: { key: 'PLATFORM_NAME' },
    update: {},
    create: { key: 'PLATFORM_NAME', value: 'HireFlow Enterprise' },
  });
  await prisma.systemSetting.upsert({
    where: { key: 'ALLOW_CANDIDATE_REGISTRATION' },
    update: {},
    create: { key: 'ALLOW_CANDIDATE_REGISTRATION', value: 'true' },
  });

  // 11. Activity Log
  await prisma.activityLog.create({
    data: {
      organizationId: acmeOrg.id,
      userId: recruiter.id,
      action: 'JOB_PUBLISHED',
      entityType: 'Job',
      entityId: job1.id,
      metadata: { title: job1.title },
    },
  });

  console.log('✅ HireFlow Database Seeding completed successfully!');
  console.log('\nDemo User Accounts:');
  console.log('----------------------------------------------------');
  console.log('Super Admin:     admin@hireflow.io        / Password123!');
  console.log('Recruiter:       recruiter@acme.com       / Password123!');
  console.log('Hiring Manager:  manager@acme.com         / Password123!');
  console.log('Candidate 1:     alex.rivera@example.com  / Password123!');
  console.log('Candidate 2:     elena.rostova@example.com/ Password123!');
  console.log('----------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

