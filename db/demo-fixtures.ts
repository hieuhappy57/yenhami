import type { ProductCategory, ProductStatus, ZoneDeliveryStatus } from "./schema";

export interface SeedProductInput {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  volumeMl: number;
  ingredients: string[];
  tasteProfile: string;
  shortDescription: string;
  usageGuide: string;
  storageGuide: string;
  cautionNote: string;
  imageUrl: string;
  isIllustrationImage: boolean;
  priceVnd: number | null;
  status: ProductStatus;
  isDemoFixture: boolean;
  supportedOptions: string[];
  sortOrder: number;
}

export const DEMO_PRODUCTS: SeedProductInput[] = [
  {
    id: "prod-thanh-nguyen",
    slug: "thanh-nguyen",
    name: "Thanh Nguyên",
    category: "nguyen-ban",
    volumeMl: 200,
    ingredients: ["Tổ yến tươi chưng", "Đường phèn kết tinh", "Lát gừng mỏng", "Nước tinh khiết"],
    tasteProfile: "Thanh trong, ngọt dịu nguyên bản, rõ hương sợi yến ấm",
    shortDescription:
      "Thố yến chưng đường phèn nguyên bản, tập trung vào kết cấu sợi yến và vị ngọt thanh dễ dùng cho cả gia đình và những lần thăm hỏi.",
    usageGuide:
      "Dùng trực tiếp khi thố còn ấm ngay sau khi nhận. Khuấy nhẹ trước khi thưởng thức để cảm nhận đều sợi yến.",
    storageGuide:
      "Nếu chưa dùng ngay, đậy kín nắp thố sứ và bảo quản ngăn mát tủ lạnh (2–5°C), dùng trong vòng 24 giờ theo hướng dẫn trên nhãn.",
    cautionNote:
      "Nếu người nhận có chế độ ăn kiêng đường hoặc đang trong thai kỳ cần lưu ý riêng, vui lòng tham khảo ý kiến bác sĩ trước khi dùng.",
    imageUrl: "/brand/dishes/thanh-nguyen.jpg",
    isIllustrationImage: true,
    priceVnd: 185000,
    status: "AVAILABLE",
    isDemoFixture: true,
    supportedOptions: ["Độ ngọt tiêu chuẩn", "Ít ngọt nhẹ"],
    sortOrder: 1,
  },
  {
    id: "prod-dua-mat-thanh-diu",
    slug: "dua-mat-thanh-diu",
    name: "Dừa Mật Thanh Dịu",
    category: "ngot-diu",
    volumeMl: 200,
    ingredients: ["Tổ yến tươi chưng", "Mật hoa dừa tự nhiên", "Nước tinh khiết"],
    tasteProfile: "Ngọt dịu thanh mát, hương thơm thoang thoảng từ mật hoa dừa",
    shortDescription:
      "Sự kết hợp giữa sợi yến chưng nóng và mật hoa dừa mang lại hậu vị êm, phù hợp người yêu thích vị ngọt nhẹ tự nhiên.",
    usageGuide:
      "Thưởng thức ngon nhất khi thố còn ấm. Dùng muỗng sứ đi kèm, dùng từ tốn từng muỗng nhỏ.",
    storageGuide:
      "Bảo quản ngăn mát tủ lạnh nếu chưa dùng ngay; xem thời hạn sử dụng trên tem niêm phong thố.",
    cautionNote:
      "Sản phẩm sử dụng mật hoa dừa trong công thức. Khách hàng có chế độ dinh dưỡng đặc thù nên xem kỹ bảng thành phần trước khi chọn.",
    imageUrl: "/brand/dishes/dua-mat-thanh-diu.jpg",
    isIllustrationImage: true,
    priceVnd: 195000,
    status: "AVAILABLE",
    isDemoFixture: true,
    supportedOptions: ["Độ ngọt mật hoa dừa tiêu chuẩn"],
    sortOrder: 2,
  },
  {
    id: "prod-tu-quy-an-nhien",
    slug: "tu-quy-an-nhien",
    name: "Tứ Quý An Nhiên",
    category: "nhieu-tang",
    volumeMl: 200,
    ingredients: ["Tổ yến tươi chưng", "Táo đỏ", "Nhãn nhục", "Hạt sen", "Kỷ tử", "Đường phèn"],
    tasteProfile: "Hài hòa bốn nguyên liệu truyền thống, bùi hạt sen, thơm dịu táo nhãn",
    shortDescription:
      "Thố yến chưng cùng bốn nguyên liệu quen thuộc: táo đỏ, nhãn, hạt sen và kỷ tử. Lựa chọn trang nhã cho những dịp thăm hỏi người thân.",
    usageGuide:
      "Dùng ấm trực tiếp từ thố sứ. Thưởng thức kèm cả hạt sen, táo đỏ, nhãn nhục và nước chưng.",
    storageGuide:
      "Đậy kín nắp và giữ lạnh ngăn mát khi chưa dùng ngay theo tem hướng dẫn đi kèm hộp.",
    cautionNote:
      "Tên món gọi theo bốn nguyên liệu truyền thống. Phụ nữ mang thai hoặc người nhạy cảm với kỷ tử nên hỏi người theo dõi chuyên môn trước khi dùng.",
    imageUrl: "/brand/dishes/tu-quy-an-nhien.jpg",
    isIllustrationImage: true,
    priceVnd: 215000,
    status: "AVAILABLE",
    isDemoFixture: true,
    supportedOptions: ["Độ ngọt tiêu chuẩn", "Ít ngọt nhẹ"],
    sortOrder: 3,
  },
  {
    id: "prod-kim-thao",
    slug: "kim-thao",
    name: "Kim Thảo",
    category: "nguyen-ban",
    volumeMl: 200,
    ingredients: ["Tổ yến tươi chưng", "Đông trùng hạ thảo", "Đường phèn kết tinh"],
    tasteProfile: "Ấm áp, thanh đạm, điểm sắc vàng óng và hương đặc trưng của đông trùng hạ thảo",
    shortDescription:
      "Yến tươi chưng nóng kết hợp cùng sợi đông trùng hạ thảo, trình bày trang trọng trong thố sứ trắng giữ ấm.",
    usageGuide:
      "Dùng khi còn ấm. Thưởng thức cả sợi yến và sợi đông trùng hạ thảo trong thố.",
    storageGuide:
      "Bảo quản ngăn mát theo hướng dẫn trên tem sản phẩm khi chưa dùng ngay.",
    cautionNote:
      "Món có chứa đông trùng hạ thảo. Phụ nữ mang thai hoặc người đang có chỉ định kiêng thảo dược vui lòng hỏi ý kiến bác sĩ trước khi dùng.",
    imageUrl: "/brand/dishes/kim-thao.jpg",
    isIllustrationImage: true,
    priceVnd: 225000,
    status: "AVAILABLE",
    isDemoFixture: true,
    supportedOptions: ["Độ ngọt tiêu chuẩn", "Ít ngọt nhẹ"],
    sortOrder: 4,
  },
  {
    id: "prod-hong-lien-kim-thao",
    slug: "hong-lien-kim-thao",
    name: "Hồng Liên Kim Thảo",
    category: "nhieu-tang",
    volumeMl: 200,
    ingredients: ["Tổ yến tươi chưng", "Táo đỏ", "Hạt sen", "Đông trùng hạ thảo", "Đường phèn"],
    tasteProfile: "Vị bùi của hạt sen hòa quyện cùng táo đỏ và đông trùng hạ thảo ấm dịu",
    shortDescription:
      "Sự phối hợp chỉn chu giữa sợi yến, hạt sen bùi mềm, táo đỏ và đông trùng hạ thảo, thích hợp làm quà biếu thăm hỏi trang trọng.",
    usageGuide:
      "Dùng ấm trực tiếp khi nhận hàng để cảm nhận trọn vẹn độ mềm của hạt sen và sợi yến.",
    storageGuide:
      "Đậy kín nắp và giữ lạnh ngăn mát nếu chưa dùng ngay theo nhãn hướng dẫn.",
    cautionNote:
      "Có thành phần đông trùng hạ thảo. Phụ nữ mang thai hoặc người có chế độ ăn theo dõi riêng nên tham khảo ý kiến bác sĩ trước khi lựa chọn.",
    imageUrl: "/brand/dishes/hong-lien-kim-thao.jpg",
    isIllustrationImage: true,
    priceVnd: 235000,
    status: "AVAILABLE",
    isDemoFixture: true,
    supportedOptions: ["Độ ngọt tiêu chuẩn", "Ít ngọt nhẹ"],
    sortOrder: 5,
  },
  {
    id: "prod-ngu-bao-hat-chia",
    slug: "ngu-bao-hat-chia",
    name: "Ngũ Bảo Hạt Chia",
    category: "nhieu-tang",
    volumeMl: 200,
    ingredients: ["Tổ yến tươi chưng", "Táo đỏ", "Nhãn nhục", "Hạt sen", "Kỷ tử", "Hạt chia", "Đường phèn"],
    tasteProfile: "Nhiều tầng kết cấu với hạt chia, hạt sen, táo đỏ, nhãn và kỷ tử",
    shortDescription:
      "Thố yến phong phú về hương vị và kết cấu từ năm thành phần kết hợp cùng sợi yến chưng nóng.",
    usageGuide:
      "Khuấy đều hạt chia và các nguyên liệu trước khi thưởng thức ấm.",
    storageGuide:
      "Bảo quản ngăn mát tủ lạnh theo thời hạn trên nhãn thố.",
    cautionNote:
      "Sản phẩm gồm nhiều thành phần phối hợp (kỷ tử, hạt chia, nhãn, táo đỏ, hạt sen). Vui lòng xem kỹ thành phần nếu người dùng có tiền sử dị ứng hoặc đang trong thai kỳ.",
    imageUrl: "/brand/dishes/ngu-bao-hat-chia.jpg",
    isIllustrationImage: true,
    priceVnd: 220000,
    status: "AVAILABLE",
    isDemoFixture: true,
    supportedOptions: ["Độ ngọt tiêu chuẩn"],
    sortOrder: 6,
  },
  {
    id: "prod-luc-bao-trung-thao",
    slug: "luc-bao-trung-thao",
    name: "Lục Bảo Trùng Thảo",
    category: "nhieu-tang",
    volumeMl: 200,
    ingredients: [
      "Tổ yến tươi chưng",
      "Táo đỏ",
      "Nhãn nhục",
      "Hạt sen",
      "Kỷ tử",
      "Hạt chia",
      "Đông trùng hạ thảo",
    ],
    tasteProfile: "Đậm đà, đầy đặn sáu nguyên liệu kết hợp cùng sợi yến tươi chưng nóng",
    shortDescription:
      "Phiên bản kết hợp đầy đủ táo đỏ, nhãn, hạt sen, kỷ tử, hạt chia và đông trùng hạ thảo.",
    usageGuide: "Dùng ấm trực tiếp khi nhận thố.",
    storageGuide: "Bảo quản ngăn mát theo hướng dẫn trên nhãn sản phẩm.",
    cautionNote:
      "Chứa đông trùng hạ thảo, kỷ tử và hạt chia. Vui lòng tham khảo chuyên gia theo dõi nếu chọn cho người đang mang thai.",
    imageUrl: "/brand/dishes/luc-bao-trung-thao.jpg",
    isIllustrationImage: true,
    priceVnd: 245000,
    status: "OUT_OF_STOCK",
    isDemoFixture: true,
    supportedOptions: ["Độ ngọt tiêu chuẩn"],
    sortOrder: 7,
  },
  {
    id: "prod-tam-an-trung-thao",
    slug: "tam-an-trung-thao",
    name: "Tâm An Trùng Thảo",
    category: "nhieu-tang",
    volumeMl: 200,
    ingredients: ["Tổ yến tươi chưng", "Táo đỏ", "Nhãn nhục", "Kỷ tử", "Đông trùng hạ thảo"],
    tasteProfile: "Hương vị thanh ấm từ táo đỏ, nhãn, kỷ tử và đông trùng hạ thảo",
    shortDescription:
      "Sự kết hợp giữa sợi yến tươi chưng nóng cùng táo đỏ, nhãn nhục, kỷ tử và đông trùng hạ thảo. Hiện đang cập nhật thông số định lượng & giá chính thức.",
    usageGuide: "Thông tin hướng dẫn sử dụng đang được cập nhật.",
    storageGuide: "Thông tin hướng dẫn bảo quản đang được cập nhật.",
    cautionNote:
      "Tên gọi 'Tâm An' là tên thương mại của món, không phải cam kết công dụng y khoa. Món tạm khóa đặt trực tuyến cho đến khi hoàn tất công bố giá.",
    imageUrl: "/brand/dishes/tam-an-trung-thao.jpg",
    isIllustrationImage: true,
    priceVnd: null,
    status: "PENDING_DATA_APPROVAL",
    isDemoFixture: true,
    supportedOptions: [],
    sortOrder: 8,
  },
  // === SET QUÀ TẶNG YẾN SÀO THƯỢNG HẠNG (MẪU THỰC TẾ) ===
  {
    id: "cat-set-qua-6-vi-75ml",
    slug: "set-qua-yen-sao-thuong-hang-6-vi",
    name: "Set Quà Yến Sào Thượng Hạng 6 Vị (6 Hũ 75ml)",
    category: "nhieu-tang",
    volumeMl: 75,
    ingredients: [
      "Đường phèn",
      "Gừng tươi",
      "Nhân sâm",
      "Đông trùng hạ thảo",
      "Tam vị (Sen, Nhãn, Kỷ tử)",
      "Tứ vị dưỡng sinh",
    ],
    tasteProfile: "Trọn bộ 6 hương vị thượng hạng trong hộp quà Hoa Sen & Đàn Én Vàng",
    shortDescription:
      "Bộ quà tặng cao cấp gồm 6 hũ Yến Sào Thượng Hạng 75ml đủ 6 vị: Đường Phèn, Gừng, Nhân Sâm, Đông Trùng Hạ Thảo, Tam Vị và Tứ Vị. Thiết kế hộp Hoa Sen & Chim Yến sang trọng.",
    usageGuide: "Lắc nhẹ trước khi uống. Ngon hơn khi uống lạnh. Dùng trực tiếp 1–2 hũ/ngày.",
    storageGuide: "Bảo quản nơi khô ráo, thoáng mát, tránh ánh nắng trực tiếp.",
    cautionNote: "Sản phẩm 100% yến thật tự nhiên, tiệt trùng, không chất bảo quản.",
    imageUrl: "/brand/catalog/set-qua-6-hu-6-vi.jpg",
    isIllustrationImage: false,
    priceVnd: 260000,
    status: "AVAILABLE",
    isDemoFixture: false,
    supportedOptions: ["Hộp 6 hũ 6 vị (75ml)", "Kèm thiệp viết tay"],
    sortOrder: 101,
  },
  {
    id: "cat-set-qua-sen-vang-duong-phen",
    slug: "set-qua-sen-vang-yen-sao-thuong-hang",
    name: "Set Quà Hoa Sen Vàng — Yến Sào Thượng Hạng",
    category: "nguyen-ban",
    volumeMl: 75,
    ingredients: ["100% Tổ yến tự nhiên", "Đường phèn tinh luyện", "Không chất bảo quản"],
    tasteProfile: "Thanh ngọt tự nhiên, hộp quà ép kim Hoa Sen & Đàn Én sang trọng",
    shortDescription:
      "Hộp quà biếu tặng doanh nghiệp và người thân với thiết kế Hoa Sen & Đàn Chim Yến ép kim tinh xảo, bên trong gồm 6 hũ Yến Sào Thượng Hạng Hà Mi.",
    usageGuide: "Dùng trực tiếp ngay khi mở nắp, ngon hơn khi ướp lạnh.",
    storageGuide: "Bảo quản nhiệt độ phòng thoáng mát hoặc ngăn mát tủ lạnh.",
    cautionNote: "Đạt tiêu chuẩn an toàn thực phẩm quốc tế ISO 22000:2018 và FDA Hoa Kỳ.",
    imageUrl: "/brand/catalog/set-qua-hop-sen-en.jpg",
    isIllustrationImage: false,
    priceVnd: 240000,
    status: "AVAILABLE",
    isDemoFixture: false,
    supportedOptions: ["Set 6 hũ Đường Phèn 75ml", "Set phối vị theo yêu cầu"],
    sortOrder: 102,
  },
  // === YẾN HŨ CHƯNG SẴN THƯỢNG HẠNG 75ML ===
  {
    id: "cat-yen-hu-75ml-duong-phen",
    slug: "yen-hu-chung-san-duong-phen-75ml",
    name: "Yến Sào Thượng Hạng Đường Phèn (Hũ 75ml)",
    category: "nguyen-ban",
    volumeMl: 75,
    ingredients: ["Tổ yến tự nhiên 100%", "Đường phèn", "Nước tinh khiết RO"],
    tasteProfile: "Ngọt thanh truyền thống, sợi yến mềm mượt, tiện lợi mang theo",
    shortDescription:
      "Yến hũ chưng sẵn Hà Mi 75ml vị Đường Phèn truyền thống, đảm bảo 100% yến tự nhiên, tiệt trùng không chất bảo quản.",
    usageGuide: "Uống trực tiếp từ hũ, ngon hơn khi dùng lạnh.",
    storageGuide: "Bảo quản nơi thoáng mát, dùng trong 24h sau khi mở nắp.",
    cautionNote: "Sản xuất tại nhà máy đạt chuẩn ISO 22000:2018 & FDA Hoa Kỳ.",
    imageUrl: "/brand/catalog/yen-hu-75ml-100ml-cam-tay.jpg",
    isIllustrationImage: false,
    priceVnd: 40000,
    status: "AVAILABLE",
    isDemoFixture: false,
    supportedOptions: ["Hũ lẻ 75ml", "Lốc 6 hũ 75ml"],
    sortOrder: 201,
  },
  {
    id: "cat-yen-hu-75ml-co-ngot",
    slug: "yen-hu-chung-san-co-ngot-75ml",
    name: "Yến Sào Thượng Hạng Cỏ Ngọt • Đường Kiêng (Hũ 75ml)",
    category: "nguyen-ban",
    volumeMl: 75,
    ingredients: ["Tổ yến tự nhiên 100%", "Chiết xuất cỏ ngọt (Đường kiêng)", "Nước RO"],
    tasteProfile: "Vị thanh nhẹ từ cỏ ngọt tự nhiên, phù hợp người ăn kiêng đường",
    shortDescription:
      "Dòng yến hũ chưng sẵn 75ml sử dụng cỏ ngọt tự nhiên thay đường tinh luyện, an tâm bồi bổ cho người kiêng ngọt và người lớn tuổi.",
    usageGuide: "Uống trực tiếp, ngon hơn khi để mát.",
    storageGuide: "Bảo quản nơi khô ráo, thoáng mát.",
    cautionNote: "100% tổ yến tự nhiên, không chất bảo quản.",
    imageUrl: "/brand/catalog/yen-hu-3-chai-khay-go.jpg",
    isIllustrationImage: false,
    priceVnd: 40000,
    status: "AVAILABLE",
    isDemoFixture: false,
    supportedOptions: ["Hũ lẻ 75ml", "Lốc 6 hũ 75ml"],
    sortOrder: 202,
  },
  {
    id: "cat-yen-hu-75ml-gung",
    slug: "yen-hu-chung-san-vi-gung-75ml",
    name: "Yến Sào Thượng Hạng Vị Gừng (Hũ 75ml)",
    category: "nguyen-ban",
    volumeMl: 75,
    ingredients: ["Tổ yến tự nhiên 100%", "Gừng tươi", "Đường phèn"],
    tasteProfile: "Thơm ấm hương gừng tự nhiên, dịu cổ và ấm bụng",
    shortDescription:
      "Sự kết hợp giữa sợi yến tự nhiên và lát gừng tươi ấm áp trong hũ thủy tinh 75ml tiện lợi.",
    usageGuide: "Uống trực tiếp ở nhiệt độ phòng hoặc ướp mát.",
    storageGuide: "Bảo quản nơi thoáng mát, tránh ánh nắng trực tiếp.",
    cautionNote: "100% yến thật tự nhiên, không chất bảo quản.",
    imageUrl: "/brand/catalog/yen-hu-3-chai-khay-go.jpg",
    isIllustrationImage: false,
    priceVnd: 45000,
    status: "AVAILABLE",
    isDemoFixture: false,
    supportedOptions: ["Hũ lẻ 75ml", "Lốc 6 hũ 75ml"],
    sortOrder: 203,
  },
  {
    id: "cat-yen-hu-75ml-nhan-sam",
    slug: "yen-hu-chung-san-nhan-sam-75ml",
    name: "Yến Sào Thượng Hạng Nhân Sâm (Hũ 75ml)",
    category: "nhieu-tang",
    volumeMl: 75,
    ingredients: ["Tổ yến tự nhiên 100%", "Nhân sâm", "Đường phèn"],
    tasteProfile: "Hương sâm dịu nhẹ hòa quyện cùng sợi yến thượng hạng",
    shortDescription:
      "Yến hũ chưng sẵn 75ml kết hợp nhân sâm bổ dưỡng, thích hợp bồi bổ sức khỏe cho người làm việc cường độ cao và người lớn tuổi.",
    usageGuide: "Nên dùng vào buổi sáng hoặc đầu giờ chiều.",
    storageGuide: "Bảo quản nơi khô ráo, thoáng mát.",
    cautionNote: "100% yến tự nhiên, đạt chuẩn ISO 22000:2018 & FDA.",
    imageUrl: "/brand/catalog/set-qua-6-hu-6-vi.jpg",
    isIllustrationImage: false,
    priceVnd: 45000,
    status: "AVAILABLE",
    isDemoFixture: false,
    supportedOptions: ["Hũ lẻ 75ml", "Lốc 6 hũ 75ml"],
    sortOrder: 204,
  },
  {
    id: "cat-yen-hu-75ml-dong-trung",
    slug: "yen-hu-chung-san-dong-trung-75ml",
    name: "Yến Sào Thượng Hạng Đông Trùng Hạ Thảo (Hũ 75ml)",
    category: "nhieu-tang",
    volumeMl: 75,
    ingredients: ["Tổ yến tự nhiên 100%", "Đông trùng hạ thảo", "Đường phèn"],
    tasteProfile: "Sợi đông trùng vàng óng quyện cùng yến sào tinh khiết",
    shortDescription:
      "Hũ yến chưng sẵn 75ml kết hợp sợi Đông Trùng Hạ Thảo, bồi bổ cơ thể và làm quà biếu sức khỏe tinh tế.",
    usageGuide: "Lắc nhẹ trước khi dùng, uống trực tiếp.",
    storageGuide: "Bảo quản nơi thoáng mát.",
    cautionNote: "Không chất bảo quản, không phẩm màu nhân tạo.",
    imageUrl: "/brand/catalog/set-qua-6-hu-6-vi.jpg",
    isIllustrationImage: false,
    priceVnd: 45000,
    status: "AVAILABLE",
    isDemoFixture: false,
    supportedOptions: ["Hũ lẻ 75ml", "Lốc 6 hũ 75ml"],
    sortOrder: 205,
  },
  {
    id: "cat-yen-hu-75ml-tu-vi",
    slug: "yen-hu-chung-san-tam-tu-vi-75ml",
    name: "Yến Sào Thượng Hạng Tam Vị / Tứ Vị (Hũ 75ml)",
    category: "nhieu-tang",
    volumeMl: 75,
    ingredients: ["Tổ yến tự nhiên 100%", "Hạt sen", "Nhãn nhục", "Kỷ tử", "Táo đỏ"],
    tasteProfile: "Phối vị truyền thống thanh bùi từ hạt sen, nhãn nhục, kỷ tử",
    shortDescription:
      "Hũ yến chưng sẵn 75ml phối hợp các thảo mộc truyền thống (hạt sen, nhãn nhục, kỷ tử, táo đỏ) dễ thưởng thức cho cả gia đình.",
    usageGuide: "Uống trực tiếp, ngon hơn khi ướp lạnh.",
    storageGuide: "Bảo quản nơi khô ráo, thoáng mát.",
    cautionNote: "100% yến thật tự nhiên, không chất bảo quản.",
    imageUrl: "/brand/catalog/set-qua-6-hu-6-vi.jpg",
    isIllustrationImage: false,
    priceVnd: 45000,
    status: "AVAILABLE",
    isDemoFixture: false,
    supportedOptions: ["Vị Tứ Vị (75ml)", "Vị Tam Vị (75ml)"],
    sortOrder: 206,
  },
  // === YẾN HŨ CHƯNG SẴN NGUYÊN CHẤT 100% — THỂ TÍCH 100ML ===
  {
    id: "cat-yen-hu-100ml-duong-phen",
    slug: "yen-chung-san-nguyen-chat-duong-phen-100ml",
    name: "Yến Chưng Sẵn Nguyên Chất 100% Đường Phèn (Hũ 100ml)",
    category: "nguyen-ban",
    volumeMl: 100,
    ingredients: ["Tổ yến nguyên chất 100%", "Đường phèn", "Nước tinh khiết RO"],
    tasteProfile: "Hàm lượng yến cao trong hũ lớn 100ml, sợi yến dày và đậm đà",
    shortDescription:
      "Dòng Yến Chưng Sẵn Nguyên Chất 100% dung tích lớn 100ml vị Đường Phèn, hàm lượng sợi yến cao vượt trội cho nhu cầu bồi bổ chuyên sâu.",
    usageGuide: "Dùng trực tiếp 1 hũ/ngày, ngon hơn khi giữ lạnh.",
    storageGuide: "Bảo quản nơi thoáng mát, dùng trong 24h sau khi mở nắp.",
    cautionNote: "Tổ yến tiệt trùng nguyên chất 100%, không chất bảo quản.",
    imageUrl: "/brand/catalog/yen-hu-100ml-red.jpg",
    isIllustrationImage: false,
    priceVnd: 100000,
    status: "AVAILABLE",
    isDemoFixture: false,
    supportedOptions: ["Hũ 100ml Đường Phèn", "Hộp quà 6 hũ 100ml"],
    sortOrder: 301,
  },
  {
    id: "cat-yen-hu-100ml-hat-chia",
    slug: "yen-chung-san-nguyen-chat-hat-chia-100ml",
    name: "Yến Chưng Sẵn Nguyên Chất 100% Hạt Chia (Hũ 100ml)",
    category: "ngot-diu",
    volumeMl: 100,
    ingredients: ["Tổ yến nguyên chất 100%", "Hạt chia hữu cơ", "Đường phèn"],
    tasteProfile: "Giàu chất xơ từ hạt chia kết hợp sợi yến nguyên chất 100ml",
    shortDescription:
      "Hũ yến nguyên chất 100ml kết hợp hạt chia giàu dinh dưỡng, thanh mát và dễ tiêu hóa.",
    usageGuide: "Lắc đều trước khi uống, ngon hơn khi ướp lạnh.",
    storageGuide: "Bảo quản nơi khô ráo, thoáng mát.",
    cautionNote: "Tổ yến tiệt trùng, không chất bảo quản.",
    imageUrl: "/brand/catalog/yen-hu-100ml-red.jpg",
    isIllustrationImage: false,
    priceVnd: 100000,
    status: "AVAILABLE",
    isDemoFixture: false,
    supportedOptions: ["Hũ 100ml Hạt Chia"],
    sortOrder: 302,
  },
  {
    id: "cat-yen-hu-100ml-mat-hoa-dua",
    slug: "yen-chung-san-nguyen-chat-mat-hoa-dua-100ml",
    name: "Yến Chưng Sẵn Nguyên Chất 100% Mật Hoa Dừa (Hũ 100ml)",
    category: "ngot-diu",
    volumeMl: 100,
    ingredients: ["Tổ yến nguyên chất 100%", "Mật hoa dừa tự nhiên", "Nước RO"],
    tasteProfile: "Ngọt dịu thanh tao từ mật hoa dừa thuần thực vật, giàu khoáng chất",
    shortDescription:
      "Yến chưng sẵn nguyên chất 100ml chưng cùng mật hoa dừa tự nhiên có chỉ số đường huyết thấp, hương thơm dịu nhẹ đặc trưng.",
    usageGuide: "Dùng trực tiếp, ngon nhất khi để mát.",
    storageGuide: "Bảo quản nơi khô ráo, thoáng mát.",
    cautionNote: "100% yến thật tự nhiên, không chất bảo quản.",
    imageUrl: "/brand/catalog/yen-hu-100ml-red.jpg",
    isIllustrationImage: false,
    priceVnd: 110000,
    status: "AVAILABLE",
    isDemoFixture: false,
    supportedOptions: ["Hũ 100ml Mật Hoa Dừa"],
    sortOrder: 303,
  },
  {
    id: "cat-yen-hu-100ml-dong-trung",
    slug: "yen-chung-san-nguyen-chat-dong-trung-100ml",
    name: "Yến Chưng Sẵn Nguyên Chất 100% Đông Trùng Thảo (Hũ 100ml)",
    category: "nhieu-tang",
    volumeMl: 100,
    ingredients: ["Tổ yến nguyên chất 100%", "Đông trùng hạ thảo", "Đường phèn"],
    tasteProfile: "Đậm đà dưỡng chất từ tổ yến nguyên chất 100ml và đông trùng hạ thảo",
    shortDescription:
      "Phiên bản hũ lớn 100ml nguyên chất kết hợp Đông Trùng Hạ Thảo, lựa chọn hàng đầu để bồi bổ phục hồi thể lực và biếu tặng.",
    usageGuide: "Dùng trực tiếp 1 hũ/ngày vào buổi sáng hoặc tối trước khi ngủ 1 giờ.",
    storageGuide: "Bảo quản nơi khô ráo, thoáng mát.",
    cautionNote: "Đạt chứng nhận ISO 22000:2018 và FDA Hoa Kỳ.",
    imageUrl: "/brand/catalog/yen-hu-100ml-red.jpg",
    isIllustrationImage: false,
    priceVnd: 110000,
    status: "AVAILABLE",
    isDemoFixture: false,
    supportedOptions: ["Hũ 100ml Đông Trùng Thảo"],
    sortOrder: 304,
  },
  {
    id: "cat-yen-hu-100ml-tao-do",
    slug: "yen-chung-san-nguyen-chat-tao-do-100ml",
    name: "Yến Chưng Sẵn Nguyên Chất 100% Táo Đỏ (Hũ 100ml)",
    category: "ngot-diu",
    volumeMl: 100,
    ingredients: ["Tổ yến nguyên chất 100%", "Táo đỏ Hàn Quốc", "Đường phèn"],
    tasteProfile: "Ngọt dịu hương táo đỏ tự nhiên quyện sợi yến nguyên chất 100ml",
    shortDescription:
      "Yến chưng sẵn nguyên chất 100ml kết hợp táo đỏ tuyển chọn, mang lại vị ngọt thanh dễ chịu và giàu dưỡng chất.",
    usageGuide: "Uống trực tiếp, ngon hơn khi dùng lạnh.",
    storageGuide: "Bảo quản nơi khô ráo, thoáng mát.",
    cautionNote: "Tổ yến tiệt trùng 100%, không chất bảo quản.",
    imageUrl: "/brand/catalog/yen-hu-100ml-red.jpg",
    isIllustrationImage: false,
    priceVnd: 110000,
    status: "AVAILABLE",
    isDemoFixture: false,
    supportedOptions: ["Hũ 100ml Táo Đỏ"],
    sortOrder: 305,
  },
  // === YẾN SÀO TINH CHẾ NGUYÊN TỔ 100G (CHUẨN ISO 22000:2018 & FDA) ===
  {
    id: "cat-yen-tinh-che-eco",
    slug: "yen-sao-tinh-che-eco-100g",
    name: "Yến Sào Tinh Chế Eco (Hộp 100g)",
    category: "nguyen-ban",
    volumeMl: 100,
    ingredients: ["100% Tổ yến nguyên chất đã làm sạch lông", "Không chất tẩy trắng", "Không chất độn (mủ trôm)"],
    tasteProfile: "Sợi yến tự nhiên nở đều, thơm dịu đặc trưng khi chưng cách thủy",
    shortDescription:
      "Tổ yến tinh chế Eco được làm sạch lông và tạp chất bằng phương pháp làm ẩm nhẹ và nước lọc RO tinh khiết, sấy khô đạt độ giòn chuẩn ISO 22000:2018.",
    usageGuide: "Ngâm nở 20–30 phút trong nước sạch, chưng cách thủy 20–25 phút cùng đường phèn/táo đỏ.",
    storageGuide: "Bảo quản nơi khô ráo, kín gió, tránh ánh nắng trực tiếp.",
    cautionNote: "Không chất tẩy trắng, không độn mủ trôm, không thêm muối hay đường.",
    imageUrl: "/brand/catalog/yen-tinh-che-eco.jpg",
    isIllustrationImage: false,
    priceVnd: 4000000,
    status: "AVAILABLE",
    isDemoFixture: false,
    supportedOptions: ["Hộp 100g Tiêu chuẩn", "Kèm túi & hộp quà biếu"],
    sortOrder: 401,
  },
  {
    id: "cat-yen-tinh-che-sieu-soi",
    slug: "yen-tinh-che-sieu-soi-100g",
    name: "Yến Tinh Chế Siêu Sợi (Hộp 100g)",
    category: "nguyen-ban",
    volumeMl: 100,
    ingredients: ["100% Tổ yến tuyển chọn nhiều sợi dài dày", "Nước lọc RO tinh khiết", "Không phụ gia"],
    tasteProfile: "Tỷ lệ sợi yến dài vượt trội, dai giòn và hàm lượng protein cao",
    shortDescription:
      "Dòng Yến Tinh Chế Siêu Sợi tuyển chọn từ những tổ yến già có sợi dài và dày, giữ trọn cấu trúc sợi yến dai ngon và giá trị dinh dưỡng cao.",
    usageGuide: "Ngâm nở 25–30 phút, chưng cách thủy lửa nhỏ 20–25 phút.",
    storageGuide: "Bảo quản nơi khô thoáng, đậy kín hộp sau khi lấy yến.",
    cautionNote: "Đạt tiêu chuẩn quản lý quốc tế ISO 22000:2018 và chứng nhận FDA Hoa Kỳ.",
    imageUrl: "/brand/catalog/yen-tinh-che-sieu-soi.jpg",
    isIllustrationImage: false,
    priceVnd: 4600000,
    status: "AVAILABLE",
    isDemoFixture: false,
    supportedOptions: ["Hộp 100g Siêu sợi", "Kèm túi & hộp quà biếu"],
    sortOrder: 402,
  },
  {
    id: "cat-yen-rut-long-xuat-khau",
    slug: "yen-rut-long-dinh-hinh-cao-cap-xuat-khau-100g",
    name: "Yến Rút Lông Định Hình Cao Cấp Xuất Khẩu (Hộp 100g)",
    category: "nguyen-ban",
    volumeMl: 100,
    ingredients: ["100% Tổ yến nguyên tổ hạng A rút lông định hình", "Chuẩn xuất khẩu ISO 22000 & FDA"],
    tasteProfile: "Nguyên tổ bề thế, sợi yến nguyên vẹn dài dày thượng hạng",
    shortDescription:
      "Tuyệt phẩm Yến Rút Lông Định Hình Cao Cấp Xuất Khẩu: áp dụng kỹ thuật làm ẩm nhẹ và rút lông đại thủ công để hạn chế tối đa tiếp xúc nước, giữ nguyên hình dáng tổ yến đẹp mắt để biếu tặng thượng hạng.",
    usageGuide: "Ngâm nở 30–35 phút, chưng cách thủy 25 phút để cảm nhận trọn vẹn sợi yến dài thượng hạng.",
    storageGuide: "Bảo quản nơi khô ráo, thoáng mát.",
    cautionNote: "Sản phẩm cao cấp định vị quà tặng ngoại giao, doanh nghiệp & xuất khẩu.",
    imageUrl: "/brand/catalog/yen-rut-long-xuat-khau.jpg",
    isIllustrationImage: false,
    priceVnd: 5500000,
    status: "AVAILABLE",
    isDemoFixture: false,
    supportedOptions: ["Hộp 100g Xuất khẩu", "Kèm bộ hộp quà Thượng Hạng"],
    sortOrder: 403,
  },
];

