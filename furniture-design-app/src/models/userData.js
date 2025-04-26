// Sample designers data for login authentication
export const designers = [
  {
    id: 1,
    username: 'emma',
    password: 'design123', // In a real app, this would be properly hashed
    name: 'Emma Thompson',
    role: 'Interior Designer',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
  },
  {
    id: 2,
    username: 'james',
    password: 'furniture456',
    name: 'James Wilson',
    role: 'Senior Designer',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
  },
  {
    id: 3,
    username: 'demo',
    password: 'demo',
    name: 'Demo User',
    role: 'Test Designer',
    avatar: 'https://randomuser.me/api/portraits/lego/1.jpg'
  }
];

// Sample function to authenticate a user
export const authenticateUser = (username, password) => {
  const user = designers.find(
    user => user.username === username && user.password === password
  );
  
  if (user) {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  
  return null;
};