// src/App.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css'; // Import file styling yang akan kita buat di langkah 3

// URL endpoint API dari backend Node.js
const API_URL = 'http://localhost:5000/api/data_sensor';
const CONTROL_URL = 'http://localhost:5000/api/control_relay';

function App() {
  const [sensorData, setSensorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Asumsi status relay di awal, status ini akan di-update oleh user
  const [relayStatus, setRelayStatus] = useState('OFF'); 
  const [controlMessage, setControlMessage] = useState('');

  // 1. Fungsi untuk Fetch Data Sensor
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      
      // PARSING DATA: Axios secara otomatis mem-parsing JSON yang diterima dari backend.
      // Data sudah tersedia di response.data dengan struktur yang diminta.
      setSensorData(response.data); 
      setError(null);
    } catch (err) {
      console.error("Gagal mengambil data sensor:", err);
      setError("Gagal memuat data dari backend Node.js. Pastikan backend berjalan!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(); 
    // Refresh data setiap 10 detik
    const interval = setInterval(fetchData, 10000); 

    return () => clearInterval(interval); // Cleanup interval saat komponen di-unmount
  }, []);

  // 2. Fungsi untuk Kontrol Relay
  const handleRelayControl = async (status) => {
    try {
      setControlMessage(`Mengirim perintah ${status}...`);
      const response = await axios.post(CONTROL_URL, { status });
      
      // Update status di frontend setelah perintah berhasil dikirim
      setRelayStatus(status);
      setControlMessage(response.data.message);
    } catch (err) {
      console.error("Gagal mengirim perintah relay:", err);
      setControlMessage(`Gagal: ${err.response?.data?.message || 'Koneksi API error'}`);
    }
  };

  if (loading) return <div className="loading-state">Memuat data sensor...</div>;
  if (error) return <div className="error-state">Error: {error}</div>;
  if (!sensorData) return <div className="no-data">Tidak ada data sensor yang diterima.</div>;

  return (
    <div className="container">
      <h1>Dashboard Pemantauan IoT 🌡️💡</h1>
      
      <div className="summary-section">
        <h2>Ringkasan Suhu Global</h2>
        <div className="summary-grid">
          {/* Suhu Maks */}
          <div className="card">
            <h3>Suhu Maks</h3>
            <p>{sensorData.suhumax} °C</p>
          </div>
          {/* Suhu Min */}
          <div className="card">
            <h3>Suhu Min</h3>
            <p>{sensorData.suhumin} °C</p>
          </div>
          {/* Suhu Rata-rata */}
          <div className="card">
            <h3>Suhu Rata-rata</h3>
            <p>{sensorData.suhurata} °C</p>
          </div>
        </div>
      </div>

      <hr />

      <div className="max-values-section">
        <h2>Data Sensor Terbaru (Nilai Maks)</h2>
        {/* Mapping data array nilai_suhu_max_humid_max */}
        {sensorData.nilai_suhu_max_humid_max && sensorData.nilai_suhu_max_humid_max.map((item, index) => (
          <div key={index} className="data-item">
            <p><strong>ID Data (idx):</strong> {item.idx}</p>
            <p><strong>Suhu (suhun):</strong> {item.suhun} °C</p>
            <p><strong>Kelembaban (humid):</strong> {item.humid} %</p>
            <p><strong>Kecerahan (kecerahan):</strong> {item.kecerahan}</p>
            <p><strong>Timestamp:</strong> {item.timestamp}</p>
          </div>
        ))}
      </div>
      
      <hr />

      <div className="month-max-section">
        <h2>Bulan/Tahun Suhu Maksimum Global</h2>
        <ul>
          {sensorData.month_year_max && sensorData.month_year_max.map((item, index) => (
            <li key={index}>Bulan-Tahun: **{item.month_year}**</li>
          ))}
        </ul>
      </div>

      <hr />
      
      <div className="relay-control-section">
        <h2>Kontrol Pompa/Relay</h2>
        <p>Status Saat Ini: <strong className={relayStatus === 'ON' ? 'status-on' : 'status-off'}>{relayStatus}</strong></p>
        <button 
          onClick={() => handleRelayControl('ON')} 
          disabled={relayStatus === 'ON'}
          className="button-on"
        >
          NYALAKAN (ON)
        </button>
        <button 
          onClick={() => handleRelayControl('OFF')} 
          disabled={relayStatus === 'OFF'}
          className="button-off"
        >
          MATIKAN (OFF)
        </button>
        {controlMessage && <p className="control-message">{controlMessage}</p>}
      </div>
    </div>
  );
}

export default App;