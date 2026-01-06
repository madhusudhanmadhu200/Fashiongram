import "dotenv/config";

import express from "express";

import cors from "cors";
import connectDB from "./config/db.js";
import testRoutes from "./routes/testRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import protect from "./middleware/authMiddleware.js";
import postRoutes from "./routes/postRoutes.js";
import userRoutes from "./routes/userRoutes.js";



// Connect DB
connectDB();

const app = express();

app.use( cors() );
app.use( express.json() );
app.use(
    cors( {
        origin: [
            "http://localhost:3000",
            "https://fashiongram.netlify.app"
        ],
        credentials: true,
    } )
);

app.use( "/api", testRoutes );
app.use( "/api/test", testRoutes );
app.use( "/api/auth", authRoutes );
app.use( "/api/posts", postRoutes );
app.use( "/api/users", userRoutes );


app.get( "/health", ( req, res ) => {
    res.json( { status: "ok", message: "Fashiongram backend is running" } );
} );

app.get( "/api/test/protected", protect, ( req, res ) => {
    res.json( { message: "Private Data", user: req.user } );
} );

const PORT = process.env.PORT || 5000;
app.listen( PORT, () => console.log( `Server running on port ${ PORT }` ) );
