// src/models/userData.js
// Updated designers data with admin and user roles
export const designers = [
  {
    id: 1,
    username: "admin",
    password: "admin123",
    name: "Admin User",
    role: "admin",
    avatar: "https://randomuser.me/api/portraits/men/1.jpg",
  },
  {
    id: 2,
    username: "user",
    password: "user123",
    name: "Regular User",
    role: "user",
    avatar: "https://randomuser.me/api/portraits/women/2.jpg",
  },
  {
    id: 3,
    username: "Kavindu",
    password: "Kavindu123",
    name: "Kavindu Perera",
    role: "user",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    id: 4,
    username: "Anusha",
    password: "Anusha123",
    name: "Anusha Thennakoon",
    role: "user",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    id: 5,
    username: "demo",
    password: "demo",
    name: "Demo User",
    role: "user",
    avatar: "https://randomuser.me/api/portraits/lego/1.jpg",
  },
];

// Function to authenticate a user
export const authenticateUser = (username, password) => {
  const user = designers.find(
    (user) => user.username === username && user.password === password
  );

  if (user) {
    const { ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  return null;
};

// Function to get user by ID
export const getUserById = (id) => {
  const user = designers.find((user) => user.id === id);

  if (user) {
    const { ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  return null;
};
