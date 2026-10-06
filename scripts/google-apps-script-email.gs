/**
 * ============================================================================
 * GOOGLE APPS SCRIPT — GỬI EMAIL CHI TIẾT ĐƠN HÀNG (HỖ TRỢ 2+ EMAIL) & LƯU GOOGLE SHEETS
 * Dành cho Website: Yến Sào Hà Mi (https://yenhami.vercel.app)
 * ============================================================================
 *
 * HƯỚNG DẪN CÀI ĐẶT NHANH (2 PHÚT):
 * 1. Mở https://script.google.com (hoặc mở 1 file Google Sheets -> Tiện ích mở rộng -> Apps Script).
 * 2. Xóa mã mặc định và dán toàn bộ đoạn mã này vào file Code.gs.
 * 3. Bấm nút "Triển khai" (Deploy) ở góc trên bên phải -> Chọn "Tùy chọn triển khai mới" (New deployment).
 * 4. Ở mục "Chọn loại" (Select type - biểu tượng bánh răng), chọn "Ứng dụng web" (Web app):
 *    - Thực thi dưới dạng (Execute as): Chọn "Tôi" (Me)
 *    - Ai có quyền truy cập (Who has access): Chọn "Bất kỳ ai" (Anyone)
 * 5. Bấm "Triển khai" (Deploy) -> Cấp quyền Gmail/Sheets -> Sao chép đường dẫn "URL ứng dụng web"
 *    (có dạng: https://script.google.com/macros/s/AKfycb.../exec).
 * 6. Dán URL đó vào mục "Google Apps Script Web App URL" trong trang Quản trị:
 *    https://yenhami.vercel.app/quan-tri -> Cài đặt Email & Zalo -> Điền 1 hoặc 2 Email nhận đơn -> Bấm "Gửi thử thông báo ngay".
 */

function buildOrderItemsTableHtml(p) {
  var items = p.items || [];
  var rowsHtml = "";
  if (items.length > 0) {
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      rowsHtml +=
        '<tr>' +
          '<td style="padding: 10px 8px; border-bottom: 1px solid #e5e0d0; text-align: center; font-size: 13px;">' + (i + 1) + '</td>' +
          '<td style="padding: 10px 8px; border-bottom: 1px solid #e5e0d0; font-size: 13px;">' +
            '<strong style="color: #155132;">' + (it.productName || "") + '</strong><br/>' +
            '<span style="font-size: 12px; color: #50575e;">Quy cách: ' + (it.variantName || "") + ' (' + (it.volumeMl || 0) + 'ml) • Vị: <strong>' + (it.selectedOption || "") + '</strong></span>' +
            (it.ingredientsText ? '<br/><span style="font-size: 11px; color: #8A6632;">Thành phần: ' + it.ingredientsText + '</span>' : '') +
          '</td>' +
          '<td style="padding: 10px 8px; border-bottom: 1px solid #e5e0d0; text-align: center; font-weight: bold; font-size: 13px;">x' + (it.quantity || 1) + '</td>' +
          '<td style="padding: 10px 8px; border-bottom: 1px solid #e5e0d0; text-align: right; font-size: 13px;">' + Number(it.unitPriceVnd || 0).toLocaleString("vi-VN") + 'đ</td>' +
          '<td style="padding: 10px 8px; border-bottom: 1px solid #e5e0d0; text-align: right; font-weight: bold; color: #155132; font-size: 13px;">' + Number(it.lineTotalVnd || 0).toLocaleString("vi-VN") + 'đ</td>' +
        '</tr>';
    }
  } else {
    rowsHtml = '<tr><td colspan="5" style="padding: 12px; font-size: 13px;">' + (p.itemsSummary || "Chưa có chi tiết món") + '</td></tr>';
  }
  return rowsHtml;
}

