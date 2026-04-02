import { Button } from "@/components/ui/button";
import { fetchRepositories, logout } from "@/lib/apiCall";
import type { User } from "@/lib/types";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { setRepo } from "@/redux/slice/repositorySlice";
import { setUser } from "@/redux/slice/userSlice";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { SidebarSkeleton } from "./SidebarSkeleton";
import { Spinner } from "@/components/ui/spinner";

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
  const { id, name } = useAppSelector((state) => state.repository);
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["repositories"],
    queryFn: ({ pageParam }) => fetchRepositories(pageParam, 35),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages, lastPageParam, allPageParams) => {
      const totalPages = Math.ceil(lastPage.total / 35);
      if (lastPageParam < totalPages) {
        return lastPageParam + 1; // return next page number
      }
      return undefined;
    },
    getPreviousPageParam: (firstPage) => firstPage.prevCursor,
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
  const container_ref = useRef(null);
  const sentinel_ref = useRef(null);

  useEffect(() => {
    const element = sentinel_ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { root: container_ref.current, rootMargin: "200px" },
    );

    observer.observe(element); // attach it

    return () => observer.disconnect(); // clean up on unmount
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, container_ref.current]);
  return (
    <div className="h-screen w-full  border-2 border-black rounded-r-2xl flex flex-col">
      <div className="flex items-center gap-4 p-8">
        <img
          className="w-24 h-24 rounded-full"
          src={user.avatar_url}
          alt="user avatar"
        />
        <div>
          <h1 className="font-bold">{user.name}</h1>
          <div className="font-medium">@{user.login}</div>
          <Button
            disabled={isPending}
            onClick={() => {
              handleLogout();
            }}
          >
            Logout
          </Button>
        </div>
      </div>

      <div ref={container_ref} className="h-full overflow-y-auto flex-1">
        {isLoading && <SidebarSkeleton />}
        {isError && <p>Failed to load repositories</p>}
        <div className="pl-8 space-y-4">
          {data?.pages.map((page) =>
            page.repositories.map((repo: Repository) => (
              <div key={repo.id}>
                <Button
                  className={`${name === repo.name ? "bg-muted" : ""}`}
                  onClick={() => {
                    dispatch(setRepo({ id: repo.id, name: repo.name }));
                  }}
                  variant="ghost"
                >
                  {repo.name}
                </Button>
              </div>
            )),
          )}
        </div>

        {isFetchingNextPage && (
          <div className="flex gap-2 p-6 items-center text-muted-foreground">
            <Spinner />
            <p>Loading repositories...</p>
          </div>
        )}
        <div ref={sentinel_ref} />
      </div>
    </div>
  );
}
