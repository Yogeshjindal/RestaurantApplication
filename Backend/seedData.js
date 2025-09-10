import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "./models/userSchema.js";
import { Menu } from "./models/menuSchema.js";
import dotenv from "dotenv";

dotenv.config({ path: "./config/config.env" });

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "RestaurantApplication",
    });
    console.log("Connected to MongoDB");

    // Clear existing data
    await User.deleteMany({});
    await Menu.deleteMany({});
    console.log("Cleared existing data");

    // Create admin user
    const admin = await User.create({
      name: "Admin User",
      email: "admin@restaurant.com",
      password: "admin123", // Let the pre-save hook handle hashing
      role: "admin",
      phone: "1234567890",
      isActive: true
    });
    console.log("Created admin user:", admin.email);

    // Create staff user
    const staff = await User.create({
      name: "Staff User",
      email: "staff@restaurant.com",
      password: "staff123", // Let the pre-save hook handle hashing
      role: "staff",
      phone: "0987654321",
      isActive: true
    });
    console.log("Created staff user:", staff.email);

    // Create customer user
    const customer = await User.create({
      name: "Customer User",
      email: "customer@restaurant.com",
      password: "customer123", // Let the pre-save hook handle hashing
      role: "customer",
      isActive: true
    });
    console.log("Created customer user:", customer.email);

    // Create sample menu items
    const menuItems = [
      {
        name: "Caesar Salad",
        description: "Fresh romaine lettuce with parmesan cheese, croutons, and caesar dressing",
        price: 12.99,
        category: "salad",
        isAvailable: true,
        preparationTime: 10,
        ingredients: ["Romaine lettuce", "Parmesan cheese", "Croutons", "Caesar dressing"],
        allergens: ["Dairy", "Gluten"]
      },
      {
        name: "Grilled Salmon",
        description: "Fresh Atlantic salmon grilled to perfection with herbs and lemon",
        price: 24.99,
        category: "main_course",
        isAvailable: true,
        preparationTime: 20,
        ingredients: ["Salmon fillet", "Herbs", "Lemon", "Olive oil"],
        allergens: ["Fish"]
      },
      {
        name: "Chicken Alfredo",
        description: "Tender chicken breast with creamy alfredo sauce over fettuccine pasta",
        price: 18.99,
        category: "main_course",
        isAvailable: true,
        preparationTime: 25,
        ingredients: ["Chicken breast", "Fettuccine pasta", "Cream", "Parmesan cheese"],
        allergens: ["Dairy", "Gluten"]
      },
      {
        name: "Chocolate Lava Cake",
        description: "Warm chocolate cake with molten chocolate center, served with vanilla ice cream",
        price: 8.99,
        category: "dessert",
        isAvailable: true,
        preparationTime: 15,
        ingredients: ["Dark chocolate", "Butter", "Eggs", "Sugar", "Flour"],
        allergens: ["Dairy", "Eggs", "Gluten"]
      },
      {
        name: "Mushroom Soup",
        description: "Creamy mushroom soup with fresh herbs and a touch of truffle oil",
        price: 9.99,
        category: "soup",
        isAvailable: true,
        preparationTime: 15,
        ingredients: ["Mixed mushrooms", "Cream", "Herbs", "Truffle oil"],
        allergens: ["Dairy"]
      },
      {
        name: "Fresh Lemonade",
        description: "House-made lemonade with fresh lemons and mint",
        price: 4.99,
        category: "beverage",
        isAvailable: true,
        preparationTime: 5,
        ingredients: ["Fresh lemons", "Sugar", "Mint", "Water"],
        allergens: []
      }
    ];

    const createdMenuItems = await Menu.insertMany(menuItems);
    console.log(`Created ${createdMenuItems.length} menu items`);

    console.log("\n=== SEED DATA CREATED SUCCESSFULLY ===");
    console.log("Admin Login: admin@restaurant.com / admin123");
    console.log("Staff Login: staff@restaurant.com / staff123");
    console.log("Customer Login: customer@restaurant.com / customer123");
    console.log("=====================================");

  } catch (error) {
    console.error("Error seeding data:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
};

seedData();
