// Register the tfjs backend.
import '@tensorflow/tfjs'
import * as use from '@tensorflow-models/universal-sentence-encoder'
import { Mutex } from 'async-mutex'

import logger from '../logger'

const mutex = new Mutex()
let model: use.UniversalSentenceEncoder

export async function getModel (): Promise<use.UniversalSentenceEncoder> {
  if (model !== undefined) {
    return model
  }

  const release = await mutex.acquire()
  try {
    logger.info('Acquired sentence encoder load lock')
    if (model !== undefined) {
      logger.info('Sentence encoder loaded while waiting for lock')
      return model
    }

    logger.info('Loading sentence encoder')
    model = await use.load()
    logger.info('Sentence encoder loaded')
    return model
  } finally {
    release()
    logger.info('Released sentence encoder load lock')
  }
}

export function preloadModel (): void {
  void getModel()
}
