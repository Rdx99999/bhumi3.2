-- Sample data for Bhumi Consultancy D1 database

-- Insert users
INSERT INTO users (username, password, full_name, email, phone, role)
VALUES 
('admin', 'hashed_password_here', 'Admin User', 'admin@bhumiconsultancy.com', '+911234567890', 'admin'),
('manager', 'hashed_password_here', 'Manager User', 'manager@bhumiconsultancy.com', '+911234567891', 'manager');

-- Insert services (Already in schema)
-- INSERT INTO services (title, description, icon, features)
-- VALUES 
-- ('Consultancy Services', 'Our expert consultants provide strategic guidance to optimize your business operations, improve efficiency, and drive growth.', 'chart-line', '["Business strategy development", "Operational efficiency analysis", "Growth planning and implementation"]'),
-- ('Audit Preparation', 'Comprehensive audit preparation services to ensure your business is fully compliant and audit-ready.', 'file-invoice', '["Financial statement preparation", "Compliance documentation", "Risk assessment and mitigation"]');

-- Add more services
INSERT INTO services (title, description, icon, features)
VALUES 
('Business Analysis', 'Comprehensive business analysis to identify strengths, weaknesses, opportunities, and threats.', 'chart-bar', '["Market analysis", "Competitive positioning", "Gap identification", "Strategic recommendations"]'),
('Compliance Management', 'Ensure your business meets all regulatory and industry compliance requirements.', 'shield-check', '["Regulatory assessment", "Compliance gap analysis", "Implementation support", "Ongoing monitoring"]');

-- Insert training programs (some already in schema)
-- INSERT INTO training_programs (title, description, category, duration, price, image_path)
-- VALUES 
-- ('Strategic Business Planning', 'Learn how to develop and implement effective business strategies.', 'Business', '4 weeks', 12500, '/images/training1.jpg'),
-- ('Financial Management', 'Master financial planning, analysis, and reporting for business.', 'Finance', '6 weeks', 15000, '/images/training2.jpg'),
-- ('Executive Leadership', 'Develop essential leadership skills for executive positions.', 'Leadership', '8 weeks', 20000, '/images/training3.jpg');

-- Add more training programs
INSERT INTO training_programs (title, description, category, duration, price, online_price, offline_price, delivery_mode, image_path)
VALUES 
('Digital Marketing Fundamentals', 'Learn essential digital marketing strategies and tools.', 'Marketing', '3 weeks', 7500, 7500, 9500, 'both', '/images/training4.jpg'),
('Data Analytics for Business', 'Master data analysis techniques to drive business decisions.', 'Technology', '5 weeks', 11000, 11000, 14000, 'both', '/images/training5.jpg'),
('Risk Management Essentials', 'Identify, assess, and mitigate business risks effectively.', 'Business', '4 weeks', 10000, 10000, 13000, 'both', '/images/training6.jpg');

-- Insert participants
INSERT INTO participants (participant_id, full_name, email, phone, training_program_id, enrollment_date, status)
VALUES 
('BHM-P-2023001', 'John Doe', 'john.doe@example.com', '+911234567892', 1, '2023-01-15 00:00:00', 'active'),
('BHM-P-2023002', 'Jane Smith', 'jane.smith@example.com', '+911234567893', 2, '2023-02-10 00:00:00', 'completed'),
('BHM-P-2023003', 'Amit Patel', 'amit.patel@example.com', '+911234567894', 3, '2023-03-05 00:00:00', 'active'),
('BHM-P-2023004', 'Priya Sharma', 'priya.sharma@example.com', '+911234567895', 1, '2023-04-20 00:00:00', 'completed'),
('BHM-P-2023005', 'Michael Wong', 'michael.wong@example.com', '+911234567896', 4, '2023-05-12 00:00:00', 'active');

-- Insert certificates
INSERT INTO certificates (certificate_id, participant_id, training_program_id, issue_date, expiry_date, certificate_path)
VALUES 
('BHM23051501', 1, 1, '2023-05-15 00:00:00', '2025-05-15 00:00:00', '/certificates/BHM23051501.pdf'),
('BHM23042002', 2, 2, '2023-04-20 00:00:00', '2025-04-20 00:00:00', '/certificates/BHM23042002.pdf'),
('BHM23060503', 4, 1, '2023-06-05 00:00:00', '2025-06-05 00:00:00', '/certificates/BHM23060503.pdf');

-- Insert contacts
INSERT INTO contacts (full_name, email, phone, subject, message, created_at, status)
VALUES 
('Rahul Mehta', 'rahul.mehta@example.com', '+911234567897', 'Training Inquiry', 'I would like to know more about your Executive Leadership program.', '2023-06-10 10:15:00', 'pending'),
('Sarah Johnson', 'sarah.johnson@example.com', '+911234567898', 'Consultancy Services', 'We need help with our business strategy. Can you provide more information?', '2023-06-12 14:30:00', 'in-progress'),
('David Chen', 'david.chen@example.com', '+911234567899', 'Partnership Opportunity', 'I represent a training institute and would like to discuss a potential partnership.', '2023-06-15 09:45:00', 'completed');