import { Button } from "@/components/ui/button";
import { fetchRepositories, logout } from "@/lib/apiCall";
import type { User } from "@/lib/types";
import { useAppDispatch } from "@/redux/hook";
import { setUser } from "@/redux/slice/userSlice";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

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
      console.log(lastPage);
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
      <div
        ref={container_ref}
        className="h-screen overflow-y-auto bg-green-200"
      >
        {isLoading && <p>Loading repositories...</p>}
        {isError && <p>Failed to load repositories</p>}

        {data?.pages.map((page) =>
          page.repositories.map((repo: Repository) => (
            <div key={repo.id}>
              <p>{repo.name}</p>
            </div>
          )),
        )}
        {isFetchingNextPage && <p>Loading repositories...</p>}
        <div ref={sentinel_ref} />
      </div>
    </div>
  );
}
