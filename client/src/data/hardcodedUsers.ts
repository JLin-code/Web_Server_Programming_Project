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
    displayName: 'John Doe (User)',
    firstName: 'John',
    lastName: 'Doe',
    role: 'user'
  },
  {
    username: 'jane.smith@example.com',
    displayName: 'Jane Smith (User)',
    firstName: 'Jane',
    lastName: 'Smith',
    role: 'user'
  },
  {
    username: 'admin@example.com',
    displayName: 'Admin User (Admin)',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin'
  },
  {
    username: 'emily.johnson@example.com',
    displayName: 'Emily Johnson (User)',
    firstName: 'Emily',
    lastName: 'Johnson',
    role: 'user'
  },
  {
    username: 'david.wilson@example.com',
    displayName: 'David Wilson (User)',
    firstName: 'David',
    lastName: 'Wilson',
    role: 'user'
  }
];

export default demoUsers;
