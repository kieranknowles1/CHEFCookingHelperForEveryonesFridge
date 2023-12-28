import * as tf from '@tensorflow/tfjs-core'

import type IEmbeddedSentence from './IEmbeddedSentence'
import getModel from './getModel'

const embeddingCache = new Map<string, IEmbeddedSentence>()

export default async function getEmbedding (sentence: string): Promise<IEmbeddedSentence> {
  const cached = embeddingCache.get(sentence)
  if (cached !== undefined) {
    return cached
  }

  const model = await getModel()

  let embeddings: tf.Tensor2D | undefined
  try {
    embeddings = await model.embed([sentence])
    const emb = tf.slice(embeddings, [0, 0], [1])
    const data = await emb.data()
    if (!(data instanceof Float32Array)) {
      throw new Error('Expected Float32Array')
    }
    const embedded = {
      sentence,
      embedding: data
    }
    embeddingCache.set(sentence, embedded)
    return embedded
  } finally {
    if (embeddings !== undefined) {
      embeddings.dispose()
    }
  }
}
