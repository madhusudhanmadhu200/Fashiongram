import React, { Component } from "react";
import { API_BASE } from "../api/auth";
import { Navigate } from "react-router-dom";

class CreatePost extends Component {
    state = {
        image: null,
        caption: "",
        preview: null,
        tags: [],
        loading: false,
        error: null,
        redirect: false,
    };

    handleImageChange = ( e ) => {
        const file = e.target.files[ 0 ];
        if ( !file ) return;

        this.setState( {
            image: file,
            preview: URL.createObjectURL( file ),
            tags: [],
        } );
    };

    handleCaptionChange = ( e ) => {
        this.setState( { caption: e.target.value } );
    };

    handleImageClick = ( e ) => {
        const rect = e.target.getBoundingClientRect();
        const x = ( ( e.clientX - rect.left ) / rect.width ) * 100;
        const y = ( ( e.clientY - rect.top ) / rect.height ) * 100;

        const label = prompt( "Item name (Shirt / Jeans / Shoes/ Jewellery etc..)" );
        const link = prompt( "Product buy link" );

        if ( !label || !link ) return;

        this.setState( ( prev ) => ( {
            tags: [ ...prev.tags, { label, link, x, y } ],
        } ) );
    };

    handleSubmit = async ( e ) => {
        e.preventDefault();
        if ( !this.state.image ) {
            return this.setState( { error: "Image is required" } );
        }

        const formData = new FormData();
        formData.append( "image", this.state.image );
        formData.append( "caption", this.state.caption );
        formData.append( "tags", JSON.stringify( this.state.tags ) );

        try {
            this.setState( { loading: true, error: null } );

            const token = localStorage.getItem( "token" );

            const res = await fetch( `${ API_BASE }/posts`, {
                method: "POST",
                headers: { Authorization: `Bearer ${ token }` },
                body: formData,
            } );

            const data = await res.json();
            if ( !res.ok ) throw new Error( data.message || "Post failed" );

            this.setState( { redirect: true } );
        } catch ( err ) {
            this.setState( { error: err.message } );
        } finally {
            this.setState( { loading: false } );
        }
    };

    render() {
        if ( this.state.redirect ) return <Navigate to="/feed" />;

        return (
            <div
                style={ {
                    maxWidth: "420px",
                    margin: "0 auto",
                } }
            >
                <h2 style={ { marginBottom: "12px" } }>Create Post</h2>

                <form onSubmit={ this.handleSubmit }>
                    {/* IMAGE UPLOAD */ }
                    { !this.state.preview && (
                        <label
                            style={ {
                                display: "block",
                                border: "2px dashed #ccc",
                                borderRadius: "14px",
                                padding: "24px",
                                textAlign: "center",
                                cursor: "pointer",
                                marginBottom: "12px",
                            } }
                        >
                            📸 Click to upload image
                            <input
                                type="file"
                                accept="image/*"
                                hidden
                                onChange={ this.handleImageChange }
                            />
                        </label>
                    ) }
                    

                    {/* IMAGE PREVIEW */ }
                    { this.state.preview && (
                        <div
                            style={ {
                                position: "relative",
                                borderRadius: "14px",
                                overflow: "hidden",
                                marginBottom: "12px",
                            } }
                        >
                            <img
                                src={ this.state.preview }
                                alt="preview"
                                style={ { width: "100%", display: "block" } }
                                onClick={ this.handleImageClick }
                            />

                            {/* TAG DOTS */ }
                            { this.state.tags.map( ( tag, i ) => (
                                <div
                                    key={ i }
                                    title={ tag.label }
                                    style={ {
                                        position: "absolute",
                                        top: `${ tag.y }%`,
                                        left: `${ tag.x }%`,
                                        width: "14px",
                                        height: "14px",
                                        background: "#fff",
                                        borderRadius: "50%",
                                        border: "2px solid #000",
                                        transform: "translate(-50%, -50%)",
                                        boxShadow: "0 3px 8px rgba(0,0,0,0.25)",
                                    } }
                                />
                            ) ) }
                        </div>
                    ) }
                    <ul>
                        <li>Step 1: Upload an image</li>
                        <li>Step 2: Click anywhere on the image where the item appears</li>
                        <li>Step 3: Enter the item name (e.g. Shirt, Shoes)</li>
                        <li>Step 4: Paste the product link</li>
                        <li>Step 5: Repeat for multiple items</li>
                        <li>Step 6: Click Post</li>
                    </ul>

                    {/* CAPTION */ }
                    <textarea
                        placeholder="Write a caption..."
                        value={ this.state.caption }
                        onChange={ this.handleCaptionChange }
                        rows={ 3 }
                        style={ {
                            width: "100%",
                            border: "1px solid #e5e5e5",
                            borderRadius: "10px",
                            padding: "10px",
                            fontSize: "14px",
                            resize: "none",
                            marginBottom: "10px",
                        } }
                    />

                    {/* TAG INFO */ }
                    { this.state.tags.length > 0 && (
                        <p style={ { fontSize: "12px", color: "#666" } }>
                            { this.state.tags.length } item(s) tagged
                        </p>
                    ) }

                    {/* ERROR */ }
                    { this.state.error && (
                        <p style={ { color: "#e63946", fontSize: "13px" } }>
                            { this.state.error }
                        </p>
                    ) }

                    {/* SUBMIT */ }
                    <button
                        type="submit"
                        disabled={ this.state.loading }
                        style={ {
                            width: "100%",
                            background: "#000",
                            color: "#fff",
                            padding: "12px",
                            borderRadius: "10px",
                            border: "none",
                            fontWeight: "600",
                            cursor: "pointer",
                            opacity: this.state.loading ? 0.7 : 1,
                        } }
                    >
                        { this.state.loading ? "Posting..." : "Share Post" }
                    </button>
                </form>
            </div>
        );
    }
}

export default CreatePost;
