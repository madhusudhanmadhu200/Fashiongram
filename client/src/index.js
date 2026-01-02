import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import AppShell from "./pages/AppShell";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Feed from "./pages/Feed";
import CreatePost from "./pages/CreatePost";
import ProtectedRoute from "./components/ProtectedRoute";

import ProfileWrapper from "./pages/ProfileWrapper";




function Root() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={ <AppShell /> }>

            {/* Default */ }
            <Route index element={ <Navigate to="/feed" replace /> } />

            {/* 🔐 PROTECTED ROUTES */ }
            <Route element={ <ProtectedRoute /> }>
              <Route path="feed" element={ <Feed /> } />
              <Route path="create" element={ <CreatePost /> } />
              <Route path="profile/:id" element={ <ProfileWrapper /> } />


            </Route>

            {/* 🔓 PUBLIC ROUTES */ }
            <Route path="login" element={ <Login /> } />
            <Route path="register" element={ <Register /> } />

          </Route>
        </Routes>

        
      </BrowserRouter>
    </AuthProvider>
  );
}

ReactDOM.createRoot( document.getElementById( "root" ) ).render( <Root /> );
