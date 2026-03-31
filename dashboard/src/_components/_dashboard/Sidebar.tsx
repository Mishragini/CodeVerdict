import { Button } from "@/components/ui/button";
import { fetchRepositories, logout } from "@/lib/apiCall";
import type { User } from "@/lib/types";
import { useAppDispatch } from "@/redux/hook";
import { setUser } from "@/redux/slice/userSlice";
import { useMutation, useQuery } from "@tanstack/react-query";

interface SideBarProps {
  user: User;
}
interface Repository {
  id: number;
  name: string;
  url: string;
  api_url: string;
}

export function SideBar({ user }: SideBarProps) {
  const dispatch = useAppDispatch();
  const {
    data: repositories,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["repositories"],
    queryFn: async () => {
      const { repositories } = await fetchRepositories(1, 1);
      return repositories as Repository[];
    },
  });
  const { mutate: handleLogout, isPending } = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      dispatch(setUser(null));
    },
    onError: (err) => {
      console.error("Logout failed:", err);
    },
  });
  return (
    <div>
      <div>{JSON.stringify(user)}</div>
      <Button
        disabled={isPending}
        onClick={() => {
          handleLogout();
        }}
      >
        Logout
      </Button>
      {isLoading && <p>Loading repositories...</p>}
      {isError && <p>Failed to load repositories.</p>}

      {repositories?.map((repo) => (
        <div key={repo.id}>
          <p>{repo.name}</p>
        </div>
      ))}
    </div>
  );
}
