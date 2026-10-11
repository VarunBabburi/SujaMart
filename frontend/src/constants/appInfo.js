// Put this file at: src/constants/appInfo.js
// TODO: replace every placeholder below with your real business details.

export const APP_INFO = {
  name: "SujaMart",
  tagline: "Quick Grocery",
  website: "sujamart.shop",
  email: "varunbabburi@gmail.com", // TODO: your real support email
  phone: "+91 7671919822", // TODO: your real support number (shown on screen)
  phoneLink: "+917671919822", // TODO: same number, digits only with +91 (used for tap-to-call)
  whatsapp: "917671919822", // TODO: WhatsApp number, digits only with country code
  address: "Warangal, Telangana, India", // TODO: your store address
  hours: "6:00 AM – 11:00 PM, all days", // TODO: your support / delivery hours
  lastUpdated: "10 October 2026",
};

// Used by the footer, the mobile "More help" list and the Profile page
export const INFO_LINKS = [
  { path: "/about", label: "About Us", desc: "Who we are and what we stand for", iconKey: "info" },
  { path: "/contact", label: "Contact Us", desc: "Call, email or send us a message", iconKey: "mail" },
  { path: "/support", label: "Customer Support", desc: "Get help with orders and payments", iconKey: "lifebuoy" },
  { path: "/faqs", label: "FAQs", desc: "Quick answers to common questions", iconKey: "help" },
  { path: "/privacy-policy", label: "Privacy Policy", desc: "How we handle your data", iconKey: "shield" },
  { path: "/terms", label: "Terms & Conditions", desc: "Rules for using the app", iconKey: "doc" },
];