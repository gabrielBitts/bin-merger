import { processGameFolders, ProcessedGame } from './fileProcessor';
import { saveAs } from 'file-saver';

// Elementos da interface
let folderInput: HTMLInputElement;
let processButton: HTMLButtonElement;
let resultsList: HTMLDivElement;
let progressBar: HTMLProgressElement;
let instructionsDiv: HTMLDivElement;

// Inicializa a aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
  initializeUI();
  setupEventListeners();
  showInitialInstructions();
});

// Inicializa os elementos da interface
function initializeUI() {
  folderInput = document.getElementById('folder-input') as HTMLInputElement;
  processButton = document.getElementById('process-button') as HTMLButtonElement;
  resultsList = document.getElementById('results-list') as HTMLDivElement;
  progressBar = document.getElementById('progress-bar') as HTMLProgressElement;
  instructionsDiv = document.getElementById('instructions') as HTMLDivElement;
  
  // Esconde a barra de progresso inicialmente
  progressBar.style.display = 'none';
}

// Configura os event listeners
function setupEventListeners() {
  processButton.addEventListener('click', () => {
    folderInput.click();
  });
  
  folderInput.addEventListener('change', handleFolderSelection);
}

// Mostra instruções iniciais
function showInitialInstructions() {
  instructionsDiv.innerHTML = `
    <h2>Como Usar Esta Ferramenta</h2>
    <p>Esta ferramenta analisa suas pastas de jogos do Saturn e prepara arquivos BIN/CUE otimizados.</p>
    <p><strong>Importante:</strong> Devido a restrições de segurança dos navegadores, esta ferramenta não pode modificar arquivos diretamente no seu sistema. Você precisará baixar os arquivos processados e substituí-los manualmente.</p>
    <ol>
      <li>Clique em "Selecionar Pasta" e escolha a pasta raiz que contém suas pastas de jogos do Saturn</li>
      <li>A ferramenta analisará todas as subpastas e processará os arquivos BIN/CUE</li>
      <li>Baixe os arquivos processados e substitua os originais manualmente</li>
    </ol>
  `;
}

