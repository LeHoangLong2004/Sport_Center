import React from 'react';
import { assetRoots, iconNames, classItems, memberSections, MemberPage, visualPage, asset } from '../shared';

export default function Progress({ step }: { step: 1 | 2 }) {
  const lineAssets =
    step === 1
      ? [
          asset("classes", "e889f.svg"),
          asset("classes", "e889f.svg"),
        ]
      : [
          asset("confirm", "3c7d4.svg"),
          asset("confirm", "7156f.svg"),
        ]

  return (
    <div className={step === 1 ? "mp-progress step-one" : "mp-progress"}>
      <span className={step === 1 ? "active" : ""}>1. Chọn lịch</span>
      <i>
        <img src={lineAssets[0]} alt="" />
      </i>
      <span className={step === 2 ? "active" : ""}>
        {step === 2 ? "2. Xác nhận đặt lớp" : "2. Xác nhận"}
      </span>
      <i>
        <img src={lineAssets[1]} alt="" />
      </i>
      <span>3. Hoàn tất</span>
    </div>
  )
}
