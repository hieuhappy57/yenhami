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
    ingredients: ["35g Tổ yến tươi chưng", "Đường phèn kết tinh", "Lát gừng mỏng", "Nước tinh khiết RO"],
    tasteProfile: "Thanh trong, ngọt dịu nguyên bản, rõ hương sợi yến ấm thơm",
    shortDescription:
      "Mỗi thố yến 200ml chứa đến 35g yến tươi thật chưng cùng đường phèn kết tinh và lát gừng ấm. Vị ngọt thanh tao, dễ hấp thu cho mẹ bầu, ông bà lớn tuổi và người đang hồi phục sau bệnh.",
    usageGuide:
      "Dùng trực tiếp khi thố còn ấm ngay sau khi nhận trong 2H. Khuấy nhẹ trước khi thưởng thức để cảm nhận trọn vẹn sợi yến dài giòn dai.",
    storageGuide:
      "Nếu chưa dùng ngay, đậy kín nắp thố sứ và bảo quản ngăn mát tủ lạnh (2–5°C), dùng trong vòng 24 giờ theo hướng dẫn trên nhãn.",
    cautionNote:
      "Không hương liệu, không chất bảo quản. Nếu người nhận có chế độ ăn kiêng đường hoặc đang trong thai kỳ cần lưu ý riêng, có thể chọn mức Ít ngọt nhẹ.",
    imageUrl: "/brand/dishes/thanh-nguyen.jpg",
    isIllustrationImage: true,
    priceVnd: 295000,
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
    ingredients: ["35g Tổ yến tươi chưng", "Mật hoa dừa tự nhiên", "Nước tinh khiết RO"],
    tasteProfile: "Ngọt dịu thanh mát, hương thơm thoang thoảng từ mật hoa dừa hữu cơ",
    shortDescription:
      "35g yến tươi thật chưng nóng trong thố sứ 200ml kết hợp mật hoa dừa tự nhiên giàu khoáng chất. Vị ngọt dịu nhẹ, chỉ số đường huyết thấp, lý tưởng cho người lớn tuổi, mẹ bầu và người ăn kiêng.",
    usageGuide:
      "Thưởng thức ngon nhất khi thố còn ấm nóng vừa giao. Dùng muỗng sứ đi kèm, thưởng thức từ tốn từng muỗng nhỏ.",
    storageGuide:
      "Bảo quản ngăn mát tủ lạnh nếu chưa dùng ngay; xem thời hạn sử dụng trên tem niêm phong thố.",
    cautionNote:
      "Sản phẩm sử dụng mật hoa dừa tự nhiên, hoàn toàn không hương liệu và không chất bảo quản.",
    imageUrl: "/brand/dishes/dua-mat-thanh-diu.jpg",
    isIllustrationImage: true,
    priceVnd: 295000,
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
    ingredients: ["35g Tổ yến tươi chưng", "Táo đỏ", "Nhãn nhục", "Hạt sen", "Kỷ tử", "Đường phèn"],
    tasteProfile: "Hài hòa bốn nguyên liệu truyền thống, bùi hạt sen, thơm dịu táo nhãn",
    shortDescription:
      "Thố yến 200ml với 35g yến tươi thật hòa quyện cùng táo đỏ, nhãn nhục, hạt sen và kỷ tử chọn lọc. Món quà bồi bổ ấm lòng, dưỡng tâm an thần cho ông bà, cha mẹ và những dịp thăm hỏi người thân.",
    usageGuide:
      "Dùng ấm trực tiếp từ thố sứ. Thưởng thức kèm cả hạt sen, táo đỏ, nhãn nhục và nước chưng thanh ngọt.",
    storageGuide:
      "Đậy kín nắp và giữ lạnh ngăn mát khi chưa dùng ngay theo tem hướng dẫn đi kèm hộp.",
    cautionNote:
      "Chưng thủ công tươi nóng ngay khi nhận đơn, không chất bảo quản. Phụ nữ mang thai 3 tháng đầu hoặc người nhạy cảm với kỷ tử nên tham khảo ý kiến bác sĩ.",
    imageUrl: "/brand/dishes/tu-quy-an-nhien.jpg",
    isIllustrationImage: true,
    priceVnd: 315000,
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
    ingredients: ["35g Tổ yến tươi chưng", "Đông trùng hạ thảo", "Đường phèn kết tinh"],
    tasteProfile: "Ấm áp, thanh đạm, điểm sắc vàng óng và hương đặc trưng của đông trùng hạ thảo",
    shortDescription:
      "35g yến tươi thật nguyên tổ chưng nóng cùng sợi Đông trùng hạ thảo chọn lọc trong thố sứ 200ml giữ nhiệt, hỗ trợ bồi bổ thể lực cho người đang hồi phục sau bệnh và người lớn tuổi.",
    usageGuide:
      "Dùng khi còn ấm nóng ngay khi nhận. Thưởng thức cả sợi yến và sợi đông trùng hạ thảo trong thố.",
    storageGuide:
      "Bảo quản ngăn mát theo hướng dẫn trên tem sản phẩm khi chưa dùng ngay.",
    cautionNote:
      "Món có chứa đông trùng hạ thảo. Phụ nữ mang thai hoặc người đang có chỉ định kiêng thảo dược vui lòng hỏi ý kiến bác sĩ trước khi dùng.",
    imageUrl: "/brand/dishes/kim-thao.jpg",
    isIllustrationImage: true,
    priceVnd: 325000,
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
    ingredients: ["35g Tổ yến tươi chưng", "Táo đỏ", "Hạt sen", "Đông trùng hạ thảo", "Đường phèn"],
    tasteProfile: "Vị bùi của hạt sen hòa quyện cùng táo đỏ và đông trùng hạ thảo ấm dịu",
    shortDescription:
      "Sự phối hợp chỉn chu giữa 35g sợi yến tươi, hạt sen bùi mềm, táo đỏ và đông trùng hạ thảo trong thố sứ 200ml, cung cấp dưỡng chất ấm nóng cho người mới ốm dậy, sau phẫu thuật hoặc làm quà thăm hỏi trang trọng.",
    usageGuide:
      "Dùng ấm trực tiếp khi nhận hàng để cảm nhận trọn vẹn độ mềm của hạt sen và sợi yến.",
    storageGuide:
      "Đậy kín nắp và giữ lạnh ngăn mát nếu chưa dùng ngay theo nhãn hướng dẫn.",
    cautionNote:
      "Có thành phần đông trùng hạ thảo. Phụ nữ mang thai hoặc người có chế độ ăn theo dõi riêng nên tham khảo ý kiến bác sĩ trước khi lựa chọn.",
    imageUrl: "/brand/dishes/hong-lien-kim-thao.jpg",
    isIllustrationImage: true,
    priceVnd: 335000,
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
    ingredients: ["35g Tổ yến tươi chưng", "Táo đỏ", "Nhãn nhục", "Hạt sen", "Kỷ tử", "Hạt chia", "Đường phèn"],
    tasteProfile: "Nhiều tầng kết cấu với hạt chia, hạt sen, táo đỏ, nhãn và kỷ tử",
    shortDescription:
      "Thố yến 200ml chứa 35g yến tươi thật kết hợp hạt chia hữu cơ cùng táo đỏ, hạt sen, nhãn nhục và kỷ tử, hỗ trợ tiêu hóa nhẹ nhàng và bồi bổ cho mẹ bầu, gia đình.",
    usageGuide:
      "Khuấy đều hạt chia và các nguyên liệu trước khi thưởng thức ấm.",
    storageGuide:
      "Bảo quản ngăn mát tủ lạnh theo thời hạn trên nhãn thố.",
    cautionNote:
      "Sản phẩm gồm nhiều thành phần phối hợp (kỷ tử, hạt chia, nhãn, táo đỏ, hạt sen). Vui lòng xem kỹ thành phần nếu người dùng có tiền sử dị ứng hoặc đang trong thai kỳ.",
    imageUrl: "/brand/dishes/ngu-bao-hat-chia.jpg",
    isIllustrationImage: true,
    priceVnd: 320000,
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
      "35g Tổ yến tươi chưng",
      "Táo đỏ",
      "Nhãn nhục",
      "Hạt sen",
      "Kỷ tử",
      "Hạt chia",
      "Đông trùng hạ thảo",
    ],
    tasteProfile: "Đậm đà, đầy đặn sáu nguyên liệu kết hợp cùng 35g sợi yến tươi chưng nóng",
    shortDescription:
      "Phiên bản kết hợp đầy đủ 35g yến tươi thật cùng táo đỏ, nhãn, hạt sen, kỷ tử, hạt chia và đông trùng hạ thảo trong thố sứ 200ml.",
    usageGuide: "Dùng ấm trực tiếp khi nhận thố.",
    storageGuide: "Bảo quản ngăn mát theo hướng dẫn trên nhãn sản phẩm.",
    cautionNote:
      "Chứa đông trùng hạ thảo, kỷ tử và hạt chia. Vui lòng tham khảo chuyên gia theo dõi nếu chọn cho người đang mang thai.",
    imageUrl: "/brand/dishes/luc-bao-trung-thao.jpg",
    isIllustrationImage: true,
    priceVnd: 345000,
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
    ingredients: ["35g Tổ yến tươi chưng", "Táo đỏ", "Nhãn nhục", "Kỷ tử", "Đông trùng hạ thảo"],
    tasteProfile: "Hương vị thanh ấm từ táo đỏ, nhãn, kỷ tử và đông trùng hạ thảo",
    shortDescription:
      "Sự kết hợp giữa 35g sợi yến tươi chưng nóng cùng táo đỏ, nhãn nhục, kỷ tử và đông trùng hạ thảo. Hiện đang cập nhật thông số định lượng & giá chính thức.",
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
    note: "Khu vực trung tâm — hỗ trợ chưng thủ công tươi nóng ngay khi nhận đơn, giao nhanh trong 2H.",
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
    note: "Hỗ trợ giao thố yến chưng nóng tận nơi nhanh trong 2H (Miễn phí giao từ 2 thố).",
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
    note: "Hỗ trợ giao thố yến chưng nóng tận nơi nhanh trong 2H (Miễn phí giao từ 2 thố).",
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
    note: "Hỗ trợ giao thố yến chưng nóng tận nơi trong 2H (Miễn phí giao từ 2 thố).",
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
    note: "Nhận yêu cầu đặt món — Phí giao thực tế và khung giờ giữ nóng 2H sẽ được Hà Mi kiểm tra & báo lại khi xác nhận đơn.",
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
    note: "Ngoài vùng phục vụ giao nóng tiêu chuẩn. Vui lòng liên hệ trực tiếp Hotline/Zalo 0935 052 959 để Hà Mi kiểm tra phương án phục vụ riêng.",
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

