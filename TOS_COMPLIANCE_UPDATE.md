# Terms of Service Compliance Update
**Date:** January 20, 2026

## Summary
Updated [src/pages/TermsOfService.jsx](src/pages/TermsOfService.jsx) to ensure full compliance with both **Kroger API Terms of Service** and **Walmart Order Integration API Terms of Service**.

---

## Key Compliance Additions

### 1. **Third-Party API Terms and Data Usage (Section 11)**
Addresses requirements from both Kroger and Walmart APIs:

✅ **API Usage Limitations**
- Prohibits circumventing rate limits or usage restrictions
- Requires obtaining express written consent for usage beyond documented limits

✅ **Data Collection and Retention**
- HIPAA compliance for protected health information
- No retention/caching beyond permitted timeframes
- Compliance with provider policies

✅ **Content Scraping Prohibition**
- No permanent database copies of API-returned content
- No derivative works without authorization
- No copying or translating API content

✅ **Competitive Analysis Restriction**
- Prohibits using APIs to target provider customers for competitive analysis
- No targeted marketing strategies based on API data

✅ **Data Portability**
- Users can easily export data from the platform
- Third-party data sharing restricted to compliant parties

✅ **Reverse Engineering Prohibition**
- No decompiling, disassembling, or extracting source code from APIs
- Applies to both Kroger and Walmart systems

✅ **Harmful Code Restriction**
- No viruses, malware, Trojans, worms, or destructive code
- Directly from Kroger API requirements

✅ **Privacy and Security Compliance**
- NIST Cybersecurity Framework (CSF)
- NIST SP:800-53
- ISO 27001 (including 27002 controls)
- Aligns with Walmart Information Security Addendum

✅ **Breach Notification**
- Compliance with applicable breach notification laws
- 24-48 hour notification procedures per Walmart requirements

---

### 2. **Personal Information and Data Protection (Section 12)**
Comprehensive data protection compliance:

✅ Privacy law compliance (HIPAA, CCPA, GDPR-compatible)
✅ No non-public content exposure without explicit opt-in consent
✅ Clear privacy policy requirements
✅ Timely breach notification obligations
✅ Data deletion upon termination or request

---

### 3. **Prohibited Uses (Section 13)**
Implements restrictions from both API providers:

✅ No API sublicensing to third parties
✅ No creation of competing APIs
✅ No harassment or defamation
✅ No service disruption attempts
✅ No fraudulent activities
✅ Cannot remove/alter TOS from API providers
✅ Cannot use for critical safety systems (nuclear, air traffic control, life support)
✅ ITAR compliance (International Traffic in Arms Regulations)
✅ No false claims of partnership/sponsorship/endorsement
✅ CAN-SPAM Act compliance

---

### 4. **Indemnification (Section 14)**
Unlimited indemnification obligation covering:
- TOS violations
- Legal violations
- Third-party rights infringement
- API misuse
- Data routing through service
- Survives service termination

---

### 5. **Warranty Disclaimers (Section 15)**
"AS IS" / "AS AVAILABLE" language from:
- Walmart API License Agreement language
- Kroger API Terms
- Includes reliability, availability, fitness disclaimers
- Excludes liability for indirect/consequential damages

---

### 6. **Limitation of Liability (Section 16)**
Capped at:
- 12-month fees paid, OR
- $10,000 USD if no fees paid
- Directly mirrors Walmart's $10,000 cap
- Exceptions: indemnification, confidentiality, IP infringement

---

### 7. **Intellectual Property and Attribution (Section 17)**
Ensures proper attribution:
✅ Acknowledges Kroger/Walmart IP rights
✅ Requires display of required attributions
✅ Brand feature usage only as authorized
✅ No false affiliation claims

---

### 8. **Monitoring and Suspension (Section 18)**
Service quality and compliance enforcement:
✅ 3C Mall monitoring rights
✅ Suspension with or without notice
✅ API provider suspension rights
✅ Direct enforcement by Kroger/Walmart

---

### 9. **Confidentiality (Section 19)**
API credential protection:
✅ Maintain confidentiality of API keys/credentials
✅ Cannot embed in open-source projects
✅ Limited disclosure exceptions (legal requirement only)

---

## Compliance Matrix

| Requirement | Kroger API | Walmart O/I | Our TOS |
|---|---|---|---|
| API Rate Limiting Compliance | ✓ | ✓ | ✓ (Section 11) |
| Data Retention Limits | ✓ | ✓ | ✓ (Section 11) |
| HIPAA Compliance | ✓ | ✓ | ✓ (Sections 11, 12) |
| Content Scraping Prohibition | ✓ | ✓ | ✓ (Section 11) |
| Competitive Analysis Ban | ✓ | ✓ | ✓ (Section 11) |
| Reverse Engineering Ban | ✓ | ✓ | ✓ (Section 11, 2) |
| Breach Notification | ✓ | ✓ | ✓ (Section 12, 11) |
| Security Standards | ✓ | ✓ | ✓ (Section 11) |
| CAN-SPAM Compliance | ✓ | ✓ | ✓ (Section 13) |
| Indemnification | ✓ | ✓ | ✓ (Section 14) |
| IP Attribution | ✓ | ✓ | ✓ (Section 17) |
| AS-IS Warranty Disclaimer | ✓ | ✓ | ✓ (Section 15) |
| Liability Cap | ✓ | ✓ | ✓ (Section 16) |

---

## Next Steps

1. **Legal Review:** Have your legal team review the updated TOS
2. **User Notification:** Notify existing users of TOS changes per your notice requirements
3. **Implementation Date:** Set effective date (suggested: 30 days)
4. **Partner Notification:** Confirm with Kroger and Walmart that terms are acceptable
5. **Regular Audits:** Conduct quarterly compliance audits

---

## Files Modified
- [src/pages/TermsOfService.jsx](src/pages/TermsOfService.jsx) - Added 9 new compliance sections (11-20)

## Last Updated
January 20, 2026
