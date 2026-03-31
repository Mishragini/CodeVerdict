import { Button } from "@/components/ui/button";

export function Install() {
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
