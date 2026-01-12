import React, { Component, createContext } from "react";

export const AuthContext = createContext();

export class AuthProvider extends Component {
    state = {
        user: null,
        loading: true, // 🔥 IMPORTANT
    };

    componentDidMount() {
        const storedUser = localStorage.getItem( "user" );

        if ( storedUser && storedUser !== "undefined" ) {
            try {
                this.setState( {
                    user: JSON.parse( storedUser ),
                    loading: false,
                } );
            } catch {
                localStorage.removeItem( "user" );
                this.setState( { loading: false } );
            }
        } else {
            this.setState( { loading: false } );
        }
    }

    login = ( data ) => {
        const user = {
            _id: data._id,
            username: data.username,
            email: data.email,
            role: data.role,
        };

        localStorage.setItem( "token", data.token );
        localStorage.setItem( "user", JSON.stringify( user ) );

        this.setState( { user } );
    };


    logout = () => {
        localStorage.removeItem( "token" );
        localStorage.removeItem( "user" );
        this.setState( { user: null } );
    };

    render() {
        return (
            <AuthContext.Provider
                value={ {
                    user: this.state.user,
                    loading: this.state.loading,
                    login: this.login,
                    logout: this.logout,
                } }
            >
                { this.props.children }
            </AuthContext.Provider>
        );
    }
}
