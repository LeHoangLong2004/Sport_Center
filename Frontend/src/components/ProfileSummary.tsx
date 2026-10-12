import type { ReactNode } from "react";
import { UserAvatar } from "./UserAvatar";

type TierColor = "blue" | "gold" | "black" | "teal";

interface ProfileSummaryProps {
  data: { avatarUrl: string; fullName: string; email: string };
  roleLabel: string;
  tierColor: TierColor;
  extraInfo?: ReactNode;
}

export function ProfileSummary({
  data,
  roleLabel,
  tierColor,
  extraInfo,
}: ProfileSummaryProps) {
  return (
    <div className="w-full lg:w-[340px] shrink-0 flex flex-col gap-6">
      <div className="bg-white dark:bg-slate-800/80 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-700/50 flex flex-col items-center text-center relative overflow-hidden">
        <div
          className={`absolute top-0 left-0 w-full h-32 bg-gradient-to-br ${
            tierColor === "gold"
              ? "from-amber-400 to-orange-500"
              : tierColor === "black"
                ? "from-slate-800 to-black"
                : tierColor === "teal"
                  ? "from-teal-500 to-emerald-600"
                  : "from-blue-600 to-indigo-700"
          } dark:from-slate-700 dark:to-slate-900`}
        />
        <div
          className={`relative z-10 w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-lg ring-4 ${
            tierColor === "gold"
              ? "ring-amber-50"
              : tierColor === "black"
                ? "ring-slate-100"
                : tierColor === "teal"
                  ? "ring-teal-50"
                  : "ring-blue-50"
          } dark:ring-slate-700/50 bg-white dark:bg-slate-800 mt-10 mb-4 group cursor-pointer`}
        >
          <UserAvatar
            src={data.avatarUrl}
            name={data.fullName || "User"}
            className="w-full h-full object-cover group-hover:opacity-75 transition-opacity text-5xl"
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <input type="file" className="hidden" accept="image/*" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">
          {data.fullName}
        </h3>
        <span
          className={`mt-2 inline-flex items-center px-3 py-1 rounded-full font-semibold text-xs uppercase tracking-wider border ${
            tierColor === "gold"
              ? "bg-amber-50 text-amber-700 border-amber-100"
              : tierColor === "black"
                ? "bg-slate-800 text-slate-100 border-slate-700"
                : tierColor === "teal"
                  ? "bg-teal-50 text-teal-700 border-teal-100"
                  : "bg-blue-50 text-blue-700 border-blue-100"
          }`}
        >
          {roleLabel}
        </span>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-3 font-medium">
          {data.email}
        </p>
      </div>
      {extraInfo}
    </div>
  );
}
