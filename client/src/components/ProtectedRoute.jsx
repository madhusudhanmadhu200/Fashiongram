import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function ProtectedRoute() {
    const { user, loading } = useContext( AuthContext );

    if ( loading ) {
        return <p>Loading...</p>; // or spinner
    }

    if ( !user ) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}

export default ProtectedRoute;
