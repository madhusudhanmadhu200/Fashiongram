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
                    ? [ ...prev.user.followers, "x" ]
                    : prev.user.followers.slice( 0, -1 ),
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

        if ( loading || !user ) return <p>Loading profile...</p>;

        const isOwnProfile =
            currentUser && currentUser._id === user._id;

        return (
            <div>
                {/* PROFILE HEADER */ }
                <div style={ { textAlign: "center", marginBottom: "20px" } }>
                    <h2 style={ { marginBottom: "4px" } }>{ user.username }</h2>
                    <p style={ { fontSize: "14px", color: "#777" } }>
                        { user.followers.length } followers •{ " " }
                        { user.following.length } following
                    </p>

                    { !isOwnProfile && (
                        <button
                            onClick={ this.handleFollow }
                            style={ {
                                background: "#000",
                                color: "#fff",
                                border: "none",
                                padding: "8px 14px",
                                borderRadius: "8px",
                                cursor: "pointer",
                            } }
                        >
                            Follow / Unfollow
                        </button>
                    ) }
                </div>

                {/* POSTS GRID */ }
                { posts.map( ( post ) => (
                    <div
                        key={ post._id }
                        style={ {
                            border: "1px solid #e5e5e5",
                            borderRadius: "14px",
                            padding: "10px",
                            marginBottom: "24px",
                            background: "#fff",
                        } }
                    >
                        { isOwnProfile && (
                            <button
                                onClick={ () => this.deletePost( post._id ) }
                                style={ {
                                    background: "#e63946",
                                    color: "#fff",
                                    border: "none",
                                    padding: "6px 10px",
                                    borderRadius: "8px",
                                    fontSize: "12px",
                                    cursor: "pointer",
                                    marginBottom: "8px",
                                } }
                            >
                                Delete Post
                            </button>
                        ) }

                        <img
                            src={ post.imageUrl }
                            alt=""
                            style={ {
                                width: "100%",
                                borderRadius: "12px",
                                marginBottom: "8px",
                            } }
                        />

                        {/* CREATOR ANALYTICS */ }
                        { isOwnProfile && (
                            <div style={ { fontSize: "13px" } }>
                                { ( !post.tags || post.tags.length === 0 ) && (
                                    <p style={ { color: "#777" } }>
                                        No tags added yet
                                    </p>
                                ) }

                                { post.tags && post.tags.length > 0 && (
                                    <>
                                        <p>
                                            <b>Total clicks:</b>{ " " }
                                            { post.tags.reduce(
                                                ( sum, tag ) => sum + ( tag.clicks || 0 ),
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
                                                style={ {
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    alignItems: "center",
                                                    marginBottom: "6px",
                                                } }
                                            >
                                                <span>
                                                    <b>{ tag.label }</b> — { tag.clicks || 0 } clicks
                                                </span>

                                                <div>
                                                    <button
                                                        onClick={ () =>
                                                            this.editTag( post._id, i, tag )
                                                        }
                                                        style={ {
                                                            marginRight: "6px",
                                                            fontSize: "12px",
                                                        } }
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={ () =>
                                                            this.deleteTag( post._id, i )
                                                        }
                                                        style={ {
                                                            fontSize: "12px",
                                                        } }
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
