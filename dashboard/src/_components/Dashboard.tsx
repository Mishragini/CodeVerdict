import { fetchUser } from "@/lib/apiCall";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { setUser } from "@/redux/slice/userSlice";
import { useQuery } from "@tanstack/react-query";
import { Navigate, useSearchParams } from "react-router";
import { SideBar } from "./_dashboard/Sidebar";
import { Review } from "./_dashboard/Reveiw";
import { useEffect } from "react";
import { toast } from "sonner";

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
      dispatch(setUser(user));
      return user;
    },
  });

  if (query.isLoading) {
    return <div>Loading...</div>;
  }

  if (!value) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="grid grid-cols-12">
      <div className="col-span-2">
        <SideBar user={value} />
      </div>
      <div className="col-span-10">
        <Review />
      </div>
    </div>
  );
}
