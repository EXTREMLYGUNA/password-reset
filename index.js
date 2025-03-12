import express from 'express';
import { connectToDatabase } from './database/connectToDatabase.js';
import dotenv from 'dotenv'
import router from './routes/auth-route.js'
import cookieParser from 'cookie-parser'
import cors from 'cors'

dotenv.config();

const app = express();
app.use(cors({origin:'http://localhost:5173',credentials:true}));

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', router)

connectToDatabase();

app.listen(3000,()=>{
    console.log('Server is running on port 3000');
})