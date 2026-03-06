export default function GoalCarousel() {
  const currentYear = new Date().getFullYear();
  const goal = 23;
  const progress = 1;

  const progressPercentage = (progress / goal) * 100;

  return (
    <div className="reads-card">
      <div className="flex justify-between">
        <h3 className="font-family-koh text-[18px]  text-white text-left mb-4">
          Reading goal {currentYear}
        </h3>
        <a
          href="/"
          className="text-[14px] underline text-white hover:text-[#7B8D3B]">
          <p> See more &gt; </p>
        </a>
      </div>
      <div></div>
      <div className="flex flex-col gap-5 text-white text-left">
        <p>{goal} books</p>

        <p className="text-[14px] font-light">
          Read: {progress} out of {goal} ({progressPercentage.toFixed(2)}%)
        </p>
      </div>
    </div>
  );
}
