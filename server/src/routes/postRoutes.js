import express from "express";
import Post from "../models/Post.js";
import protect from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import cloudinary from "../config/cloudinary.js";

const router = express.Router();

// CREATE POST
router.post(
    "/",
    protect,
    upload.single( "image" ),
    async ( req, res ) => {
        try {
            if ( !req.file ) {
                return res.status( 400 ).json( { message: "Image is required" } );
            }

            // upload to cloudinary
            const result = await cloudinary.uploader.upload_stream(
                { folder: "fashiongram" },
                async ( error, uploadedImage ) => {
                    if ( error ) {
                        return res.status( 500 ).json( { message: "Image upload failed" } );
                    } 
                    const tags = req.body.tags ? JSON.parse(req.body.tags) : [];
                    const post = await Post.create( {
                        author: req.user._id,
                        imageUrl: uploadedImage.secure_url,
                        caption: req.body.caption || "",
                        tags,
                    } );

                    res.status( 201 ).json( post );
                }
            );

            result.end( req.file.buffer );
        } catch ( error ) {
            console.error( "CREATE POST ERROR:", error );
            res.status( 500 ).json( { message: error.message } );
        }

    }
);
// GET FEED POSTS
router.get( "/", protect, async ( req, res ) => {
    try {
        const page = Number( req.query.page ) || 1;
        const limit = 10;
        const skip = ( page - 1 ) * limit;

        const posts = await Post.find()
            .populate( "author", "username" )
            .populate( "comments.user", "username" )
            .sort( { createdAt: -1 } )
            .skip( skip )
            .limit( limit );

        res.json( posts );
    } catch ( err ) {
        res.status( 500 ).json( { message: "Failed to fetch posts" } );
    }
} );


// LIKE / UNLIKE POST
router.put( "/:id/like", protect, async ( req, res ) => {
    try {
        const post = await Post.findById( req.params.id );

        if ( !post ) {
            return res.status( 404 ).json( { message: "Post not found" } );
        }

        const userId = req.user._id.toString();

        const isLiked = post.likes.includes( userId );

        if ( isLiked ) {
            // UNLIKE
            post.likes = post.likes.filter(
                ( id ) => id.toString() !== userId
            );
        } else {
            // LIKE
            post.likes.push( userId );
        }

        await post.save();

        res.json( {
            postId: post._id,
            likesCount: post.likes.length,
            liked: !isLiked,
        } );
    } catch ( err ) {
        res.status( 500 ).json( { message: "Like action failed" } );
    }
} );

// ADD COMMENT
router.post( "/:id/comment", protect, async ( req, res ) => {
    try {
        const { text } = req.body;

        if ( !text ) {
            return res.status( 400 ).json( { message: "Comment text required" } );
        }

        const post = await Post.findById( req.params.id );

        if ( !post ) {
            return res.status( 404 ).json( { message: "Post not found" } );
        }

        post.comments.push( {
            user: req.user._id,
            text,
        } );

        await post.save();

        res.json( post.comments );
    } catch ( err ) {
        res.status( 500 ).json( { message: "Failed to add comment" } );
    }
} );
// Track tag click
router.put(
    "/:postId/tag/:tagIndex/click",
    protect,
    async ( req, res ) => {
        try {
            const { postId, tagIndex } = req.params;

            const post = await Post.findById( postId );
            if ( !post ) {
                return res.status( 404 ).json( { message: "Post not found" } );
            }

            if ( !post.tags[ tagIndex ] ) {
                return res.status( 400 ).json( { message: "Tag not found" } );
            }
            const index = Number( tagIndex );
            if (
                Number.isNaN( index ) ||
                index < 0 ||
                index >= post.tags.length
            ) {
                return res.status( 400 ).json( { message: "Invalid tag index" } );
            }

            post.tags[ tagIndex ].clicks =
                ( post.tags[ tagIndex ].clicks || 0 ) + 1;

            // 🔥 REQUIRED FOR MONGOOSE
            post.markModified( "tags" );

            await post.save();

            res.json( { success: true } );
        } catch ( err ) {
            console.error( "CLICK TRACK ERROR:", err );
            res.status( 500 ).json( { message: "Failed to track click" } );
        }
    }
);
router.put(
    "/:postId/tag/:tagIndex",
    protect,
    async ( req, res ) => {
        try {
            const { postId, tagIndex } = req.params;
            const { label, link } = req.body;

            const post = await Post.findById( postId );
            if ( !post ) {
                return res.status( 404 ).json( { message: "Post not found" } );
            }

            // 🔥 OWNERSHIP CHECK
            if ( post.author.toString() !== req.user._id.toString() ) {
                return res.status( 403 ).json( { message: "Not authorized" } );
            }

            // 🔥 DEFENSIVE INDEX CHECK (ADD HERE)
            const index = Number( tagIndex );
            if (
                Number.isNaN( index ) ||
                index < 0 ||
                index >= post.tags.length
            ) {
                return res.status( 400 ).json( { message: "Invalid tag index" } );
            }

            // 🔥 VALIDATION
            if ( label && label.trim().length < 2 ) {
                return res.status( 400 ).json( { message: "Label too short" } );
            }
            if ( link && !/^https?:\/\//i.test( link ) ) {
                return res.status( 400 ).json( { message: "Invalid URL" } );
            }

            if ( label ) post.tags[ index ].label = label;
            if ( link ) post.tags[ index ].link = link;

            post.markModified( "tags" );
            await post.save();

            res.json( { success: true, tags: post.tags } );
        } catch ( err ) {
            res.status( 500 ).json( { message: "Failed to edit tag" } );
        }
    }
);

router.delete(
    "/:postId/tag/:tagIndex",
    protect,
    async ( req, res ) => {
        try {
            const { postId, tagIndex } = req.params;

            const post = await Post.findById( postId );
            if ( !post ) {
                return res.status( 404 ).json( { message: "Post not found" } );
            }

            // 🔥 OWNERSHIP CHECK
            if ( post.author.toString() !== req.user._id.toString() ) {
                return res.status( 403 ).json( { message: "Not authorized" } );
            }

            // 🔥 DEFENSIVE INDEX CHECK (ADD HERE)
            const index = Number( tagIndex );
            if (
                Number.isNaN( index ) ||
                index < 0 ||
                index >= post.tags.length
            ) {
                return res.status( 400 ).json( { message: "Invalid tag index" } );
            }

            post.tags.splice( index, 1 );

            post.markModified( "tags" );
            await post.save();

            res.json( { success: true, tags: post.tags } );
        } catch ( err ) {
            res.status( 500 ).json( { message: "Failed to delete tag" } );
        }
    }
);

// DELETE POST
router.delete( "/:id", protect, async ( req, res ) => {
    try {
        const post = await Post.findById( req.params.id );

        if ( !post ) {
            return res.status( 404 ).json( { message: "Post not found" } );
        }

        // 🔒 Ownership check
        if ( post.author.toString() !== req.user._id.toString() ) {
            return res.status( 403 ).json( { message: "Not authorized" } );
        }

        // 🧹 Delete image from Cloudinary
        const publicId = post.imageUrl
            .split( "/" )
            .pop()
            .split( "." )[ 0 ];

        await cloudinary.uploader.destroy(
            `fashiongram/${ publicId }`
        );

        await post.deleteOne();

        res.json( { message: "Post deleted successfully" } );
    } catch ( err ) {
        console.error( "DELETE POST ERROR:", err );
        res.status( 500 ).json( { message: "Failed to delete post" } );
    }
} );


export default router;
