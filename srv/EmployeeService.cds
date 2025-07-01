using my.company as db from '../db/schema';

service EmployeeService @(path: '/odata/v4') {

    @(restrict: {
        grant: ['READ'],
        to   : [
            'Viewer',
            'Admin'
        ]
    })
    entity Roles       as projection on db.Roles;

    @(restrict: {
        grant: ['READ'],
        to   : [
            'Viewer',
            'Admin'
        ]
    })
    entity Departments as projection on db.Departments;

    @restrict: [
        {
            grant: ['*'],
            to   : ['Admin']
        },
        {
            grant: ['READ'],
            to   : ['Viewer']
        }
    ]
    entity Employees   as
        projection on db.Employees {
            *,
            role.name       as roleName,
            department.name as departmentName
        };

    // Calculate Salary
    function calculateSalary(role : UUID, hireDate : Date) returns Decimal(15, 2);
    // Get user login information
    function me()                          returns db.UserInfo;
}
