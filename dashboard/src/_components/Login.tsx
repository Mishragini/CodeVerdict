import { Button } from "@/components/ui/button";
import { useCallback } from "react";
import { toast } from "sonner";

function GithubMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="currentColor"
    >
      <path d="M12 0.5C5.73 0.5 0.75 5.56 0.75 11.91C0.75 16.97 4 21.27 8.58 22.69C9.15 22.79 9.35 22.44 9.35 22.14C9.35 21.86 9.34 21.13 9.34 20.1C6.62 20.7 6.03 18.86 6.03 18.86C5.59 17.74 4.98 17.44 4.98 17.44C4.12 16.86 4.78 16.87 4.78 16.87C5.72 16.95 6.19 17.9 6.19 17.9C7.02 19.36 8.44 18.93 9 18.67C9.08 18.05 9.32 17.63 9.6 17.38C7.38 17.12 5 16.2 5 11.77C5 10.51 5.45 9.47 6.15 8.67C6.03 8.41 5.64 7.14 6.26 5.5C6.26 5.5 7.18 5.21 9.33 6.64C10.3 6.36 11.34 6.22 12.38 6.22C13.42 6.22 14.46 6.36 15.43 6.64C17.58 5.21 18.5 5.5 18.5 5.5C19.12 7.14 18.73 8.41 18.61 8.67C19.31 9.47 19.76 10.51 19.76 11.77C19.76 16.21 17.37 17.12 15.14 17.37C15.49 17.67 15.79 18.27 15.79 19.22C15.79 20.58 15.78 21.72 15.78 22.14C15.78 22.44 15.98 22.79 16.55 22.69C21.12 21.27 24.37 16.97 24.37 11.91C24.37 5.56 19.39 0.5 13.12 0.5Z" />
    </svg>
  );
}

export function Login() {
  const handleGithubLogin = useCallback(() => {
    window.location.href = `${import.meta.env.VITE_BACKEND_URL}/api/v1/auth/login`;
  }, []);
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-border bg-foreground text-background shadow-sm text-center">
        <div className="p-8 space-y-6">
          <div className="space-y-16">
            <div className="flex w-full flex-col gap-4 items-center justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                <GithubMark className="h-8 w-8 text-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">CodeVerdict</h1>
                <p className="text-sm text-muted-foreground">
                  PR review dashboard powered by your GitHub App
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-base font-medium">
                Connect your account to view reviews
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Once you sign in, you&apos;ll be able to see review summaries
                for repositories where you&apos;ve granted the app access.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              className="w-full border-muted-background hover:cursor-pointer"
              onClick={() => {
                toast.promise(
                  () =>
                    new Promise<void>((resolve) => {
                      handleGithubLogin();
                      resolve();
                    }),
                  {
                    loading: "Logging in...",
                    success: "Logged in Successfully!",
                    error: "Error while logging in.",
                  },
                );
              }}
            >
              <GithubMark className="mr-2 h-5 w-5" />
              Continue with GitHub
            </Button>

            <p className="text-xs text-muted-foreground leading-relaxed">
              You can manage access from GitHub in your app settings.
            </p>

            <a
              href="/install"
              className="block text-xs text-muted-foreground underline underline-offset-4 hover:text-background"
            >
              I haven&apos;t installed the GitHub App yet
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