export interface SeedVariantInput {
  id: string;
  productId: string;
  name: string;
  priceDeltaVnd: number;
  isAvailable: boolean;
}

export const DEMO_VARIANTS: SeedVariantInput[] = DEMO_PRODUCTS.flatMap((p) => {
  if (p.id.startsWith("cat-set-qua-")) {
    return [
      {
        id: `${p.id}-var-standard`,
        productId: p.id,
        name: "Hộp quà Hoa Sen & Đàn Én (Kèm túi xách & thiệp)",
        priceDeltaVnd: 0,
        isAvailable: true,
      },
    ];
  }
  if (p.id.startsWith("cat-yen-hu-75ml-")) {
    return [
      {
        id: `${p.id}-var-standard`,
        productId: p.id,
        name: "Hũ thủy tinh 75ml đóng sẵn",
        priceDeltaVnd: 0,
        isAvailable: true,
      },
    ];
  }
  if (p.id.startsWith("cat-yen-hu-100ml-")) {
    return [
      {
        id: `${p.id}-var-standard`,
        productId: p.id,
        name: "Hũ thủy tinh 100ml nguyên chất",
        priceDeltaVnd: 0,
        isAvailable: true,
      },
    ];
  }
  if (p.id.startsWith("cat-yen-")) {
    return [
      {
        id: `${p.id}-var-standard`,
        productId: p.id,
        name: "Hộp 100g chuẩn ISO 22000 & FDA",
        priceDeltaVnd: 0,
        isAvailable: true,
      },
    ];
  }
  return [
    {
      id: `${p.id}-var-standard`,
      productId: p.id,
      name: "Thố sứ 200ml giữ ấm (Tiêu chuẩn)",
      priceDeltaVnd: 0,
      isAvailable: true,
    },
    {
      id: `${p.id}-var-giftbox`,
      productId: p.id,
      name: "Hộp quà thăm hỏi chỉn chu + Thiệp viết tay",
      priceDeltaVnd: 25000,
      isAvailable: true,
    },
  ];
});

