import { useState } from "react";

const assetPathPrefix = "/assets/site/5634";
const imgRectangle = `${assetPathPrefix}/53742.png`;
const imgRectangle1 = `${assetPathPrefix}/50d66.png`;
const imgRectangle2 = `${assetPathPrefix}/1b1ce.png`;
const imgRectangle3 = `${assetPathPrefix}/70fa4.png`;
const imgRectangle4 = `${assetPathPrefix}/c8171.png`;
const imgRectangle5 = `${assetPathPrefix}/15dd2.png`;
const imgRectangle6 = `${assetPathPrefix}/d9ecb.png`;
const imgRectangle7 = `${assetPathPrefix}/9343f.png`;
const imgRectangle8 = `${assetPathPrefix}/9fb11.png`;
const imgRectangle9 = `${assetPathPrefix}/d6f3a.png`;
const imgRectangle10 = `${assetPathPrefix}/c82b8.png`;

const filterCategories = ["Tất cả", "Cơ sở vật chất", "Lớp học thực tế", "Sự kiện & Giải đấu", "Đội ngũ huấn luyện viên"];

interface GalleryItem {
  img: string;
  caption: string;
  category: string;
}

const galleryItems: GalleryItem[] = [
  { img: imgRectangle, caption: "Hồ bơi tiêu chuẩn Olympic quốc tế", category: "Cơ sở vật chất" },
  { img: imgRectangle1, caption: "Khu tạ tự do Free Weights chuyên nghiệp", category: "Cơ sở vật chất" },
  { img: imgRectangle2, caption: "Phòng tập Yoga thiền định yên tĩnh", category: "Lớp học thực tế" },
  { img: imgRectangle3, caption: "Vòng đấu Boxing Kickfit chuyên dụng", category: "Lớp học thực tế" },
  { img: imgRectangle4, caption: "Sân bóng rổ trong nhà chuẩn FIBA", category: "Cơ sở vật chất" },
  { img: imgRectangle5, caption: "Phòng Cycling chuẩn nhịp điệu ánh sáng", category: "Lớp học thực tế" },
  { img: imgRectangle6, caption: "Toàn cảnh không gian Energy Platform liên hoàn", category: "Cơ sở vật chất" },
  { img: imgRectangle7, caption: "Khu chạy bộ Cardio", category: "Cơ sở vật chất" },
  { img: imgRectangle8, caption: "Studio Pilates Reformer", category: "Lớp học thực tế" },
  { img: imgRectangle9, caption: "Khu xông hơi & Phục hồi", category: "Cơ sở vật chất" },
  { img: imgRectangle10, caption: "Quầy dinh dưỡng & Giải khát", category: "Cơ sở vật chất" },
];

const navItems: [string, boolean][] = [
  ["Trang chủ", false],
  ["Bộ môn", true],
  ["Lớp học", false],
  ["Huấn luyện viên", false],
  ["Gói tập", false],
  ["Về chúng tôi", false],
  ["Liên hệ", false],
];

