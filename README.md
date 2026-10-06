# Website Yến Sào Hà Mi — Bản MVP Đầu Tiên (`ha-mi-website`)

Dự án website thương hiệu **Yến Sào Hà Mi** với dòng sản phẩm chủ lực **Yến Tươi Chưng Nóng** (“Chưng điều lành, trao người thương”).

> **Phạm vi hiện tại:** Bản **Local Demo / MVP** phục vụ kiểm thử luồng đặt món — xác nhận đơn trên máy cục bộ (`http://127.0.0.1:3005`). Website **chưa deploy public**, **chưa mua/trỏ domain**, **chưa thu tiền trực tuyến** và **chưa kết nối gửi tin nhắn thật**.

---

## 1. Kiến trúc & Công nghệ

- **Framework:** Next.js 16.2.6 (App Router) + React 19 + TypeScript
- **Bundler:** Chạy với cờ `--webpack` (`next dev --webpack` / `next build --webpack`) để tương thích ổn định với module native `node:sqlite` trên Node.js v26.
- **Styling:** Tailwind CSS v4 (bảng màu chuẩn nhận diện: Xanh rừng `#155132`, Vàng kem ngà `#FFFCF4`, Vàng kim tiết chế `#BD9342`, Nền trắng `#FFFFFF`).
- **Cơ sở dữ liệu cục bộ (Local Persistence):** SQLite tích hợp sẵn trong Node (`node:sqlite` / `DatabaseSync` chế độ WAL + `BEGIN IMMEDIATE TRANSACTION`) kết hợp định nghĩa schema tại `db/schema.ts`. Dữ liệu lưu tại `data/hami.sqlite`.
- **Kiểm thử tự động:** Node Test Runner (`npm test` thực thi `tests/mvp.test.ts`).

---

## 2. Hướng dẫn chạy & Kiểm thử Local

```bash
cd "/Users/hieunguyen/Documents/HÀ MI/ha-mi-website"

# 1. Cài đặt dependencies (nếu cần)
npm install

# 2. Chạy dev server (mặc định dùng --webpack)
npm run dev -- -p 3005

# 3. Kiểm tra kiểu TypeScript (lưu ý: lệnh lint trong MVP hiện chạy tsc --noEmit để typecheck)
npm run lint

# 4. Chạy bộ test tự động 7 nhóm quy tắc nghiệp vụ tại server
npm test

# 5. Kiểm tra build production (tách thư mục để không tranh lock khi dev server đang mở)
NEXT_DIST_DIR=.next-build npm run build && rm -rf .next-build
```

- **URL Local đang chạy:** `http://127.0.0.1:3005`
- **Trang Quản trị nhân viên (Staff Admin):** `http://127.0.0.1:3005/quan-tri`
  - Tài khoản mặc định: `hami_staff`
  - Mật khẩu mặc định: `HaMi@2026!` (có thể đổi qua biến môi trường `HAMI_ADMIN_PASSWORD`)

---

## 3. Các trang & Luồng nghiệp vụ trong MVP

1. **Trang chủ (`/`)**:
   - Hero full-bleed hiển thị chữ trực tiếp trên vùng nền sáng của ảnh, giữ nguyên bản logo gốc Yến Sào Hà Mi và thấy rõ thố sứ Yến Tươi Chưng Nóng trên cả Mobile (`360px`/`390px`), Tablet (`768x1024`) và Desktop (`1440px`).
   - Menu 8 món xuất hiện ngay sau Hero kèm bộ lọc theo nhóm khẩu vị.
2. **Trang Dòng sản phẩm (`/yen-tuoi-chung-nong`)** và **Chi tiết món (`/san-pham/[slug]`)**:
   - Hiển thị bảng thành phần, khẩu vị, dung tích thố sứ 200ml, hướng dẫn dùng ấm, bảo quản và lưu ý đối tượng sử dụng.
   - Hỗ trợ chọn hình thức chuẩn bị (Thố tiêu chuẩn / Hộp quà + Thiệp) và độ ngọt.
3. **Luồng Giỏ hàng & Gửi yêu cầu đặt món (`/dat-hang` và `/gio-hang`)**:
   - Thực hiện 6 bước: **Chọn khu vực giao $\rightarrow$ Chọn món & khẩu vị $\rightarrow$ Chọn ngày & khung giờ ca bếp $\rightarrow$ Thông tin người mua / người nhận & thiệp quà $\rightarrow$ Kiểm tra tạm tính từ server $\rightarrow$ Gửi yêu cầu**.
   - Không thu tiền tự động hoặc báo xác nhận giao ngay khi chưa có nhân viên Hà Mi xác nhận.
4. **Trang Đã nhận yêu cầu & Tra cứu bảo mật (`/yeu-cau-da-nhan`)**:
   - Hiển thị trạng thái **“Đã nhận yêu cầu, Hà Mi sẽ xác nhận đơn”** (`PENDING_CONFIRMATION`) kèm mã tham chiếu (`HM-YYMMDD-XXXXXXXX`) và mã bảo mật tra cứu (`lookupToken`).
   - Bảo mật tra cứu: API `GET /api/orders` và `getOrderRequestByReference` chỉ trả thông tin đơn khi khớp `lookupToken` hoặc có phiên đăng nhập nhân viên (`isStaff`), trả `404` nếu không có hoặc sai token.
