import { type LoadingStatus } from '../components/LoadingSpinner'
import { type components } from '../types/api.generated'

type ErrorList = components['schemas']['ErrorList']

type StatusSetter = (status: LoadingStatus) => void

type GenericFetchResponse<TData> = {
  data: TData
  error?: never
  response: Response
} | {
  data?: never
  error: ErrorList
  response: Response
}

export type StatusMonitor = <TData>(response: GenericFetchResponse<TData>) => Promise<TData>

export class ApiError extends Error {
  public readonly errors: ErrorList

  constructor (errors: ErrorList) {
    super('API call failed')
    this.name = ApiError.name
    this.errors = errors
  }
}

// TODO: Use this everywhere we make API calls instead of the manual approach. Would make it easier to add
// a message with more details about the error.
/**
 * Helper function to monitor the status of an API call.
 * Status will be set to 'loading' when the function is called (i.e., inside the useEffect hook).
 * Status will be set to 'done' or 'error' depending on the result of the API call.
 * Errors will be thrown as an ApiError on failure (i.e., when the endpoint returns a non-200 status code).
 * Error details are available in the ApiError.errors property.
 * Data is returned on success.
 *
 * Note that the endpoint must be declared as returning an ErrorList on failure
 * in the OpenAPI spec.
 *
 * The endpoint must also have at least one error response defined, otherwise TypeScript will
 * incorrectly infer that this function can return undefined.
 *
 * Use in a promise chain/async function like this:
 * ```js
 * apiClient.get('/some/path', { params: { foo: 'bar' } })
 *  .then(monitorStatus(setStatus))
 *  .then((response) => {
 *   // Do something with response
 *  }).catch((error: ApiError) => {
 *   // Do something with error
 *  })
 * ```
 */
export default function monitorStatus (setStatus: StatusSetter): StatusMonitor {
  setStatus('loading')
  return async (response) => await new Promise((resolve, reject) => {
    if (response.error !== undefined) {
      setStatus('error')
      reject(new ApiError(response.error))
    } else {
      setStatus('done')
      resolve(response.data)
    }
  })
}
