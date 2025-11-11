// server.js
const express = require('express');
const mysql = require('mysql2/promise'); // Pastikan ini di-import dengan benar!
const mqtt = require('mqtt');
const cors = require('cors');

// Impor handler dan topik kontrol dari modul terpisah
const { handleMqttMessages, MQTT_TOPIC_CONTROL } = require('./services/mqttHandler'); 

const app = express();
const port = 5000;

// --- A. Koneksi MySQL ---
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '', // *** GANTI DENGAN PASSWORD ANDA ***
    database: 'iot_dashboard',
    // Perbaikan untuk error GROUP BY:
    dateStrings: true,
};
const dbPool = mysql.createPool(dbConfig);
// dbPool tidak diekspor, melainkan diteruskan sebagai argumen.

// --- B. Inisialisasi MQTT Client ---
const MQTT_BROKER = 'mqtt://broker.hivemq.com';
const MQTT_TOPIC_DATA = 'iot/data_sensor/esp32';

const mqttClient = mqtt.connect(MQTT_BROKER);
module.exports.mqttClient = mqttClient; // Diekspor untuk digunakan di Route POST

mqttClient.on('connect', () => {
    console.log('✅ MQTT Client: Terhubung ke Broker HiveMQ');
    
    // Subscribe ke topik data sensor saat terhubung
    mqttClient.subscribe(MQTT_TOPIC_DATA, (err) => {
        if (!err) {
            console.log(`📡 MQTT Client: Berlangganan topik data: ${MQTT_TOPIC_DATA}`);
        } else {
            console.error('❌ MQTT Client: Gagal berlangganan topik data:', err);
        }
    });
});

// --- C. Menghubungkan Handler Pesan (Listener) ---
// Panggil handler dengan mengirimkan mqttClient, topik, dan dbPool
handleMqttMessages(mqttClient, MQTT_TOPIC_DATA, dbPool); 
console.log('🔗 MQTT Listener siap memproses pesan.');

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Fungsi Query Database (GET Data Sensor) ---
// Fungsi ini tetap di server.js karena menggunakan Express routes
const getSensorSummary = async () => {
    // 1. Suhu Max/Min/Rata-rata
    const sqlSummary = `
        SELECT 
            ROUND(MAX(suhu), 2) AS suhumax,
            ROUND(MIN(suhu), 2) AS suhumin,
            ROUND(AVG(suhu), 2) AS suhurata
        FROM data_sensor;
    `;
    const [summaryResult] = await dbPool.query(sqlSummary);
    const summary = summaryResult[0];
    
    // 2. Nilai Max (2 Data Terbaru)
    const sqlMaxVal = `
        SELECT 
            id AS idx, 
            suhu AS suhun, 
            humidity AS humid, 
            lux AS kecerahan,
            DATE_FORMAT(timestamp, '%Y-%m-%d %H:%i:%s') AS timestamp
        FROM data_sensor
        ORDER BY timestamp DESC
        LIMIT 2;
    `;
    const [maxValResult] = await dbPool.query(sqlMaxVal);

    // 3. Max per Bulan/Tahun (Sudah dikoreksi untuk ONLY_FULL_GROUP_BY)
    const sqlMonthYearMax = `
        SELECT 
            CONCAT(MONTH(timestamp), '-', YEAR(timestamp)) AS month_year,
            MAX(suhu) AS maxSuhu
        FROM data_sensor
        GROUP BY CONCAT(MONTH(timestamp), '-', YEAR(timestamp))
        ORDER BY maxSuhu DESC
        LIMIT 2;
    `;
    const [monthYearMaxResult] = await dbPool.query(sqlMonthYearMax);

    return {
        ...summary,
        nilai_suhu_max_humid_max: maxValResult,
        month_year_max: monthYearMaxResult.map(item => ({ month_year: item.month_year }))
    };
};

// --- Route GET Data Sensor ---
app.get('/api/data_sensor', async (req, res) => {
    try {
        const result = await getSensorSummary();
        res.json(result);
    } catch (error) {
        console.error('❌ Error saat mengambil data sensor:', error);
        res.status(500).json({ error: 'Gagal mengambil data sensor dari MySQL', details: error.message });
    }
});

// --- Route POST Kontrol Relay ---
app.post('/api/control_relay', (req, res) => {
    const { status } = req.body;
    
    if (status === "ON" || status === "OFF") {
        const message = JSON.stringify({ status });
        // Menggunakan mqttClient yang didefinisikan di server.js untuk publish
        mqttClient.publish(MQTT_TOPIC_CONTROL, message, (err) => {
             if (err) {
                return res.status(500).json({ success: false, message: 'Gagal mengirim perintah ke ESP32' });
            }
            res.json({ success: true, message: `Perintah ${status} berhasil dikirim.` });
        });
    } else {
        res.status(400).json({ success: false, message: 'Status tidak valid. Gunakan "ON" atau "OFF".' });
    }
});

// --- Jalankan Server ---
dbPool.getConnection()
    .then(() => {
        console.log('✅ Koneksi ke MySQL Pool berhasil dibuat.');
        app.listen(port, () => {
            console.log(`🚀 Server Backend berjalan di http://localhost:${port}`);
        });
    })
    .catch(err => {
        console.error('❌ Gagal terhubung ke MySQL:', err);
        process.exit(1);
    });