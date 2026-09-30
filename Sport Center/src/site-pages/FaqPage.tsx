import { useState } from "react";

const navItems: [string, boolean][] = [
  ["Trang chủ", false],
  ["Bộ môn", false],
  ["Lớp học", false],
  ["Huấn luyện viên", false],
  ["Gói tập", false],
  ["Về chúng tôi", false],
  ["Liên hệ", false],
];

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqGroup {
  title: string;
  accentColor: string;
  items: FaqItem[];
}

const faqGroups: FaqGroup[] = [
  {
    title: "Về gói tập & thanh toán",
    accentColor: "bg-[#10b981]",
    items: [
      {
        question: "Tôi có thể thanh toán phí dịch vụ bằng những hình thức nào?",
        answer: "SportCenter hỗ trợ đa dạng phương thức thanh toán bao gồm: chuyển khoản ngân hàng, quét mã QR qua ví điện tử (Momo, VNPAY), thanh toán bằng thẻ tín dụng/thẻ ghi nợ quốc tế trực tiếp tại quầy lễ tân.",
      },
      {
        question: "Có thể nâng cấp gói tập hiện tại giữa kỳ hạn không?",
        answer: "Có, bạn có thể dễ dàng nâng cấp lên gói tập cao hơn bất cứ lúc nào. Chi phí chênh lệch sẽ được tính toán dựa trên số ngày còn lại của gói cũ và trừ trực tiếp vào hóa đơn nâng cấp.",
      },
      {
        question: "SportCenter có áp dụng chương trình trả góp 0% lãi suất không?",
        answer: "Chúng tôi liên kết với hơn 10 ngân hàng uy tín cung cấp chương trình trả góp 0% lãi suất dành cho chủ thẻ tín dụng đối với hóa đơn đăng ký gói tập từ 6 tháng trở lên.",
      },
      {
        question: "Phí dịch vụ đã bao gồm thuế GTGT (VAT) chưa?",
        answer: "Tất cả bảng giá công bố tại website và phòng tập của SportCenter đã bao gồm thuế GTGT (VAT) 10%. Khách hàng có nhu cầu xuất hóa đơn đỏ vui lòng thông báo cho lễ tân trong ngày thanh toán.",
      },
      {
        question: "Làm sao để biết thời hạn của gói tập của tôi còn lại bao nhiêu ngày?",
        answer: "Bạn có thể kiểm tra trực tiếp trên ứng dụng SportCenter cá nhân trong mục 'Tài khoản của tôi' hoặc liên hệ trực tiếp lễ tân tại bất kỳ chi nhánh nào để được kiểm tra tức thời.",
      },
      {
        question: "Tôi có thể chuyển nhượng gói tập cho bạn bè hoặc người thân không?",
        answer: "Mỗi gói tập được định danh chính chủ. Tuy nhiên, chúng tôi hỗ trợ chuyển nhượng 01 lần duy nhất cho người khác với mức phí xử lý hồ sơ là 200.000 VNĐ.",
      },
    ],
  },
  {
    title: "Về lớp học & lịch tập",
    accentColor: "bg-[#2563eb]",
    items: [
      {
        question: "Tôi cần đặt trước lịch học bao lâu để chắc chắn có chỗ?",
        answer: "Lịch đặt lớp mở trước 48 giờ trên ứng dụng. Để bảo đảm vị trí tốt nhất, bạn nên đặt trước tối thiểu 2-4 tiếng trước giờ lớp học bắt đầu.",
      },
      {
        question: "Nếu tôi bận đột xuất, làm sao để hủy lịch học đã đặt?",
        answer: "Bạn có thể hủy lịch đặt lớp miễn phí thông qua ứng dụng trước giờ bắt đầu tối thiểu 2 tiếng. Việc hủy muộn hơn thời gian này hoặc không tham gia có thể bị hệ thống ghi nhận hạn chế đặt lớp trong tuần.",
      },
      {
        question: "Một lớp học tiêu chuẩn tại SportCenter kéo dài trong bao lâu?",
        answer: "Hầu hết các lớp học nhóm như Yoga, Zumba, HIIT, Kickfit kéo dài từ 45 đến 60 phút. Riêng các lớp đặc thù hoặc chuyên sâu có thể kéo dài 90 phút.",
      },
      {
        question: "Tôi là người mới bắt đầu hoàn toàn, có tham gia các lớp Group X được không?",
        answer: "Được chứ! Các lớp học tại SportCenter luôn có giáo án điều chỉnh độ khó linh hoạt. Huấn luyện viên sẽ hướng dẫn riêng động tác căn bản cho người mới bắt đầu trong suốt buổi tập.",
      },
      {
        question: "Tôi có thể mang theo giày và nước uống cá nhân vào phòng tập không?",
        answer: "SportCenter khuyến khích hội viên sử dụng giày thể thao sạch dành riêng cho việc tập luyện trong nhà. Chúng tôi cung cấp sẵn nước uống miễn phí tại các cây lọc nước nóng lạnh.",
      },
    ],
  },
  {
    title: "Về HLV & dịch vụ",
    accentColor: "bg-[#10b981]",
    items: [
      {
        question: "Làm thế nào để tôi đăng ký dịch vụ tập luyện cùng Huấn luyện viên cá nhân (PT)?",
        answer: "Bạn có thể tham khảo hồ sơ chuyên môn của các HLV trên website, sau đó đăng ký nhận tư vấn trực tuyến hoặc trao đổi trực tiếp với bộ phận Quản lý HLV tại chi nhánh để được ghép cặp tập luyện phù hợp.",
      },
      {
        question: "Huấn luyện viên tại SportCenter có những chứng chỉ đào tạo gì?",
        answer: "100% đội ngũ huấn luyện viên của chúng tôi sở hữu các bằng cấp quốc tế danh giá như NASM, ACE, Yoga Alliance 200H/500H hoặc từng là vận động viên chuyên nghiệp cấp quốc gia.",
      },
      {
        question: "Tôi có được thay đổi Huấn luyện viên cá nhân trong quá trình tập không?",
        answer: "Có. Nếu bạn cảm thấy phong cách giảng dạy của HLV hiện tại chưa thực sự tương thích với mục tiêu của mình, bạn có quyền yêu cầu đổi HLV miễn phí bằng cách liên hệ bộ phận dịch vụ khách hàng.",
      },
      {
        question: "Phòng tập có cung cấp phòng tắm, tủ đồ và khăn tắm miễn phí không?",
        answer: "Tất cả hội viên SportCenter đều được sử dụng miễn phí hệ thống tủ đồ khóa thông minh, phòng tắm nóng lạnh, máy sấy tóc cao cấp. Khăn tắm và khăn tập sẽ được cấp phát miễn phí tại quầy.",
      },
    ],
  },
  {
    title: "Về chính sách bảo mật & hoàn trả",
    accentColor: "bg-[#2563eb]",
    items: [
      {
        question: "Chính sách bảo lưu thẻ tập tại SportCenter được quy định như thế nào?",
        answer: "Tùy thuộc vào thời hạn gói tập đăng ký, hội viên được hỗ trợ bảo lưu miễn phí từ 15 đến 60 ngày mỗi năm đối với các lý do như sức khỏe, công tác hoặc đi du lịch xa.",
      },
      {
        question: "Tôi có thể hủy hợp đồng và yêu cầu hoàn tiền không?",
        answer: "Chúng tôi hỗ trợ hoàn tiền trong vòng 3 ngày kể từ ngày ký hợp đồng nếu hội viên chưa kích hoạt thẻ sử dụng dịch vụ. Sau thời gian này, chính sách không hoàn trả phí sẽ được áp dụng trừ trường hợp đặc biệt liên quan đến y tế bất khả kháng.",
      },
      {
        question: "Thông tin sức khỏe cá nhân của tôi có được bảo mật an toàn không?",
        answer: "Tuyệt đối an toàn. Mọi dữ liệu chỉ số hình thể Inbody, bệnh lý nền hay mục tiêu tập luyện đều được mã hóa trên hệ thống bảo mật thông tin nội bộ của trung tâm và chỉ PT phụ trách trực tiếp được tiếp cận.",
      },
      {
        question: "Tôi có thể tạm khóa tài khoản thẻ tập trong trường hợp mang thai hoặc chấn thương dài hạn không?",
        answer: "SportCenter hỗ trợ chính sách bảo lưu thai sản/chấn thương đặc biệt lên tới 270 ngày khi có giấy chỉ định hoặc xác nhận chính thức từ cơ sở y tế có thẩm quyền.",
      },
    ],
  },
];

