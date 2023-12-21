// Register the tfjs backend.
import '@tensorflow/tfjs'
import * as use from '@tensorflow-models/universal-sentence-encoder'
import { Mutex } from 'async-mutex'

import logger from '../logger'

const mutex = new Mutex()
let model: use.UniversalSentenceEncoder

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

export function preloadModel (): void {
  logger.info('Model preload requested')
  void getModel()
}
