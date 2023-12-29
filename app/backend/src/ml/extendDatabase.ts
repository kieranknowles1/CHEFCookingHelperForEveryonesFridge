import { type Database } from 'better-sqlite3'

import { bufferToFloat32Array } from '../database/bufferFloat32Array'
import logger from '../logger'

import getSimilarity from './getSimilarity'

/**
 * Adds functions for use in database queries related to sentence encoding.
 */
export default function extendDatabase (db: Database): void {
  logger.info('Extending database with ML functions')
  /**
   * ml_similarity (embedding, embedding) -> float
   * Get the similarity between two embeddings.
   * Embeddings are stored as blobs in the `embedding` table or passed as parameters.
   * Embeddings must be precomputed using `getEmbedding`.
   * Columns intended to store embedded strings should reference the `embedding` table on the `sentence` column.
   */
  db.function('ml_similarity', {
    deterministic: true,
    varargs: false
  }, similarityImpl)
}

function similarityImpl (embedding1: unknown, embedding2: unknown): number {
  if (!(embedding1 instanceof Buffer) || !(embedding2 instanceof Buffer)) {
    throw new Error('ml_similarity: expected two blobs')
  }
  if (embedding1.length !== embedding2.length) {
    throw new Error('ml_similarity: expected two blobs of the same length')
  }

  // Decode back to float arrays
  const arr1 = bufferToFloat32Array(embedding1)
  const arr2 = bufferToFloat32Array(embedding2)

  // Compute similarity
  return getSimilarity(arr1, arr2)
}
