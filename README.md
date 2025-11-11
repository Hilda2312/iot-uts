# 🌱 Project UTS Internet of Things (IoT)

## 👩‍💻 Tentang Saya
**Nama:** Hilda Nurhaeni  
**NRP:** 152023008  

## 📘 Deskripsi Proyek
Repository ini berisi kode dan dokumentasi untuk **Project UTS mata kuliah Pemrograman IoT**.  
Proyek ini dibuat sebagai bagian dari penilaian Ujian Tengah Semester dengan tujuan untuk memahami konsep dasar dan implementasi sistem IoT yang terintegrasi dengan **sensor**, **backend server**, dan **user interface**.

## ⚙️SQL
```bash
  CREATE DATABASE IF NOT EXISTS `iotdb` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `iotdb`;

-- Dumping structure for table iotdb.config
CREATE TABLE IF NOT EXISTS `config` (
  `id` int NOT NULL AUTO_INCREMENT,
  `max_suhu` float DEFAULT '35',
  `min_suhu` float DEFAULT '20',
  `max_ldr` int DEFAULT '800',
  `min_ldr` int DEFAULT '200',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data exporting was unselected.

-- Dumping structure for table iotdb.data_sensor
CREATE TABLE IF NOT EXISTS `data_sensor` (
  `id` int NOT NULL AUTO_INCREMENT,
  `device_id` varchar(50) NOT NULL,
  `suhu` float DEFAULT NULL,
  `humidity` float DEFAULT NULL,
  `ldr` int DEFAULT NULL,
  `timestamp` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data exporting was unselected.

-- Dumping structure for table iotdb.mqtt_logs
CREATE TABLE IF NOT EXISTS `mqtt_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `topic` varchar(100) DEFAULT NULL,
  `payload` text,
  `timestamp` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```
