import * as tf from '@tensorflow/tfjs-core'

import logger from '../logger'

import getModel from './getModel'

/**
 * Get the similarity between two sentences,
 * as evaluated by the Universal Sentence Encoder.
 *
 * @returns A number between 0 and 1, where 1 is the most similar.
 */
export default async function getSimilarity (sentence1: string, sentence2: string): Promise<number> {
  const model = await getModel()

  let embeddings: tf.Tensor2D | undefined
  try {
    const start = Date.now()
    // TODO: Cache the embeddings for the sentences.
    embeddings = await model.embed([sentence1, sentence2])
    const emb1 = tf.slice(embeddings, [0, 0], [1])
    const emb2 = tf.slice(embeddings, [1, 0], [1])

    // Get the similarity score. Data resolves to a 1x1 array.
    // TODO: What metric? Needs research and a source in the report.
    const score = await tf.matMul(emb1, emb2, false, true).data()
    const end = Date.now()
    logger.info(`Similarity calculation took ${end - start}ms`)
    return score[0]
  } finally {
    if (embeddings !== undefined) {
      embeddings.dispose()
    }
  }
}
