import React, { Component } from "react";
import { API_BASE } from "../api/auth";
import { Link } from "react-router-dom";
import UserSearch from "../components/UserSearch";


class Feed extends Component {
    state = {
        posts: [],
        commentText: {},
        loading: true,
        error: null,
        hoveredPost: null,
        page: 1,
    };

    async componentDidMount() {
        try {
            const token = localStorage.getItem( "token" );

            const res = await fetch(
                `${ API_BASE }/posts?page=${ this.state.page }`,
                {
                    headers: { Authorization: `Bearer ${ token }` },
                }
            );

            const data = await res.json();
            if ( !res.ok ) throw new Error( data.message );

            this.setState( ( prev ) => ( {
                posts: [ ...prev.posts, ...data ],
                loading: false,
            } ) );
        } catch ( err ) {
            this.setState( { error: err.message, loading: false } );
        }
    }

    handleLike = async ( postId ) => {
        const token = localStorage.getItem( "token" );

        const res = await fetch( `${ API_BASE }/posts/${ postId }/like`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${ token }` },
        } );

        const data = await res.json();

        this.setState( ( prev ) => ( {
            posts: prev.posts.map( ( p ) =>
                p._id === postId
                    ? { ...p, likes: Array( data.likesCount ).fill( 0 ) }
                    : p
            ),
        } ) );
    };

    handleCommentChange = ( postId, value ) => {
        this.setState( ( prev ) => ( {
            commentText: { ...prev.commentText, [ postId ]: value },
        } ) );
    };

    handleAddComment = async ( postId ) => {
        const token = localStorage.getItem( "token" );
        const text = this.state.commentText[ postId ];
        if ( !text ) return;

        const res = await fetch(
            `${ API_BASE }/posts/${ postId }/comment`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${ token }`,
                },
                body: JSON.stringify( { text } ),
            }
        );

        const comments = await res.json();

        this.setState( ( prev ) => ( {
            posts: prev.posts.map( ( p ) =>
                p._id === postId ? { ...p, comments } : p
            ),
            commentText: { ...prev.commentText, [ postId ]: "" },
        } ) );
    };

    handleTagClick = async ( postId, tagIndex, link ) => {
        try {
            const token = localStorage.getItem( "token" );

            await fetch(
                `${ API_BASE }/posts/${ postId }/tag/${ tagIndex }/click`,
                {
                    method: "PUT",
                    headers: { Authorization: `Bearer ${ token }` },
                }
            );
        } finally {
            window.open( link, "_blank" );
        }
    };

    render() {
        const { posts, loading, error, hoveredPost } = this.state;

        if ( loading ) return <p className="text-center mt-5">Loading feed...</p>;
        if ( error ) return <p className="text-center text-danger">{ error }</p>;

        return (
            <div className="container mt-4" style={ { maxWidth: "600px" } }>
                <UserSearch />

                { posts.map( ( post ) => (
                    <div key={ post._id } className="card mb-4 shadow-sm border-0 rounded-4">
                        {/* HEADER */ }
                        <div className="card-header bg-white border-0 d-flex align-items-center">
                            <Link
                                to={ `/profile/${ post.author._id }` }
                                className="fw-semibold text-dark text-decoration-none"
                            >
                                { post.author.username }
                            </Link>
                        </div>

                        {/* IMAGE */ }
                        <div
                            className="position-relative"
                            onMouseEnter={ () => this.setState( { hoveredPost: post._id } ) }
                            onMouseLeave={ () => this.setState( { hoveredPost: null } ) }
                        >
                            <img
                                src={ post.imageUrl }
                                alt=""
                                className="w-100"
                                style={ { objectFit: "cover", maxHeight: "500px" } }
                            />

                            {/* TAG DOTS */ }
                            { hoveredPost === post._id &&
                                post.tags.map( ( tag, i ) => (
                                    <div
                                        key={ i }
                                        style={ {
                                            position: "absolute",
                                            top: `${ tag.y }%`,
                                            left: `${ tag.x }%`,
                                            cursor: "pointer",
                                        } }
                                        onClick={ () =>
                                            this.handleTagClick( post._id, i, tag.link )
                                        }
                                    >
                                        {/* DOT */ }
                                        <div
                                            style={ {
                                                width: "14px",
                                                height: "14px",
                                                background: "#fff",
                                                borderRadius: "50%",
                                                border: "2px solid #000",
                                                boxShadow: "0 3px 8px rgba(0,0,0,0.25)",
                                            } }
                                        />

                                        {/* LABEL (CLICKABLE) */ }
                                        <div
                                            style={ {
                                                position: "absolute",
                                                top: "50%",
                                                left: "18px",
                                                transform: "translateY(-50%)",
                                                background: "rgba(0, 0, 0, 0.75)",
                                                color: "#fff",
                                                padding: "6px 10px",
                                                borderRadius: "999px",
                                                fontSize: "12px",
                                                fontWeight: 500,
                                                letterSpacing: "0.2px",
                                                whiteSpace: "nowrap",
                                                boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
                                                backdropFilter: "blur(6px)",
                                                WebkitBackdropFilter: "blur(6px)",
                                                transition: "transform 0.15s ease, opacity 0.15s ease",
                                            } }
                                        >
                                            { tag.label }
                                        </div>
                                    </div>
                                ) ) }



                        </div>

                        {/* ACTIONS */ }
                        <div className="card-body pt-2">
                            <button
                                onClick={ () => this.handleLike( post._id ) }
                                className="btn btn-light p-0 mb-2"
                            >
                                <i className="bi bi-heart-fill text-danger fs-5"></i>{ " " }
                                <span className="ms-1">{ post.likes.length }</span>
                            </button>

                            <p className="mb-1">
                                <strong>{ post.author.username }</strong>{ " " }
                                <span className="text-muted">{ post.caption }</span>
                            </p>

                            {/* COMMENTS */ }
                            <div className="small text-muted">
                                { post.comments.map( ( c, i ) => (
                                    <div key={ i }>
                                        <strong className="text-dark">
                                            { c.user.username }
                                        </strong>{ " " }
                                        { c.text }
                                    </div>
                                ) ) }
                            </div>

                            {/* ADD COMMENT */ }
                            <div className="d-flex mt-3">
                                <input
                                    className="form-control form-control-sm rounded-pill"
                                    placeholder="Add a comment..."
                                    value={ this.state.commentText[ post._id ] || "" }
                                    onChange={ ( e ) =>
                                        this.handleCommentChange( post._id, e.target.value )
                                    }
                                />
                                <button
                                    className="btn btn-primary btn-sm rounded-pill ms-2"
                                    onClick={ () => this.handleAddComment( post._id ) }
                                >
                                    Post
                                </button>
                            </div>
                        </div>
                    </div>
                ) ) }

                {/* LOAD MORE */ }
                <button
                    className="btn btn-outline-secondary w-100 rounded-pill mb-5"
                    onClick={ () =>
                        this.setState(
                            ( prev ) => ( { page: prev.page + 1 } ),
                            () => this.componentDidMount()
                        )
                    }
                >
                    Load more
                </button>
            </div>
        );
    }

}

export default Feed;
