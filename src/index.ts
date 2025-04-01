import { processGameFolders, ProcessedGame } from './fileProcessor';
import { saveAs } from 'file-saver';

// Elementos da interface
let folderInput: HTMLInputElement;
let processButton: HTMLButtonElement;
let resultsList: HTMLDivElement;
let progressBar: HTMLProgressElement;
let instructionsDiv: HTMLDivElement;
let ptButton: HTMLButtonElement;
let enButton: HTMLButtonElement;
let pageTitle: HTMLHeadingElement;
let limitationNotice: HTMLDivElement;
let selectFolderText: HTMLParagraphElement;
let languageLabel: HTMLSpanElement;
let processedGames: ProcessedGame[] = [];

// Idioma atual
let currentLanguage: 'pt' | 'en' = 'pt';

// Traduções
const translations = {
  pt: {
    title: 'Gerenciador de Arquivos BIN/CUE',
    limitationNotice: '<strong>Limitação Importante:</strong> Devido a restrições de segurança dos navegadores, esta aplicação web não pode modificar arquivos diretamente no seu sistema. Você precisará baixar os arquivos processados e substituir os originais manualmente.',
    selectFolder: 'Selecione a pasta raiz contendo as pastas de jogos :',
    selectButton: 'Selecionar Pasta',
    howToUseTitle: 'Como Usar Esta Ferramenta',
    howToUseDescription: 'Esta ferramenta analisa suas pastas de jogos  e prepara arquivos BIN/CUE otimizados.',
    importantNote: 'Importante:',
    securityLimitation: 'Devido a restrições de segurança dos navegadores, esta ferramenta não pode modificar arquivos diretamente no seu sistema. Você precisará baixar os arquivos processados e substituí-los manualmente.',
    step1: 'Clique em "Selecionar Pasta" e escolha a pasta raiz que contém suas pastas de jogos ',
    step2: 'A ferramenta analisará todas as subpastas e processará os arquivos BIN/CUE automaticamente',
    step3: 'Baixe os arquivos processados usando os botões "Baixar BIN"',
    step4: 'Substitua manualmente os arquivos originais pelos processados',
    note: 'Nota:',
    singleBinNote: 'Jogos que já possuem apenas um arquivo BIN não serão listados, pois já estão otimizados.',
    processing: 'Processando arquivos...',
    noGamesFound: 'Nenhum jogo encontrado que precise de otimização. Todos os jogos já possuem apenas um arquivo BIN ou não foram encontrados jogos válidos.',
    tableHeaders: ['Jogo', 'Pasta', 'Arquivos', 'Novo Nome', 'Status', 'Ações'],
    downloadBin: 'Baixar BIN',
    downloadCue: 'Baixar CUE',
    statusTexts: {
      pending: 'Pendente',
      processing: 'Processando',
      success: 'Sucesso',
      error: 'Erro',
      unknown: 'Desconhecido'
    },
    noOptimizationNeeded: 'Nenhum Jogo Precisa de Otimização',
    allGamesOptimized: 'Todos os jogos encontrados já possuem apenas um arquivo BIN, ou nenhum jogo válido foi encontrado.',
    checkIf: 'Se você esperava ver jogos na lista, verifique se:',
    checkRoot: 'Você selecionou a pasta raiz correta que contém as pastas de jogos',
    checkFiles: 'As pastas de jogos contêm arquivos BIN e CUE',
    checkMultipleBins: 'Existem jogos com múltiplos arquivos BIN que precisam ser mesclados',
    instructionsTitle: 'Instruções para Aplicar as Alterações',
    gamesFound: 'Foram encontrados {0} jogos que precisam de otimização, dos quais {1} foram processados com sucesso.',
    howToApply: 'Como aplicar as alterações:',
    applyStep1: 'Baixe os arquivos individualmente usando os botões "Baixar BIN"',
    applyStep2: 'Para cada jogo:',
    applyStep2a: 'Navegue até a pasta original do jogo no seu sistema',
    applyStep2b: 'Exclua todos os arquivos BIN originais',
    applyStep2c: 'Coloque o novo arquivo BIN mesclado na pasta',
    applyStep2d: 'Certifique-se de que o arquivo CUE aponta para o novo arquivo BIN',
    changesSummary: 'Resumo das alterações:',
    pendingCue: '(Pendente: CUE não encontrado)',
    errorProcessing: 'Erro ao processar as pastas:',
    none: 'Nenhum',
    na: 'N/A',
    language: 'Idioma:',
    portuguese: 'Português',
    english: 'Inglês',
    showDetails: 'Mostrar detalhes',
    hideDetails: 'Ocultar detalhes'
  },
  en: {
    title: 'BIN/CUE File Manager',
    limitationNotice: '<strong>Important Limitation:</strong> Due to browser security restrictions, this web application cannot modify files directly on your system. You will need to download the processed files and replace the originals manually.',
    selectFolder: 'Select the root folder containing game folders:',
    selectButton: 'Select Folder',
    howToUseTitle: 'How to Use This Tool',
    howToUseDescription: 'This tool analyzes your game folders and prepares optimized BIN/CUE files.',
    importantNote: 'Important:',
    securityLimitation: 'Due to browser security restrictions, this tool cannot modify files directly on your system. You will need to download the processed files and replace them manually.',
    step1: 'Click on "Select Folder" and choose the root folder that contains your game folders',
    step2: 'The tool will analyze all subfolders and process BIN/CUE files automatically',
    step3: 'Download the processed files using the "Download BIN" buttons',
    step4: 'Manually replace the original files with the processed ones',
    note: 'Note:',
    singleBinNote: 'Games that already have only one BIN file will not be listed, as they are already optimized.',
    processing: 'Processing files...',
    noGamesFound: 'No games found that need optimization. All games already have only one BIN file or no valid games were found.',
    tableHeaders: ['Game', 'Folder', 'Files', 'New Name', 'Status', 'Actions'],
    downloadBin: 'Download BIN',
    downloadCue: 'Download CUE',
    statusTexts: {
      pending: 'Pending',
      processing: 'Processing',
      success: 'Success',
      error: 'Error',
      unknown: 'Unknown'
    },
    noOptimizationNeeded: 'No Games Need Optimization',
    allGamesOptimized: 'All games found already have only one BIN file, or no valid games were found.',
    checkIf: 'If you expected to see games in the list, check if:',
    checkRoot: 'You selected the correct root folder that contains the game folders',
    checkFiles: 'The game folders contain BIN and CUE files',
    checkMultipleBins: 'There are games with multiple BIN files that need to be merged',
    instructionsTitle: 'Instructions to Apply Changes',
    gamesFound: 'Found {0} games that need optimization, of which {1} were successfully processed.',
    howToApply: 'How to apply the changes:',
    applyStep1: 'Download the files individually using the "Download BIN" buttons',
    applyStep2: 'For each game:',
    applyStep2a: 'Navigate to the original game folder on your system',
    applyStep2b: 'Delete all original BIN files',
    applyStep2c: 'Place the new merged BIN file in the folder',
    applyStep2d: 'Make sure the CUE file points to the new BIN file',
    changesSummary: 'Summary of changes:',
    pendingCue: '(Pending: No CUE file found)',
    errorProcessing: 'Error processing folders:',
    none: 'None',
    na: 'N/A',
    language: 'Language:',
    portuguese: 'Portuguese',
    english: 'English',
    showDetails: 'Show details',
    hideDetails: 'Hide details'
  }
};

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
  ptButton = document.getElementById('pt-button') as HTMLButtonElement;
  enButton = document.getElementById('en-button') as HTMLButtonElement;
  pageTitle = document.getElementById('page-title') as HTMLHeadingElement;
  limitationNotice = document.getElementById('limitation-notice') as HTMLDivElement;
  selectFolderText = document.getElementById('select-folder-text') as HTMLParagraphElement;
  languageLabel = document.getElementById('language-label') as HTMLSpanElement;
  
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
  
  // Configura os botões de idioma
  ptButton.addEventListener('click', () => {
    if (currentLanguage !== 'pt') {
      currentLanguage = 'pt';
      updateLanguage();
      ptButton.classList.add('active');
      enButton.classList.remove('active');
    }
  });
  
  enButton.addEventListener('click', () => {
    if (currentLanguage !== 'en') {
      currentLanguage = 'en';
      updateLanguage();
      enButton.classList.add('active');
      ptButton.classList.remove('active');
    }
  });
}

