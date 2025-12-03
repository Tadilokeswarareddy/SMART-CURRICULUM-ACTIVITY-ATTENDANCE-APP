
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../api";
import { REFRESH_TOKEN, ACCESS_TOKEN } from "../constants";


function ProtectedRoute({ children, allowedRoles = [] }) {
  const [authState, setAuthState] = useState({ status: "loading" });


  useEffect(() => {
    let mounted = true;

    const refreshToken = async () => {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN);
      if (!refreshToken) {
        if (mounted) setAuthState({ status: "unauthenticated" });
        return false;
      }
      try {
        const res = await api.post("/api/token/refresh/", { refresh: refreshToken });
        if (res.status === 200 && res.data.access) {
          localStorage.setItem(ACCESS_TOKEN, res.data.access);
          return true;
        }
      } catch (err) {
        console.log("refresh error", err);
      }
      if (mounted) setAuthState({ status: "unauthenticated" });
      return false;
    };

    const checkAuthAndRole = async () => {
      const token = localStorage.getItem(ACCESS_TOKEN);
      if (!token) {

        const refreshed = await refreshToken();
        if (!refreshed) return;
      }

      const access = localStorage.getItem(ACCESS_TOKEN);
      if (!access) {
        setAuthState({ status: "unauthenticated" });
        return;
      }

      let decoded;
      try {
        decoded = jwtDecode(access);
      } catch (err) {
        console.log("invalid token decode", err);

        const refreshed = await refreshToken();
        if (!refreshed) {
          setAuthState({ status: "unauthenticated" });
          return;
        }
        try {
          decoded = jwtDecode(localStorage.getItem(ACCESS_TOKEN));
        } catch (err2) {
          setAuthState({ status: "unauthenticated" });
          return;
        }
      }


      const now = Date.now() / 1000;
      if (decoded.exp && decoded.exp < now) {
        const refreshed = await refreshToken();
        if (!refreshed) {
          setAuthState({ status: "unauthenticated" });
          return;
        }
        decoded = jwtDecode(localStorage.getItem(ACCESS_TOKEN));
      }


      const userRole = decoded.role || decoded.RolE || decoded.roles || null;


      if (allowedRoles.length === 0) {

        setAuthState({ status: "authorized", role: userRole });
        return;
      }

      if (!userRole) {

        setAuthState({ status: "forbidden" });
        return;
      }


      if (allowedRoles.includes(userRole)) {
        setAuthState({ status: "authorized", role: userRole });
      } else {
        setAuthState({ status: "forbidden", role: userRole });
      }
    };

    checkAuthAndRole();

    return () => {
      mounted = false;
    };
  }, [allowedRoles]);

  if (authState.status === "loading") return <div>Loading...</div>;

  if (authState.status === "unauthenticated") {
    return <Navigate to="/login" replace />;
  }

  if (authState.status === "forbidden") {

    return <Navigate to="/" replace />;
  }


  return children;
}

export default ProtectedRoute;
