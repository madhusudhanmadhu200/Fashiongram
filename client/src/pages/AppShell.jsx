import { Link, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Component } from "react";
import {
    Home,
    PlusCircle,
    UserCircle2,
    LogOut,
    LogIn,
    UserPlus,
} from "lucide-react";


class AppShell extends Component {
  static contextType = AuthContext;

  render() {
    const { user, logout } = this.context;

    return (
      <div
        style={{
          maxWidth: "480px",
          margin: "0 auto",
          minHeight: "100vh",
          background: "#fff",
        }}
      >
        {/* NAVBAR */}
            <nav
                style={ {
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 16px",
                    borderBottom: "1px solid #f0f0f0",
                    position: "sticky",
                    top: 0,
                    background: "rgba(255,255,255,0.9)",
                    backdropFilter: "blur(10px)",
                    zIndex: 100,
                } }
            >
                {/* LOGO */ }
                <Link
                    to="/feed"
                    style={ {
                        fontWeight: 600,
                        fontSize: "15px",
                        textDecoration: "none",
                        color: "#111",
                        letterSpacing: "-0.3px",
                    } }
                >
                    Fashiongram
                </Link>

                {/* ICON ACTIONS */ }
                <div style={ { display: "flex", gap: "20px", alignItems: "center" } }>
                    { user ? (
                        <>
                            <Link to="/feed">
                                <Home size={ 22 } strokeWidth={ 1.6 } />
                            </Link>

                            <Link to="/create">
                                <PlusCircle size={ 22 } strokeWidth={ 1.6 } />
                            </Link>

                            <Link to={ `/profile/${ user._id }` }>
                                <UserCircle2 size={ 24 } strokeWidth={ 1.6 } />
                            </Link>

                            <button
                                onClick={ logout }
                                style={ {
                                    background: "none",
                                    border: "none",
                                    padding: 0,
                                    cursor: "pointer",
                                } }
                            >
                                <LogOut size={ 20 } strokeWidth={ 1.6 } />
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login">
                                <LogIn size={ 22 } strokeWidth={ 1.6 } />
                            </Link>

                            <Link to="/register">
                                <UserPlus size={ 22 } strokeWidth={ 1.6 } />
                            </Link>
                        </>
                    ) }
                </div>
            </nav>


        {/* PAGE CONTENT */}
        <div style={{ padding: "12px" }}>
          <Outlet />
        </div>
      </div>
    );
  }
}

export default AppShell;