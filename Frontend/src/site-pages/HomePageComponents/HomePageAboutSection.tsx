import React from "react";
import { FadeUp } from "../../components/Motion";
import { imgAboutPhoto } from "../homePageData";

export const HomePageAboutSection: React.FC = () => {
  return (
    <section className="bg-[#f8fafc] flex gap-[60px] items-center px-[80px] py-[80px] w-full shrink-0">
      <FadeUp
        className="flex-1 min-w-0 rounded-[20px] overflow-hidden h-[420px] relative shrink-0 shadow-2xl"
        style={{ maxWidth: "520px" }}
      >
        <img
          alt="Không gian SportCenter"
          className="absolute inset-0 w-full h-full object-cover max-w-none hover:scale-105 transition-transform duration-700"
          src={imgAboutPhoto}
        />
      </FadeUp>
      <FadeUp
        delay={0.2}
        className="flex-1 min-w-0 flex flex-col gap-[24px] items-start"
      >
        <div className="bg-[rgba(16,185,129,0.1)] border border-[#10b981] flex items-center px-[12px] py-[6px] rounded-[100px] shrink-0">
          <p className="font-['Inter:Bold'] font-bold text-[#10b981] text-[11px] uppercase tracking-wider">
            HỆ SINH THÁI THỂ THAO
          </p>
        </div>
        <div className="flex flex-col gap-[4px]">
          <h2 className="font-['Inter:Extra_Bold'] font-extrabold text-[#0f172a] text-[34px] leading-[1.2] m-0">
            Không gian luyện tập
            <br />
            chuẩn quốc tế
          </h2>
          <div className="bg-[#2563eb] h-[4px] rounded-[2px] w-[80px] mt-[10px]" />
        </div>
        <p className="font-['Inter:Regular'] font-normal text-[#1e293b] text-[16px] leading-[1.7] m-0">
          Được thành lập từ năm 2018, SportCenter sở hữu hơn 5.000 m² không
          gian luyện tập chuyên biệt với thiết bị Technogym thế hệ mới nhất,
          hồ bơi trị liệu tiêu chuẩn Olympic và đội ngũ hơn 48 huấn luyện viên
          được chứng nhận quốc tế.
        </p>
        <p className="font-['Inter:Regular'] font-normal text-[#1e293b] text-[16px] leading-[1.7] m-0">
          Mỗi hội viên được tiếp cận giáo án cá nhân hoá qua nền tảng Move AI
          — từ phân tích InBody, lập kế hoạch dinh dưỡng đến theo dõi tiến
          trình theo thời gian thực.
        </p>
        <div className="grid grid-cols-2 gap-[16px] w-full mt-[4px]">
          {[
            ["5.000 m²", "Tổng diện tích"],
            ["48+", "HLV chứng chỉ quốc tế"],
            ["5 khu vực", "Không gian chuyên biệt"],
            ["24/7", "Hỗ trợ trực tuyến"],
          ].map(([val, lbl]) => (
            <div
              key={lbl}
              className="bg-white border border-[#e2e8f0] flex flex-col gap-[4px] p-[16px] rounded-[12px]"
            >
              <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#10b981] text-[22px] leading-none m-0">
                {val}
              </p>
              <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-[13px] m-0">
                {lbl}
              </p>
            </div>
          ))}
        </div>
      </FadeUp>
    </section>
  );
};
