import { resend } from './config.js'
import { verificationTokenEmailTemplate, WELCOME_EMAIL_TEMPLATE } from './email-template.js'

export const sendVerificationEmail = async (email,verificationToken) => {
    try {
        const { data, error } = await resend.emails.send({
            from: "Acme <onboarding@resend.dev>",
            to: [email],
            subject: "Verify your Email !",
            html: verificationTokenEmailTemplate.replace("{verificationToken}",verificationToken)
          });
    } catch (error) {
        console.log('Error in sending verification email',error);
        throw new Error('Error sending verification email');
    }
}

export const sendWelcomeEmail = async ( email, name ) => {
    try {
        const { data, error } = await resend.emails.send({
            from: "Acme <onboarding@resend.dev>",
            to: [email],
            subject: "Welcome to our Company",
            html: WELCOME_EMAIL_TEMPLATE.replace("{name}",name)
          });
    } catch (error) {
        console.log('Error in sending Welcome email',error);
    }
}

export const sendPasswordResetEmail = async (email,resetURL) => {
    try {
        const { data, error } = await resend.emails.send({
            from: "Acme <onboarding@resend.dev>",
            to: [email],
            subject: "Reset your password",
            html: `Click <a href='${resetURL}'>here</a> to reset your password`
          });
    } catch (error) {
        console.log('Error in sending reset email',error);
    }
} 

export const sendResetSuccessEmail = async (email) =>{
    try {
        const { data, error } = await resend.emails.send({
            from: "Acme <onboarding@resend.dev>",
            to: [email],
            subject: "Reset password successfully",
            html: `Your password was reset successfully`
          });
    } catch (error) {
        console.log('Error sending password reset email',error);
    }
}