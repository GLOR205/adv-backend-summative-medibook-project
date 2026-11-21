USE medibook;

INSERT INTO patients (full_name, email, phone) VALUES
('Ama Mensah','ama@mail.com','0244-111-222'),
('Kojo Owusu','kojo@mail.com','0555-333-444'),
('Aline Uwase','aline@mail.com','0788-123-456');

INSERT INTO doctors (full_name, specialty, consultation_fee, room) VALUES
('Dr. Boateng','Dermatology',150.00,'R-12'),
('Dr. Adjei','Paediatrics',100.00,'R-03'),
('Dr. Mukamana','General Practice',80.00,'R-01');   -- no appointments

-- Dr. Boateng: 11 bookings on one day (near the 12 cap)
INSERT INTO appointments (patient_id, doctor_id, appt_datetime, amount_paid) VALUES
(1,1,'2026-12-10 09:00:00',150),(2,1,'2026-12-10 09:30:00',150),
(3,1,'2026-12-10 10:00:00',150),(1,1,'2026-12-10 10:30:00',150),
(2,1,'2026-12-10 11:00:00',150),(3,1,'2026-12-10 11:30:00',150),
(1,1,'2026-12-10 12:00:00',150),(2,1,'2026-12-10 12:30:00',150),
(3,1,'2026-12-10 13:00:00',150),(1,1,'2026-12-10 13:30:00',150),
(2,1,'2026-12-10 14:00:00',150),
(1,2,'2026-12-15 10:00:00',100),
(3,2,'2026-12-16 11:00:00',100);

-- one cancelled record with a refund
INSERT INTO appointments (patient_id, doctor_id, appt_datetime, amount_paid, status, refund_amount, cancelled_at)
VALUES (2,2,'2026-12-17 09:00:00',100,'cancelled',50,NOW());