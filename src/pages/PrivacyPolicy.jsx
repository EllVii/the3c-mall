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
          <p className="legal-updated">Last updated: January 17, 2026</p>
        </div>

        <div className="legal-content">
          <section className="legal-section">
            <h2>1. Introduction</h2>
            <p>
              The 3C Mall ("we," "us," "our," or "Company") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our application.
            </p>
          </section>

          <section className="legal-section">
            <h2>2. Information We Collect</h2>
            
            <h3>2.1 Information You Provide Directly</h3>
            <ul>
              <li><strong>Account Registration:</strong> Name, email address, password, and profile information</li>
              <li><strong>Meal Planning Data:</strong> Dietary preferences, recipes, ingredients, and meal history</li>
              <li><strong>Grocery Information:</strong> Shopping lists, purchased items, and pricing data</li>
              <li><strong>Health Data:</strong> Protein intake, fitness goals, and nutritional preferences</li>
              <li><strong>Communication:</strong> Messages, feedback, and support requests</li>
            </ul>

            <h3>2.2 Automatically Collected Information</h3>
            <ul>
              <li><strong>Device Information:</strong> IP address, browser type, operating system, and device identifiers</li>
              <li><strong>Usage Data:</strong> Pages visited, features used, time spent, and interaction patterns</li>
              <li><strong>Cookies:</strong> Session tracking and user preferences</li>
              <li><strong>Location Data:</strong> Approximate location (if permitted) for store proximity</li>
            </ul>

            <h3>2.3 Third-Party Data</h3>
            <ul>
              <li>Kroger Products API data (product information, pricing, images)</li>
              <li>Analytics providers and advertising platforms</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>3. How We Use Your Information</h2>
            <p>We use the information we collect for:</p>
            <ul>
              <li>Providing and maintaining the Service</li>
              <li>Creating and managing your account</li>
              <li>Personalizing your experience and content</li>
              <li>Processing transactions and sending related information</li>
              <li>Sending promotional communications (with your consent)</li>
              <li>Analyzing usage patterns to improve the Service</li>
              <li>Complying with legal obligations</li>
              <li>Debugging and troubleshooting technical issues</li>
              <li>Preventing fraud and securing the Service</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>4. How We Share Your Information</h2>
            
            <h3>4.1 Service Providers</h3>
            <p>
              We share information with third parties who perform services on our behalf, including:
            </p>
            <ul>
              <li>Kroger Products API (for product and pricing data)</li>
              <li>Email service providers (Resend, SendGrid)</li>
              <li>Supabase (database and authentication)</li>
              <li>Analytics platforms</li>
            </ul>

            <h3>4.2 Legal Requirements</h3>
            <p>
              We may disclose information if required by law, court order, or government request.
            </p>

            <h3>4.3 Business Transfers</h3>
            <p>
              If 3C Mall is involved in a merger, acquisition, or bankruptcy, your information may be transferred as part of that transaction.
            </p>

            <h3>4.4 What We Do NOT Share</h3>
            <p>
              We do NOT sell your personal information to third parties for marketing purposes.
            </p>
          </section>

          <section className="legal-section">
            <h2>5. Data Retention</h2>
            <p>
              We retain your information for as long as necessary to provide the Service and fulfill the purposes outlined in this Privacy Policy. You can request deletion of your account and associated data at any time.
            </p>
          </section>

          <section className="legal-section">
            <h2>6. Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section className="legal-section">
            <h2>7. Your Rights</h2>
            <p>Depending on your location, you may have the right to:</p>
            <ul>
              <li>Access the personal information we hold about you</li>
              <li>Request correction or deletion of inaccurate data</li>
              <li>Opt out of promotional communications</li>
              <li>Request export of your data</li>
              <li>Withdraw consent for data processing</li>
            </ul>
            <p>
              To exercise these rights, please contact us at support@the3cmall.app
            </p>
          </section>

          <section className="legal-section">
            <h2>8. Cookies and Tracking</h2>
            <p>
              We use cookies to enhance your experience. You can control cookie settings through your browser. Disabling cookies may limit functionality.
            </p>
            <ul>
              <li><strong>Essential Cookies:</strong> Required for authentication and security</li>
              <li><strong>Preference Cookies:</strong> Remember your settings</li>
              <li><strong>Analytics Cookies:</strong> Help us understand usage patterns</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>9. Children's Privacy</h2>
            <p>
              The Service is not intended for children under 13. We do not knowingly collect information from children under 13. If we become aware that we have collected such information, we will promptly delete it.
            </p>
          </section>

          <section className="legal-section">
            <h2>10. Third-Party Links</h2>
            <p>
              The Service may contain links to third-party websites. We are not responsible for the privacy practices of these external sites. Please review their privacy policies before providing any information.
            </p>
          </section>

          <section className="legal-section">
            <h2>11. Health Data</h2>
            <p>
              Any health-related information you provide (dietary preferences, fitness goals, nutritional intake) is treated as sensitive personal data and protected accordingly. We do not use this data for health diagnosis or medical advice.
            </p>
          </section>

          <section className="legal-section">
            <h2>12. California Privacy Rights (CCPA)</h2>
            <p>
              If you are a California resident, you have rights under the California Consumer Privacy Act (CCPA), including:
            </p>
            <ul>
              <li>Right to know what data is collected</li>
              <li>Right to access your data</li>
              <li>Right to delete your data</li>
              <li>Right to opt-out of data sales</li>
              <li>Right to non-discrimination for exercising CCPA rights</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>13. EU Residents (GDPR)</h2>
            <p>
              If you are in the EU, your data is protected under GDPR. You have additional rights including data portability and the right to lodge complaints with your supervisory authority.
            </p>
          </section>

          <section className="legal-section">
            <h2>14. Changes to Privacy Policy</h2>
            <p>
              We may update this Privacy Policy periodically. We will notify you of significant changes via email or a prominent notice on the Service. Continued use of the Service following changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section className="legal-section">
            <h2>15. Contact Us</h2>
            <p>
              For privacy-related questions or to exercise your rights, please contact us at:
            </p>
            <p>
              <strong>Email:</strong> privacy@the3cmall.app<br />
              <strong>Address:</strong> The 3C Mall, United States<br />
              <strong>Support:</strong> support@the3cmall.app
            </p>
          </section>
        </div>
      </div>
    </section>
  );
}
