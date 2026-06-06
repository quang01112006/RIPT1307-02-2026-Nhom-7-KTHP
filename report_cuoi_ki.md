# Báo Cáo Tổng Quan Dự Án: EduStack - Nền Tảng Hỏi Đáp Công Nghệ

## 1. Giới thiệu tổng quan (Overview)
**EduStack** là một nền tảng hỏi đáp (Q&A), chia sẻ kiến thức chuyên sâu về Công nghệ Thông tin (IT). Dự án được thiết kế hướng tới môi trường học thuật và cộng đồng lập trình viên, là nơi sinh viên, giảng viên và những người đam mê công nghệ có thể đặt câu hỏi, thảo luận, chia sẻ tài liệu và giải quyết các vấn đề lập trình một cách nhanh chóng. 

Mục tiêu của EduStack không chỉ là nơi lưu trữ kiến thức mà còn xây dựng một cộng đồng tương tác mạnh mẽ thông qua hệ thống xếp hạng (Leaderboard), huy hiệu, đánh giá chất lượng câu trả lời (Upvote/Downvote) và hệ thống thông báo thời gian thực (Real-time notifications).

---

## 2. Công nghệ và Thư viện sử dụng (Technology Stack)

Dự án được xây dựng dựa trên kiến trúc **Client-Server** hiện đại, tách biệt hoàn toàn giữa Frontend và Backend. Cả hai phần đều sử dụng **TypeScript** làm ngôn ngữ lập trình chính, giúp đảm bảo Type Safety và giảm thiểu lỗi trong quá trình phát triển.

### 2.1. Frontend (Giao diện người dùng)
Frontend được phát triển theo mô hình Single Page Application (SPA), sử dụng hệ sinh thái React.
*   **Framework Core:** 
    *   `ReactJS (v17)`: Thư viện cốt lõi để xây dựng UI component.
    *   `UmiJS (v3)`: Framework Enterprise cấp cao dựa trên React, hỗ trợ Routing, SSR, State Management (thông qua `@umijs/plugin-model`).
*   **UI/UX & Styling:**
    *   `Ant Design (v4)`: Thư viện UI Component chính, cung cấp giao diện chuẩn mực, chuyên nghiệp và đồng bộ (Grid, Form, Table, Card, Modal...).
    *   `LESS / Styled-components`: Quản lý CSS, hỗ trợ biến (variables), nesting và CSS-in-JS.
    *   `Framer-motion`: Tạo các hiệu ứng chuyển động (animation) mượt mà.
*   **Rich Text Editor:**
    *   `TinyMCE (@tinymce/tinymce-react)`: Trình soạn thảo văn bản WYSIWYG mạnh mẽ được sử dụng để soạn thảo nội dung câu hỏi và câu trả lời, hỗ trợ định dạng code, chèn ảnh, bảng biểu.
    *   *(Đã loại bỏ `react-quill` để chuyển sang TinyMCE nhằm mang lại trải nghiệm soạn thảo tốt hơn).*
*   **Biểu đồ & Thống kê:**
    *   `ApexCharts / @ant-design/plots`: Trực quan hóa dữ liệu trên trang Admin Dashboard (biểu đồ lượt truy cập, xu hướng bài viết).
*   **Quản lý State & Call API:**
    *   `Axios`: Thực hiện các HTTP Requests tương tác với Backend.
    *   `Umi Models`: Quản lý state toàn cục thay thế Redux (lưu trữ thông tin User, danh sách Bài viết, Bình luận, Tags).
*   **Real-time & Khác:**
    *   `Socket.io-client`: Lắng nghe các sự kiện theo thời gian thực (nhận thông báo khi có người bình luận, upvote).
    *   `Moment.js`: Xử lý và định dạng thời gian (ví dụ: "5 phút trước", "19 ngày trước").

### 2.2. Backend (Máy chủ & API)
Backend được xây dựng theo kiến trúc Microservices/Monolithic linh hoạt bằng framework NestJS, cung cấp RESTful APIs cho Client.
*   **Framework Core:**
    *   `NestJS (v11)`: Framework Node.js chuyên nghiệp dựa trên kiến trúc của Angular (Module, Controller, Service, Dependency Injection).
