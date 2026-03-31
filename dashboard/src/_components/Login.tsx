import { Button } from "@/components/ui/button";
import { useCallback } from "react";

export function Login() {
  const handleGithubLogin = useCallback(async () => {
    window.location.href = `${import.meta.env.VITE_BACKEND_URL}/api/v1/auth/login`;
  }, []);
  return (
    <>
      <Button onClick={handleGithubLogin}>Login with Github</Button>
    </>
  );
}
