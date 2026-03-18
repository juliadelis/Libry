import { useEffect, useMemo, useState } from "react";
import { Button } from "primereact/button";
import { MdKeyboardArrowRight } from "react-icons/md";
import { useInject } from "../../../shared/modules/di";
import { bookService } from "../../../shared/services/book.service";
import { CurrentReadingItemLike } from "App/shared/models/books.model";

function formatProgressPercent(pagesRead: number, totalPages: number): string {
  if (!totalPages || totalPages <= 0) {
    return "0%";
  }

  const value = Math.min(100, Math.max(0, (pagesRead / totalPages) * 100));

  return `${Math.round(value)}%`;
}

export default function CurrentBookCarousel() {
  const booksService = useInject(bookService);

  const [items, setItems] = useState<CurrentReadingItemLike[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);

    const subscription = booksService.getCurrentReadingBooks().subscribe({
      next: (books) => {
        setItems(books);
        setCurrentIndex(0);
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
  }, [booksService]);

  const hasMany = items.length > 1;

  const currentItem = useMemo(() => {
    if (!items.length) {
      return null;
    }

    const safeIndex = Math.min(currentIndex, items.length - 1);
    return items[safeIndex];
  }, [currentIndex, items]);

  const handleNext = () => {
    if (!items.length) {
      return;
    }

    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  if (isLoading) {
    return (
      <div className="bg-[#0E2310] w-full px-8 py-5 rounded-[22px] h-42" />
    );
  }

  if (hasError) {
    return (
      <div className="bg-[#0E2310] w-full px-8 py-5 rounded-[22px] text-left text-white">
        <h3 className="font-family-koh font-bold text-[18px]">Current book</h3>
        <p className="text-[14px] font-light">
          Could not load current reading books.
        </p>
      </div>
    );
  }

  if (!currentItem) {
    return (
      <div className="bg-[#0E2310] w-full px-8 py-5 rounded-[22px] text-left text-white">
        <h3 className="font-family-koh font-bold text-[18px]">Current book</h3>
        <p className="text-[14px] font-light">You have no books in progress.</p>
      </div>
    );
  }

  const totalPages =
    currentItem.book.pages && currentItem.book.pages > 0
      ? currentItem.book.pages
      : 0;
  const pagesRead = Math.max(0, currentItem.pagesRead ?? 0);
  const pagesLeft = totalPages > 0 ? Math.max(0, totalPages - pagesRead) : 0;
  const progressLabel = formatProgressPercent(pagesRead, totalPages || 1);
  const progressValue =
    totalPages > 0 ? Math.min(100, (pagesRead / totalPages) * 100) : 0;

  return (
    <div className="bg-[#0E2310] w-full px-8 py-5 rounded-[22px]">
      <div className="flex justify-between items-start mb-4 gap-3">
        <h3 className="font-family-koh text-[18px] text-white text-left">
          Current book
        </h3>
        {hasMany ? (
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next current book"
            className="text-white cursor-pointer leading-none">
            <MdKeyboardArrowRight size={28} />
          </button>
        ) : null}
      </div>

      <div className="grid grid-cols-[76px_1fr] gap-5 items-center">
        <div className="w-19 h-27.5 rounded-md bg-[#7B8D3B] overflow-hidden">
          {currentItem.book.coverUrl ? (
            <img
              src={currentItem.book.coverUrl}
              alt={currentItem.book.title}
              className="w-full h-full object-cover"
            />
          ) : null}
        </div>

        <div className="text-left text-white">
          <h4 className="font-family-koh text-[30px] leading-tight line-clamp-2">
            {currentItem.book.title}
          </h4>
          <p className="text-[14px] font-bold mt-1">
            {currentItem.book.author || "Unknown author"}
          </p>

          <div className="mt-2">
            <div className="flex justify-between text-[12px] text-[#D9D9D9] mb-1">
              <span>{progressLabel}</span>
              <span>{pagesLeft} pages left</span>
            </div>
            <div className="w-full h-1 rounded-full bg-[#31462D] overflow-hidden">
              <div
                className="h-full bg-[#8EAF57]"
                style={{ width: `${progressValue}%` }}
              />
            </div>
            <div className="flex justify-between text-[12px] mt-1">
              <span className="font-bold">{progressLabel}</span>
              <span className="font-bold">
                {pagesRead} / {totalPages || "?"}
              </span>
            </div>
          </div>

          <div className="mt-2">
            <Button
              className="bg-white text-[#0E2310] px-3 py-1 rounded-full text-[12px] font-bold"
              label="Add History"
              icon="pi pi-plus"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
