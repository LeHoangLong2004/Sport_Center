export function GalleryCta() {
  return (
    <div className="flex flex-col items-start pb-[64px] pt-[32px] px-[80px] w-full">
      <div className="bg-[#2563eb] flex flex-col gap-[32px] items-start p-[48px] rounded-[24px] w-full">
        <div className="flex flex-col gap-[12px] items-start text-center w-full">
          <p className="font-['Inter:Extra_Bold'] font-extrabold text-[32px] text-white w-full">
            Đặt lịch tham quan & Tư vấn lộ trình tập luyện miễn phí
          </p>
          <p className="font-['Inter:Regular'] font-normal text-[#93c5fd] text-[16px] w-full">
            Hãy đến trải nghiệm không gian thực tế và nhận đánh giá chỉ số
            InBody cơ thể từ chuyên gia của chúng tôi.
          </p>
        </div>
        <div className="flex gap-[16px] items-center w-full">
          <div className="bg-[#1d4ed8] border border-[#3b82f6] flex flex-1 items-start px-[16px] py-[14px] rounded-[8px]">
            <p className="font-['Inter:Regular'] font-normal text-[#93c5fd] text-[14px]">
              Họ và tên của bạn
            </p>
          </div>
          <div className="bg-[#1d4ed8] border border-[#3b82f6] flex flex-1 items-start px-[16px] py-[14px] rounded-[8px]">
            <p className="font-['Inter:Regular'] font-normal text-[#93c5fd] text-[14px]">
              Số điện thoại liên hệ
            </p>
          </div>
          <div className="bg-[#1d4ed8] border border-[#3b82f6] flex flex-1 items-center justify-between px-[16px] py-[14px] rounded-[8px]">
            <p className="font-['Inter:Regular'] font-normal text-white text-[14px]">
              Chọn cơ sở muốn tham quan
            </p>
            <span className="text-[#93c5fd] text-[12px]">▾</span>
          </div>
          <div className="bg-[#10b981] flex flex-1 items-center justify-center px-[24px] py-[14px] rounded-[8px] cursor-pointer">
            <p className="font-['Inter:Extra_Bold'] font-extrabold text-[14px] text-white whitespace-nowrap">
              Đặt lịch hẹn tham quan
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
