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
  }, [searchParams, setSearchParams]);
  return (
    <div className="min-h-screen w-full px-6 py-10 flex flex-col items-center justify-center bg-background">
      <h1 className="text-2xl font-semibold tracking-tight">
        Install GitHub App
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        CodeVerdikt is not installed on your GitHub account yet. Install it to
        continue.
      </p>
      <Button asChild className="mt-6 w-full sm:w-md py-6">
        <a
          href="https://github.com/apps/CodeVerdikt/installations/new"
          target="_blank"
          rel="noreferrer"
        >
          Install CodeVerdikt on GitHub
        </a>
      </Button>
    </div>
  );
}