function doPost(e) {
  try {
    var rawBody = e && e.postData && e.postData.contents ? e.postData.contents : "{}";
    var data = JSON.parse(rawBody);
    var p = data.payload || {};

    // Hỗ trợ gửi cùng lúc cho 1, 2 hoặc nhiều địa chỉ Email (ngăn cách bởi dấu phẩy hoặc chấm phẩy)
    var rawTo = String(data.to || Session.getActiveUser().getEmail() || "admin@lehami.vn");
    var recipientEmails = rawTo
      .split(/[,;]+/)
      .map(function (em) { return em.trim(); })
      .filter(Boolean)
      .join(",");

    var referenceCode = p.referenceCode || "TEST-ORDER";
    var subject =
      data.subject ||
      "[Yến Sào Hà Mi] Đơn đặt món mới #" + referenceCode + " — " + (p.buyerName || "Khách hàng");

    var htmlBody =
      data.html ||
      '<div style="font-family: Arial, sans-serif; max-width: 660px; margin: 0 auto; border: 1px solid #BD9342; border-radius: 12px; overflow: hidden; background: #fff;">' +
        '<div style="background-color: #155132; color: #FFFCF4; padding: 18px 24px;">' +
          '<p style="margin: 0; font-size: 11px; color: #BD9342; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">YẾN SÀO HÀ MI — THÔNG BÁO ĐƠN ĐẶT MÓN MỚI</p>' +
          '<h2 style="margin: 6px 0 0 0; font-size: 20px;">Mã đơn hàng: #' + referenceCode + '</h2>' +
        '</div>' +
        '<div style="padding: 20px 24px; background-color: #FFFCF4; color: #1d2327; font-size: 14px; line-height: 1.6;">' +
          '<p><strong>Khách đặt:</strong> ' + (p.buyerName || "") + ' — <a href="tel:' + (p.buyerPhone || "") + '">' + (p.buyerPhone || "") + '</a></p>' +
          '<p><strong>Người nhận:</strong> ' + (p.recipientName || "") + ' (' + (p.recipientPhone || "") + ')</p>' +
          '<p><strong>Loại đơn:</strong> ' + (p.orderPurpose === "GIFT" ? "Gửi quà biếu tặng" : "Mua dùng") + '</p>' +
          '<p><strong>Địa chỉ giao:</strong> ' + (p.addressDetail || "") + '</p>' +
          '<p><strong>Lịch giao yêu cầu:</strong> ' + (p.requestedDate || "") + ' (' + (p.slotLabel || "") + ')</p>' +
          (p.buyerNote ? '<p><strong>Ghi chú của khách:</strong> “' + p.buyerNote + '”</p>' : '') +
          (p.giftMessage ? '<p style="background: #fff; padding: 10px; border-left: 3px solid #BD9342;"><strong>Lời chúc trên thiệp:</strong> “' + p.giftMessage + '”</p>' : '') +
          '<h3 style="font-size: 15px; color: #155132; border-bottom: 1px solid #BD9342; padding-bottom: 6px;">CHI TIẾT CÁC MÓN ĐÃ ĐẶT</h3>' +
          '<table style="width: 100%; border-collapse: collapse; background: #fff; border: 1px solid #e5e0d0;">' +
            '<thead><tr style="background: #155132; color: #FFFCF4; font-size: 12px;">' +
              '<th style="padding: 8px;">#</th><th style="padding: 8px; text-align:left;">Tên món & Tùy chọn</th><th style="padding: 8px;">SL</th><th style="padding: 8px; text-align:right;">Đơn giá</th><th style="padding: 8px; text-align:right;">Thành tiền</th>' +
            '</tr></thead>' +
            '<tbody>' + buildOrderItemsTableHtml(p) + '</tbody>' +
          '</table>' +
          '<p style="font-size: 16px; color: #155132; text-align: right; margin-top: 12px;"><strong>TỔNG CỘNG THANH TOÁN: ' + Number(p.totalVnd || 0).toLocaleString("vi-VN") + 'đ</strong> (' + (p.shippingFeeNote || "") + ')</p>' +
        '</div>' +
      '</div>';

    // 1. Gửi Email thông báo tới cả 2 (hoặc nhiều) địa chỉ Email đã cấu hình
    MailApp.sendEmail({
      to: recipientEmails,
      subject: subject,
      body: data.text || subject,
      htmlBody: htmlBody,
      name: "Bếp Yến Sào Hà Mi"
    });

    // 2. Tự động ghi chi tiết đơn hàng vào Google Sheets nếu Script gắn với Google Sheets
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
            "Chi tiết các món đặt",
            "Ghi chú khách",
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
          p.itemsTextMultiLine || p.itemsSummary || "",
          p.buyerNote || "",
          p.giftMessage || "",
          p.totalVnd || 0
        ]);
      }
    } catch (sheetErr) {
      // Bỏ qua nếu chạy dưới dạng Standalone Script không gắn Google Sheet
    }

    return ContentService.createTextOutput(
      JSON.stringify({ ok: true, message: "Email sent to " + recipientEmails })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ ok: false, error: String(err) })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Hàm chạy thử trực tiếp trong trình soạn thảo Google Apps Script
 * (Gửi mẫu 1 đơn hàng có đầy đủ bảng chi tiết món ăn)
 */
function testSendOrderEmail() {
  var myEmail = Session.getActiveUser().getEmail() || "admin@lehami.vn";
  var samplePayload = {
    referenceCode: "HM-261006-DEMO",
    orderPurpose: "GIFT",
    buyerName: "Nguyễn Minh Anh",
    buyerPhone: "0935052959",
    buyerNote: "Giao giờ hành chính, gọi trước 15 phút giúp mình nhé",
    recipientName: "Cô Lan Hương",
    recipientPhone: "0905123456",
    addressDetail: "128 Nguyễn Văn Linh, Quận Hải Châu, TP. Đà Nẵng",
    requestedDate: "2026-10-07",
    slotLabel: "Khung giờ (09:00 – 10:00)",
    giftMessage: "Kính chúc Cô luôn dồi dào sức khỏe và bình an!",
    totalVnd: 550000,
    shippingFeeNote: "Miễn phí giao hàng (Đơn từ 2 thố/set)",
    items: [
      {
        productName: "Thố Yến Tươi Chưng Nóng — Thanh Nguyên",
        variantName: "Thố sứ 200ml",
        volumeMl: 200,
        selectedOption: "Ít ngọt",
        ingredientsText: "Tổ yến tươi nguyên chất, đường phèn kết tinh, lát gừng ấm",
        quantity: 2,
        unitPriceVnd: 145000,
        lineTotalVnd: 290000
      },
      {
        productName: "Set Quà Yến Sào Thượng Hạng 6 Vị (Hộp Hoa Sen & Đàn Én)",
        variantName: "Hộp 6 hũ 75ml",
        volumeMl: 450,
        selectedOption: "Nguyên vị 6 hũ",
        ingredientsText: "Đông trùng, Nhân sâm, Kỷ tử, Táo đỏ, Hạt chia, Đường phèn",
        quantity: 1,
        unitPriceVnd: 260000,
        lineTotalVnd: 260000
      }
    ]
  };

  doPost({
    postData: {
      contents: JSON.stringify({
        to: myEmail,
        subject: "[Yến Sào Hà Mi] Đơn đặt món mới #" + samplePayload.referenceCode + " — " + samplePayload.buyerName + " (550.000đ)",
        payload: samplePayload
      })
    }
  });
}
