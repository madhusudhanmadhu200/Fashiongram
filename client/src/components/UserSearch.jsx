import React, { Component } from "react";
import { API_BASE } from "../api/auth";
import { Link } from "react-router-dom";

class UserSearch extends Component {
    state = {
        query: "",
        results: [],
        loading: false,
    };

    handleChange = async ( e ) => {
        const query = e.target.value;
        this.setState( { query } );

        if ( !query.trim() ) {
            return this.setState( { results: [] } );
        }

        try {
            const token = localStorage.getItem( "token" );
            this.setState( { loading: true } );

            const res = await fetch(
                `${ API_BASE }/users/search/${ query }`,
                {
                    headers: {
                        Authorization: `Bearer ${ token }`,
                    },
                }
            );

            const data = await res.json();
            this.setState( { results: data, loading: false } );
        } catch ( err ) {
            this.setState( { loading: false } );
        }
    };

    render() {
        return (
            <div style={ { marginBottom: "20px" } }>
                <input
                    type="text"
                    placeholder="Search users..."
                    value={ this.state.query }
                    onChange={ this.handleChange }
                    style={ {
                        width: "100%",
                        padding: "10px",
                        borderRadius: "10px",
                        border: "1px solid #e5e5e5",
                        fontSize: "14px",
                    } }
                />

                { this.state.results.length > 0 && (
                    <div
                        style={ {
                            border: "1px solid #e5e5e5",
                            borderRadius: "10px",
                            marginTop: "6px",
                            background: "#fff",
                        } }
                    >
                        { this.state.results.map( ( user ) => (
                            <Link
                                key={ user._id }
                                to={ `/profile/${ user._id }` }
                                style={ {
                                    display: "block",
                                    padding: "10px",
                                    textDecoration: "none",
                                    color: "#000",
                                    borderBottom: "1px solid #eee",
                                } }
                            >
                                👤 { user.username }
                            </Link>
                        ) ) }
                    </div>
                ) }
            </div>
        );
    }
}

export default UserSearch;
