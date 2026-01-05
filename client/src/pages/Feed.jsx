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
        if ( this.state.loading ) return <p>Loading feed...</p>;
        if ( this.state.error ) return <p>{ this.state.error }</p>;

        return (
            <div>
                <UserSearch />
                { this.state.posts.map( ( post ) => (
                    <div
                        key={ post._id }
                        style={ {
                            border: "1px solid #e5e5e5",
                            borderRadius: "14px",
                            marginBottom: "24px",
                            overflow: "hidden",
                            background: "#fff",
                        } }
                    >
                        {/* HEADER */ }
                        <div style={ { padding: "10px", fontWeight: 600 } }>
                            <Link
                                to={ `/profile/${ post.author._id }` }
                                style={ { textDecoration: "none", color: "#000" } }
                            >
                                { post.author.username }
                            </Link>
                        </div>

                        {/* IMAGE + TAGS */ }
                        <div
                            style={ { position: "relative" } }
                            onMouseEnter={ () =>
                                this.setState( { hoveredPost: post._id } )
                            }
                            onMouseLeave={ () =>
                                this.setState( { hoveredPost: null } )
                            }
                        >
                            <img
                                src={ post.imageUrl }
                                alt=""
                                style={ { width: "100%", display: "block" } }
                            />

                            { this.state.hoveredPost === post._id &&
                                post.tags.map( ( tag, i ) => (
                                    <div
                                        key={ i }
                                        onClick={ () =>
                                            this.handleTagClick( post._id, i, tag.link )
                                        }
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
                                            boxShadow:
                                                "0 3px 10px rgba(0,0,0,0.25)",
                                            cursor: "pointer",
                                        } }
                                    />
                                ) ) }
                        </div>

                        {/* ACTIONS */ }
                        <div style={ { padding: "10px" } }>
                            <button
                                onClick={ () => this.handleLike( post._id ) }
                                style={ {
                                    background: "none",
                                    border: "none",
                                    fontSize: "18px",
                                    cursor: "pointer",
                                } }
                            >
                                ❤️ { post.likes.length }
                            </button>

                            <p style={ { fontSize: "14px", marginTop: "6px" } }>
                                <b>{ post.author.username }</b> { post.caption }
                            </p>

                            {/* COMMENTS */ }
                            <div style={ { fontSize: "13px" } }>
                                { post.comments.map( ( c, i ) => (
                                    <p key={ i }>
                                        <b>{ c.user.username }</b> { c.text }
                                    </p>
                                ) ) }
                            </div>

                            //COMMENTS
                            <div style={ { display: "flex", marginTop: "6px" } }>
                                <input
                                    type="text"
                                    placeholder="Add a comment..."
                                    value={ this.state.commentText[ post._id ] || "" }
                                    onChange={ ( e ) =>
                                        this.handleCommentChange(
                                            post._id,
                                            e.target.value
                                        )
                                    }
                                    style={ {
                                        flex: 1,
                                        border: "1px solid #e5e5e5",
                                        borderRadius: "8px",
                                        padding: "6px",
                                        fontSize: "13px",
                                    } }
                                />
                                <button
                                    onClick={ () =>
                                        this.handleAddComment( post._id )
                                    }
                                    style={ {
                                        marginLeft: "6px",
                                        border: "none",
                                        background: "#000",
                                        color: "#fff",
                                        padding: "6px 10px",
                                        borderRadius: "8px",
                                        cursor: "pointer",
                                    } }
                                >
                                    Post
                                </button>
                            </div>
                        </div>
                    </div>
                ) ) }

                {/* LOAD MORE */ }
                <button
                    onClick={ () =>
                        this.setState(
                            ( prev ) => ( { page: prev.page + 1 } ),
                            () => this.componentDidMount()
                        )
                    }
                    style={ {
                        width: "100%",
                        padding: "10px",
                        borderRadius: "10px",
                        border: "1px solid #e5e5e5",
                        background: "#fff",
                        cursor: "pointer",
                    } }
                >
                    Load more
                </button>
            </div>
        );
    }
}

export default Feed;
