# 🚀 KẾ HOẠCH TRIỂN KHAI TINH GỌN FLOW 5 & FLOW 6 (TÍCH HỢP QUA AI MODEL API KEY)
> **Dự án:** Hệ thống Quản trị Trung tâm Thể thao Sport Center (SmartGym OS)  
> **Phương pháp tiếp cận:** Tích hợp trực tiếp qua **Google Gemini API Key** (RESTful API, không train model, 100% miễn phí).

---

## 💡 1. NGUYÊN TẮC TIẾP CẬN KỸ THUẬT (CHỈ DÙNG API KEY)

1. **Không tự huấn luyện (No Training / No Local LLM)**:
   * Toàn bộ năng lực xử lý ngôn ngữ và gợi ý bài tập được ủy quyền cho mô hình **Google Gemini 1.5 Flash** thông qua **API Key**.
   * Chi phí: **0 VNĐ** (Google cung cấp gói miễn phí 15 requests/phút, 1.500 requests/ngày).
2. **Mô hình Proxy an toàn (Backend-mediated)**:
   * **API Key được lưu duy nhất tại Backend ASP.NET Core** (`appsettings.json`).
   * Frontend (React) không giữ API Key để tránh bị lộ khi người dùng Inspect / F12 trên trình duyệt.
   * Frontend chỉ giao tiếp với Backend thông qua 2 endpoint nội bộ của hệ thống.

```text
[Frontend React (Coach / Member)]
               │
               ▼ (Gọi API nội bộ kèm JWT)
    [Backend ASP.NET Core] ─── (Cầm Gemini API Key) ───► [Google Gemini 1.5 Flash]
               │                                                    │
               ▼ (Lưu dữ liệu giáo án / ticket)                     │ (Trả lời JSON / Text)
      [Supabase Database] ◄─────────────────────────────────────────┘
```

---

## 🏋️ 2. THIẾT KẾ CHI TIẾT FLOW 5: GỢI Ý BÀI TẬP BẰNG AI (COACH COPILOT)

### 2.1. Bản chất luồng
* **Mục tiêu**: HLV nhập tiêu chí ➔ AI sinh bản nháp bài tập trong 2 giây ➔ HLV duyệt và chỉnh sửa ➔ Lưu thành giáo án chính thức cho học viên.
* **Giao diện phụ trách**: `Frontend/src/pages/CoachPortal/views/CoachAI.tsx`.

### 2.2. Luồng chạy từng bước (Step-by-step)
1. **Coach thao tác trên UI**:
   * Chọn học viên nhận bài (`memberId`).
   * Chọn môn (`Gym`, `Yoga`, `Bơi`, `Boxing`, `Cầu lông`), trình độ (`Cơ bản`, `Nâng cao`), mục tiêu (`Giảm mỡ`, `Tăng cơ`), thiết bị (`Tạ tay`, `Thảm`, `Máy tập`...).
   * Bấm nút **"✨ Tạo gợi ý bài tập"**.
2. **Frontend gọi Backend**:
   * `POST /api/workout-plans/ai-recommendation`
3. **Backend gọi Google Gemini qua API Key**:
   * Backend đóng gói câu lệnh (Prompt) và gửi HTTP POST đến Gemini API:
     `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}`
   * Yêu cầu Gemini trả về JSON Schema gồm: Tên bài tập, số hiệp (sets), số lần (reps), thời gian nghỉ, và lời khuyên tư thế.
4. **Hiển thị & Duyệt bài (Coach-in-the-loop)**:
   * Frontend nhận JSON và hiển thị bản nháp lên giao diện.
   * HLV có thể bấm sửa trực tiếp số lần/số hiệp hoặc thêm/xóa bài tập.
   * HLV bấm **"Lưu thành giáo án chính thức"** ➔ Gọi `POST /api/workout-plans` lưu vào Database Supabase thật.

### 2.3. Dữ liệu Request / Response mẫu

* **Frontend gửi Backend (`POST /api/workout-plans/ai-recommendation`)**:
  ```json
  {
    "memberId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "sport": "Gym",
    "level": "Cơ bản",
    "goal": "Giảm mỡ bụng và săn chắc cơ đùi",
    "equipment": ["Tạ tay", "Thảm tập"]
  }
  ```

