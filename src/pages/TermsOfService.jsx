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
          <p className="legal-updated">Last updated: January 20, 2026</p>
        </div>

        <div className="legal-content">
          <section className="legal-section">
            <h2>1. Agreement to Terms</h2>
            <p>
              By accessing and using the 3C Mall website and application ("Service"), you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section className="legal-section">
            <h2>2. Use License</h2>
            <p>
              Permission is granted to temporarily download one copy of the materials (information or software) on the 3C Mall website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul>
              <li>Modifying or copying the materials</li>
              <li>Using the materials for any commercial purpose or for any public display</li>
              <li>Attempting to decompile or reverse engineer any software contained on the Service</li>
              <li>Removing any copyright or other proprietary notations from the materials</li>
              <li>Transferring the materials to another person or "mirroring" the materials on any other server</li>
              <li>Using the materials for any purpose other than personal, non-commercial viewing</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>3. Disclaimer</h2>
            <p>
              The materials on the 3C Mall website and application are provided on an 'as is' basis. 3C Mall makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
          </section>

          <section className="legal-section">
            <h2>4. Limitations</h2>
            <p>
              In no event shall 3C Mall or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on the 3C Mall website and application, even if 3C Mall or a 3C Mall authorized representative has been notified orally or in writing of the possibility of such damage.
            </p>
          </section>

          <section className="legal-section">
            <h2>5. Accuracy of Materials</h2>
            <p>
              The materials appearing on the 3C Mall website and application could include technical, typographical, or photographic errors. 3C Mall does not warrant that any of the materials on the Service are accurate, complete, or current. 3C Mall may make changes to the materials contained on the Service at any time without notice.
            </p>
          </section>

          <section className="legal-section">
            <h2>6. Links</h2>
            <p>
              3C Mall has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by 3C Mall of the site. Use of any such linked website is at the user's own risk.
            </p>
          </section>

          <section className="legal-section">
            <h2>7. Modifications</h2>
            <p>
              3C Mall may revise these terms of service for the website at any time without notice. By using this website and application, you are agreeing to be bound by the then current version of these terms of service.
            </p>
          </section>

          <section className="legal-section">
            <h2>8. Governing Law</h2>
            <p>
              These terms and conditions are governed by and construed in accordance with the laws of the United States, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
            </p>
          </section>

          <section className="legal-section">
            <h2>9. User Account Responsibility</h2>
            <p>
              If you create an account on the Service, you are responsible for maintaining the confidentiality of your account information and password and for restricting access to your computer. You agree to accept responsibility for all activities that occur under your account or password.
            </p>
          </section>

          <section className="legal-section">
            <h2>10. Content You Provide</h2>
            <p>
              You are responsible for any content you submit, post, or display on or through the Service. By submitting content, you grant 3C Mall a worldwide, non-exclusive, royalty-free license to use, copy, reproduce, process, adapt, modify, publish, and distribute such content in any media or form.
            </p>
          </section>

          <section className="legal-section">
            <h2>11. Third-Party API Terms and Data Usage</h2>
            <p>
              The 3C Mall Service integrates with third-party APIs, including but not limited to the Kroger API and Walmart Order Integration API, and is subject to the terms and conditions established by these providers. By using our Service, you agree to be bound by the following restrictions:
            </p>
            <ul>
              <li><strong>API Usage Limitations:</strong> You may not attempt to circumvent any rate limits, usage restrictions, or other limitations imposed by Kroger, Walmart, or other API providers. Unauthorized access beyond documented limits may result in immediate termination of service.</li>
              <li><strong>Data Collection and Retention:</strong> Any personal information collected through API integrations must be handled in accordance with applicable privacy laws, including HIPAA requirements where applicable. You may not retain, cache, or store API-returned data beyond permitted timeframes or in violation of provider policies.</li>
              <li><strong>Content Scraping Prohibition:</strong> You may not scrape, build databases, or create permanent copies of API-returned content. You may not copy, translate, modify, or create derivative works from API content without explicit authorization from the API provider.</li>
              <li><strong>Competitive Analysis Restriction:</strong> You may not use APIs to perform competitive analysis targeting any API provider's customers or to develop targeted marketing strategies based on API data.</li>
              <li><strong>Data Portability:</strong> We enable users to export their data as easily and quickly as exporting from original source platforms, and any data shared with third parties is restricted to parties that also comply with applicable data portability obligations.</li>
              <li><strong>Reverse Engineering Prohibition:</strong> You may not reverse engineer, decompile, disassemble, or attempt to extract source code or algorithms from any integrated API.</li>
              <li><strong>Harmful Code Restriction:</strong> You may not introduce viruses, malware, Trojans, worms, or other destructive code in connection with API usage.</li>
              <li><strong>Privacy and Security Compliance:</strong> We maintain security safeguards consistent with NIST Cybersecurity Framework, NIST SP:800-53, ISO 27001, or substantially similar standards to protect data processed through third-party APIs.</li>
              <li><strong>Breach Notification:</strong> We maintain breach notification procedures in compliance with applicable laws and will notify affected parties of security incidents as required.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>12. Personal Information and Data Protection</h2>
            <p>
              Any personal information, including personal health information or other sensitive data, collected in connection with our Service is subject to strict protection requirements:
            </p>
            <ul>
              <li>We comply with all applicable privacy laws and regulations, including HIPAA requirements for protected health information.</li>
              <li>We will not use Personal Information for purposes other than providing the Service without your explicit opt-in consent.</li>
              <li>We will not expose non-public user content to other users or third parties without explicit opt-in consent.</li>
              <li>We provide a clear, accurate privacy policy describing what user information is collected, how it is used and shared, and third-party sharing practices.</li>
              <li>We will promptly notify you of any unauthorized access to or use of your personal information to the extent required by applicable law.</li>
              <li>Upon termination of your account or at your request, we will immediately cease use of your Personal Information and delete all residual copies in accordance with applicable law.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>13. Prohibited Uses</h2>
            <p>
              In addition to other restrictions stated in these Terms, you may not:
            </p>
            <ul>
              <li>Sublicense any APIs or integrated services to third parties or create competing APIs.</li>
              <li>Defame, abuse, harass, stalk, or threaten any individual or entity through the Service.</li>
              <li>Interfere with or disrupt the integrity or performance of the Service or third-party services.</li>
              <li>Engage in fraudulent or deceptive practices in connection with the Service.</li>
              <li>Remove, obscure, or alter these Terms of Service or any associated terms from API providers.</li>
              <li>Use the Service for critical safety systems such as nuclear facilities, air traffic control systems, or life support systems.</li>
              <li>Process data subject to International Traffic in Arms Regulations (ITAR) without proper authorization.</li>
              <li>Claim partnership, sponsorship, or endorsement by Kroger, Walmart, or other API providers without prior written approval.</li>
              <li>Violate the CAN-SPAM Act or other applicable laws in connection with electronic communications sent through the Service.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>14. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless 3C Mall and its affiliates from any claims, damages, or costs (including attorneys' fees) arising from: (a) your use of the Service in violation of these Terms; (b) your violation of any applicable law or regulation; (c) your infringement of any third-party rights; (d) your misuse of any integrated API; or (e) any data you route through the Service. This indemnification obligation is unlimited and survives termination of your use of the Service.
            </p>
          </section>

          <section className="legal-section">
            <h2>15. Disclaimer of Warranties</h2>
            <p>
              THE SERVICE AND ALL INTEGRATED APIS ARE PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT ANY WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. 3C MALL MAKES NO WARRANTY REGARDING RELIABILITY, AVAILABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR ANY SPECIFIC RESULTS. 3C MALL DISCLAIMS ALL IMPLIED WARRANTIES INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. TO THE MAXIMUM EXTENT PERMITTED BY LAW, 3C MALL WILL NOT BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, PUNITIVE, OR EXEMPLARY DAMAGES.
            </p>
          </section>

          <section className="legal-section">
            <h2>16. Limitation of Liability</h2>
            <p>
              EXCEPT WITH RESPECT TO INDEMNIFICATION OBLIGATIONS, BREACHES OF CONFIDENTIALITY, OR INFRINGEMENT OF INTELLECTUAL PROPERTY RIGHTS, 3C MALL'S TOTAL CUMULATIVE LIABILITY FOR ALL CLAIMS, LOSSES, OR DAMAGES ARISING FROM YOUR USE OF THE SERVICE WILL NOT EXCEED THE TOTAL AMOUNT YOU HAVE PAID TO 3C MALL IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM, OR IF YOU HAVE NOT PAID ANYTHING, TEN THOUSAND DOLLARS (USD $10,000).
            </p>
          </section>

          <section className="legal-section">
            <h2>17. Intellectual Property and Attribution</h2>
            <p>
              You acknowledge and agree that Kroger, Walmart, and other third-party API providers retain all intellectual property rights in their APIs, content, trademarks, and associated materials. You must display required attributions as documented by API providers and may use brand features only as authorized. You may not misrepresent affiliation with, sponsorship, or endorsement by any third-party provider without express written consent.
            </p>
          </section>

          <section className="legal-section">
            <h2>18. Monitoring and Suspension</h2>
            <p>
              3C Mall may monitor your use of the Service to verify compliance with these Terms and to ensure service quality and security. We may suspend or terminate your access to the Service, including without notice, if we reasonably believe you have violated these Terms or pose a security risk. API providers may also directly suspend or revoke access to their services based on your conduct.
            </p>
          </section>

          <section className="legal-section">
            <h2>19. Confidentiality</h2>
            <p>
              You agree to maintain the confidentiality of any developer credentials, API keys, or other sensitive information provided to you. You may not embed credentials in open-source projects or disclose Kroger, Walmart, or other confidential information without prior written consent, except as required by law.
            </p>
          </section>

          <section className="legal-section">
            <h2>20. Contact Information</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at:
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
