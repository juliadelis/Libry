import { useEffect, useMemo, useState } from "react";
import { IoFlame } from "react-icons/io5";
import { useInject } from "../../../shared/modules/di";
import { bookService } from "../../../shared/services/book.service";
import { CurrentReadingItemLike } from "App/shared/models/books.model";

const WEEK_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

function toDateKey(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getWeekDays(referenceDate: Date): Date[] {
  const start = new Date(referenceDate);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - start.getDay());

  return Array.from({ length: 7 }).map((_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return day;
  });
}

function parseValidDate(value?: string | null): Date | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function buildActiveWeekSet(
  items: CurrentReadingItemLike[],
  weekDays: Date[],
): Set<string> {
  const weekKeys = new Set(weekDays.map((day) => toDateKey(day)));
  const activeKeys = new Set<string>();

  for (const item of items) {
    const date = parseValidDate(item.updatedAt);
    if (!date) {
      continue;
    }

    const key = toDateKey(date);
    if (weekKeys.has(key)) {
      activeKeys.add(key);
    }
  }

  return activeKeys;
}

function countConsecutiveDaysFromToday(
  activeKeys: Set<string>,
  weekDays: Date[],
  today: Date,
): number {
  const todayIndex = today.getDay();
  let streak = 0;

  for (let index = todayIndex; index >= 0; index -= 1) {
    const key = toDateKey(weekDays[index]);

    if (!activeKeys.has(key)) {
      break;
    }

    streak += 1;
  }

  return streak;
}

export default function BookStreak() {
  const booksService = useInject(bookService);

  const [items, setItems] = useState<CurrentReadingItemLike[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);

    const subscription = booksService.getCurrentReadingBooks().subscribe({
      next: (response) => {
        setItems(response);
        setIsLoading(false);
      },
      error: () => {
        setItems([]);
        setIsLoading(false);
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [booksService]);

  const today = useMemo(() => {
    const value = new Date();
    value.setHours(0, 0, 0, 0);
    return value;
  }, []);

  const weekDays = useMemo(() => getWeekDays(today), [today]);
  const activeDays = useMemo(
    () => buildActiveWeekSet(items, weekDays),
    [items, weekDays],
  );

  const totalRegisters = activeDays.size;
  const streakDays = countConsecutiveDaysFromToday(activeDays, weekDays, today);

  return (
    <div className="bg-[#3B5219] rounded-[22px] p-4 text-left text-white w-full">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-family-koh font-bold text-[18px]">
          How is the week going
        </h3>
        <div className="flex items-center gap-1 font-family-koh text-[18px]">
          <span>{isLoading ? "-" : totalRegisters}</span>
          <IoFlame color="#FF4F3D" size={16} />
        </div>
      </div>

      <p className="text-[14px] mb-4 font-light">
        Times that you register a reading history
      </p>

      <div className="grid grid-cols-7 gap-2 mb-1">
        {weekDays.map((day, index) => {
          const isActive = activeDays.has(toDateKey(day));

          return (
            <div
              key={toDateKey(day)}
              className="flex items-center justify-center">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  isActive ? "bg-[#0DFC6C]" : "bg-[#8EA960]"
                }`}>
                <i
                  className={`pi pi-book text-[11px] leading-none ${
                    isActive ? "text-[#0E2310]" : "text-[#3B5219]"
                  }`}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-7 gap-2 mb-4">
        {WEEK_LABELS.map((label, index) => (
          <div
            key={`${label}-${index}`}
            className="text-center text-[18px] font-family-koh">
            {label}
          </div>
        ))}
      </div>

      <p className="text-[14px] font-light">
        Reading days in a row:{" "}
        <span className="font-bold">{isLoading ? "-" : streakDays}</span>
      </p>
    </div>
  );
}