* **Gemini trả về qua API Key (Backend chuyển tiếp cho Frontend)**:
  ```json
  {
    "planName": "Gym - Giảm mỡ toàn thân & Đốt calo",
    "durationMinutes": 45,
    "safetyNotes": "Khởi động kỹ khớp cổ chân và gối 5 phút trước khi tập.",
    "exercises": [
      {
        "name": "Goblet Squat với tạ đơn",
        "sets": 3,
        "reps": "12-15 lần",
        "restSeconds": 60,
        "coachTip": "Giữ thẳng lưng, gót chân áp chặt sàn."
      },
      {
        "name": "Dumbbell Romanian Deadlift",
        "sets": 3,
        "reps": "12 lần",
        "restSeconds": 60,
        "coachTip": "Đẩy hông ra sau, cảm nhận căng cơ đùi sau."
      },
      {
        "name": "Plank giữ cơ bụng",
        "sets": 3,
        "reps": "45 giây",
        "restSeconds": 45,
        "coachTip": "Gồng chặt cơ bụng, không để võng lưng."
      }
    ]
  }
  ```

---

## 🤖 3. THIẾT KẾ CHI TIẾT FLOW 6: TRỢ LÝ ẢO HỘI VIÊN (MEMBER AI ASSISTANT)

### 3.1. Bản chất luồng
* **Mục tiêu**: Trả lời tự động 24/7 câu hỏi của học viên về lịch tập cá nhân, gói tập, kỹ thuật bài tập, dinh dưỡng và điều hướng tạo Ticket Lễ tân nếu có sự cố.
* **Giao diện phụ trách**: `Frontend/src/pages/MemberPortal/views/support/SupportAiChat.tsx`.

### 3.2. Luồng chạy từng bước (Step-by-step)
1. **Member đặt câu hỏi**:
   * Nhập câu hỏi tự do hoặc bấm vào các câu hỏi gợi ý nhanh trên giao diện chat (VD: *"Hôm nay tôi có lịch tập gì không?"*).
2. **Frontend gọi Backend**:
   * `POST /api/member/ai-ask` kèm JWT Token.
3. **Backend tiêm ngữ cảnh (Context Injection) & Gọi Gemini**:
   * Backend đọc nhanh thông tin Member từ token:
     * Tên học viên: `Hồ Xuân Anh Nam`
     * Gói tập đang có: `Gói Gym 3 tháng (còn 45 ngày)`
     * Buổi tập gần nhất: `Ca Yoga 18:00 hôm nay tại Phòng 201 cùng HLV Nam`
   * Backend gửi câu hỏi + Ngữ cảnh này qua Gemini API Key.
4. **Phản hồi & Điều hướng**:
   * Gemini sinh câu trả lời cá nhân hóa bằng tiếng Việt thân thiện.
   * Kèm mã hành động (`action`):
     * Nếu hỏi về lịch tập ➔ Trả lời + Nút: `[Xem lịch tập ngay]`.
     * Nếu hỏi về sự cố / khiếu nại hoàn tiền ➔ Trả lời hướng dẫn + Nút: `[Gửi phiếu hỗ trợ cho Lễ tân]`.

---

## 👥 4. BẢNG PHÂN CHIA CÔNG VIỆC CỤ THỂ CHO 4 THÀNH VIÊN

