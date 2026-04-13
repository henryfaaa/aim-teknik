-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 06 Sep 2025 pada 08.38
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
(1, '198450fa9e1b414f', 'BA Opname nomor BA-OPNAME/2025/03/004/010653', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/010653', '25G0128877', 'BA-OPNAME_2025_03_004_010653.pdf', '2025-07-26 11:50:20', '2025-09-06 08:00:53', 0, NULL, 0, NULL),
(2, '1982b8d3070cd3ec', 'BA Opname nomor BA-OPNAME/2025/03/004/010493', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/010493', '25G0004877', 'BA-OPNAME_2025_03_004_010493.pdf', '2025-07-21 12:57:21', '2025-09-01 17:55:44', 0, NULL, 0, NULL),
(3, '1981d4d1ed025a4f', 'BA Opname nomor BA-OPNAME/2025/03/004/010447', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/010447', '25G0030764', 'BA-OPNAME_2025_03_004_010447.pdf', '2025-07-18 18:32:35', '2025-09-01 17:55:44', 0, NULL, 0, NULL),
(4, '1981d2d60ef84543', 'BA Opname nomor BA-OPNAME/2025/03/004/010451', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/010451', '25G0078296', 'BA-OPNAME_2025_03_004_010451.pdf', '2025-07-18 17:57:54', '2025-09-01 17:55:45', 0, NULL, 0, NULL),
(5, '198179ef40b38ea1', 'BA Opname nomor BA-OPNAME/2025/03/004/010369', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/010369', '25F0177609', 'BA-OPNAME_2025_03_004_010369.pdf', '2025-07-17 16:04:17', '2025-08-30 20:00:59', 0, NULL, 0, NULL),
(6, '1981791589f9d84a', 'BA Opname nomor BA-OPNAME/2025/03/004/010345', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/010345', '25F0150856', 'BA-OPNAME_2025_03_004_010345.pdf', '2025-07-17 15:49:26', '2025-08-30 20:01:00', 0, NULL, 0, NULL),
(7, '1980d7e7ac68e041', 'BA Opname nomor BA-OPNAME/2025/03/004/010282', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/010282', '25G0073367', 'BA-OPNAME_2025_03_004_010282.pdf', '2025-07-15 16:52:36', '2025-08-27 20:55:49', 0, NULL, 0, NULL),
(8, '198082f3d4cc6b5c', 'BA Opname nomor BA-OPNAME/2025/03/004/010208', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/010208', '25G0032935', 'BA-OPNAME_2025_03_004_010208.pdf', '2025-07-14 16:07:41', '2025-08-27 20:55:50', 0, NULL, 0, NULL),
(9, '198082cc6cf293e4', 'BA Opname nomor BA-OPNAME/2025/03/004/010197', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/010197', '25E0175002', 'BA-OPNAME_2025_03_004_010197.pdf', '2025-07-14 16:05:00', '2025-08-17 09:35:35', 0, NULL, 0, NULL),
(10, '198082c6ec0b442e', 'BA Opname nomor BA-OPNAME/2025/03/004/010197', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/010197', '25E0175002', 'BA-OPNAME_2025_03_004_010197.pdf', '2025-07-14 16:04:52', '2025-08-23 21:45:41', 0, NULL, 0, NULL),
(11, '198082c477dbfe46', 'BA Opname nomor BA-OPNAME/2025/03/004/010229', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/010229', '25G0063031', 'BA-OPNAME_2025_03_004_010229.pdf', '2025-07-14 16:04:38', '2025-08-27 20:55:52', 0, NULL, 0, NULL),
(12, '19807d176addcfa8', 'BA Opname nomor BA-OPNAME/2025/03/004/010242', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/010242', '25F0224320', 'BA-OPNAME_2025_03_004_010242.pdf', '2025-07-14 14:25:28', '2025-08-23 21:45:43', 0, NULL, 0, NULL),
(13, '197f8774aee9a530', 'BA Opname nomor BA-OPNAME/2025/03/004/010074', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/010074', '25G0021984', 'BA-OPNAME_2025_03_004_010074.pdf', '2025-07-11 14:52:38', '2025-08-25 08:25:45', 0, NULL, 0, NULL),
(14, '197f8773fa1a80c0', 'BA Opname nomor BA-OPNAME/2025/03/004/010074', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/010074', '25G0021984', 'BA-OPNAME_2025_03_004_010074.pdf', '2025-07-11 14:52:30', '2025-08-25 08:25:45', 0, NULL, 0, NULL),
(15, '197f8770a408b75a', 'BA Opname nomor BA-OPNAME/2025/03/004/010078', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/010078', '25G0030166', 'BA-OPNAME_2025_03_004_010078.pdf', '2025-07-11 14:52:24', '2025-08-25 08:25:46', 0, NULL, 0, NULL),
(16, '197f86510f536bd8', 'BA Opname nomor BA-OPNAME/2025/03/004/010186', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/010186', '25F0024662', 'BA-OPNAME_2025_03_004_010186.pdf', '2025-07-11 14:32:44', '2025-08-25 08:25:47', 0, NULL, 0, NULL),
(17, '197f860c9cd03b6c', 'BA Opname nomor BA-OPNAME/2025/03/004/010184', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/010184', '25E0218347', 'BA-OPNAME_2025_03_004_010184.pdf', '2025-07-11 14:28:05', '2025-08-25 08:25:47', 0, NULL, 0, NULL),
(18, '197f851b284aa58c', 'BA Opname nomor BA-OPNAME/2025/03/004/010061', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/010061', '25F0093236', 'BA-OPNAME_2025_03_004_010061.pdf', '2025-07-11 14:11:36', '2025-08-25 08:25:48', 0, NULL, 0, NULL),
(19, '197ef65cc7ecbdb0', 'BA Opname nomor BA-OPNAME/2025/03/004/010031', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/010031', '25D0192515', 'BA-OPNAME_2025_03_004_010031.pdf', '2025-07-09 20:36:57', '2025-08-23 20:35:48', 0, NULL, 0, NULL),
(20, '197ef62fbb4e9631', 'BA Opname nomor BA-OPNAME/2025/03/004/010032', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/010032', '25F0090131', 'BA-OPNAME_2025_03_004_010032.pdf', '2025-07-09 20:33:53', '2025-08-18 13:25:35', 0, NULL, 0, NULL),
(21, '197ef61be1371c13', 'BA Opname nomor BA-OPNAME/2025/03/004/009968', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/009968', '25F0195889', 'BA-OPNAME_2025_03_004_009968.pdf', '2025-07-09 20:32:32', '2025-08-18 13:25:36', 0, NULL, 0, NULL),
(22, '197ef61987817369', 'BA Opname nomor BA-OPNAME/2025/03/004/009967', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/009967', '25F0193739', 'BA-OPNAME_2025_03_004_009967.pdf', '2025-07-09 20:32:20', '2025-08-18 13:25:36', 0, NULL, 0, NULL),
(23, '197ef617127e7aec', 'BA Opname nomor BA-OPNAME/2025/03/004/009964', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/009964', '25F0072866', 'BA-OPNAME_2025_03_004_009964.pdf', '2025-07-09 20:32:10', '2025-08-18 13:25:37', 0, NULL, 0, NULL),
(24, '197ef57fe97a21c6', 'BA Opname nomor BA-OPNAME/2025/03/004/010052', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/010052', '25G0022147', 'BA-OPNAME_2025_03_004_010052.pdf', '2025-07-09 20:21:49', '2025-08-18 13:25:38', 0, NULL, 0, NULL),
(25, '197e4f9fb3d6278b', 'BA Opname nomor BA-OPNAME/2025/03/004/009895', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/009895', '25F0251644', 'BA-OPNAME_2025_03_004_009895.pdf', '2025-07-07 20:02:57', '2025-08-18 13:25:38', 0, NULL, 0, NULL),
(26, '197e4f6ee8018f21', 'BA Opname nomor BA-OPNAME/2025/03/004/009949', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/009949', '25G0004844', 'BA-OPNAME_2025_03_004_009949.pdf', '2025-07-07 19:59:37', '2025-08-18 10:10:43', 0, NULL, 0, NULL),
(27, '197d548b919273e8', 'BA Opname nomor BA-OPNAME/2025/03/004/009798', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/009798', '25F0209049', 'BA-OPNAME_2025_03_004_009798.pdf', '2025-07-04 18:55:02', '2025-08-18 13:25:39', 0, NULL, 0, NULL),
(28, '197d5466890961ff', 'BA Opname nomor BA-OPNAME/2025/03/004/009810', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/009810', '25F0225436', 'BA-OPNAME_2025_03_004_009810.pdf', '2025-07-04 18:52:30', '2025-08-18 13:25:40', 0, NULL, 0, NULL),
(29, '197d3a4f666e9696', 'BA Opname nomor BA-OPNAME/2025/03/004/009788', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/009788', '25F0198593', 'BA-OPNAME_2025_03_004_009788.pdf', '2025-07-04 11:16:31', '2025-08-18 11:10:43', 0, NULL, 0, NULL),
(30, '197d3a1ffbf8c643', 'BA Opname nomor BA-OPNAME/2025/03/004/009749', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/009749', '25F0235257', 'BA-OPNAME_2025_03_004_009749.pdf', '2025-07-04 11:13:19', '2025-08-18 11:10:44', 0, NULL, 0, NULL),
(31, '197d39b5c09756a3', 'BA Opname nomor BA-OPNAME/2025/03/004/009743', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/009743', '25F0217416', 'BA-OPNAME_2025_03_004_009743.pdf', '2025-07-04 11:06:03', '2025-08-18 11:00:51', 0, NULL, 0, NULL),
(32, '197d3989ecc6eeb6', 'BA Opname nomor BA-OPNAME/2025/03/004/009776', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/009776', '25F0169760', 'BA-OPNAME_2025_03_004_009776.pdf', '2025-07-04 11:02:59', '2025-08-18 11:00:52', 0, NULL, 0, NULL),
(33, '197cb508ecb335ad', 'BA Opname nomor BA-OPNAME/2025/03/004/009682', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/009682', '25F0216524', 'BA-OPNAME_2025_03_004_009682.pdf', '2025-07-02 20:27:21', '2025-08-16 20:25:56', 0, NULL, 0, NULL),
(34, '197c4040d4f95c0b', 'BA Opname nomor BA-OPNAME/2025/03/004/009665', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/009665', '25F0214272', 'BA-OPNAME_2025_03_004_009665.pdf', '2025-07-01 10:26:26', '2025-08-14 08:45:52', 0, NULL, 0, NULL),
(35, '197c0c440658b3aa', 'BA Opname nomor BA-OPNAME/2025/03/004/009632', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/009632', '25E0200648', 'BA-OPNAME_2025_03_004_009632.pdf', '2025-06-30 19:17:54', '2025-08-14 08:45:53', 0, NULL, 0, NULL),
(36, '198892e2c7d5621a', 'BA Opname nomor BA-OPNAME/2025/03/004/011126', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/011126', '25G0254196', 'BA-OPNAME_2025_03_004_011126.pdf', '2025-08-08 17:17:30', '2025-09-06 08:00:35', 1, '2025-08-18 10:49:28', 0, NULL),
(37, '198892dd0bf8cd17', 'BA Opname nomor BA-OPNAME/2025/03/004/011140', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/011140', '25H0022280', 'BA-OPNAME_2025_03_004_011140.pdf', '2025-08-08 17:17:05', '2025-09-06 08:00:36', 1, '2025-08-18 10:49:28', 0, NULL),
(38, '198892d5720d080e', 'BA Opname nomor BA-OPNAME/2025/03/004/011142', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/011142', '25H0028452', 'BA-OPNAME_2025_03_004_011142.pdf', '2025-08-08 17:16:34', '2025-09-06 08:00:37', 1, '2025-08-23 21:42:51', 0, NULL),
(39, '198892d31325b161', 'BA Opname nomor BA-OPNAME/2025/03/004/011142', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/011142', '25H0028452', 'BA-OPNAME_2025_03_004_011142.pdf', '2025-08-08 17:16:26', '2025-09-06 08:00:37', 1, '2025-08-23 21:42:51', 0, NULL),
(40, '198892240b2889a0', 'BA Opname nomor BA-OPNAME/2025/03/004/011152', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/011152', '25G0218865', 'BA-OPNAME_2025_03_004_011152.pdf', '2025-08-08 17:04:27', '2025-09-06 08:00:38', 0, NULL, 0, NULL),
(41, '19889220623650ae', 'BA Opname nomor BA-OPNAME/2025/03/004/011152', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/011152', '25G0218865', 'BA-OPNAME_2025_03_004_011152.pdf', '2025-08-08 17:04:19', '2025-09-06 08:00:39', 0, NULL, 0, NULL),
(42, '198891ee7d56ca89', 'BA Opname nomor BA-OPNAME/2025/03/004/011174', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/011174', '25G0241234', 'BA-OPNAME_2025_03_004_011174.pdf', '2025-08-08 17:00:49', '2025-09-06 08:00:39', 0, NULL, 0, NULL),
(43, '19875db1388ef508', 'BA Opname nomor BA-OPNAME/2025/03/004/011017', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/011017', '25G0235258', 'BA-OPNAME_2025_03_004_011017.pdf', '2025-08-04 23:13:56', '2025-09-06 08:00:40', 0, NULL, 0, NULL),
(44, '19875dafbc1e04ab', 'BA Opname nomor BA-OPNAME/2025/03/004/011017', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/011017', '25G0235258', 'BA-OPNAME_2025_03_004_011017.pdf', '2025-08-04 23:13:51', '2025-09-06 08:00:40', 0, NULL, 0, NULL),
(45, '19875da1e8f417b4', 'BA Opname nomor BA-OPNAME/2025/03/004/011018', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/011018', '25G0242045', 'BA-OPNAME_2025_03_004_011018.pdf', '2025-08-04 23:12:53', '2025-09-06 08:00:41', 0, NULL, 0, NULL),
(46, '19875d5ed9d39864', 'BA Opname nomor BA-OPNAME/2025/03/004/011060', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/011060', '25G0218403', 'BA-OPNAME_2025_03_004_011060.pdf', '2025-08-04 23:08:18', '2025-09-06 08:00:42', 0, NULL, 0, NULL),
(47, '198751016b338623', 'BA Opname nomor BA-OPNAME/2025/03/004/011057', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/011057', '25G0180555', 'BA-OPNAME_2025_03_004_011057.pdf', '2025-08-04 19:32:09', '2025-09-06 08:00:42', 0, NULL, 0, NULL),
(48, '1986595e89947ccc', 'BA Opname nomor BA-OPNAME/2025/03/004/010937', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/010937', '25G0194649', 'BA-OPNAME_2025_03_004_010937.pdf', '2025-08-01 19:24:22', '2025-09-06 08:00:43', 0, NULL, 0, NULL),
(49, '1986594ca14e6139', 'BA Opname nomor BA-OPNAME/2025/03/004/010972', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/010972', '25G0225993', 'BA-OPNAME_2025_03_004_010972.pdf', '2025-08-01 19:23:16', '2025-09-06 08:00:44', 0, NULL, 0, NULL),
(50, '198659328e332310', 'BA Opname nomor BA-OPNAME/2025/03/004/010975', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/010975', '25G0244889', 'BA-OPNAME_2025_03_004_010975.pdf', '2025-08-01 19:21:25', '2025-09-06 08:00:45', 0, NULL, 0, NULL),
(51, '19860792bbbaeb39', 'BA Opname nomor BA-OPNAME/2025/03/004/010913', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/010913', '25G0180124', 'BA-OPNAME_2025_03_004_010913.pdf', '2025-07-31 19:35:22', '2025-09-06 08:00:46', 0, NULL, 0, NULL),
(52, '1985f75868afe7db', 'BA Opname nomor BA-OPNAME/2025/03/004/010918', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/010918', '25G0197085', 'BA-OPNAME_2025_03_004_010918.pdf', '2025-07-31 14:51:48', '2025-09-06 08:00:46', 0, NULL, 0, NULL),
(53, '1985b2bf40643a82', 'BA Opname nomor BA-OPNAME/2025/03/004/010892', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/010892', '25G0213011', 'BA-OPNAME_2025_03_004_010892.pdf', '2025-07-30 18:53:00', '2025-09-06 08:00:48', 0, NULL, 0, NULL),
(54, '1985b2bdc385b73b', 'BA Opname nomor BA-OPNAME/2025/03/004/010892', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/010892', '25G0213011', 'BA-OPNAME_2025_03_004_010892.pdf', '2025-07-30 18:52:50', '2025-09-06 08:00:48', 0, NULL, 0, NULL),
(55, '1985b2baa37ad460', 'BA Opname nomor BA-OPNAME/2025/03/004/010892', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/010892', '25G0213011', 'BA-OPNAME_2025_03_004_010892.pdf', '2025-07-30 18:52:41', '2025-09-06 08:00:49', 0, NULL, 0, NULL),
(56, '1984a6752c0bfa07', 'BA Opname nomor BA-OPNAME/2025/03/004/010801', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/010801', '25G0149503', 'BA-OPNAME_2025_03_004_010801.pdf', '2025-07-27 12:44:12', '2025-08-27 20:20:46', 0, NULL, 0, NULL),
(57, '198451c4aa01b08b', 'BA Opname nomor BA-OPNAME/2025/03/004/010731', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/010731', '25G0130984', 'BA-OPNAME_2025_03_004_010731.pdf', '2025-07-26 12:04:13', '2025-09-06 08:00:51', 0, NULL, 0, NULL),
(58, '198451529ff70f86', 'BA Opname nomor BA-OPNAME/2025/03/004/010705', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/010705', '25G0140642', 'BA-OPNAME_2025_03_004_010705.pdf', '2025-07-26 11:56:21', '2025-09-06 08:00:52', 0, NULL, 0, NULL),
(59, '1984511a7b8a18d3', 'BA Opname nomor BA-OPNAME/2025/03/004/010683', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/010683', '25G0161502', 'BA-OPNAME_2025_03_004_010683.pdf', '2025-07-26 11:52:35', '2025-08-16 21:50:29', 0, NULL, 0, NULL),
(1680, '1989cb78c28e05fe', 'BA Opname nomor BA-OPNAME/2025/03/004/011256', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/011256', '25H0027269', 'BA-OPNAME_2025_03_004_011256.pdf', '2025-08-12 12:20:24', '2025-09-06 08:00:35', 0, NULL, 0, NULL),
(1740, '1989cbcd871f5737', 'BA Opname nomor BA-OPNAME/2025/03/004/011202', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/011202', '25H0026562', 'BA-OPNAME_2025_03_004_011202.pdf', '2025-08-12 12:26:12', '2025-09-06 08:00:33', 0, NULL, 0, NULL),
(1800, '1989cc01fd18ca01', 'BA Opname nomor BA-OPNAME/2025/03/004/011199', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/011199', '25H0029288', 'BA-OPNAME_2025_03_004_011199.pdf', '2025-08-12 12:29:46', '2025-09-06 08:00:32', 1, '2025-08-18 10:49:28', 0, NULL),
(1801, '1989cbfb71aa1ff4', 'BA Opname nomor BA-OPNAME/2025/03/004/009847', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/009847', '25F0254601', 'BA-OPNAME_2025_03_004_009847.pdf', '2025-08-12 12:29:22', '2025-09-06 08:00:33', 0, NULL, 0, NULL),
(1861, '1989cc57a961babe', 'BA Opname nomor BA-OPNAME/2025/03/004/011246', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/011246', '25H0007213', 'BA-OPNAME_2025_03_004_011246.pdf', '2025-08-12 12:35:36', '2025-09-06 08:00:31', 1, '2025-08-22 08:21:03', 0, NULL),
(9804, '198adaf3f773958b', 'BA Opname nomor BA-OPNAME/2025/03/004/011326', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/011326', '25H0033439', 'BA-OPNAME_2025_03_004_011326.pdf', '2025-08-15 19:24:53', '2025-09-06 08:10:36', 1, '2025-08-18 10:49:28', 0, NULL),
(9805, '198adadbf060f6d6', 'BA Opname nomor BA-OPNAME/2025/03/004/011333', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/011333', '25H0069329', 'BA-OPNAME_2025_03_004_011333.pdf', '2025-08-15 19:23:19', '2025-09-06 08:10:36', 1, '2025-08-18 10:49:28', 0, NULL),
(9806, '198ada3cfec7c91a', 'BA Opname nomor BA-OPNAME/2025/03/004/011376', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/011376', '25H0040293', 'BA-OPNAME_2025_03_004_011376.pdf', '2025-08-15 19:12:24', '2025-09-06 08:10:37', 1, '2025-08-18 10:49:28', 0, NULL),
(9807, '198ada235b3b6c85', 'BA Opname nomor BA-OPNAME/2025/03/004/011416', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/011416', '25H0040342', 'BA-OPNAME_2025_03_004_011416.pdf', '2025-08-15 19:10:43', '2025-08-18 10:15:03', 1, '2025-08-18 10:49:28', 0, NULL),
(9808, '198ada0266e8bd79', 'BA Opname nomor BA-OPNAME/2025/03/004/011462', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/011462', '25H0076429', 'BA-OPNAME_2025_03_004_011462.pdf', '2025-08-15 19:08:25', '2025-09-06 08:00:30', 0, NULL, 0, NULL),
(9809, '198ada00c9d1fe9f', 'BA Opname nomor BA-OPNAME/2025/03/004/011462', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/011462', '25H0076429', 'BA-OPNAME_2025_03_004_011462.pdf', '2025-08-15 19:08:17', '2025-09-06 08:00:31', 0, NULL, 0, NULL),
(19380, '198c5e4a7b99eb58', 'BA Opname nomor BA-OPNAME/2025/03/004/011611', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/011611', '25H0121349', 'BA-OPNAME_2025_03_004_011611.pdf', '2025-08-20 12:14:07', '2025-09-06 08:10:31', 1, '2025-08-23 21:45:51', 0, NULL),
(19381, '198c31a3f02baabc', 'BA Opname nomor BA-OPNAME/2025/03/004/011527', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/011527', '25H0070057', 'BA-OPNAME_2025_03_004_011527.pdf', '2025-08-19 23:13:51', '2025-09-06 08:10:32', 1, '2025-08-27 08:26:17', 0, NULL),
(19382, '198c31a1757c8ac9', 'BA Opname nomor BA-OPNAME/2025/03/004/011542', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/011542', '25H0113736', 'BA-OPNAME_2025_03_004_011542.pdf', '2025-08-19 23:13:39', '2025-09-06 08:10:32', 0, NULL, 0, NULL),
(19383, '198c316879f0ed5e', 'BA Opname nomor BA-OPNAME/2025/03/004/011582', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/011582', '25H0068492', 'BA-OPNAME_2025_03_004_011582.pdf', '2025-08-19 23:09:47', '2025-08-23 20:35:05', 0, NULL, 0, NULL),
(19384, '198c3150f9c02d15', 'BA Opname nomor BA-OPNAME/2025/03/004/011546', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/011546', '25H0122294', 'BA-OPNAME_2025_03_004_011546.pdf', '2025-08-19 23:08:10', '2025-09-06 08:10:34', 0, NULL, 0, NULL),
(20481, '198db2550c3d02af', 'BA Opname nomor BA-OPNAME/2025/03/004/011762', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/011762', '25H0125207', 'BA-OPNAME_2025_03_004_011762.pdf', '2025-08-24 15:16:48', '2025-09-06 08:10:16', 0, NULL, 0, NULL),
(20482, '198db25200eca2a0', 'BA Opname nomor BA-OPNAME/2025/03/004/011762', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/011762', '25H0125207', 'BA-OPNAME_2025_03_004_011762.pdf', '2025-08-24 15:16:42', '2025-09-06 08:10:16', 0, NULL, 0, NULL),
(20483, '198db24fb9e43351', 'BA Opname nomor BA-OPNAME/2025/03/004/011715', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/011715', '25H0128255', 'BA-OPNAME_2025_03_004_011715.pdf', '2025-08-24 15:16:30', '2025-09-06 08:10:18', 0, NULL, 0, NULL),
(20484, '198db246ded6d875', 'BA Opname nomor BA-OPNAME/2025/03/004/011717', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/011717', '25H0130072', 'BA-OPNAME_2025_03_004_011717.pdf', '2025-08-24 15:15:53', '2025-09-06 08:10:19', 0, NULL, 0, NULL),
(20485, '198db22ede46b90f', 'BA Opname nomor BA-OPNAME/2025/03/004/011810', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/011810', '25H0081325', 'BA-OPNAME_2025_03_004_011810.pdf', '2025-08-24 15:14:17', '2025-09-06 08:10:19', 0, NULL, 0, NULL),
(20486, '198db22dd17464dd', 'BA Opname nomor BA-OPNAME/2025/03/004/011810', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/011810', '25H0081325', 'BA-OPNAME_2025_03_004_011810.pdf', '2025-08-24 15:14:09', '2025-09-06 08:10:21', 0, NULL, 0, NULL),
(20487, '198db21d0646bdd3', 'BA Opname nomor BA-OPNAME/2025/03/004/011817', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/011817', '25H0130935', 'BA-OPNAME_2025_03_004_011817.pdf', '2025-08-24 15:13:01', '2025-09-06 08:10:21', 0, NULL, 0, NULL),
(20488, '198db1f3d222e23a', 'BA Opname nomor BA-OPNAME/2025/03/004/011782', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/011782', '25H0147149', 'BA-OPNAME_2025_03_004_011782.pdf', '2025-08-24 15:10:12', '2025-09-06 08:10:22', 0, NULL, 0, NULL),
(20489, '198db031ddd76374', 'BA Opname nomor BA-OPNAME/2025/03/004/011807', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/011807', '25H0168944', 'BA-OPNAME_2025_03_004_011807.pdf', '2025-08-24 14:39:27', '2025-09-06 08:10:28', 0, NULL, 0, NULL),
(20490, '198db002ab7c94c8', 'BA Opname nomor BA-OPNAME/2025/03/004/011765', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/011765', '25H0132285', 'BA-OPNAME_2025_03_004_011765.pdf', '2025-08-24 14:36:17', '2025-09-06 08:10:29', 0, NULL, 0, NULL),
(20542, '198db27eeb870ee7', 'BA Opname nomor BA-OPNAME/2025/03/004/011659', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/011659', '25H0104994', 'BA-OPNAME_2025_03_004_011659.pdf', '2025-08-24 15:19:44', '2025-08-27 20:00:04', 0, NULL, 0, NULL),
(20604, '198db268d6fa16c7', 'BA Opname nomor BA-OPNAME/2025/03/004/011700', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/011700', '25H0101591', 'BA-OPNAME_2025_03_004_011700.pdf', '2025-08-24 15:18:10', '2025-08-25 08:25:02', 0, NULL, 0, NULL),
(22088, '198e144bdfa64435', 'BA Opname nomor BA-OPNAME/2025/03/004/011852', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/011852', '25H0179858', 'BA-OPNAME_2025_03_004_011852.pdf', '2025-08-25 19:48:48', '2025-09-06 08:10:14', 0, NULL, 0, NULL),
(23239, '198e5f21dd92d7db', 'BA Opname nomor BA-OPNAME/2025/03/004/011881', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/011881', '25H0181535', 'BA-OPNAME_2025_03_004_011881.pdf', '2025-08-26 17:36:48', '2025-09-06 08:10:12', 0, NULL, 0, NULL),
(26273, '198f531504cff02d', 'BA Opname nomor BA-OPNAME/2025/03/004/011946', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/011946', '25H0219632', 'BA-OPNAME_2025_03_004_011946.pdf', '2025-08-29 16:40:06', '2025-09-06 08:10:10', 0, NULL, 0, NULL),
(26274, '198f52ff0a27c4f3', 'BA Opname nomor BA-OPNAME/2025/03/004/011995', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/011995', '25H0180901', 'BA-OPNAME_2025_03_004_011995.pdf', '2025-08-29 16:38:37', '2025-09-06 08:10:12', 0, NULL, 0, NULL),
(27113, '19904c97f4c1cc09', 'BA Opname nomor BA-OPNAME/2025/03/004/012073', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/012073', '25H0242403', 'BA-OPNAME_2025_03_004_012073.pdf', '2025-09-01 17:20:41', '2025-09-06 08:10:06', 0, NULL, 0, NULL),
(27114, '19904c8501edbd5b', 'BA Opname nomor BA-OPNAME/2025/03/004/012082', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/012082', '25H0221791', 'BA-OPNAME_2025_03_004_012082.pdf', '2025-09-01 17:19:06', '2025-09-06 08:10:07', 0, NULL, 0, NULL),
(27115, '19904c6f8f858f41', 'BA Opname nomor BA-OPNAME/2025/03/004/012080', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/012080', '25H0215739', 'BA-OPNAME_2025_03_004_012080.pdf', '2025-09-01 17:17:49', '2025-09-06 08:10:08', 0, NULL, 0, NULL),
(27116, '19904c3b60a94c67', 'BA Opname nomor BA-OPNAME/2025/03/004/012069', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/012069', '25H0224964', 'BA-OPNAME_2025_03_004_012069.pdf', '2025-09-01 17:14:01', '2025-09-06 08:10:09', 0, NULL, 0, NULL),
(27251, '198c31330b067a32', 'BA Opname nomor BA-OPNAME/2025/03/004/011583', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/011583', '25H0079657', 'BA-OPNAME_2025_03_004_011583.pdf', '2025-08-19 23:06:07', '2025-09-01 18:00:26', 0, NULL, 0, NULL),
(27346, '19904dbbf1761d99', 'BA Opname nomor BA-OPNAME/2025/03/004/012037', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/012037', '25H0225087', 'BA-OPNAME_2025_03_004_012037.pdf', '2025-09-01 17:40:34', '2025-09-06 08:10:06', 0, NULL, 0, NULL),
(27628, '1991481d3992ebb9', 'BA Opname nomor BA-OPNAME/2025/03/004/012145', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/012145', '25H0233283', 'BA-OPNAME_2025_03_004_012145.pdf', '2025-09-04 18:36:23', '2025-09-06 08:10:02', 0, NULL, 0, NULL),
(27629, '1991469578fbfe7e', 'BA Opname nomor BA-OPNAME/2025/03/004/012161', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/012161', '25I0006032', 'BA-OPNAME_2025_03_004_012161.pdf', '2025-09-04 18:09:37', '2025-09-06 08:10:03', 0, NULL, 0, NULL),
(27630, '1991467c3a6aeec7', 'BA Opname nomor BA-OPNAME/2025/03/004/012143', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/012143', '25H0226427', 'BA-OPNAME_2025_03_004_012143.pdf', '2025-09-04 18:07:51', '2025-09-06 08:10:03', 0, NULL, 0, NULL),
(27631, '199146126c818163', 'BA Opname nomor BA-OPNAME/2025/03/004/012162', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/012162', '25I0007501', 'BA-OPNAME_2025_03_004_012162.pdf', '2025-09-04 18:00:42', '2025-09-06 08:10:04', 0, NULL, 0, NULL),
(27632, '1990996ec6b642d9', 'BA Opname nomor BA-OPNAME/2025/03/004/012124', 'ACLWEB <aclweb@indomaret.co.id>', 'BA-OPNAME/2025/03/004/012124', '25H0237164', 'BA-OPNAME_2025_03_004_012124.pdf', '2025-09-02 15:43:27', '2025-09-06 08:10:05', 0, NULL, 0, NULL);

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
  `ba_final_total` decimal(18,2) DEFAULT NULL,
  `ba_final_desc` text DEFAULT NULL,
  `status` enum('draft','siap_kirim','terkirim') NOT NULL DEFAULT 'draft',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `status_ba` varchar(20) DEFAULT 'belum_cetak',
  `status_cair` enum('belum','proses','sudah') DEFAULT 'belum'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `pekerjaan`
--

INSERT INTO `pekerjaan` (`id`, `tanggal`, `no_co`, `ba_opname_no`, `ba_source`, `ba_synced_at`, `kode_toko`, `nama_toko`, `total_harga`, `ba_final_total`, `ba_final_desc`, `status`, `created_at`, `updated_at`, `status_ba`, `status_cair`) VALUES
(4, '2025-08-11', '25H1220202', NULL, NULL, NULL, 'T0T9', 'Cibarengkok', 1200500, NULL, NULL, 'terkirim', '2025-08-10 14:35:58', '2025-08-10 14:36:03', 'belum_cetak', 'belum'),
(5, '2025-08-08', '25G0254196', 'BA-OPNAME/2025/03/004/011126', 'gmail', '2025-09-06 08:00:35', 'T3SI', 'ARYASANTIKA 2', 390000, NULL, '\n\nBERITA ACARA - Opname\nPada tanggal 04 Agustus 2025 telah dilakukan pekerjaan perbaikan di IDM ARYASANTIKA 2(T3SI) oleh kontraktor\nSUP - AIM TEHNIK dengan nomor dokumen sbb:\nAdapun hasil opname bersama meliputi sebagai berikut:\nDemikian berita acara opname ini kami buat sesuai realisasi pekerjaan dan kami buat sebenar - benarnya\n \nJakarta, 08 Agustus 2025\nPT. Albany Corona Lestari\nNo. BA: BA-OPNAME/2025/03/004/011126\nTgl. Final BA: 01 Januari 0001\nRef. No. PBP: -\nRef. No. SPK: SPK-CO/2025/03/00', 'terkirim', '2025-08-11 16:23:54', '2025-09-06 01:00:35', 'belum_cetak', 'belum'),
(6, '2025-08-13', '25H0028452', 'BA-OPNAME/2025/03/004/011142', 'gmail', '2025-09-06 08:00:37', 'TVMY', 'Fresh Graha Sevilla', 450000, NULL, '\n\nBERITA ACARA - Opname\nPada tanggal 04 Agustus 2025 telah dilakukan pekerjaan perbaikan di IDM FRESH GRAHA SEVILLA(TVMY) oleh\nkontraktor SUP - AIM TEHNIK dengan nomor dokumen sbb:\nAdapun hasil opname bersama meliputi sebagai berikut:\nDemikian berita acara opname ini kami buat sesuai realisasi pekerjaan dan kami buat sebenar - benarnya\n \nJakarta, 08 Agustus 2025\nPT. Albany Corona Lestari\nNo. BA: BA-OPNAME/2025/03/004/011142\nTgl. Final BA: 01 Januari 0001\nRef. No. PBP: -\nRef. No. SPK: SPK-CO/2025', 'terkirim', '2025-08-12 04:58:11', '2025-09-06 01:00:37', 'belum_cetak', 'belum'),
(7, '2025-08-08', '25H0022280', 'BA-OPNAME/2025/03/004/011140', 'gmail', '2025-09-06 08:00:36', 'TJX8', 'Raya Panongan', 950000, NULL, '\n\nBERITA ACARA - Opname\nPada tanggal 06 Agustus 2025 telah dilakukan pekerjaan perbaikan di IDM RAYA PANONGAN(TJX8) oleh kontraktor\nSUP - AIM TEHNIK dengan nomor dokumen sbb:\nAdapun hasil opname bersama meliputi sebagai berikut:\nDemikian berita acara opname ini kami buat sesuai realisasi pekerjaan dan kami buat sebenar - benarnya\n \nJakarta, 08 Agustus 2025\nPT. Albany Corona Lestari\nNo. BA: BA-OPNAME/2025/03/004/011140\nTgl. Final BA: 01 Januari 0001\nRef. No. PBP: PBP-BE-CO/2025/03/004/004904\nRef.', 'terkirim', '2025-08-12 05:46:51', '2025-09-06 01:00:36', 'belum_cetak', 'belum'),
(8, '2025-08-12', '25H0007213', 'BA-OPNAME/2025/03/004/011246', 'gmail', '2025-09-06 08:00:31', 'TYFN', 'Kedaton', 999000, NULL, '\n\nBERITA ACARA - Opname\nPada tanggal 06 Agustus 2025 telah dilakukan pekerjaan perbaikan di IDM KEDATON(TYFN) oleh kontraktor SUP -\nAIM TEHNIK dengan nomor dokumen sbb:\nAdapun hasil opname bersama meliputi sebagai berikut:\nDemikian berita acara opname ini kami buat sesuai realisasi pekerjaan dan kami buat sebenar - benarnya\n \nJakarta, 12 Agustus 2025\nPT. Albany Corona Lestari\nNo. BA: BA-OPNAME/2025/03/004/011246\nTgl. Final BA: 01 Januari 0001\nRef. No. PBP: PBP-BE-CO/2025/03/004/004863\nRef. No. S', 'terkirim', '2025-08-12 09:58:44', '2025-09-06 01:00:31', 'belum_cetak', 'belum'),
(9, '2025-08-08', '25H0033439', 'BA-OPNAME/2025/03/004/011326', 'gmail', '2025-09-06 08:10:36', 'F934', 'EMPU GANDRING RAYA', 662000, NULL, '\n\nBERITA ACARA - Opname\nPada tanggal 08 Agustus 2025 telah dilakukan pekerjaan perbaikan di IDM EMPU GANDRING RAYA(F934) oleh\nkontraktor SUP - AIM TEHNIK dengan nomor dokumen sbb:\nAdapun hasil opname bersama meliputi sebagai berikut:\nDemikian berita acara opname ini kami buat sesuai realisasi pekerjaan dan kami buat sebenar - benarnya\n \nJakarta, 15 Agustus 2025\nPT. Albany Corona Lestari\nNo. BA: BA-OPNAME/2025/03/004/011326\nTgl. Final BA: 01 Januari 0001\nRef. No. PBP: PBP-BE-CO/2025/03/004/004932', 'siap_kirim', '2025-08-16 13:42:08', '2025-09-06 01:10:36', 'belum_cetak', 'sudah'),
(11, '2025-08-08', '25H0069329', 'BA-OPNAME/2025/03/004/011333', 'gmail', '2025-09-06 08:10:37', 'T088', 'BANJAR WIJAYA', 300000, NULL, '\n\nBERITA ACARA - Opname\nPada tanggal 08 Agustus 2025 telah dilakukan pekerjaan perbaikan di IDM BANJAR WIJAYA(T088) oleh kontraktor\nSUP - AIM TEHNIK dengan nomor dokumen sbb:\nAdapun hasil opname bersama meliputi sebagai berikut:\nDemikian berita acara opname ini kami buat sesuai realisasi pekerjaan dan kami buat sebenar - benarnya\n \nJakarta, 15 Agustus 2025\nPT. Albany Corona Lestari\nNo. BA: BA-OPNAME/2025/03/004/011333\nTgl. Final BA: 01 Januari 0001\nRef. No. PBP: -\nRef. No. SPK: SPK-CO/2025/03/00', 'terkirim', '2025-08-16 13:59:23', '2025-09-06 01:10:37', 'belum_cetak', 'belum'),
(12, '2025-08-11', '25H0040342', 'BA-OPNAME/2025/03/004/011416', 'gmail', '2025-08-18 10:15:03', 'TE67', 'KEDAUNG BARAT', 699000, NULL, '\n\nBERITA ACARA - Opname\nPada tanggal 11 Agustus 2025 telah dilakukan pekerjaan perbaikan di IDM KEDAUNG BARAT(TE67) oleh kontraktor\nSUP - AIM TEHNIK dengan nomor dokumen sbb:\nAdapun hasil opname bersama meliputi sebagai berikut:\nDemikian berita acara opname ini kami buat sesuai realisasi pekerjaan dan kami buat sebenar - benarnya\n \nJakarta, 15 Agustus 2025\nPT. Albany Corona Lestari\nNo. BA: BA-OPNAME/2025/03/004/011416\nTgl. Final BA: 01 Januari 0001\nRef. No. PBP: PBP-BE-CO/2025/03/004/004929\nRef.', 'terkirim', '2025-08-16 14:24:35', '2025-08-18 05:41:19', 'belum_cetak', 'belum'),
(13, '2025-08-10', '25H0040293', 'BA-OPNAME/2025/03/004/011376', 'gmail', '2025-09-06 08:10:37', 'T3V9', 'fresh daan mogot perhutani', 675000, NULL, '\n\nBERITA ACARA - Opname\nPada tanggal 10 Agustus 2025 telah dilakukan pekerjaan perbaikan di IDM FRESH DAAN MOGOT\nPERHUTANI(T3V9) oleh kontraktor SUP - AIM TEHNIK dengan nomor dokumen sbb:\nAdapun hasil opname bersama meliputi sebagai berikut:\nDemikian berita acara opname ini kami buat sesuai realisasi pekerjaan dan kami buat sebenar - benarnya\n \nJakarta, 15 Agustus 2025\nPT. Albany Corona Lestari\nNo. BA: BA-OPNAME/2025/03/004/011376\nTgl. Final BA: 01 Januari 0001\nRef. No. PBP: PBP-BE-CO/2025/03/00', 'terkirim', '2025-08-16 14:58:09', '2025-09-06 01:10:37', 'belum_cetak', 'belum'),
(14, '2025-08-05', '25H0029288', 'BA-OPNAME/2025/03/004/011199', 'gmail', '2025-09-06 08:00:32', 'TXFF', 'JL. BARU SENTIONG', 425000, NULL, '\n\nBERITA ACARA - Opname\nPada tanggal 05 Agustus 2025 telah dilakukan pekerjaan perbaikan di IDM JL BARU SENTIONG(TXFF) oleh\nkontraktor SUP - AIM TEHNIK dengan nomor dokumen sbb:\nAdapun hasil opname bersama meliputi sebagai berikut:\nDemikian berita acara opname ini kami buat sesuai realisasi pekerjaan dan kami buat sebenar - benarnya\n \nJakarta, 12 Agustus 2025\nPT. Albany Corona Lestari\nNo. BA: BA-OPNAME/2025/03/004/011199\nTgl. Final BA: 01 Januari 0001\nRef. No. PBP: -\nRef. No. SPK: SPK-CO/2025/03', 'terkirim', '2025-08-16 15:00:05', '2025-09-06 01:00:32', 'belum_cetak', 'belum'),
(15, '2025-08-15', '25H0121349', 'BA-OPNAME/2025/03/004/011611', 'gmail', '2025-09-06 08:10:31', 'TW8L', 'Hasyim Ashari 70', 343000, NULL, '\n\nBERITA ACARA - Opname\nPada tanggal 15 Agustus 2025 telah dilakukan pekerjaan perbaikan di IDM HASIM ASHARI 70(TW8L) oleh kontraktor\nSUP - AIM TEHNIK dengan nomor dokumen sbb:\nAdapun hasil opname bersama meliputi sebagai berikut:\nDemikian berita acara opname ini kami buat sesuai realisasi pekerjaan dan kami buat sebenar - benarnya\n \nJakarta, 20 Agustus 2025\nPT. Albany Corona Lestari\nNo. BA: BA-OPNAME/2025/03/004/011611\nTgl. Final BA: 01 Januari 0001\nRef. No. PBP: -\nRef. No. SPK: SPK-CO/2025/03/', 'terkirim', '2025-08-23 02:07:20', '2025-09-06 01:10:31', 'belum_cetak', 'belum'),
(16, '2025-08-15', '25H0070057', 'BA-OPNAME/2025/03/004/011527', 'gmail', '2025-09-06 08:10:32', 'TGFL', 'Puspa Citra Raya', 662000, NULL, '\n\nBERITA ACARA - Opname\nPada tanggal 15 Agustus 2025 telah dilakukan pekerjaan perbaikan di IDM PUSPA CITRA RAYA(TGFL) oleh\nkontraktor SUP - AIM TEHNIK dengan nomor dokumen sbb:\nAdapun hasil opname bersama meliputi sebagai berikut:\nDemikian berita acara opname ini kami buat sesuai realisasi pekerjaan dan kami buat sebenar - benarnya\n \nJakarta, 19 Agustus 2025\nPT. Albany Corona Lestari\nNo. BA: BA-OPNAME/2025/03/004/011527\nTgl. Final BA: 01 Januari 0001\nRef. No. PBP: PBP-BE-CO/2025/03/004/004966\nR', 'terkirim', '2025-08-23 14:41:59', '2025-09-06 01:10:32', 'belum_cetak', 'belum'),
(17, '2025-08-26', '25H0180901', 'BA-OPNAME/2025/03/004/011995', 'gmail', '2025-09-06 08:10:12', 'F877', 'Tigaraksa 3', 631000, NULL, '\n\nBERITA ACARA - Opname\nPada tanggal 26 Agustus 2025 telah dilakukan pekerjaan perbaikan di IDM TIGA RAKSA 3(F877) oleh kontraktor\nSUP - AIM TEHNIK dengan nomor dokumen sbb:\nAdapun hasil opname bersama meliputi sebagai berikut:\nDemikian berita acara opname ini kami buat sesuai realisasi pekerjaan dan kami buat sebenar - benarnya\n \nJakarta, 29 Agustus 2025\nPT. Albany Corona Lestari\nNo. BA: BA-OPNAME/2025/03/004/011995\nTgl. Final BA: 01 Januari 0001\nRef. No. PBP: PBP-BE-CO/2025/03/004/005210\nRef. ', 'terkirim', '2025-09-01 09:14:16', '2025-09-06 01:10:12', 'belum_cetak', 'belum');

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
(16, 8, 'after', '/uploads/1754992724689-WhatsApp_Image_2025-08-12_at_12.10.22_dee4d5ce.jpg', 'WhatsApp Image 2025-08-12 at 12.10.22_dee4d5ce.jpg', 'image/jpeg', 337240, '2025-08-12 09:58:44'),
(17, 9, 'before', '/uploads/1755351728725-WhatsApp_Image_2025-08-12_at_12.10.22_7b55bb50.jpg', 'WhatsApp Image 2025-08-12 at 12.10.22_7b55bb50.jpg', 'image/jpeg', 250551, '2025-08-16 13:42:08'),
(18, 9, 'after', '/uploads/1755351728731-WhatsApp_Image_2025-08-12_at_12.10.22_dee4d5ce.jpg', 'WhatsApp Image 2025-08-12 at 12.10.22_dee4d5ce.jpg', 'image/jpeg', 337240, '2025-08-16 13:42:08'),
(21, 11, 'before', '/uploads/1755352763665-WhatsApp_Image_2025-08-12_at_11.52.28_ad2484b3.jpg', 'WhatsApp Image 2025-08-12 at 11.52.28_ad2484b3.jpg', 'image/jpeg', 225649, '2025-08-16 13:59:23'),
(22, 11, 'after', '/uploads/1755352763668-WhatsApp_Image_2025-08-12_at_11.52.28_b54a4b7f.jpg', 'WhatsApp Image 2025-08-12 at 11.52.28_b54a4b7f.jpg', 'image/jpeg', 250005, '2025-08-16 13:59:23'),
(23, 12, 'before', '/uploads/1755354275305-WhatsApp_Image_2025-08-12_at_12.10.22_7b55bb50.jpg', 'WhatsApp Image 2025-08-12 at 12.10.22_7b55bb50.jpg', 'image/jpeg', 250551, '2025-08-16 14:24:35'),
(24, 12, 'after', '/uploads/1755354275309-WhatsApp_Image_2025-08-12_at_12.10.22_dee4d5ce.jpg', 'WhatsApp Image 2025-08-12 at 12.10.22_dee4d5ce.jpg', 'image/jpeg', 337240, '2025-08-16 14:24:35'),
(25, 13, 'before', '/uploads/1755356289133-WhatsApp_Image_2025-08-12_at_12.10.22_7b55bb50.jpg', 'WhatsApp Image 2025-08-12 at 12.10.22_7b55bb50.jpg', 'image/jpeg', 250551, '2025-08-16 14:58:09'),
(26, 13, 'after', '/uploads/1755356289139-WhatsApp_Image_2025-08-12_at_12.10.22_dee4d5ce.jpg', 'WhatsApp Image 2025-08-12 at 12.10.22_dee4d5ce.jpg', 'image/jpeg', 337240, '2025-08-16 14:58:09'),
(27, 14, 'before', '/uploads/1755356405042-WhatsApp_Image_2025-08-12_at_12.10.22_7b55bb50.jpg', 'WhatsApp Image 2025-08-12 at 12.10.22_7b55bb50.jpg', 'image/jpeg', 250551, '2025-08-16 15:00:05'),
(28, 14, 'after', '/uploads/1755356405045-WhatsApp_Image_2025-08-12_at_12.10.22_dee4d5ce.jpg', 'WhatsApp Image 2025-08-12 at 12.10.22_dee4d5ce.jpg', 'image/jpeg', 337240, '2025-08-16 15:00:05'),
(29, 15, 'before', '/uploads/1755914840838-WhatsApp_Image_2025-08-12_at_12.10.22_7b55bb50.jpg', 'WhatsApp Image 2025-08-12 at 12.10.22_7b55bb50.jpg', 'image/jpeg', 250551, '2025-08-23 02:07:20'),
(30, 15, 'after', '/uploads/1755914840882-WhatsApp_Image_2025-08-12_at_12.10.22_dee4d5ce.jpg', 'WhatsApp Image 2025-08-12 at 12.10.22_dee4d5ce.jpg', 'image/jpeg', 337240, '2025-08-23 02:07:20'),
(31, 16, 'before', '/uploads/1755960119306-WhatsApp_Image_2025-08-12_at_12.10.22_7b55bb50.jpg', 'WhatsApp Image 2025-08-12 at 12.10.22_7b55bb50.jpg', 'image/jpeg', 250551, '2025-08-23 14:41:59'),
(32, 16, 'after', '/uploads/1755960119312-WhatsApp_Image_2025-08-12_at_12.10.22_dee4d5ce.jpg', 'WhatsApp Image 2025-08-12 at 12.10.22_dee4d5ce.jpg', 'image/jpeg', 337240, '2025-08-23 14:41:59'),
(33, 17, 'before', '/uploads/1756718056102-WhatsApp_Image_2025-08-12_at_12.10.22_7b55bb50.jpg', 'WhatsApp Image 2025-08-12 at 12.10.22_7b55bb50.jpg', 'image/jpeg', 250551, '2025-09-01 09:14:16'),
(34, 17, 'after', '/uploads/1756718056109-WhatsApp_Image_2025-08-12_at_12.10.22_dee4d5ce.jpg', 'WhatsApp Image 2025-08-12 at 12.10.22_dee4d5ce.jpg', 'image/jpeg', 337240, '2025-09-01 09:14:16');

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
(13, 6, 'pembongkaran antena parabola vsat', 'ls', 1.00, 450000, 1),
(14, 8, 'Tarikan kabel jaringan', 'meter', 74.00, 12500, 1),
(15, 8, 'konektor', 'ls', 1.00, 74000, 2),
(18, 7, 'penggantian kontaktor PLN', 'ls', 1.00, 950000, 1),
(20, 11, 'penarikan kabel speaker itv', 'ls', 1.00, 300000, 1),
(21, 12, 'tarikan kabel alarm', 'titik', 2.00, 171500, 1),
(22, 12, 'tarikan kamera cctv', 'titik', 1.00, 306000, 2),
(23, 12, 'perapihan bobokan plafond', 'ls', 1.00, 50000, 3),
(24, 13, 'tarikan kabel data belden', 'meter', 20.00, 12500, 1),
(25, 13, 'tarikan kabel hdmi', 'ls', 1.00, 350000, 2),
(26, 13, 'konektor', 'set', 1.00, 75000, 3),
(27, 14, 'tarikan kabel jaringan', 'meter', 30.00, 12500, 1),
(28, 14, 'konektor', 'set', 1.00, 50000, 2),
(29, 15, 'Tarikan kabel alarm toko', 'ls', 2.00, 171500, 1),
(30, 16, 'Tarikan instalasi kamera cctv', 'titik', 2.00, 306000, 1),
(31, 16, 'perapihan bobokan plafond', 'ls', 1.00, 50000, 2),
(32, 9, 'Tarikan instalasi kamera cctv', 'titik', 2.00, 306000, 1),
(33, 9, 'perapihan bobokan plafond', 'ls', 1.00, 50000, 2),
(34, 17, 'Tarikan instalasi kamera cctv', 'titik', 1.00, 306000, 1),
(35, 17, 'Tarikan instalasi speaker itv', 'ls', 1.00, 325000, 2);

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
-- Struktur dari tabel `ttf`
--

CREATE TABLE `ttf` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `filename` varchar(255) DEFAULT NULL,
  `uploaded_at` datetime DEFAULT current_timestamp(),
  `status` enum('proses','sudah_cair') DEFAULT 'proses'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `ttf`
--

INSERT INTO `ttf` (`id`, `filename`, `uploaded_at`, `status`) VALUES
(2, '1756135400652-report_ttf_25E004972397.pdf', '2025-08-25 22:23:20', 'sudah_cair');

-- --------------------------------------------------------

--
-- Struktur dari tabel `ttf_ba`
--

CREATE TABLE `ttf_ba` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `ttf_id` bigint(20) UNSIGNED NOT NULL,
  `ba_no` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `ttf_ba`
--

INSERT INTO `ttf_ba` (`id`, `ttf_id`, `ba_no`) VALUES
(2, 2, 'BA-OPNAME/2025/03/004/011326');

-- --------------------------------------------------------

--
-- Struktur dari tabel `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(100) NOT NULL,
  `name` varchar(100) NOT NULL,
  `avatar` varchar(255) DEFAULT '/user.png',
  `reset_token` varchar(255) DEFAULT NULL,
  `token_expiry` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `name`, `avatar`, `reset_token`, `token_expiry`) VALUES
(1, 'admin', 'henryfadhlu@gmail.com', '$2b$10$FxTi1d9dP2Y8/LHYW0l1guhaT1j00nQ9u18BcwJBFbbyEDawSNE4q', 'Henry', '/uploads/avatars/1-1756697022331.png', NULL, NULL);

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
-- Indeks untuk tabel `ttf`
--
ALTER TABLE `ttf`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `ttf_ba`
--
ALTER TABLE `ttf_ba`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ttf_id` (`ttf_id`);

--
-- Indeks untuk tabel `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `ba_inbox`
--
ALTER TABLE `ba_inbox`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27724;

--
-- AUTO_INCREMENT untuk tabel `password_resets`
--
ALTER TABLE `password_resets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `pekerjaan`
--
ALTER TABLE `pekerjaan`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT untuk tabel `pekerjaan_foto`
--
ALTER TABLE `pekerjaan_foto`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- AUTO_INCREMENT untuk tabel `pekerjaan_item`
--
ALTER TABLE `pekerjaan_item`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT untuk tabel `ttf`
--
ALTER TABLE `ttf`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT untuk tabel `ttf_ba`
--
ALTER TABLE `ttf_ba`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

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

--
-- Ketidakleluasaan untuk tabel `ttf_ba`
--
ALTER TABLE `ttf_ba`
  ADD CONSTRAINT `ttf_ba_ibfk_1` FOREIGN KEY (`ttf_id`) REFERENCES `ttf` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
