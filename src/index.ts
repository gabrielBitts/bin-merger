import { processGameFolders, ProcessedGame } from './fileProcessor';
import { saveAs } from 'file-saver';

// Elementos da interface
let folderInput: HTMLInputElement;
let processButton: HTMLButtonElement;
let resultsList: HTMLDivElement;
let progressBar: HTMLProgressElement;
let instructionsDiv: HTMLDivElement;
let processedGames: ProcessedGame[] = [];

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
  // Quando o botão é clicado, limpa o input anterior e abre o seletor de arquivos
  processButton.addEventListener('click', () => {
    // Limpa o valor do input para garantir que o evento change seja acionado mesmo se o mesmo diretório for selecionado
    folderInput.value = '';
    folderInput.click();
  });
  
  // Processa os arquivos assim que forem selecionados
  folderInput.addEventListener('change', handleFolderSelection);
}

// Mostra instruções iniciais
function showInitialInstructions() {
  instructionsDiv.innerHTML = `
    <h2>Como Usar Esta Ferramenta</h2>
    <p>Esta ferramenta analisa suas pastas de jogos e prepara arquivos BIN/CUE otimizados.</p>
    <p><strong>Importante:</strong> Devido a restrições de segurança dos navegadores, esta ferramenta não pode modificar arquivos diretamente no seu sistema. Você precisará baixar os arquivos processados e substituí-los manualmente.</p>
    <ol>
      <li>Clique em "Selecionar Pasta" e escolha a pasta raiz que contém suas pastas de jogos</li>
      <li>A ferramenta analisará todas as subpastas e processará os arquivos BIN/CUE automaticamente</li>
      <li>Baixe os arquivos processados usando os botões "Baixar BIN"</li>
      <li>Substitua manualmente os arquivos originais pelos processados</li>
    </ol>
  `;
}

// Manipula a seleção de pastas e processa os arquivos
async function handleFolderSelection(event: Event) {
  const input = event.target as HTMLInputElement;
  
  if (!input.files || input.files.length === 0) {
    return;
  }
  
  // Limpa os resultados anteriores
  processedGames = [];
  resultsList.innerHTML = '';
  
  // Mostra a barra de progresso
  progressBar.style.display = 'block';
  progressBar.value = 0;
  
  // Limpa as instruções anteriores
  instructionsDiv.innerHTML = '<p>Processando arquivos...</p>';
  
  try {
    console.log(`Total de arquivos selecionados: ${input.files.length}`);
    
    // Processa as pastas de jogos
    processedGames = await processGameFolders(input.files);
    
    console.log(`Jogos processados: ${processedGames.length}`);
    
    // Atualiza a interface com os resultados
    updateResultsUI(processedGames);
    
    // Mostra instruções
    showProcessingInstructions(processedGames);
  } catch (error) {
    console.error('Erro ao processar as pastas:', error);
    alert(`Erro ao processar as pastas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    instructionsDiv.innerHTML = `<p class="error">Erro ao processar as pastas: ${error instanceof Error ? error.message : 'Erro desconhecido'}</p>`;
  } finally {
    // Esconde a barra de progresso
    progressBar.style.display = 'none';
  }
}

// Atualiza a interface com os resultados
function updateResultsUI(games: ProcessedGame[]) {
  // Limpa os resultados anteriores
  resultsList.innerHTML = '';
  
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
  
  ['Jogo', 'Pasta', 'Arquivos', 'Novo Nome', 'Status', 'Ações'].forEach(text => {
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
    if (game.binFiles.length > 0) {
      const countSpan = document.createElement('span');
      countSpan.textContent = `${game.binFiles.length} arquivo(s)`;
      binFilesCell.appendChild(countSpan);
      
      if (game.binFiles.length > 1) {
        const toggleButton = document.createElement('button');
        toggleButton.textContent = 'Mostrar detalhes';
        toggleButton.className = 'toggle-button';
        binFilesCell.appendChild(toggleButton);
        
        const detailsDiv = document.createElement('div');
        detailsDiv.className = 'bin-details';
        // Usar HTMLElement para garantir que style exista
        (detailsDiv as HTMLElement).style.display = 'none';
        
        const filesList = document.createElement('ul');
        game.binFiles.forEach(file => {
          const listItem = document.createElement('li');
          listItem.textContent = file.name;
          filesList.appendChild(listItem);
        });
        
        detailsDiv.appendChild(filesList);
        binFilesCell.appendChild(detailsDiv);
        
        toggleButton.addEventListener('click', () => {
          // Usar HTMLElement para garantir que style exista
          const details = detailsDiv as HTMLElement;
          if (details.style.display === 'none') {
            details.style.display = 'block';
            toggleButton.textContent = 'Ocultar detalhes';
          } else {
            details.style.display = 'none';
            toggleButton.textContent = 'Mostrar detalhes';
          }
        });
      }
    } else {
      binFilesCell.textContent = 'Nenhum';
    }
    row.appendChild(binFilesCell);
    
    // Coluna: Novo Nome BIN
    const binNameCell = document.createElement('td');
    if (game.binFileName) {
      binNameCell.textContent = game.binFileName;
      binNameCell.className = 'new-bin-name';
    } else {
      binNameCell.textContent = 'N/A';
    }
    row.appendChild(binNameCell);
    
    // Coluna: Status
    const statusCell = document.createElement('td');
    statusCell.className = `status-cell status-${game.status}`;
    
    const statusIcon = document.createElement('span');
    statusIcon.className = 'status-icon';
    switch (game.status) {
      case 'success':
        statusIcon.innerHTML = '✅';
        break;
      case 'error':
        statusIcon.innerHTML = '❌';
        break;
      case 'pending':
        statusIcon.innerHTML = '⚠️';
        break;
      default:
        statusIcon.innerHTML = '🔄';
    }
    statusCell.appendChild(statusIcon);
    
    const statusText = document.createElement('span');
    statusText.className = 'status-text';
    statusText.textContent = getStatusText(game.status);
    statusCell.appendChild(statusText);
    
    if (game.message) {
      const statusMessage = document.createElement('div');
      statusMessage.className = 'status-message';
      statusMessage.textContent = game.message;
      statusCell.appendChild(statusMessage);
    }
    
    row.appendChild(statusCell);
    
    // Coluna: Ações
    const actionsCell = document.createElement('td');
    actionsCell.className = 'actions-cell';
    
    if (game.status !== 'error' && game.binFile.size > 0) {
      const downloadButton = document.createElement('button');
      downloadButton.textContent = 'Baixar BIN';
      downloadButton.className = 'action-button download-bin';
      downloadButton.addEventListener('click', () => {
        saveAs(game.binFile, game.binFileName);
      });
      actionsCell.appendChild(downloadButton);
      
      if (game.cueFile) {
        const downloadCueButton = document.createElement('button');
        downloadCueButton.textContent = 'Baixar CUE';
        downloadCueButton.className = 'action-button download-cue';
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
      <li>Baixe os arquivos individualmente usando os botões "Baixar BIN"</li>
      <li>Para cada jogo:</li>
      <ul>
        <li>Navegue até a pasta original do jogo no seu sistema</li>
        <li>Exclua todos os arquivos BIN originais</li>
        <li>Coloque o novo arquivo BIN mesclado na pasta</li>
        <li>Certifique-se de que o arquivo CUE aponta para o novo arquivo BIN</li>
      </ul>
    </ol>
    <p><strong>Resumo das alterações:</strong></p>
    <ul class="changes-summary">
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