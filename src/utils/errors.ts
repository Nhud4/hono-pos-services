import { ErrorCustomType } from "../types/wrapper.type"

export const DataNotFound = (message?: string): ErrorCustomType => {
  const msg = message || 'Data not found'
  return { message: msg, code: 404 }
}

export const InternalServer = (message?: string): ErrorCustomType => {
  const msg = message || 'Internal server error'
  return { message: msg, code: 500 }
}

export const BadRequest = (message?: string): ErrorCustomType => {
  const msg = message || 'Bad request'
  return { message: msg, code: 400 }
}