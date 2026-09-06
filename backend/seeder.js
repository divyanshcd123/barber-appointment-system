/**
 * Seeder — Populates DB with initial admin, barbers, services, and sample appointments
 * Run with: npm run seed
 * Clear DB with: npm run seed -- --destroy
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('./models/User');
const Barber = require('./models/Barber');
const Service = require('./models/Service');
const Appointment = require('./models/Appointment');
const Review = require('./models/Review');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ MongoDB Connected for seeding');
};

const services = [
  { name: 'Classic Haircut', description: 'Traditional scissor and clipper cut tailored to your style', duration: 30, price: 200, category: 'haircut' },
  { name: 'Fade Haircut', description: 'Clean fade with precise blending from skin to full length', duration: 45, price: 250, category: 'haircut' },
  { name: 'Beard Trim', description: 'Expert beard shaping and trimming for a sharp look', duration: 20, price: 100, category: 'beard' },
  { name: 'Hot Towel Shave', description: 'Traditional straight razor shave with hot towel treatment', duration: 40, price: 200, category: 'beard' },
  { name: 'Haircut + Beard Combo', description: 'Complete grooming package – haircut and full beard service', duration: 60, price: 350, category: 'combo' },
  { name: 'Hair Coloring', description: 'Professional hair color treatment with premium products', duration: 90, price: 500, category: 'treatment' },
  { name: 'Scalp Treatment', description: 'Deep cleanse and nourishing scalp massage treatment', duration: 30, price: 250, category: 'treatment' },
  { name: 'Kids Haircut', description: 'Gentle and fun haircut experience for children under 12', duration: 20, price: 120, category: 'haircut' },
];

const barbers = [
  {
    name: 'Jawed Habib',
    email: 'jawed@barbershop.com',
    password: 'barber123',
    role: 'barber',
    phone: '+91-99887-76655',
    bio: 'Legendary Indian hair stylist and entrepreneur. Pioneer of modern hair styling in India.',
    specialties: ['Precision Haircut', 'Modern Blend', 'Creative Styling'],
    experience: 15,
    workingDays: [1, 2, 3, 4, 5, 6],
    workingHours: { start: '09:00', end: '18:00' },
    rating: 4.8,
    reviewCount: 124,
  },
  {
    name: 'Aalim Hakim',
    email: 'aalim@barbershop.com',
    password: 'barber123',
    role: 'barber',
    phone: '+91-88776-65544',
    bio: 'Celebrity hair designer styling India\'s top film stars and athletes. Master of textures and beard art.',
    specialties: ['Textured Hair', 'Beard Design', 'Hot Towel Shave'],
    experience: 12,
    workingDays: [1, 2, 3, 4, 5],
    workingHours: { start: '10:00', end: '19:00' },
    rating: 4.9,
    reviewCount: 98,
  },
  {
    name: 'Vikas Marwah',
    email: 'vikas@barbershop.com',
    password: 'barber123',
    role: 'barber',
    phone: '+91-77665-54433',
    bio: 'Acclaimed Indian salon stylist and hair educator. Specialist in hair transformations.',
    specialties: ['Advanced Styling', 'Modern Fades', 'Scalp Care'],
    experience: 8,
    workingDays: [2, 3, 4, 5, 6],
    workingHours: { start: '11:00', end: '20:00' },
    rating: 4.7,
    reviewCount: 67,
  },
];

const importData = async () => {
  try {
    await connectDB();

    // Clear existing
    await Promise.all([
      User.deleteMany(),
      Barber.deleteMany(),
      Service.deleteMany(),
      Appointment.deleteMany(),
      Review.deleteMany(),
    ]);

    // Create admin
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@barbershop.com',
      password: adminPassword,
      role: 'admin',
      phone: '+1-555-0000',
    });
    console.log('✅ Admin created: admin@barbershop.com / admin123');

    // Create barbers and their profile documents
    const daysOfWeekNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    for (const b of barbers) {
      const user = await User.create({
        name: b.name,
        email: b.email,
        password: b.password,
        role: 'barber',
        phone: b.phone,
      });

      const availableDays = b.workingDays.map(d => daysOfWeekNames[d]);
      const availableTime = `${b.workingHours.start} - ${b.workingHours.end}`;

      await Barber.create({
        _id: user._id,
        barberName: b.name,
        experience: b.experience,
        specialization: b.specialties.join(', '),
        profileImage: '',
        availableDays,
        availableTime,
        shopLocation: 'Downtown Main St.',
      });
    }
    console.log(`✅ ${barbers.length} barbers and profiles created`);

    // Create services
    const createdServices = await Service.insertMany(services);
    console.log(`✅ ${createdServices.length} services created`);

    // Create customer
    const customer = await User.create({
      name: 'John Doe',
      email: 'customer@example.com',
      password: 'customer123',
      role: 'customer',
      phone: '+1-555-9999',
    });
    console.log('✅ Sample customer: customer@example.com / customer123');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('  Admin:    admin@barbershop.com    / admin123');
    console.log('  Barber:   jawed@barbershop.com    / barber123');
    console.log('  Customer: customer@example.com    / customer123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await connectDB();
    await Promise.all([
      User.deleteMany(),
      Barber.deleteMany(),
      Service.deleteMany(),
      Appointment.deleteMany(),
      Review.deleteMany(),
    ]);
    console.log('🗑️  All data destroyed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Destroy error:', error);
    process.exit(1);
  }
};

if (process.argv[2] === '--destroy') {
  destroyData();
} else {
  importData();
}
