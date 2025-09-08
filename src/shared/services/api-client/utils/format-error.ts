import type { HttpServiceError } from '../../http'

import { ApiDataError } from '../error'
import { BAD_REQUEST_ERROR_INFO, INTERNAL_ERROR_INFO, NOT_FOUND_ERROR_INFO, UNAUTHORIZED_HTTP_INFO } from '../../http'

type ApiErrorInfo = {
  statusCode: number
  errorMessage?: string
  errors?: Array<{
    message: string
    additionalInfo: {
      errorCustomField?: string
    }
  }>
}

// If there's no response, then it's a Network Error (403...)
export function getMainApiErrorRes(error: HttpServiceError<ApiErrorInfo, ApiErrorInfo>): ApiErrorInfo {
  if (error?.response?.status === UNAUTHORIZED_HTTP_INFO.code) {
    return {
      statusCode: UNAUTHORIZED_HTTP_INFO.code,
      errors: [
        {
          message: UNAUTHORIZED_HTTP_INFO.message,
          additionalInfo: {},
        },
      ],
    }
  }

  return (
    error.response?.data || {
      statusCode: INTERNAL_ERROR_INFO.httpCode,
      errors: [
        {
          message: INTERNAL_ERROR_INFO.message,
          additionalInfo: {},
        },
      ],
    }
  )
}

export function formatApiError(mainApiError: HttpServiceError<ApiErrorInfo, ApiErrorInfo>): ApiDataError {
  const errorResponse: ApiErrorInfo = getMainApiErrorRes(mainApiError)

  const { statusCode } = errorResponse

  if (errorResponse.errors && errorResponse.errors.length) {
    return new ApiDataError({
      errors: errorResponse.errors,
    })
  }

  switch (statusCode) {
    case BAD_REQUEST_ERROR_INFO.code:
      return new ApiDataError({
        errors: [
          {
            message: BAD_REQUEST_ERROR_INFO.message,
            additionalInfo: {},
          },
        ],
      })

    case NOT_FOUND_ERROR_INFO.code:
      return new ApiDataError({
        errors: [
          {
            message: NOT_FOUND_ERROR_INFO.message,
            additionalInfo: {},
          },
        ],
      })

    default:
      return new ApiDataError({
        errors: [
          {
            message: INTERNAL_ERROR_INFO.message,
            additionalInfo: {},
          },
        ],
      })
  }
}
