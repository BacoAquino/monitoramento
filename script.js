document.addEventListener("DOMContentLoaded", function() {
    // Configuração do Supabase
    const SUPABASE_URL = 'https://lgwejttuqzmmgzejnqvm.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxnd2VqdHR1cXptbWd6ZWpucXZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjIwMjA2MzcsImV4cCI6MjAzNzU5NjYzN30.oUQV47J8RNfvDvMwXzasXxcWqqY4nFUC2fjvTBakGVE';
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

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

    // Função para buscar os dados históricos do dia atual e desenhar gráficos
    async function fetchHistoricalData() {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0); // Começo do dia
        const endOfDay = now; // Hora atual

        // Ajustar o horário do início e fim do dia para o fuso horário do banco de dados
        const startOfDayUTC = new Date(startOfDay.getTime() + startOfDay.getTimezoneOffset() * 60000);
        const endOfDayUTC = new Date(endOfDay.getTime() + endOfDay.getTimezoneOffset() * 60000);

        // Ajustar o horário do início e fim do dia em UTC
        startOfDayUTC.setHours(startOfDayUTC.getHours() - 3);
        endOfDayUTC.setHours(endOfDayUTC.getHours() - 3);

        const { data, error } = await supabaseClient
            .from('sensor_data')
            .select('*')
            .gte('timestamp', startOfDayUTC.toISOString())
            .lte('timestamp', endOfDayUTC.toISOString())
            .order('timestamp', { ascending: true });

        if (error) {
            console.error('Erro ao buscar os dados históricos:', error);
            return;
        }

        // Ajustar os timestamps para exibição no gráfico
        const timestamps = data.map(row => {
            const date = new Date(row.timestamp);
            date.setHours(date.getHours() - 3); // Ajuste do fuso horário para exibição
            return date.toLocaleTimeString();
        });

        const temperatures = data.map(row => row.Temperatura);
        const humidityAir = data.map(row => row.Umidade);
        const humiditySoil = data.map(row => row.UmidadeSolo);
        const pressures = data.map(row => row.Pressao);

        // Desenhar gráficos usando Chart.js
        new Chart(document.getElementById('temperatureChart').getContext('2d'), {
            type: 'line',
            data: {
                labels: timestamps,
                datasets: [{
                    label: 'Temperatura (°C)',
                    data: temperatures,
                    borderColor: 'red',
                    fill: false
                }]
            }
        });

        new Chart(document.getElementById('humidityAirChart').getContext('2d'), {
            type: 'line',
            data: {
                labels: timestamps,
                datasets: [{
                    label: 'Umidade do Ar (%)',
                    data: humidityAir,
                    borderColor: 'blue',
                    fill: false
                }]
            }
        });

        new Chart(document.getElementById('humiditySoilChart').getContext('2d'), {
            type: 'line',
            data: {
                labels: timestamps,
                datasets: [{
                    label: 'Umidade do Solo (%)',
                    data: humiditySoil,
                    borderColor: 'green',
                    fill: false
                }]
            }
        });

        new Chart(document.getElementById('pressureChart').getContext('2d'), {
            type: 'line',
            data: {
                labels: timestamps,
                datasets: [{
                    label: 'Pressão (hPa)',
                    data: pressures,
                    borderColor: 'orange',
                    fill: false
                }]
            }
        });
    }

    // Inicializar a página
    fetchLatestData();
    fetchHistoricalData();
});
