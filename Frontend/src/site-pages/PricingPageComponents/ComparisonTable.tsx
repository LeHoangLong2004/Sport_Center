import React from 'react';
import { comparisonRows } from '../pricingData';
import { Check } from 'lucide-react'; // Check is used in ComparisonTable

export default function ComparisonTable() {
  return (
    <>
      {/* Comparison Table */}
      <section className="bg-white flex flex-col items-center gap-[48px] px-[80px] py-[80px] w-full">
        <div className="flex flex-col items-center gap-[12px]">
          <h2 className="font-['Inter:Extra_Bold'] font-extrabold text-[#0f172a] text-[32px]">
            So sánh đặc quyền chi tiết
          </h2>
          <div className="bg-[#2563eb] h-[3px] rounded-full w-[48px]" />
        </div>
        <div className="w-full max-w-[1120px] rounded-[16px] overflow-hidden border border-[#e2e8f0]">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#0f172a]">
                <th className="text-left px-[28px] py-[18px] font-['Inter:Bold'] font-bold text-white text-[14px] w-[34%]">
                  Đặc quyền hội viên
                </th>
                <th className="text-center px-[20px] py-[18px] font-['Inter:Bold'] font-bold text-white text-[14px] w-[22%]">
                  Starter
                </th>
                <th className="text-center px-[20px] py-[18px] font-['Inter:Bold'] font-bold text-white text-[14px] w-[22%]">
                  Fitness Plus
                </th>
                <th className="text-center px-[20px] py-[18px] font-['Inter:Bold'] font-bold text-white text-[14px] w-[22%]">
                  Premium VIP
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row, i) => (
                <tr
                  key={row.label}
                  className={i % 2 === 0 ? "bg-white" : "bg-[#f8fafc]"}
                >
                  <td className="px-[28px] py-[16px] font-['Inter:Medium'] font-medium text-[#1e293b] text-[14px]">
                    {row.label}
                  </td>
                  <td className={`px-[20px] py-[16px] text-center font-['Inter:Regular'] font-normal text-[14px] ${row.starter.color}`}>
                    {row.starter.text}
                  </td>
                  <td className={`px-[20px] py-[16px] text-center font-['Inter:Semi_Bold'] font-semibold text-[14px] ${row.fitness.color}`}>
                    {row.fitness.text}
                  </td>
                  <td className={`px-[20px] py-[16px] text-center font-['Inter:Semi_Bold'] font-semibold text-[14px] ${row.premium.color}`}>
                    {row.premium.text}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
