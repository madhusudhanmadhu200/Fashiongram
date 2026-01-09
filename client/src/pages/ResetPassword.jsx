import React, { Component } from "react";
import { resetPassword } from "../api/auth";
import { Navigate } from "react-router-dom";

class ResetPassword extends Component {
    state = { email: "", otp: "", newPassword: "", success: false, error: null };

    handleSubmit = async ( e ) => {
        e.preventDefault();
        const res = await resetPassword( this.state );
        if ( res.message ) this.setState( { success: true } );
        else this.setState( { error: res.message } );
    };

    render() {
        if ( this.state.success ) return <Navigate to="/login" />;

        return (
            <div>
                <h2>Reset Password</h2>
                <form onSubmit={ this.handleSubmit }>
                    <input placeholder="Email" onChange={ ( e ) => this.setState( { email: e.target.value } ) } />
                    <input placeholder="OTP" onChange={ ( e ) => this.setState( { otp: e.target.value } ) } />
                    <input type="password" placeholder="New Password" onChange={ ( e ) => this.setState( { newPassword: e.target.value } ) } />
                    <button>Reset</button>
                </form>
                { this.state.error && <p>{ this.state.error }</p> }
            </div>
        );
    }
}

export default ResetPassword;
