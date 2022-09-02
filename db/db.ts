import mongoose from 'mongoose';

const connectDB = async() => {
    const dbUrl : any = process.env.MONGO_URL
    await mongoose.connect(dbUrl);
    console.log("Mongo Connected");
}

export default connectDB;