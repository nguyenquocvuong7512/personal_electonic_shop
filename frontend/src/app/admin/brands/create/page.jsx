'use client'; // Đánh dấu cho Next.js App Router biết đây là Client Component (chạy phía trình duyệt)

import React, { useState } from 'react'; // Import React và hook useState để quản lý state
import { useRouter } from 'next/navigation'; // Import hook useRouter để thực hiện điều hướng trang trong App Router

// Import hàm API xử lý việc gửi dữ liệu thương hiệu mới lên Server
import { createBrand } from '@/services/brandService';

// Import CSS định dạng giao diện cho trang quản lý thương hiệu
import '@/styles/admin/brands.css';

export default function CreateBrandPage() {
    // Khởi tạo router để chuyển hướng trang khi hoàn thành hoặc hủy bỏ
    const router = useRouter();

    // State theo dõi trạng thái gửi form (true: đang gửi/xử lý, false: rảnh)
    const [submitting, setSubmitting] = useState(false);

    // State chứa thông báo lỗi để hiển thị ra giao diện khi validate thất bại hoặc có lỗi từ API
    const [error, setError] = useState('');

    // State lưu trữ dữ liệu dạng văn bản của các trường nhập trong form
    const [formData, setFormData] = useState({
        ten: '',       // Tên thương hiệu
        slug: '',      // Chuỗi định danh URL (slug)
        mota: '',      // Mô tả thương hiệu
        trangthai: 'hienthi', // Trạng thái hiển thị mặc định
    });

    // State lưu trữ file ảnh thực tế (Object File) được chọn từ máy tính
    const [imageFile, setImageFile] = useState(null);

    // State lưu chuỗi đường dẫn tạm (Blob URL) dùng để xem trước (preview) hình ảnh
    const [imagePreview, setImagePreview] = useState('');

    // ==================== XỬ LÝ NHẬP INPUT DẠNG CHUỖI TỔNG QUÁT ====================
    /**
     * Cập nhật formData dựa trên `name` và `value` của thẻ input/select/textarea
     */
    const handleInputChange = (e) => {
        const { name, value } = e.target; // Lấy ra name và value của phần tử đang kích hoạt sự kiện

        setFormData((prev) => ({
            ...prev,          // Giữ nguyên các giá trị cũ
            [name]: value,   // Ghi đè/Cập nhật giá trị mới cho trường tương ứng
        }));
    };

    // ==================== XỬ LÝ CHỌN VÀ VALIDATE TỆP HÌNH ẢNH ====================
    /**
     * Lấy tệp tin ảnh từ input file, kiểm tra định dạng và dung lượng trước khi duyệt
     */
    const handleImageChange = (e) => {
        const file = e.target.files?.[0]; // Lấy tệp đầu tiên trong danh sách người dùng chọn

        // Nếu người dùng bật cửa sổ chọn file nhưng bấm "Hủy" (không chọn file)
        if (!file) {
            setImageFile(null);     // Xóa dữ liệu file ảnh đã chọn trước đó
            setImagePreview('');    // Xóa đường dẫn xem trước ảnh
            return;
        }

        // Danh sách định dạng ảnh hợp lệ
        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/webp',
        ];

        // Kiểm tra định dạng tệp có nằm trong danh sách cho phép hay không
        if (!allowedTypes.includes(file.type)) {
            setError('Ảnh phải có định dạng JPG, JPEG, PNG hoặc WEBP!'); // Gán thông báo lỗi
            e.target.value = ''; // Reset lại ô chọn file trên giao diện
            return;
        }

        // Kiểm tra dung lượng tệp (5MB = 5 * 1024 * 1024 Bytes)
        if (file.size > 5 * 1024 * 1024) {
            setError('Ảnh không được vượt quá 5MB!'); // Gán thông báo lỗi
            e.target.value = ''; // Reset lại ô chọn file
            return;
        }

        setError(''); // Xóa thông báo lỗi cũ nếu tệp hợp lệ

        setImageFile(file); // Lưu tệp tin hợp lệ vào state

        // Tạo URL tạm thời đại diện cho file ảnh trên bộ nhớ máy tính để hiển thị xem trước
        setImagePreview(URL.createObjectURL(file));
    };

    // ==================== HÀM TẠO SLUG CHUẨN URL ====================
    /**
     * Chuyển đổi tên tiếng Việt có dấu thành Slug không dấu, nối với nhau bằng dấu gạch ngang
     * @param {string} text - Chuỗi văn bản nhập vào
     * @returns {string} Chuỗi slug hợp lệ
     */
    const createSlug = (text) => {
        return text
            .toString()
            .normalize('NFD')                  // Phân tách ký tự có dấu thành ký tự gốc + ký tự dấu rời
            .replace(/[\u0300-\u036f]/g, '')   // Loại bỏ hoàn toàn các ký tự dấu rời
            .replace(/đ/g, 'd')                // Chuyển ký tự 'đ' thường thành 'd'
            .replace(/Đ/g, 'D')                // Chuyển ký tự 'Đ' hoa thành 'D'
            .toLowerCase()                     // Chuyển toàn bộ thành chữ in thường
            .trim()                            // Xóa khoảng trắng thừa ở 2 đầu chuỗi
            .replace(/[^a-z0-9\s-]/g, '')      // Loại bỏ tất cả ký tự đặc biệt (chỉ giữ lại chữ cái, số, khoảng trắng và dấu -)
            .replace(/\s+/g, '-')              // Thay thế một hoặc nhiều khoảng trắng liên tiếp thành dấu gạch ngang (-)
            .replace(/-+/g, '-');              // Gộp nhiều dấu gạch ngang liên tiếp thành một dấu gạch ngang đơn
    };

    // ==================== XỬ LÝ NHẬP TÊN THƯƠNG HIỆU ====================
    /**
     * Tự động sinh ra slug tương ứng trong khi người dùng nhập tên thương hiệu
     */
    const handleNameChange = (e) => {
        const value = e.target.value; // Lấy giá trị tên người dùng vừa nhập

        setFormData((prev) => ({
            ...prev,
            ten: value,                   // Cập nhật tên thương hiệu
            slug: createSlug(value),      // Tự động chuyển đổi tên thành slug và cập nhật vào state slug
        }));
    };

    // ==================== XỬ LÝ GỬI FORM (SUBMIT) ====================
    const handleSubmit = async (e) => {
        e.preventDefault(); // Ngăn chặn sự kiện submit mặc định của trình duyệt (tránh tải lại trang)

        setError(''); // Xóa thông báo lỗi hiện có trước khi bắt đầu validate lại

        // --- Kiểm tra dữ liệu đầu vào phía Client (Validation) ---
        if (!formData.ten.trim()) {
            setError('Vui lòng nhập tên thương hiệu!');
            return; // Dừng thực thi nếu chưa nhập tên
        }

        if (!formData.slug.trim()) {
            setError('Vui lòng nhập slug!');
            return; // Dừng thực thi nếu chưa có slug
        }

        try {
            setSubmitting(true); // Bật trạng thái đang xử lý (khóa nút submit, tránh người dùng bấm trùng)

            // Khởi tạo đối tượng FormData để chứa dữ liệu đa phần (bao gồm cả tệp tin đính kèm)
            const dataToSend = new FormData();

            // Đưa các thông tin văn bản đã qua cắt tỉa khoảng trắng (trim) vào FormData
            dataToSend.append('ten', formData.ten.trim());
            dataToSend.append('slug', formData.slug.trim());
            dataToSend.append('mota', formData.mota.trim());
            dataToSend.append('trangthai', formData.trangthai);

            // Nếu người dùng có chọn file ảnh, đính kèm file đó vào FormData dưới key 'hinhanh'
            if (imageFile) {
                dataToSend.append('hinhanh', imageFile);
            }

            // Gọi hàm API gửi FormData lên Server
            await createBrand(dataToSend);

            sessionStorage.setItem(
                'admin-brand-notice',
                'Thêm thương hiệu thành công!'
            );
            // Nếu thành công, điều hướng người dùng về trang danh sách thương hiệu
            router.push('/admin/brands');
        } catch (err) {
            // --- Bắt và phân loại lỗi phản hồi từ Server (Backend) ---
            if (err.response?.status === 422) {
                // Mã 422: Unprocessable Entity - Lỗi dữ liệu không hợp lệ từ phía Validator của Server
                const errors = err.response?.data?.errors;

                if (errors) {
                    // Trích xuất mảng/chuỗi lỗi của trường đầu tiên bị vi phạm
                    const firstError = Object.values(errors)[0];

                    // Cập nhật câu thông báo lỗi chi tiết ra giao diện
                    setError(
                        Array.isArray(firstError)
                            ? firstError[0]
                            : 'Dữ liệu không hợp lệ!'
                    );
                } else {
                    // Fallback nếu không đọc được chi tiết mảng errors
                    setError(
                        err.response?.data?.message || 'Dữ liệu không hợp lệ!'
                    );
                }
            } else {
                // Các mã lỗi khác (500 Lỗi server, 404, Mất mạng, v.v.)
                setError(
                    err.response?.data?.message || 'Không thể thêm thương hiệu!'
                );
            }
        } finally {
            setSubmitting(false); // Luôn trả trạng thái submitting về false khi hoàn tất (dù thành công hay thất bại)
        }
    };

    return (
        <div className="admin-brands-page">
            {/* ==================== TIÊU ĐỀ VÀ NÚT ĐIỀU HƯỚNG BÊN TRÊN ==================== */}
            <div className="admin-header">
                <h1>Thêm thương hiệu</h1>

                {/* Nút quay lại trang danh sách thương hiệu */}
                <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => router.push('/admin/brands')} // Chuyển hướng về danh sách khi click
                >
                    ← Quay lại
                </button>
            </div>

            {/* ==================== CONTAINER CHỨA FORM ==================== */}
            <div className="brand-form-container">
                <div className="brand-form-header">
                    <h2>Thông tin thương hiệu</h2>
                </div>

                {/* Form nhập liệu chính */}
                <form className="brand-form" noValidate onSubmit={handleSubmit}>
                    {/* Hiển thị thông báo lỗi nếu biến state 'error' chứa thông điệp lỗi */}
                    {error && (
                        <div className="brand-message error" role="alert" aria-live="assertive">
                            {error}
                        </div>
                    )}

                    {/* Ô nhập Tên thương hiệu */}
                    <div className="form-group">
                        <label htmlFor="ten">
                            Tên thương hiệu <span>*</span>
                        </label>
                        <input
                            id="ten"
                            name="ten"
                            type="text"
                            value={formData.ten}
                            onChange={handleNameChange} // Vừa lưu tên vừa tự tạo Slug
                            placeholder="Ví dụ: Nike"
                            maxLength={255}
                            required
                        />
                    </div>

                    {/* Ô nhập Slug */}
                    <div className="form-group">
                        <label htmlFor="slug">
                            Slug <span>*</span>
                        </label>
                        <input
                            id="slug"
                            name="slug"
                            type="text"
                            value={formData.slug}
                            onChange={handleInputChange} // Cho phép chỉnh sửa slug thủ công nếu cần
                            placeholder="Ví dụ: nike"
                            maxLength={255}
                            required
                        />
                        <small>Slug phải là duy nhất.</small>
                    </div>

                    {/* Ô nhập Mô tả thương hiệu */}
                    <div className="form-group">
                        <label htmlFor="mota">Mô tả</label>
                        <textarea
                            id="mota"
                            name="mota"
                            value={formData.mota}
                            onChange={handleInputChange} // Cập nhật mô tả vào state
                            placeholder="Nhập mô tả thương hiệu..."
                            rows="5"
                        />
                    </div>

                    {/* Ô chọn File hình ảnh */}
                    <div className="form-group">
                        <label htmlFor="hinhanh">
                            Hình ảnh
                        </label>

                        <input
                            id="hinhanh"
                            name="hinhanh"
                            type="file"
                            accept="image/jpeg,image/png,image/webp" // Giới hạn loại file người dùng có thể chọn trong hộp thoại chọn file
                            onChange={handleImageChange}            // Xử lý kiểm tra và tạo URL xem trước ảnh
                        />

                        <small>
                            Chọn ảnh JPG, PNG hoặc WEBP. Tối đa 5MB.
                        </small>

                        {/* Khối hiển thị ảnh xem trước (Render có điều kiện: chỉ hiện khi đã chọn file hợp lệ) */}
                        {imagePreview && (
                            <div style={{ marginTop: '15px' }}>
                                <p>
                                    <strong>Xem trước:</strong>
                                </p>

                                <img
                                    src={imagePreview} // Sử dụng URL blob tạm thời
                                    alt="Xem trước"
                                    style={{
                                        width: '150px',
                                        height: '150px',
                                        objectFit: 'contain',
                                        border: '1px solid #ddd',
                                        borderRadius: '8px',
                                        padding: '5px',
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Khối chọn Trạng thái (Hiển thị / Ẩn) */}
                    <div className="form-group">
                        <label htmlFor="trangthai">Trạng thái</label>
                        <select
                            id="trangthai"
                            name="trangthai"
                            value={formData.trangthai}
                            onChange={handleInputChange}
                        >
                            <option value="hienthi">Hiển thị</option>
                            <option value="an">Ẩn</option>
                        </select>
                    </div>

                    {/* ==================== CÁC NÚT ĐIỀU HƯỚNG VÀ SUBMIT ==================== */}
                    <div className="form-actions">
                        {/* Nút Hủy */}
                        <button
                            type="button"
                            className="btn-cancel"
                            onClick={() => router.push('/admin/brands')}
                            disabled={submitting} // Vô hiệu hóa nút khi đang gửi request
                        >
                            Hủy
                        </button>

                        {/* Nút Submit Form */}
                        <button
                            type="submit"
                            className="btn-save"
                            disabled={submitting} // Vô hiệu hóa nút để chống bấm gửi nhiều lần (anti-double-click)
                        >
                            {/* Thay đổi nội dung chữ hiển thị trên nút tùy thuộc vào trạng thái submitting */}
                            {submitting ? 'Đang thêm...' : 'Thêm thương hiệu'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}