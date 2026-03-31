import { fetchUser } from "@/lib/fetchUser";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { setUser } from "@/redux/slice/userSlice";
import { useQuery } from "@tanstack/react-query";
import { Navigate } from "react-router";

export function Dashboard() {
  const { value } = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();

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

  return <div>Dashboard</div>;
}
