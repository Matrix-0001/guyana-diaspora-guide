// Contact directory for the Guyana authorities this site references. Only
// details verified from official sources are included — where a phone number
// couldn't be confirmed, we point to the official website rather than guess.
// Re-verify periodically and bump LAST_CHECKED.

export interface Authority {
  name: string;
  handles: string;
  phone?: string[];
  email?: string;
  website?: { label: string; url: string };
  appointmentUrl?: string;
  address?: string;
  note?: string;
}

export const CONTACTS_LAST_CHECKED = 'July 2026';

export const AUTHORITY_GROUPS: { group: string; authorities: Authority[] }[] = [
  {
    group: 'In Guyana',
    authorities: [
      {
        name: 'Central Immigration & Passport Office',
        handles: 'Passports (Form A), e-passport applications and appointments',
        appointmentUrl: 'https://pp.gpf.gov.gy/#/',
        website: { label: 'pp.gpf.gov.gy', url: 'https://pp.gpf.gov.gy/#/' },
        address: 'Georgetown, with regional offices in Linden, Berbice, and Essequibo',
        note: 'Book your passport appointment and start your application through the official online portal.',
      },
      {
        name: 'General Register Office (GRO)',
        handles: 'Birth, marriage, and death certificates; corrections',
        email: 'GROguyana@gmail.com',
        phone: ['WhatsApp: 610-9394'],
        website: { label: 'gro.moha.gov.gy', url: 'https://gro.moha.gov.gy/' },
      },
      {
        name: 'Guyana Revenue Authority (GRA)',
        handles: 'Taxes, TIN registration, customs and vehicle duty',
        phone: ['+592 227-6060', '+592 227-8222'],
        email: 'publicrelations@gra.gov.gy',
        website: { label: 'gra.gov.gy', url: 'https://www.gra.gov.gy/' },
        address: '200–201 Camp Street, Georgetown',
      },
      {
        name: 'Deeds & Commercial Registries Authority (DCRA)',
        handles: 'Business name and company registration; deeds and titles',
        website: { label: 'dcraguyana.org', url: 'https://dcraguyana.org/' },
        address: 'Lot 1 High and Commerce Streets, Georgetown',
      },
      {
        name: 'Guyana Legal Aid Clinic',
        handles: 'Free legal advice and representation (including divorce) for those who qualify',
        address: '185 Charlotte & King Streets, Georgetown',
      },
    ],
  },
  {
    group: 'Overseas missions',
    authorities: [
      {
        name: 'Consulate General of Guyana — New York',
        handles: 'Passports, certificates, and consular services (US)',
        phone: ['+1 (212) 947-5110 — Option 1 for Registry & Passports'],
        address: '228 East 45th Street, New York, NY 10017',
        appointmentUrl: 'https://pp.gpf.gov.gy/#/',
        website: { label: 'guyanaconsulatenewyork.org', url: 'https://guyanaconsulatenewyork.org/' },
      },
      {
        name: 'Embassy of Guyana — Washington, DC',
        handles: 'Passports and consular services (US)',
        phone: ['+1 202-265-6900'],
        address: '2490 Tracey Pl NW, Washington, DC 20008',
        appointmentUrl: 'https://guyanaembassydc.org/appointments',
        website: { label: 'guyanaembassydc.org', url: 'https://guyanaembassydc.org/' },
        note: 'Consular hours Monday–Friday, 10:00am–3:00pm.',
      },
      {
        name: 'Consulate General of Guyana — Toronto',
        handles: 'Passports and consular services (Canada)',
        email: 'info@guyanaconsulate.com',
        appointmentUrl: 'https://guyanaconsulatetoronto.com/book-an-appointment/',
        website: { label: 'guyanaconsulatetoronto.com', url: 'https://guyanaconsulatetoronto.com/' },
      },
      {
        name: 'Guyana High Commission — London',
        handles: 'Passports and consular services (UK)',
        note: 'Confirm current contact details and appointment procedure on the mission’s official channels before applying.',
      },
    ],
  },
];

export const ALL_AUTHORITIES: Authority[] = AUTHORITY_GROUPS.flatMap((g) => g.authorities);
