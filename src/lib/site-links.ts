export const SOCIAL = {
  youtube: "https://www.youtube.com/@ForTomorrow26",
  linkedin: "https://www.linkedin.com/company/fortomorrow-today/",
} as const;

export const CONTACT = {
  email: "hello@fortomorrow.co",
  emailHref: "mailto:hello@fortomorrow.co",
  phone: "+971 4 000 0000",
  phoneHref: "tel:+97140000000",
  offices: "Dubai · Bengaluru",
} as const;

/** Props to open an external link safely in a new tab. */
export const externalLink = {
  target: "_blank" as const,
  rel: "noopener noreferrer" as const,
};
