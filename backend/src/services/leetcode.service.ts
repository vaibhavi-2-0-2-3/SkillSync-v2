import axios from "axios";
import { env } from "../config/env";
import { User } from "../models/User";

export async function fetchLeetCodeStats(username: string): Promise<any> {
  const url = `${env.leetcodeApiBaseUrl}/${encodeURIComponent(username)}`;
  const res = await axios.get(url);
  return res.data;
}

export async function syncLeetCodeForUser(
  userId: string,
  username: string
): Promise<any> {
  const stats = await fetchLeetCodeStats(username);

  const user = await User.findByIdAndUpdate(
    userId,
    {
      leetcodeUsername: username,
      leetcodeRaw: stats,
    },
    { new: true }
  );

  return { user, stats };
}
