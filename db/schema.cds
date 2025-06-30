namespace my.company;

entity Roles {
  key ID       : UUID;
  name         : String;
  baseSalary   : Decimal(15,2);
}

entity Departments {
  key ID       : UUID;
  name         : String;
}

entity Employees {
  key ID         : UUID;
      firstName  : String;
      lastName   : String;
      dateOfBirth: Date;
      gender     : String;
      email      : String;
      hireDate   : Date;
      role       : Association to Roles;
      department : Association to Departments;
      salary     : Decimal(15,2);
}

type UserInfo {
  id    : String;
  roles : String;
}
