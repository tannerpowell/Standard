interface NavItem {
  name: string;
  href: string;
}

interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
}

interface CompanyInfo {
  name: string;
  tagline: string;
  phone: string;
  email: string;
  address: Address;
  hours: string;
}

export const navigation: NavItem[] = [
  { name: "Home", href: "/" },
  { name: "Services", href: "/services" },
  { name: "Training", href: "/training" },
  { name: "Environmental Services", href: "/environmental-services" },
];

export const secondaryNavigation: NavItem[] = [
  { name: "Careers", href: "/careers" },
  { name: "Contact Us", href: "/contact" },
];

export const companyInfo: CompanyInfo = {
  name: "Standard Safety & Supply",
  tagline: "Your Partner in Safety Excellence",
  phone: "(432) 653-0393",
  email: "info@standardtx.com",
  address: {
    street: "2524 Trunk Street",
    city: "Odessa",
    state: "TX",
    zip: "79761",
  },
  hours: "24/7",
};

export const SITE_BASE_URL = "https://standardtx.com";
