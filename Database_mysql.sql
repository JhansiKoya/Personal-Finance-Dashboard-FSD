CREATE DATABASE finance_db;
USE finance_db;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  password VARCHAR(255)
);

CREATE TABLE transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  amount DECIMAL(10,2),
  category VARCHAR(50),
  type ENUM('income','expense'),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
