import { User } from '../models/User';

type SkillPayload = {
  skills?: Array<string | { name: string }>;
  [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
};

export function extractSkillsFromPayload(payload: SkillPayload): string[] {
  if (!payload.skills || !Array.isArray(payload.skills)) {
    return [];
  }

  return payload.skills
    .map((s) => {
      if (typeof s === 'string') return s;
      if (s && typeof s === 'object' && 'name' in s && typeof s.name === 'string') {
        return s.name;
      }
      return null;
    })
    .filter((v): v is string => Boolean(v));
}

export async function saveLinkedInSkills(userId: string, payload: SkillPayload) {
  const skills = extractSkillsFromPayload(payload);

  const user = await User.findByIdAndUpdate(
    userId,
    {
      linkedinSkillsRaw: payload,
      linkedinSkills: skills
    },
    { new: true }
  );

  return { user, skills };
}


