import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth.ts";
import { Spinner } from "@/components/ui/spinner.tsx";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { isLoading, isAuthenticated, error } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/", { replace: true });
    }
    else if (!isLoading && error) {
      console.error("Authentication error:", error);
      navigate("/", { replace: true });
    }
    else if (!isLoading && !isAuthenticated && !error) {
      console.warn(
        "Authentication completed without success or explicit error",
      );
      navigate("/", { replace: true });
    }
  }, [isLoading, isAuthenticated, error, navigate]);

  return (
    <div className="flex items-center justify-center ">
      <Spinner className="size-8" />
    </div>
  );
}
