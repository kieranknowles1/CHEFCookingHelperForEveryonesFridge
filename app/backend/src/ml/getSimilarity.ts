import * as tf from '@tensorflow/tfjs-core'

import getEmbedding from './getEmbedding'

/**
 * Get the similarity between two sentences,
 * as evaluated by the Universal Sentence Encoder.
 * // TODO: Need a sync version of this for the database.
 *
 * @returns A number between 0 and 1, where 1 is the most similar.
 */
export default async function getSimilarity (sentence1: string, sentence2: string): Promise<number> {
  let embeddings: tf.Tensor2D | undefined
  try {
    // TODO: Cache the embeddings for the sentences.
    const emb1 = await getEmbedding(sentence1)
    const emb2 = await getEmbedding(sentence2)

    // Get the similarity score. Data resolves to a 1x1 array.
    // TODO: What metric? Needs research and a source in the report.
    const score = await tf.losses.cosineDistance(emb1, emb2, 0).data()
    return 1 - score[0]
  } finally {
    if (embeddings !== undefined) {
      embeddings.dispose()
    }
  }
}
