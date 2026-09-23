# SmartGym API

ASP.NET Core Web API demo for SmartGym OS — Sports Center Management System.

## Run

```powershell
dotnet run --project SmartGym.Api
```

Open the URL printed by `dotnet run` to access Swagger UI.

## Demo Accounts

All demo accounts use the same password:

```text
Password@123
```

| Role | Email |
| --- | --- |
| CenterManager | manager@smartgym.local |
| Receptionist | receptionist@smartgym.local |
| Coach | coach@smartgym.local |
| Coach | coach2@smartgym.local |
| Member | member@smartgym.local |

## API Endpoints

### Authentication

```http
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/logout
POST /api/auth/forgot-password
POST /api/auth/reset-password
POST /api/auth/request-email-verification
POST /api/auth/verify-email
```

### Class Booking (FR-008, BR-004, BR-005)

```http
GET    /api/classes              # Danh sách lớp học (?sport=Yoga&date=2026-09-22)
GET    /api/classes/{id}         # Chi tiết lớp học
POST   /api/bookings            # Đặt chỗ (Member, Receptionist)
DELETE /api/bookings/{id}        # Hủy đặt chỗ
GET    /api/bookings/my          # Lịch sử đặt chỗ của tôi
GET    /api/schedule/my          # Lịch cá nhân (Member/Coach)
```

### Check-in (FR-016, BR-007)

```http
POST /api/checkin                # Check-in vào cổng
GET  /api/checkin/history        # Lịch sử check-in
```

### Member Packages

```http
GET /api/packages/my             # Xem gói tập của tôi
GET /api/packages/plans          # Danh sách gói tập có sẵn
```

## Authentication

Use Swagger UI's **Authorize** button (🔓) to set your JWT token:

1. Call `POST /api/auth/login` with email and password.
2. Copy the `accessToken` from the response.
3. Click **Authorize** → paste the token → **Authorize**.

## Business Rules Implemented

| Code | Rule | Description |
| --- | --- | --- |
| BR-004 | Chính sách đặt/hủy | Đặt: 30 phút–7 ngày trước. Hủy muộn (<2h) = trừ buổi tập. |
| BR-005 | Sức chứa & Waitlist | Tự động Waitlist khi đầy (tối đa 5 người). Đôn lên khi có người hủy. |
| BR-006 | Xung đột lịch | Chặn trùng lịch HLV và phòng tập. |
| BR-007 | Check-in vào cổng | Kiểm tra gói ACTIVE, khung giờ (Off-Peak < 16:00), còn buổi. |

## Non-Functional Requirements Implemented

| Code | Requirement | Description |
| --- | --- | --- |
| NFR-006 | RBAC | Kiểm tra Role trên từng API endpoint. |
| NFR-016 | API Docs | Swagger UI với JWT Bearer support. |
| NFR-018 | Rate Limiting | 100 requests/phút/IP. |
