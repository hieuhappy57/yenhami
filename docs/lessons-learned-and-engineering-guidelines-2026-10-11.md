# BÁO CÁO TỔNG KẾT & QUY TẮC PHÒNG NGỪA LỖI (LESSONS LEARNED & ENGINEERING GUIDELINES)
*Ngày lập: 11/10/2026 - Dự án Yến Sào Hà Mi Đà Nẵng*

Tài liệu này ghi lại toàn bộ các nguyên nhân gốc rễ (Root Causes) của các lỗi phát sinh trong ngày 11/10/2026 và thiết lập các **Nguyên tắc kỹ thuật bất khả xâm phạm** nhằm ngăn chặn triệt để việc tái diễn.

---

## I. TỔNG HỢP CÁC LỖI ĐÃ PHÁT SINH & NGUYÊN NHÂN GỐC RỄ

### 1. Lỗi DB Seeding đè dữ liệu thật (Lỗi Ghim bài viết không lưu)
- **Hiện tượng:** Admin bấm ghim bài viết, báo thành công nhưng tải lại trang hoặc ra ngoài web thì bài viết vẫn không được ghim.
- **Nguyên nhân gốc:** Hàm khởi tạo DB `initSqliteDb()` chạy câu lệnh seeding định kỳ với `ON CONFLICT(id) DO UPDATE SET is_pinned = excluded.is_pinned`. Cứ mỗi khi có request tải trang, DB lại tự động reset trường `is_pinned` về dữ liệu mẫu trong code, xóa sạch thay đổi của nhân viên.
- **Biện pháp khắc phục đã áp dụng:** Đổi toàn bộ câu lệnh seeding sang `ON CONFLICT(id) DO NOTHING`.

### 2. Lỗi xung đột ID & Slug Constraint (`UNIQUE constraint failed: posts.slug`)
- **Hiện tượng:** Lưu bài viết bị báo lỗi máy chủ 500 hoặc thất bại ngầm.
- **Nguyên nhân gốc:** Dữ liệu mẫu Admin dùng ID `post-1`, trong khi DB dùng ID `post-seo-1`. Khi gửi cập nhật, backend tưởng là bài viết mới với ID khác nên cố INSERT dòng mới với cùng `slug`, gây lỗi khóa trùng lặp slug.
- **Biện pháp khắc phục đã áp dụng:** Chuẩn hóa ID đồng bộ giữa Admin và DB; tại Backend tra cứu thông minh `SELECT id FROM posts WHERE id = ? OR slug = ?` trước khi ghi để đảm bảo tính lũy thoái (idempotent).

### 3. Lỗi Cache Next.js không cập nhật ngoài web
- **Hiện tượng:** Dữ liệu đã lưu vào database thành công nhưng người dùng truy cập trang chủ `/` hoặc `/bai-viet` vẫn thấy nội dung cũ.
- **Nguyên nhân gốc:** Các API CMS / Order / Catalog không gọi hàm `revalidatePath()` của Next.js sau khi ghi dữ liệu.
- **Biện pháp khắc phục đã áp dụng:** Bổ sung `revalidatePath` ngay lập tức cho các route liên quan (`/`, `/bai-viet`, `/bai-viet/[slug]`, `/san-pham/[slug]`).

### 4. Lỗi chỉ lưu Demo LocalStorage thay vì Database Server
- **Hiện tượng:** Các thao tác duyệt đơn, cập nhật trạng thái chỉ biến đổi bộ nhớ trình duyệt hoặc ghi vào demo, khi người khác đăng nhập hoặc mở tab ẩn danh thì không thấy.
- **Nguyên nhân gốc:** Mã JavaScript frontend ở admin chưa được kết nối trọn vẹn với các API endpoint (`/api/admin/orders`, `/api/admin/cms`).
- **Biện pháp khắc phục đã áp dụng:** Chuyển đổi 100% các nút thao tác sang luồng API-First (gửi request đến Backend -> lưu DB -> đồng bộ Cloud -> mới cập nhật UI).

