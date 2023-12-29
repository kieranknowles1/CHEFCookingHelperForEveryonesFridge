import * as tf from '@tensorflow/tfjs-core'

import { EMBEDDING_DIMENSIONS } from './constants'

/**
 * Get the similarity between two embeddings.
 *
 * @returns A number between 0 and 1, where 1 is the most similar.
 */
export default function getSimilarity (embedding1: Float32Array, embedding2: Float32Array): number {
  if (embedding1.length !== EMBEDDING_DIMENSIONS || embedding2.length !== EMBEDDING_DIMENSIONS) {
    throw new Error(`Expected two embeddings of length ${EMBEDDING_DIMENSIONS}, got ${embedding1.length} and ${embedding2.length}`)
  }

  // TODO: Which metric? Need a source in the paper.
  // Using cosine similarity for now.
  // https://en.wikipedia.org/wiki/Cosine_similarity
  const dotProduct = tf.dot(tf.tensor(embedding1), tf.tensor(embedding2))
  const norm1 = tf.norm(tf.tensor(embedding1))
  const norm2 = tf.norm(tf.tensor(embedding2))
  const normProduct = tf.mul(norm1, norm2)
  return tf.div(dotProduct, normProduct).dataSync()[0]
}
