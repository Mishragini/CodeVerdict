import { fetchReviews } from "@/lib/apiCall";
import { useAppSelector } from "@/redux/hook";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { ReviewSkeleton } from "./ReviewSkeleton";

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
    return (
      <div className="h-full flex items-center justify-center px-6">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-xl">
            +
          </div>
          <h3 className="text-lg font-semibold tracking-tight">
            Select a repository
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Pick a repo from the sidebar to view code reviews.
          </p>
        </div>
      </div>
    );
  } else if (isLoading) {
    return (
      <div className="h-screen justify-center items-center">
        <ReviewSkeleton />
      </div>
    );
  } else if (isError) {
    return (
      <div>
        ${id}
        {name}Failed to load reviews..
      </div>
    );
  }
  return (
    <div className="h-full overflow-y-auto px-8 pt-8 space-y-10 ">
      {data.reviews.length > 0 ? (
        data?.reviews?.map((review: Review) => (
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
              {showFullBody === review.id
                ? review.body
                : review.body.slice(0, MAX_BODY_LENGTH)}
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
        ))
      ) : (
        <div className="flex h-screen items-center justify-center">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-xl">
              -
            </div>
            <h3 className="text-lg font-semibold tracking-tight">
              No reviews yet
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              There are no reviews in{" "}
              <span className="font-medium">{name}</span> right now.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
