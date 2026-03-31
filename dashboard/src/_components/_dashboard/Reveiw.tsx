import { fetchReviews } from "@/lib/apiCall";
import { useAppSelector } from "@/redux/hook";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import ReactMarkdown from "react-markdown";

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
  const [showFullBody, setShowFullBody] = useState<null | string | number>(
    null,
  );
  const MAX_BODY_LENGTH = 100;
  const { data, isLoading, isError } = useQuery({
    queryKey: ["reviews", name],
    queryFn: async () => {
      if (!name) return null;
      const response = await fetchReviews(name);
      return response;
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
  }
  return (
    <div className="p-8">
      {data?.reviews?.map((review: Review) => (
        <div
          key={review.id}
          className="w-full border-2 border-black rounded-2xl p-8 bg-muted flex flex-col gap-8"
        >
          <a
            href={review.github_url}
            className="text-xl font-bold hover:underline"
          >
            Review:{review.id}
          </a>
          <ReactMarkdown>
            {showFullBody ? review.body : review.body.slice(0, MAX_BODY_LENGTH)}
          </ReactMarkdown>
          {review.body.length > MAX_BODY_LENGTH && (
            <button
              onClick={() =>
                setShowFullBody(
                  !(showFullBody === review.id) ? review.id : null,
                )
              }
              className="text-md hover:underline"
            >
              {showFullBody === review.id ? "Show less" : "Show more"}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
