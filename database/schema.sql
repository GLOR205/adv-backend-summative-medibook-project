CREATE DATABASE IF NOT EXISTS medibook;
USE medibook;

CREATE TABLE patients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  phone VARCHAR(20) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE doctors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  specialty VARCHAR(100) NOT NULL,
  consultation_fee DECIMAL(10,2) NOT NULL CHECK (consultation_fee >= 0),
  room VARCHAR(10) NOT NULL
);

CREATE TABLE appointments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  doctor_id INT NOT NULL,
  appt_datetime DATETIME NOT NULL,
  amount_paid DECIMAL(10,2) NOT NULL CHECK (amount_paid >= 0),
  status ENUM('booked','cancelled') NOT NULL DEFAULT 'booked',
  refund_amount DECIMAL(10,2) NULL CHECK (refund_amount >= 0),
  cancelled_at DATETIME NULL,
  booked_on DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  active_slot DATETIME GENERATED ALWAYS AS
    (IF(status = 'booked', appt_datetime, NULL)) STORED,
  CONSTRAINT fk_appt_patient FOREIGN KEY (patient_id) REFERENCES patients(id),
  CONSTRAINT fk_appt_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id),
  CONSTRAINT uq_doctor_active_slot UNIQUE (doctor_id, active_slot)
);