export interface SeedPostInput {
  id: string;
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  content: string;
  coverImageUrl: string;
  coverImageAlt: string;
  isPublished: boolean;
}

export const DEMO_POSTS: SeedPostInput[] = [
  {
    id: "post-seo-1",
    slug: "tai-sao-nguoi-sanh-yen-uu-tien-yen-tuoi-chung-nong-tho-su",
    title: "Tại Sao Người Sành Yến Ưu Tiên Yến Tươi Chưng Nóng Thố Sứ Thay Vì Yến Hũ Công Nghiệp?",
    category: "Khoa học dinh dưỡng",
    excerpt:
      "Khám phá sự khác biệt về cấu trúc protein, 18 loại axit amin và độ an toàn của thố sứ tráng men 200ml chứa 35g yến tươi thật chưng thủ công ngay khi đặt tại Yến Sào Hà Mi Đà Nẵng.",
    coverImageUrl: "/bai-viet/banner_bai_1_yen_tuoi_tho_su.jpg",
    coverImageAlt: "Thố yến tươi chưng nóng 200ml giữ trọn dưỡng chất - Yến Sào Hà Mi Đà Nẵng",
    isPublished: true,
    content: [
      "Trong hành trình chăm sóc sức khỏe gia đình, đặc biệt khi bồi bổ cho mẹ bầu, ông bà lớn tuổi hay người thân đang hồi phục sau bệnh, những người tiêu dùng tinh tế và sành yến ngày càng khắt khe hơn. Thay vì chọn những hũ yến chưng sẵn đóng nắp kim loại sản xuất hàng loạt lưu kho dài ngày, xu hướng thưởng thức Yến tươi chưng nóng trong thố sứ 200ml đang trở thành chuẩn mực mới của sự an tâm. Dưới góc độ khoa học dinh dưỡng và trải nghiệm ẩm thực dưỡng sinh, đâu là sự khác biệt tạo nên giá trị này?",
      "## 1. Bảo toàn trọn vẹn cấu trúc Protein và 18 loại Axit Amin quý giá",
      "Tổ yến thiên nhiên chứa khoảng 45–55% protein hòa tan dễ hấp thu, cùng 18 loại axit amin và 31 nguyên tố vi lượng thiết yếu. Tuy nhiên, cấu trúc liên kết peptide của các hợp chất sinh học này rất nhạy cảm với nhiệt độ cao kéo dài.",
      "- Yến hũ công nghiệp: Để đạt thời hạn bảo quản từ 12 đến 24 tháng ở nhiệt độ thường, các dây chuyền công nghiệp thường phải áp dụng công nghệ tiệt trùng Retort ở nhiệt độ trên 121°C với áp suất cao. Quá trình gia nhiệt khắc nghiệt này làm biến tính một phần cấu trúc protein, làm đứt gãy các chuỗi axit amin quý giá như Sialic Acid, Tyrosine và Threonine, khiến sợi yến dễ bị tan nhão và giảm giá trị sinh học.",
      "- Yến tươi chưng nóng thủ công Hà Mi: Mỗi thố yến 200ml chứa đến 35g yến tươi thật được chưng cách thủy thủ công ngay khi nhận đơn ở nhiệt độ kiểm soát chuẩn xác (85°C – 90°C) trong thời gian vừa đủ. Phương pháp này giữ trọn vẹn trạng thái tự nhiên của các vi chất, giúp cơ thể mẹ bầu, người bệnh và người lớn tuổi hấp thu tối đa dưỡng chất ngay khi thố yến còn ấm nóng.",
      "## 2. Không chất bảo quản, không phụ gia tạo đặc — Cảm quan sợi yến nguyên bản",
      "Để tạo cảm giác sánh đặc và giữ cho sợi yến không bị lắng đọng sau quá trình tiệt trùng nhiệt độ cao, nhiều dòng sản phẩm đóng hũ công nghiệp phải sử dụng chất tạo gel và chất ổn định như Gellan Gum (INS 418), Natri Alginat (INS 401) hoặc hương liệu tổng hợp. Điều này khiến sợi yến mất đi độ giòn dai tự nhiên.",
      "Ngược lại, tại Yến Sào Hà Mi, chúng tôi cam kết: Không hương liệu – Không chất bảo quản – Không chất độn. Mở nắp thố yến tươi chưng nóng, bạn sẽ cảm nhận trọn vẹn 35g sợi yến Việt Nam nguyên tổ nở phồng, trong suốt, sợi dài dày được nhặt sạch hoàn toàn bằng nước lọc RO tinh khiết, dậy lên hương thơm thanh tao tự nhiên kết hợp cùng đường phèn kết tinh và thảo mộc chọn lọc.",
      "## 3. Sự an toàn tuyệt đối của thố sứ tráng men 200ml so với nắp kim loại lót nhựa",
      "Một khía cạnh rất đáng lưu tâm khi chọn thực phẩm bồi bổ cho bà bầu và người đang điều trị bệnh là bao bì tiếp xúc nhiệt. Các hũ thủy tinh công nghiệp thường sử dụng nắp kim loại có lớp gioăng cao su hoặc nhựa tổng hợp bên trong để tạo độ kín khí. Khi hấp tiệt trùng ở nhiệt độ cao, nguy cơ thôi nhiễm vi nhựa hoặc hợp chất hóa học từ lớp lót nắp là điều khiến nhiều gia đình lo ngại.",
      "Hà Mi giải quyết triệt để nỗi lo này bằng việc sử dụng thố sứ tráng men cao cấp dung tích 200ml. Sứ cao cấp là vật liệu trơ về mặt hóa học, chịu nhiệt hoàn hảo và tuyệt đối an toàn khi chưng cách thủy. Hơn thế nữa, thành thố sứ dày dặn giúp giữ ấm tự nhiên suốt quá trình vận chuyển, để khi trao tận tay người thương sau 2 giờ, thố yến vẫn ấm áp, thơm ngon như vừa nhấc khỏi bếp nhà.",
      "## 4. Món quà ấm lòng – Ngon miệng – Dễ hấp thu cho người thân yêu",
      "Thưởng thức yến sào không chỉ là việc nạp dinh dưỡng mà còn là sự vỗ về cả thể chất lẫn tinh thần. Việc mở một thố sứ còn ấm nóng, hít hà hương thơm dịu nhẹ của lát gừng tươi, táo đỏ, hạt sen và cảm nhận từng sợi yến mềm mại tan nhẹ nơi đầu lưỡi mang lại cảm giác thư thái, ấm bụng tức thì.",
      "Dù là mẹ bầu cần thêm dưỡng chất, ông bà lớn tuổi, hay người đang hồi phục sau bệnh, yến chưng nóng luôn là món quà ấm lòng – ngon miệng – dễ hấp thu! Với giá chỉ từ 295.000đ / 1 thố sứ 200ml (chứa đủ 35g yến tươi thật), Yến Sào Hà Mi luôn sẵn sàng chưng tươi theo khẩu vị riêng và giao ngay trong 2H khắp nội thành Đà Nẵng.",
    ].join("\n\n"),
  },
  {
    id: "post-seo-2",
    slug: "dich-vu-giao-yen-tuoi-chung-nong-hoa-toc-2-gio-da-nang",
    title: "Dịch Vụ Giao Yến Tươi Chưng Nóng Hỏa Tốc 2 Giờ Tại Đà Nẵng: Món Quà Sức Khỏe Kịp Thời Cho Người Thân",
    category: "Dịch vụ Giao Nóng 2H",
    excerpt:
      "Quy trình 120 phút chưng thủ công tươi nóng ngay khi nhận đơn và giao tận nơi tại 6 quận nội thành Đà Nẵng cùng các bệnh viện lớn như Hoàn Mỹ, Gia Đình, Vinmec, Phụ Sản - Nhi.",
    coverImageUrl: "/bai-viet/banner_bai_2_giao_hoa_toc_2h_da_nang.jpg",
    coverImageAlt: "Dịch vụ giao yến tươi chưng nóng hỏa tốc 2 giờ nội thành Đà Nẵng",
    isPublished: true,
    content: [
      "Khi một người thân đang nằm viện cần bồi bổ ngay sau ca phẫu thuật, khi mẹ bầu mệt mỏi nghén ăn vào buổi chiều, hay khi bạn ở xa muốn gửi gấp một thố yến ấm nóng về biếu ông bà tại Đà Nẵng — sự kịp thời và độ tươi mới chính là điều quý giá nhất. Thấu hiểu trọn vẹn tâm ý đó, Yến Sào Hà Mi tiên phong chuẩn hóa dịch vụ: Yến Tươi Chưng Nóng Thố Sứ 200ml — Giao Ngay Trong 2H Nội Thành Đà Nẵng.",
      "## Quy trình 120 phút chưng tươi thủ công chuẩn xác từ bếp Hà Mi",
      "Chúng tôi nói không với việc chưng sẵn lưu kho. Để đảm bảo mỗi thố yến khi trao đến tay người nhận vẫn giữ nguyên độ ấm nóng (65°C – 75°C) và vẹn nguyên dưỡng chất từ 35g yến tươi thật, Hà Mi vận hành quy trình 5 bước khép kín ngay sau khi xác nhận đơn:",
      "- Phút 00 – 10: Tiếp nhận yêu cầu đặt món & Cá nhân hóa khẩu vị (Độ ngọt tiêu chuẩn, ít ngọt nhẹ, mật hoa dừa ăn kiêng, có gừng hoặc không gừng, ghi thiệp viết tay).",
      "- Phút 10 – 20: Cân định lượng chuẩn 35g sợi yến tươi Việt Nam nguyên tổ (đã nhặt sạch lông bằng nước lọc RO tinh khiết) cùng táo đỏ, hạt sen, kỷ tử hoặc đông trùng hạ thảo chọn lọc.",
      "- Phút 20 – 65: Chưng cách thủy thủ công trực tiếp trong thố sứ 200ml ở dải nhiệt độ chuẩn 85°C – 90°C để sợi yến nở đều, thơm dịu mà không làm biến tính axit amin.",
      "- Phút 65 – 75: Niêm phong tem an toàn, đóng gói trong hộp giữ nhiệt chuyên dụng kèm muỗng sứ tiệt trùng, khăn giấy và thiệp nhắn gửi.",
      "- Phút 75 – 120: Giao hỏa tốc tận giường bệnh, tư gia hoặc văn phòng khắp các quận nội thành Đà Nẵng.",
      "## Giải pháp bồi bổ kịp thời cho từng nhu cầu sức khỏe tại Đà Nẵng",
      "### 1. Người bệnh, người mới phẫu thuật hoặc đang điều trị tại bệnh viện",
      "Tại các bệnh viện lớn ở Đà Nẵng như Bệnh viện Đa khoa Gia Đình, Bệnh viện Hoàn Mỹ, Bệnh viện Quốc tế Vinmec, Bệnh viện Phụ Sản – Nhi hay Bệnh viện Đà Nẵng, người bệnh rất cần nguồn dinh dưỡng lỏng ấm, sạch tuyệt đối và dễ tiêu hóa. Thố yến chưng nóng Hà Mi với 35g yến tươi thật giúp bù đắp năng lượng, hỗ trợ phục hồi thể lực nhanh chóng mà không gây đầy bụng.",
      "### 2. Mẹ bầu cần thêm dưỡng chất và sản phụ sau sinh",
      "Giai đoạn thai kỳ và sau sinh đòi hỏi thực phẩm không chất bảo quản, giàu protein tinh khiết và khoáng chất. Một thố yến chưng nóng vị Thanh Nguyên hoặc Dừa Mật Thanh Dịu ấm thơm giao tận nhà giúp mẹ bầu giảm mệt mỏi, ngủ ngon giấc và dưỡng thai khỏe mạnh.",
      "### 3. Ông bà lớn tuổi và gia đình chu toàn sức khỏe",
      "Người cao tuổi thường có hệ tiêu hóa nhạy cảm và giấc ngủ chập chờn. Thố yến ấm chưng cùng hạt sen bùi mềm, táo đỏ, nhãn nhục và kỷ tử là món quà hiếu thảo thiết thực để con cháu chăm sóc ông bà mỗi tuần.",
      "## Mạng lưới giao nóng 2H phủ khắp 6 quận nội thành Đà Nẵng",
      "- Quận Hải Châu: Trung tâm hành chính, tư gia, văn phòng và cụm bệnh viện lớn (Giao nhanh chỉ từ 60 – 90 phút sau khi lên lửa).",
      "- Quận Thanh Khê & Quận Cẩm Lệ: Các khu dân cư trung tâm, Khu đô thị Hòa Xuân, Khuê Trung.",
      "- Quận Sơn Trà & Quận Ngũ Hành Sơn: Khu vực ven biển, khu dân cư Mỹ An, An Hải, biệt thự và khách sạn nghỉ dưỡng.",
      "- Quận Liên Chiểu: Hỗ trợ giao tận nơi theo khung giờ xác nhận.",
      "## Cam kết an tâm từ Yến Sào Hà Mi",
      "- Định lượng minh bạch: Mỗi thố sứ 200ml chứa đến 35g yến tươi thật nguyên tổ, giá chỉ từ 295.000đ / 1 thố.",
      "- Miễn phí giao hàng (Free Ship) cho mọi đơn hàng từ 2 thố hoặc các Set Quà Yến Sào.",
      "- Hoàn tiền hoặc đổi mới ngay lập tức nếu thố yến khi nhận không đảm bảo độ ấm nóng và chất lượng cam kết.",
    ].join("\n\n"),
  },
  {
    id: "post-seo-3",
    slug: "cam-nang-dinh-duong-thoi-diem-vang-dung-yen-sao",
    title: "Cẩm Nang Dinh Dưỡng: Thời Điểm Vàng Và Cách Dùng Yến Sào Cho Mẹ Bầu, Người Bệnh & Người Cao Tuổi",
    category: "Cẩm nang sức khỏe",
    excerpt:
      "Hướng dẫn chi tiết 2 khung giờ vàng trong ngày và liều lượng dùng yến tươi chưng nóng chuẩn khoa học giúp mẹ bầu, người mới ốm dậy và ông bà lớn tuổi hấp thu trọn vẹn dưỡng chất.",
    coverImageUrl: "/bai-viet/banner_bai_3_cam_nang_dinh_duong.jpg",
    coverImageAlt: "Thời điểm vàng dùng yến sào bồi bổ cho mẹ bầu, người bệnh và người cao tuổi",
    isPublished: true,
    content: [
      "Yến sào từ lâu đã được trân quý nhờ hàm lượng đạm tự nhiên cao cùng 18 loại axit amin không thể thay thế. Tuy nhiên, để từng sợi yến thực sự chuyển hóa thành sinh lực, giúp mẹ bầu khỏe khoắn, người bệnh mau lại sức và ông bà ngủ sâu giấc, việc ăn yến đúng thời điểm và đúng liều lượng đóng vai trò quyết định. Dưới đây là cẩm nang dinh dưỡng thực tế từ đội ngũ Yến Sào Hà Mi.",
      "## 1. Hai “Khung Giờ Vàng” giúp cơ thể hấp thu đến 95% vi chất",
      "Khả năng hấp thu protein và các chuỗi peptide trong tổ yến phụ thuộc mật thiết vào trạng thái của dạ dày và nhịp sinh học của cơ thể:",
      "### Khung giờ vàng 1: Buổi sáng sớm khi bụng đói (30 phút trước bữa ăn sáng)",
      "Sau một đêm dài nghỉ ngơi, dạ dày đã tiêu hóa hết thức ăn hôm trước và ở trạng thái rỗng nhẹ. Thưởng thức một thố yến tươi chưng nóng 200ml lúc này giúp làm ấm bao tử, kích hoạt hệ tiêu hóa một cách êm dịu. Toàn bộ axit amin, Sialic Acid và vi khoáng trong 35g yến tươi sẽ được niêm mạc dạ dày và ruột non hấp thu trực tiếp mà không bị cạnh tranh bởi các chất béo hay tinh bột nặng nề, mang lại nguồn năng lượng tỉnh táo cho cả ngày.",
      "### Khung giờ vàng 2: Buổi tối trước khi đi ngủ (30 – 45 phút)",
      "Khoảng thời gian từ 21:00 đến 22:00 tối (sau bữa ăn tối khoảng 2 tiếng) là thời điểm tuyệt vời để dùng yến ấm. Khi cơ thể bước vào trạng thái nghỉ ngơi ban đêm, quá trình tái tạo tế bào, phục hồi mô tổn thương và tăng cường miễn dịch diễn ra mạnh mẽ nhất. Các axit amin như Tryptophan và Serine trong yến kết hợp cùng hạt sen, táo đỏ giúp an thần tự nhiên, xua tan mệt mỏi và đưa ông bà, mẹ bầu vào giấc ngủ sâu trọn vẹn.",
      "## 2. Hướng dẫn chọn vị và liều lượng chuẩn cho từng người thân trong gia đình",
      "### A. Mẹ bầu (Từ tháng thứ 4 của thai kỳ) và mẹ sau sinh",
      "- Nhu cầu: Bổ sung đạm sạch, canxi, sắt và Sialic Acid hỗ trợ phát triển trí não thai nhi, tăng sức đề kháng cho mẹ và phục hồi nhanh sau sinh.",
      "- Món yến khuyên dùng: Thanh Nguyên (Đường phèn gừng tươi ấm bụng), Dừa Mật Thanh Dịu (Mật hoa dừa hữu cơ chỉ số đường huyết thấp, hạn chế tiểu đường thai kỳ) hoặc Ngũ Bảo Hạt Chia.",
      "- Liều lượng hợp lý: Dùng đều đặn 2 – 3 thố/tuần (mỗi thố 200ml chứa 35g yến tươi thật).",
      "### B. Người đang hồi phục sau bệnh, sau phẫu thuật hoặc suy nhược cơ thể",
      "- Nhu cầu: Tái tạo mô cơ, làm lành vết thương, bồi bổ khí huyết khi cơ thể còn mệt mỏi, chán ăn và khó tiêu hóa thức ăn đặc.",
      "- Món yến khuyên dùng: Hồng Liên Kim Thảo (Yến tươi, hạt sen, táo đỏ, đông trùng hạ thảo) hoặc Kim Thảo để tăng cường sức đề kháng và phục hồi thể lực.",
      "- Liều lượng hợp lý: Dùng 3 – 4 thố/tuần trong giai đoạn hồi phục tích cực. Nên dùng ngay khi thố sứ còn ấm nóng để dễ nuốt và ấm bụng.",
      "### C. Ông bà, cha mẹ lớn tuổi",
      "- Nhu cầu: Bồi bổ lục phủ ngũ tạng, hỗ trợ trí nhớ, cải thiện giấc ngủ và tăng cường hệ miễn dịch khi thời tiết giao mùa.",
      "- Món yến khuyên dùng: Tứ Quý An Nhiên (Táo đỏ, nhãn nhục, hạt sen, kỷ tử) hoặc Dừa Mật Thanh Dịu (vị ngọt dịu tự nhiên từ mật hoa dừa).",
      "- Liều lượng hợp lý: Dùng 2 – 3 thố/tuần vào buổi sáng sớm hoặc buổi tối trước khi ngủ 45 phút.",
      "## 3. Lưu ý nhỏ để giữ trọn giá trị thố yến chưng nóng",
      "- Không nên ăn yến ngay sau bữa ăn chính đang quá no vì lúc này dịch vị dạ dày đang tập trung tiêu hóa thực phẩm thô, làm giảm hiệu suất hấp thu vi chất quý của yến.",
      "- Với thố yến tươi chưng nóng Hà Mi, ngon và bổ dưỡng nhất là thưởng thức ngay khi vừa giao đến trong 2 giờ. Nếu chưa dùng hết, quý khách đậy kín nắp thố sứ, bảo quản ngăn mát tủ lạnh (2–5°C) và dùng trong vòng 24 giờ.",
    ].join("\n\n"),
  },
  {
    id: "post-seo-4",
    slug: "nghe-thuat-chon-qua-bieu-suc-khoe-da-nang",
    title: "Nghệ Thuật Chọn Quà Biếu Sức Khỏe Tại Đà Nẵng: Gửi Gắm Tình Thân Trọn Vẹn Trong Thố Yến Ấm Nóng",
    category: "Nghệ thuật quà biếu",
    excerpt:
      "Gợi ý cách chọn quà thăm bệnh, quà biếu ông bà cha mẹ và quà tặng đối tác tinh tế tại Đà Nẵng với Thố Yến Tươi Chưng Nóng Giao Ngay 2H và Bộ Sưu Tập Set Quà Hoa Sen Vàng Hà Mi.",
    coverImageUrl: "/bai-viet/banner_bai_4_qua_bieu_suc_khoe.jpg",
    coverImageAlt: "Set quà biếu sức khỏe yến sào cao cấp và thố yến chưng nóng tại Đà Nẵng",
    isPublished: true,
    content: [
      "Trong nét đẹp văn hóa của người Việt, một món quà biếu ý nghĩa không nằm ở sự phô trương cầu kỳ, mà ở sự thấu hiểu và tấm lòng chân thành dành cho sức khỏe của người nhận. Khi đến thăm một người thân đang ốm, mừng mẹ bầu đón tin vui, kính biếu ông bà cha mẹ hay tri ân đối tác tại Đà Nẵng, một món quà sức khỏe tinh khiết, ấm áp và thiết thực luôn chạm đến trái tim sâu sắc nhất.",
      "## 1. Vì sao quà tặng sức khỏe thuần khiết ngày càng được trân trọng?",
      "Thay vì những giỏ bánh kẹo nhiều đường tinh luyện hay thức uống có cồn chỉ mang tính hình thức, các gia đình hiện đại ưu tiên chọn những món quà bồi bổ thực chất, có thể sử dụng ngay và an toàn tuyệt đối. Một món quà sức khỏe trọn vẹn cần hội tụ 3 yếu tố:",
      "- Giá trị dinh dưỡng thật & nguồn gốc minh bạch: Tổ yến Việt Nam nguyên chất 100%, sơ chế bằng nước lọc RO tinh khiết, đạt chứng nhận quốc tế ISO 22000:2018 & FDA Hoa Kỳ.",
      "- Sự tinh tế, ấm áp khi trao nhận: Từ độ ấm nóng của thố sứ vừa chưng đến nét chữ viết tay nắn nót trên tấm thiệp chúc sức khỏe.",
      "- Phù hợp hoàn cảnh người nhận: Dễ dùng ngay cho người bệnh, mẹ bầu, người cao tuổi hoặc sang trọng, trang nhã khi đặt trên bàn tiếp khách doanh nghiệp.",
      "## 2. Gợi ý 3 lựa chọn quà biếu sức khỏe tinh tế từ Yến Sào Hà Mi",
      "### Lựa chọn 1: Thố Yến Tươi Chưng Nóng 200ml (Kèm Hộp Quà Thăm Hỏi & Thiệp Viết Tay)",
      "Đây là món quà thăm hỏi ấm lòng và thiết thực bậc nhất tại Đà Nẵng. Mỗi thố sứ cao cấp 200ml chứa đến 35g yến tươi thật chưng thủ công cùng táo đỏ, hạt sen, kỷ tử hoặc đông trùng hạ thảo, giá chỉ từ 295.000đ / thố. Khi giao đến bệnh viện hoặc tư gia chỉ sau 2 giờ, người thân của bạn có thể mở nắp thưởng thức ngay từng muỗng yến ấm thơm mà không cần mất công chế biến.",
      "### Lựa chọn 2: Set Quà Yến Sào Thượng Hạng 6 Vị & Set Quà Hoa Sen Vàng",
      "Dành cho những dịp lễ Tết, mừng thọ ông bà, thăm gia đình hai bên hoặc tặng đối tác: Hộp quà Hoa Sen & Đàn Én ép kim sang trọng gồm 6 hũ yến chưng thượng hạng (Đường Phèn, Gừng Tươi, Nhân Sâm, Đông Trùng Hạ Thảo, Tam Vị, Tứ Vị) với mức giá hợp lý từ 240.000đ – 260.000đ / hộp quà 6 hũ, tiện lợi bảo quản và dùng mỗi ngày.",
      "### Lựa chọn 3: Hộp Quà Tổ Yến Tinh Chế Siêu Sợi & Yến Rút Lông Định Hình Xuất Khẩu (100g)",
      "Tuyệt phẩm quà biếu trọng đại dành tặng cha mẹ, cấp trên hoặc đối tác chiến lược. Những tai yến già nguyên tổ hạng A được rút lông đại thủ công giữ trọn sợi yến dài dày, đóng hộp sang trọng đạt chuẩn xuất khẩu FDA Hoa Kỳ (từ 4.000.000đ – 5.500.000đ / hộp 100g).",
      "## 3. Dịch vụ Gửi Quà Tâm Giao 2H tại Đà Nẵng — Chu đáo từng chi tiết nhỏ",
      "Tại Yến Sào Hà Mi, mỗi đơn quà biếu đều được chăm chút như chính món quà chúng tôi gửi tặng người thân trong gia đình mình:",
      "- Thiệp chúc mừng viết tay miễn phí: Bạn chỉ cần để lại lời nhắn khi đặt hàng trên website hoặc Zalo, Hà Mi sẽ nắn nót ghi thiệp trang trọng.",
      "- Tùy chọn Ẩn giá trên phiếu giao hàng: Đảm bảo sự tế nhị tuyệt đối khi shipper giao quà trực tiếp đến người nhận.",
      "- Giao hẹn giờ & Giao nóng trong 2H khắp Đà Nẵng: Miễn phí vận chuyển cho đơn từ 2 thố sứ hoặc các Set Quà Yến Sào.",
    ].join("\n\n"),
  },
];

