import {User} from '../model/user.js'
import bcrypt from 'bcryptjs'
import { generateVerificationToken } from '../utils/generateVerificationToken.js'
import { generateJWTToken} from '../utils/generateJWTToken.js'
import { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail , sendResetSuccessEmail } from '../resend/email.js'
import crypto from 'crypto'

export const signup = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        if(!name || !email || !password){
           return res.status(400).json({ message: 'All fields are required' });
        }
        const userAlreadyExists = await User.findOne({ email });
        if(userAlreadyExists){
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = generateVerificationToken();
        const user = new User({
            name,
            email,
            password: hashedPassword,
            verificationToken : verificationToken,
            verificationTokenExpiredAt: Date.now() + 24 * 60 * 60 * 1000
        });
        await user.save();
        
        generateJWTToken(res,user._id);

        await sendVerificationEmail(user.email,verificationToken);

        res.status(201).json({ 
            success: true,
            message: 'User created successfully',
            user:{
                ...user._doc,
                password: undefined
            },
        });
    } catch (error) {
        res.status(400).json({ sucess:true,message:error.message })
    }
}

export const login = async (req, res) => {
    const { email , password } = req.body
    try {
        const user = await User.findOne({email})
        if(!user){
            return res.status(400).json({ success:false, message: "Invalid credentials" })
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid){
            return res.status(400).json({ success:false, message: "Invalid credentials" })
        }
        const isVerified = user.isVerified
        if(!isVerified){
            return res.status(400).json({ success:false, message: "Email not verified" })
        }
        generateJWTToken(res,user._id);
        res.status(200).json({
            success:true,
            message: "Login successful"
        })

    } catch (error) {
        console.log("Error logging in",error)
        res.status(400).json({ success:false, message: error.message})
    }
}

export const logout = async (req, res) => {
    res.clearCookie('token')
    res.status(200).json({success:true, message:"Logged out successful"})
}

export const verifyEmail = async (req, res) => {
    const {code} = req.body
    try {
        const user = await User.findOne({
            verificationToken : code,
            verificationTokenExpiredAt : {$gt: Date.now()},
        })
        if(!user){
            return res.status(400).json({ success: false, message : "Invalid or Expired verification code"});
        }
        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiredAt = undefined;
        await user.save();
        await sendWelcomeEmail(user.email, user.name);
        res.status(200).json({ success : true, message : "Email veified successfully" })

    } catch (error) {
        console.log("Error verifing Email",error)
        res.status(400).json({ sucess:true, message : error.message })
    }
}
 
export const forgotPassword = async (req, res) => {
    const {email} = req.body;
    try {
        const user = await User.findOne({email})
        if(!user){
            return res.status(400).json({success: false, messgage : "User not found"})
        }
    const resetPasswordToken = crypto.randomBytes(32).toString('hex')
    const resetPasswordExpiredAt = Date.now() + 1 * 60 * 60 * 1000;

    user.resetPasswordToken = resetPasswordToken
    user.resetPasswordExpiredAt = resetPasswordExpiredAt
    
    await user.save()
    await sendPasswordResetEmail(user.email, `${process.env.CLIENT_URL}/reset-password/${resetPasswordToken}`)
    res.status(200).json({ success:true, message: "Password reset Email sent successfully"})
    } catch (error) {
        console.log("Error sending paassword reset email", error);
        res.status(400).json({success:false , message : error.message})
    }
}

export const resetPassword = async (req,res) =>{
    try {
        const {token} = req.params;
        const {password} = req.body;
        const user = await User.findOne({
            resetPasswordToken : token,
            resetPasswordExpiredAt : {$gt:Date.now()},
        })
        if(!user){
            return res.status(400).json({ sucess: false, message : "Invalid or Expired reset token"})
        }
        const hashedPassword = await bcrypt.hash(password,10);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiredAt = undefined;
        await user.save()

        await sendResetSuccessEmail(user.email);
        res.status(200).json({ sucess:true, message:"Password reset successfully"})
    } catch (error) {
        console.log('Error password reset email', error)
        res.status(400).json({success:false, message : error.message})
    }
}

export const checkAuth = async (req,res) =>{
    try {
        const user = await User.findById(req.userId)
        if(!user){
            return res.status(400).json({success:false, message:'User not Found'})
        }
        res.status(200).json({success:true, user:{...user._doc, password:undefined}});
    } catch (error) {
        console.log('Error checking auth', error)
        res.status(401).json({success:true, message:error,message})
    }
}