import express from "express";
import User from "../models/User.js";

const router = express.Router();

/* ✅ HEALTH CHECK */
router.get( "/test", ( req, res ) => {
    res.json( { message: "API is working" } );
} );

/* ⚠️ DEV ONLY - CREATE TEST USER */
router.get( "/create-test-user", async ( req, res ) => {
    try {
        const newUser = await User.create( {
            username: "user" + Date.now(),
            email: "test" + Date.now() + "@mail.com",
            password: "123456",
        } );

        res.json( { message: "Test user created", newUser } );
    } catch ( error ) {
        res.status( 500 ).json( { message: "Error", error } );
    }
} );

export default router;