5. **Cụm 3 nút hành động cố định cạnh phải (`FloatingActionRail`)**:
   - Xếp dọc cố định bên phải màn hình khi cuộn trên cả desktop và mobile theo thứ tự: **Đặt hàng $\rightarrow$ Zalo $\rightarrow$ Messenger**.
   - Nút **Zalo** và **Messenger** đọc URL từ `NEXT_PUBLIC_HAMI_ZALO_URL` và `NEXT_PUBLIC_HAMI_MESSENGER_URL`. Khi chưa cấu hình URL chính thức, hiển thị thông báo rõ trạng thái `UNCONFIGURED` (không tự đoán số điện thoại, không mở link giả, không tự bật popup).
6. **Trang Quản trị nhân viên (`/quan-tri`) & Giới hạn trong MVP**:
   - **Đã có trên UI:** Đăng nhập nhân viên, xem danh sách yêu cầu đặt món, cập nhật trạng thái đơn (`PENDING_CONFIRMATION` $\rightarrow$ `CONFIRMED` $\rightarrow$ `PREPARING` $\rightarrow$ `DELIVERING` $\rightarrow$ `COMPLETED` / `CANCELLED`), cập nhật trạng thái thanh toán, nhập phí giao thực tế đã xác nhận, xem lịch sử chuyển trạng thái (`order_status_history`), bật/tắt trạng thái phục vụ của từng món (`AVAILABLE` / `OUT_OF_STOCK` / `PENDING_DATA_APPROVAL`), và **xem số lượng thố đã đặt trên tổng công suất của từng ca bếp**.
   - **Giới hạn hiện tại trên UI:** Màn hình quản trị ca bếp trên `/quan-tri` hiện chỉ ở chế độ **xem capacity** (`Đã đặt X/Y thố`), chưa làm form chỉnh sửa trực tiếp công suất/khóa ca trên giao diện (dù API `PATCH /api/admin/catalog` đã có nhánh hỗ trợ ở tầng server).

---

## 4. Quy tắc kiểm tra tại Server (`db/index.ts`)

- **Chống sửa giá từ client (`PRICE_TAMPERED`):** Mọi đơn giá món, phụ phí hộp quà và phí giao đều được tính lại tại server (`calculateServerQuote`).
- **Quản lý năng lực ca bếp độc lập theo từng ngày (`slot_date_reservations`):** Hạn mức số thố mỗi ca (`maxCapacityBowls`) được theo dõi riêng theo cặp `(requestedDate, slotId)`. Khi nhân viên chuyển đơn sang trạng thái `CANCELLED`, số thố tự động được hoàn trả lại cho đúng `(requestedDate, slotId)` đó.
- **Kiểm tra ngày lịch thực & Lead-time theo múi giờ `Asia/Ho_Chi_Minh`:** Chặn ngày không tồn tại (`2026-02-30` $\rightarrow$ `INVALID_DATE`), chặn ngày quá khứ (`PAST_DATE`), chặn ca đã qua trong ngày (`PAST_SLOT`) và chặn ca không đủ thời gian chuẩn bị tối thiểu (`INSUFFICIENT_LEAD_TIME`).
- **Chống gửi trùng (`idempotencyKey`):** Giao dịch `BEGIN IMMEDIATE TRANSACTION` đảm bảo gửi lặp với cùng `idempotencyKey` chỉ trả lại đơn đã tạo mà không trừ lặp chỗ trong ca bếp.

---

## 5. Giới hạn Dữ liệu Mẫu (DEMO Fixtures) & Hạng mục chờ chốt trước khi mở bán thật

Trước khi tắt `isDemoMode` và xuất bản thật, Chủ thương hiệu & đội Vận hành (Ops) cần cung cấp và phê duyệt:

1. **Thông tin liên hệ & Pháp nhân chính thức (hiện đang để trống / chờ cấu hình):**
   - URL Zalo OA chính thức (`NEXT_PUBLIC_HAMI_ZALO_URL`)
   - URL Fanpage Messenger chính thức (`NEXT_PUBLIC_HAMI_MESSENGER_URL`)
   - Số Hotline hiển thị & gọi (`NEXT_PUBLIC_HAMI_HOTLINE_DISPLAY`, `NEXT_PUBLIC_HAMI_HOTLINE_TEL`)
   - Địa chỉ bếp/điểm giao nhận và thông tin hộ kinh doanh/pháp nhân (`NEXT_PUBLIC_HAMI_ADDRESS`, `NEXT_PUBLIC_HAMI_LEGAL`)
2. **Giá bán chính thức & Ảnh chụp sản phẩm thật:**
   - Giá 8 món và phụ phí hộp quà trong `db/demo-fixtures.ts` hiện là **Giá mẫu** dùng để kiểm thử luồng tính tiền.
   - Ảnh các món trong `public/brand/dishes/*.jpg` và ảnh Hero hiện gắn nhãn **Ảnh minh họa**; cần thay bằng ảnh chụp sản phẩm thật của bếp Hà Mi.
3. **SOP Vận hành Bếp & Giao nhận:**
   - Chốt danh sách quận/phường giao nóng tại Đà Nẵng, biểu phí ship thực tế từng khu vực, thời gian chuẩn bị tối thiểu (`leadTimeMinutes`) và số lượng thố tối đa mỗi ca bếp (`maxCapacityBowls`).
4. **Linting mở rộng:**
   - Hiện tại `npm run lint` chỉ thực thi kiểm tra kiểu tĩnh (`tsc --noEmit`). Có thể bổ sung thêm cấu hình ESLint ruleset ở chặng tiếp theo nếu cần.
