import React, { Component } from "react";
import { forgotPassword, resetPassword } from "../api/auth";

class ForgotPassword extends Component {
    state = {
        step: "EMAIL",
        email: "",
        otp: "",
        newPassword: "",
        message: "",
        error: "",
        loading: false,
    };

    sendOTP = async ( e ) => {
        e.preventDefault();
        this.setState( { loading: true, error: "", message: "" } );

        try {
            const res = await forgotPassword( this.state.email );
            this.setState( {
                step: "RESET",
                message: res.message,
                loading: false,
            } );
        } catch ( err ) {
            this.setState( {
                error: err.message,
                loading: false,
            } );
        }
    };

    resetPassword = async ( e ) => {
        e.preventDefault();
        this.setState( { loading: true, error: "", message: "" } );

        try {
            const res = await resetPassword( {
                email: this.state.email,
                otp: this.state.otp,
                newPassword: this.state.newPassword,
            } );

            this.setState( {
                message: res.message,
                loading: false,
            } );
        } catch ( err ) {
            this.setState( {
                error: err.message,
                loading: false,
            } );
        }
    };

    render() {
        const { step, email, otp, newPassword, loading, message, error } = this.state;

        const styles = {
            page: {
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: "#fafafa",
                fontFamily:
                    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica",
            },
            card: {
                width: "360px",
                background: "#fff",
                padding: "32px",
                borderRadius: "12px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
            },
            title: {
                textAlign: "center",
                marginBottom: "20px",
                fontSize: "20px",
                fontWeight: "600",
            },
            input: {
                width: "100%",
                padding: "12px 14px",
                marginBottom: "14px",
                borderRadius: "8px",
                border: "1px solid #dbdbdb",
                fontSize: "14px",
                outline: "none",
            },
            button: {
                width: "100%",
                padding: "12px",
                background: "#0095f6",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontWeight: "600",
                cursor: "pointer",
            },
            disabledButton: {
                opacity: 0.6,
                cursor: "not-allowed",
            },
            success: {
                color: "#2ecc71",
                textAlign: "center",
                marginBottom: "12px",
                fontSize: "14px",
            },
            error: {
                color: "#e74c3c",
                textAlign: "center",
                marginBottom: "12px",
                fontSize: "14px",
            },
        };

        return (
            <div style={ styles.page }>
                <div style={ styles.card }>
                    <div style={ styles.title }>Reset your password</div>

                    { message && <div style={ styles.success }>{ message }</div> }
                    { error && <div style={ styles.error }>{ error }</div> }

                    { step === "EMAIL" && (
                        <form onSubmit={ this.sendOTP }>
                            <input
                                style={ styles.input }
                                type="email"
                                placeholder="Registered email"
                                value={ email }
                                required
                                onChange={ ( e ) => this.setState( { email: e.target.value } ) }
                            />

                            <button
                                style={ {
                                    ...styles.button,
                                    ...( loading ? styles.disabledButton : {} ),
                                } }
                                disabled={ loading }
                            >
                                { loading ? "Sending OTP..." : "Send OTP" }
                            </button>
                        </form>
                    ) }

                    { step === "RESET" && (
                        <form onSubmit={ this.resetPassword }>
                            <input
                                style={ styles.input }
                                type="text"
                                placeholder="Enter OTP"
                                value={ otp }
                                required
                                onChange={ ( e ) => this.setState( { otp: e.target.value } ) }
                            />

                            <input
                                style={ styles.input }
                                type="password"
                                placeholder="New password"
                                value={ newPassword }
                                required
                                onChange={ ( e ) =>
                                    this.setState( { newPassword: e.target.value } )
                                }
                            />

                            <button
                                style={ {
                                    ...styles.button,
                                    ...( loading ? styles.disabledButton : {} ),
                                } }
                                disabled={ loading }
                            >
                                { loading ? "Resetting..." : "Reset Password" }
                            </button>
                        </form>
                    ) }
                </div>
            </div>
        );
    }
}

export default ForgotPassword;
