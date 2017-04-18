
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
	date date
);
--Insert
INSERT INTO events (date)
VALUES ('2015-12-17'),
('2016-1-15');


-- Roles table
CREATE TABLE roles (
id SERIAL PRIMARY KEY,
role_title VARCHAR(80) NOT NULL,
start_time time NOT NULL,
end_time time NOT NULL,
num_users INT NOT NULL,
event_id INT REFERENCES events NOT NULL
);


INSERT INTO roles (role_title, start_time, end_time, num_users, event_id)
VALUES ('Snack Bar', '12:00:00', '13:00:00',2, 1),
('Front Desk', '13:00:00', '14:00:00', 2, 2);

-- Role_User table
CREATE TABLE role_user (
 id SERIAL PRIMARY KEY,
 role_id INT REFERENCES roles NOT NULL,
 user_id INT REFERENCES users NOT NULL
);


INSERT INTO role_user (role_id, user_id)
VALUES (1, 1),
(2, 2);

SELECT roles.id, roles.role_title, roles.num_users, events.date, users.first_name, users.last_name, COUNT(roles.id) AS signed_up
FROM users
JOIN role_user ON users.id=role_user.user_id
JOIN roles ON roles.id=role_user.role_id
JOIN events ON roles.event_id=events.id
GROUP BY roles.id, events.id, users.first_name, users.last_name;

ALTER TABLE users ADD COLUMN has_met_requirement BOOLEAN DEFAULT FALSE;

SELECT roles.id, roles.role_title, roles.num_users, events.date, COUNT(roles.id) AS signed_up
FROM users
RIGHT OUTER JOIN role_user ON users.id=role_user.user_id
FULL OUTER JOIN roles ON roles.id=role_user.role_id
FULL OUTER JOIN events ON roles.event_id=events.id
GROUP BY roles.id, events.id;