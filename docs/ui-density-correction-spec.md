# Ha Mi: giam mat do chu sau SEO

Ngay: 2026-10-08
Trang kiem tra: http://127.0.0.1:3006/
Trang thai: spec cua team leader; cho anh duyet model truoc khi giao worker.

## Muc tieu

Trang ban hang uu tien anh san pham, ten mon, gia va thao tac chon mon. SEO khong duoc them hau to tu khoa vao moi the san pham hoac lap thong diep tren nhieu khu vuc. Khong an chu de thao tung tim kiem.

## Van de da xac nhan

- ProductMenuSection noi ten mon voi "tho su 200ml (35g yen tuoi)" tren tat ca the.
- CatalogProductLinesSection noi them the tich da co trong ten, "dac san Ha Mi" va "chuan ISO 22000 & FDA".
- Banner danh muc va heading lien ke lap lai cung mot y.
- Footer co nhieu dong thong diep va mo ta san pham lap lai.
- Khoi Tu bep Ha Mi dung anh bi phu lop mau, nhieu the va chieu cao toi thieu lon.

## Pham vi worker

- components/ProductMenuSection.tsx: hien thi product.name nguyen ban, khong sua du lieu. Gia va nut them giu nguyen. Luoi mobile hai cot, ten toi da hai dong, vung ten co chieu cao on dinh.
- components/CatalogProductLinesSection.tsx: bo hau to SEO tu them; moi danh muc chi mot heading chinh va mot link ngan. Rut gon nhan tab the tich; gia van hien thi o the san pham. Giu href, anchor ID va luong gio hang.
- app/page.tsx: bo eyebrow va thong diep trung lap; heading ngan. Khoi Tu bep Ha Mi uu tien anh ro net, mot cau ngan, khong cards long cards. FAQ van co noi dung truy cap duoc qua details; cau hoi ngan va cau tra loi huu ich, khong nhai tu khoa.
- components/SiteFooter.tsx: logo, dia chi chinh, so dien thoai va link can thiet; giam mo ta lap lai. Mobile gom nhom link bang details neu can, van render link trong HTML.
- Khong them claim moi; khong dua ISO/FDA chua co bang chung vao text ban hang moi.

## Bat bien

- Khong thay metadata, canonical, sitemap, preview noindex, schema Product/LocalBusiness hoac du lieu DB trong nhiem vu nay.
- Neu thay FAQ thi FaqJsonLd phai dung cung noi dung voi FAQ hien thi, khong con claim cu chi trong schema.
- Khong an SEO paragraph bang CSS, khong giam font chu de nhet text.
- Khong sua gia, ten trong DB, supportedOptions, variant, trang thai het hang, checkout hoac thong tin khach hang.
- Giu anh va nhan anh minh hoa khi ap dung; giu nut dat hang va kenh lien he nhanh.
- Khong commit, push, deploy hoac thay credentials.

## Nghiem thu cua leader

- Screenshot truoc/sau o CSS viewport 390, 430 va desktop 1440; kiem tra viewport thuc te, khong chi kich thuoc screenshot.
- Khong tran ngang, khong overlap, nut thao tac co kich thuoc cham toi thieu 44px.
- The mon chi ten, gia, trang thai can thiet va nut them; khong them hau to SEO.
- Ten mon, gia va nut co vi tri on dinh giua cac the.
- Thu loc mon, them gio, mon het hang; FAQ mo/dong va link danh muc hoat dong.
- npm test, npm run lint, npm run build pass; canonical va robots khong thay doi.
- Leader review va cham diem rieng ve truc quan, mobile, luong dat hang va SEO; khong chap nhan chi dua tren build pass.

## Model de xuat

Gemini 3.8 Flash Medium qua Antigravity CLI cho patch gioi han tren. Leader cung cap source can thiet, review patch va nghiem thu tren trinh duyet. Khong tu doi model neu chat luong chua dat; bao lai anh truoc khi giao lan khac.
