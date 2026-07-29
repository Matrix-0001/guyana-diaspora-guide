// Registry of downloadable Guyana government forms hosted on-site as a
// convenience. These are COPIES — the official source is linked on each so
// readers can confirm the current version. Re-download and bump LAST_CHECKED
// periodically (forms change; a stale form gets an application rejected).

export interface DocForm {
  file: string; // on-site path under /public
  name: string;
  blurb: string;
  officialUrl: string; // official source page (always current)
  source: string; // issuing authority
}

export const LAST_CHECKED = 'July 2026';

export const FORM_GROUPS: { group: string; forms: DocForm[] }[] = [
  {
    group: 'Passport',
    forms: [
      {
        file: '/forms/passport-application-form-a.pdf',
        name: 'Passport Application — Form A',
        blurb:
          'The official application for a new or replacement Guyana e-passport, used by first-time and renewing applicants alike. Fill in black ink and block capitals.',
        officialUrl: 'https://www.minfor.gov.gy/forms/passport-application-form',
        source: 'Ministry of Foreign Affairs',
      },
    ],
  },
  {
    group: 'Birth, marriage & death certificates (GRO)',
    forms: [
      {
        file: '/forms/birth-certificate-application.pdf',
        name: 'Birth Certificate Application',
        blurb: 'Request a birth certificate copy from the General Register Office.',
        officialUrl: 'https://gro.moha.gov.gy/forms/',
        source: 'General Register Office',
      },
      {
        file: '/forms/marriage-certificate-application.pdf',
        name: 'Marriage Certificate Application',
        blurb: 'Request a marriage certificate copy after the wedding.',
        officialUrl: 'https://gro.moha.gov.gy/forms/',
        source: 'General Register Office',
      },
      {
        file: '/forms/death-certificate-application.pdf',
        name: 'Death Certificate Application',
        blurb: 'Request a death certificate copy from the General Register Office.',
        officialUrl: 'https://gro.moha.gov.gy/forms/',
        source: 'General Register Office',
      },
      {
        file: '/forms/non-impediment-marriage-form.pdf',
        name: 'Certificate of Non-Impediment',
        blurb: "Proof you're free to marry — needed to get married in Guyana in many cases.",
        officialUrl: 'https://gro.moha.gov.gy/forms/',
        source: 'General Register Office',
      },
      {
        file: '/forms/minor-correction-form.pdf',
        name: 'Minor Correction Form',
        blurb: 'Fix a small error — a misspelled name or wrong date — on an existing record.',
        officialUrl: 'https://gro.moha.gov.gy/forms/',
        source: 'General Register Office',
      },
      {
        file: '/forms/overseas-registration-form.pdf',
        name: 'Overseas Registration Form',
        blurb: 'Register a Guyanese birth or event that happened outside Guyana.',
        officialUrl: 'https://gro.moha.gov.gy/forms/',
        source: 'General Register Office',
      },
    ],
  },
];

export const ALL_FORMS: DocForm[] = FORM_GROUPS.flatMap((g) => g.forms);
