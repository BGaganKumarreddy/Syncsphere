/**
 * Seeder — run with: node src/seeder.js
 * Seeds demo projects into the DB on a fresh install.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Project = require('./models/Project.model');
const User = require('./models/User.model');

const demoProjects = [
    { name: 'Website Redesign', description: 'Full UI overhaul for the marketing site', status: 'Active', dueDate: '2026-04-30' },
    { name: 'Mobile App v2', description: 'Feature release for iOS and Android', status: 'In Progress', dueDate: '2026-06-15' },
    { name: 'Marketing Campaign', description: 'Q1 product launch campaign', status: 'Completed', dueDate: '2026-02-01' },
];

const seed = async () => {
    await connectDB();

    const existingProjects = await Project.countDocuments();
    if (existingProjects > 0) {
        console.log('ℹ️  DB already has projects — skipping seed.');
        process.exit(0);
    }

    await Project.insertMany(demoProjects);
    console.log(`✅ Seeded ${demoProjects.length} demo projects.`);
    process.exit(0);
};

seed().catch((err) => {
    console.error('❌ Seeder error:', err.message);
    process.exit(1);
});
