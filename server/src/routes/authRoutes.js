import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

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
            token: generateToken( user._id ),
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
            },
        } );

    } catch ( error ) {
        res.status( 500 ).json( { message: "Error logging in" } );
    }
} );

export default router;
