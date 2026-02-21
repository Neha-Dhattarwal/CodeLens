import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, 'backend', '.env') });

async function clear() {
    try {
        const rawUri = process.env.MONGODB_URI;
        const sanitizedUri = rawUri.replace(/<([^>]+)>/g, '$1');
        console.log('Connecting to sanitize URI...');

        await mongoose.connect(sanitizedUri);
        const db = mongoose.connection.db;

        await db.collection('repos').deleteMany({});
        await db.collection('filerecards').deleteMany({}); // Matches schema name if used
        await db.collection('filerecords').deleteMany({});
        await db.collection('dependencies').deleteMany({});

        console.log('Database collections cleared successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Failed to clear database:', err);
        process.exit(1);
    }
}

clear();
