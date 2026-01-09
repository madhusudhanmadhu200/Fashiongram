import React, { Component } from "react";
import { API_BASE } from "../api/auth";
import { AuthContext } from "../context/AuthContext";

class Profile extends Component {
    static contextType = AuthContext;

    state = {
        user: null,
        posts: [],
        loading: true,
    };

    fetchProfile = async () => {
        try {
            const token = localStorage.getItem( "token" );
            const userId = this.props.userId;

            const res = await fetch( `${ API_BASE }/users/${ userId }`, {
                headers: { Authorization: `Bearer ${ token }` },
            } );

            const data = await res.json();
            if ( !res.ok ) throw new Error( data.message );

            this.setState( {
                user: data.user,
                posts: data.posts,
                loading: false,
            } );
        } catch ( err ) {
            console.error( "PROFILE ERROR:", err );
            this.setState( { loading: false } );
        }
    };

    componentDidMount() {
        this.fetchProfile();
    }

    handleFollow = async () => {
        const token = localStorage.getItem( "token" );
        const currentUser = this.context.user;

        const res = await fetch(
            `${ API_BASE }/users/${ this.state.user._id }/follow`,
            {
                method: "PUT",
                headers: { Authorization: `Bearer ${ token }` },
            }
        );

        const data = await res.json();

        this.setState( ( prev ) => ( {
            user: {
                ...prev.user,
                followers: data.following
                    ? [ ...prev.user.followers, currentUser._id ]
                    : prev.user.followers.filter(
                        ( id ) => id !== currentUser._id
                    ),
            },
        } ) );
    };

    editTag = async ( postId, tagIndex, current ) => {
        const label = prompt( "Edit item name", current.label );
        const link = prompt( "Edit product link", current.link );
        if ( !label || !link ) return;

        const token = localStorage.getItem( "token" );

        await fetch( `${ API_BASE }/posts/${ postId }/tag/${ tagIndex }`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${ token }`,
            },
            body: JSON.stringify( { label, link } ),
        } );

        this.fetchProfile();
    };

    deleteTag = async ( postId, tagIndex ) => {
        if ( !window.confirm( "Delete this tag?" ) ) return;

        const token = localStorage.getItem( "token" );

        await fetch( `${ API_BASE }/posts/${ postId }/tag/${ tagIndex }`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${ token }` },
        } );

        this.fetchProfile();
    };

    deletePost = async ( postId ) => {
        if ( !window.confirm( "Delete this post permanently?" ) ) return;

        const token = localStorage.getItem( "token" );

        await fetch( `${ API_BASE }/posts/${ postId }`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${ token }` },
        } );

        this.fetchProfile();
    };

    render() {
        const { user, posts, loading } = this.state;
        const currentUser = this.context.user;

        if ( loading || !user )
            return <p className="text-center mt-5">Loading profile...</p>;

        const isOwnProfile =
            currentUser && currentUser._id === user._id;

        const isFollowing =
            currentUser && user.followers.includes( currentUser._id );

        return (
            <div className="container mt-4" style={ { maxWidth: "720px" } }>
                {/* PROFILE HEADER */ }
                <div className="d-flex align-items-center mb-4">
                    <div>
                        <h3 className="mb-1">{ user.username }</h3>
                        <div className="text-muted small">
                            <b>{ user.followers.length }</b> followers •{ " " }
                            <b>{ user.following.length }</b> following
                        </div>
                    </div>

                    { !isOwnProfile && (
                        <button
                            onClick={ this.handleFollow }
                            className={ `btn ms-auto ${ isFollowing
                                    ? "btn-outline-secondary"
                                    : "btn-primary"
                                }` }
                        >
                            { isFollowing ? "Unfollow" : "Follow" }
                        </button>
                    ) }
                </div>

                <hr />

                {/* POSTS */ }
                { posts.length === 0 && (
                    <p className="text-muted text-center">
                        No posts yet
                    </p>
                ) }

                { posts.map( ( post ) => (
                    <div
                        key={ post._id }
                        className="card mb-4 border-0 shadow-sm rounded-4"
                    >
                        { isOwnProfile && (
                            <div className="card-header bg-white border-0 text-end">
                                <button
                                    onClick={ () => this.deletePost( post._id ) }
                                    className="btn btn-sm btn-danger"
                                >
                                    Delete Post
                                </button>
                            </div>
                        ) }

                        <img
                            src={ post.imageUrl }
                            alt=""
                            className="w-100"
                            style={ {
                                maxHeight: "460px",
                                objectFit: "cover",
                            } }
                        />

                        {/* ANALYTICS (OWNER ONLY) */ }
                        { isOwnProfile && (
                            <div className="card-body small">
                                { !post.tags || post.tags.length === 0 ? (
                                    <p className="text-muted">
                                        No tags added yet
                                    </p>
                                ) : (
                                    <>
                                        <p>
                                            <b>Total clicks:</b>{ " " }
                                            { post.tags.reduce(
                                                ( sum, t ) => sum + ( t.clicks || 0 ),
                                                0
                                            ) }
                                        </p>

                                        <p>
                                            <b>Top item:</b>{ " " }
                                            {
                                                post.tags.reduce( ( top, tag ) =>
                                                    ( tag.clicks || 0 ) >
                                                        ( top.clicks || 0 )
                                                        ? tag
                                                        : top
                                                ).label
                                            }
                                        </p>

                                        <hr />

                                        { post.tags.map( ( tag, i ) => (
                                            <div
                                                key={ i }
                                                className="d-flex justify-content-between align-items-center mb-2"
                                            >
                                                <span>
                                                    <b>{ tag.label }</b>{ " " }
                                                    <span className="text-muted">
                                                        ({ tag.clicks || 0 } clicks)
                                                    </span>
                                                </span>

                                                <div>
                                                    <button
                                                        onClick={ () =>
                                                            this.editTag( post._id, i, tag )
                                                        }
                                                        className="btn btn-sm btn-outline-primary me-2"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={ () =>
                                                            this.deleteTag( post._id, i )
                                                        }
                                                        className="btn btn-sm btn-outline-danger"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        ) ) }
                                    </>
                                ) }
                            </div>
                        ) }
                    </div>
                ) ) }
            </div>
        );
    }
}

export default Profile;
