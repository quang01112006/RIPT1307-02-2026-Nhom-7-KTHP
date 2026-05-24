import axios from 'axios';

// ==========================================
// CẤU HÌNH CLOUDINARY UPLOAD TRỰC TIẾP (CLIENT-SIDE)
// ==========================================
export const CLOUDINARY_CONFIG = {
	cloudName: 'dmshkv3qm', // Cloud Name của bạn
	uploadPreset: 'bropukd5', // Upload Preset (Unsigned)
};

/**
 * Hàm upload ảnh trực tiếp lên Cloudinary dùng chung cho toàn bộ dự án
 * @param file: Đối tượng File nhận từ Input hoặc Kéo thả
 * @returns Trả về URL ảnh an toàn (secure_url) từ Cloudinary
 */
export const uploadToCloudinary = async (file: File): Promise<string> => {
	const formData = new FormData();
	formData.append('file', file);
	formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);

	// 1. Tạo instance Axios mới tinh, cô lập hoàn toàn
	const cleanAxios = axios.create();

	// 2. Xóa sạch mọi cấu hình thừa kế toàn cục có thể gây lỗi CORS với Cloudinary
	cleanAxios.defaults.withCredentials = false;
	if (cleanAxios.defaults.headers.common) {
		delete cleanAxios.defaults.headers.common['Authorization'];
	}

	// 3. Tiến hành upload
	const response = await cleanAxios.post(
		`https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`,
		formData,
	);

	return response.data.secure_url;
};
