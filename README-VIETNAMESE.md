# Phần Mềm Quản Lý Phân Công Án - Viện Kiểm Sát

## Giới Thiệu

Đây là phần mềm quản lý phân công án dành cho Viện Kiểm Sát Nhân Dân, được phát triển với React TypeScript và Vite. Ứng dụng cung cấp các tính năng quản lý cán bộ kiểm sát, phân công án thông minh và thống kê báo cáo.

## Tính Năng Chính

### 🏠 Dashboard (Bảng Điều Khiển)
- **Biểu đồ thanh ngang**: Hiển thị tổng quan số lượng vụ án và bị can mà mỗi kiểm sát viên đang giải quyết
- **Biểu đồ tròn**: Phân bố chức vụ của cán bộ
- **Thống kê tổng quan**: Tổng số kiểm sát viên, vụ án, bị can và tải công việc trung bình
- **Bảng top 10**: Kiểm sát viên theo tải công việc

### 👥 Quản Lý Cán Bộ
- **Danh sách cán bộ**: Hiển thị đầy đủ thông tin kiểm sát viên
- **Bộ lọc mạnh mẽ**:
  - Phân cấp: Kiểm sát viên, Kiểm tra viên, Chuyên viên
  - Tag chuyên môn: Hình sự, Dân sự, Hành chính, Kinh tế, v.v.
  - Năm công tác và tải công việc
- **Thanh tìm kiếm**: Tìm kiếm nhanh theo tên
- **Popup thông tin chi tiết**: Xem, sửa, cập nhật thông tin cán bộ

### ⚖️ Phân Án Thông Minh
- **Hệ thống đề xuất**: Gợi ý kiểm sát viên phù hợp nhất dựa trên:
  - Số vụ án và bị can hiện tại
  - Lần nhận án gần nhất/xa nhất
  - Tag chuyên môn
  - Kinh nghiệm làm việc
- **Phân án thủ công**: Tự chọn kiểm sát viên từ danh sách
- **Quản lý vụ án**: Thêm mới, theo dõi trạng thái vụ án

### 💾 Lưu Trữ và Bảo Mật
- **Lưu trữ cục bộ**: Sử dụng Local Storage để lưu trữ dữ liệu trên trình duyệt
- **⚠️ Chế độ Local**: Hiện tại chạy local only, Supabase tạm thời vô hiệu hóa
- **Xuất/Nhập dữ liệu**: Định dạng JSON để sao lưu và khôi phục

## Công Nghệ Sử Dụng

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Backend**: Supabase (tùy chọn)
- **Router**: React Router DOM

## Cài Đặt và Chạy

### Yêu Cầu Hệ Thống
- Node.js 18+ 
- npm hoặc yarn

### Các Bước Cài Đặt

1. **Cài đặt dependencies**:
   ```bash
   npm install
   ```

2. **⚠️ Lưu ý**: Hiện tại chạy chế độ local only:
   - Dữ liệu lưu trữ trên trình duyệt
   - Supabase tạm thời bị vô hiệu hóa

3. **Chạy ứng dụng**:
   ```bash
   npm run dev
   ```

4. **Mở trình duyệt**: http://localhost:5173

### Build cho Production

```bash
npm run build
```

## Hướng Dẫn Sử Dụng

### Quản Lý Cán Bộ
1. Vào phần "Quản Lý Cán Bộ"
2. Thêm kiểm sát viên mới bằng nút "Thêm Kiểm Sát Viên"
3. Sử dụng bộ lọc để tìm kiếm cán bộ phù hợp
4. Click vào tên để xem chi tiết và cập nhật thông tin

### Phân Công Án
1. Vào phần "Phân Công Án"
2. Thêm vụ án mới nếu cần
3. Chọn vụ án từ danh sách "Chờ phân công"
4. Xem gợi ý hệ thống và chọn kiểm sát viên phù hợp
5. Thêm ghi chú và xác nhận phân công

### Sao Lưu và Khôi Phục
1. Vào phần "Cài Đặt"
2. Sử dụng "Xuất Dữ Liệu" để tạo file backup
3. Sử dụng "Nhập Dữ Liệu" để khôi phục từ file backup

## Cấu Trúc Dự Án

```
src/
├── components/          # React components
│   ├── Dashboard.tsx
│   ├── ProsecutorManagement.tsx
│   └── CaseAssignment.tsx
├── lib/                # Utilities và services
│   └── supabase.ts
├── types/              # TypeScript type definitions
│   └── index.ts
├── utils/              # Helper functions
│   └── assignmentEngine.ts
├── App.tsx             # Main app component
└── main.tsx            # Entry point
```

## Customization

### Thêm Chuyên Môn Mới
Sửa mảng `specializations` trong `ProsecutorManagement.tsx`:
```typescript
const specializations = ['Hình sự', 'Dân sự', 'Hành chính', 'Kinh tế', 'Tham nhũng', 'Môi trường', 'Chuyên môn mới'];
```

### Tùy Chỉnh Thuật Toán Phân Công
Sửa file `src/utils/assignmentEngine.ts` để điều chỉnh các trọng số và điều kiện phân công.

### Thay Đổi Giao Diện
Sửa file `tailwind.config.js` để tùy chỉnh theme và màu sắc.

## Tính Năng Tương Lai

- [ ] Đăng nhập và phân quyền người dùng
- [ ] Lịch sử chi tiết phân công án
- [ ] Báo cáo và thống kê nâng cao  
- [ ] Thông báo và nhắc nhở
- [ ] Mobile app
- [ ] Tích hợp với hệ thống khác

## Hỗ Trợ

Nếu bạn gặp vấn đề hoặc cần hỗ trợ, vui lòng:
1. Kiểm tra log trong Developer Tools (F12)
2. Đảm bảo tất cả dependencies đã được cài đặt
3. Kiểm tra file .env nếu sử dụng Supabase

## License

MIT License - Tự do sử dụng và phân phối.
