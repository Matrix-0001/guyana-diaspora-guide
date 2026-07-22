// Single source of truth for every tool — drives the header dropdown
// and the /tools/ directory page. Keep grouped in display order.

export interface Tool {
  href: string;
  name: string;
  blurb: string;
}

export const TOOL_GROUPS: { group: string; tools: Tool[] }[] = [
  {
    group: 'Money & shipping',
    tools: [
      {
        href: '/tools/remittance-fee-calculator/',
        name: 'Remittance Fee Calculator',
        blurb:
          'Compare what your recipient actually gets across Western Union, MoneyGram, Ria, and bank wires.',
      },
      {
        href: '/convert/',
        name: 'Currency Converter',
        blurb: 'USD, CAD, and GBP to Guyanese dollars, with tables for common amounts.',
      },
      {
        href: '/tools/barrel-shipping-calculator/',
        name: 'Barrel Shipping Cost Calculator',
        blurb:
          'The all-in, door-to-door cost of shipping a barrel to Guyana — freight, pickup, and clearance.',
      },
      {
        href: '/tools/customs-duty-calculator/',
        name: 'Customs Duty Calculator',
        blurb:
          'Duty and VAT on packages by item category — and the electronics that are completely tax-free.',
      },
    ],
  },
  {
    group: 'Work & income',
    tools: [
      {
        href: '/tools/salary-calculator/',
        name: 'Salary & Tax Calculator',
        blurb:
          'Take-home pay under the 2026 PAYE and NIS rules — allowances, both tax bands, and employer cost.',
      },
      {
        href: '/tools/nis-pension-estimator/',
        name: 'NIS Pension Estimator',
        blurb:
          'Your old age pension under the official NIS formula — including if you worked in Guyana before migrating.',
      },
      {
        href: '/tools/hire-purchase-calculator/',
        name: 'Hire Purchase Calculator',
        blurb: 'The true rate hiding behind store financing — compared side by side with a bank loan.',
      },
    ],
  },
  {
    group: 'Property, home & utilities',
    tools: [
      {
        href: '/tools/mortgage-calculator/',
        name: 'Mortgage & Loan Calculator',
        blurb: 'Monthly payments, total interest, amortization milestones, and an affordability check.',
      },
      {
        href: '/tools/property-cost-calculator/',
        name: 'Property Purchase Cost Calculator',
        blurb:
          'Stamp duty, registry fees, and attorney costs for transport or title — plus seller-side capital gains.',
      },
      {
        href: '/tools/construction-cost-estimator/',
        name: 'Construction Cost Estimator',
        blurb:
          'What building really costs in boom-era Guyana — honest ranges by finish level, plus contingency.',
      },
      {
        href: '/tools/land-converter/',
        name: 'Land Measurement Converter',
        blurb:
          'Perches, roods, and acres from old transports, converted to square feet, metres, and hectares.',
      },
      {
        href: '/tools/gpl-bill-calculator/',
        name: 'GPL Electricity Bill Estimator',
        blurb:
          'Your monthly bill from kWh or appliances — lifeline vs standard rates, and what the AC really costs.',
      },
    ],
  },
  {
    group: 'Vehicles & travel',
    tools: [
      {
        href: '/tools/vehicle-import-calculator/',
        name: 'Vehicle Import Duty Calculator',
        blurb:
          'The full GRA tax bill at Budget 2026 rates — paste a listing link and see the whole cost.',
      },
      {
        href: '/tools/trip-fuel-calculator/',
        name: 'Trip Fuel Cost Calculator',
        blurb:
          'Fuel cost for any journey — Linden, Berbice, Lethem — from distance, consumption, and pump price.',
      },
      {
        href: '/tools/visa-wait-estimator/',
        name: 'Family Sponsorship Wait-Time Estimator',
        blurb: 'How long sponsoring a spouse, parent, child, or sibling from Guyana really takes.',
      },
    ],
  },
];

export const ALL_TOOLS: Tool[] = TOOL_GROUPS.flatMap((g) => g.tools);
