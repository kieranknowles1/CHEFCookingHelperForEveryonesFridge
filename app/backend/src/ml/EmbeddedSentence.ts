/**
 * A sentence that has been embedded by the ML model.
 * Includes the original sentence and the embedding.
 */
export default interface EmbeddedSentence {
  sentence: string
  embedding: Float32Array
}
