import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";


const router = express.Router();

// Helper: generate token
const generateToken = ( id ) => {
    return jwt.sign( { id }, process.env.JWT_SECRET, { expiresIn: "7d" } );
};

// Signup route
router.post( "/register", async ( req, res ) => {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne( { email } );
        if ( existingUser ) {
            return res.status( 400 ).json( { message: "Email already exists" } );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash( password, 10 );

        // Create new user
        const newUser = await User.create( {
            username,
            email,
            password: hashedPassword,
        } );

        return res.json( {
            _id: newUser._id,
            username: newUser.username,
            email: newUser.email,
            role: newUser.role,
            token: generateToken( newUser._id ),
        } );
    } catch ( error ) {
        res.status( 500 ).json( { message: "Error registering user" } );
    }
} );

// Login route
router.post( "/login", async ( req, res ) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne( { email } );
        if ( !user ) return res.status( 401 ).json( { message: "Invalid credentials" } );

        // Compare password
        const isMatch = await bcrypt.compare( password, user.password );
        if ( !isMatch )
            return res.status( 401 ).json( { message: "Invalid credentials" } );

        res.json( {
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            token: generateToken( user._id ),
        } );

    } catch ( error ) {
        res.status( 500 ).json( { message: "Error logging in" } );
    }
} );
//Forgot Password(Send OTP)

router.post( "/forgot-password", async ( req, res ) => {
    try {
        const { email } = req.body;
        console.log( "Forgot password request for:", email );

        const user = await User.findOne( { email } );
        if ( !user ) {
            return res.status( 404 ).json( { message: "User not found" } );
        }

        const otp = Math.floor( 100000 + Math.random() * 900000 ).toString();

        user.resetOtp = await bcrypt.hash( otp, 10 );
        user.resetOtpExpiry = Date.now() + 5 * 60 * 1000; // 5 mins
        await user.save();

        await sendEmail(
            user.email,
            "Fashiongram Password Reset OTP",
            `Your OTP is ${ otp }. It is valid for 5 minutes.`
        );

        res.json( { message: "OTP sent to email" } );
    } catch ( err ) {
        console.error( "FORGOT PASSWORD ERROR >>>", err );
        res.status( 500 ).json( { message: "Failed to send OTP" } );
    }
} );

//RESET PASSWORD(Verify OTP)

router.post( "/reset-password", async ( req, res ) => {
    try {
        const { email, otp, newPassword } = req.body;

        const user = await User.findOne( { email } );
        if ( !user || !user.resetOtp )
            return res.status( 400 ).json( { message: "Invalid request" } );

        if ( user.resetOtpExpiry < Date.now() )
            return res.status( 400 ).json( { message: "OTP expired" } );

        const cleanOtp = String( otp ).trim();
        const isValid = await bcrypt.compare( cleanOtp, user.resetOtp );

        if ( !isValid )
            return res.status( 400 ).json( { message: "Invalid OTP" } );

        user.password = await bcrypt.hash( newPassword, 10 );
        user.resetOtp = undefined;
        user.resetOtpExpiry = undefined;
        await user.save();

        res.json( { message: "Password reset successful" } );
    } catch ( err ) {
        res.status( 500 ).json( { message: "Password reset failed" } );
    }
} );




export default router;
