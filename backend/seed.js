require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./src/models/User');
const config = require('./src/config/env');

const seedAdmin = async () => {
    try {
        await mongoose.connect(config.mongoUrl);
        console.log('[Seed] Connected to MongoDB');

        const email = 'admin@company.com';
        const password = 'admin123';

        const existing = await User.findOne({ email });
        if (existing) {
            console.log(`[Seed] Admin already exists: ${email}`);
        } else {
            const passwordHash = await bcrypt.hash(password, 12);
            await User.create({
                name: 'Admin User',
                email,
                passwordHash,
                roles: ['Admin'],
                department: 'IT',
            });
            console.log(`[Seed] Admin created → email: ${email}  password: ${password}`);
            console.warn('[Seed] ⚠️  Change this password immediately after first login!');
        }
    } catch (err) {
        console.error('[Seed] Failed:', err.message);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
        console.log('[Seed] Disconnected from MongoDB');
    }
};

seedAdmin();
