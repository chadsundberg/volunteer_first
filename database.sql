
-- Christine's tables


-- Users table
CREATE TABLE users (
	id SERIAL PRIMARY KEY,
	email VARCHAR(40),
	first_name VARCHAR(40),
	last_name VARCHAR(40),
	is_admin BOOLEAN DEFAULT false
);
--Insert
INSERT INTO users (email, first_name, last_name, is_admin)
VALUES ('christinepogatchnik@gmail.com', 'christine', 'pogatchnik', true),
('email@email.com', 'tom', 'thumb', false);


 -- Events table
CREATE TABLE events (
	id SERIAL PRIMARY KEY,
	num_roles int,
	date date
);
--Insert
INSERT INTO events (num_roles, date)
VALUES (1, '2015-12-17'),
(4, '2016-1-15');


 -- Roles table
CREATE TABLE roles (
	id SERIAL PRIMARY KEY,
	role_name VARCHAR(80),
	start_time time,
	end_time time,
	event_id INT REFERENCES events
);

INSERT INTO roles (role_name, start_time, end_time, event_id)
VALUES ('Snack Bar', '12:00:00', '13:00:00', 1),
('Front Desk', '13:00:00', '14:00:00', 2);

 -- Role_User table
CREATE TABLE role_user (
	id SERIAL PRIMARY KEY,
	role_id INT REFERENCES roles,
	user_id INT REFERENCES users
);

INSERT INTO role_user (role_id, user_id)
VALUES (1, 1),
(2, 2);

SELECT *
FROM users
JOIN role_user ON users.id=role_user.user_id
JOIN roles ON roles.id=role_user.role_id;
