export type TermsSection = {
  id: string;
  title: string;
  paragraphs: string[];
};

export const TERMS_LAST_UPDATED = "16 September 2026";

export const TERMS_INTRO =
  "These Terms and Conditions (“Terms”) govern your access to and use of FounderVoice (also referred to as PitchOS), including our mobile applications, websites, and related services (collectively, the “Service”). By creating an account, signing in, or using the Service, you agree to these Terms.";

export const TERMS_SECTIONS: TermsSection[] = [
  {
    id: "about",
    title: "1. What FounderVoice is",
    paragraphs: [
      "FounderVoice is fundraising-readiness software. It helps founders capture ideas from voice, chat, and documents; structure them into a Claim Graph; stress-test claims; and generate investor-facing outputs such as decks, models, FAQs, and related materials.",
      "The Service is a productivity and diligence-support tool. It does not provide legal, financial, investment, tax, or fundraising advice, and it is not a broker-dealer, placement agent, or investment adviser.",
    ],
  },
  {
    id: "eligibility",
    title: "2. Eligibility and accounts",
    paragraphs: [
      "You must be at least 18 years old (or the age of majority where you live) to use the Service. If you use the Service on behalf of a company or fund, you represent that you have authority to bind that organization.",
      "You may register as a Founder or an Investor. You are responsible for accurate profile information (including founder/investor name, startup or company name, and email) and for keeping your login credentials confidential. You are responsible for activity under your account.",
      "We may refuse, suspend, or terminate accounts that appear abusive, fraudulent, or in violation of these Terms.",
    ],
  },
  {
    id: "roles",
    title: "3. Founder and Investor roles",
    paragraphs: [
      "Founder accounts are intended for startup teams preparing fundraising materials. Investor accounts are intended for individuals or firms reviewing or tracking founder materials shared through the Service.",
      "Access permissions depend on how content is created and shared. Do not upload or share materials you are not authorized to disclose. Confidentiality between parties is your responsibility unless we expressly provide a separate contractual confidentiality commitment.",
    ],
  },
  {
    id: "ai",
    title: "4. AI-assisted features and accuracy",
    paragraphs: [
      "The Service uses artificial intelligence and automated processing to transcribe audio, extract claims, suggest structure, generate drafts, and surface diligence questions. AI outputs can be incomplete, outdated, biased, or incorrect.",
      "You must review, verify, and take responsibility for all claims, numbers, narratives, and exports before sharing them with investors, partners, or the public. FounderVoice does not guarantee that generated decks, models, FAQs, or other outputs are accurate, complete, non-contradictory, or suitable for any fundraising process.",
      "“Strict mode,” watermarks, claim confirmation, and similar controls are assistive safeguards only. They do not make outputs legally or financially verified.",
    ],
  },
  {
    id: "content",
    title: "5. Your content",
    paragraphs: [
      "You retain ownership of content you submit, including voice memos, documents, chat inputs, project data, and edits (“Your Content”).",
      "You grant FounderVoice a worldwide, non-exclusive, royalty-free license to host, process, transmit, display, and create derivative works from Your Content solely as needed to operate, secure, improve, and provide the Service to you (including transcription, claim extraction, generation, and export).",
      "You represent that you have all rights needed to submit Your Content and that it does not infringe others’ rights or violate law. Do not upload unlawful, deceptive, or harmful material, or secrets you are not allowed to process in third-party systems.",
    ],
  },
  {
    id: "acceptable-use",
    title: "6. Acceptable use",
    paragraphs: [
      "You agree not to: (a) misuse the Service to create fraudulent fundraising materials or mislead investors; (b) attempt unauthorized access to accounts, systems, or data; (c) reverse engineer, scrape, or overload the Service except as allowed by law; (d) interfere with security or integrity of the Service; (e) use the Service to violate securities, privacy, export, or other applicable laws; or (f) resell or sublicense the Service without our written consent.",
    ],
  },
  {
    id: "third-parties",
    title: "7. Third-party services",
    paragraphs: [
      "Authentication may be provided through third parties such as email providers, Google, GitHub, or our auth infrastructure (for example Supabase). Voice, language, and AI features may use third-party model and infrastructure providers.",
      "Those providers have their own terms and privacy practices. We are not responsible for third-party services outside our reasonable control, but we select and configure them to operate FounderVoice.",
    ],
  },
  {
    id: "privacy",
    title: "8. Privacy",
    paragraphs: [
      "We process account data (such as name, email, role, organization name), authentication data, usage data, and Your Content to provide the Service. Details of collection, retention, and choices are described in our Privacy Policy section below, which forms part of these Terms by reference.",
      "After you sign in or create an account, you may choose “Stay signed in.” If enabled, we store session credentials on your device so you remain authenticated between launches. You can sign out at any time.",
    ],
  },
  {
    id: "privacy-policy",
    title: "Privacy Policy",
    paragraphs: [
      "What we collect. Account profile fields; authentication identifiers; project and claim data; voice/uploads you provide; device and app diagnostics needed for reliability and security; and communications you send us.",
      "How we use data. To create and secure your account; provide transcription, structuring, generation, and export features; personalize role-based experiences; prevent abuse; improve product quality; and comply with law.",
      "Sharing. We share data with processors that help us run the Service (hosting, auth, AI inference, analytics as configured), and when required by law or to protect rights and safety. We do not sell your personal information.",
      "Retention. We keep data while your account is active and as needed for legitimate business, security, and legal purposes. You may request deletion of your account subject to legal retention requirements.",
      "Your choices. You may update profile information, revoke device sessions by signing out, and contact us to request access or deletion where applicable law provides those rights.",
      "Security. We use industry-standard safeguards, but no method of transmission or storage is perfectly secure. Protect your password and device.",
      "International transfers. Your data may be processed in countries other than your own. Where required, we use appropriate transfer mechanisms.",
      "Children. The Service is not directed to children under 18, and we do not knowingly collect their personal information.",
    ],
  },
  {
    id: "ip",
    title: "9. Our intellectual property",
    paragraphs: [
      "FounderVoice, PitchOS, our logos, software, designs, documentation, and non-user content are owned by us or our licensors. Except for the limited right to use the Service under these Terms, no rights are granted to you.",
    ],
  },
  {
    id: "disclaimer",
    title: "10. Disclaimers",
    paragraphs: [
      "THE SERVICE IS PROVIDED “AS IS” AND “AS AVAILABLE.” TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.",
      "We do not warrant that the Service will be uninterrupted, error-free, or that AI outputs or investor-ready packs will achieve fundraising outcomes, pass diligence, or be free of contradictions or omissions.",
    ],
  },
  {
    id: "liability",
    title: "11. Limitation of liability",
    paragraphs: [
      "TO THE MAXIMUM EXTENT PERMITTED BY LAW, FOUNDERVOICE AND ITS AFFILIATES, OFFICERS, AND SUPPLIERS WILL NOT BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, OR FOR LOST PROFITS, LOST DATA, OR FAILED FUNDRAISING OUTCOMES, EVEN IF ADVISED OF THE POSSIBILITY.",
      "OUR TOTAL LIABILITY FOR CLAIMS ARISING OUT OF OR RELATED TO THE SERVICE WILL NOT EXCEED THE GREATER OF (A) AMOUNTS YOU PAID US FOR THE SERVICE IN THE THREE MONTHS BEFORE THE CLAIM OR (B) USD $50.",
    ],
  },
  {
    id: "indemnity",
    title: "12. Indemnity",
    paragraphs: [
      "You will defend and indemnify FounderVoice against claims, damages, and expenses arising from Your Content, your use of the Service, your fundraising communications, or your violation of these Terms or applicable law.",
    ],
  },
  {
    id: "termination",
    title: "13. Suspension and termination",
    paragraphs: [
      "You may stop using the Service and request account closure. We may suspend or terminate access if you breach these Terms, if required by law, or if we discontinue the Service. Provisions that by nature should survive (including ownership, disclaimers, limits of liability, and indemnity) will survive termination.",
    ],
  },
  {
    id: "changes",
    title: "14. Changes",
    paragraphs: [
      "We may update the Service and these Terms. Material changes will be indicated by updating the “Last updated” date and, where appropriate, by in-app notice. Continued use after changes become effective constitutes acceptance of the updated Terms.",
    ],
  },
  {
    id: "law",
    title: "15. Governing law",
    paragraphs: [
      "These Terms are governed by the laws applicable in the jurisdiction where the FounderVoice operating entity is established, without regard to conflict-of-law rules, unless mandatory consumer protections in your country provide otherwise. Courts in that jurisdiction will have exclusive venue, subject to those mandatory protections.",
    ],
  },
  {
    id: "contact",
    title: "16. Contact",
    paragraphs: [
      "Questions about these Terms or privacy: legal@foundervoice.app (or the support email published in the app).",
      "By checking “I agree” during sign-up, or by continuing after a terms prompt following Google or GitHub sign-in, you acknowledge that you have read and agree to these Terms and the Privacy Policy section above.",
    ],
  },
];
