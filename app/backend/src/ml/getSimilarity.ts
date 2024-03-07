import * as tf from '@tensorflow/tfjs-core'

/**
 * Get the cosine similarity between two embeddings.
 *
 * @returns A number between 0 and 1, where 1 is the most similar.
 */
export default function getSimilarity (embedding1: Float32Array, embedding2: Float32Array): number {
  // Use cosine similarity, as done in the original USE paper.
  const dotProduct = tf.dot(tf.tensor(embedding1), tf.tensor(embedding2))
  const norm1 = tf.norm(tf.tensor(embedding1))
  const norm2 = tf.norm(tf.tensor(embedding2))
  const normProduct = tf.mul(norm1, norm2)
  return tf.div(dotProduct, normProduct).dataSync()[0]
}
