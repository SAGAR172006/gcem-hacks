import { Router } from 'express';
import { supabase, supabaseAdmin } from '../services/supabase';
import { requireAuth } from '../middleware/auth';
import { AuthUser } from '../types';

export const authRouter = Router();

const formatAuthUser = async (user: any, profileData?: any): Promise<AuthUser> => {
  let profile = profileData;
  if (!profile) {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    profile = data || {};
  }
  return {
    id: user.id,
    email: user.email!,
    name: profile.name || 'Learner',
    age: profile.age || null,
    qualification: profile.qualification || null,
    grade: profile.grade || 'High schooler',
    interest: profile.interest || 'music',
  };
};

authRouter.post('/register', async (req, res) => {
  try {
    const { email, password, name, age, qualification } = req.body;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } }
    });

    if (error) return res.status(400).json({ error: error.message });
    if (!data.user) return res.status(400).json({ error: 'Failed to create user' });
    if (!data.session) return res.status(400).json({ error: 'Account created! Please check your email to confirm before logging in. (Dev: disable email confirm in Supabase settings.)' });

    const { data: profile, error: updateError } = await supabase
      .from('profiles')
      .upsert(
        { id: data.user.id, name, age, qualification },
        { onConflict: 'id' }
      )
      .select()
      .single();

    if (updateError) {
      console.error('Error upserting profile:', updateError);
    }

    const authUser = await formatAuthUser(data.user, profile);
    res.json({ token: data.session.access_token, user: authUser });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

authRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) return res.status(401).json({ error: error.message });
    if (!data.user || !data.session) return res.status(401).json({ error: 'Failed to login' });

    const authUser = await formatAuthUser(data.user);
    res.json({ token: data.session.access_token, user: authUser });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

authRouter.get('/google/url', async (req, res) => {
  try {
    const redirectTo = req.headers.origin
      ? req.headers.origin + '/auth/callback'
      : 'http://localhost:5173/auth/callback';

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo, skipBrowserRedirect: true }
    });
    if (error) return res.status(400).json({ error: error.message });
    res.json({ url: data.url });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PKCE code exchange -- called by frontend after Google OAuth redirects to /auth/callback?code=XXX
authRouter.post('/google/callback', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'Missing code' });

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return res.status(401).json({ error: error.message });
    if (!data.user || !data.session) return res.status(401).json({ error: 'Failed to exchange code' });

    const authUser = await formatAuthUser(data.user);
    res.json({ token: data.session.access_token, user: authUser });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

authRouter.post('/google', async (req, res) => {
  try {
    const { accessToken } = req.body;

    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: accessToken
    });

    if (error) return res.status(401).json({ error: error.message });
    if (!data.user || !data.session) return res.status(401).json({ error: 'Failed to login with Google' });

    const createdAt = new Date(data.user.created_at);
    const isNewUser = Date.now() - createdAt.getTime() < 10000;

    const authUser = await formatAuthUser(data.user);
    res.json({ token: data.session.access_token, user: authUser, isNewUser });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

authRouter.post('/logout', requireAuth, async (req, res) => {
  try {
    await supabase.auth.signOut();
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

authRouter.get('/me', requireAuth, (req, res) => {
  res.json(req.user);
});

authRouter.put('/me', requireAuth, async (req, res) => {
  try {
    const { name, age, qualification, grade, interest } = req.body;

    const { data: profile, error } = await supabase
      .from('profiles')
      .upsert(
        { id: req.user!.id, name, age, qualification, grade, interest },
        { onConflict: 'id' }
      )
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });

    const authUser = await formatAuthUser(req.user!, profile);
    res.json(authUser);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

authRouter.delete('/me', requireAuth, async (req, res) => {
  try {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(req.user!.id);

    if (error) return res.status(400).json({ error: error.message });

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
