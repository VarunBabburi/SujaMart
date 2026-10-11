// Put this file at: src/pages/PrivacyPolicy.jsx
// IMPORTANT: This is a general template written around what the app does today.
// Have a legal professional review it before you publish, and update it if you
// add features such as analytics, push notifications or location access.
// Google Play also requires this page to be reachable at a public URL.
import InfoPageLayout from "../components/InfoPageLayout";
import LegalDocument from "../components/LegalDocument";
import { APP_INFO } from "../constants/appInfo";

const sections = [
  {
    title: "Who we are",
    paragraphs: [
      `${APP_INFO.name} ("we", "us", "our") is a quick-grocery delivery service operating at ${APP_INFO.website} and through our mobile app. This policy explains what personal information we collect, how we use it and the choices you have.`,
    ],
  },
  {
    title: "Information we collect",
    paragraphs: ["We collect only what we need to run the service:"],
    bullets: [
      "Account details: your name, phone number and email address.",
      "Delivery details: the addresses you save, including landmark and alternate phone number.",
      "Order information: items you buy, order value, order status and invoices.",
      "Payment information: payment method chosen and transaction references. Online payments are handled by Razorpay, and we do not see or store your card, UPI or net banking details.",
      "Credit (Udhaar) records: dues and payments recorded in your ledger, if you use that option.",
      "Messages you send us through Contact Us or Customer Support.",
      "Basic technical data such as device type and error logs, used to keep the app working.",
    ],
  },
  {
    title: "How we use your information",
    bullets: [
      "To create and manage your account and log you in.",
      "To process, pack, deliver and track your orders.",
      "To take payments, issue invoices and handle refunds.",
      "To send order updates and important service messages.",
      "To answer your questions and resolve complaints.",
      "To prevent fraud, misuse and security issues.",
      "To improve our products, prices and service.",
      "To meet legal, tax and accounting obligations.",
    ],
  },
  {
    title: "Who we share it with",
    paragraphs: ["We do not sell your personal information. We share it only when needed:"],
    bullets: [
      "Delivery partners, who receive your name, phone number and delivery address so they can reach you.",
      "Payment providers such as Razorpay, to process online payments securely.",
      "Service providers who help us host, secure and run the app.",
      "Authorities, when required by law or to protect our rights and the safety of others.",
    ],
  },
  {
    title: "Data storage and retention",
    paragraphs: [
      "We keep your information for as long as your account is active and as long as needed to provide the service, resolve disputes and meet legal obligations such as tax and invoice records. When it is no longer needed, we delete or anonymise it.",
    ],
  },
  {
    title: "Security",
    paragraphs: [
      "We use reasonable technical and organisational measures to protect your data, including secure connections and restricted access. No system is completely secure, so please keep your login details private and contact us right away if you suspect misuse of your account.",
    ],
  },
  {
    title: "Your choices and rights",
    paragraphs: ["Subject to applicable law, you can:"],
    bullets: [
      "View and update your name and address from the Profile page.",
      "Ask us for a copy of the personal information we hold about you.",
      "Ask us to correct inaccurate information.",
      "Ask us to delete your account and data. Some records, such as invoices, may need to be kept for legal reasons.",
      "Withdraw your consent to optional processing at any time.",
    ],
  },
  {
    title: "Cookies and local storage",
    paragraphs: [
      "To keep you logged in and remember basic details such as your name, the app stores a small amount of data in your browser's local storage on your device. This data stays on your device and is removed when you log out or clear your browser data.",
    ],
  },
  {
    title: "Children",
    paragraphs: [
      `${APP_INFO.name} is intended for people aged 18 and over. We do not knowingly collect personal information from children. If you believe a child has given us their information, please contact us and we will delete it.`,
    ],
  },
  {
    title: "Changes to this policy",
    paragraphs: [
      "We may update this policy from time to time. When we make important changes we will update the date at the top of this page and, where appropriate, notify you in the app.",
    ],
  },
  {
    title: "Contact us",
    paragraphs: [
      `If you have questions about this policy or want to exercise your rights, write to us at ${APP_INFO.email} or call ${APP_INFO.phone}. Our address is ${APP_INFO.address}.`,
    ],
  },
];

function PrivacyPolicy() {
  return (
    <InfoPageLayout
      iconKey="shield"
      title="Privacy policy"
      subtitle="Your trust matters. Here is how we collect, use and protect your information."
    >
      <LegalDocument
        sections={sections}
        intro={`This Privacy Policy describes how ${APP_INFO.name} handles your personal information in line with applicable Indian law, including the Information Technology Act, 2000 and the Digital Personal Data Protection Act, 2023. By using our app or website you agree to the practices described here.`}
      />
    </InfoPageLayout>
  );
}

export default PrivacyPolicy;