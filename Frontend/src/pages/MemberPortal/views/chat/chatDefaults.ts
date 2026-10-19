import type { ChatConversation } from "./chatTypes";

export const getQuickPromptsForCategory = (conv?: ChatConversation): string[] => {
  const cat = conv?.category || (conv?.type === "class" ? "class" : "coach");
  if (cat === "coach") {
    return [
      "Thầy ơi cho em hỏi về bài tập hôm nay với ạ!",
      "Em muốn dời lịch tập ngày mai sang buổi tối được không ạ?",
      "Sau buổi tập em nên nạp thêm gì để phục hồi cơ tốt nhất ạ?",
      "Buổi tập hôm nay rất bổ ích, cảm ơn HLV nhiều ạ!"
    ];
  }
  if (cat === "manager") {
    return [
      "Chào ban quản lý, em cần tư vấn về thủ tục gia hạn thẻ tập ạ!",
      "Cho em hỏi thời gian mở cửa của trung tâm vào các ngày lễ ạ?",
      "Em muốn đăng ký thuê tủ locker cá nhân dài hạn ạ!",
      "Nhờ ban quản lý hỗ trợ em kiểm tra lịch sử thanh toán hóa đơn với ạ!"
    ];
  }
  if (cat === "member") {
    return [
      "Chiều nay bạn có qua phòng gym tập bài ngực không, tập chung nhé?",
      "Bài tập hôm nay đốt mỡ mệt thật nhưng sảng khoái ghê!",
      "Bạn tập ở chi nhánh này lâu chưa, có bí quyết gì chia sẻ không?"
    ];
  }
  return [
    "Chào cả lớp, hôm nay có ai đi tập sớm không ạ?",
    "Nhờ HLV nhắc lại giúp bài tập về nhà với ạ!",
    "Hôm nay lớp mình tập năng lượng quá, cảm ơn mọi người!"
  ];
};
