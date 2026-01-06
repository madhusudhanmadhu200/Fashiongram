// simple helper functions using fetch
export const API_BASE = "https://fashiongram-api.onrender.com/api";

export async function registerUser( { username, email, password } ) {
    const res = await fetch( `${ API_BASE }/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify( { username, email, password } ),
    } );
    return res.json();
}

export async function loginUser( { email, password } ) {
    const res = await fetch( `${ API_BASE }/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify( { email, password } ),
    } );
    return res.json();
}

// helper to create headers for protected requests
export function authFetchOptions( method = "GET", body = null ) {
    const token = localStorage.getItem( "token" );
    const headers = {
        "Content-Type": "application/json",
        ...( token ? { Authorization: `Bearer ${ token }` } : {} ),
    };
    const opts = { method, headers };
    if ( body ) opts.body = JSON.stringify( body );
    return opts;
}
