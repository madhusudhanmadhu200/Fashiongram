import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
    {
        author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        imageUrl: { type: String, required: true },
        caption: { type: String, default: "" },
        tags: [
            {
                label: {
                    type: String, // Shirt, Jeans, Shoes
                    required: true,
                },
                link: {
                    type: String,
                    required: true,
                },
                x: Number,
                y: Number, 
                clicks: { type: Number, default: 0 },
            },
        ],

        likes: [ { type: mongoose.Schema.Types.ObjectId, ref: "User" } ],
        comments: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                },
                text: {
                    type: String,
                    required: true,
                },
                createdAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],

    },
    { timestamps: true }
    
);
postSchema.index( { author: 1, createdAt: -1 } );
postSchema.index( { "tags.clicks": -1 } );


export default mongoose.model( "Post", postSchema );
