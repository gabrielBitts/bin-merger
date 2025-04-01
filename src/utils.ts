/**
 * Funções utilitárias para o processamento de arquivos
 */

/**
 * Extrai o nome base de um arquivo sem a extensão
 */
export function getBaseName(filename: string): string {
  return filename.replace(/\.[^/.]+$/, "");
}

/**
 * Verifica se um arquivo tem a extensão especificada
 */
export function hasExtension(filename: string, ext: string): boolean {
  return filename.toLowerCase().endsWith(`.${ext.toLowerCase()}`);
}

/**
 * Ordena arquivos BIN numericamente (track01.bin, track02.bin, etc.)
 */
export function sortBinFiles(files: File[]): File[] {
  return [...files].sort((a, b) => {
    // Extrai números do nome do arquivo, se existirem
    const numA = a.name.match(/(\d+)/);
    const numB = b.name.match(/(\d+)/);
    
    if (numA && numB) {
      return parseInt(numA[0]) - parseInt(numB[0]);
    }
    
    return a.name.localeCompare(b.name);
  });
}

/**
 * Encontra o arquivo CUE em uma lista de arquivos
 */
export function findCueFile(files: File[]): File | null {
  return files.find(file => hasExtension(file.name, 'cue')) || null;
} 