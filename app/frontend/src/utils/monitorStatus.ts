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

// TODO: Use this everywhere we make API calls instead of the manual approach. Would make it easier to add
// a message with more details about the error.
/**
 * Helper function to monitor the status of an API call.
 * Status will be set to 'loading' when the function is called (i.e., inside the useEffect hook).
 * Status will be set to 'done' or 'error' depending on the result of the API call.
 * Errors will be re thrown so they can be handled by the caller.
 * Data is returned on success.
 *
 * Note that the endpoint must be declared as returning an ErrorList on failure
 * in the OpenAPI spec.
 *
 * Use in a promise chain/async function like this:
 * ```js
 * apiClient.get('/some/path', { params: { foo: 'bar' } })
 *  .then(monitorStatus(setStatus))
 *  .then((response) => {
 *   // Do something with response
 *  }).catch((error) => {
 *   // Do something with error
 *  })
 * ```
 */
export default function monitorStatus (setStatus: StatusSetter): StatusMonitor {
  setStatus('loading')
  const monitor: StatusMonitor = async (response) => {
    if (response.error !== undefined) {
      setStatus('error')
      throw new Error(response.error.message)
    } else {
      setStatus('done')
      return response.data
    }
  }

  return monitor
}
