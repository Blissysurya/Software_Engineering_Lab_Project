import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';
import Shop from './models/Shop.js';
import Product from './models/Product.js';
import Order from './models/Order.js';
import Review from './models/Review.js';

dotenv.config();

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  await Promise.all([
    User.deleteMany(),
    Shop.deleteMany(),
    Product.deleteMany(),
    Order.deleteMany(),
    Review.deleteMany(),
  ]);
  console.log('Cleared existing data');

  const hash = (pw) => bcrypt.hash(pw, 10);

  // Users
  const [admin, v1, v2, d1, d2, s1, s2, s3] = await User.insertMany([
    { name: 'Admin User',      email: 'admin@campus.edu',   password: await hash('admin123'),    role: 'admin',    phone: '9000000001', address: 'Admin Block' },
    { name: 'Ravi Kumar',      email: 'ravi@campus.edu',    password: await hash('vendor123'),   role: 'vendor',   phone: '9000000002', address: 'Canteen Block A' },
    { name: 'Priya Sharma',    email: 'priya@campus.edu',   password: await hash('vendor123'),   role: 'vendor',   phone: '9000000003', address: 'Canteen Block B' },
    { name: 'Amit Singh',      email: 'amit@campus.edu',    password: await hash('delivery123'), role: 'delivery', phone: '9000000004', address: 'Hostel 3' },
    { name: 'Neha Verma',      email: 'neha@campus.edu',    password: await hash('delivery123'), role: 'delivery', phone: '9000000005', address: 'Hostel 5' },
    { name: 'Arjun Mehta',     email: 'arjun@campus.edu',   password: await hash('student123'),  role: 'student',  phone: '9000000006', address: 'Hostel 1, Room 204' },
    { name: 'Sneha Patel',     email: 'sneha@campus.edu',   password: await hash('student123'),  role: 'student',  phone: '9000000007', address: 'Hostel 2, Room 110' },
    { name: 'Rahul Gupta',     email: 'rahul@campus.edu',   password: await hash('student123'),  role: 'student',  phone: '9000000008', address: 'Hostel 4, Room 312' },
  ]);

  // Shops
  const [shop1, shop2, shop3] = await Shop.insertMany([
    {
      owner: v1._id,
      name: 'Ravi\'s Canteen',
      description: 'Hot meals, snacks and beverages for the whole campus',
      category: 'food',
      location: 'Main Canteen, Ground Floor',
      isOpen: true,
      isApproved: true,
      rating: 4.3,
      totalReviews: 2,
    },
    {
      owner: v2._id,
      name: 'Campus Brew',
      description: 'Coffee, tea, fresh juices and cold drinks',
      category: 'beverages',
      location: 'Library Block, Floor 1',
      isOpen: true,
      isApproved: true,
      rating: 4.7,
      totalReviews: 1,
    },
    {
      owner: v2._id,
      name: 'Study Supplies',
      description: 'Stationery, notebooks, pens and more',
      category: 'stationery',
      location: 'Academic Block, Near Entrance',
      isOpen: false,
      isApproved: true,
      rating: 0,
      totalReviews: 0,
    },
  ]);

  // Products
  const products = await Product.insertMany([
    // Ravi's Canteen
    { shop: shop1._id, name: 'Veg Thali',         description: 'Dal, sabzi, roti, rice and salad', price: 70,  category: 'Meals',   isAvailable: true,  preparationTime: 15 },
    { shop: shop1._id, name: 'Egg Fried Rice',    description: 'Wok-tossed rice with eggs',        price: 55,  category: 'Meals',   isAvailable: true,  preparationTime: 10 },
    { shop: shop1._id, name: 'Paneer Sandwich',   description: 'Grilled paneer with veggies',      price: 40,  category: 'Snacks',  isAvailable: true,  preparationTime: 8  },
    { shop: shop1._id, name: 'Samosa (2 pcs)',    description: 'Crispy potato-filled samosas',     price: 20,  category: 'Snacks',  isAvailable: true,  preparationTime: 5  },
    { shop: shop1._id, name: 'Maggi',             description: 'Classic masala Maggi noodles',     price: 30,  category: 'Snacks',  isAvailable: false, preparationTime: 7  },

    // Campus Brew
    { shop: shop2._id, name: 'Masala Chai',       description: 'Spiced milk tea',                  price: 15,  category: 'Hot',     isAvailable: true,  preparationTime: 3  },
    { shop: shop2._id, name: 'Cold Coffee',       description: 'Chilled coffee with cream',        price: 50,  category: 'Cold',    isAvailable: true,  preparationTime: 5  },
    { shop: shop2._id, name: 'Fresh Lime Soda',   description: 'Sweet or salted lime soda',        price: 30,  category: 'Cold',    isAvailable: true,  preparationTime: 3  },
    { shop: shop2._id, name: 'Cappuccino',        description: 'Espresso with frothed milk',       price: 60,  category: 'Hot',     isAvailable: true,  preparationTime: 5  },

    // Study Supplies
    { shop: shop3._id, name: 'A4 Notebook 200pg', description: 'Ruled notebook for notes',         price: 60,  category: 'Books',   isAvailable: true,  preparationTime: 2  },
    { shop: shop3._id, name: 'Pen Set (5 pcs)',   description: 'Blue and black ballpoint pens',    price: 25,  category: 'Pens',    isAvailable: true,  preparationTime: 2  },
    { shop: shop3._id, name: 'Highlighter Set',   description: '4 colour highlighters',           price: 45,  category: 'Pens',    isAvailable: true,  preparationTime: 2  },
  ]);

  const [vegThali, eggRice, paneerSandwich, , , masalaChai, coldCoffee] = products;

  // Orders
  const [order1, order2, order3] = await Order.insertMany([
    {
      student: s1._id,
      shop: shop1._id,
      items: [
        { product: vegThali._id, name: vegThali.name, price: vegThali.price, quantity: 1 },
        { product: paneerSandwich._id, name: paneerSandwich.name, price: paneerSandwich.price, quantity: 2 },
      ],
      totalAmount: 150,
      deliveryType: 'delivery',
      deliveryAddress: 'Hostel 2, Room 110',
      status: 'delivered',
      assignedTo: d1._id,
    },
    {
      student: s2._id,
      shop: shop2._id,
      items: [
        { product: masalaChai._id, name: masalaChai.name, price: masalaChai.price, quantity: 2 },
        { product: coldCoffee._id, name: coldCoffee.name, price: coldCoffee.price, quantity: 1 },
      ],
      totalAmount: 80,
      deliveryType: 'pickup',
      status: 'delivered',
      assignedTo: null,
    },
    {
      student: s3._id,
      shop: shop1._id,
      items: [
        { product: eggRice._id, name: eggRice.name, price: eggRice.price, quantity: 2 },
      ],
      totalAmount: 110,
      deliveryType: 'delivery',
      deliveryAddress: 'Hostel 4, Room 312',
      status: 'preparing',
      assignedTo: d2._id,
    },
  ]);

  // Reviews
  await Review.insertMany([
    {
      order: order1._id,
      student: s1._id,
      shop: shop1._id,
      rating: 4,
      comment: 'Veg thali was fresh and tasty. Delivery was on time!',
    },
    {
      order: order2._id,
      student: s2._id,
      shop: shop2._id,
      rating: 5,
      comment: 'Best cold coffee on campus, will order again.',
    },
    {
      order: order3._id,
      student: s3._id,
      shop: shop1._id,
      rating: 4,
      comment: 'Good food, decent price.',
    },
  ]);

  console.log('Seed complete!');
  console.log('--- Login credentials ---');
  console.log('Admin:    admin@campus.edu   / admin123');
  console.log('Vendor:   ravi@campus.edu    / vendor123');
  console.log('Vendor:   priya@campus.edu   / vendor123');
  console.log('Delivery: amit@campus.edu    / delivery123');
  console.log('Student:  arjun@campus.edu   / student123');
  console.log('Student:  sneha@campus.edu   / student123');
  console.log('Student:  rahul@campus.edu   / student123');

  await mongoose.disconnect();
}

seed().catch((err) => { console.error(err); process.exit(1); });