function AccordionItem({ question, answer }: FaqItem) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white border border-[#e2e8f0] flex flex-col gap-[16px] items-start p-[24px] rounded-[12px] w-full drop-shadow-[0px_4px_6px_rgba(0,0,0,0.04)]">
      <button
        className="flex items-center justify-between w-full text-left"
        onClick={() => setOpen((v) => !v)}
      >
        <p className="flex-1 font-['Inter:Bold'] font-bold text-[#0f172a] text-[16px] leading-snug pr-[16px]">{question}</p>
        <div className="flex items-center justify-center size-[24px] shrink-0">
          <span className="text-[#64748b] text-[18px] transition-transform" style={{ display: "inline-block", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>▾</span>
        </div>
      </button>
      {open && (
        <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-[14px] leading-[1.6] w-full">{answer}</p>
      )}
    </div>
  );
}

export default function FaqHoTroRedesign() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="bg-[#f8fafc] flex flex-col items-start w-full min-h-screen">
      

      {/* Hero */}
      <div className="bg-[#0f172a] flex flex-col gap-[24px] items-center justify-center px-[80px] py-[80px] w-full">
        <p className="font-['Inter:Extra_Bold'] font-extrabold text-[40px] text-white text-center">Câu hỏi thường gặp</p>
        <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[18px] text-center w-[640px]">
          Tìm câu trả lời nhanh nhất cho thắc mắc của bạn về gói tập, lịch học, huấn luyện viên và các chính sách dịch vụ tại SportCenter.
        </p>
        <div className="bg-white flex gap-[16px] items-center px-[24px] py-[14px] rounded-[99px] w-[640px]">
          <span className="text-[#64748b] text-[20px]">🔍</span>
          <input
            type="text"
            placeholder="Nhập từ khóa tìm kiếm câu hỏi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 font-['Inter:Regular'] font-normal text-[#64748b] text-[16px] outline-none bg-transparent"
          />
        </div>
      </div>

      {/* FAQ Groups */}
      <div className="flex flex-col gap-[64px] items-start px-[240px] py-[80px] w-full">
        {faqGroups.map((group) => {
          const filteredItems = searchQuery.trim()
            ? group.items.filter(
                (item) =>
                  item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  item.answer.toLowerCase().includes(searchQuery.toLowerCase())
              )
            : group.items;

          if (filteredItems.length === 0) return null;

          return (
            <div key={group.title} className="flex flex-col gap-[24px] items-start w-full">
              <div className="flex flex-col gap-[8px] items-start w-full">
                <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#0f172a] text-[24px]">{group.title}</p>
                <div className={`${group.accentColor} h-[4px] rounded-[2px] w-[60px]`} />
              </div>
              <div className="flex flex-col gap-[16px] items-start w-full">
                {filteredItems.map((item) => (
                  <AccordionItem key={item.question} {...item} />
                ))}
              </div>
            </div>
          );
        })}
        {searchQuery.trim() && faqGroups.every((g) =>
          g.items.filter(
            (item) =>
              item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.answer.toLowerCase().includes(searchQuery.toLowerCase())
          ).length === 0
        ) && (
          <div className="flex flex-col gap-[16px] items-center w-full py-[40px]">
            <p className="font-['Inter:Bold'] font-bold text-[#0f172a] text-[18px]">Không tìm thấy kết quả phù hợp</p>
            <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-[15px]">Thử từ khóa khác hoặc liên hệ trực tiếp với chúng tôi bên dưới.</p>
          </div>
        )}
      </div>

      {/* Contact Support Section */}
      <div className="bg-white border-t border-[#e2e8f0] flex flex-col gap-[40px] items-center pb-[100px] pt-[80px] px-[80px] w-full">
        <div className="flex flex-col gap-[12px] items-center text-center w-full">
          <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#0f172a] text-[32px]">Vẫn chưa tìm được câu trả lời?</p>
          <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-[16px]">
            Đội ngũ hỗ trợ khách hàng của SportCenter luôn sẵn sàng trợ giúp bạn 24/7.
          </p>
        </div>
        <div className="flex gap-[24px] items-start w-full">
          {/* Chat */}
          <div className="bg-[#f8fafc] border border-[#e2e8f0] flex flex-1 flex-col gap-[20px] items-center p-[32px] rounded-[16px]">
            <div className="bg-[rgba(16,185,129,0.1)] flex items-center justify-center rounded-[12px] size-[48px]">
              <span className="text-[24px]">💬</span>
            </div>
            <div className="flex flex-col gap-[8px] items-center w-full">
              <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#0f172a] text-[18px]">Chat trực tuyến</p>
              <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-[14px] text-center">Trò chuyện trực tiếp cùng tư vấn viên</p>
            </div>
            <div className="bg-[#10b981] flex items-center px-[20px] py-[10px] rounded-[8px] cursor-pointer">
              <p className="font-['Inter:Bold'] font-bold text-[14px] text-white">Bắt đầu chat</p>
            </div>
          </div>
          {/* Phone */}
          <div className="bg-[#f8fafc] border border-[#e2e8f0] flex flex-1 flex-col gap-[20px] items-center p-[32px] rounded-[16px]">
            <div className="bg-[#eff6ff] flex items-center justify-center rounded-[12px] size-[48px]">
              <span className="text-[24px]">📞</span>
            </div>
            <div className="flex flex-col gap-[8px] items-center w-full">
              <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#0f172a] text-[18px]">Gọi hotline 1900 6868</p>
              <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-[14px] text-center">Tư vấn nhanh chóng qua tổng đài hỗ trợ</p>
            </div>
            <div className="bg-[#2563eb] flex items-center px-[20px] py-[10px] rounded-[8px] cursor-pointer">
              <p className="font-['Inter:Bold'] font-bold text-[14px] text-white">Gọi điện ngay</p>
            </div>
          </div>
          {/* Email */}
          <div className="bg-[#f8fafc] border border-[#e2e8f0] flex flex-1 flex-col gap-[20px] items-center p-[32px] rounded-[16px]">
            <div className="bg-[rgba(16,185,129,0.1)] flex items-center justify-center rounded-[12px] size-[48px]">
              <span className="text-[24px]">📧</span>
            </div>
            <div className="flex flex-col gap-[8px] items-center w-full">
              <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#0f172a] text-[18px]">Email hỗ trợ</p>
              <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-[14px] text-center">Gửi phản hồi qua mail support@sportcenter.vn</p>
            </div>
            <div className="border border-[#10b981] flex items-center px-[20px] py-[10px] rounded-[8px] cursor-pointer">
              <p className="font-['Inter:Bold'] font-bold text-[#10b981] text-[14px]">Gửi Email</p>
            </div>
          </div>
        </div>
      </div>

      
    </div>
  );
}
