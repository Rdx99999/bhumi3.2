import { 
  users, type User, type InsertUser,
  services, type Service, type InsertService,
  trainingPrograms, type TrainingProgram, type InsertTrainingProgram,
  participants, type Participant, type InsertParticipant,
  certificates, type Certificate, type InsertCertificate,
  contacts, type Contact, type InsertContact,
  CertificateVerification, StatusCheck,
} from "@shared/schema";

// Storage interface with CRUD methods
export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Services
  getAllServices(): Promise<Service[]>;
  getService(id: number): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: number, service: Partial<InsertService>): Promise<Service | undefined>;
  deleteService(id: number): Promise<boolean>;
  
  // Training Programs
  getAllTrainingPrograms(): Promise<TrainingProgram[]>;
  getTrainingProgram(id: number): Promise<TrainingProgram | undefined>;
  createTrainingProgram(program: InsertTrainingProgram): Promise<TrainingProgram>;
  updateTrainingProgram(id: number, program: Partial<InsertTrainingProgram>): Promise<TrainingProgram | undefined>;
  deleteTrainingProgram(id: number): Promise<boolean>;
  
  // Participants
  getAllParticipants(): Promise<Participant[]>;
  getParticipant(id: number): Promise<Participant | undefined>;
  getParticipantByParticipantId(participantId: string): Promise<Participant | undefined>;
  getParticipantByEmail(email: string): Promise<Participant | undefined>;
  createParticipant(participant: InsertParticipant): Promise<Participant>;
  updateParticipant(id: number, participant: Partial<InsertParticipant>): Promise<Participant | undefined>;
  deleteParticipant(id: number): Promise<boolean>;
  
  // Certificates
  getAllCertificates(): Promise<Certificate[]>;
  getCertificate(id: number): Promise<Certificate | undefined>;
  getCertificateByCertificateId(certificateId: string): Promise<Certificate | undefined>;
  getCertificatesByParticipantId(participantId: number): Promise<Certificate[]>;
  createCertificate(certificate: InsertCertificate): Promise<Certificate>;
  updateCertificate(id: number, certificate: Partial<InsertCertificate>): Promise<Certificate | undefined>;
  deleteCertificate(id: number): Promise<boolean>;
  
  // Contacts
  createContact(contact: InsertContact): Promise<Contact>;
  getAllContacts(): Promise<Contact[]>;
  
  // Specialized operations
  verifyCertificate(data: CertificateVerification): Promise<{ 
    valid: boolean;
    certificate?: Certificate;
    participant?: Participant;
    trainingProgram?: TrainingProgram; 
  }>;
  
  checkParticipantStatus(data: StatusCheck): Promise<{
    valid: boolean;
    participant?: Participant;
    certificates?: Certificate[];
    trainingPrograms?: TrainingProgram[];
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private services: Map<number, Service>;
  private trainingPrograms: Map<number, TrainingProgram>;
  private participants: Map<number, Participant>;
  private certificates: Map<number, Certificate>;
  private contacts: Map<number, Contact>;
  
  currentUserId: number;
  currentServiceId: number;
  currentTrainingProgramId: number;
  currentParticipantId: number;
  currentCertificateId: number;
  currentContactId: number;

  constructor() {
    this.users = new Map();
    this.services = new Map();
    this.trainingPrograms = new Map();
    this.participants = new Map();
    this.certificates = new Map();
    this.contacts = new Map();
    
    this.currentUserId = 1;
    this.currentServiceId = 1;
    this.currentTrainingProgramId = 1;
    this.currentParticipantId = 1;
    this.currentCertificateId = 1;
    this.currentContactId = 1;
    
    // Initialize with sample data
    this.initializeSampleData().catch(console.error);
  }

  // Initialize sample data for the in-memory storage
  private async initializeSampleData() {
    // Sample services
    const consultancyService: InsertService = {
      title: "Consultancy Services",
      description: "Our expert consultants provide strategic guidance to optimize your business operations, improve efficiency, and drive growth.",
      icon: "chart-line",
      features: ["Business strategy development", "Operational efficiency analysis", "Growth planning and implementation"],
    };
    
    const auditService: InsertService = {
      title: "Audit Preparation",
      description: "Comprehensive audit preparation services to ensure your business is fully compliant and audit-ready.",
      icon: "file-invoice",
      features: ["Financial statement preparation", "Compliance documentation", "Risk assessment and mitigation"],
    };
    
    this.createService(consultancyService);
    this.createService(auditService);
    
    // Sample training programs
    const trainingProgram1: InsertTrainingProgram = {
      title: "Strategic Business Planning",
      description: "Learn how to develop and implement effective business strategies.",
      category: "Business",
      duration: "4 weeks",
      price: 12500,
      image_path: "/training1.jpg",
    };
    
    const trainingProgram2: InsertTrainingProgram = {
      title: "Financial Management",
      description: "Master financial planning, analysis, and reporting for business.",
      category: "Finance",
      duration: "6 weeks",
      price: 15000,
      image_path: "/training2.jpg",
    };
    
    const trainingProgram3: InsertTrainingProgram = {
      title: "Executive Leadership",
      description: "Develop essential leadership skills for executive positions.",
      category: "Leadership",
      duration: "8 weeks",
      price: 20000,
      image_path: "/training3.jpg",
    };
    
    const program1 = await this.createTrainingProgram(trainingProgram1);
    const program2 = await this.createTrainingProgram(trainingProgram2);
    await this.createTrainingProgram(trainingProgram3);
    
    // Sample participant
    const participant1: InsertParticipant = {
      participantId: "BHM-P001",
      fullName: "John Doe",
      email: "john.doe@example.com",
      phone: "+919876543210",
      trainingProgramId: program1.id,
      enrollmentDate: new Date("2023-01-15"),
      status: "active",
    };
    
    const createdParticipant = await this.createParticipant(participant1);
    
    // Sample certificate
    const certificate1: InsertCertificate = {
      certificateId: "BHM23051501",
      participantId: createdParticipant.id,
      trainingProgramId: program1.id,
      issueDate: new Date("2023-05-15"),
      expiryDate: new Date("2025-05-15"),
      certificatePath: "/certificates/BHM23051501.pdf",
    };
    
    await this.createCertificate(certificate1);
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      phone: insertUser.phone ?? null,
      role: insertUser.role ?? "user"
    };
    this.users.set(id, user);
    return user;
  }

  // Service methods
  async getAllServices(): Promise<Service[]> {
    return Array.from(this.services.values());
  }

  async getService(id: number): Promise<Service | undefined> {
    return this.services.get(id);
  }

  async createService(insertService: InsertService): Promise<Service> {
    const id = this.currentServiceId++;
    const service: Service = { ...insertService, id };
    this.services.set(id, service);
    return service;
  }

  async updateService(id: number, updateData: Partial<InsertService>): Promise<Service | undefined> {
    const existingService = this.services.get(id);
    if (!existingService) return undefined;
    
    const updatedService = { ...existingService, ...updateData };
    this.services.set(id, updatedService);
    return updatedService;
  }

  async deleteService(id: number): Promise<boolean> {
    return this.services.delete(id);
  }

  // Training Program methods
  async getAllTrainingPrograms(): Promise<TrainingProgram[]> {
    return Array.from(this.trainingPrograms.values());
  }

  async getTrainingProgram(id: number): Promise<TrainingProgram | undefined> {
    return this.trainingPrograms.get(id);
  }

  async createTrainingProgram(insertProgram: InsertTrainingProgram): Promise<TrainingProgram> {
    const id = this.currentTrainingProgramId++;
    const program: TrainingProgram = { 
      ...insertProgram, 
      id,
      online_price: insertProgram.online_price ?? null,
      offline_price: insertProgram.offline_price ?? null,
      delivery_mode: insertProgram.delivery_mode ?? "both",
      image_path: insertProgram.image_path ?? null
    };
    this.trainingPrograms.set(id, program);
    return program;
  }

  async updateTrainingProgram(id: number, updateData: Partial<InsertTrainingProgram>): Promise<TrainingProgram | undefined> {
    const existingProgram = this.trainingPrograms.get(id);
    if (!existingProgram) return undefined;
    
    const updatedProgram = { ...existingProgram, ...updateData };
    this.trainingPrograms.set(id, updatedProgram);
    return updatedProgram;
  }

  async deleteTrainingProgram(id: number): Promise<boolean> {
    return this.trainingPrograms.delete(id);
  }

  // Participant methods
  async getAllParticipants(): Promise<Participant[]> {
    return Array.from(this.participants.values());
  }

  async getParticipant(id: number): Promise<Participant | undefined> {
    return this.participants.get(id);
  }

  async getParticipantByParticipantId(participantId: string): Promise<Participant | undefined> {
    return Array.from(this.participants.values()).find(
      (participant) => participant.participantId === participantId,
    );
  }

  async getParticipantByEmail(email: string): Promise<Participant | undefined> {
    return Array.from(this.participants.values()).find(
      (participant) => participant.email === email,
    );
  }

  async createParticipant(insertParticipant: InsertParticipant): Promise<Participant> {
    const id = this.currentParticipantId++;
    const participant: Participant = { 
      ...insertParticipant, 
      id,
      phone: insertParticipant.phone ?? null,
      status: insertParticipant.status ?? "active"
    };
    this.participants.set(id, participant);
    return participant;
  }

  async updateParticipant(id: number, updateData: Partial<InsertParticipant>): Promise<Participant | undefined> {
    const existingParticipant = this.participants.get(id);
    if (!existingParticipant) return undefined;
    
    const updatedParticipant = { ...existingParticipant, ...updateData };
    this.participants.set(id, updatedParticipant);
    return updatedParticipant;
  }

  async deleteParticipant(id: number): Promise<boolean> {
    return this.participants.delete(id);
  }

  // Certificate methods
  async getAllCertificates(): Promise<Certificate[]> {
    return Array.from(this.certificates.values());
  }

  async getCertificate(id: number): Promise<Certificate | undefined> {
    return this.certificates.get(id);
  }

  async getCertificateByCertificateId(certificateId: string): Promise<Certificate | undefined> {
    return Array.from(this.certificates.values()).find(
      (certificate) => certificate.certificateId === certificateId,
    );
  }

  async getCertificatesByParticipantId(participantId: number): Promise<Certificate[]> {
    return Array.from(this.certificates.values()).filter(
      (certificate) => certificate.participantId === participantId,
    );
  }

  async createCertificate(insertCertificate: InsertCertificate): Promise<Certificate> {
    const id = this.currentCertificateId++;
    const certificate: Certificate = { 
      ...insertCertificate, 
      id,
      expiryDate: insertCertificate.expiryDate ?? null,
      certificatePath: insertCertificate.certificatePath ?? null
    };
    this.certificates.set(id, certificate);
    return certificate;
  }

  async updateCertificate(id: number, updateData: Partial<InsertCertificate>): Promise<Certificate | undefined> {
    const existingCertificate = this.certificates.get(id);
    if (!existingCertificate) return undefined;
    
    const updatedCertificate = { ...existingCertificate, ...updateData };
    this.certificates.set(id, updatedCertificate);
    return updatedCertificate;
  }

  async deleteCertificate(id: number): Promise<boolean> {
    return this.certificates.delete(id);
  }

  // Contact methods
  async createContact(insertContact: InsertContact): Promise<Contact> {
    const id = this.currentContactId++;
    const contact: Contact = { 
      ...insertContact, 
      id,
      phone: insertContact.phone ?? null,
      status: insertContact.status ?? "pending"
    };
    this.contacts.set(id, contact);
    return contact;
  }

  async getAllContacts(): Promise<Contact[]> {
    return Array.from(this.contacts.values());
  }

  // Specialized operations
  async verifyCertificate(data: CertificateVerification): Promise<{ 
    valid: boolean;
    certificate?: Certificate;
    participant?: Participant;
    trainingProgram?: TrainingProgram; 
  }> {
    const certificate = await this.getCertificateByCertificateId(data.certificateId);
    if (!certificate) return { valid: false };
    
    const participant = await this.getParticipant(certificate.participantId);
    if (!participant || participant.fullName.toLowerCase() !== data.participantName.toLowerCase()) {
      return { valid: false };
    }
    
    const trainingProgram = await this.getTrainingProgram(certificate.trainingProgramId);
    if (!trainingProgram) return { valid: false };
    
    return {
      valid: true,
      certificate,
      participant,
      trainingProgram
    };
  }

  async checkParticipantStatus(data: StatusCheck): Promise<{
    valid: boolean;
    participant?: Participant;
    certificates?: Certificate[];
    trainingPrograms?: TrainingProgram[];
  }> {
    const participant = await this.getParticipantByParticipantId(data.participantId);
    if (!participant || participant.email.toLowerCase() !== data.email.toLowerCase()) {
      return { valid: false };
    }
    
    const certificates = await this.getCertificatesByParticipantId(participant.id);
    
    const trainingProgramIds = certificates.map(cert => cert.trainingProgramId);
    const trainingPrograms = await Promise.all(
      trainingProgramIds.map(id => this.getTrainingProgram(id))
    );
    
    return {
      valid: true,
      participant,
      certificates,
      trainingPrograms: trainingPrograms.filter(Boolean) as TrainingProgram[]
    };
  }
}

export const storage = new MemStorage();
