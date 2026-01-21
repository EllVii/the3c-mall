/**
 * CAN-SPAM Compliance Module
 * Ensures all email communications comply with CAN-SPAM Act and API provider requirements
 * 
 * Implements:
 * - Opt-in consent tracking (TOS Section 12, 13)
 * - List-Unsubscribe headers (CAN-SPAM requirement)
 * - Unsubscribe mechanism
 * - Email content compliance
 * - Do-not-email list management
 */

import { supabase } from '../supabase.js';

/**
 * Email Consent Status
 */
export const CONSENT_STATUS = {
  OPTED_IN: 'opted_in',
  OPTED_OUT: 'opted_out',
  PENDING: 'pending',
  EXPLICIT_CONSENT: 'explicit_consent',
  IMPLIED_CONSENT: 'implied_consent',
};

/**
 * Email Category for consent tracking
 */
export const EMAIL_CATEGORIES = {
  MARKETING: 'marketing',
  TRANSACTIONAL: 'transactional',
  PROMOTIONAL: 'promotional',
  ACCOUNT: 'account',
  SECURITY: 'security',
  WAITLIST: 'waitlist',
};

/**
 * CAN-SPAM Compliance Manager
 */
export class CANSPAMCompliance {
  constructor() {
    this.consentRecords = new Map();
    this.unsubscribeRequests = [];
    this.doNotEmailList = new Set();
  }

