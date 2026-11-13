export type UserRole = 'SUPER_ADMIN' | 'RECRUITER' | 'HIRING_MANAGER' | 'CANDIDATE';
export type OrgRole = 'OWNER' | 'ADMIN' | 'MEMBER';
export type OrgStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING';
export type JobStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'ARCHIVED';
export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP';
export type WorkplaceType = 'ON_SITE' | 'HYBRID' | 'REMOTE';
export type ApplicationStage =
  | 'APPLIED'
  | 'SCREENING'
  | 'SHORTLISTED'
  | 'INTERVIEW'
  | 'ASSESSMENT'
  | 'OFFERED'
  | 'HIRED'
  | 'REJECTED';
export type InterviewType = 'TECHNICAL' | 'BEHAVIORAL' | 'HR' | 'FINAL' | 'CULTURE_FIT';
export type InterviewStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED';
export type Recommendation = 'STRONG_HIRE' | 'HIRE' | 'NEUTRAL' | 'NO_HIRE' | 'STRONG_NO_HIRE';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  isVerified: boolean;
  isActive: boolean;
  createdAt?: string;
  organizationId?: string;
  organizationRole?: OrgRole;
  organization?: Organization;
  candidateProfile?: CandidateProfile;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  website?: string;
  industry?: string;
  companySize?: string;
  logo?: string;
  location?: string;
  status: OrgStatus;
  createdAt: string;
}

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  organizationRole: OrgRole;
  joinedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    role: UserRole;
    isActive: boolean;
  };
}

export interface Skill {
  id: string;
  name: string;
}

export interface CandidateSkill {
  id: string;
  skillId: string;
  proficiency?: string;
  skill: Skill;
}

export interface CandidateProfile {
  id: string;
  userId: string;
  headline?: string;
  summary?: string;
  location?: string;
  experienceYears?: number;
  currentCompany?: string;
  currentPosition?: string;
  expectedSalary?: number;
  noticePeriod?: string;
  resumeUrl?: string;
  portfolioUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  skills?: CandidateSkill[];
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
}

export interface Job {
  id: string;
  organizationId: string;
  createdBy: string;
  title: string;
  slug: string;
  description: string;
  requirements: string;
  responsibilities?: string;
  employmentType: EmploymentType;
  workplaceType: WorkplaceType;
  experienceMin: number;
  experienceMax?: number;
  salaryMin?: number;
  salaryMax?: number;
  location: string;
  department: string;
  openings: number;
  status: JobStatus;
  applicationDeadline?: string;
  publishedAt?: string;
  createdAt: string;
  organization?: Organization;
  creator?: { id: string; name: string };
  _count?: { applications: number };
}

export interface Application {
  id: string;
  jobId: string;
  candidateId: string;
  resumeUrl: string;
  coverLetter?: string;
  status: ApplicationStage;
  source?: string;
  appliedAt: string;
  updatedAt: string;
  job?: Job;
  candidate?: CandidateProfile;
  stageHistory?: ApplicationStageHistory[];
  interviews?: Interview[];
}

export interface ApplicationStageHistory {
  id: string;
  applicationId: string;
  previousStage?: ApplicationStage;
  newStage: ApplicationStage;
  changedBy?: string;
  notes?: string;
  createdAt: string;
  changer?: { id: string; name: string; role: string };
}

export interface Interview {
  id: string;
  applicationId: string;
  interviewerId: string;
  scheduledAt: string;
  duration: number;
  interviewType: InterviewType;
  meetingLink?: string;
  location?: string;
  status: InterviewStatus;
  notes?: string;
  createdAt: string;
  interviewer?: { id: string; name: string; email: string; avatar?: string };
  application?: Application;
  feedback?: InterviewFeedback[];
}

export interface InterviewFeedback {
  id: string;
  interviewId: string;
  interviewerId: string;
  rating: number;
  technicalSkills?: number;
  communicationSkills?: number;
  strengths?: string;
  weaknesses?: string;
  comments: string;
  recommendation: Recommendation;
  createdAt: string;
  interviewer?: { id: string; name: string; email: string; avatar?: string };
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  relatedEntityId?: string;
  createdAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  errors?: any[];
}

