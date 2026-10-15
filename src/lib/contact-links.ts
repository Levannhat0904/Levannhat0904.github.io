import { profile } from "@/config/profile";

export type ContactLink = { label: string; href: string; value: string };

export const githubUrl = `https://github.com/${profile.githubUsername}`;

const stripProtocol = (url: string) => url.replace(/^https?:\/\/(www\.)?/, "");

// Only contacts with a value are returned; GitHub is always present.
export function getContactLinks(): ContactLink[] {
  const { email, linkedin, facebook } = profile.contacts;
  const links: (ContactLink | false | "")[] = [
    { label: "GitHub", href: githubUrl, value: `@${profile.githubUsername}` },
    email && { label: "Email", href: `mailto:${email}`, value: email },
    linkedin && { label: "LinkedIn", href: linkedin, value: stripProtocol(linkedin) },
    facebook && { label: "Facebook", href: facebook, value: stripProtocol(facebook) },
  ];
  return links.filter((l): l is ContactLink => Boolean(l));
}
