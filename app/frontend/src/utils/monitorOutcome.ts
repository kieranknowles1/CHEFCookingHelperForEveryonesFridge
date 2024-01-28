import { ApiError } from '../types/ApiError'
import { type LoadingStatus } from '../components/LoadingSpinner'
import { type UserState } from '../contexts/UserContext'
import { type components } from '../types/api.generated'

type ErrorList = components['schemas']['ErrorList']

type LoadingStatusSetter = (status: LoadingStatus) => void
type UserStateSetter = (userState: UserState) => void

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

/**
 * Helper function to monitor the outcome of an API call.
 * Status will be set to 'loading' when the function is called (i.e., inside the useEffect hook).
 * Status will be set to 'done' or 'error' depending on the result of the API call.
 * Errors will be thrown as an ApiError on failure (i.e., when the endpoint returns a non-200 status code).
 * Error details are available in the ApiError.errors property.
 * Data is returned on success.
 * Logout is called on 401 errors.
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
 *   handleApiError(error, setUserState)
 *  })
 * ```
 */
export default function monitorOutcome (
  setStatus: LoadingStatusSetter,
  logout: () => void
): StatusMonitor {
  setStatus('loading')

  return async (response) => {
    if (response.error !== undefined) {
      setStatus('error')

      if (response.response.status === 401) {
        logout()
      }

      throw new ApiError(response.error)
    } else {
      setStatus('done')
      return response.data
    }
  }
}