*   **Cơ sở dữ liệu (Database):**
    *   `MongoDB`: Cơ sở dữ liệu NoSQL, lưu trữ dữ liệu dưới dạng JSON Document linh hoạt, phù hợp với hệ thống bài viết nhiều thẻ tags và bình luận đa cấp.
    *   `Mongoose` (`@nestjs/mongoose`): Thư viện Object Data Modeling (ODM) để định nghĩa Schema và query dữ liệu.
*   **Bảo mật & Xác thực (Authentication & Security):**
    *   `Passport` (`@nestjs/passport`): Middleware xác thực.
    *   `JWT (JSON Web Token)`: Cơ chế cấp phát token sau khi đăng nhập thành công.
    *   `Bcrypt`: Băm (hashing) mật khẩu trước khi lưu vào cơ sở dữ liệu để bảo mật.
    *   `@nestjs/throttler`: Chống tấn công DDOS, Spam API bằng cơ chế Rate Limiting.
*   **Real-time (WebSockets):**
    *   `Socket.io` (`@nestjs/platform-socket.io`): Xây dựng Gateway lắng nghe và phát tín hiệu (emit) cho các thông báo thời gian thực.
*   **Tính năng Bổ trợ:**
    *   `Nodemailer`: Gửi email tự động (xác thực tài khoản, khôi phục mật khẩu).
    *   `Swagger` (`@nestjs/swagger`): Tự động tạo tài liệu API (API Documentation) trực quan, giúp Frontend dễ dàng tích hợp.
    *   `Class-validator` & `Class-transformer`: Validate dữ liệu đầu vào từ Client một cách chặt chẽ.

---

## 3. Cấu trúc Thư mục (Folder Structure)

Cách chia folder chuẩn hóa theo kiến trúc thiết kế phần mềm chuyên nghiệp.

### 3.1. Frontend (`/frontend`)
*   `config/`: Chứa các cấu hình của UmiJS (`config.ts`, `routes.ts` để định nghĩa đường dẫn).
*   `src/`
    *   `assets/`: Chứa tài nguyên tĩnh (hình ảnh, logo, favicon).
    *   `components/`: Các UI components dùng chung (TinyEditor, Header, Footer, Custom Table).
    *   `hooks/`: Các custom React Hooks (ví dụ: `useRequireAuth` để bắt buộc người dùng đăng nhập trước khi thao tác).
    *   `models/`: Global States (quản lý trạng thái bài viết, user, bình luận).
    *   `pages/`: Chứa giao diện theo từng Route cụ thể:
        *   `/Admin`: Quản lý người dùng, bài viết, báo cáo vi phạm, tags.
        *   `/ChiTietBaiViet`: Trang đọc câu hỏi và các câu trả lời.
        *   `/DatCauHoi`: Form tạo câu hỏi mới.
        *   `/Leaderboard`: Bảng xếp hạng.
        *   `/Tags`: Danh sách từ khóa và bài viết theo thẻ.
        *   `/TrangChu`: Trang chủ (News Feed).
        *   `/UserProfile`: Trang cá nhân, lịch sử hoạt động, bài viết đã lưu.
        *   `document.ejs`: Template HTML gốc của ứng dụng.
    *   `services/`: Chứa các hàm call API (Axios) tương ứng với từng resource (BaiViet, BinhLuan, User, Tags).
    *   `styles/`: CSS/LESS toàn cục (`global.less`), khai báo biến màu sắc, hiệu ứng (`.hoverable-tag`).
    *   `utils/`: Các hàm tiện ích (format ngày tháng, lấy màu sắc cho tag ngẫu nhiên `getTagColor`).

