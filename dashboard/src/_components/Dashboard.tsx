import { fetchUser } from "@/lib/apiCall";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { setUser } from "@/redux/slice/userSlice";
import { useQuery } from "@tanstack/react-query";
import { Navigate, useSearchParams } from "react-router";
import { SideBar } from "./_dashboard/Sidebar";
import { Review } from "./_dashboard/Reveiw";
import { useEffect } from "react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

export function Dashboard() {
  const { value } = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const loginStatus = searchParams.get("login") === "success";
    let timeout_id = null;
    if (loginStatus) {
      timeout_id = setTimeout(() => {
        toast.success("Logged in successfully!");
        setSearchParams({}, { replace: true });
      }, 500);
    }
    return () => {
      timeout_id && clearTimeout(timeout_id);
    };
  }, []);

  const query = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const user = await fetchUser();
      if (user) {
        dispatch(setUser(user));
        return user;
      }
      return null;
    },
    retry: false,
  });

  if (query.isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!value || query.isError) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen">
      <div>
        <SideBar user={value} />
      </div>
      <div className="flex-1">
        <Review />
      </div>
    </div>
  );
}
