// Register the tfjs backend.
import '@tensorflow/tfjs'
import * as use from '@tensorflow-models/universal-sentence-encoder'
import { Mutex } from 'async-mutex'

import logger from '../logger'

const mutex = new Mutex()
let model: use.UniversalSentenceEncoder

/**
 * Get the model singleton. Lazy loaded.
 * See `preloadModel` to load the model in advance.
 * @throws {Error} If the model is not yet loaded and fails to load
 */
export default async function getModel (): Promise<use.UniversalSentenceEncoder> {
  if (model !== undefined) {
    return model
  }

  const release = await mutex.acquire()
  try {
    if (model !== undefined) {
      return model
    }

    logger.info('Loading sentence encoder')
    model = await use.load()
    logger.info('Sentence encoder loaded')
    return model
  } finally {
    release()
  }
}

/**
 * Preload the model so that it is ready when needed
 * @throws {Error} If the model fails to load
 */
export async function preloadModel (): Promise<void> {
  logger.info('Model preload requested')
  await getModel()
}
