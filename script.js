document.addEventListener("DOMContentLoaded", function() {
    // Configuração do Supabase
    const SUPABASE_URL = 'https://lgwejttuqzmmgzejnqvm.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxnd2VqdHR1cXptbWd6ZWpucXZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjIwMjA2MzcsImV4cCI6MjAzNzU5NjYzN30.oUQV47J8RNfvDvMwXzasXxcWqqY4nFUC2fjvTBakGVE';
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    let currentDate = new Date();

    // Função para ajustar a data (subtrair 3 horas)
    function adjustTimestamp(timestamp) {
        const date = new Date(timestamp);
        date.setHours(date.getHours() - 3);
        return date;
    }

    // Função para atualizar a exibição da data
    function updateDateDisplay() {
        const dateOptions = { year: 'numeric', month: 'numeric', day: 'numeric' };
        document.getElementById('currentDate').textContent = currentDate.toLocaleDateString('pt-BR', dateOptions);
    }

    // Função para buscar os dados mais recentes
    async function fetchLatestData() {
        const { data, error } = await supabaseClient
            .from('sensor_data')
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(1);

        if (error) {
            console.error('Erro ao buscar os dados mais recentes:', error);
            return;
        }

        const latestData = data[0];
        if (latestData) {
            document.getElementById('temperature').textContent = latestData.Temperatura;
            document.getElementById('humidity-air').textContent = latestData.Umidade;
            document.getElementById('humidity-soil').textContent = latestData.UmidadeSolo;
            document.getElementById('pressure').textContent = latestData.Pressao;
        }
    }

    // Função para buscar os dados históricos de um dia específico e desenhar gráficos
    async function fetchHistoricalData(date) {
        const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
        const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);

        const { data, error } = await supabaseClient
            .from('sensor_data')
            .select('*')
            .gte('timestamp', startOfDay.toISOString())
            .lte('timestamp', endOfDay.toISOString())
            .order('timestamp', { ascending: true });

        if (error) {
            console.error('Erro ao buscar os dados históricos:', error);
            return;
        }

        const hourlyData = {};
        for (let row of data) {
            const date = adjustTimestamp(row.timestamp);
            const hour = date.getHours();
            if (!hourlyData[hour]) {
                hourlyData[hour] = { temperatures: [], humidityAir: [], humiditySoil: [], pressures: [] };
            }
            hourlyData[hour].temperatures.push(row.Temperatura);
            hourlyData[hour].humidityAir.push(row.Umidade);
            hourlyData[hour].humiditySoil.push(row.UmidadeSolo);
            hourlyData[hour].pressures.push(row.Pressao);
        }

        const hours = Array.from({ length: 24 }, (_, i) => i); // Array de 0 a 23
        const temperatures = hours.map(hour => average(hourlyData[hour]?.temperatures));
        const humidityAir = hours.map(hour => average(hourlyData[hour]?.humidityAir));
        const humiditySoil = hours.map(hour => average(hourlyData[hour]?.humiditySoil));
        const pressures = hours.map(hour => average(hourlyData[hour]?.pressures));

        // Atualizar gráficos
        updateChart(temperatureChart, hours, temperatures, 'Temperature (°C)', 'red');
        updateChart(humidityAirChart, hours, humidityAir, 'Humidity (Air) (%)', 'blue');
        updateChart(humiditySoilChart, hours, humiditySoil, 'Humidity (Soil) (%)', 'green');
        updateChart(pressureChart, hours, pressures, 'Pressure (hPa)', 'orange');
    }

    function average(array) {
        if (!array || array.length === 0) return null;
        const sum = array.reduce((a, b) => a + b, 0);
        return sum / array.length;
    }

    function updateChart(chart, labels, data, label, borderColor) {
        chart.data.labels = labels.map(hour => `${hour}:00`);
        chart.data.datasets[0].data = data;
        chart.data.datasets[0].label = label;
        chart.data.datasets[0].borderColor = borderColor;
        chart.update();
    }

    // Inicializar gráficos
    const temperatureChart = new Chart(document.getElementById('temperatureChart').getContext('2d'), {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Temperature (°C)',
                data: [],
                borderColor: 'red',
                fill: false
            }]
        }
    });

    const humidityAirChart = new Chart(document.getElementById('humidityAirChart').getContext('2d'), {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Humidity (Air) (%)',
                data: [],
                borderColor: 'blue',
                fill: false
            }]
        }
    });

    const humiditySoilChart = new Chart(document.getElementById('humiditySoilChart').getContext('2d'), {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Humidity (Soil) (%)',
                data: [],
                borderColor: 'green',
                fill: false
            }]
        }
    });

    const pressureChart = new Chart(document.getElementById('pressureChart').getContext('2d'), {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Pressure (hPa)',
                data: [],
                borderColor: 'orange',
                fill: false
            }]
        }
    });

    // Event listeners para os botões de navegação
    document.getElementById('prevDay').addEventListener('click', () => changeDay(-1));
    document.getElementById('nextDay').addEventListener('click', () => changeDay(1));

    function changeDay(direction) {
        currentDate.setDate(currentDate.getDate() + direction);
        updateDateDisplay();
        fetchHistoricalData(currentDate);
    }

    // Inicializar a página
    updateDateDisplay();
    fetchLatestData();
    fetchHistoricalData(currentDate);
});
