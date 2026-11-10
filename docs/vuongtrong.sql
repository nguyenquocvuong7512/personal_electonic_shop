-- phpMyAdmin SQL Dump
-- version 6.0.0-dev+20260919.21ef436eff
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Oct 04, 2026 at 03:05 PM
-- Server version: 8.4.3
-- PHP Version: 8.3.33

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `vuongtrong`
--

-- --------------------------------------------------------

--
-- Table structure for table `baiviet`
--
CREATE TABLE `baiviet` (
  `id` bigint UNSIGNED NOT NULL,
  `chudebaiviet_id` bigint UNSIGNED NOT NULL,
  `nguoidung_id` bigint UNSIGNED DEFAULT NULL,
  `tieude` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `noidung` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `hinhanh` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `trangthai` enum('bannhap','hienthi','an') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'bannhap',
  `ngaydang` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `banner`
--
CREATE TABLE `banner` (
  `id` bigint UNSIGNED NOT NULL,
  `ten` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `hinhanh` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `duongdan` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mota` text COLLATE utf8mb4_unicode_ci,
  `thutu` int NOT NULL DEFAULT '0',
  `ngaybatdau` datetime DEFAULT NULL,
  `ngayketthuc` datetime DEFAULT NULL,
  `trangthai` enum('hienthi','an') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'hienthi',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--
CREATE TABLE `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--
CREATE TABLE `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `caidatwebsite`
--
CREATE TABLE `caidatwebsite` (
  `id` bigint UNSIGNED NOT NULL,
  `tenwebsite` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `logo` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `favicon` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sodienthoai` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `diachi` text COLLATE utf8mb4_unicode_ci,
  `facebook` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `instagram` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `youtube` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tieude_seo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mota_seo` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `chitietdonhang`
--
CREATE TABLE `chitietdonhang` (
  `id` bigint UNSIGNED NOT NULL,
  `donhang_id` bigint UNSIGNED NOT NULL,
  `sanpham_id` bigint UNSIGNED DEFAULT NULL,
  `ten_sanpham` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `soluong` int NOT NULL DEFAULT '1',
  `gia` decimal(15,2) NOT NULL DEFAULT '0.00',
  `thanhtien` decimal(15,2) NOT NULL DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `chitietgiohang`
--
CREATE TABLE `chitietgiohang` (
  `id` bigint UNSIGNED NOT NULL,
  `giohang_id` bigint UNSIGNED NOT NULL,
  `sanpham_id` bigint UNSIGNED NOT NULL,
  `soluong` int NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `chitietgiohang`
--

INSERT INTO `chitietgiohang` (`id`, `giohang_id`, `sanpham_id`, `soluong`, `created_at`, `updated_at`) VALUES
(5, 8, 3, 5, '2026-09-27 18:21:13', '2026-09-27 18:22:14');

-- --------------------------------------------------------

--
-- Table structure for table `chitietphieunhap`
--
CREATE TABLE `chitietphieunhap` (
  `id` bigint UNSIGNED NOT NULL,
  `phieunhap_id` bigint UNSIGNED NOT NULL,
  `sanpham_id` bigint UNSIGNED NOT NULL,
  `soluong` int NOT NULL DEFAULT '1',
  `gia` decimal(15,2) NOT NULL DEFAULT '0.00',
  `thanhtien` decimal(15,2) NOT NULL DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `chitietphieuxuat`
--
CREATE TABLE `chitietphieuxuat` (
  `id` bigint UNSIGNED NOT NULL,
  `phieuxuat_id` bigint UNSIGNED NOT NULL,
  `sanpham_id` bigint UNSIGNED NOT NULL,
  `soluong` int NOT NULL DEFAULT '1',
  `ghichu` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `chudebaiviet`
--
CREATE TABLE `chudebaiviet` (
  `id` bigint UNSIGNED NOT NULL,
  `ten` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mota` text COLLATE utf8mb4_unicode_ci,
  `trangthai` enum('hienthi','an') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'hienthi',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `danhmuc`
--
CREATE TABLE `danhmuc` (
  `id` bigint UNSIGNED NOT NULL,
  `parent_id` bigint UNSIGNED DEFAULT NULL,
  `ten` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mota` text COLLATE utf8mb4_unicode_ci,
  `trangthai` enum('hienthi','an') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'hienthi',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `danhmuc`
--

INSERT INTO `danhmuc` (`id`, `parent_id`, `ten`, `mota`, `trangthai`, `created_at`, `updated_at`) VALUES
(1, NULL, 'Điện thoại', 'Các loại điện thoại', 'hienthi', '2026-09-21 01:16:59', '2026-09-21 01:16:59'),
(2, NULL, 'Laptop', 'Các loại laptop', 'hienthi', '2026-09-21 01:16:59', '2026-09-21 01:16:59'),
(3, NULL, 'Phụ kiện', 'Các loại phụ kiện', 'hienthi', '2026-09-21 01:16:59', '2026-09-21 01:16:59'),
(5, 1, 'Samsung', 'Điện thoại Samsung', 'hienthi', '2026-09-21 01:16:59', '2026-09-21 01:16:59'),
(6, 2, 'Acer', 'Laptop Acer', 'hienthi', '2026-09-21 01:16:59', '2026-09-21 01:16:59');

-- --------------------------------------------------------

--
-- Table structure for table `donhang`
--
CREATE TABLE `donhang` (
  `id` bigint UNSIGNED NOT NULL,
  `nguoidung_id` bigint UNSIGNED DEFAULT NULL,
  `khuyenmai_id` bigint UNSIGNED DEFAULT NULL,
  `hoten_nguoinhan` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `madon` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tongtien` decimal(15,2) NOT NULL DEFAULT '0.00',
  `tiengiam` decimal(15,2) NOT NULL DEFAULT '0.00',
  `thanhtien` decimal(15,2) NOT NULL DEFAULT '0.00',
  `diachigiaohang` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `sodienthoai` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phuongthucthanhtoan` enum('tienmat','chuyenkhoan','vnpay') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'tienmat',
  `trangthai` enum('choxacnhan','daxacnhan','danggiao','hoantat','dahuy') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'choxacnhan',
  `ghichu` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--
CREATE TABLE `failed_jobs` (
  `id` bigint UNSIGNED NOT NULL,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `giohang`
--
CREATE TABLE `giohang` (
  `id` bigint UNSIGNED NOT NULL,
  `nguoidung_id` bigint UNSIGNED DEFAULT NULL,
  `session_id` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `giohang`
--

INSERT INTO `giohang` (`id`, `nguoidung_id`, `session_id`, `created_at`, `updated_at`) VALUES
(4, NULL, '0d110909-0804-49de-831e-4175142bbd58', '2026-09-27 06:42:10', '2026-09-27 06:42:10'),
(5, NULL, 'ef3ff297-992b-4e32-b482-afbf6ca27959', '2026-09-27 06:43:48', '2026-09-27 06:43:48'),
(6, NULL, 'e121812a-3bb1-4aea-b526-3cb27e273b8f', '2026-09-27 07:07:05', '2026-09-27 07:07:05'),
(7, NULL, '3032b600-3998-4709-ab06-5117ff99ce20', '2026-09-27 07:07:38', '2026-09-27 07:07:38'),
(8, NULL, '40912ad3-8399-45f8-8eab-cff8f7979a08', '2026-09-27 18:21:13', '2026-09-27 18:21:13');

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--
CREATE TABLE `jobs` (
  `id` bigint UNSIGNED NOT NULL,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` tinyint UNSIGNED NOT NULL,
  `reserved_at` int UNSIGNED DEFAULT NULL,
  `available_at` int UNSIGNED NOT NULL,
  `created_at` int UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--
CREATE TABLE `job_batches` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext COLLATE utf8mb4_unicode_ci,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `khuyenmai`
--
CREATE TABLE `khuyenmai` (
  `id` bigint UNSIGNED NOT NULL,
  `ma` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ten` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mota` text COLLATE utf8mb4_unicode_ci,
  `loaigiam` enum('phantram','sotien') COLLATE utf8mb4_unicode_ci NOT NULL,
  `giatri` decimal(15,2) NOT NULL DEFAULT '0.00',
  `giatritoithieu` decimal(15,2) NOT NULL DEFAULT '0.00',
  `giamtoida` decimal(15,2) DEFAULT NULL,
  `soluong` int NOT NULL DEFAULT '0',
  `daluotdung` int NOT NULL DEFAULT '0',
  `ngaybatdau` datetime NOT NULL,
  `ngayketthuc` datetime NOT NULL,
  `trangthai` enum('hoatdong','ngung') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'hoatdong',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `lichsudonhang`
--
CREATE TABLE `lichsudonhang` (
  `id` bigint UNSIGNED NOT NULL,
  `donhang_id` bigint UNSIGNED NOT NULL,
  `nguoidung_id` bigint UNSIGNED DEFAULT NULL,
  `trangthaicu` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `trangthaimoi` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ghichu` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `lichsutonkho`
--
CREATE TABLE `lichsutonkho` (
  `id` bigint UNSIGNED NOT NULL,
  `sanpham_id` bigint UNSIGNED NOT NULL,
  `loaithaydoi` enum('dathang','huydon','nhapkho','xuatkho') COLLATE utf8mb4_unicode_ci NOT NULL,
  `soluongthaydoi` int NOT NULL,
  `soluongtruoc` int NOT NULL,
  `soluongsau` int NOT NULL,
  `donhang_id` bigint UNSIGNED DEFAULT NULL,
  `phieunhap_id` bigint UNSIGNED DEFAULT NULL,
  `phieuxuat_id` bigint UNSIGNED DEFAULT NULL,
  `nguoidung_id` bigint UNSIGNED DEFAULT NULL,
  `ghichu` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `lienhe`
--
CREATE TABLE `lienhe` (
  `id` bigint UNSIGNED NOT NULL,
  `nguoidung_id` bigint UNSIGNED DEFAULT NULL,
  `hoten` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sodienthoai` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tieude` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `noidung` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `phanhoi` text COLLATE utf8mb4_unicode_ci,
  `trangthai` enum('chuaxuly','daxuly') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'chuaxuly',
  `ngayphanhoi` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `menu`
--
CREATE TABLE `menu` (
  `id` bigint UNSIGNED NOT NULL,
  `parent_id` bigint UNSIGNED DEFAULT NULL,
  `ten` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `duongdan` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `vitri` enum('header','footer') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'header',
  `thutu` int NOT NULL DEFAULT '0',
  `trangthai` enum('hienthi','an') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'hienthi',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--
CREATE TABLE `migrations` (
  `id` int UNSIGNED NOT NULL,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2026_09_21_103707_create_personal_access_tokens_table', 1);

-- --------------------------------------------------------

--
-- Table structure for table `nguoidung`
--
CREATE TABLE `nguoidung` (
  `id` bigint UNSIGNED NOT NULL,
  `ten` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `matkhau` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sodienthoai` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `diachi` text COLLATE utf8mb4_unicode_ci,
  `vaitro` enum('thanhvien','admin') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'thanhvien',
  `trangthai` enum('hoatdong','khoa') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'hoatdong',
  `reset_token` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reset_token_expire` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `nguoidung`
--

INSERT INTO `nguoidung` (`id`, `ten`, `email`, `matkhau`, `sodienthoai`, `diachi`, `vaitro`, `trangthai`, `reset_token`, `reset_token_expire`, `created_at`, `updated_at`) VALUES
(1, 'Nguyễn Quốc Vương', 'testregister2026@gmail.com', '$2y$12$SZ4x/WHUpC51kkD02m7wo.RONtyXJfnmVDGpBOru/MB/8HIPoLTK.', '0912345678', 'TP. Hồ Chí Minh', 'thanhvien', 'hoatdong', NULL, NULL, '2026-09-21 04:20:56', '2026-09-21 04:20:56'),
(4, 'Nguyễn Văn An', 'nguyenvanan@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0912345678', '123 Lê Lợi, Phường Bến Nghé, Quận 1, TP.HCM', 'thanhvien', 'hoatdong', NULL, NULL, '2026-09-27 10:47:04', '2026-09-27 10:47:04'),
(5, 'Trần Thị Bình', 'tranthibinh@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0923456789', '456 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM', 'thanhvien', 'hoatdong', NULL, NULL, '2026-09-27 10:47:04', '2026-09-27 10:47:04'),
(6, 'Nguyen Van A', 'nguyenvana@gmail.com', '$2y$12$dZml9OECH4ORq9ZTOhbRe.dMpxK8HZ0xv9ygrsmYCD/Q.PWua.FIi', '0901234567', 'Thu Duc', 'thanhvien', 'hoatdong', NULL, NULL, '2026-09-27 03:52:26', '2026-09-27 03:52:26'),
(7, 'admin', 'admin@gmail.com', '$2y$12$GtG5RJU68qqVQIMoVPHor.PiYQp02BPYPmaKeuPqilcfmnZLhV6mW', NULL, NULL, 'admin', 'hoatdong', NULL, NULL, '2026-09-27 04:09:04', '2026-09-27 04:09:04'),
(8, 'Nguyễn Quốc Vương0000', 'testregister1232026@gmail.com', '$2y$12$MFS96V356s0RiGIXnfJXrO8E/tqsaqWEE5lDdqavs9wiZAJtHlVp.', '0912345678', 'TP. Hồ Chí Minh', 'thanhvien', 'hoatdong', NULL, NULL, '2026-09-27 18:57:02', '2026-09-27 18:57:02'),
(9, 'Nguyễn Quốc Vương0000ewrwe', 'testregister@gmail.com', '$2y$12$tMx8kVAIEdtBdNL1X545YuxCNvPrOi2H7xBsqUeUWWja6iQwfDWU.', '0912345678', 'TP. Hồ Chí Minh', 'thanhvien', 'hoatdong', NULL, NULL, '2026-09-27 21:00:32', '2026-09-27 21:00:32');

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--
CREATE TABLE `personal_access_tokens` (
  `id` bigint UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint UNSIGNED NOT NULL,
  `name` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `personal_access_tokens`
--

INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
(1, 'App\\Models\\NguoiDung', 2, 'web', 'f7c0cb015ae916679345f49b3966cf54df3cbf6e600187eb9fbbf4e2627c5c65', '[\"*\"]', NULL, NULL, '2026-09-21 04:24:52', '2026-09-21 04:24:52'),
(5, 'App\\Models\\NguoiDung', 6, 'web', '6a854643622a5fbf66ffa08ac64d6ce86e504c7bcb62c08b91ed22329b65e7e8', '[\"*\"]', NULL, NULL, '2026-09-27 03:52:26', '2026-09-27 03:52:26'),
(9, 'App\\Models\\NguoiDung', 1, 'auth_token', '78cd8f4d58fefc062e21892a87973935ed6d896eba31c3e0b3754a0f828d5b14', '[\"user:*\"]', '2026-09-27 04:11:51', NULL, '2026-09-27 04:11:38', '2026-09-27 04:11:51'),
(12, 'App\\Models\\Admin', 7, 'admin', '4b52b089cc18b9869416b5205d8870eb5e1cf33a05badf57a798b1c51564c0ed', '[\"admin:*\"]', NULL, NULL, '2026-09-27 18:58:55', '2026-09-27 18:58:55'),
(13, 'App\\Models\\NguoiDung', 8, 'auth_token', '2a5e115c7cf9d7f51cf2ff6af582b9a184884309e23a8b16e8ee2a57c7a92974', '[\"user:*\"]', NULL, NULL, '2026-09-27 20:56:11', '2026-09-27 20:56:11'),
(14, 'App\\Models\\NguoiDung', 9, 'web', 'a1a6648eabddc81a387351eb793ae2ac6cc7639a9c3913ef66a9cad0aa6cbf69', '[\"*\"]', NULL, NULL, '2026-09-27 21:00:32', '2026-09-27 21:00:32');

-- --------------------------------------------------------

--
-- Table structure for table `phieunhap`
--
CREATE TABLE `phieunhap` (
  `id` bigint UNSIGNED NOT NULL,
  `nguoidung_id` bigint UNSIGNED NOT NULL,
  `maphieu` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nhacungcap` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tongtien` decimal(15,2) NOT NULL DEFAULT '0.00',
  `ghichu` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `phieuxuat`
--
CREATE TABLE `phieuxuat` (
  `id` bigint UNSIGNED NOT NULL,
  `nguoidung_id` bigint UNSIGNED NOT NULL,
  `maphieu` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `loaixuat` enum('trahang','huyhang','khac') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'khac',
  `ghichu` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sanpham`
--
CREATE TABLE `sanpham` (
  `id` bigint UNSIGNED NOT NULL,
  `danhmuc_id` bigint UNSIGNED NOT NULL,
  `thuonghieu_id` bigint UNSIGNED DEFAULT NULL,
  `ten` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mota` text COLLATE utf8mb4_unicode_ci,
  `gia` decimal(15,2) NOT NULL DEFAULT '0.00',
  `giakhuyenmai` decimal(15,2) DEFAULT NULL,
  `soluong` int NOT NULL DEFAULT '0',
  `hinhanh` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `trangthai` enum('hienthi','an') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'hienthi',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sanpham`
--

INSERT INTO `sanpham` (`id`, `danhmuc_id`, `thuonghieu_id`, `ten`, `slug`, `mota`, `gia`, `giakhuyenmai`, `soluong`, `hinhanh`, `trangthai`, `created_at`, `updated_at`) VALUES
(2, 1, 1, 'iPhone123123123', 'iphone123123123', 'Màn hình OLED 6.7 inch, chip Apple A17 Pro', 25000000.00, 23000000.00, 15, 'sanpham/iphone15.jpg', 'hienthi', '2026-09-21 01:58:22', '2026-09-27 18:18:20'),
(3, 1, 2, 'Điện thoại Samsung Galaxy S24 Ultra 512GB', 'dien-thoai-samsung-galaxy-s24-ultra-512gb', 'Màn hình Dynamic AMOLED 2X, tích hợp S-Pen', 33990000.00, NULL, 20, 'sanpham/s24ultra.jpg', 'hienthi', '2026-09-21 01:58:22', '2026-09-21 01:58:22'),
(4, 2, NULL, 'Tai nghe Bluetooth Chống ồn TWS Pro', 'tai-nghe-bluetooth-chong-on-tws-pro', 'Kết nối Bluetooth 5.3, pin 24h', 850000.00, 690000.00, 50, 'sanpham/tai-nghe-tws.jpg', 'hienthi', '2026-09-21 01:58:22', '2026-09-21 01:58:22'),
(5, 1, 1, 'iPhone 15', 'iphone-15', 'Điện thoại Apple iPhone 15', 20000000.00, 18000000.00, 10, NULL, 'hienthi', '2026-09-27 17:58:54', '2026-09-27 17:58:54');

-- --------------------------------------------------------

--
-- Table structure for table `sanpham_hinhanh`
--
CREATE TABLE `sanpham_hinhanh` (
  `id` bigint UNSIGNED NOT NULL,
  `sanpham_id` bigint UNSIGNED NOT NULL,
  `duongdan` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `thutu` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--
CREATE TABLE `sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('I2PYGzDJ7T5oELcD7ILZf6W2Rhg74jvpWkkTbJ3N', NULL, '127.0.0.1', 'PostmanRuntime/2.8.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiN3ZxNTdwdExOVTBSbU9USnRLMVpjaVBnQXA0cE1CdHlUd0htdm1pRCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1790517712),
('WNzD0TLgWqI9eagVmeM8FoJOVlRTKdxHQ3bl9tao', NULL, '127.0.0.1', 'PostmanRuntime/2.8.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoia3JVMjNxM1VEQmRxeERiREZianVvcnk3bGs4bjRtQmg1cUxvVnlBOSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1790568052);

-- --------------------------------------------------------

--
-- Table structure for table `thuonghieu`
--
CREATE TABLE `thuonghieu` (
  `id` bigint UNSIGNED NOT NULL,
  `ten` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mota` text COLLATE utf8mb4_unicode_ci,
  `hinhanh` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `trangthai` enum('hienthi','an') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'hienthi',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `thuonghieu`
--

INSERT INTO `thuonghieu` (`id`, `ten`, `slug`, `mota`, `hinhanh`, `trangthai`, `created_at`, `updated_at`) VALUES
(1, 'Apple', 'apple', 'Thương hiệu công nghệ Apple', NULL, 'hienthi', '2026-09-20 14:07:04', '2026-09-20 14:07:04'),
(2, 'Samsung', 'samsung', 'Thương hiệu công nghệ Samsung', NULL, 'hienthi', '2026-09-20 14:07:04', '2026-09-20 14:07:04'),
(3, 'Xiaomi', 'xiaomi', 'Thương hiệu công nghệ Xiaomi', NULL, 'hienthi', '2026-09-20 14:07:04', '2026-09-20 14:07:04'),
(4, 'Acer', 'acer', 'Thương hiệu máy tính Acer', NULL, 'hienthi', '2026-09-20 14:07:04', '2026-09-20 14:07:04'),
(5, 'ASUS', 'asus', 'Thương hiệu máy tính ASUS', NULL, 'hienthi', '2026-09-20 14:07:04', '2026-09-20 14:07:04'),
(6, 'OPPO', 'oppo', 'Thương hiệu điện thoại OPPO', NULL, 'an', '2026-09-20 14:08:09', '2026-09-20 14:08:09'),
(13, 'ASUS1111', 'asus1111', NULL, NULL, 'hienthi', '2026-10-04 07:07:58', '2026-10-04 07:17:59');

-- --------------------------------------------------------

--
-- Table structure for table `trangdon`
--
CREATE TABLE `trangdon` (
  `id` bigint UNSIGNED NOT NULL,
  `tieude` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `noidung` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `trangthai` enum('hienthi','an') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'hienthi',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--
CREATE TABLE `users` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `baiviet`
--
ALTER TABLE `baiviet`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `fk_baiviet_nguoidung` (`nguoidung_id`),
  ADD KEY `idx_baiviet_chude` (`chudebaiviet_id`),
  ADD KEY `idx_baiviet_trangthai` (`trangthai`);

--
-- Indexes for table `banner`
--
ALTER TABLE `banner`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_banner_thutu` (`thutu`),
  ADD KEY `idx_banner_trangthai` (`trangthai`);

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_expiration_index` (`expiration`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_locks_expiration_index` (`expiration`);

--
-- Indexes for table `caidatwebsite`
--
ALTER TABLE `caidatwebsite`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `chitietdonhang`
--
ALTER TABLE `chitietdonhang`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_chitietdonhang_donhang` (`donhang_id`),
  ADD KEY `idx_chitietdonhang_sanpham` (`sanpham_id`);

--
-- Indexes for table `chitietgiohang`
--
ALTER TABLE `chitietgiohang`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_giohang_sanpham` (`giohang_id`,`sanpham_id`),
  ADD KEY `fk_chitietgiohang_sanpham` (`sanpham_id`);

--
-- Indexes for table `chitietphieunhap`
--
ALTER TABLE `chitietphieunhap`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_chitietphieunhap_phieunhap` (`phieunhap_id`),
  ADD KEY `idx_chitietphieunhap_sanpham` (`sanpham_id`);

--
-- Indexes for table `chitietphieuxuat`
--
ALTER TABLE `chitietphieuxuat`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_chitietphieuxuat_phieuxuat` (`phieuxuat_id`),
  ADD KEY `idx_chitietphieuxuat_sanpham` (`sanpham_id`);

--
-- Indexes for table `chudebaiviet`
--
ALTER TABLE `chudebaiviet`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Indexes for table `danhmuc`
--
ALTER TABLE `danhmuc`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ten` (`ten`),
  ADD KEY `idx_danhmuc_parent` (`parent_id`),
  ADD KEY `idx_danhmuc_trangthai` (`trangthai`);

--
-- Indexes for table `donhang`
--
ALTER TABLE `donhang`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `madon` (`madon`),
  ADD KEY `fk_donhang_khuyenmai` (`khuyenmai_id`),
  ADD KEY `idx_donhang_nguoidung` (`nguoidung_id`),
  ADD KEY `idx_donhang_trangthai` (`trangthai`),
  ADD KEY `idx_donhang_ngaytao` (`created_at`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `giohang`
--
ALTER TABLE `giohang`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_giohang_nguoidung` (`nguoidung_id`),
  ADD UNIQUE KEY `uk_giohang_session` (`session_id`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indexes for table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `khuyenmai`
--
ALTER TABLE `khuyenmai`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ma` (`ma`),
  ADD KEY `idx_khuyenmai_thoigian` (`ngaybatdau`,`ngayketthuc`),
  ADD KEY `idx_khuyenmai_trangthai` (`trangthai`);

--
-- Indexes for table `lichsudonhang`
--
ALTER TABLE `lichsudonhang`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_lichsudonhang_nguoidung` (`nguoidung_id`),
  ADD KEY `idx_lichsudonhang_donhang` (`donhang_id`),
  ADD KEY `idx_lichsudonhang_thoigian` (`created_at`);

--
-- Indexes for table `lichsutonkho`
--
ALTER TABLE `lichsutonkho`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_lichsutonkho_sanpham` (`sanpham_id`),
  ADD KEY `idx_lichsutonkho_loaithaydoi` (`loaithaydoi`),
  ADD KEY `fk_lichsutonkho_donhang` (`donhang_id`),
  ADD KEY `fk_lichsutonkho_phieunhap` (`phieunhap_id`),
  ADD KEY `fk_lichsutonkho_phieuxuat` (`phieuxuat_id`),
  ADD KEY `fk_lichsutonkho_nguoidung` (`nguoidung_id`),
  ADD KEY `idx_lichsutonkho_thoigian` (`created_at`);

--
-- Indexes for table `lienhe`
--
ALTER TABLE `lienhe`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_lienhe_nguoidung` (`nguoidung_id`),
  ADD KEY `idx_lienhe_trangthai` (`trangthai`);

--
-- Indexes for table `menu`
--
ALTER TABLE `menu`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_menu_parent` (`parent_id`),
  ADD KEY `idx_menu_vitri` (`vitri`),
  ADD KEY `idx_menu_thutu` (`thutu`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `nguoidung`
--
ALTER TABLE `nguoidung`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_nguoidung_trangthai` (`trangthai`),
  ADD KEY `idx_nguoidung_sodienthoai` (`sodienthoai`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  ADD KEY `personal_access_tokens_expires_at_index` (`expires_at`);

--
-- Indexes for table `phieunhap`
--
ALTER TABLE `phieunhap`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `maphieu` (`maphieu`),
  ADD KEY `fk_phieunhap_nguoidung` (`nguoidung_id`);

--
-- Indexes for table `phieuxuat`
--
ALTER TABLE `phieuxuat`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `maphieu` (`maphieu`),
  ADD KEY `fk_phieuxuat_nguoidung` (`nguoidung_id`);

--
-- Indexes for table `sanpham`
--
ALTER TABLE `sanpham`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `idx_sanpham_danhmuc` (`danhmuc_id`),
  ADD KEY `idx_sanpham_thuonghieu` (`thuonghieu_id`),
  ADD KEY `idx_sanpham_gia` (`gia`),
  ADD KEY `idx_sanpham_trangthai` (`trangthai`);

--
-- Indexes for table `sanpham_hinhanh`
--
ALTER TABLE `sanpham_hinhanh`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_sanpham_hinhanh_sanpham` (`sanpham_id`),
  ADD KEY `idx_sanpham_hinhanh_thutu` (`thutu`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `thuonghieu`
--
ALTER TABLE `thuonghieu`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `idx_thuonghieu_trangthai` (`trangthai`);

--
-- Indexes for table `trangdon`
--
ALTER TABLE `trangdon`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `baiviet`
--
ALTER TABLE `baiviet`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `banner`
--
ALTER TABLE `banner`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `caidatwebsite`
--
ALTER TABLE `caidatwebsite`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `chitietdonhang`
--
ALTER TABLE `chitietdonhang`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `chitietgiohang`
--
ALTER TABLE `chitietgiohang`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `chitietphieunhap`
--
ALTER TABLE `chitietphieunhap`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `chitietphieuxuat`
--
ALTER TABLE `chitietphieuxuat`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `chudebaiviet`
--
ALTER TABLE `chudebaiviet`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `danhmuc`
--
ALTER TABLE `danhmuc`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `donhang`
--
ALTER TABLE `donhang`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `giohang`
--
ALTER TABLE `giohang`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `khuyenmai`
--
ALTER TABLE `khuyenmai`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `lichsudonhang`
--
ALTER TABLE `lichsudonhang`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `lichsutonkho`
--
ALTER TABLE `lichsutonkho`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `lienhe`
--
ALTER TABLE `lienhe`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `menu`
--
ALTER TABLE `menu`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `nguoidung`
--
ALTER TABLE `nguoidung`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `phieunhap`
--
ALTER TABLE `phieunhap`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `phieuxuat`
--
ALTER TABLE `phieuxuat`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sanpham`
--
ALTER TABLE `sanpham`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `sanpham_hinhanh`
--
ALTER TABLE `sanpham_hinhanh`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `thuonghieu`
--
ALTER TABLE `thuonghieu`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `trangdon`
--
ALTER TABLE `trangdon`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `baiviet`
--
ALTER TABLE `baiviet`
  ADD CONSTRAINT `fk_baiviet_chude` FOREIGN KEY (`chudebaiviet_id`) REFERENCES `chudebaiviet` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_baiviet_nguoidung` FOREIGN KEY (`nguoidung_id`) REFERENCES `nguoidung` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `chitietdonhang`
--
ALTER TABLE `chitietdonhang`
  ADD CONSTRAINT `fk_chitietdonhang_donhang` FOREIGN KEY (`donhang_id`) REFERENCES `donhang` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_chitietdonhang_sanpham` FOREIGN KEY (`sanpham_id`) REFERENCES `sanpham` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `chitietgiohang`
--
ALTER TABLE `chitietgiohang`
  ADD CONSTRAINT `fk_chitietgiohang_giohang` FOREIGN KEY (`giohang_id`) REFERENCES `giohang` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_chitietgiohang_sanpham` FOREIGN KEY (`sanpham_id`) REFERENCES `sanpham` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `chitietphieunhap`
--
ALTER TABLE `chitietphieunhap`
  ADD CONSTRAINT `fk_chitietphieunhap_phieunhap` FOREIGN KEY (`phieunhap_id`) REFERENCES `phieunhap` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_chitietphieunhap_sanpham` FOREIGN KEY (`sanpham_id`) REFERENCES `sanpham` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `chitietphieuxuat`
--
ALTER TABLE `chitietphieuxuat`
  ADD CONSTRAINT `fk_chitietphieuxuat_phieuxuat` FOREIGN KEY (`phieuxuat_id`) REFERENCES `phieuxuat` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_chitietphieuxuat_sanpham` FOREIGN KEY (`sanpham_id`) REFERENCES `sanpham` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `danhmuc`
--
ALTER TABLE `danhmuc`
  ADD CONSTRAINT `fk_danhmuc_parent` FOREIGN KEY (`parent_id`) REFERENCES `danhmuc` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `donhang`
--
ALTER TABLE `donhang`
  ADD CONSTRAINT `fk_donhang_khuyenmai` FOREIGN KEY (`khuyenmai_id`) REFERENCES `khuyenmai` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_donhang_nguoidung` FOREIGN KEY (`nguoidung_id`) REFERENCES `nguoidung` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `giohang`
--
ALTER TABLE `giohang`
  ADD CONSTRAINT `fk_giohang_nguoidung` FOREIGN KEY (`nguoidung_id`) REFERENCES `nguoidung` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `lichsudonhang`
--
ALTER TABLE `lichsudonhang`
  ADD CONSTRAINT `fk_lichsudonhang_donhang` FOREIGN KEY (`donhang_id`) REFERENCES `donhang` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_lichsudonhang_nguoidung` FOREIGN KEY (`nguoidung_id`) REFERENCES `nguoidung` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `lichsutonkho`
--
ALTER TABLE `lichsutonkho`
  ADD CONSTRAINT `fk_lichsutonkho_donhang` FOREIGN KEY (`donhang_id`) REFERENCES `donhang` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_lichsutonkho_nguoidung` FOREIGN KEY (`nguoidung_id`) REFERENCES `nguoidung` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_lichsutonkho_phieunhap` FOREIGN KEY (`phieunhap_id`) REFERENCES `phieunhap` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_lichsutonkho_phieuxuat` FOREIGN KEY (`phieuxuat_id`) REFERENCES `phieuxuat` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_lichsutonkho_sanpham` FOREIGN KEY (`sanpham_id`) REFERENCES `sanpham` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `lienhe`
--
ALTER TABLE `lienhe`
  ADD CONSTRAINT `fk_lienhe_nguoidung` FOREIGN KEY (`nguoidung_id`) REFERENCES `nguoidung` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `menu`
--
ALTER TABLE `menu`
  ADD CONSTRAINT `fk_menu_parent` FOREIGN KEY (`parent_id`) REFERENCES `menu` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `phieunhap`
--
ALTER TABLE `phieunhap`
  ADD CONSTRAINT `fk_phieunhap_nguoidung` FOREIGN KEY (`nguoidung_id`) REFERENCES `nguoidung` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `phieuxuat`
--
ALTER TABLE `phieuxuat`
  ADD CONSTRAINT `fk_phieuxuat_nguoidung` FOREIGN KEY (`nguoidung_id`) REFERENCES `nguoidung` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `sanpham`
--
ALTER TABLE `sanpham`
  ADD CONSTRAINT `fk_sanpham_danhmuc` FOREIGN KEY (`danhmuc_id`) REFERENCES `danhmuc` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_sanpham_thuonghieu` FOREIGN KEY (`thuonghieu_id`) REFERENCES `thuonghieu` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `sanpham_hinhanh`
--
ALTER TABLE `sanpham_hinhanh`
  ADD CONSTRAINT `fk_sanphamhinhanh_sanpham` FOREIGN KEY (`sanpham_id`) REFERENCES `sanpham` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
