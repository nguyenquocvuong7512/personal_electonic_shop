'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import AccountSidebar from '@/components/shop/AccountSidebar';
import { authService } from '@/services/authService';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Form state
  const [formData, setFormData] = useState({
    hoTen: 'Nguyễn Quốc Vượng',
    email: 'vuongtrong@example.com',
    soDienThoai: '0987 654 321',
    ngaySinh: '2004-10-15',
    gioiTinh: 'nam', // 'nam' | 'nu' | 'khac'
  });

  useEffect(() => {
    const currentUser = authService.getUser();
    if (currentUser) {
      setUser(currentUser);
      setFormData((prev) => ({
        ...prev,
        hoTen: currentUser.ten || prev.hoTen,
        email: currentUser.email || prev.email,
        soDienThoai: currentUser.sdt || currentUser.soDienThoai || prev.soDienThoai,
      }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setIsSaved(false);
  };

  const handleGenderChange = (gender) => {
    setFormData((prev) => ({ ...prev, gioiTinh: gender }));
    setIsSaved(false);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setAvatarPreview(imageUrl);
      setIsSaved(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Giả lập lưu dữ liệu
    setTimeout(() => {
      setLoading(false);
      setIsSaved(true);

      // Cập nhật localStorage nếu đã đăng nhập
      if (user) {
        const updatedUser = {
          ...user,
          ten: formData.hoTen,
          email: formData.email,
          sdt: formData.soDienThoai,
        };
        localStorage.setItem('user_info', JSON.stringify(updatedUser));
        setUser(updatedUser);
        window.dispatchEvent(new Event('authChange'));
      }

      setTimeout(() => setIsSaved(false), 4000);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-8 text-gray-800">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb điều hướng */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-yellow-600 transition-colors">
            Trang chủ
          </Link>
          <span>/</span>
          <span className="text-gray-400">Tài khoản</span>
          <span>/</span>
          <span className="font-semibold text-gray-900">Thông tin tài khoản</span>
        </nav>

        {/* Bố cục 2 cột: Sidebar (25%) & Content (75%) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Cột trái: Left Sidebar (25%) */}
          <div className="lg:col-span-1">
            <AccountSidebar activeTab="profile" user={user} />
          </div>

          {/* Cột phải: Right Content Area (75%) */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 sm:p-8">
              {/* Tiêu đề Trang hồ sơ */}
              <div className="pb-6 mb-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    Thông tin tài khoản
                    <span className="inline-block w-2 h-2 rounded-full bg-yellow-400"></span>
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    Quản lý thông tin cá nhân và bảo mật tài khoản mua hàng
                  </p>
                </div>
                <div className="h-1 w-16 bg-yellow-400 rounded-full self-start sm:hidden"></div>
              </div>

              {/* Thông báo Lưu thành công */}
              {isSaved && (
                <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3 animate-fade-in">
                  <svg className="w-5 h-5 text-emerald-600 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">
                    Cập nhật thông tin tài khoản thành công!
                  </span>
                </div>
              )}

              {/* Form Thông tin người dùng & Avatar */}
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Cột Avatar & Nút Tải ảnh (Avatar Section) */}
                  <div className="md:col-span-1 md:order-2 flex flex-col items-center justify-center p-6 bg-slate-50/70 border border-dashed border-gray-200 rounded-2xl">
                    <div className="relative group">
                      <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-yellow-400/40 shadow-md bg-white flex items-center justify-center">
                        {avatarPreview ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={avatarPreview}
                            alt="Avatar người dùng"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-tr from-yellow-100 to-yellow-50 flex items-center justify-center text-yellow-600">
                            <svg viewBox="0 0 24 24" className="w-16 h-16" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                              <circle cx="12" cy="7" r="4" />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Icon camera nhỏ trên avatar */}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-1 right-1 p-2 rounded-full bg-yellow-400 text-gray-950 hover:bg-yellow-500 shadow-md transition-transform hover:scale-110"
                        title="Đổi ảnh đại diện"
                      >
                        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                          <circle cx="12" cy="13" r="4" />
                        </svg>
                      </button>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 shadow-sm transition"
                    >
                      Chọn ảnh đại diện
                    </button>

                    <div className="text-center mt-3 text-xs text-gray-400 space-y-0.5">
                      <p>Dung lượng tối đa 1 MB</p>
                      <p>Định dạng: .JPEG, .PNG, .WEBP</p>
                    </div>
                  </div>

                  {/* Cột các trường biểu mẫu thông tin (Form Fields) */}
                  <div className="md:col-span-2 md:order-1 space-y-5">
                    {/* Họ và tên */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Họ và tên <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                        </span>
                        <input
                          type="text"
                          name="hoTen"
                          value={formData.hoTen}
                          onChange={handleChange}
                          placeholder="Nhập họ và tên đầy đủ..."
                          required
                          className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all placeholder:text-gray-400"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-sm font-semibold text-gray-700">
                          Địa chỉ Email <span className="text-red-500">*</span>
                        </label>
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          Đã xác thực
                        </span>
                      </div>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                            <polyline points="22,6 12,13 2,6" />
                          </svg>
                        </span>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="email@example.com"
                          required
                          className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all placeholder:text-gray-400"
                        />
                      </div>
                    </div>

                    {/* Số điện thoại */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Số điện thoại <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                          </svg>
                        </span>
                        <input
                          type="tel"
                          name="soDienThoai"
                          value={formData.soDienThoai}
                          onChange={handleChange}
                          placeholder="09xx xxx xxx"
                          required
                          className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all placeholder:text-gray-400"
                        />
                      </div>
                    </div>

                    {/* Ngày sinh */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Ngày sinh
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                        </span>
                        <input
                          type="date"
                          name="ngaySinh"
                          value={formData.ngaySinh}
                          onChange={handleChange}
                          className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all"
                        />
                      </div>
                    </div>

                    {/* Giới tính */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Giới tính
                      </label>
                      <div className="flex items-center gap-6">
                        {[
                          { key: 'nam', label: 'Nam' },
                          { key: 'nu', label: 'Nữ' },
                          { key: 'khac', label: 'Khác' },
                        ].map((item) => {
                          const checked = formData.gioiTinh === item.key;
                          return (
                            <label
                              key={item.key}
                              className={`flex items-center gap-2 cursor-pointer select-none text-sm font-medium px-4 py-2 rounded-xl border transition-all ${
                                checked
                                  ? 'bg-yellow-50 border-yellow-400 text-gray-950 font-semibold shadow-xs'
                                  : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                              }`}
                            >
                              <input
                                type="radio"
                                name="gioiTinh"
                                value={item.key}
                                checked={checked}
                                onChange={() => handleGenderChange(item.key)}
                                className="w-4 h-4 text-yellow-500 focus:ring-yellow-400 accent-yellow-500"
                              />
                              <span>{item.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* Nút hành động */}
                    <div className="pt-4 flex items-center gap-3">
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-3 rounded-xl bg-yellow-400 hover:bg-yellow-500 active:scale-[0.98] text-gray-950 font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                      >
                        {loading ? (
                          <>
                            <svg className="animate-spin w-4 h-4 text-gray-950" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                            </svg>
                            <span>Đang lưu...</span>
                          </>
                        ) : (
                          <>
                            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            <span>Lưu thay đổi</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          // Khôi phục giá trị ban đầu
                          setFormData({
                            hoTen: user?.ten || 'Nguyễn Quốc Vượng',
                            email: user?.email || 'vuongtrong@example.com',
                            soDienThoai: user?.sdt || '0987 654 321',
                            ngaySinh: '2004-10-15',
                            gioiTinh: 'nam',
                          });
                          setAvatarPreview(null);
                        }}
                        className="px-5 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold transition"
                      >
                        Thiết lập lại
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
