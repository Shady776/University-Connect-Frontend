import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// Token decoder function
const decodeToken = (token: string) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
};

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles: ("student" | "teacher" | "admin")[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
    const location = useLocation();
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);

    useEffect(() => {
        const checkAuthorization = () => {
            const token = localStorage.getItem("access_token");

            // Check if user is logged in
            if (!token) {
                toast.error("Please login to access this page");
                setIsAuthorized(false);
                return;
            }

            // Decode token to get user role
            const decoded = decodeToken(token);
            
            if (!decoded) {
                toast.error("Invalid session. Please log in again");
                localStorage.removeItem('access_token');
                localStorage.removeItem('token_type');
                localStorage.removeItem('userRole');
                setIsAuthorized(false);
                return;
            }

            // Extract role from token (checking multiple possible locations)
            const role = decoded?.role || 
                        decoded?.user_role || 
                        decoded?.type || 
                        decoded?.sub?.role || 
                        decoded?.user?.role;

            console.log('ProtectedRoute - User role:', role);
            console.log('ProtectedRoute - Allowed roles:', allowedRoles);

            // Store role in state and localStorage for consistency
            setUserRole(role);
            if (role) {
                localStorage.setItem('userRole', role);
            }

            // Check if user has the required role
            if (!role || !allowedRoles.includes(role as "student" | "teacher" | "admin")) {
                toast.error("You don't have permission to access this page");
                setIsAuthorized(false);
                return;
            }

            // User is authenticated and has the correct role
            setIsAuthorized(true);
        };

        checkAuthorization();
    }, [location.pathname, allowedRoles]);

    // Loading state
    if (isAuthorized === null) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Not authorized - redirect appropriately
    if (!isAuthorized) {
        // If they have a role but wrong permissions, redirect to their dashboard
        if (userRole) {
            if (userRole === 'admin') {
                return <Navigate to="/admin" replace />;
            } else if (userRole === 'teacher') {
                return <Navigate to="/teacher" replace />;
            } else if (userRole === 'student') {
                return <Navigate to="/student" replace />;
            }
        }
        
        // No token or invalid session - redirect to login
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;