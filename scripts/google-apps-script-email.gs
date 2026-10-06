/**
 * ============================================================================
 * GOOGLE APPS SCRIPT — GỬI EMAIL THÔNG BÁO ĐƠN HÀNG & LƯU GOOGLE SHEETS TỰ ĐỘNG
 * Dành cho Website: Yến Sào Hà Mi (https://yenhami.vercel.app)
 * ============================================================================
 *
 * HƯỚNG DẪN CÀI ĐẶT NHANH (2 PHÚT):
 * 1. Mở https://script.google.com (hoặc mở 1 file Google Sheets -> Tiện ích mở rộng -> Apps Script).
 * 2. Xóa mã mặc định và dán toàn bộ đoạn mã này vào file Code.gs.
 * 3. Bấm nút "Triển khai" (Deploy) ở góc trên bên phải -> Chọn " Tùy chọn triển khai mới" (New deployment).
 * 4. Ở mục "Chọn loại" (Select type - biểu tượng bánh răng), chọn "Ứng dụng web" (Web app):
 *    - Thực thi dưới dạng (Execute as): Chọn "Tôi" (Me)
 *    - Ai có quyền truy cập (Who has access): Chọn "Bất kỳ ai" (Anyone)
 * 5. Bấm "Triển khai" (Deploy) -> Cấp quyền Gmail/Sheets -> Sao chép đường dẫn "URL ứng dụng web"
 *    (có dạng: https://script.google.com/macros/s/AKfycb.../exec).
 * 6. Dán URL đó vào mục "Google Apps Script Webhook URL" trong trang Quản trị:
 *    https://yenhami.vercel.app/quan-tri -> Cài đặt Email & Zalo -> Bấm "Gửi thử thông báo ngay".
 */

function doPost(e) {
  try {
    var rawBody = e && e.postData && e.postData.contents ? e.postData.contents : "{}";
    var data = JSON.parse(rawBody);
    var p = data.payload || {};

    var recipientEmail = data.to || "admin@lehami.vn";
    var referenceCode = p.referenceCode || "TEST-ORDER";
    var subject =
      data.subject ||
      "[Yến Sào Hà Mi] Đơn đặt món mới #" + referenceCode + " — " + (p.buyerName || "Khách hàng");

    var htmlBody =
      data.html ||
      '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #BD9342; border-radius: 12px; overflow: hidden;">' +
        '<div style="background-color: #155132; color: #FFFCF4; padding: 18px 24px;">' +
          '<p style="margin: 0; font-size: 12px; color: #BD9342; text-transform: uppercase; letter-spacing: 1px;">YẾN SÀO HÀ MI — THÔNG BÁO ĐƠN ĐẶT MÓN MỚI</p>' +
          '<h2 style="margin: 6px 0 0 0; font-size: 20px;">Mã đơn: #' + referenceCode + '</h2>' +
        '</div>' +
        '<div style="padding: 20px 24px; background-color: #FFFCF4; color: #1d2327; font-size: 14px; line-height: 1.6;">' +
          '<p><strong>Khách đặt:</strong> ' + (p.buyerName || "") + ' — <a href="tel:' + (p.buyerPhone || "") + '">' + (p.buyerPhone || "") + '</a></p>' +
          '<p><strong>Người nhận:</strong> ' + (p.recipientName || "") + ' (' + (p.recipientPhone || "") + ')</p>' +
          '<p><strong>Mục đích đơn:</strong> ' + (p.orderPurpose === "GIFT" ? "Quà biếu tặng" : "Mua dùng") + '</p>' +
          '<p><strong>Địa chỉ giao:</strong> ' + (p.addressDetail || "") + '</p>' +
          '<p><strong>Lịch giao yêu cầu:</strong> ' + (p.requestedDate || "") + ' (' + (p.slotLabel || "") + ')</p>' +
          '<hr style="border: none; border-top: 1px dashed #BD9342; margin: 14px 0;" />' +
          '<p><strong>Danh sách món đặt:</strong><br/>' + (p.itemsSummary || data.text || "") + '</p>' +
          (p.giftMessage ? '<p style="background: #fff; padding: 10px; border-left: 3px solid #BD9342;"><strong>Lời chúc trên thiệp:</strong> “' + p.giftMessage + '”</p>' : '') +
          '<p style="font-size: 16px; color: #155132;"><strong>Tổng thanh toán: ' + Number(p.totalVnd || 0).toLocaleString("vi-VN") + 'đ</strong> (' + (p.shippingFeeNote || "") + ')</p>' +
        '</div>' +
        '<div style="background-color: #f6f7f7; padding: 12px 24px; font-size: 12px; color: #50575e; text-align: center;">' +
          'Quản lý và xác nhận đơn tại: <a href="https://yenhami.vercel.app/quan-tri" style="color: #155132; font-weight: bold;">https://yenhami.vercel.app/quan-tri</a>' +
        '</div>' +
      '</div>';

    // 1. Gửi Email thông báo tới chủ thương hiệu
    MailApp.sendEmail({
      to: recipientEmail,
      subject: subject,
      body: data.text || subject,
      htmlBody: htmlBody,
      name: "Bếp Yến Sào Hà Mi"
    });

    // 2. Tự động ghi vào Google Sheets nếu Script được gắn với 1 file Google Sheets
    try {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      if (ss) {
        var sheet = ss.getSheetByName("DonHangHaMi") || ss.insertSheet("DonHangHaMi");
        if (sheet.getLastRow() === 0) {
          sheet.appendRow([
            "Thời gian tạo",
            "Mã đơn",
            "Loại đơn",
            "Người đặt",
            "SĐT đặt",
            "Người nhận",
            "SĐT nhận",
            "Địa chỉ giao",
            "Ngày giao",
            "Khung giờ",
            "Món đặt",
            "Lời chúc thiệp",
            "Tổng tiền (VNĐ)"
          ]);
        }
        sheet.appendRow([
          new Date(),
          referenceCode,
          p.orderPurpose === "GIFT" ? "Quà tặng" : "Mua dùng",
          p.buyerName || "",
          p.buyerPhone || "",
          p.recipientName || "",
          p.recipientPhone || "",
          p.addressDetail || "",
          p.requestedDate || "",
          p.slotLabel || "",
          p.itemsSummary || "",
          p.giftMessage || "",
          p.totalVnd || 0
        ]);
      }
    } catch (sheetErr) {
      // Bỏ qua nếu chạy dưới dạng Standalone Script không gắn Google Sheet
    }

    return ContentService.createTextOutput(
      JSON.stringify({ ok: true, message: "Email sent to " + recipientEmail })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ ok: false, error: String(err) })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Hàm chạy thử trực tiếp trong trình soạn thảo Google Apps Script
 * (Bấm nút "Chạy / Run" hàm testSendOrderEmail để cấp quyền Gmail ngay lần đầu)
 */
function testSendOrderEmail() {
  var myEmail = Session.getActiveUser().getEmail() || "admin@lehami.vn";
  MailApp.sendEmail({
    to: myEmail,
    subject: "[Yến Sào Hà Mi] Kiểm tra kết nối Google Apps Script thành công",
    htmlBody: "<p>Xin chào, kết nối gửi Email tự động từ <strong>Yến Sào Hà Mi</strong> qua Google Apps Script đã hoạt động!</p>",
    name: "Bếp Yến Sào Hà Mi"
  });
}
