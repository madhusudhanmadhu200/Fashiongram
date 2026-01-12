import express from "express";
import Post from "../models/Post.js";
import protect from "../middleware/authMiddleware.js";
import adminOnly from "../middleware/adminMiddleware.js";


const router = express.Router();

// 🔥 DELETE POST (ADMIN)
router.delete( "/posts/:id", protect, adminOnly, async ( req, res ) => {
    try {
        const post = await Post.findById( req.params.id );

        if ( !post ) {
            return res.status( 404 ).json( { message: "Post not found" } );
        }

        await post.deleteOne();
        res.json( { message: "Post deleted successfully" } );
    } catch ( err ) {
        res.status( 500 ).json( { message: "Server error" } );
    }
} );

export default router;
