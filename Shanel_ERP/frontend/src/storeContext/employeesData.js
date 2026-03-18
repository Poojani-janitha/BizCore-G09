export const generateEmployees = () => {
  const names = [
    'Aisha Fernando','Nimal Perera','Kamal Silva','Samantha Jayasuriya','Rohan Fernando',
    'Priyanka Kumari','Dilshan Rodrigo','Anushka Senanayake','Lakshan Madushan','Nirosha De Silva',
    'Kavindu Rajapaksha','Tharindu Wijesinghe','Madhawa Fernando','Sujatha Perera','Ishara Kumari',
    'Kasun Amarasinghe','Rashmi Fernando','Sandeep Jayawardena','Menaka Jayasuriya','Priyantha Silva',
    'Chathurika Fernando','Thusitha Ranasinghe'
  ];

  return names.map((name, i) => ({
    id: String(i + 1),
    name,
    role: i % 5 === 0 ? 'Manager' : 'Staff',
    email: `${name.split(' ')[0].toLowerCase()}@shanel.local`,
    phone: `+94-71-555-${String(100 + i).padStart(3,'0')}`,
    department: 'HR',
    image: '' // URL to profile photo - add via Edit
  }));
};

export const EMP_KEY = 'shanel_employees_v1';
