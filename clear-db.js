const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });

async function clear() {
    try {
        console.log('Connecting to:', process.env.MONGODB_URI);
        const rawUri = process.env.MONGODB_URI;
        const sanitizedUri = rawUri.replace(/<([^>]+)>/g, '$1');

        await mongoose.connect(sanitizedUri);

        // Use raw collection names since we're using plan JS without models
        const db = mongoose.connection.db;
        await db.collection('repos').deleteMany({});
        await db.collection('files').deleteMany({});
        await db.collection('dependencies').deleteMany({});

        console.log('Database collections cleared successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Failed to clear database:', err);
        process.exit(1);
    }
}

clear();
