// Suponha que você tenha uma variável que armazena a data atual
let currentDate = new Date();

// Função para atualizar os gráficos com base na data atual
function updateCharts() {
    // Atualize a data exibida
    document.getElementById('currentDate').innerText = currentDate.toLocaleDateString();
    
    // Aqui você chamaria a função para carregar os dados do dia atual e renderizar os gráficos
    // loadData(currentDate);
}

// Função para carregar dados do dia anterior
document.getElementById('prevDay').addEventListener('click', () => {
    currentDate.setDate(currentDate.getDate() - 1);
    updateCharts();
});

// Função para carregar dados do próximo dia
document.getElementById('nextDay').addEventListener('click', () => {
    currentDate.setDate(currentDate.getDate() + 1);
    updateCharts();
});

// Inicializa os gráficos com a data atual
updateCharts();
