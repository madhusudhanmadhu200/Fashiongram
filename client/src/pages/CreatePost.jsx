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

        const label = prompt( "Item name (Shirt / Shoes / Watch etc)" );
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
            <div className="container mt-4" style={ { maxWidth: "520px" } }>
                <div className="card shadow-sm border-0 rounded-4">
                    <div className="card-body p-4">
                        <h4 className="text-center mb-3">Create Post</h4>
                        <p style={ { fontStyle: "italic" } }>Max Size: 5MB</p>
                        <p
                            style={ {
                                fontSize: "12px",
                                color: "#e74c3c",
                                textAlign: "center",
                                marginTop: "6px",
                            } }
                        >
                            Only .jpeg / .jpg / .png images are accepted
                        </p>


                        <form onSubmit={ this.handleSubmit }>
                            {/* IMAGE UPLOAD */ }
                            { !this.state.preview && (
                                <label
                                    className="d-flex flex-column align-items-center justify-content-center border border-2 border-dashed rounded-4 p-4 text-muted"
                                    style={ { cursor: "pointer" } }
                                >
                                    <div style={ { fontSize: "32px" } }>📸</div>
                                    <div className="mt-2 fw-semibold">
                                        Click to upload image
                                    </div>

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
                                    className="position-relative rounded-4 overflow-hidden mb-3 mt-2"
                                    style={ { cursor: "crosshair" } }
                                >
                                    <img
                                        src={ this.state.preview }
                                        alt="preview"
                                        className="w-100"
                                        onClick={ this.handleImageClick }
                                    />

                                    { this.state.tags.map( ( tag, i ) => (
                                        <span
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

                            {/* INSTRUCTIONS */ }
                            <div className="bg-light rounded-3 p-3 small mb-3">
                                <div className="fw-semibold mb-1">
                                    How to tag products
                                </div>
                                <ol className="mb-0 ps-3">
                                    <li>Upload an image</li>
                                    <li>Click on the item in the image</li>
                                    <li>Enter item name</li>
                                    <li>Paste product link</li>
                                    <li>Repeat for multiple items</li>
                                </ol>
                            </div>

                            {/* CAPTION */ }
                            <textarea
                                className="form-control mb-2"
                                placeholder="Write a caption..."
                                rows={ 3 }
                                value={ this.state.caption }
                                onChange={ this.handleCaptionChange }
                            />

                            {/* TAG COUNT */ }
                            { this.state.tags.length > 0 && (
                                <div className="small text-muted mb-2">
                                    { this.state.tags.length } item(s) tagged
                                </div>
                            ) }

                            {/* ERROR */ }
                            { this.state.error && (
                                <div className="text-danger small mb-2">
                                    { this.state.error }
                                </div>
                            ) }

                            {/* SUBMIT */ }
                            <button
                                type="submit"
                                className="btn btn-dark w-100 rounded-pill"
                                disabled={ this.state.loading }
                            >
                                { this.state.loading ? "Posting..." : "Share Post" }
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }
}

export default CreatePost;