### 5. Lệch pha giữa 3 file Admin Mirror
- **Hiện tượng:** Sửa `public/admin.html` nhưng không đồng bộ sang `public/admin-demo.html` và `demo/admin/index.html`.
- **Biện pháp khắc phục đã áp dụng:** Luôn áp dụng quy trình kiểm tra mã băm SHA-256 sau mỗi lần chỉnh sửa giao diện admin.

### 6. Sai lệch tham số nghiệp vụ thực tế (Thời gian cảnh báo bếp)
- **Hiện tượng:** Tự động quy định cảnh báo xanh dưới 15 phút, trong khi thực tế quy trình chưng yến nóng thủ công cần 20 - 25 phút.
- **Nguyên nhân gốc:** Giả định chủ quan thay vì bám sát quy trình chế biến thực tế của bếp.
- **Biện pháp khắc phục đã áp dụng:** Điều chỉnh chuẩn xác theo chỉ đạo thực tế: Xanh < 22 phút, Vàng 22 - 30 phút, Đỏ > 30 phút.

---

## II. 6 QUY TẮC BẤT KHẢ XÂM PHẠM TRONG PHÁT TRIỂN TIẾP THEO

### Quy tắc 1: Tuyệt đối không ghi đè dữ liệu người dùng khi Seeding (Zero-Overwrite Seed)
- Mọi câu lệnh insert dữ liệu mẫu/mặc định (bài viết, sản phẩm, cài đặt) vào database CHỈ ĐƯỢC DÙNG `ON CONFLICT(id) DO NOTHING`.
- Không bao giờ dùng `ON CONFLICT DO UPDATE` với các trường thông tin mà nhân viên quản trị có thể thay đổi (`is_pinned`, `is_published`, `price_vnd`, `content`,...).

### Quy tắc 2: Kiến trúc API-First — Không lưu ảo trên trình duyệt
- Bất kỳ nút bấm thay đổi trạng thái nào (Duyệt đơn, Chuyển bếp, Chốt ship, Thu tiền, Hoàn tiền, Đổi bài viết, Ghim bài) đều PHẢI gửi request HTTP đến Backend và nhận phản hồi `ok: true` từ Server mới được coi là thành công.
- Nếu server trả lỗi, UI phải rollback lại trạng thái cũ và báo lỗi rõ ràng cho nhân viên.

### Quy tắc 3: Luôn Revalidate Cache Next.js khi đột biến dữ liệu (Mutation)
- Mọi API route thực hiện POST / PUT / PATCH / DELETE làm thay đổi dữ liệu công khai phải gọi `revalidatePath(...)` ngay sau khi lưu DB.
- Bao gồm: bài viết (`/bai-viet`, `/`), sản phẩm (`/san-pham/[slug]`, `/`), thông tin cửa hàng (`/`).

### Quy tắc 4: Đồng bộ triple-mirror cho file Admin
- `public/admin.html`, `public/admin-demo.html`, và `demo/admin/index.html` phải luôn có cùng mã băm SHA-256 (`shasum -a 256`).

### Quy tắc 5: Tôn trọng tham số vận hành thực tế
- Không tự suy diễn thời gian chưng bếp, phí ship, hạn mức hay quy trình thanh toán. Luôn xác nhận với quy trình thực tế của thương hiệu Hà Mi.

### Quy tắc 6: Kiểm thử E2E trước khi bàn giao
- Trước khi thông báo hoàn tất bất kỳ tính năng nào, bắt buộc phải chạy:
  1. `npm test` (Đạt 75/75 test cases)
  2. `node --test scripts/review-admin-release.mjs`
  3. `node --test tests/admin-demo.test.ts`
  4. `npm run build` (Next.js production build 0 lỗi)
  5. Thử nghiệm thực tế luồng tương tác từ Admin -> DB -> Trang hiển thị ngoài web.
