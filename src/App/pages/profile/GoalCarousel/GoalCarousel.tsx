import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useInject } from "../../../shared/modules/di";
import { bookService } from "../../../shared/services/book.service";
import "../Graph/index.scss";
import { Button } from "primereact/button";
import { ReadingGoalLike } from "App/shared/models/books.model";

export default function GoalCarousel() {
  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const navigate = useNavigate();
  const booksService = useInject(bookService);

  const [goalData, setGoalData] = useState<ReadingGoalLike | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);

    const subscription = booksService
      .getReadingGoalByYear(currentYear)
      .subscribe({
        next: (goal) => {
          setGoalData(goal);
          setIsLoading(false);
        },
        error: () => {
          setHasError(true);
          setIsLoading(false);
        },
      });

    return () => {
      subscription.unsubscribe();
    };
  }, [booksService, currentYear]);

  const books = goalData?.books ?? [];
  const goal = goalData?.targetCount ?? goalData?.totalBooks ?? 0;
  const progress =
    goalData?.achievedBooks ?? books.filter((item) => item.isRead).length;
  const progressPercentage =
    goalData?.progress ??
    (goal > 0 ? Number(((progress / goal) * 100).toFixed(2)) : 0);
  const hasGoal = Boolean(goalData);

  return (
    <div className="reads-card">
      <div className="flex justify-between items-start mb-4 gap-3">
        <h3 className="font-family-koh text-[18px] text-white text-left">
          Reading goal {currentYear}
        </h3>
        <Link
          to="/shelf"
          className="text-[14px] underline text-white hover:text-[#7B8D3B] whitespace-nowrap">
          See more &gt;
        </Link>
      </div>

      {isLoading ? (
        <div className="flex gap-3 overflow-hidden mb-5">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={`goal-placeholder-${index}`}
              className="w-15.5 h-23 rounded-md bg-[#D9D9D9] shrink-0"
            />
          ))}
        </div>
      ) : hasError ? (
        <div className="mb-5 text-left text-[13px] text-[#E8EEDC]">
          Could not load your reading goal right now.
        </div>
      ) : !hasGoal ? (
        <div className="mb-5 text-left font-light text-white">
          <p className="text-[14px] mb-3">
            No goal list created for {currentYear} yet.
          </p>
          <div>
            <Button
              className="bg-[#7B8D3B] gap-2 px-4 py-1 items-center  text-white rounded-full"
              label={`Create ${currentYear} goal`}
              icon="pi pi-plus"
              onClick={() => navigate("/shelf")}
            />
          </div>
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-1 mb-5 snap-x snap-mandatory">
          {books.length ? (
            books.map((item) => (
              <div
                key={item.id}
                className="w-15.5 h-23 rounded-md bg-[#D9D9D9] overflow-hidden shrink-0 snap-start">
                {item.book.coverUrl ? (
                  <img
                    src={item.book.coverUrl}
                    alt={item.book.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : null}
              </div>
            ))
          ) : (
            <p className="text-[13px] text-[#E8EEDC]">
              No books added to this goal yet.
            </p>
          )}
        </div>
      )}

      <div className="flex flex-col gap-3 text-white text-left">
        <p>{goal} books</p>

        <p className="text-[14px] font-light">
          Read: {progress} out of {goal} ({progressPercentage.toFixed(2)}%)
        </p>
      </div>
    </div>
  );
}
