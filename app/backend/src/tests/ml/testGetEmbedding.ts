import assert from 'assert'

import { describe, it } from 'mocha'

import getEmbedding from '../../ml/getEmbedding'
import { preloadModel } from '../../ml/getModel'
import getSimilarity from '../../ml/getSimilarity'

describe('ml/getEmbedding', function () {
  before(async function () {
    this.timeout(10000)
    await preloadModel()
  })

  it('should return an embedding for a string', async function () {
    const sentence = 'Hello world'
    const embedding = await getEmbedding(sentence)
    assert.strictEqual(embedding.sentence, sentence)
    assert(embedding.embedding instanceof Float32Array)
    assert(embedding.embedding.length > 0)
  })

  it('should cache embeddings', function (done) {
    async function run (): Promise<void> {
      const sentence = 'Bonjour monde'

      await getEmbedding(sentence)
      const start = Date.now()
      await getEmbedding(sentence)
      const end = Date.now()

      assert(end - start < 5, 'second call should be fast')

      done()
    }
    run().catch(done)
  })

  it('should return the same embedding for the same string', async function () {
    const sentence = 'Hello world'
    const embedding1 = await getEmbedding(sentence)
    const embedding2 = await getEmbedding(sentence)
    assert.deepStrictEqual(embedding1, embedding2)
  })

  it('should return different embeddings for different strings', async function () {
    const embedding1 = await getEmbedding('Hello world')
    const embedding2 = await getEmbedding('Bonjour monde')
    assert.notDeepStrictEqual(embedding1, embedding2)
  })

  it('should return similar embeddings for similar strings', async function () {
    const embedding1 = await getEmbedding('Hello world')
    const embedding2 = await getEmbedding('Hello world!')
    assert(getSimilarity(embedding1.embedding, embedding2.embedding) > 0.9, 'similarity should be high')
  })

  it('should return dissimilar embeddings for dissimilar strings', async function () {
    const embedding1 = await getEmbedding('Hello world')
    const embedding2 = await getEmbedding('Did you ever hear the tragedy of Darth Plagueis the Wise?')
    assert(getSimilarity(embedding1.embedding, embedding2.embedding) < 0.5, 'similarity should be low')
  })
})
