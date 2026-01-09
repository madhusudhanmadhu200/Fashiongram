import React, { Component } from "react";
import { loginUser } from "../api/auth";
import { AuthContext } from "../context/AuthContext";
import { Navigate, Link } from "react-router-dom";

class Login extends Component {
    static contextType = AuthContext;

    state = {
        email: "",
        password: "",
        loading: false,
        error: null,
        redirect: false,
    };

    handleChange = ( e ) => {
        this.setState( { [ e.target.name ]: e.target.value, error: null } );
    };

    handleSubmit = async ( e ) => {
        e.preventDefault();
        const { email, password } = this.state;

        if ( !email || !password ) {
            return this.setState( { error: "Please fill all fields" } );
        }

        this.setState( { loading: true } );

        try {
            const data = await loginUser( { email, password } );

            if ( data.token ) {
                this.context.login( data );
                this.setState( { redirect: true } );
            } else {
                this.setState( {
                    error: data.message || "Invalid credentials",
                } );
            }
        } catch ( err ) {
            this.setState( { error: "Network or server error" } );
        } finally {
            this.setState( { loading: false } );
        }
    };

    render() {
        if ( this.state.redirect ) return <Navigate to="/feed" replace />;

        return (
            <div
                style={ {
                    maxWidth: "420px",
                    margin: "40px auto",
                    padding: "24px",
                    border: "1px solid #e5e5e5",
                    borderRadius: "14px",
                    background: "#fff",
                } }
            >
                {/* HEADER */ }
                <h2 style={ { textAlign: "center", marginBottom: "6px" } }>
                    Welcome back
                </h2>
                <p
                    style={ {
                        textAlign: "center",
                        fontSize: "14px",
                        color: "#777",
                        marginBottom: "20px",
                    } }
                >
                    Sign in to Fashiongram
                </p>

                {/* FORM */ }
                <form onSubmit={ this.handleSubmit }>
                    <input
                        name="email"
                        type="email"
                        placeholder="Email"
                        value={ this.state.email }
                        onChange={ this.handleChange }
                        style={ {
                            width: "100%",
                            padding: "10px",
                            marginBottom: "10px",
                            borderRadius: "8px",
                            border: "1px solid #e5e5e5",
                            fontSize: "14px",
                        } }
                    />

                    <input
                        name="password"
                        type="password"
                        placeholder="Password"
                        value={ this.state.password }
                        onChange={ this.handleChange }
                        style={ {
                            width: "100%",
                            padding: "10px",
                            marginBottom: "12px",
                            borderRadius: "8px",
                            border: "1px solid #e5e5e5",
                            fontSize: "14px",
                        } }
                    />
                    <Link to="/forgot-password">Forgot password?</Link>


                    {/* ERROR */ }
                    { this.state.error && (
                        <p
                            style={ {
                                color: "#e63946",
                                fontSize: "13px",
                                marginBottom: "10px",
                            } }
                        >
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
                        { this.state.loading ? "Signing in..." : "Sign In" }
                    </button>
                </form>

                {/* FOOTER */ }
                <p
                    style={ {
                        textAlign: "center",
                        fontSize: "13px",
                        marginTop: "14px",
                        color: "#666",
                    } }
                >
                    Don’t have an account?{ " " }
                    <Link
                        to="/register"
                        style={ { color: "#000", fontWeight: "600" } }
                    >
                        Sign up
                    </Link>
                </p>
            </div>
        );
    }
}

export default Login;