export interface SeedZoneInput {
  id: string;
  city: string;
  district: string;
  wardSample: string;
  deliveryStatus: ZoneDeliveryStatus;
  shippingFeeVnd: number | null;
  leadTimeMinutes: number;
  note: string;
  isDemoFixture: boolean;
  sortOrder: number;
}

export const DEMO_SERVICE_ZONES: SeedZoneInput[] = [
  {
    id: "zone-hai-chau",
    city: "Đà Nẵng",
    district: "Quận Hải Châu",
    wardSample: "Thạch Thang, Hải Châu 1, Hòa Thuận Đông, Bình Hiên...",
    deliveryStatus: "SUPPORTED",
    shippingFeeVnd: 0,
    leadTimeMinutes: 90,
    note: "Khu vực trung tâm — hỗ trợ giao thố chưng nóng theo khung giờ bếp xác nhận.",
    isDemoFixture: true,
    sortOrder: 1,
  },
  {
    id: "zone-thanh-khe",
    city: "Đà Nẵng",
    district: "Quận Thanh Khê",
    wardSample: "Tân Chính, Thạc Gián, Vĩnh Trung, Thanh Khê Đông...",
    deliveryStatus: "SUPPORTED",
    shippingFeeVnd: 15000,
    leadTimeMinutes: 90,
    note: "Hỗ trợ giao thố chưng nóng tận nơi theo ca bếp.",
    isDemoFixture: true,
    sortOrder: 2,
  },
  {
    id: "zone-son-tra",
    city: "Đà Nẵng",
    district: "Quận Sơn Trà",
    wardSample: "An Hải Bắc, An Hải Đông, Phước Mỹ, Mân Thái...",
    deliveryStatus: "SUPPORTED",
    shippingFeeVnd: 20000,
    leadTimeMinutes: 90,
    note: "Hỗ trợ giao thố chưng nóng tận nơi theo ca bếp.",
    isDemoFixture: true,
    sortOrder: 3,
  },
  {
    id: "zone-ngu-hanh-son",
    city: "Đà Nẵng",
    district: "Quận Ngũ Hành Sơn",
    wardSample: "Mỹ An, Khuê Mỹ, Hòa Hải, Hòa Quý...",
    deliveryStatus: "SUPPORTED",
    shippingFeeVnd: 25000,
    leadTimeMinutes: 120,
    note: "Hỗ trợ giao thố chưng nóng tận nơi theo ca bếp.",
    isDemoFixture: true,
    sortOrder: 4,
  },
  {
    id: "zone-cam-le-lien-chieu",
    city: "Đà Nẵng",
    district: "Quận Cẩm Lệ / Liên Chiểu",
    wardSample: "Khuê Trung, Hòa Xuân, Hòa Minh, Hòa Khánh...",
    deliveryStatus: "FEE_PENDING_CONFIRMATION",
    shippingFeeVnd: null,
    leadTimeMinutes: 120,
    note: "Nhận yêu cầu đặt món — Phí giao thực tế và khung giờ giữ nóng sẽ được Hà Mi kiểm tra & báo lại khi xác nhận đơn.",
    isDemoFixture: true,
    sortOrder: 5,
  },
  {
    id: "zone-hoa-vang-out",
    city: "Đà Nẵng & Tỉnh/Thành khác",
    district: "Huyện Hòa Vang (xa trung tâm) / Ngoài Đà Nẵng",
    wardSample: "Khu vực ngoài bán kính giữ nóng tiêu chuẩn của bếp",
    deliveryStatus: "OUT_OF_ZONE",
    shippingFeeVnd: null,
    leadTimeMinutes: 180,
    note: "Ngoài vùng phục vụ giao nóng tiêu chuẩn. Vui lòng liên hệ trực tiếp để Hà Mi kiểm tra phương án phục vụ riêng.",
    isDemoFixture: true,
    sortOrder: 6,
  },
];

