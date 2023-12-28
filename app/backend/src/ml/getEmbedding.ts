import * as tf from '@tensorflow/tfjs-core'

import type IEmbeddedSentence from './IEmbeddedSentence'
import getModel from './getModel'

export default async function getEmbedding (sentence: string): Promise<IEmbeddedSentence> {
  const model = await getModel()

  let embeddings: tf.Tensor2D | undefined
  try {
    embeddings = await model.embed([sentence])
    const emb = tf.slice(embeddings, [0, 0], [1])
    const data = await emb.data()
    if (!(data instanceof Float32Array)) {
      throw new Error('Expected Float32Array')
    }
    return {
      sentence,
      embedding: data
    }
  } finally {
    if (embeddings !== undefined) {
      embeddings.dispose()
    }
  }
}
