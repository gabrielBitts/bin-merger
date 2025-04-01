import { getBaseName, hasExtension, sortBinFiles, findCueFile } from './utils';
import { mergeBinFiles } from './binMerger';

/**
 * Interface para representar um jogo processado
 */
export interface ProcessedGame {
  name: string;
  binFile: Blob;
  binFileName: string;
  cueFile: File | null;
  originalFolder: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  message: string;
  binFiles: File[];
}

/**
 * Processa uma pasta de jogo contendo arquivos BIN e CUE
 */
export async function processGameFolder(folderName: string, files: File[]): Promise<ProcessedGame> {
  try {
    // Filtra os arquivos BIN e CUE
    const binFiles = files.filter(file => hasExtension(file.name, 'bin'));
    const cueFile = findCueFile(files);
    
    if (binFiles.length === 0) {
      return {
        name: folderName,
        binFile: new Blob(),
        binFileName: '',
        cueFile: null,
        originalFolder: folderName,
        status: 'error',
        message: 'Nenhum arquivo BIN encontrado na pasta',
        binFiles: []
      };
    }
    
    // Ordena os arquivos BIN
    const sortedBinFiles = sortBinFiles(binFiles);
    
    // Mescla os arquivos BIN
    const mergedBin = await mergeBinFiles(sortedBinFiles);
    
    // Determina o nome do arquivo BIN mesclado
    let binFileName: string;
    let status: 'pending' | 'processing' | 'success' | 'error' = 'success';
    let message = '';
    
    if (cueFile) {
      // Usa o nome do arquivo CUE para o arquivo BIN
      binFileName = `${getBaseName(cueFile.name)}.bin`;
      message = binFiles.length > 1 
        ? `${binFiles.length} arquivos BIN mesclados e renomeados para ${binFileName}` 
        : `Arquivo BIN renomeado para ${binFileName}`;
    } else {
      // Usa o nome da pasta
      binFileName = `${folderName}.bin`;
      status = 'pending';
      message = 'Arquivo CUE não encontrado. Usando nome da pasta.';
    }
    
    return {
      name: cueFile ? getBaseName(cueFile.name) : folderName,
      binFile: mergedBin,
      binFileName,
      cueFile,
      originalFolder: folderName,
      status,
      message,
      binFiles: sortedBinFiles
    };
  } catch (error) {
    console.error(`Erro ao processar a pasta ${folderName}:`, error);
    return {
      name: folderName,
      binFile: new Blob(),
      binFileName: '',
      cueFile: null,
      originalFolder: folderName,
      status: 'error',
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      binFiles: []
    };
  }
}

/**
 * Processa múltiplas pastas de jogos
 */
export async function processGameFolders(fileList: FileList): Promise<ProcessedGame[]> {
  // Agrupa os arquivos por pasta de jogo (diretório de primeiro nível)
  const folderMap = new Map<string, File[]>();
  
  for (let i = 0; i < fileList.length; i++) {
    const file = fileList[i];
    const pathParts = file.webkitRelativePath.split('/');
    
    // Ignora arquivos na raiz
    if (pathParts.length < 2) continue;
    
    // Obtém o nome da pasta de jogo (primeiro nível após a raiz)
    const gameFolderName = pathParts[1];
    
    // Se o arquivo estiver em uma subpasta de jogo
    if (gameFolderName) {
      const key = gameFolderName;
      
      if (!folderMap.has(key)) {
        folderMap.set(key, []);
      }
      
      folderMap.get(key)?.push(file);
    }
  }
  
  console.log(`Encontradas ${folderMap.size} pastas de jogos`);
  
  // Processa cada pasta de jogo
  const processedGames: ProcessedGame[] = [];
  
  for (const [folderName, files] of folderMap.entries()) {
    const processedGame = await processGameFolder(folderName, files);
    processedGames.push(processedGame);
  }
  
  return processedGames;
} 