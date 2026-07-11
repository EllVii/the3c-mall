// src/pages/PrivacyPolicy.jsx
import React from "react";
import { Link } from "react-router-dom";
import "../styles/LegalPages.css";

export default function PrivacyPolicy() {
  return (
    <section className="legal-page">
      <div className="legal-container">
        <div className="legal-header">
          <Link to="/" className="legal-back-link">← Back to Home</Link>
          <h1>Privacy Policy</h1>
          <p className="legal-updated">Last updated: July 11, 2026</p>
        </div>

        <div className="legal-content">
          <section className="legal-section">
            <h2>1. Introduction</h2>
            <p>
              The 3C Mall ("we," "us," or "our") respects your privacy. This Privacy Policy explains how we collect, use, share, and protect information when you use our website, application, beta tools, or pilot testing materials.
            </p>
          </section>

          <section className="legal-section">
            <h2>2. What 3C Mall Does</h2>
            <p>
              3C Mall is a grocery comparison, meal planning, and household decision-support platform. We use information to help users organize food decisions, test grocery comparison workflows, plan meals, collect feedback, and improve the platform.
            </p>
          </section>

          <section className="legal-section">
            <h2>3. Information We May Collect</h2>
            <h3>3.1 Information You Provide</h3>
            <ul>
              <li>Name, email address, contact information, or login information.</li>
              <li>Household preferences, meal planning preferences, food preferences, grocery lists, or budget-planning inputs.</li>
              <li>Feedback, support messages, surveys, testing notes, and pilot forms.</li>
              <li>Receipts or reimbursement records if you participate in an approved pilot reimbursement program.</li>
            </ul>

            <h3>3.2 Information Collected Automatically</h3>
            <ul>
              <li>Device, browser, operating system, and basic usage information.</li>
              <li>Pages visited, features used, and interaction patterns used to improve the Service.</li>
              <li>Cookies or local storage used for login, preferences, and beta functionality.</li>
              <li>Approximate location or store-area information only when needed and allowed for planning features.</li>
            </ul>

            <h3>3.3 Third-Party Information</h3>
            <ul>
              <li>Product, recipe, map, store, price, or nutrition-related data from approved third-party services when available.</li>
              <li>Analytics, email, hosting, database, and security service information needed to operate the platform.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>4. How We Use Information</h2>
            <p>We may use information to:</p>
            <ul>
              <li>Provide and improve the Service.</li>
              <li>Create accounts and remember user preferences.</li>
              <li>Support grocery comparison and meal planning workflows.</li>
              <li>Collect beta or pilot feedback.</li>
              <li>Review receipts and reimbursement requests for approved pilot activities.</li>
              <li>Respond to support requests.</li>
              <li>Send service updates or optional communications.</li>
              <li>Improve security, troubleshoot issues, and prevent misuse.</li>
              <li>Maintain records required for legal, business, or grant documentation purposes.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>5. How We Share Information</h2>
            <h3>5.1 Service Providers</h3>
            <p>
              We may share information with service providers that help operate the platform, such as hosting providers, database providers, email services, analytics services, security tools, payment processors if used, or other vendors needed to provide the Service.
            </p>

            <h3>5.2 Retailers and Third-Party Services</h3>
            <p>
              If the Service links to or uses third-party retailer, grocery, recipe, map, nutrition, or delivery-related services, those services may process information under their own terms and privacy policies. Final checkout and fulfillment information is handled by the applicable retailer or provider.
            </p>

            <h3>5.3 Legal and Safety Reasons</h3>
            <p>
              We may disclose information if required by law, court order, government request, security investigation, or to protect rights, safety, and the integrity of the Service.
            </p>

            <h3>5.4 Business Transfers</h3>
            <p>
              If 3C Mall or related business assets are involved in a merger, acquisition, financing, reorganization, or sale, information may be transferred as part of that transaction.
            </p>

            <h3>5.5 No Sale of Personal Information</h3>
            <p>
              We do not sell personal information for third-party marketing.
            </p>
          </section>

          <section className="legal-section">
            <h2>6. Food, Wellness, and Household Preferences</h2>
            <p>
              3C Mall may collect food preferences, grocery planning information, household preferences, meal planning details, or general wellness-related preferences. This information is used for planning and decision-support features. 3C Mall does not use this information to diagnose, treat, or provide medical advice.
            </p>
          </section>

          <section className="legal-section">
            <h2>7. Pilot Testing and Reimbursement Records</h2>
            <p>
              If you participate in a pilot program, we may collect consent forms, feedback forms, receipts, reimbursement records, approval notes, and related documentation. These records may be retained for project documentation, accounting, audit, legal, or grant reporting purposes.
            </p>
          </section>

          <section className="legal-section">
            <h2>8. Children and Family Use</h2>
            <p>
              The Service is not directed to children under 13. If family testing involves minors, a parent or guardian must manage participation and provide any required consent. We do not knowingly collect personal information directly from children under 13 without appropriate parental involvement.
            </p>
          </section>

          <section className="legal-section">
            <h2>9. Cookies and Local Storage</h2>
            <p>
              We may use cookies, local storage, or similar technologies to remember preferences, support login or beta access, improve performance, and understand feature usage. You can control cookies through your browser, but disabling them may limit functionality.
            </p>
          </section>

          <section className="legal-section">
            <h2>10. Data Retention</h2>
            <p>
              We keep information for as long as reasonably necessary to provide the Service, support pilot or reimbursement records, comply with legal or grant documentation needs, resolve disputes, maintain security, or improve the platform. You may request deletion of account-related information, subject to records we are required or permitted to keep.
            </p>
          </section>

          <section className="legal-section">
            <h2>11. Security</h2>
            <p>
              We use reasonable safeguards to protect information, including access controls, secure development practices, and controlled storage where appropriate. No system can be guaranteed to be completely secure, and users should avoid submitting unnecessary sensitive information.
            </p>
          </section>

          <section className="legal-section">
            <h2>12. Your Choices</h2>
            <p>Depending on your location and applicable law, you may be able to:</p>
            <ul>
              <li>Access or update your information.</li>
              <li>Request deletion of certain information.</li>
              <li>Opt out of promotional communications.</li>
              <li>Request a copy of certain information.</li>
              <li>Ask questions about how your information is used.</li>
            </ul>
            <p>
              To make a request, contact us at privacy@the3cmall.app.
            </p>
          </section>

          <section className="legal-section">
            <h2>13. Third-Party Links</h2>
            <p>
              The Service may link to third-party websites or services. We are not responsible for third-party privacy practices. Please review their terms and privacy policies before providing information to them.
            </p>
          </section>

          <section className="legal-section">
            <h2>14. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. If we make material changes, we may provide notice through the Service or by other reasonable means. Continued use of the Service after changes are posted means you accept the updated policy.
            </p>
          </section>

          <section className="legal-section">
            <h2>15. Contact Us</h2>
            <p>
              For privacy-related questions or requests, please contact us at:
            </p>
            <p>
              <strong>Email:</strong> privacy@the3cmall.app<br />
              <strong>Support:</strong> support@the3cmall.app<br />
              <strong>Address:</strong> The 3C Mall, United States
            </p>
          </section>
        </div>
      </div>
    </section>
  );
}
