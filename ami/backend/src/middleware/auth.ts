import { Request, Response, NextFunction } from 'express'
import { supabase } from '../services/supabase'
import { AuthUser } from '../types'

// Extend Express Request to carry the authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'No token provided' })

  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data.user) return res.status(401).json({ error: 'Invalid or expired token' })

  // Fetch profile from public.profiles
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single()

  req.user = {
    id: data.user.id,
    email: data.user.email!,
    name: profile?.name || 'Learner',
    age: profile?.age || null,
    qualification: profile?.qualification || null,
    grade: profile?.grade || 'High schooler',
    interest: profile?.interest || 'music',
  }

  next()
}
