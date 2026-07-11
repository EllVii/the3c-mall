// src/pages/TermsOfService.jsx
import React from "react";
import { Link } from "react-router-dom";
import "../styles/LegalPages.css";

export default function TermsOfService() {
  return (
    <section className="legal-page">
      <div className="legal-container">
        <div className="legal-header">
          <Link to="/" className="legal-back-link">← Back to Home</Link>
          <h1>Terms of Service</h1>
          <p className="legal-updated">Last updated: July 11, 2026</p>
        </div>

        <div className="legal-content">
          <section className="legal-section">
            <h2>1. Agreement to Terms</h2>
            <p>
              By accessing or using the 3C Mall website or application (the "Service"), you agree to these Terms. If you do not agree, please do not use the Service.
            </p>
          </section>

          <section className="legal-section">
            <h2>2. What 3C Mall Is</h2>
            <p>
              3C Mall is a grocery comparison, meal planning, and household decision-support software platform. The Service is designed to help users organize food decisions, compare estimated grocery options, plan meals, and review household grocery choices.
            </p>
          </section>

          <section className="legal-section">
            <h2>3. What 3C Mall Is Not</h2>
            <p>
              3C Mall is not a grocery retailer, delivery company, payment processor, medical provider, dietitian replacement, financial advisor, or emergency service. The Service does not guarantee grocery prices, savings, product availability, delivery availability, nutrition outcomes, medical results, or financial results.
            </p>
          </section>

          <section className="legal-section">
            <h2>4. Estimates and Retailer Confirmation</h2>
            <p>
              Any grocery totals, product information, comparison results, store options, routing suggestions, or delivery-related information shown in the Service are for planning and comparison only. Final prices, fees, taxes, product availability, pickup windows, delivery options, and checkout terms are confirmed directly by the applicable retailer or third-party provider.
            </p>
          </section>

          <section className="legal-section">
            <h2>5. User Responsibility</h2>
            <p>
              You are responsible for reviewing information before relying on it and for making your own grocery, meal planning, nutrition, health, financial, and purchasing decisions. You should contact the applicable retailer, provider, or qualified professional when you need official, medical, nutritional, financial, or legal guidance.
            </p>
          </section>

          <section className="legal-section">
            <h2>6. Accounts and Access</h2>
            <p>
              If you create an account, you are responsible for maintaining the confidentiality of your account information and for all activity that occurs under your account. You agree to provide accurate information and to use the Service only for lawful purposes.
            </p>
          </section>

          <section className="legal-section">
            <h2>7. Pilot and Beta Features</h2>
            <p>
              Some features may be offered as beta or pilot tools. Beta features may change, be limited, contain errors, or be discontinued. Pilot testing may include surveys, feedback forms, grocery planning exercises, receipt-based reimbursement records, or other approved testing activities.
            </p>
          </section>

          <section className="legal-section">
            <h2>8. Family Testing and Reimbursement</h2>
            <p>
              If you participate in a pilot reimbursement program, reimbursement is limited to approved project-related expenses, must be supported by itemized receipts, and is subject to review before payment. Reimbursement is not wages, payroll, prize money, or a guarantee of payment for unrelated expenses.
            </p>
          </section>

          <section className="legal-section">
            <h2>9. Health and Nutrition Information</h2>
            <p>
              Meal planning, food preference, nutrition, protein, fasting, fitness, or wellness-related information in the Service is general information only. It is not medical advice, diagnosis, treatment, or a substitute for a physician, registered dietitian, or other qualified professional.
            </p>
          </section>

          <section className="legal-section">
            <h2>10. Third-Party Services and APIs</h2>
            <p>
              The Service may use or link to third-party retailers, APIs, data sources, maps, recipe services, analytics tools, payment providers, or other services. Third-party services are controlled by their own terms, privacy policies, availability, pricing, and data rules. 3C Mall does not claim partnership, sponsorship, or endorsement by any third-party provider unless expressly stated in writing.
            </p>
          </section>

          <section className="legal-section">
            <h2>11. No Scraping or Misuse</h2>
            <p>
              You may not use the Service to scrape data, bypass access controls, exceed usage limits, misuse third-party APIs, reverse engineer the Service, interfere with security, or create unauthorized permanent copies of third-party data.
            </p>
          </section>

          <section className="legal-section">
            <h2>12. Content You Provide</h2>
            <p>
              You are responsible for information, feedback, receipts, messages, files, or other content you submit through the Service. You grant 3C Mall permission to use submitted content as reasonably necessary to operate the Service, provide support, process pilot feedback, document reimbursement records, improve the platform, and meet legal or grant documentation requirements.
            </p>
          </section>

          <section className="legal-section">
            <h2>13. Privacy and Data Protection</h2>
            <p>
              3C Mall will handle personal information according to its Privacy Policy. We use reasonable administrative, technical, and organizational safeguards, but no internet-connected service or storage system can be guaranteed to be completely secure.
            </p>
          </section>

          <section className="legal-section">
            <h2>14. Children and Minors</h2>
            <p>
              The Service is not directed to children under 13. Family pilot activities involving minors must be handled by a parent or guardian and may require consent forms or additional privacy safeguards.
            </p>
          </section>

          <section className="legal-section">
            <h2>15. Prohibited Uses</h2>
            <p>You may not use the Service to:</p>
            <ul>
              <li>Violate any law, regulation, third-party term, or intellectual property right.</li>
              <li>Misrepresent affiliation with a retailer, API provider, professional, or organization.</li>
              <li>Submit false receipts, reimbursement claims, or pilot records.</li>
              <li>Use the Service for fraud, harassment, spam, abuse, or harmful activity.</li>
              <li>Introduce malware, viruses, or destructive code.</li>
              <li>Attempt to access accounts, data, systems, or features without authorization.</li>
              <li>Rely on the Service for emergency, medical, financial, or legal decisions.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>16. Disclaimer of Warranties</h2>
            <p>
              The Service is provided on an "as is" and "as available" basis. 3C Mall disclaims warranties to the maximum extent permitted by law, including warranties of accuracy, availability, fitness for a particular purpose, non-infringement, or uninterrupted operation.
            </p>
          </section>

          <section className="legal-section">
            <h2>17. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, 3C Mall will not be liable for indirect, incidental, special, consequential, punitive, or exemplary damages arising from use of the Service. Nothing in these Terms limits liability where the law does not allow it.
            </p>
          </section>

          <section className="legal-section">
            <h2>18. Changes to the Service or Terms</h2>
            <p>
              3C Mall may update the Service or these Terms from time to time. Continued use of the Service after changes are posted means you accept the updated Terms.
            </p>
          </section>

          <section className="legal-section">
            <h2>19. Contact Information</h2>
            <p>
              If you have questions about these Terms, please contact us at:
            </p>
            <p>
              <strong>Email:</strong> support@the3cmall.app<br />
              <strong>Address:</strong> The 3C Mall, United States
            </p>
          </section>
        </div>
      </div>
    </section>
  );
}