export interface SeedSlotInput {
  id: string;
  slotCode: string;
  label: string;
  timeWindow: string;
  startMinutesOfDay: number; // e.g., 9*60 = 540 for 09:00
  maxCapacityBowls: number;
  defaultReservedBowls: number;
  minLeadMinutes: number;
  isActive: boolean;
  sortOrder: number;
}

export const DEMO_DELIVERY_SLOTS: SeedSlotInput[] = [
  {
    id: "slot-08-09",
    slotCode: "SLOT_08_09",
    label: "Khung giờ (08:00 – 09:00)",
    timeWindow: "08:00 - 09:00",
    startMinutesOfDay: 8 * 60,
    maxCapacityBowls: 12,
    defaultReservedBowls: 0,
    minLeadMinutes: 90,
    isActive: true,
    sortOrder: 1,
  },
  {
    id: "slot-morning",
    slotCode: "MORNING_09_11",
    label: "Khung giờ (09:00 – 10:00)",
    timeWindow: "09:00 - 10:00",
    startMinutesOfDay: 9 * 60,
    maxCapacityBowls: 12,
    defaultReservedBowls: 0,
    minLeadMinutes: 90,
    isActive: true,
    sortOrder: 2,
  },
  {
    id: "slot-10-11",
    slotCode: "SLOT_10_11",
    label: "Khung giờ (10:00 – 11:00)",
    timeWindow: "10:00 - 11:00",
    startMinutesOfDay: 10 * 60,
    maxCapacityBowls: 12,
    defaultReservedBowls: 0,
    minLeadMinutes: 90,
    isActive: true,
    sortOrder: 3,
  },
  {
    id: "slot-11-12",
    slotCode: "SLOT_11_12",
    label: "Khung giờ (11:00 – 12:00)",
    timeWindow: "11:00 - 12:00",
    startMinutesOfDay: 11 * 60,
    maxCapacityBowls: 12,
    defaultReservedBowls: 0,
    minLeadMinutes: 90,
    isActive: true,
    sortOrder: 4,
  },
  {
    id: "slot-noon-full",
    slotCode: "NOON_1130_1330",
    label: "Khung giờ (12:00 – 13:00)",
    timeWindow: "12:00 - 13:00",
    startMinutesOfDay: 12 * 60,
    maxCapacityBowls: 12,
    defaultReservedBowls: 0,
    minLeadMinutes: 90,
    isActive: true,
    sortOrder: 5,
  },
  {
    id: "slot-13-14",
    slotCode: "SLOT_13_14",
    label: "Khung giờ (13:00 – 14:00)",
    timeWindow: "13:00 - 14:00",
    startMinutesOfDay: 13 * 60,
    maxCapacityBowls: 12,
    defaultReservedBowls: 0,
    minLeadMinutes: 90,
    isActive: true,
    sortOrder: 6,
  },
  {
    id: "slot-afternoon",
    slotCode: "AFTERNOON_1430_1700",
    label: "Khung giờ (14:00 – 15:00)",
    timeWindow: "14:00 - 15:00",
    startMinutesOfDay: 14 * 60,
    maxCapacityBowls: 15,
    defaultReservedBowls: 0,
    minLeadMinutes: 90,
    isActive: true,
    sortOrder: 7,
  },
  {
    id: "slot-15-16",
    slotCode: "SLOT_15_16",
    label: "Khung giờ (15:00 – 16:00)",
    timeWindow: "15:00 - 16:00",
    startMinutesOfDay: 15 * 60,
    maxCapacityBowls: 12,
    defaultReservedBowls: 0,
    minLeadMinutes: 90,
    isActive: true,
    sortOrder: 8,
  },
  {
    id: "slot-16-17",
    slotCode: "SLOT_16_17",
    label: "Khung giờ (16:00 – 17:00)",
    timeWindow: "16:00 - 17:00",
    startMinutesOfDay: 16 * 60,
    maxCapacityBowls: 12,
    defaultReservedBowls: 0,
    minLeadMinutes: 90,
    isActive: true,
    sortOrder: 9,
  },
  {
    id: "slot-17-18",
    slotCode: "SLOT_17_18",
    label: "Khung giờ (17:00 – 18:00)",
    timeWindow: "17:00 - 18:00",
    startMinutesOfDay: 17 * 60,
    maxCapacityBowls: 12,
    defaultReservedBowls: 0,
    minLeadMinutes: 90,
    isActive: true,
    sortOrder: 10,
  },
  {
    id: "slot-evening",
    slotCode: "EVENING_1730_1930",
    label: "Khung giờ (18:00 – 19:00)",
    timeWindow: "18:00 - 19:00",
    startMinutesOfDay: 18 * 60,
    maxCapacityBowls: 12,
    defaultReservedBowls: 0,
    minLeadMinutes: 90,
    isActive: true,
    sortOrder: 11,
  },
  {
    id: "slot-19-20",
    slotCode: "SLOT_19_20",
    label: "Khung giờ (19:00 – 20:00)",
    timeWindow: "19:00 - 20:00",
    startMinutesOfDay: 19 * 60,
    maxCapacityBowls: 12,
    defaultReservedBowls: 0,
    minLeadMinutes: 90,
    isActive: true,
    sortOrder: 12,
  },
  {
    id: "slot-20-21",
    slotCode: "SLOT_20_21",
    label: "Khung giờ (20:00 – 21:00)",
    timeWindow: "20:00 - 21:00",
    startMinutesOfDay: 20 * 60,
    maxCapacityBowls: 12,
    defaultReservedBowls: 0,
    minLeadMinutes: 90,
    isActive: true,
    sortOrder: 13,
  },
];
