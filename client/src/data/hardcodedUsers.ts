export interface DemoUser {
  username: string;
  displayName: string;
  firstName: string;
  lastName: string;
  role: string;
}

export const demoUsers: DemoUser[] = [
  {
    username: 'john.doe@example.com',
    displayName: 'John Dwefoe (User)',
    firstName: 'John',
    lastName: 'Doeewf',
    role: 'user'
  },
  {
    username: 'jane.smith@example.com',
    displayName: 'Jane Smifwqeth (User)',
    firstName: 'Jane',
    lastName: 'Smith',
    role: 'user'
  },
  {
    username: 'admin@example.com',
    displayName: 'Admin Uqwfeser (Admin)',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin'
  },
  {
    username: 'emily.johnson@example.com',
    displayName: 'Emily Johnsfqweon (User)',
    firstName: 'Emily',
    lastName: 'Johnson',
    role: 'user'
  },
  {
    username: 'david.wilson@example.com',
    displayName: 'David Wilsfewqon (User)',
    firstName: 'David',
    lastName: 'Wilson',
    role: 'user'
  }
];

export default demoUsers;
