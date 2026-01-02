import express from "express";
import User from "../models/User.js";
import Post from "../models/Post.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// FOLLOW / UNFOLLOW USER
router.put( "/:id/follow", protect, async ( req, res ) => {
    try {
        const targetUser = await User.findById( req.params.id );
        const currentUser = await User.findById( req.user._id );

        if ( !targetUser ) {
            return res.status( 404 ).json( { message: "User not found" } );
        }

        if ( targetUser._id.equals( currentUser._id ) ) {
            return res.status( 400 ).json( { message: "You cannot follow yourself" } );
        }

        const isFollowing = currentUser.following.includes( targetUser._id );

        if ( isFollowing ) {
            // UNFOLLOW
            currentUser.following.pull( targetUser._id );
            targetUser.followers.pull( currentUser._id );
        } else {
            // FOLLOW
            currentUser.following.push( targetUser._id );
            targetUser.followers.push( currentUser._id );
        }

        await currentUser.save();
        await targetUser.save();

        res.json( {
            following: !isFollowing,
            followersCount: targetUser.followers.length,
        } );
    } catch ( err ) {
        res.status( 500 ).json( { message: "Follow action failed" } );
    }
} );
// GET USER PROFILE
router.get( "/:id", protect, async ( req, res ) => {
    try {
        const user = await User.findById( req.params.id )
            .select( "-password" );

        if ( !user ) {
            return res.status( 404 ).json( { message: "User not found" } );
        }

        const posts = await Post.find( { author: user._id } )
            .sort( { createdAt: -1 } ); // 🔥 IMPORTANT

        res.json( {
            user,
            posts, // ✅ FULL Post docs INCLUDING tags.clicks
        } );
    } catch ( err ) {
        console.error( "PROFILE FETCH ERROR:", err );
        res.status( 500 ).json( { message: "Failed to load profile" } );
    }
} );
// SEARCH USERS
router.get( "/search/:query", protect, async ( req, res ) => {
    try {
        const keyword = req.params.query;

        const users = await User.find( {
            username: { $regex: keyword, $options: "i" },
        } )
            .select( "_id username" )
            .limit( 10 );

        res.json( users );
    } catch ( err ) {
        res.status( 500 ).json( { message: "Search failed" } );
    }
} );




export default router;