| Người phụ trách | Công việc cụ thể cần làm | File code liên quan | Thời gian |
| :--- | :--- | :--- | :---: |
| **Phương** *(Backend Lead)* | **1.** Lấy 1 API Key từ Google AI Studio dán vào `appsettings.json`.<br>**2.** Viết class `GeminiService.cs` dùng `HttpClient` gọi Gemini REST API.<br>**3.** Tạo endpoint `POST /api/workout-plans/ai-recommendation` (Flow 5).<br>**4.** Nâng cấp `POST /api/member/ai-ask` để nhận context và gọi Gemini (Flow 6). | • `SmartGym.Api/appsettings.json`<br>• `SmartGym.Infrastructure/Services/GeminiService.cs`<br>• `SmartGym.Api/Endpoints/WorkoutPlanEndpoints.cs`<br>• `SmartGym.Api/Endpoints/MemberEndpoints.Support.cs` | **1 - 1.5 ngày** |
| **Nam** *(Frontend Lead)* | **1.** Sửa hàm `handleGenerate` trong `CoachAI.tsx` để gọi API thật của Phương thay vì mock `setTimeout`.<br>**2.** Cho phép Coach chỉnh sửa trực tiếp các ô bài tập nháp trước khi bấm "Lưu".<br>**3.** Thay hàm `askAI` trong `SupportAiChat.tsx` để gọi endpoint AI thật.<br>**4.** Thêm các nút bấm hành động (Action Links) dưới tin nhắn của Bot. | • `Frontend/src/pages/CoachPortal/views/CoachAI.tsx`<br>• `Frontend/src/pages/MemberPortal/views/support/SupportAiChat.tsx`<br>• `Frontend/src/pages/MemberPortal/services/memberData.ts` | **1 ngày** |
| **Long** *(Operations & Data)* | **1.** Viết 1 hàm query nhỏ ở Backend để lấy `Gói tập hiện tại` và `Buổi tập kế tiếp` của Member đang đăng nhập.<br>**2.** Ghép chuỗi context này vào câu hỏi gửi cho Phương gọi Gemini.<br>**3.** Kiểm tra luồng: khi bot đề xuất hỗ trợ ➔ click nút sẽ tự nhảy sang tab `SupportTickets.tsx` để gửi về sảnh Lễ tân. | • `SmartGym.Api/Endpoints/MemberEndpoints.Support.cs`<br>• `Frontend/src/pages/MemberPortal/views/support/SupportTickets.tsx` | **0.5 ngày** |
| **Thuận** *(Payment & Demo)* | **1.** Kiểm thử các kịch bản hỏi bot (Hỏi lịch, hỏi gói, hỏi thực đơn, thử hỏi các câu bậy/hack prompt).<br>**2.** Kiểm tra tính năng Fallback: khi mất mạng hoặc sai API Key thì web vẫn báo lỗi êm đẹp không bị crash.<br>**3.** Cập nhật kịch bản trình chiếu vào `DEMO_FLOW.md` để cả nhóm luyện tập trước buổi bảo vệ. | • `DEMO_FLOW.md`<br>• `docs/Project_Tracking.md` | **0.5 ngày** |

---

## 🛠️ 5. HƯỚNG DẪN CODE MẪU SẴN (COPY-PASTE READY CHO PHƯƠNG)

### Bước 1: Đăng ký API Key (Mất 1 phút)
1. Truy cập: **https://aistudio.google.com/**
2. Đăng nhập Gmail ➔ Bấm **"Get API key"** ➔ Bấm **"Create API key"**.
3. Copy chuỗi Key (dạng: `AIzaSyD...`).

### Bước 2: Dán Key vào `SmartGym.Api/appsettings.json`
```json
{
  "Gemini": {
    "ApiKey": "AIzaSyD_DÁN_KEY_CỦA_BẠN_VÀO_ĐÂY",
    "Model": "gemini-1.5-flash"
  }
}
```

### Bước 3: Code mẫu C# gọi Gemini REST API (`GeminiService.cs`)
```csharp
using System.Net.Http;
using System.Text;
using System.Text.Json;

public class GeminiService
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;

    public GeminiService(HttpClient httpClient, IConfiguration config)
    {
        _httpClient = httpClient;
        _apiKey = config["Gemini:ApiKey"] ?? "";
    }

    public async Task<string> CallGeminiAsync(string prompt, bool jsonMode = false)
    {
        if (string.IsNullOrEmpty(_apiKey)) 
            return "{\"message\": \"API Key chưa được cấu hình.\"}";

        var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={_apiKey}";
        
        var requestBody = new
        {
            contents = new[]
            {
                new { parts = new[] { new { text = prompt } } }
            },
            generationConfig = jsonMode ? new { response_mime_type = "application/json" } : null
        };

        var content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");
        var response = await _httpClient.PostAsync(url, content);

        if (!response.IsSuccessStatusCode)
            return "Hệ thống AI đang bận, vui lòng thử lại sau.";

        var responseJson = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(responseJson);
        
        return doc.RootElement
            .GetProperty("candidates")[0]
            .GetProperty("content")
            .GetProperty("parts")[0]
            .GetProperty("text")
            .GetString() ?? "";
    }
}
```

---

## 🏁 6. TÓM TẮT TIẾN ĐỘ THỰC HIỆN
* **Tổng thời gian hoàn thiện**: **2 ngày làm việc**.
* **Độ phức tạp**: **Thấp - Trung bình** (chỉ gọi 1 API HTTP POST từ Backend).
* **Kết quả**: Biến hệ thống thành ứng dụng thông minh có tính tương tác thật 100%, bảo mật tuyệt đối và ghi điểm tối đa với Hội đồng chấm thi.
