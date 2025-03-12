import mongoose from 'mongoose'

export const connectToDatabase = async()=>{
    try {
        const connection = await mongoose.connect(process.env.DB_URL) 
        console.log(`MongoDB connected : ${connection.connection.host}`)
    } catch (error) {
        console.log(`Connection Failed to : ${error.message}`)
    }
}