// Atualiza o idioma da interface
function updateLanguage() {
  const t = translations[currentLanguage];
  
  // Atualiza os elementos estáticos
  document.title = t.title;
  pageTitle.textContent = t.title;
  limitationNotice.innerHTML = t.limitationNotice;
  selectFolderText.textContent = t.selectFolder;
  processButton.textContent = t.selectButton;
  languageLabel.textContent = t.language;
  
  // Atualiza as instruções
  if (processedGames.length > 0) {
    showProcessingInstructions(processedGames);
  } else {
    showInitialInstructions();
  }
  
  // Atualiza a tabela de resultados se houver
  if (resultsList.children.length > 0) {
    updateResultsUI(processedGames);
  }
}

// Mostra instruções iniciais
function showInitialInstructions() {
  const t = translations[currentLanguage];
  
  instructionsDiv.innerHTML = `
    <h2>${t.howToUseTitle}</h2>
    <p>${t.howToUseDescription}</p>
    <p><strong>${t.importantNote}</strong> ${t.securityLimitation}</p>
    <ol>
      <li>${t.step1}</li>
      <li>${t.step2}</li>
      <li>${t.step3}</li>
      <li>${t.step4}</li>
    </ol>
    <p><strong>${t.note}</strong> ${t.singleBinNote}</p>
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
  const t = translations[currentLanguage];
  instructionsDiv.innerHTML = `<p>${t.processing}</p>`;
  
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
    const errorMessage = `${t.errorProcessing} ${error instanceof Error ? error.message : 'Erro desconhecido'}`;
    alert(errorMessage);
    instructionsDiv.innerHTML = `<p class="error">${errorMessage}</p>`;
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
    const t = translations[currentLanguage];
    resultsList.innerHTML = `<div class="no-games-message">${t.noGamesFound}</div>`;
    return;
  }
  
  const t = translations[currentLanguage];
  
  // Cria a tabela de resultados
  const table = document.createElement('table');
  table.className = 'results-table';
  
  // Cabeçalho da tabela
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  
  t.tableHeaders.forEach(headerText => {
    const th = document.createElement('th');
    th.textContent = headerText;
    headerRow.appendChild(th);
  });
  
  thead.appendChild(headerRow);
  table.appendChild(thead);
  
  // Corpo da tabela
  const tbody = document.createElement('tbody');
  
  games.forEach(game => {
    const row = document.createElement('tr');
    
    // Coluna do nome do jogo
    const nameCell = document.createElement('td');
    nameCell.textContent = game.name;
    row.appendChild(nameCell);
    
    // Coluna da pasta original
    const folderCell = document.createElement('td');
    folderCell.textContent = game.originalFolder;
    row.appendChild(folderCell);
    
    // Coluna dos arquivos BIN
    const filesCell = document.createElement('td');
    
    if (game.binFiles.length > 0) {
      const fileCount = document.createElement('span');
      fileCount.textContent = `${game.binFiles.length} ${currentLanguage === 'pt' ? 'arquivo(s)' : 'file(s)'}`;
      filesCell.appendChild(fileCount);
      
      if (game.binFiles.length > 0) {
        const toggleButton = document.createElement('button');
        toggleButton.textContent = t.showDetails;
        toggleButton.className = 'toggle-button';
        filesCell.appendChild(toggleButton);
        
        const detailsDiv = document.createElement('div');
        detailsDiv.className = 'file-details';
        detailsDiv.style.display = 'none';
        
        const filesList = document.createElement('ul');
        game.binFiles.forEach(file => {
          const listItem = document.createElement('li');
          listItem.textContent = file.name;
          filesList.appendChild(listItem);
        });
        
        detailsDiv.appendChild(filesList);
        filesCell.appendChild(detailsDiv);
        
        toggleButton.addEventListener('click', () => {
          const details = detailsDiv as HTMLElement;
          if (details.style.display === 'none') {
            details.style.display = 'block';
            toggleButton.textContent = t.hideDetails;
          } else {
            details.style.display = 'none';
            toggleButton.textContent = t.showDetails;
          }
        });
      }
    } else {
      filesCell.textContent = t.none;
    }
    
    row.appendChild(filesCell);
    
    // Coluna do novo nome do arquivo BIN
    const newNameCell = document.createElement('td');
    newNameCell.textContent = game.binFileName || t.na;
    row.appendChild(newNameCell);
    
    // Coluna do status
    const statusCell = document.createElement('td');
    statusCell.textContent = getStatusText(game.status);
    statusCell.className = `status-${game.status}`;
    row.appendChild(statusCell);
    
    // Coluna das ações
    const actionsCell = document.createElement('td');
    actionsCell.className = 'actions-cell';
    
    if (game.status !== 'error' && game.binFile.size > 0) {
      const downloadButton = document.createElement('button');
      downloadButton.textContent = t.downloadBin;
      downloadButton.className = 'action-button download-bin';
      downloadButton.addEventListener('click', () => {
        saveAs(game.binFile, game.binFileName);
      });
      actionsCell.appendChild(downloadButton);
      
      if (game.cueFile) {
        const downloadCueButton = document.createElement('button');
        downloadCueButton.textContent = t.downloadCue;
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
  const t = translations[currentLanguage].statusTexts;
  
  switch (status) {
    case 'pending': return t.pending;
    case 'processing': return t.processing;
    case 'success': return t.success;
    case 'error': return t.error;
    default: return t.unknown;
  }
}

// Mostra instruções para o usuário após o processamento
function showProcessingInstructions(games: ProcessedGame[]) {
  const t = translations[currentLanguage];
  const successGames = games.filter(g => g.status === 'success' || g.status === 'pending');
  
  if (games.length === 0) {
    instructionsDiv.innerHTML = `
      <h2>${t.noOptimizationNeeded}</h2>
      <p>${t.allGamesOptimized}</p>
      <p>${t.checkIf}</p>
      <ul>
        <li>${t.checkRoot}</li>
        <li>${t.checkFiles}</li>
        <li>${t.checkMultipleBins}</li>
      </ul>
    `;
    return;
  }
  
  instructionsDiv.innerHTML = `
    <h2>${t.instructionsTitle}</h2>
    <p>${t.gamesFound.replace('{0}', games.length.toString()).replace('{1}', successGames.length.toString())}</p>
    <p><strong>${t.howToApply}</strong></p>
    <ol>
      <li>${t.applyStep1}</li>
      <li>${t.applyStep2}</li>
      <ul>
        <li>${t.applyStep2a}</li>
        <li>${t.applyStep2b}</li>
        <li>${t.applyStep2c}</li>
        <li>${t.applyStep2d}</li>
      </ul>
    </ol>
    <p><strong>${t.changesSummary}</strong></p>
    <ul class="changes-summary">
      ${successGames.map(game => 
        `<li>
          <strong>${game.originalFolder}:</strong> 
          ${game.binFiles.length} ${currentLanguage === 'pt' ? 'arquivo(s) BIN' : 'BIN file(s)'} → ${game.binFileName} 
          ${game.status === 'pending' ? t.pendingCue : ''}
        </li>`
      ).join('')}
    </ul>
  `;
} 