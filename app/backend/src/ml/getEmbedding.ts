import * as tf from '@tensorflow/tfjs-core'

import getModel from './getModel'

export default async function getEmbedding (sentence: string): Promise<Float32Array> {
  const model = await getModel()

  let embeddings: tf.Tensor2D | undefined
  try {
    embeddings = await model.embed([sentence])
    const emb = tf.slice(embeddings, [0, 0], [1])
    const data = await emb.data()
    if (!(data instanceof Float32Array)) {
      throw new Error('Expected Float32Array')
    }
    return data
  } finally {
    if (embeddings !== undefined) {
      embeddings.dispose()
    }
  }
}
