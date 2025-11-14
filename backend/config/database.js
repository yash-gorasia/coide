import mongoose from 'mongoose';

export const connectDB = async () => {
    try {
        console.log('Attempting to connect to MongoDB...');
        console.log('MongoDB URI:', process.env.MONGODB_URI ? 'URI is set' : 'URI is undefined');
        
        const conn = await mongoose.connect(process.env.MONGODB_URI);

        console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}`);
        console.log(`📂 Database Name: ${conn.connection.name}`);
        
    } catch (error) {
        console.error('❌ Database connection error:', error.message);
        console.log('💡 Using local MongoDB? Make sure MongoDB is running on your machine');
        console.log('💡 Using MongoDB Atlas? Check your credentials and network access');
        
        // Don't exit in development, allow server to run without DB for now
        if (process.env.NODE_ENV === 'production') {
            process.exit(1);
        }
    }
};