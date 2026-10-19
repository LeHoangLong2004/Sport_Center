# Hướng Dẫn Quy Trình Git & Tránh Conflict Cho Nhóm (SWP391)

Tài liệu chuẩn dành cho 4 thành viên: **Phương, Nam, Long, Thuận**.

---

## 1. Thiết lập 1 lần trên máy mỗi thành viên
Mỗi bạn trong nhóm khi mở terminal trong project chỉ cần chạy 1 dòng lệnh này để cấu hình chống conflict:

```bash
git config --local pull.rebase true && git config --local rerere.enabled true && git config --local merge.conflictstyle zdiff3 && git config --local branch.autosetuprebase always && git config --local core.autocrlf true
```

* **`pull.rebase = true`**: Khi pull code, Git sẽ tự động đặt các commit mới của bạn lên đỉnh lịch sử, không sinh commit merge chéo rác.
* **`rerere.enabled = true`**: Git tự động ghi nhớ cách xử lý conflict, lần sau gặp lại tự động giải quyết.
* **`merge.conflictstyle = zdiff3`**: Hiển thị rõ đoạn code gốc để biết ai sửa gì.
* **`core.autocrlf = true`**: Tự động chuẩn hóa dấu xuống dòng giữa Windows và macOS/Linux.

---

## 2. Quy trình làm việc hàng ngày (3 bước chuẩn)

### Bước 1: Trước khi bắt đầu code
Luôn kéo code mới nhất từ nhánh `main` về nhánh của mình:
```bash
git checkout Phuong       # (hoặc nhánh của bạn: Long, NamV2, Thuan)
git pull origin main
```

### Bước 2: Trong khi code
* **Phân chia thư mục rõ ràng**: Không 2 người cùng sửa 1 file component nếu không cần thiết.
* **Giữ file dưới 200–300 dòng**: Tách nhỏ các modal, cards, endpoints để giảm tối đa xác suất dẫm chân lên nhau.

### Bước 3: Khi hoàn thành tính năng & muốn đẩy lên
```bash
# 1. Lưu thay đổi
git add .
git commit -m "feat: mô tả việc vừa làm"

# 2. Kéo code main mới nhất về kiểm tra
git pull origin main

# 3. Đẩy lên nhánh cá nhân trên GitHub
git push origin Phuong    # (hoặc nhánh của bạn)

# 4. Lên GitHub mở Pull Request (PR) để gộp vào main
```

---

## 3. Cách xử lý khi gặp Conflict (nếu có)
1. Trong VS Code sẽ hiện các nút:
   * **Accept Current Change**: Giữ code của bạn.
   * **Accept Incoming Change**: Lấy code của bạn bè vừa đẩy lên.
   * **Accept Both Changes**: Giữ cả 2 đoạn code.
2. Sau khi chọn xong, chạy:
   ```bash
   git add .
   git rebase --continue    # (hoặc git commit nếu đang merge)
   git push origin <tên-nhánh>
   ```
