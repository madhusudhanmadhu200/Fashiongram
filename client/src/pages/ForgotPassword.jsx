import React, { Component } from "react";
import { forgotPassword } from "../api/auth";
import { Link } from "react-router-dom";

class ForgotPassword extends Component {
    state = { email: "", message: null, error: null };

    handleSubmit = async ( e ) => {
        e.preventDefault();
        try {
            const res = await forgotPassword( this.state.email );
            if ( res.message ) this.setState( { message: res.message } );
        } catch {
            this.setState( { error: "Failed to send OTP" } );
        }
    };

    render() {
        return (
            <div>
                <h2>Forgot Password</h2>
                <form onSubmit={ this.handleSubmit }>
                    <input
                        type="email"
                        placeholder="Registered Email"
                        onChange={ ( e ) => this.setState( { email: e.target.value } ) }
                    />
                    <button type="submit">Send OTP</button>
                </form>
                { this.state.message && <p>{ this.state.message }</p> }
                <Link to="/reset-password">Already have OTP?</Link>
            </div>
        );
    }
}

export default ForgotPassword;
