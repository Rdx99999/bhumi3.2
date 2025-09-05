/**
 * This file contains the interface and type definitions for interacting with the Cloudflare Workers API
 * In a production environment, this would be replaced with actual Cloudflare Workers API calls
 */

import { 
  TrainingProgram, 
  Service, 
  Participant, 
  Certificate,
  Contact,
  CertificateVerification,
  StatusCheck
} from './schema';

// Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface CertificateVerificationResult {
  certificate: {
    certificateId: string;
    issueDate: string;
    status: 'active' | 'expired' | 'revoked';
    certificatePath?: string;
  };
  participant: {
    name: string;
    id: number;
  };
  training: {
    name: string;
    id: number;
  };
}

export interface ParticipantStatusResult {
  participant: {
    participantId: string;
    name: string;
    status: 'active' | 'completed' | 'inactive';
  };
  enrolledPrograms: {
    id: number;
    name: string;
    completionDate?: string;
    certificateId?: string;
  }[];
}

// Cloudflare D1 schema 
export const D1_SCHEMA = `
-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'user'
);

-- Services Table
CREATE TABLE IF NOT EXISTS services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  features TEXT NOT NULL
);

-- Training Programs Table
CREATE TABLE IF NOT EXISTS training_programs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  duration TEXT NOT NULL,
  price INTEGER NOT NULL,
  image_path TEXT
);

-- Participants Table
CREATE TABLE IF NOT EXISTS participants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  participant_id TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  training_program_id INTEGER NOT NULL,
  enrollment_date TIMESTAMP NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  FOREIGN KEY (training_program_id) REFERENCES training_programs(id)
);

-- Certificates Table
CREATE TABLE IF NOT EXISTS certificates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  certificate_id TEXT NOT NULL UNIQUE,
  participant_id INTEGER NOT NULL,
  training_program_id INTEGER NOT NULL,
  issue_date TIMESTAMP NOT NULL,
  expiry_date TIMESTAMP,
  certificate_path TEXT,
  FOREIGN KEY (participant_id) REFERENCES participants(id),
  FOREIGN KEY (training_program_id) REFERENCES training_programs(id)
);

-- Contacts Table
CREATE TABLE IF NOT EXISTS contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
);

-- Insert initial services data
INSERT INTO services (title, description, icon, features)
VALUES 
('Consultancy Services', 'Our expert consultants provide strategic guidance to optimize your business operations, improve efficiency, and drive growth.', 'chart-line', '["Business strategy development", "Operational efficiency analysis", "Growth planning and implementation"]'),
('Audit Preparation', 'Comprehensive audit preparation services to ensure your business is fully compliant and audit-ready.', 'file-invoice', '["Financial statement preparation", "Compliance documentation", "Risk assessment and mitigation"]');

-- Insert initial training programs data
INSERT INTO training_programs (title, description, category, duration, price, image_path)
VALUES 
('Strategic Business Planning', 'Learn how to develop and implement effective business strategies.', 'Business', '4 weeks', 12500, '/images/training1.jpg'),
('Financial Management', 'Master financial planning, analysis, and reporting for business.', 'Finance', '6 weeks', 15000, '/images/training2.jpg'),
('Executive Leadership', 'Develop essential leadership skills for executive positions.', 'Leadership', '8 weeks', 20000, '/images/training3.jpg');
`;
