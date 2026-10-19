import React, { useState } from "react";
import { Bot, Send, Sparkles, User } from "lucide-react";

interface ChatMessage {
  sender: "user" | "ai";
  text: string;
  time: string;
}

interface SupportAiChatProps {
  userName: string;
}

export const SupportAiChat: React.FC<SupportAiChatProps> = ({ userName }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: "ai",
      text: `Xin chào ${userName}! Tôi là Trợ lý AI của SportCenter. Tôi có thể hỗ trợ bạn tra cứu lịch tập, kiểm tra thông tin hoặc giải đáp các thắc mắc về kỹ thuật bài tập và dinh dưỡng thể thao. Bạn cần tôi hỗ trợ gì hôm nay?`,
      time: "08:00",
    },
  ]);
  const [inputQuestion, setInputQuestion] = useState("");

  const quickQuestions = [
    "Lịch tập của tôi xem ở đâu?",
    "Làm sao để đăng ký gói tập mới?",
    "Gợi ý thực đơn giàu đạm cho ngày tập nặng",
    "Cách giảm đau cơ sau buổi tập chân (Leg day)",
  ];

  const handleSend = (questionText: string) => {
    const q = questionText.trim();
    if (!q) return;

    const now = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    const userMsg: ChatMessage = { sender: "user", text: q, time: now };
    const lower = q.toLowerCase();

    let aiReply = "Tôi đã ghi nhận câu hỏi của bạn. ";
    if (lower.includes("lịch") || lower.includes("buổi") || lower.includes("hôm nay") || lower.includes("ngày mai")) {
      aiReply = "📅 Bạn có thể theo dõi và quản lý toàn bộ các ca học nhóm cũng như ca kèm 1-1 tại mục **Lịch tập cá nhân** trên thanh điều hướng. Tại đó bạn cũng có thể đổi ca hoặc hủy lịch trước giờ tập.";
    } else if (lower.includes("gói") || lower.includes("hạn") || lower.includes("đăng ký") || lower.includes("mua")) {
      aiReply = "💳 Để xem các gói thẻ thành viên Gym, Bơi, Yoga, Boxing đang mở đăng ký kèm ưu đãi hiện hành, bạn có thể ghé mục **Gói tập & Dịch vụ** trên menu để lựa chọn gói phù hợp nhé.";
    } else if (lower.includes("thực đơn") || lower.includes("ăn") || lower.includes("đạm") || lower.includes("dinh dưỡng")) {
      aiReply = "🥗 Gợi ý thực đơn phục hồi giàu Protein:\n• Bữa sáng: 2 quả trứng ốp la, 1 lát bánh mì đen, 1 cốc sữa chua Hy Lạp.\n• Bữa trưa: 150g ức gà áp chảo, cơm gạo lứt, bông cải xanh luộc.\n• Trước tập 1h: 1 quả chuối + 1 muỗng Whey Protein.\n• Bữa tối: 150g cá hồi hoặc thịt bò áp chảo, salad dầu oliu.";
    } else if (lower.includes("đau cơ") || lower.includes("mỏi") || lower.includes("chân") || lower.includes("giãn")) {
      aiReply = "💪 Để giảm hiện tượng đau mỏi cơ (DOMS) sau ngày tập:\n1. Dành 10-15 phút lăn bọt (Foam Roller) đùi trước và bắp chuối.\n2. Tắm nước ấm và ngâm chân để tăng tuần hoàn máu.\n3. Uống đủ 2-2.5 lít nước và bổ sung thêm Magie/BCAA nếu cần.\n4. Đi bộ nhẹ nhàng 15-20 phút thay vì nằm yên cả ngày.";
    } else {
      aiReply = `Dạ với câu hỏi "${q}", bạn có thể trao đổi trực tiếp với Huấn luyện viên hoặc gửi phiếu yêu cầu hỗ trợ (Ticket) tại tab bên cạnh để bộ phận Lễ tân & CSKH hỗ trợ bạn nhanh nhất!`;
    }

    const aiMsg: ChatMessage = { sender: "ai", text: aiReply, time: now };
    setMessages((prev) => [...prev, userMsg, aiMsg]);
    setInputQuestion("");
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col h-[560px]">
      {/* Quick questions */}
      <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto text-xs">
        <span className="font-semibold text-slate-400 shrink-0 text-[11px] flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Gợi ý câu hỏi:
        </span>
        {quickQuestions.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => handleSend(q)}
            className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:border-orange-500 hover:text-orange-600 shrink-0 transition-colors cursor-pointer text-[11px]"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4 text-xs">
        {messages.map((m, idx) => {
          const isAi = m.sender === "ai";
          return (
            <div
              key={idx}
              className={`flex gap-3 max-w-[85%] ${isAi ? "self-start" : "self-end ml-auto flex-row-reverse"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  isAi
                    ? "bg-gradient-to-tr from-orange-600 to-amber-500 text-white shadow-xs"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                }`}
              >
                {isAi ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>
              <div className="space-y-1">
                <div
                  className={`p-3.5 rounded-2xl leading-relaxed whitespace-pre-line ${
                    isAi
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-xs"
                      : "bg-orange-600 text-white rounded-tr-xs"
                  }`}
                >
                  {m.text}
                </div>
                <span className="text-[10px] text-slate-400 px-1">{m.time}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(inputQuestion); }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            placeholder="Đặt câu hỏi về dinh dưỡng, bài tập, lịch rèn luyện..."
            className="flex-1 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:border-orange-500"
          />
          <button type="submit" className="p-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white shadow-xs cursor-pointer transition-colors">
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
