-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 12 Agu 2025 pada 13.42
-- Versi server: 10.4.32-MariaDB
-- Versi PHP: 8.1.25

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `aimteknik`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `ba_inbox`
--

CREATE TABLE `ba_inbox` (
  `id` bigint(20) NOT NULL,
  `gmail_id` varchar(128) DEFAULT NULL,
  `subject` text DEFAULT NULL,
  `from_email` varchar(200) DEFAULT NULL,
  `ba_no` varchar(64) DEFAULT NULL,
  `co_no` varchar(64) DEFAULT NULL,
  `filename` varchar(255) DEFAULT NULL,
  `received_at` datetime DEFAULT NULL,
  `parsed_at` datetime DEFAULT NULL,
  `printed` tinyint(1) NOT NULL DEFAULT 0,
  `printed_at` datetime DEFAULT NULL,
  `ba_dicetak` tinyint(1) NOT NULL DEFAULT 0,
  `ba_dicetak_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `ba_inbox`
--

INSERT INTO `ba_inbox` (`id`, `gmail_id`, `subject`, `from_email`, `ba_no`, `co_no`, `filename`, `received_at`, `parsed_at`, `printed`, `printed_at`, `ba_dicetak`, `ba_dicetak_at`) VALUES
(1, '198450fa9e1b414f', 'BA Opname nomor BA-OPNAME/2025/03/004/010653', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/010653', '25G0128877', 'BA-OPNAME_2025_03_004_010653.pdf', '2025-07-26 11:50:20', '2025-08-12 18:25:23', 0, NULL, 0, NULL),
(2, '1982b8d3070cd3ec', 'BA Opname nomor BA-OPNAME/2025/03/004/010493', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/010493', '25G0004877', 'BA-OPNAME_2025_03_004_010493.pdf', '2025-07-21 12:57:21', '2025-08-12 18:25:24', 0, NULL, 0, NULL),
(3, '1981d4d1ed025a4f', 'BA Opname nomor BA-OPNAME/2025/03/004/010447', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/010447', '25G0030764', 'BA-OPNAME_2025_03_004_010447.pdf', '2025-07-18 18:32:35', '2025-08-12 18:25:25', 0, NULL, 0, NULL),
(4, '1981d2d60ef84543', 'BA Opname nomor BA-OPNAME/2025/03/004/010451', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/010451', '25G0078296', 'BA-OPNAME_2025_03_004_010451.pdf', '2025-07-18 17:57:54', '2025-08-12 18:25:25', 0, NULL, 0, NULL),
(5, '198179ef40b38ea1', 'BA Opname nomor BA-OPNAME/2025/03/004/010369', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/010369', '25F0177609', 'BA-OPNAME_2025_03_004_010369.pdf', '2025-07-17 16:04:17', '2025-08-12 18:25:26', 0, NULL, 0, NULL),
(6, '1981791589f9d84a', 'BA Opname nomor BA-OPNAME/2025/03/004/010345', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/010345', '25F0150856', 'BA-OPNAME_2025_03_004_010345.pdf', '2025-07-17 15:49:26', '2025-08-12 18:25:27', 0, NULL, 0, NULL),
(7, '1980d7e7ac68e041', 'BA Opname nomor BA-OPNAME/2025/03/004/010282', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/010282', '25G0073367', 'BA-OPNAME_2025_03_004_010282.pdf', '2025-07-15 16:52:36', '2025-08-12 18:25:27', 0, NULL, 0, NULL),
(8, '198082f3d4cc6b5c', 'BA Opname nomor BA-OPNAME/2025/03/004/010208', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/010208', '25G0032935', 'BA-OPNAME_2025_03_004_010208.pdf', '2025-07-14 16:07:41', '2025-08-12 18:25:28', 0, NULL, 0, NULL),
(9, '198082cc6cf293e4', 'BA Opname nomor BA-OPNAME/2025/03/004/010197', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/010197', '25E0175002', 'BA-OPNAME_2025_03_004_010197.pdf', '2025-07-14 16:05:00', '2025-08-12 18:25:28', 0, NULL, 0, NULL),
(10, '198082c6ec0b442e', 'BA Opname nomor BA-OPNAME/2025/03/004/010197', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/010197', '25E0175002', 'BA-OPNAME_2025_03_004_010197.pdf', '2025-07-14 16:04:52', '2025-08-12 18:25:29', 0, NULL, 0, NULL),
(11, '198082c477dbfe46', 'BA Opname nomor BA-OPNAME/2025/03/004/010229', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/010229', '25G0063031', 'BA-OPNAME_2025_03_004_010229.pdf', '2025-07-14 16:04:38', '2025-08-12 18:25:30', 0, NULL, 0, NULL),
(12, '19807d176addcfa8', 'BA Opname nomor BA-OPNAME/2025/03/004/010242', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/010242', '25F0224320', 'BA-OPNAME_2025_03_004_010242.pdf', '2025-07-14 14:25:28', '2025-08-12 18:25:30', 0, NULL, 0, NULL),
(13, '197f8774aee9a530', 'BA Opname nomor BA-OPNAME/2025/03/004/010074', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/010074', '25G0021984', 'BA-OPNAME_2025_03_004_010074.pdf', '2025-07-11 14:52:38', '2025-08-12 18:25:31', 0, NULL, 0, NULL),
(14, '197f8773fa1a80c0', 'BA Opname nomor BA-OPNAME/2025/03/004/010074', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/010074', '25G0021984', 'BA-OPNAME_2025_03_004_010074.pdf', '2025-07-11 14:52:30', '2025-08-12 18:25:32', 0, NULL, 0, NULL),
(15, '197f8770a408b75a', 'BA Opname nomor BA-OPNAME/2025/03/004/010078', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/010078', '25G0030166', 'BA-OPNAME_2025_03_004_010078.pdf', '2025-07-11 14:52:24', '2025-08-12 18:25:32', 0, NULL, 0, NULL),
(16, '197f86510f536bd8', 'BA Opname nomor BA-OPNAME/2025/03/004/010186', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/010186', '25F0024662', 'BA-OPNAME_2025_03_004_010186.pdf', '2025-07-11 14:32:44', '2025-08-12 18:25:33', 0, NULL, 0, NULL),
(17, '197f860c9cd03b6c', 'BA Opname nomor BA-OPNAME/2025/03/004/010184', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/010184', '25E0218347', 'BA-OPNAME_2025_03_004_010184.pdf', '2025-07-11 14:28:05', '2025-08-12 18:25:34', 0, NULL, 0, NULL),
(18, '197f851b284aa58c', 'BA Opname nomor BA-OPNAME/2025/03/004/010061', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/010061', '25F0093236', 'BA-OPNAME_2025_03_004_010061.pdf', '2025-07-11 14:11:36', '2025-08-12 18:25:34', 0, NULL, 0, NULL),
(19, '197ef65cc7ecbdb0', 'BA Opname nomor BA-OPNAME/2025/03/004/010031', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/010031', '25D0192515', 'BA-OPNAME_2025_03_004_010031.pdf', '2025-07-09 20:36:57', '2025-08-12 18:25:35', 0, NULL, 0, NULL),
(20, '197ef62fbb4e9631', 'BA Opname nomor BA-OPNAME/2025/03/004/010032', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/010032', '25F0090131', 'BA-OPNAME_2025_03_004_010032.pdf', '2025-07-09 20:33:53', '2025-08-12 18:25:35', 0, NULL, 0, NULL),
(21, '197ef61be1371c13', 'BA Opname nomor BA-OPNAME/2025/03/004/009968', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/009968', '25F0195889', 'BA-OPNAME_2025_03_004_009968.pdf', '2025-07-09 20:32:32', '2025-08-12 18:25:36', 0, NULL, 0, NULL),
(22, '197ef61987817369', 'BA Opname nomor BA-OPNAME/2025/03/004/009967', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/009967', '25F0193739', 'BA-OPNAME_2025_03_004_009967.pdf', '2025-07-09 20:32:20', '2025-08-12 18:25:37', 0, NULL, 0, NULL),
(23, '197ef617127e7aec', 'BA Opname nomor BA-OPNAME/2025/03/004/009964', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/009964', '25F0072866', 'BA-OPNAME_2025_03_004_009964.pdf', '2025-07-09 20:32:10', '2025-08-12 18:25:37', 0, NULL, 0, NULL),
(24, '197ef57fe97a21c6', 'BA Opname nomor BA-OPNAME/2025/03/004/010052', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/010052', '25G0022147', 'BA-OPNAME_2025_03_004_010052.pdf', '2025-07-09 20:21:49', '2025-08-12 18:25:38', 0, NULL, 0, NULL),
(25, '197e4f9fb3d6278b', 'BA Opname nomor BA-OPNAME/2025/03/004/009895', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/009895', '25F0251644', 'BA-OPNAME_2025_03_004_009895.pdf', '2025-07-07 20:02:57', '2025-08-12 18:25:39', 0, NULL, 0, NULL),
(26, '197e4f6ee8018f21', 'BA Opname nomor BA-OPNAME/2025/03/004/009949', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/009949', '25G0004844', 'BA-OPNAME_2025_03_004_009949.pdf', '2025-07-07 19:59:37', '2025-08-12 18:25:39', 0, NULL, 0, NULL),
(27, '197d548b919273e8', 'BA Opname nomor BA-OPNAME/2025/03/004/009798', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/009798', '25F0209049', 'BA-OPNAME_2025_03_004_009798.pdf', '2025-07-04 18:55:02', '2025-08-12 18:25:40', 0, NULL, 0, NULL),
(28, '197d5466890961ff', 'BA Opname nomor BA-OPNAME/2025/03/004/009810', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/009810', '25F0225436', 'BA-OPNAME_2025_03_004_009810.pdf', '2025-07-04 18:52:30', '2025-08-12 18:25:41', 0, NULL, 0, NULL),
(29, '197d3a4f666e9696', 'BA Opname nomor BA-OPNAME/2025/03/004/009788', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/009788', '25F0198593', 'BA-OPNAME_2025_03_004_009788.pdf', '2025-07-04 11:16:31', '2025-08-12 18:25:41', 0, NULL, 0, NULL),
(30, '197d3a1ffbf8c643', 'BA Opname nomor BA-OPNAME/2025/03/004/009749', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/009749', '25F0235257', 'BA-OPNAME_2025_03_004_009749.pdf', '2025-07-04 11:13:19', '2025-08-12 18:25:42', 0, NULL, 0, NULL),
(31, '197d39b5c09756a3', 'BA Opname nomor BA-OPNAME/2025/03/004/009743', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/009743', '25F0217416', 'BA-OPNAME_2025_03_004_009743.pdf', '2025-07-04 11:06:03', '2025-08-12 18:25:43', 0, NULL, 0, NULL),
(32, '197d3989ecc6eeb6', 'BA Opname nomor BA-OPNAME/2025/03/004/009776', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/009776', '25F0169760', 'BA-OPNAME_2025_03_004_009776.pdf', '2025-07-04 11:02:59', '2025-08-12 18:25:44', 0, NULL, 0, NULL),
(33, '197cb508ecb335ad', 'BA Opname nomor BA-OPNAME/2025/03/004/009682', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/009682', '25F0216524', 'BA-OPNAME_2025_03_004_009682.pdf', '2025-07-02 20:27:21', '2025-08-12 18:25:45', 0, NULL, 0, NULL),
(34, '197c4040d4f95c0b', 'BA Opname nomor BA-OPNAME/2025/03/004/009665', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/009665', '25F0214272', 'BA-OPNAME_2025_03_004_009665.pdf', '2025-07-01 10:26:26', '2025-08-12 18:25:45', 0, NULL, 0, NULL),
(35, '197c0c440658b3aa', 'BA Opname nomor BA-OPNAME/2025/03/004/009632', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/009632', '25E0200648', 'BA-OPNAME_2025_03_004_009632.pdf', '2025-06-30 19:17:54', '2025-08-12 18:25:46', 0, NULL, 0, NULL),
(36, '198892e2c7d5621a', 'BA Opname nomor BA-OPNAME/2025/03/004/011126', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/011126', '25G0254196', 'BA-OPNAME_2025_03_004_011126.pdf', '2025-08-08 17:17:30', '2025-08-12 18:25:06', 0, NULL, 0, NULL),
(37, '198892dd0bf8cd17', 'BA Opname nomor BA-OPNAME/2025/03/004/011140', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/011140', '25H0022280', 'BA-OPNAME_2025_03_004_011140.pdf', '2025-08-08 17:17:05', '2025-08-12 18:25:06', 0, NULL, 0, NULL),
(38, '198892d5720d080e', 'BA Opname nomor BA-OPNAME/2025/03/004/011142', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/011142', '25H0028452', 'BA-OPNAME_2025_03_004_011142.pdf', '2025-08-08 17:16:34', '2025-08-12 18:25:07', 0, NULL, 0, NULL),
(39, '198892d31325b161', 'BA Opname nomor BA-OPNAME/2025/03/004/011142', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/011142', '25H0028452', 'BA-OPNAME_2025_03_004_011142.pdf', '2025-08-08 17:16:26', '2025-08-12 18:25:08', 0, NULL, 0, NULL),
(40, '198892240b2889a0', 'BA Opname nomor BA-OPNAME/2025/03/004/011152', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/011152', '25G0218865', 'BA-OPNAME_2025_03_004_011152.pdf', '2025-08-08 17:04:27', '2025-08-12 18:25:09', 0, NULL, 0, NULL),
(41, '19889220623650ae', 'BA Opname nomor BA-OPNAME/2025/03/004/011152', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/011152', '25G0218865', 'BA-OPNAME_2025_03_004_011152.pdf', '2025-08-08 17:04:19', '2025-08-12 18:25:09', 0, NULL, 0, NULL),
(42, '198891ee7d56ca89', 'BA Opname nomor BA-OPNAME/2025/03/004/011174', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/011174', '25G0241234', 'BA-OPNAME_2025_03_004_011174.pdf', '2025-08-08 17:00:49', '2025-08-12 18:25:10', 0, NULL, 0, NULL),
(43, '19875db1388ef508', 'BA Opname nomor BA-OPNAME/2025/03/004/011017', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/011017', '25G0235258', 'BA-OPNAME_2025_03_004_011017.pdf', '2025-08-04 23:13:56', '2025-08-12 18:25:11', 0, NULL, 0, NULL),
(44, '19875dafbc1e04ab', 'BA Opname nomor BA-OPNAME/2025/03/004/011017', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/011017', '25G0235258', 'BA-OPNAME_2025_03_004_011017.pdf', '2025-08-04 23:13:51', '2025-08-12 18:25:11', 0, NULL, 0, NULL),
(45, '19875da1e8f417b4', 'BA Opname nomor BA-OPNAME/2025/03/004/011018', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/011018', '25G0242045', 'BA-OPNAME_2025_03_004_011018.pdf', '2025-08-04 23:12:53', '2025-08-12 18:25:12', 0, NULL, 0, NULL),
(46, '19875d5ed9d39864', 'BA Opname nomor BA-OPNAME/2025/03/004/011060', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/011060', '25G0218403', 'BA-OPNAME_2025_03_004_011060.pdf', '2025-08-04 23:08:18', '2025-08-12 18:25:13', 0, NULL, 0, NULL),
(47, '198751016b338623', 'BA Opname nomor BA-OPNAME/2025/03/004/011057', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/011057', '25G0180555', 'BA-OPNAME_2025_03_004_011057.pdf', '2025-08-04 19:32:09', '2025-08-12 18:25:13', 0, NULL, 0, NULL),
(48, '1986595e89947ccc', 'BA Opname nomor BA-OPNAME/2025/03/004/010937', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/010937', '25G0194649', 'BA-OPNAME_2025_03_004_010937.pdf', '2025-08-01 19:24:22', '2025-08-12 18:25:14', 0, NULL, 0, NULL),
(49, '1986594ca14e6139', 'BA Opname nomor BA-OPNAME/2025/03/004/010972', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/010972', '25G0225993', 'BA-OPNAME_2025_03_004_010972.pdf', '2025-08-01 19:23:16', '2025-08-12 18:25:14', 0, NULL, 0, NULL),
(50, '198659328e332310', 'BA Opname nomor BA-OPNAME/2025/03/004/010975', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/010975', '25G0244889', 'BA-OPNAME_2025_03_004_010975.pdf', '2025-08-01 19:21:25', '2025-08-12 18:25:15', 0, NULL, 0, NULL),
(51, '19860792bbbaeb39', 'BA Opname nomor BA-OPNAME/2025/03/004/010913', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/010913', '25G0180124', 'BA-OPNAME_2025_03_004_010913.pdf', '2025-07-31 19:35:22', '2025-08-12 18:25:16', 0, NULL, 0, NULL),
(52, '1985f75868afe7db', 'BA Opname nomor BA-OPNAME/2025/03/004/010918', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/010918', '25G0197085', 'BA-OPNAME_2025_03_004_010918.pdf', '2025-07-31 14:51:48', '2025-08-12 18:25:17', 0, NULL, 0, NULL),
(53, '1985b2bf40643a82', 'BA Opname nomor BA-OPNAME/2025/03/004/010892', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/010892', '25G0213011', 'BA-OPNAME_2025_03_004_010892.pdf', '2025-07-30 18:53:00', '2025-08-12 18:25:18', 0, NULL, 0, NULL),
(54, '1985b2bdc385b73b', 'BA Opname nomor BA-OPNAME/2025/03/004/010892', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/010892', '25G0213011', 'BA-OPNAME_2025_03_004_010892.pdf', '2025-07-30 18:52:50', '2025-08-12 18:25:19', 0, NULL, 0, NULL),
(55, '1985b2baa37ad460', 'BA Opname nomor BA-OPNAME/2025/03/004/010892', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/010892', '25G0213011', 'BA-OPNAME_2025_03_004_010892.pdf', '2025-07-30 18:52:41', '2025-08-12 18:25:19', 0, NULL, 0, NULL),
(56, '1984a6752c0bfa07', 'BA Opname nomor BA-OPNAME/2025/03/004/010801', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/010801', '25G0149503', 'BA-OPNAME_2025_03_004_010801.pdf', '2025-07-27 12:44:12', '2025-08-12 18:25:20', 0, NULL, 0, NULL),
(57, '198451c4aa01b08b', 'BA Opname nomor BA-OPNAME/2025/03/004/010731', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/010731', '25G0130984', 'BA-OPNAME_2025_03_004_010731.pdf', '2025-07-26 12:04:13', '2025-08-12 18:25:20', 0, NULL, 0, NULL),
(58, '198451529ff70f86', 'BA Opname nomor BA-OPNAME/2025/03/004/010705', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/010705', '25G0140642', 'BA-OPNAME_2025_03_004_010705.pdf', '2025-07-26 11:56:21', '2025-08-12 18:25:22', 0, NULL, 0, NULL),
(59, '1984511a7b8a18d3', 'BA Opname nomor BA-OPNAME/2025/03/004/010683', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/010683', '25G0161502', 'BA-OPNAME_2025_03_004_010683.pdf', '2025-07-26 11:52:35', '2025-08-12 18:25:23', 0, NULL, 0, NULL),
(1680, '1989cb78c28e05fe', 'BA Opname nomor BA-OPNAME/2025/03/004/011256', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/011256', '25H0027269', 'BA-OPNAME_2025_03_004_011256.pdf', '2025-08-12 12:20:24', '2025-08-12 18:25:05', 0, NULL, 0, NULL),
(1740, '1989cbcd871f5737', 'BA Opname nomor BA-OPNAME/2025/03/004/011202', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/011202', '25H0026562', 'BA-OPNAME_2025_03_004_011202.pdf', '2025-08-12 12:26:12', '2025-08-12 18:25:05', 0, NULL, 0, NULL),
(1800, '1989cc01fd18ca01', 'BA Opname nomor BA-OPNAME/2025/03/004/011199', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/011199', '25H0029288', 'BA-OPNAME_2025_03_004_011199.pdf', '2025-08-12 12:29:46', '2025-08-12 18:25:03', 0, NULL, 0, NULL),
(1801, '1989cbfb71aa1ff4', 'BA Opname nomor BA-OPNAME/2025/03/004/009847', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/009847', '25F0254601', 'BA-OPNAME_2025_03_004_009847.pdf', '2025-08-12 12:29:22', '2025-08-12 18:25:04', 0, NULL, 0, NULL),
(1861, '1989cc57a961babe', 'BA Opname nomor BA-OPNAME/2025/03/004/011246', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/011246', '25H0007213', 'BA-OPNAME_2025_03_004_011246.pdf', '2025-08-12 12:35:36', '2025-08-12 18:25:02', 0, NULL, 0, NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `password_resets`
--

CREATE TABLE `password_resets` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `token` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `pekerjaan`
--

CREATE TABLE `pekerjaan` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tanggal` date NOT NULL,
  `no_co` varchar(50) DEFAULT NULL,
  `ba_opname_no` varchar(100) DEFAULT NULL,
  `ba_source` varchar(20) DEFAULT NULL,
  `ba_synced_at` datetime DEFAULT NULL,
  `kode_toko` varchar(50) DEFAULT NULL,
  `nama_toko` varchar(100) DEFAULT NULL,
  `total_harga` bigint(20) UNSIGNED NOT NULL DEFAULT 0,
  `status` enum('draft','siap_kirim','terkirim') NOT NULL DEFAULT 'draft',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `pekerjaan`
--

INSERT INTO `pekerjaan` (`id`, `tanggal`, `no_co`, `ba_opname_no`, `ba_source`, `ba_synced_at`, `kode_toko`, `nama_toko`, `total_harga`, `status`, `created_at`, `updated_at`) VALUES
(4, '2025-08-11', '25H1220202', NULL, NULL, NULL, 'T0T9', 'Cibarengkok', 1200500, 'terkirim', '2025-08-10 14:35:58', '2025-08-10 14:36:03'),
(5, '2025-08-08', '25G0254196', 'BA-OPNAME/2025/03/004/011126', 'gmail', '2025-08-12 18:25:06', 'T3SI', 'ARYASANTIKA 2', 390000, 'terkirim', '2025-08-11 16:23:54', '2025-08-12 11:25:06'),
(6, '2025-08-13', '25H0028452', 'BA-OPNAME/2025/03/004/011142', 'gmail', '2025-08-12 18:25:08', 'TVMY', 'Fresh Graha Sevilla', 450000, 'siap_kirim', '2025-08-12 04:58:11', '2025-08-12 11:25:08'),
(7, '2025-08-08', '25H0022280', 'BA-OPNAME/2025/03/004/011140', 'gmail', '2025-08-12 18:25:06', 'TJX8', 'Raya Panongan', 950000, 'terkirim', '2025-08-12 05:46:51', '2025-08-12 11:25:06'),
(8, '2025-08-12', '25H0007213', 'BA-OPNAME/2025/03/004/011246', 'gmail', '2025-08-12 18:25:02', 'TYFN', 'Kedaton', 999000, 'siap_kirim', '2025-08-12 09:58:44', '2025-08-12 11:25:02');

-- --------------------------------------------------------

--
-- Struktur dari tabel `pekerjaan_foto`
--

CREATE TABLE `pekerjaan_foto` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `pekerjaan_id` bigint(20) UNSIGNED NOT NULL,
  `tipe` enum('before','after') NOT NULL,
  `path` varchar(255) NOT NULL,
  `original_name` varchar(255) DEFAULT NULL,
  `mime` varchar(100) DEFAULT NULL,
  `size_bytes` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `pekerjaan_foto`
--

INSERT INTO `pekerjaan_foto` (`id`, `pekerjaan_id`, `tipe`, `path`, `original_name`, `mime`, `size_bytes`, `created_at`) VALUES
(5, 4, 'before', '/uploads/1754836558056-ChatGPT_Image_13_Jul_2025,_10.10.33.png', 'ChatGPT Image 13 Jul 2025, 10.10.33.png', 'image/png', 1873040, '2025-08-10 14:35:58'),
(6, 4, 'after', '/uploads/1754836558116-logo.png', 'logo.png', 'image/png', 67894, '2025-08-10 14:35:58'),
(7, 5, 'before', '/uploads/1754929434983-logoaim.png', 'logoaim.png', 'image/png', 127076, '2025-08-11 16:23:55'),
(8, 5, 'after', '/uploads/1754929434984-logoaim.png', 'logoaim.png', 'image/png', 127076, '2025-08-11 16:23:55'),
(9, 6, 'before', '/uploads/1754974691204-WhatsApp_Image_2025-08-12_at_11.52.28_b54a4b7f.jpg', 'WhatsApp Image 2025-08-12 at 11.52.28_b54a4b7f.jpg', 'image/jpeg', 250005, '2025-08-12 04:58:11'),
(10, 6, 'after', '/uploads/1754974691210-WhatsApp_Image_2025-08-12_at_11.52.28_ad2484b3.jpg', 'WhatsApp Image 2025-08-12 at 11.52.28_ad2484b3.jpg', 'image/jpeg', 225649, '2025-08-12 04:58:11'),
(11, 7, 'before', '/uploads/1754977611196-WhatsApp_Image_2025-08-12_at_12.10.22_7b55bb50.jpg', 'WhatsApp Image 2025-08-12 at 12.10.22_7b55bb50.jpg', 'image/jpeg', 250551, '2025-08-12 05:46:51'),
(12, 7, 'after', '/uploads/1754977611204-WhatsApp_Image_2025-08-12_at_12.10.22_dee4d5ce.jpg', 'WhatsApp Image 2025-08-12 at 12.10.22_dee4d5ce.jpg', 'image/jpeg', 337240, '2025-08-12 05:46:51'),
(15, 8, 'before', '/uploads/1754992724682-WhatsApp_Image_2025-08-12_at_12.10.22_7b55bb50.jpg', 'WhatsApp Image 2025-08-12 at 12.10.22_7b55bb50.jpg', 'image/jpeg', 250551, '2025-08-12 09:58:44'),
(16, 8, 'after', '/uploads/1754992724689-WhatsApp_Image_2025-08-12_at_12.10.22_dee4d5ce.jpg', 'WhatsApp Image 2025-08-12 at 12.10.22_dee4d5ce.jpg', 'image/jpeg', 337240, '2025-08-12 09:58:44');

-- --------------------------------------------------------

--
-- Struktur dari tabel `pekerjaan_item`
--

CREATE TABLE `pekerjaan_item` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `pekerjaan_id` bigint(20) UNSIGNED NOT NULL,
  `deskripsi` varchar(255) NOT NULL,
  `satuan` varchar(32) NOT NULL DEFAULT '',
  `qty` decimal(12,2) UNSIGNED NOT NULL DEFAULT 1.00,
  `harga` bigint(20) UNSIGNED NOT NULL DEFAULT 0,
  `urut` int(10) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `pekerjaan_item`
--

INSERT INTO `pekerjaan_item` (`id`, `pekerjaan_id`, `deskripsi`, `satuan`, `qty`, `harga`, `urut`) VALUES
(6, 4, 'Tarikan instalasi alarm toko', 'titik', 7.00, 171500, 1),
(7, 5, 'Tarikan instalasi kamera cctv', 'titik', 1.00, 340000, 1),
(8, 5, 'bobokan dan perapihan plafond', 'ls', 1.00, 50000, 2),
(10, 7, 'penggantian kontaktor PLN', 'ls', 1.00, 950000, 1),
(13, 6, 'pembongkaran antena parabola vsat', 'ls', 1.00, 450000, 1),
(14, 8, 'Tarikan kabel jaringan', 'meter', 74.00, 12500, 1),
(15, 8, 'konektor', 'ls', 1.00, 74000, 2);

--
-- Trigger `pekerjaan_item`
--
DELIMITER $$
CREATE TRIGGER `trg_item_after_delete` AFTER DELETE ON `pekerjaan_item` FOR EACH ROW BEGIN
  UPDATE pekerjaan p
     SET p.total_harga = (SELECT COALESCE(SUM(i.harga * i.qty),0)
                            FROM pekerjaan_item i WHERE i.pekerjaan_id = OLD.pekerjaan_id),
         p.updated_at = NOW()
   WHERE p.id = OLD.pekerjaan_id;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_item_after_insert` AFTER INSERT ON `pekerjaan_item` FOR EACH ROW BEGIN
  UPDATE pekerjaan p
     SET p.total_harga = (SELECT COALESCE(SUM(i.harga * i.qty),0)
                            FROM pekerjaan_item i WHERE i.pekerjaan_id = NEW.pekerjaan_id),
         p.updated_at = NOW()
   WHERE p.id = NEW.pekerjaan_id;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_item_after_update` AFTER UPDATE ON `pekerjaan_item` FOR EACH ROW BEGIN
  UPDATE pekerjaan p
     SET p.total_harga = (SELECT COALESCE(SUM(i.harga * i.qty),0)
                            FROM pekerjaan_item i WHERE i.pekerjaan_id = NEW.pekerjaan_id),
         p.updated_at = NOW()
   WHERE p.id = NEW.pekerjaan_id;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Struktur dari tabel `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(100) NOT NULL,
  `avatar` varchar(255) DEFAULT '/user.png',
  `reset_token` varchar(255) DEFAULT NULL,
  `token_expiry` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `name`, `avatar`, `reset_token`, `token_expiry`) VALUES
(1, 'admin', '$2b$10$cU/tcXUQHB3Zh2CoH62phuym1v/wJNLOvIVWGYYqwDrA8bhBkJgqm', 'Administrator', '/user.png', NULL, NULL);

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `ba_inbox`
--
ALTER TABLE `ba_inbox`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `gmail_id` (`gmail_id`),
  ADD KEY `idx_ba_no` (`ba_no`),
  ADD KEY `idx_co_no` (`co_no`),
  ADD KEY `idx_printed` (`printed`);

--
-- Indeks untuk tabel `password_resets`
--
ALTER TABLE `password_resets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indeks untuk tabel `pekerjaan`
--
ALTER TABLE `pekerjaan`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_tanggal` (`tanggal`),
  ADD KEY `idx_kode_toko` (`kode_toko`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_pekerjaan_no_co` (`no_co`),
  ADD KEY `idx_pekerjaan_ba_opname_no` (`ba_opname_no`);

--
-- Indeks untuk tabel `pekerjaan_foto`
--
ALTER TABLE `pekerjaan_foto`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_pekerjaan` (`pekerjaan_id`),
  ADD KEY `idx_tipe` (`tipe`);

--
-- Indeks untuk tabel `pekerjaan_item`
--
ALTER TABLE `pekerjaan_item`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_pekerjaan` (`pekerjaan_id`),
  ADD KEY `idx_pekerjaan_qty` (`pekerjaan_id`,`qty`);

--
-- Indeks untuk tabel `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `ba_inbox`
--
ALTER TABLE `ba_inbox`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4983;

--
-- AUTO_INCREMENT untuk tabel `password_resets`
--
ALTER TABLE `password_resets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `pekerjaan`
--
ALTER TABLE `pekerjaan`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT untuk tabel `pekerjaan_foto`
--
ALTER TABLE `pekerjaan_foto`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT untuk tabel `pekerjaan_item`
--
ALTER TABLE `pekerjaan_item`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT untuk tabel `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `password_resets`
--
ALTER TABLE `password_resets`
  ADD CONSTRAINT `password_resets_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `pekerjaan_foto`
--
ALTER TABLE `pekerjaan_foto`
  ADD CONSTRAINT `pekerjaan_foto_ibfk_1` FOREIGN KEY (`pekerjaan_id`) REFERENCES `pekerjaan` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `pekerjaan_item`
--
ALTER TABLE `pekerjaan_item`
  ADD CONSTRAINT `pekerjaan_item_ibfk_1` FOREIGN KEY (`pekerjaan_id`) REFERENCES `pekerjaan` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
