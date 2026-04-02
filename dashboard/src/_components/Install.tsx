import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useSearchParams } from "react-router";
import { toast } from "sonner";

export function Install() {
  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    const error = searchParams.get("error");
    let timeout_id = null;
    if (error === "not_installed") {
      //for the toast to appear in initial render you need to wrap it in setTimeout
      timeout_id = setTimeout(() => {
        toast.error("You need to install the GitHub App before signing in.");
        setSearchParams({}, { replace: true });
      }, 500);
    }
    return () => {
      timeout_id && clearTimeout(timeout_id);
    };
  }, []);
  return (
    <div>
      <h1>You dont have the app installed</h1>
      <p>Kindly install the Codeverdict github app to proceed.</p>
      <Button asChild>
        <a href="https://github.com/apps/CodeVerdikt/installations/new">
          Install CodeVerdikt on GitHub
        </a>
      </Button>
    </div>
  );
}
