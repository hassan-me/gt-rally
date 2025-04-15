import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectToken } from "../../redux/slices/user.slice"

// Protected route component
const ProtectedRoute = (props) => {
  // Get token from Redux store
  const token = useSelector(selectToken);

  // Check if user is authenticated
  if (!token || token === "") {
    // Redirect to homepage if not authenticated
    return Navigate({ to: "/", replace: true });
  }

  // Return children components if authenticated
  return props.children;
};

export default ProtectedRoute;