### 3.2. Backend (`/backend/src`)
*   `auth/`: Module xử lý Đăng nhập, Đăng ký, Cấp phát/Verify JWT.
*   `users/`: Module quản lý thông tin tài khoản, phân quyền (Admin, Teacher, Student), Bookmark bài viết.
*   `posts/`: Module xử lý Câu hỏi (CRUD bài viết, Upvote/Downvote, tăng lượt view).
*   `comments/`: Module quản lý Câu trả lời và Bình luận (Bình luận lồng nhau, Đánh dấu giải pháp đúng).
*   `tags/`: Module thống kê và quản lý Thẻ từ khóa thịnh hành.
*   `notifications/`: Module tạo thông báo (App notification) và xử lý Socket.io Gateway.
*   `reports/`: Module nhận và quản lý các báo cáo vi phạm (Spam, nội dung độc hại).
*   `mail/`: Cấu hình gửi mail thông báo.
*   `dashboard/`: Module tính toán số liệu thống kê trả về cho trang Admin.
*   `common/`: Chứa các Guards (xác thực), Interceptors (chuẩn hóa response), Decorators tự viết.

---

## 4. Danh sách Tính năng chi tiết

### 4.1. Dành cho Khách (Guest - Chưa đăng nhập)
*   **Trang chủ (News Feed):** Xem danh sách câu hỏi mới nhất, câu hỏi chưa có lời giải. Lọc và phân trang mượt mà.
*   **Tìm kiếm & Thẻ (Tags):** Xem danh sách các thẻ thịnh hành, tìm kiếm bài viết theo từ khóa và thẻ phân loại (VD: `NodeJS`, `ReactJS`).
*   **Chi tiết câu hỏi:** Đọc nội dung câu hỏi, xem các câu trả lời và bình luận lồng nhau. Thấy được câu trả lời được chủ post chọn làm "Giải pháp đúng" (Accepted Answer).
*   **Bảng xếp hạng (Leaderboard):** Xem top các lập trình viên nổi bật có nhiều bài đăng/lượt xem nhất, và top các câu hỏi hot nhất trong cộng đồng.
*   **Authentication:** Đăng ký, Đăng nhập, Quên mật khẩu.

### 4.2. Dành cho Thành viên (Student / Teacher)
Bao gồm tính năng của Khách và bổ sung:
*   **Đặt câu hỏi:** Sử dụng TinyMCE Editor để soạn thảo câu hỏi chuyên nghiệp, chèn code block, chèn ảnh. Khai báo các thẻ (tags) phân loại cho câu hỏi.
*   **Tương tác Bài viết:**
    *   **Upvote / Downvote:** Đánh giá chất lượng của một câu hỏi hoặc câu trả lời.
    *   **Trả lời / Bình luận:** Viết câu trả lời cho bài viết, hoặc bình luận trao đổi bên dưới một câu trả lời khác.
    *   **Accept Answer:** Tác giả câu hỏi có quyền "Tích xanh" chọn một câu trả lời là chính xác nhất (Đã giải quyết).
    *   **Lưu bài viết (Bookmark):** Lưu trữ các câu hỏi hay vào danh sách cá nhân để đọc lại sau.
    *   **Báo cáo vi phạm (Report):** Gửi báo cáo cho Admin nếu thấy bài viết/bình luận có chứa lời lẽ toxic, spam.
*   **Trang Cá nhân (User Profile):**
    *   **Overview:** Hiển thị thông tin cá nhân, chức danh (Sinh viên/Giảng viên), danh sách các bài viết gần đây.
    *   **Hoạt động (Activity):** Liệt kê lịch sử các câu hỏi và câu trả lời mà người dùng đã đăng.
    *   **Đã lưu (Bookmarks):** Nơi chứa các bài viết đã bookmark.
*   **Thông báo (Notifications):** Nhận thông báo Real-time khi có người khác upvote bài viết, bình luận vào bài viết của mình, hoặc bài viết được admin duyệt/khóa.

### 4.3. Dành cho Quản trị viên (Admin)
Hệ thống có trang CMS quản lý riêng (Giao diện Pro Layout tích hợp).
*   **Dashboard:** Hiển thị biểu đồ phân tích dữ liệu (Số lượng người dùng mới, lượng bài đăng mỗi ngày, số báo cáo chưa giải quyết).
*   **Quản lý Người dùng:** Xem danh sách, tìm kiếm, chỉnh sửa quyền (Phân quyền Giảng viên), Khóa (Ban) tài khoản vi phạm.
*   **Quản lý Bài viết & Tags:** Sửa, Xóa bài viết nếu vi phạm nguyên tắc cộng đồng. Quản lý danh sách thẻ, gộp thẻ rác.
*   **Xử lý Báo cáo (Report Management):** Xem các báo cáo từ người dùng, đánh giá tình trạng và áp dụng hình phạt (Xóa bài/Khóa tài khoản), sau đó đổi trạng thái báo cáo thành "Đã xử lý".

