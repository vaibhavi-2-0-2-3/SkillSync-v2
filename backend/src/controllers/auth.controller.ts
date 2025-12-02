import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import { exchangeCodeForToken, fetchGitHubUser, upsertUserFromGitHubProfile } from '../services/github.service';

export async function getGitHubOAuthUrl(req: Request, res: Response, next: NextFunction) {
  try {
    const params = new URLSearchParams({
      client_id: env.githubClientId,
      redirect_uri: env.githubCallbackUrl,
      scope: 'read:user repo'
    });

    const url = `https://github.com/login/oauth/authorize?${params.toString()}`;
    res.json({ url });
  } catch (err) {
    next(err);
  }
}

export async function githubOAuthCallback(req: Request, res: Response, next: NextFunction) {
  try {
    const { code } = req.query;
    if (typeof code !== 'string') {
      return res.status(400).json({ error: 'Missing code parameter' });
    }

    const accessToken = await exchangeCodeForToken(code);
    const profile = await fetchGitHubUser(accessToken);
    const user = await upsertUserFromGitHubProfile(accessToken, profile);

    // In a real production app we would issue a JWT or session.
    // For now, we redirect back with the userId as a query parameter.
    const redirectUrl = new URL(env.githubDefaultRedirectUrl);
    redirectUrl.searchParams.set('userId', user.id);
    redirectUrl.searchParams.set('githubUsername', user.githubUsername || '');

    return res.redirect(redirectUrl.toString());
  } catch (err) {
    next(err);
  }
}


