import { Navigate } from "react-router-dom";

import type { ReactNode } from "react";

import { useAuth } from "../context/useAuth";

interface Props {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: Props) => {
  const { token } = useAuth();

  if (!token) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;
