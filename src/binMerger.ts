/**
 * Responsável por mesclar múltiplos arquivos BIN em um único arquivo
 */

/**
 * Mescla múltiplos arquivos BIN em um único arquivo
 */
export async function mergeBinFiles(binFiles: File[]): Promise<Blob> {
  if (binFiles.length === 0) {
    throw new Error("Nenhum arquivo BIN fornecido para mesclagem");
  }
  
  if (binFiles.length === 1) {
    return binFiles[0];
  }
  
  // Cria um array para armazenar os dados binários de cada arquivo
  const chunks: ArrayBuffer[] = [];
  
  // Lê cada arquivo BIN e adiciona seu conteúdo ao array
  for (const file of binFiles) {
    const buffer = await file.arrayBuffer();
    chunks.push(buffer);
  }
  
  // Calcula o tamanho total do arquivo mesclado
  const totalSize = chunks.reduce((size, chunk) => size + chunk.byteLength, 0);
  
  // Cria um novo buffer para o arquivo mesclado
  const mergedBuffer = new Uint8Array(totalSize);
  
  // Copia os dados de cada arquivo para o buffer mesclado
  let offset = 0;
  for (const chunk of chunks) {
    mergedBuffer.set(new Uint8Array(chunk), offset);
    offset += chunk.byteLength;
  }
  
  // Retorna o buffer mesclado como um Blob
  return new Blob([mergedBuffer], { type: 'application/octet-stream' });
} 