---

## 5. Luồng hoạt động cơ bản (Operating Flow)

### 5.1. Luồng Q&A (Hỏi - Đáp)
1. **Khởi tạo:** User nhấn nút "Đặt câu hỏi". Giao diện Editor hiện lên -> User nhập Tiêu đề, Nội dung, Tags -> Nhấn Gửi.
2. **Backend xử lý:** Lưu vào bảng `Posts`, extract các Tags để cập nhật vào bảng `Tags` (tăng biến đếm độ phổ biến).
3. **Hiển thị:** Câu hỏi lập tức xuất hiện trên Trang chủ (mục Mới nhất).
4. **Tương tác:** User khác vào xem -> Đọc hiểu vấn đề -> Bấm "Trả lời". Nội dung trả lời được gửi lên API tạo `Comment`.
5. **Thông báo (Real-time):** Backend sử dụng Socket.io phát tín hiệu (emit) trực tiếp đến tác giả của câu hỏi: "Bạn có 1 câu trả lời mới từ User B". Frontend của tác giả nhận tín hiệu và hiển thị Notification Pop-up ở góc màn hình.
6. **Nghiệm thu:** Tác giả đọc câu trả lời -> Thấy đúng -> Bấm nút "Đánh dấu đúng" (Tick xanh). Trạng thái của bài viết đổi từ *Chưa giải quyết* sang *Đã giải quyết*. Bài viết và câu trả lời được cộng điểm uy tín trên Leaderboard.

### 5.2. Luồng Bảo mật và Xử lý Vi phạm
1. User C bình luận một nội dung không phù hợp.
2. User A và B bấm nút Cờ (Report) -> Chọn lý do "Ngôn từ thù địch".
3. Backend tạo bản ghi vào Collection `Reports`.
4. Admin đăng nhập -> Vào trang Quản lý Báo cáo -> Thấy báo cáo về User C.
5. Admin bấm "Khóa tài khoản" -> Tài khoản User C bị đổi trạng thái `isActive = false`.
6. Ở lần tải trang tiếp theo hoặc call API kế tiếp, Guard của Backend sẽ chặn JWT Token của User C, tự động đá User C ra khỏi hệ thống.

---

## 6. Điểm nổi bật về Kỹ thuật của dự án (Technical Highlights)

1. **Hiệu năng & Trải nghiệm UX (Performance):**
   - Ứng dụng dụng cơ chế **Memory Caching** tại Client cho các trang Danh sách (Trang chủ, Hoạt động cá nhân, Bảng xếp hạng). Tránh việc nhấp nháy giao diện khi chuyển trang, giữ lại dữ liệu cũ hiển thị ngay lập tức trong khi chạy ngầm (Background Refresh) cập nhật dữ liệu mới.
   - Sử dụng **Skeleton Loading** thay cho Spinner thông thường, mang lại cảm giác ứng dụng phản hồi mượt mà.
   - Hiệu ứng **Micro-interactions**: Nổi bật thẻ Tags (Hoverable float), badge ranking (1st, 2nd, 3rd) tùy biến đẹp mắt.

2. **Bảo mật mạnh mẽ:**
   - Hệ thống dùng Guards trong NestJS để phân quyền nghiêm ngặt tới từng endpoint (Role-Based Access Control). Không có JWT hợp lệ sẽ không thể truy cập API.
   - Tránh XSS Vulnerability bằng cách sử dụng cấu hình an toàn cho WYSIWYG editor và backend thiết lập CORS, Rate Limiting chặt chẽ.

3. **Cấu trúc linh hoạt mở rộng:**
   - Database được tổ chức theo Reference (MongoDB ObjectId), giúp dễ dàng lấy ra dữ liệu lồng nhau (Post -> Comments -> Sub-comments) thông qua Aggregation/Populate.
   - Mã nguồn chia Module rõ ràng theo Clean Architecture cơ bản, dễ dàng bảo trì hoặc tích hợp thêm tính năng mới trong tương lai.
