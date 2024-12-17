// Simulate data fetching from Excel
let sensorData = {
    temperature: [32, 34, 33, 35, 36],
    humidity: [45, 50, 47, 55, 60],
    gas: [100, 120, 110, 130, 125],
    alerts: [{ workerId: "Helmet_001", time: "10:30 AM", gps: "28.7041, 77.1025" }]
  };
  
  // Average calculation
  function calculateAverage(values) {
    return (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2);
  }
  
  // Populate Cards
  document.getElementById("avg-temp").innerText = calculateAverage(sensorData.temperature) + " °C";
  document.getElementById("avg-humidity").innerText = calculateAverage(sensorData.humidity) + " %";
  document.getElementById("avg-gas").innerText = calculateAverage(sensorData.gas);
  
  // Alerts Table
  let alertTable = document.getElementById("alert-table");
  sensorData.alerts.forEach(alert => {
    let row = `<tr>
                 <td>${alert.workerId}</td>
                 <td>${alert.time}</td>
                 <td>${alert.gps}</td>
               </tr>`;
    alertTable.innerHTML += row;
  });
  
  // Initialize Map
  let map = L.map('map').setView([28.7041, 77.1025], 15);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
  sensorData.alerts.forEach(alert => {
    let [lat, lon] = alert.gps.split(", ");
    L.marker([lat, lon]).addTo(map).bindPopup(`Worker Alert: ${alert.workerId}`).openPopup();
  });
  
  // Gas Chart
  new Chart(document.getElementById('gasChart'), {
    type: 'line',
    data: {
      labels: ["Jan", "Feb", "Mar", "Apr", "May"],
      datasets: [{ label: "Gas Levels", data: sensorData.gas, borderColor: "red" }]
    }
  });
  
  // Temperature & Humidity Chart
  new Chart(document.getElementById('tempHumidityChart'), {
    type: 'bar',
    data: {
      labels: ["Jan", "Feb", "Mar", "Apr", "May"],
      datasets: [
        { label: "Temperature", data: sensorData.temperature, backgroundColor: "green" },
        { label: "Humidity", data: sensorData.humidity, backgroundColor: "blue" }
      ]
    }
  });  