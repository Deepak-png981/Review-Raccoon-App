import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

export async function connectDB() {
  try {
    if (mongoose.connections[0].readyState) {
      return mongoose;
    }

    await mongoose.connect(MONGODB_URI!, {
      bufferCommands: false,
    });

    return mongoose;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
} 