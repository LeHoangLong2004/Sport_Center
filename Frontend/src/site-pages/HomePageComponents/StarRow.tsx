import { imgStar } from "../homePageData";

export function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-[3px] items-center">
      {[1, 2, 3, 4, 5].map((i) => (
        <img
          key={i}
          alt=""
          src={imgStar}
          style={{
            width: 14,
            height: 14,
            opacity: i <= Math.round(rating) ? 1 : 0.25,
          }}
        />
      ))}
      <span className="ml-[4px] font-['Inter:Bold'] font-bold text-[#0f172a] text-[13px]">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}
