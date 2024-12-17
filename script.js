// Global Data Storage
let sensorData = {
  temperature: [],
  humidity: [],
  gas: [],
  alerts: []
};

// Handle File Upload and Parse Excel Data
document.getElementById("upload").addEventListener("change", function (e) {
  const file = e.target.files[0];
  const reader = new FileReader();

  reader.onload = function (e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });

    const firstSheet = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheet];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    processExcelData(jsonData);
  };

  reader.readAsArrayBuffer(file);
});

// Process Excel Data
function processExcelData(data) {
  const headers = data[0];
  const rows = data.slice(1);

  const tempIndex = headers.indexOf("Temp");
  const humidityIndex = headers.indexOf("Humidity");
  const gasIndex = headers.indexOf("Gas");
  const flameIndex = headers.indexOf("Flame");
  const latIndex = headers.indexOf("Lat");
  const lonIndex = headers.indexOf("Lon");
  const timeIndex = headers.indexOf("Time");

  sensorData = { temperature: [], humidity: [], gas: [], alerts: [] };

  rows.forEach((row, index) => {
    const temp = parseFloat(row[tempIndex]);
    const humidity = parseFloat(row[humidityIndex]);
    const gas = parseFloat(row[gasIndex]);
    const flame = parseInt(row[flameIndex]);
    const lat = parseFloat(row[latIndex]);
    const lon = parseFloat(row[lonIndex]);
    const time = formatTime(row[timeIndex]);

    if (!isNaN(temp) && !isNaN(humidity) && !isNaN(gas)) {
      sensorData.temperature.push(temp);
      sensorData.humidity.push(humidity);
      sensorData.gas.push(gas);

      if (flame === 1) {
        sensorData.alerts.push({
          workerId: `Worker ${String(index + 1).padStart(2, "0")}`,
          time: time,
          gps: `${lat}, ${lon}`
        });
      }
    }
  });

  updateDashboard();
}

// Format Time Function (HH:MM:SS)
function formatTime(time) {
  if (time) {
    const date = new Date(time);
    if (!isNaN(date.getTime())) {
      return date.toLocaleTimeString("en-US", { hour12: false });
    }
  }
  return "Invalid Time";
}

// Calculate Average
function calculateAverage(values) {
  return (values.reduce((a, b) => a + b, 0) / values.length || 0).toFixed(2);
}

// Update Dashboard UI
function updateDashboard() {
  // Calculate and display averages
  document.getElementById("avg-temp").innerText = calculateAverage(sensorData.temperature) + " °C";
  document.getElementById("avg-humidity").innerText = calculateAverage(sensorData.humidity) + " %";
  document.getElementById("avg-gas").innerText = calculateAverage(sensorData.gas);

  // Display Total Alerts
  document.getElementById("total-alerts").innerText = sensorData.alerts.length;

  // Populate Alerts Table
  let alertTable = document.getElementById("alert-table");
  alertTable.innerHTML = "";
  sensorData.alerts.forEach(alert => {
    let row = `<tr>
                 <td>${alert.workerId}</td>
                 <td>${alert.time}</td>
                 <td>${alert.gps}</td>
               </tr>`;
    alertTable.innerHTML += row;
  });

  updateMap();
  updateCharts();
}

// Initialize Map
let map = L.map('map').setView([28.7041, 77.1025], 15);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

function updateMap() {
  map.eachLayer(layer => {
    if (layer instanceof L.Marker) {
      map.removeLayer(layer);
    }
  });

  sensorData.alerts.forEach(alert => {
    const [lat, lon] = alert.gps.split(", ").map(Number);
    if (!isNaN(lat) && !isNaN(lon)) {
      L.marker([lat, lon])
        .addTo(map)
        .bindPopup(`Alert: ${alert.workerId} at ${alert.time}`)
        .openPopup();
    }
  });
}

function updateCharts() {
  const gasChartCanvas = document.getElementById("gasChart");
  const tempHumidityChartCanvas = document.getElementById("tempHumidityChart");

  gasChartCanvas.innerHTML = "";
  tempHumidityChartCanvas.innerHTML = "";

  new Chart(gasChartCanvas.getContext("2d"), {
    type: "line",
    data: {
      labels: sensorData.gas.map((_, i) => `Entry ${i + 1}`),
      datasets: [{
        label: "Gas Levels",
        data: sensorData.gas,
        borderColor: "red",
        backgroundColor: "rgba(255,0,0,0.2)",
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });

  new Chart(tempHumidityChartCanvas.getContext("2d"), {
    type: "bar",
    data: {
      labels: sensorData.temperature.map((_, i) => `Entry ${i + 1}`),
      datasets: [
        {
          label: "Temperature",
          data: sensorData.temperature,
          backgroundColor: "green"
        },
        {
          label: "Humidity",
          data: sensorData.humidity,
          backgroundColor: "blue"
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}
