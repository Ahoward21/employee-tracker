INSERT INTO department
    (name)
VALUES
    ('Magical Law Enforcement'),
    ('Magical Games and Sports'),
    ('Magical Creatures'),
    ('Mysteries');

INSERT INTO roles
    (title, salary, department_id)
VALUES
    ('Aurors Division', 90000, 1),
    ('Dragon Research', 60000, 3),
    ('The Unspeakables', 100000, 4),
    ('Game Master', 75000, 2);

INSERT INTO employee
    (first_name, last_name, role_id, manager_id)
VALUES
    ('Harry', 'Potter', 2, NULL),
    ('Hermoine', 'Granger', 3, NULL),
    ('Albus', 'Dumbledore', 1, NULL),
    ('Luna', 'Lovegood', 4, NULL),
    ('Remus', 'Lupin', 2, 1),
    ('Neville', 'Longbottom', 3, 2),
    ('Rubeus', 'Hagrid', 1, 3),
    ('Sirius', 'Black', 4, 4);