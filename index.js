const mysql = require('mysql2');
const inquier = require('inquirer');
const table = require('console.table');
const inquirer = require('inquirer');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'employee_tracker'
});

connection.connect(err => {
    if (err) throw err;
    console.log('connected');
    questions();
});

const questions = () => {
    inquier.prompt([
        {
            type: 'list',
            name: 'choices',
            message: 'Please make a selection',
            choices: [
                'View employees',
                'View roles',
                'View departments',
                'Add an employee',
                'Add a role',
                'Add a department',
                'Update an employee role']
        }
    ])
        .then((choice) => {
            const { choices } = choice;

            if (choices === 'View departments') {
                viewDepartment();
            }

            if (choices === 'View roles') {
                viewRoles();
            }

            if (choices === 'View employees') {
                viewEmployees();
            }

            if (choices === 'Add a department') {
                addDepartment();
            }

            if (choices === 'Add a role') {
                addRole();
            }

            if (choices === 'Add an employee') {
                addEmployee();
            }

            if (choices === 'Update an employee role') {
                updateEmployee();
            };
        });
};

viewEmployees = () => {
    console.log('Showing employees');
    const sql = `SELECT employee.id, 
                    employee.first_name, 
                    employee.last_name, 
                    roles.title, 
                    department.name AS department,
                    roles.salary, 
                    CONCAT (manager.first_name, " ", manager.last_name) AS manager
                  FROM employee
                    LEFT JOIN roles ON employee.role_id = roles.id
                    LEFT JOIN department ON roles.department_id = department.id
                    LEFT JOIN employee manager ON employee.manager_id = manager.id`;

    connection.query(sql, (err, rows) => {
        if (err) throw (err);
        console.table(rows);
        questions();
    });
};

viewRoles = () => {
    console.log('Showing roles');
    const sql = `SELECT roles.id, roles.title, department.name AS department 
                FROM roles 
                INNER JOIN department ON roles.department_id = department.id`;

    connection.query(sql, (err, rows) => {
        if (err) throw err;
        console.table(rows);
        questions();
    });
};

const viewDepartment = () => {
    console.log('Showing departments');
    const sql = `SELECT department.id AS id, department.name AS department FROM department`;

    connection.query(sql, (err, rows) => {
        if (err) throw err;
        console.table(rows);
        questions();
    });
}; 

addEmployee = () => {
    inquirer.prompt ([
      {
        type: 'input',
        name: 'firstName',
        message: "What is the employee's first name?",
        validate: firstName => {
          if (firstName) {
            return true;
          } else {
            console.log("Please enter the employee's first name!");
            return false;
          }
        }
      },
      {
        type: 'input',
        name: 'lastName',
        message: "What is the employee's last name?",
        validate: lastName => {
          if (lastName) {
            return true;
          } else {
            console.log("Please enter the employee's last name!");
            return false;
          }
        }
      }
    ])
    .then(answer => {
    const params = [answer.firstName, answer.lastName];
  
    const rolesSql = `SELECT roles.id, roles.title FROM roles`;
  
    connection.query(rolesSql, (err, data) => {
      if (err) throw err;
  
      const role = data.map(({ id, title }) => ({ name: title, value: id }));
  
  
      inquirer.prompt([
        {
          type: 'list',
          name: 'role',
          message: "What is the new employee's role?",
          choices: role
        }
      ])
        .then(roleSelect => {
          const role = roleSelect.role;
          params.push(role);
  
          const managerSql = `SELECT * FROM employee`;
  
            connection.query(managerSql, (err, data) => {
              if (err) throw err;
  
              const managers = data.map(({ id, first_name, last_name }) => ({ name: first_name + " "+ last_name, value: id }));
  
              inquirer.prompt([
                {
                  type: 'list',
                  name: 'manager',
                  message: "Who is the new employee's manager?",
                  choices: managers
                }
                ])
                .then(managerSelect => {
                  const manager = managerSelect.manager;
                  params.push(manager);
  
                  const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id)
                  VALUES (?, ?, ?, ?)`;
  
                  connection.query(sql, params, (err, result) => {
                    if (err) throw err;
                    console.log("Employee has been added!")
  
                    viewEmployees();
                  });
                });
            });
        });
      });
    });
  }; 

  addRole = () => {
    inquirer.prompt([
      {
        type: 'input',
        name: 'role',
        message: 'What is the name of the new role?',
        validate: addRole => {
          if (addRole) {
            return true;
          } else {
            console.log('Please enter a role!');
            return false;
          }
        }
      },
      {
        type: 'input',
        name: 'salary',
        message: "What is the new role's salary",
        validate: addSalary => {
          if (addSalary) {
            return true;
          } else {
            console.log('Please enter a salary!');
            return false;
          }
        }
      }
    ])
    .then(answer => {
      const params = [answer.role, answer.salary];
  
      
      const rolesSql = `SELECT name, id FROM department`; 
  
      connection.query(rolesSql, (err, data) => {
        if (err) throw err; 
    
        const dept = data.map(({ name, id }) => ({ name: name, value: id }));
  
        inquirer.prompt([
        {
          type: 'list', 
          name: 'dept',
          message: "What department is this new role in?",
          choices: dept
        }
        ])
          .then(deptChoice => {
            const dept = deptChoice.dept;
            params.push(dept);
  
            const sql = `INSERT INTO roles (title, salary, department_id)
                        VALUES (?, ?, ?)`;
  
            connection.query(sql, params, (err, result) => {
              if (err) throw err;
              console.log('Added' + answer.role + " to roles!"); 
  
              viewRoles();
            });
          });
      });
    });
  }; 

  addDepartment = () => {
    inquier.prompt([
      {
        type: 'input',
        name: 'addDepartment',
        message: 'What new department would you like to add?',
        validate: addDepartment => {
          if (addDepartment) {
              return true;
          } else {
              console.log('Please enter a department!');
              return false;
          }
        }
      }
    ])
    .then(answer => {
      const sql = `INSERT INTO department (name)
                  VALUES (?)`;
      connection.query(sql, answer.addDepartment, (err, result) => {
        if (err) throw err;
        console.log('Added ' + answer.addDepartment + " to departments!"); 
  
        viewDepartment();
      });
    });
  }; 

  updateEmployee = () => {
    const employeeSql = `SELECT * FROM employee`;
  
    connection.query(employeeSql, (err, data) => {
      if (err) throw err;
  
      const employees = data.map(({ id, first_name, last_name }) => ({ name: first_name + " "+ last_name, value: id }));
  
      inquirer.prompt([
        {
          type: 'list',
          name: 'name',
          message: "Which employee would you like to update?",
          choices: employees
        }
      ])
      .then(employeeSelect => {
        const employee = employeeSelect.name;
        const params = []; 
        params.push(employee);
  
        const roleSql = `SELECT * FROM roles`;
  
        connection.query(roleSql, (err, data) => {
          if (err) throw err; 
  
          const roles = data.map(({ id, title }) => ({ name: title, value: id }));
          
            inquirer.prompt([
              {
                type: 'list',
                name: 'role',
                message: "What is the employee's new role?",
                choices: roles
              }
            ])
            .then(roleChoice => {
              const role = roleChoice.role;
              params.push(role); 
                
              let employee = params[0]
              params[0] = role
              params[1] = employee 
                
              const sql = `UPDATE employee SET role_id = ? WHERE id = ?`;
  
              connection.query(sql, params, (err, result) => {
                if (err) throw err;
                console.log("Employee has been updated!");
              
                viewEmployees();
              });
            });
        });
      });
    });
  }; 