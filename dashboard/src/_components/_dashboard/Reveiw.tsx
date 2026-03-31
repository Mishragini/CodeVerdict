import { fetchReviews } from "@/lib/apiCall";
import { useAppSelector } from "@/redux/hook";
import { useQuery } from "@tanstack/react-query";

interface Review {
  id: number;
  repo: string;
  owner: string;
  pull_number: number;
  github_url: string;
  body: string;
}

export function Review() {
  const { id, name } = useAppSelector((state) => state.repository);
  const {
    data: reviews,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["reviews"],
    queryFn: async () => {
      if (!name) return null;
      const response = await fetchReviews(name);
      return response.reviews;
    },
  });
  if (!id) {
    return <div>Select a repository for its reviews.</div>;
  } else if (isLoading) {
    return <div>Loading...</div>;
  } else if (isError) {
    return (
      <div>
        ${id}
        {name}Failed to load reviews..
      </div>
    );
  } else if (!reviews || reviews?.length < 0) {
    return <div>No reviews yet to show.</div>;
  }
  return (
    <div>
      {reviews.map((review: Review) => {
        <div className="w-full border-2 border-black rounded-md">
          <div>Review:{review.id}</div>
          <div>{review.github_url}</div>
          <div>{review.body}</div>
        </div>;
      })}
    </div>
  );
}
