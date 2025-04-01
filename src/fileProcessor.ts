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
export async function processGameFolder(folderName: string, files: File[]): Promise<ProcessedGame | null> {
  try {
    // Filtra os arquivos BIN e CUE
    const binFiles = files.filter(file => hasExtension(file.name, 'bin'));
    const cueFile = findCueFile(files);
    
    // Se não houver arquivos BIN, retorna null
    if (binFiles.length === 0) {
      return null;
    }
    
    // Se houver apenas um arquivo BIN, não precisamos processá-lo
    if (binFiles.length === 1) {
      return null;
    }
    
    // Ordena os arquivos BIN
    const sortedBinFiles = sortBinFiles(binFiles);
    
    // Nome base para o arquivo BIN mesclado
    const baseName = getBaseName(folderName);
    const binFileName = `${baseName}.bin`;
    
    // Mescla os arquivos BIN
    const mergedBinFile = await mergeBinFiles(sortedBinFiles);
    
    // Cria o objeto de jogo processado
    const processedGame: ProcessedGame = {
      name: baseName,
      binFile: mergedBinFile,
      binFileName,
      cueFile,
      originalFolder: folderName,
      status: 'success',
      message: `${sortedBinFiles.length} arquivos BIN mesclados com sucesso.`,
      binFiles: sortedBinFiles
    };
    
    // Se não houver arquivo CUE, marca como pendente
    if (!cueFile) {
      processedGame.status = 'pending';
      processedGame.message = 'Arquivos BIN mesclados, mas nenhum arquivo CUE encontrado.';
    }
    
    return processedGame;
  } catch (error) {
    console.error(`Erro ao processar a pasta ${folderName}:`, error);
    
    // Retorna um objeto de jogo com status de erro
    return {
      name: getBaseName(folderName),
      binFile: new Blob([]),
      binFileName: '',
      cueFile: null,
      originalFolder: folderName,
      status: 'error',
      message: `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      binFiles: []
    };
  }
}

/**
 * Processa várias pastas de jogos
 */
export async function processGameFolders(files: FileList): Promise<ProcessedGame[]> {
  // Mapeia os arquivos para suas pastas
  const folderMap = new Map<string, File[]>();
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const path = file.webkitRelativePath || '';
    const pathParts = path.split('/');
    
    // Ignora arquivos na raiz
    if (pathParts.length <= 1) {
      continue;
    }
    
    // Obtém o nome da pasta do jogo (primeiro nível após a raiz)
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
    if (processedGame) {
      processedGames.push(processedGame);
    }
  }
  
  return processedGames;
} 