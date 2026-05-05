import { Request, Response, NextFunction } from 'express'

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('[Error]', err)

  // Gemini quota error
  if (err.status === 429 || String(err).includes('429')) {
    return res.status(429).json({
      error: 'AI service is temporarily at capacity. Please try again in a moment.'
    })
  }

  // Supabase auth error
  if (err.message?.includes('JWT') || err.message?.includes('invalid token')) {
    return res.status(401).json({ error: 'Authentication failed. Please log in again.' })
  }

  // Validation error (missing fields)
  if (err.status === 400) {
    return res.status(400).json({ error: err.message || 'Invalid request.' })
  }

  // Default
  res.status(err.status || 500).json({
    error: err.message || 'Something went wrong on our end. Please try again.'
  })
}
