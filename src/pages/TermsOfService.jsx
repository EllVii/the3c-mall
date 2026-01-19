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
          <p className="legal-updated">Last updated: January 17, 2026</p>
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
            <h2>11. Contact Information</h2>
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
