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
        localStorage.setItem( "token", data.token );
        localStorage.setItem( "user", JSON.stringify( data.user ) );
        this.setState( { user: data.user } );
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
