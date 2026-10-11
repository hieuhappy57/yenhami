import type { OrderStatus } from "@/db/schema";

export const ORDER_PROGRESS_COPY: Record<
  OrderStatus,
  { label: string; title: string; heading: string; message: string }
> = {
  PENDING_CONFIRMATION: {
    label: "Chờ Hà Mi xác nhận",
    title: "Hà Mi đã nhận yêu cầu",
    heading: "Đang xác nhận đơn",
    message: "Hà Mi sẽ liên hệ để chốt phí giao và thời gian trước khi bếp bắt đầu chưng.",
  },
  CONFIRMED: {
    label: "Đã xác nhận lịch chưng",
    title: "Đơn đã được xác nhận",
    heading: "Đang chờ bếp chưng",
    message: "Hà Mi đã ghi nhận thanh toán. Đơn đang chờ bếp bắt đầu chưng theo thứ tự xác nhận.",
  },
  PREPARING: {
    label: "Bếp đang chưng nóng",
    title: "Bếp đang chưng món của bạn",
    heading: "Đang chuẩn bị món",
    message: "Bếp Hà Mi đang chưng món theo yêu cầu. Đơn sẽ được bàn giao để giao hàng sau khi hoàn tất.",
  },
  DELIVERING: {
    label: "Đang giao nóng",
    title: "Đơn đang trên đường giao",
    heading: "Đang giao hàng",
    message: "Món đã rời bếp và đang được giao đến địa chỉ bạn cung cấp.",
  },
  COMPLETED: {
    label: "Đã giao hoàn tất",
    title: "Đơn đã giao thành công",
    heading: "Giao hàng hoàn tất",
    message: "Hà Mi đã ghi nhận giao hàng thành công. Cảm ơn bạn đã chọn Hà Mi.",
  },
  CANCELLED: {
    label: "Đã hủy yêu cầu",
    title: "Yêu cầu đã được hủy",
    heading: "Đơn đã hủy",
    message: "Yêu cầu này không còn được xử lý. Nếu đã thanh toán, vui lòng liên hệ Hà Mi để xác nhận việc hoàn tiền.",
  },
};