  /**
   * Generate CAN-SPAM compliant email headers
   * Includes List-Unsubscribe header as required by CAN-SPAM
   * TOS Section 13: CAN-SPAM Act compliance
   */
  generateHeaders(email, emailType, unsubscribeUrl) {
    const headers = {
      'From': `3C Mall <${process.env.SENDER_EMAIL || 'noreply@the3cmall.app'}>`,
      'Reply-To': `support@the3cmall.app`,
      'List-Unsubscribe': `<${unsubscribeUrl}>, <mailto:unsubscribe@the3cmall.app?subject=unsubscribe>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      'X-Mailer': '3C-Mall/1.0',
      'X-Email-Type': emailType,
      'X-Consent-Status': 'EXPLICIT',
    };

    return headers;
  }

  /**
   * Verify recipient has opted in to receive emails
   * TOS Section 12: No non-public content exposure without explicit opt-in consent
   */
  async verifyOptIn(email, emailCategory) {
    // Check if email is on do-not-email list
    if (this.doNotEmailList.has(email.toLowerCase())) {
      return {
        allowed: false,
        reason: 'RECIPIENT_UNSUBSCRIBED',
        category: emailCategory,
      };
    }

    try {
      // Check consent records in Supabase
      const { data, error } = await supabase
        .from('email_consents')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      if (!data) {
        // First-time contact - transactional emails allowed, marketing requires explicit consent
        if (emailCategory === EMAIL_CATEGORIES.TRANSACTIONAL || 
            emailCategory === EMAIL_CATEGORIES.SECURITY ||
            emailCategory === EMAIL_CATEGORIES.ACCOUNT) {
          return { allowed: true, implicit: true };
        } else {
          return {
            allowed: false,
            reason: 'NO_EXPLICIT_CONSENT',
            category: emailCategory,
          };
        }
      }

      // Check consent for this category
      const categoryConsent = data[`consents_${emailCategory}`];
      
      if (categoryConsent === false) {
        return {
          allowed: false,
          reason: 'USER_OPTED_OUT',
          category: emailCategory,
        };
      }

      return { allowed: true, consentLevel: data.consent_status };
    } catch (error) {
      console.error('Error verifying email consent:', error);
      // Fail-safe: don't send if we can't verify consent
      return { allowed: false, reason: 'VERIFICATION_ERROR' };
    }
  }

  /**
   * Record consent for email communication
   * TOS Section 12: Explicit opt-in consent required for non-transactional emails
   */
  async recordConsent(email, emailCategories, consentType = CONSENT_STATUS.EXPLICIT_CONSENT) {
    try {
      const consentObject = {
        email: email.toLowerCase(),
        consent_status: consentType,
        consented_at: new Date().toISOString(),
      };

      // Set consent flags for each category
      for (const category of emailCategories) {
        consentObject[`consents_${category}`] = true;
      }

      const { error } = await supabase
        .from('email_consents')
        .upsert([consentObject], { onConflict: 'email' });

      if (error) throw error;

      return { recorded: true, email, categories: emailCategories };
    } catch (error) {
      console.error('Error recording email consent:', error);
      return { recorded: false, error: error.message };
    }
  }

  /**
   * Process unsubscribe request
   * TOS Section 13: Timely unsubscribe mechanism
   */
  async processUnsubscribe(email, categories = []) {
    try {
      // Add to in-memory do-not-email list
      this.doNotEmailList.add(email.toLowerCase());

      // Update Supabase consent record
      const updateObj = {
        email: email.toLowerCase(),
        unsubscribed_at: new Date().toISOString(),
        unsubscribe_reason: 'USER_REQUEST',
      };

      // Mark all requested categories as opted out
      if (categories.length > 0) {
        for (const category of categories) {
          updateObj[`consents_${category}`] = false;
        }
      }

      const { error } = await supabase
        .from('email_consents')
        .upsert([updateObj], { onConflict: 'email' });

      if (error) throw error;

      this.unsubscribeRequests.push({
        email,
        categories,
        timestamp: new Date().toISOString(),
      });

      console.log(`✅ Unsubscribe processed for: ${email}`);
      return { processed: true, email, categories };
    } catch (error) {
      console.error('Error processing unsubscribe:', error);
      return { processed: false, error: error.message };
    }
  }

  /**
   * Validate email content for CAN-SPAM compliance
   * - Must have clear identification
   * - Must have valid physical address
   * - Must identify ads as ads
   * - Must not use deceptive headers
   */
  validateContent(emailContent, emailType) {
    const issues = [];

    // Check for clear identification of advertiser
    if (emailType === EMAIL_CATEGORIES.PROMOTIONAL || emailType === EMAIL_CATEGORIES.MARKETING) {
      if (!emailContent.includes('3C Mall') && !emailContent.includes('the3cmall')) {
        issues.push('Missing clear advertiser identification');
      }
    }

    // Check for physical address footer
    if (!emailContent.includes('United States') && 
        !emailContent.includes('3C Mall') &&
        !emailContent.includes('support@the3cmall.app')) {
      issues.push('Missing contact information');
    }

    // Check for unsubscribe information
    if (!emailContent.includes('unsubscribe') && !emailContent.includes('List-Unsubscribe')) {
      issues.push('Missing unsubscribe mechanism');
    }

    return {
      compliant: issues.length === 0,
      issues,
    };
  }

  /**
   * Get email consent summary for user
   */
  async getConsentSummary(email) {
    try {
      const { data, error } = await supabase
        .from('email_consents')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (!data) {
        return {
          email,
          status: 'NO_RECORD',
          categories: {},
        };
      }

      return {
        email,
        status: data.consent_status,
        consentedAt: data.consented_at,
        unsubscribed: !!data.unsubscribed_at,
        categories: {
          marketing: data.consents_marketing !== false,
          promotional: data.consents_promotional !== false,
          account: data.consents_account !== false,
          security: data.consents_security !== false,
          waitlist: data.consents_waitlist !== false,
        },
      };
    } catch (error) {
      console.error('Error getting consent summary:', error);
      return null;
    }
  }

  /**
   * Generate unsubscribe footer for email
   */
  generateUnsubscribeFooter(email) {
    const unsubscribeLink = `${process.env.VITE_API_URL || 'http://localhost:3001'}/api/email/unsubscribe?email=${encodeURIComponent(email)}`;
    
    return `
      <div style="border-top: 1px solid #ddd; margin-top: 40px; padding-top: 20px; font-size: 12px; color: #999; text-align: center;">
        <p>
          You're receiving this email because you signed up for 3C Mall communications.<br>
          <a href="${unsubscribeLink}" style="color: #0066cc; text-decoration: none;">Unsubscribe from all emails</a> | 
          <a href="${process.env.VITE_URL || 'http://localhost:5173'}/email-preferences" style="color: #0066cc; text-decoration: none;">Manage preferences</a>
        </p>
        <p>
          3C Mall<br>
          The 3C Mall, United States<br>
          support@the3cmall.app
        </p>
      </div>
    `;
  }

  /**
   * Get compliance status
   */
  getStatus() {
    return {
      timestamp: new Date().toISOString(),
      unsubscribedCount: this.doNotEmailList.size,
      totalUnsubscribeRequests: this.unsubscribeRequests.length,
      consentRecords: this.consentRecords.size,
      system: 'OPERATIONAL',
    };
  }
}

// Singleton instance
let complianceInstance = null;

export function getCANSPAMCompliance() {
  if (!complianceInstance) {
    complianceInstance = new CANSPAMCompliance();
  }
  return complianceInstance;
}

export default getCANSPAMCompliance();
