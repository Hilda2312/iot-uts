// services/mqttHandler.js

const MQTT_TOPIC_CONTROL = 'iot/control/relay';

// Fungsi ini menerima client MQTT dan dbPool sebagai parameter (dari server.js)
const handleMqttMessages = (client, dataTopic, dbPool) => { 
    client.on('message', async (topic, message) => {
        if (topic === dataTopic) {
            try {
                const messageString = message.toString();
                console.log(`[RAW MESSAGE] Menerima pesan: ${messageString}`);
                
                const data = JSON.parse(messageString);
                console.log(`[PARSED DATA] Suhu: ${data.suhu}, Kelembaban: ${data.kelembaban}, Kecerahan: ${data.kecerahan}`);
                
                // Pengecekan keamanan: Pastikan ketiga field ada
                if (data.suhu === undefined || data.kelembaban === undefined || data.kecerahan === undefined) {
                    console.error("❌ ERROR PARSING: Data JSON tidak lengkap atau format kunci salah.");
                    return;
                }

                if (!dbPool || typeof dbPool.query !== 'function') {
                    console.error("❌ ERROR FATAL: dbPool tidak valid. Data tidak disimpan.");
                    return; 
                }
                
                // Simpan data ke MySQL
                const sql = 'INSERT INTO data_sensor (suhu, humidity, lux) VALUES (?, ?, ?)';
                const values = [data.suhu, data.kelembaban, data.kecerahan];
                
                await dbPool.query(sql, values); 
                console.log(`[DATA SAVED SUCCESS] Data berhasil disimpan.`);

            } catch (error) {
                // Tangani error JSON parse atau error SQL
                console.error('❌ MQTT Handler: Error saat memproses/menyimpan pesan:', error.message);
            }
        }
    });
};

module.exports = {
    handleMqttMessages,
    MQTT_TOPIC_CONTROL 
};