// Manipula a seleção de pastas
async function handleFolderSelection(event: Event) {
  const input = event.target as HTMLInputElement;
  
  if (!input.files || input.files.length === 0) {
    return;
  }
  
  // Mostra a barra de progresso
  progressBar.style.display = 'block';
  progressBar.value = 0;
  resultsList.innerHTML = '';
  
  try {
    console.log(`Total de arquivos selecionados: ${input.files.length}`);
    
    // Processa as pastas de jogos
    const processedGames = await processGameFolders(input.files);
    
    console.log(`Jogos processados: ${processedGames.length}`);
    
    // Atualiza a interface com os resultados
    updateResultsUI(processedGames);
    
    // Mostra instruções
    showProcessingInstructions(processedGames);
  } catch (error) {
    console.error('Erro ao processar as pastas:', error);
    alert(`Erro ao processar as pastas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  } finally {
    // Esconde a barra de progresso
    progressBar.style.display = 'none';
  }
}

// Atualiza a interface com os resultados
function updateResultsUI(games: ProcessedGame[]) {
  if (games.length === 0) {
    resultsList.innerHTML = '<p>Nenhum jogo encontrado nas subpastas. Certifique-se de selecionar a pasta raiz que contém as pastas de jogos.</p>';
    return;
  }
  
  // Cria a tabela de resultados
  const table = document.createElement('table');
  table.className = 'results-table';
  
  // Cabeçalho da tabela
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  
  ['Jogo', 'Pasta', 'Arquivos BIN', 'Novo Nome BIN', 'Status', 'Ações'].forEach(text => {
    const th = document.createElement('th');
    th.textContent = text;
    headerRow.appendChild(th);
  });
  
  thead.appendChild(headerRow);
  table.appendChild(thead);
  
  // Corpo da tabela
  const tbody = document.createElement('tbody');
  
  games.forEach(game => {
    const row = document.createElement('tr');
    
    // Coluna: Nome do jogo
    const nameCell = document.createElement('td');
    nameCell.textContent = game.name;
    row.appendChild(nameCell);
    
    // Coluna: Pasta
    const folderCell = document.createElement('td');
    folderCell.textContent = game.originalFolder;
    row.appendChild(folderCell);
    
    // Coluna: Arquivos BIN
    const binFilesCell = document.createElement('td');
    binFilesCell.textContent = game.binFiles.length > 0 
      ? game.binFiles.map(f => f.name).join(', ') 
      : 'Nenhum';
    row.appendChild(binFilesCell);
    
    // Coluna: Novo Nome BIN
    const binNameCell = document.createElement('td');
    binNameCell.textContent = game.binFileName || 'N/A';
    row.appendChild(binNameCell);
    
    // Coluna: Status
    const statusCell = document.createElement('td');
    statusCell.className = `status-${game.status}`;
    statusCell.textContent = getStatusText(game.status);
    const statusMessage = document.createElement('div');
    statusMessage.className = 'status-message';
    statusMessage.textContent = game.message;
    statusCell.appendChild(statusMessage);
    row.appendChild(statusCell);
    
    // Coluna: Ações
    const actionsCell = document.createElement('td');
    
    if (game.status !== 'error' && game.binFile.size > 0) {
      const downloadButton = document.createElement('button');
      downloadButton.textContent = 'Baixar BIN';
      downloadButton.className = 'action-button';
      downloadButton.addEventListener('click', () => {
        saveAs(game.binFile, game.binFileName);
      });
      actionsCell.appendChild(downloadButton);
      
      if (game.cueFile) {
        const downloadCueButton = document.createElement('button');
        downloadCueButton.textContent = 'Baixar CUE';
        downloadCueButton.className = 'action-button';
        downloadCueButton.addEventListener('click', () => {
          saveAs(game.cueFile as Blob, game.cueFile?.name);
        });
        actionsCell.appendChild(downloadCueButton);
      }
    }
    
    row.appendChild(actionsCell);
    
    tbody.appendChild(row);
  });
  
  table.appendChild(tbody);
  resultsList.appendChild(table);
}

// Obtém o texto do status
function getStatusText(status: 'pending' | 'processing' | 'success' | 'error'): string {
  switch (status) {
    case 'pending': return 'Pendente';
    case 'processing': return 'Processando';
    case 'success': return 'Sucesso';
    case 'error': return 'Erro';
    default: return 'Desconhecido';
  }
}

// Mostra instruções para o usuário após o processamento
function showProcessingInstructions(games: ProcessedGame[]) {
  const successGames = games.filter(g => g.status === 'success' || g.status === 'pending');
  
  instructionsDiv.innerHTML = `
    <h2>Instruções para Aplicar as Alterações</h2>
    <p>Foram encontrados ${games.length} jogos, dos quais ${successGames.length} foram processados com sucesso.</p>
    <p><strong>Como aplicar as alterações:</strong></p>
    <ol>
      <li>Baixe os arquivos BIN processados clicando nos botões "Baixar BIN"</li>
      <li>Navegue até a pasta original de cada jogo no seu sistema</li>
      <li>Substitua os arquivos BIN originais pelo arquivo BIN processado</li>
      <li>Se necessário, renomeie o arquivo CUE para corresponder ao novo nome do arquivo BIN</li>
    </ol>
    <p><strong>Resumo das alterações:</strong></p>
    <ul>
      ${successGames.map(game => 
        `<li>
          <strong>${game.originalFolder}:</strong> 
          ${game.binFiles.length} arquivo(s) BIN → ${game.binFileName} 
          ${game.status === 'pending' ? '(Pendente: CUE não encontrado)' : ''}
        </li>`
      ).join('')}
    </ul>
  `;
} 