export default function ThuVienHinhAnhRedesign() {
  const [activeFilter, setActiveFilter] = useState("Tất cả");

  const filtered = activeFilter === "Tất cả"
    ? galleryItems
    : galleryItems.filter((item) => item.category === activeFilter);

  return (
    <div className="bg-[#f8fafc] flex flex-col items-start w-full min-h-screen">
      

      {/* Hero */}
      <div className="bg-[#0f172a] flex flex-col gap-[16px] items-start px-[80px] py-[64px] w-full">
        <div className="bg-[rgba(16,185,129,0.1)] border border-[#10b981] flex items-center px-[12px] py-[6px] rounded-[100px]">
          <p className="font-['Inter:Bold'] font-bold text-[#10b981] text-[12px] uppercase">TIỆN ÍCH TIÊU CHUẨN QUỐC TẾ</p>
        </div>
        <p className="font-['Inter:Extra_Bold'] font-extrabold text-[44px] text-white leading-[1.2]">Khám phá không gian SportCenter</p>
        <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[16px] leading-[1.6] w-[640px]">
          Môi trường luyện tập tràn đầy năng lượng cùng hệ thống thiết bị chuẩn quốc tế giúp bạn luôn sẵn sàng bứt phá.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-start pb-[16px] pt-[32px] px-[80px] w-full">
        <div className="flex flex-wrap gap-[12px] items-start">
          {filterCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`flex items-center px-[24px] py-[12px] rounded-[100px] text-[14px] font-['Inter:Semi_Bold'] font-semibold cursor-pointer transition-colors border ${
                activeFilter === cat
                  ? "bg-[#2563eb] text-white border-transparent"
                  : "bg-white text-[#0f172a] border-[#e2e8f0] hover:border-[#2563eb] hover:text-[#2563eb]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="flex flex-col gap-[24px] items-start pb-[48px] pt-[24px] px-[80px] w-full">
        {/* Row 1 - two large items */}
        {(activeFilter === "Tất cả") && (
          <>
            <div className="flex gap-[24px] h-[400px] items-start w-full">
              <div className="relative flex flex-1 h-full overflow-hidden rounded-[20px]">
                <img alt={galleryItems[0].caption} className="absolute inset-0 w-full h-full object-cover pointer-events-none" src={galleryItems[0].img} />
                <div className="absolute bg-[rgba(0,0,0,0.7)] bottom-[24px] left-[24px] flex items-center p-[12px] rounded-[8px]">
                  <p className="font-['Inter:Semi_Bold'] font-semibold text-[14px] text-white whitespace-nowrap">{galleryItems[0].caption}</p>
                </div>
              </div>
              <div className="relative flex h-full w-[420px] overflow-hidden rounded-[20px]">
                <img alt={galleryItems[1].caption} className="absolute inset-0 w-full h-full object-cover pointer-events-none" src={galleryItems[1].img} />
                <div className="absolute bg-[rgba(0,0,0,0.7)] bottom-[24px] left-[24px] flex items-center p-[12px] rounded-[8px]">
                  <p className="font-['Inter:Semi_Bold'] font-semibold text-[14px] text-white whitespace-nowrap">{galleryItems[1].caption}</p>
                </div>
              </div>
            </div>

            {/* Row 2 - three equal */}
            <div className="flex gap-[24px] h-[320px] items-start w-full">
              {galleryItems.slice(2, 5).map((item) => (
                <div key={item.caption} className="relative flex flex-1 h-full overflow-hidden rounded-[20px]">
                  <img alt={item.caption} className="absolute inset-0 w-full h-full object-cover pointer-events-none" src={item.img} />
                  <div className="absolute bg-[rgba(0,0,0,0.7)] bottom-[24px] left-[24px] flex items-center p-[12px] rounded-[8px]">
                    <p className="font-['Inter:Semi_Bold'] font-semibold text-[14px] text-white whitespace-nowrap">{item.caption}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Row 3 - wide + regular */}
            <div className="flex gap-[24px] h-[400px] items-start w-full">
              <div className="relative flex h-full w-[420px] overflow-hidden rounded-[20px]">
                <img alt={galleryItems[5].caption} className="absolute inset-0 w-full h-full object-cover pointer-events-none" src={galleryItems[5].img} />
                <div className="absolute bg-[rgba(0,0,0,0.7)] bottom-[24px] left-[24px] flex items-center p-[12px] rounded-[8px]">
                  <p className="font-['Inter:Semi_Bold'] font-semibold text-[14px] text-white whitespace-nowrap">{galleryItems[5].caption}</p>
                </div>
              </div>
              <div className="relative flex flex-1 h-full overflow-hidden rounded-[20px]">
                <img alt={galleryItems[6].caption} className="absolute inset-0 w-full h-full object-cover pointer-events-none" src={galleryItems[6].img} />
                <div className="absolute bg-[rgba(0,0,0,0.7)] bottom-[24px] left-[24px] flex items-center p-[12px] rounded-[8px]">
                  <p className="font-['Inter:Semi_Bold'] font-semibold text-[14px] text-white whitespace-nowrap">{galleryItems[6].caption}</p>
                </div>
              </div>
            </div>

            {/* Row 4 - four small */}
            <div className="flex gap-[24px] h-[240px] items-start w-full">
              {galleryItems.slice(7, 11).map((item) => (
                <div key={item.caption} className="relative flex flex-1 h-full overflow-hidden rounded-[16px]">
                  <img alt={item.caption} className="absolute inset-0 w-full h-full object-cover pointer-events-none" src={item.img} />
                  <div className="absolute bg-[rgba(0,0,0,0.7)] bottom-[16px] left-[16px] flex items-center p-[8px] rounded-[6px]">
                    <p className="font-['Inter:Semi_Bold'] font-semibold text-[12px] text-white whitespace-nowrap">{item.caption}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Filtered view - grid layout */}
        {activeFilter !== "Tất cả" && (
          <div className="grid grid-cols-3 gap-[24px] w-full">
            {filtered.map((item) => (
              <div key={item.caption} className="relative h-[280px] overflow-hidden rounded-[16px]">
                <img alt={item.caption} className="absolute inset-0 w-full h-full object-cover pointer-events-none" src={item.img} />
                <div className="absolute bg-[rgba(0,0,0,0.7)] bottom-[16px] left-[16px] flex items-center p-[10px] rounded-[8px]">
                  <p className="font-['Inter:Semi_Bold'] font-semibold text-[13px] text-white">{item.caption}</p>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-3 flex items-center justify-center py-[80px]">
                <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[16px]">Không có hình ảnh trong danh mục này.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Load More */}
      <div className="flex items-center justify-center pb-[64px] w-full">
        <button className="border border-[#2563eb] flex items-center px-[32px] py-[14px] rounded-[8px] cursor-pointer hover:bg-[#2563eb] hover:text-white transition-colors group">
          <p className="font-['Inter:Bold'] font-bold text-[#2563eb] text-[14px] group-hover:text-white transition-colors">Tải thêm hình ảnh</p>
        </button>
      </div>

      {/* CTA Banner */}
      <div className="flex flex-col items-start pb-[64px] pt-[32px] px-[80px] w-full">
        <div className="bg-[#2563eb] flex flex-col gap-[32px] items-start p-[48px] rounded-[24px] w-full">
          <div className="flex flex-col gap-[12px] items-start text-center w-full">
            <p className="font-['Inter:Extra_Bold'] font-extrabold text-[32px] text-white w-full">
              Đặt lịch tham quan & Tư vấn lộ trình tập luyện miễn phí
            </p>
            <p className="font-['Inter:Regular'] font-normal text-[#93c5fd] text-[16px] w-full">
              Hãy đến trải nghiệm không gian thực tế và nhận đánh giá chỉ số InBody cơ thể từ chuyên gia của chúng tôi.
            </p>
          </div>
          <div className="flex gap-[16px] items-center w-full">
            <div className="bg-[#1d4ed8] border border-[#3b82f6] flex flex-1 items-start px-[16px] py-[14px] rounded-[8px]">
              <p className="font-['Inter:Regular'] font-normal text-[#93c5fd] text-[14px]">Họ và tên của bạn</p>
            </div>
            <div className="bg-[#1d4ed8] border border-[#3b82f6] flex flex-1 items-start px-[16px] py-[14px] rounded-[8px]">
              <p className="font-['Inter:Regular'] font-normal text-[#93c5fd] text-[14px]">Số điện thoại liên hệ</p>
            </div>
            <div className="bg-[#1d4ed8] border border-[#3b82f6] flex flex-1 items-center justify-between px-[16px] py-[14px] rounded-[8px]">
              <p className="font-['Inter:Regular'] font-normal text-white text-[14px]">Chọn cơ sở muốn tham quan</p>
              <span className="text-[#93c5fd] text-[12px]">▾</span>
            </div>
            <div className="bg-[#10b981] flex flex-1 items-center justify-center px-[24px] py-[14px] rounded-[8px] cursor-pointer">
              <p className="font-['Inter:Extra_Bold'] font-extrabold text-[14px] text-white whitespace-nowrap">Đặt lịch hẹn tham quan</p>
            </div>
          </div>
        </div>
      </div>

      
    </div>
  );
}
