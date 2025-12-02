import axios from 'axios';
import { env } from '../config/env';
import { User, IUser } from '../models/User';

const GITHUB_OAUTH_TOKEN_URL = 'https://github.com/login/oauth/access_token';
const GITHUB_API_BASE = 'https://api.github.com';

export async function exchangeCodeForToken(code: string): Promise<string> {
  const res = await axios.post(
    GITHUB_OAUTH_TOKEN_URL,
    {
      client_id: env.githubClientId,
      client_secret: env.githubClientSecret,
      code,
      redirect_uri: env.githubCallbackUrl
    },
    {
      headers: {
        Accept: 'application/json'
      }
    }
  );

  if (!res.data.access_token) {
    throw new Error('GitHub OAuth failed: no access token returned');
  }

  return res.data.access_token;
}

export async function fetchGitHubUser(accessToken: string): Promise<any> {
  const res = await axios.get(`${GITHUB_API_BASE}/user`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  return res.data;
}

export async function upsertUserFromGitHubProfile(accessToken: string, profile: any): Promise<IUser> {
  const githubId = String(profile.id);

  const update = {
    email: profile.email,
    githubId,
    githubUsername: profile.login,
    githubAccessToken: accessToken,
    githubRaw: profile
  };

  const user = await User.findOneAndUpdate({ githubId }, update, {
    new: true,
    upsert: true,
    setDefaultsOnInsert: true
  });

  return user;
}

export async function getUserById(userId: string): Promise<IUser | null> {
  return User.findById(userId);
}

export async function fetchUserRepos(user: IUser): Promise<any[]> {
  if (!user.githubAccessToken) {
    throw new Error('GitHub access token not available for user');
  }
  const res = await axios.get(`${GITHUB_API_BASE}/user/repos`, {
    headers: { Authorization: `Bearer ${user.githubAccessToken}` },
    params: { per_page: 100 }
  });
  return res.data;
}

export async function fetchLanguageStats(user: IUser): Promise<Record<string, number>> {
  const repos = await fetchUserRepos(user);

  const languageTotals: Record<string, number> = {};

  for (const repo of repos) {
    const languagesUrl = repo.languages_url as string | undefined;
    if (!languagesUrl) continue;

    const res = await axios.get(languagesUrl, {
      headers: { Authorization: `Bearer ${user.githubAccessToken}` }
    });

    const languages = res.data as Record<string, number>;
    Object.entries(languages).forEach(([lang, bytes]) => {
      languageTotals[lang] = (languageTotals[lang] || 0) + bytes;
    });
  }

  return languageTotals;
}

export async function fetchCommitStats(user: IUser): Promise<any> {
  const repos = await fetchUserRepos(user);

  const commitStats: {
    totalCommits: number;
    reposAnalyzed: number;
    byRepo: Record<
      string,
      {
        totalCommits: number;
      }
    >;
  } = { totalCommits: 0, reposAnalyzed: 0, byRepo: {} };

  for (const repo of repos) {
    const fullName = repo.full_name as string | undefined;
    if (!fullName) continue;

    try {
      const res = await axios.get(`${GITHUB_API_BASE}/repos/${fullName}/stats/commit_activity`, {
        headers: { Authorization: `Bearer ${user.githubAccessToken}` }
      });

      const weeks: Array<{ total: number }> = res.data;
      const repoCommits = weeks.reduce((sum, w) => sum + (w.total || 0), 0);

      commitStats.totalCommits += repoCommits;
      commitStats.reposAnalyzed += 1;
      commitStats.byRepo[fullName] = { totalCommits: repoCommits };
    } catch {
      // ignore stats failures per repo to keep API robust
      // eslint-disable-next-line no-continue
      continue;
    }
  }

  return commitStats;
}


