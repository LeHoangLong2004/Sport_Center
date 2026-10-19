import React from "react";
import { ProfileKpiCards } from "./ProfileKpiCards";
import { ProfileBadgesGrid } from "./ProfileBadgesGrid";

interface ProfileStatsBadgesProps {
  completedCount: number;
  totalSessionsCount: number;
  badgesStatus: {
    streak10: boolean;
    breakthrough20: boolean;
    multiSport: boolean;
    coachBuddy: boolean;
    warrior50: boolean;
    goldMember: boolean;
  };
  unlockedBadgesCount: number;
}

export const ProfileStatsBadges: React.FC<ProfileStatsBadgesProps> = ({
  completedCount,
  totalSessionsCount,
  badgesStatus,
  unlockedBadgesCount,
}) => {
  return (
    <div className="space-y-6">
      <ProfileKpiCards
        completedCount={completedCount}
        totalSessionsCount={totalSessionsCount}
      />
      <ProfileBadgesGrid
        completedCount={completedCount}
        badgesStatus={badgesStatus}
        unlockedBadgesCount={unlockedBadgesCount}
      />
    </div>
  );
};
