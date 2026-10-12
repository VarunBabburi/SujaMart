// Put this file at: src/pages/TermsAndConditions.jsx
// IMPORTANT: This is a general template. Have a legal professional review it,
// and make sure the cancellation, refund, delivery and Udhaar terms match how
// your business really works before you publish.
import InfoPageLayout from "../components/InfoPageLayout";
import LegalDocument from "../components/LegalDocument";
import { APP_INFO } from "../constants/appInfo";

const sections = [
  {
    title: "Who we are",
    paragraphs: [
      `${APP_INFO.name} (${APP_INFO.website}) is owned and operated by ${APP_INFO.owner || "Varun Babburi"}, ${APP_INFO.address}. You can reach us at ${APP_INFO.email} or ${APP_INFO.phone}.`,
    ],
  },
  {
    title: "Acceptance of terms",
    paragraphs: [
      `By creating an account, placing an order or otherwise using ${APP_INFO.name}, you agree to these Terms and Conditions and to our Privacy Policy. If you do not agree, please do not use the service.`,
    ],
  },
  {
    title: "Eligibility and your account",
    bullets: [
      "You must be at least 18 years old, or use the service under the supervision of a parent or guardian.",
      "You must provide accurate details and keep your login information confidential.",
      "You are responsible for all activity under your account. Tell us immediately if you notice any unauthorised use.",
      "We may suspend or close accounts that give false information or misuse the service.",
    ],
  },
  {
    title: "Orders and pricing",
    bullets: [
      "All prices are shown in Indian Rupees (₹) and may change without notice. The price at the time you place your order applies.",
      "Product images are for illustration. Packaging, brand or weight may vary slightly.",
      "Items are subject to availability. If something is out of stock, we may remove it from your order and refund or adjust the amount.",
      "A minimum basket value (currently ₹99) applies to orders.",
      "We may refuse or cancel an order in cases of suspected fraud, pricing errors or unserviceable addresses.",
    ],
  },
  {
    title: "Delivery",
    bullets: [
      "We aim to deliver within the time shown in the app, but delivery times are estimates, not guarantees. Traffic, weather, order volume and other factors can cause delays.",
      "Please give a correct address and phone number, and be available to receive your order.",
      "If we cannot reach you or deliver to the address provided, the order may be cancelled and we may not be able to refund fresh or perishable items.",
    ],
  },
  {
    title: "Payments",
    bullets: [
      "You can pay by Cash on Delivery, online (UPI, cards, net banking) or, where enabled for your account, Udhaar (credit).",
      "Online payments are processed by Razorpay and are subject to their terms.",
      "If you choose Cash on Delivery, please keep the exact amount ready where possible.",
    ],
  },
  {
    title: "Udhaar (credit)",
    paragraphs: [
      "Udhaar lets eligible customers buy now and pay later. It is offered at our sole discretion and can be changed or withdrawn at any time.",
    ],
    bullets: [
      "All orders placed on Udhaar are recorded in your ledger, and you agree to pay the dues in full when asked.",
      "We may set a credit limit and may pause Udhaar on your account if payments are delayed.",
      "The balance shown in your ledger is the amount you owe, unless you show us a recorded payment that is missing.",
    ],
  },
  {
    title: "Cancellations, returns and refunds",
    bullets: [
      "You can ask to cancel an order by contacting support as soon as possible. Orders can usually be cancelled only before they are packed.",
      "Perishable items such as fruits, vegetables, dairy and bakery products cannot be returned, but if they are damaged, stale or not as described, report it within 24 hours and we will replace them or refund you.",
      "For missing or wrong items, please contact support within 24 hours of delivery with your order ID.",
      "Approved refunds for online payments are returned to your original payment method, usually within 5–7 working days. Refunds for Cash on Delivery orders are made by UPI, bank transfer or store credit.",
    ],
  },
  {
    title: "Acceptable use",
    paragraphs: ["When using the service, you agree not to:"],
    bullets: [
      "Provide false information or place fake or abusive orders.",
      "Misuse offers, discounts or refunds.",
      "Harass or threaten our staff or delivery partners.",
      "Try to hack, disrupt, copy or reverse engineer the app or website.",
      "Use the service for anything unlawful.",
    ],
  },
  {
    title: "Intellectual property",
    paragraphs: [
      `The ${APP_INFO.name} name, logo, design and content belong to us or our licensors. You may use the app for personal, non-commercial purposes only and may not copy or reuse our content without written permission.`,
    ],
  },
  {
    title: "Limitation of liability",
    paragraphs: [
      "We work hard to keep the service accurate and available, but it is provided on an \"as is\" basis. To the extent permitted by law, we are not liable for indirect or consequential losses, or for delays or failures caused by events beyond our reasonable control. Our total liability for any order is limited to the amount you paid for that order.",
    ],
  },
  {
    title: "Changes to these terms",
    paragraphs: [
      "We may update these terms from time to time. The updated version will apply from the date shown at the top of this page. Continuing to use the service after that means you accept the changes.",
    ],
  },
  {
    title: "Governing law",
    paragraphs: [
      "These terms are governed by the laws of India. Any dispute will be subject to the exclusive jurisdiction of the courts at Warangal, Telangana.",
    ],
  },
  {
    title: "Contact us",
    paragraphs: [
      `For any questions about these terms, write to ${APP_INFO.email} or call ${APP_INFO.phone}.`,
    ],
  },
];

function TermsAndConditions() {
  return (
    <InfoPageLayout
      iconKey="doc"
      title="Terms & conditions"
      subtitle="The simple rules that keep things fair for everyone using the app."
    >
      <LegalDocument
        sections={sections}
        intro={`Please read these terms carefully. They explain your rights and responsibilities when you use ${APP_INFO.name} to order groceries and daily essentials.`}
      />
    </InfoPageLayout>
  );
}

export default TermsAndConditions;