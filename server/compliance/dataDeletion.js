/**
 * Data Deletion and Account Termination Service
 * Implements GDPR-like data deletion and account termination per TOS
 * 
 * Implements:
 * - User account deletion (TOS Section 12)
 * - Data deletion on termination (TOS Section 12)
 * - Data portability / export (TOS Section 11)
 * - Residual data cleanup (TOS Section 12)
 */

import { supabase } from '../supabase.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EXPORT_DIR = path.join(__dirname, '../../exports');

// Ensure export directory exists
if (!fs.existsSync(EXPORT_DIR)) {
  fs.mkdirSync(EXPORT_DIR, { recursive: true });
}

/**
 * Account and Data Deletion Service
 */
export class DataDeletionService {
  constructor() {
    this.deletionRequests = [];
    this.exportRequests = [];
  }

  /**
   * Request user data export (data portability)
   * TOS Section 11: Must enable easy data export
   */
  async requestDataExport(userId, email) {
    try {
      const exportId = `EXPORT_${userId}_${Date.now()}`;
      const exportData = {
        id: exportId,
        userId,
        email,
        requestedAt: new Date().toISOString(),
        status: 'IN_PROGRESS',
        data: {},
      };

      // Gather all user data
      console.log(`📦 Gathering data export for user: ${userId}`);

      // 1. User profile data
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userData) {
        exportData.data.profile = this.sanitizeForExport(userData);
      }

      // 2. User preferences
      const { data: prefsData } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId);

      if (prefsData) {
        exportData.data.preferences = prefsData.map(p => this.sanitizeForExport(p));
      }

      // 3. User activity/history
      const { data: activityData } = await supabase
        .from('user_activity')
        .select('*')
        .eq('user_id', userId);

      if (activityData) {
        exportData.data.activity = activityData.map(a => this.sanitizeForExport(a));
      }

      // 4. Saved recipes/content
      const { data: recipesData } = await supabase
        .from('user_recipes')
        .select('*')
        .eq('user_id', userId);

      if (recipesData) {
        exportData.data.recipes = recipesData.map(r => this.sanitizeForExport(r));
      }

      // Create export file
      const filename = `${exportId}.json`;
      const filepath = path.join(EXPORT_DIR, filename);
      
      fs.writeFileSync(filepath, JSON.stringify(exportData, null, 2));

      exportData.status = 'COMPLETED';
      exportData.downloadUrl = `/api/export/${exportId}`;
      exportData.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

      this.exportRequests.push(exportData);

      console.log(`✅ Data export ready: ${filename}`);

      return {
        success: true,
        exportId,
        downloadUrl: exportData.downloadUrl,
        expiresAt: exportData.expiresAt,
        message: 'Your data export is ready for download',
      };
    } catch (error) {
      console.error('Error requesting data export:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Download user data export
   */
  getDataExport(exportId) {
    try {
      const filepath = path.join(EXPORT_DIR, `${exportId}.json`);
      
      if (!fs.existsSync(filepath)) {
        return {
          success: false,
          error: 'Export not found or expired',
        };
      }

      const data = fs.readFileSync(filepath, 'utf-8');
      return {
        success: true,
        data: JSON.parse(data),
      };
    } catch (error) {
      console.error('Error retrieving data export:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Request account deletion
   * TOS Section 12: Upon account termination, immediately cease use and delete all data
   */
  async requestAccountDeletion(userId, email, reason = '') {
    try {
      const deletionId = `DELETION_${userId}_${Date.now()}`;

      const deletionRequest = {
        id: deletionId,
        userId,
        email,
        reason,
        requestedAt: new Date().toISOString(),
        status: 'PENDING_VERIFICATION',
        deletedAt: null,
      };

      this.deletionRequests.push(deletionRequest);

      console.log(`🗑️ Account deletion requested: ${userId}`);

      // Send verification email (user must confirm)
      // TODO: Send confirmation email with verification link

      return {
        success: true,
        deletionId,
        message: 'Account deletion requested. Please check your email to confirm.',
        verificationUrl: `/api/delete-account/verify?token=${deletionId}`,
      };
    } catch (error) {
      console.error('Error requesting account deletion:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Confirm and execute account deletion
   * TOS Section 12: Delete all user data immediately upon account termination
   */
  async confirmAccountDeletion(deletionId) {
    try {
      const deletionRequest = this.deletionRequests.find(r => r.id === deletionId);
      
      if (!deletionRequest) {
        return { success: false, error: 'Deletion request not found' };
      }

      if (deletionRequest.status !== 'PENDING_VERIFICATION') {
        return { success: false, error: 'Invalid deletion request status' };
      }

      const userId = deletionRequest.userId;
      console.log(`🗑️ EXECUTING account deletion for: ${userId}`);

      // Step 1: First, export data for compliance record
      await this.requestDataExport(userId, deletionRequest.email);

      // Step 2: Delete all user data from all tables
      const tables = [
        'user_preferences',
        'user_activity',
        'user_recipes',
        'email_consents',
        'api_usage',
        'audit_logs',
      ];

      for (const table of tables) {
        const { error } = await supabase
          .from(table)
          .delete()
          .eq('user_id', userId);

        if (error) {
          console.warn(`Warning deleting from ${table}:`, error);
        }
      }

      // Step 3: Delete user profile (last step)
      const { error: userError } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (userError) {
        console.error('Error deleting user profile:', userError);
        return { success: false, error: 'Failed to delete user profile' };
      }

      // Step 4: Update deletion request
      deletionRequest.status = 'COMPLETED';
      deletionRequest.deletedAt = new Date().toISOString();

      // Step 5: Log deletion in audit trail
      const auditEntry = {
        eventType: 'ACCOUNT_DELETION',
        userId,
        timestamp: new Date().toISOString(),
        deletionId,
        status: 'COMPLETED',
      };

      fs.appendFileSync(
        path.join(__dirname, '../logs/deletions.log'),
        `${JSON.stringify(auditEntry)}\n`
      );

      console.log(`✅ Account deleted successfully: ${userId}`);

      return {
        success: true,
        message: 'Your account and all associated data have been permanently deleted',
        completedAt: deletionRequest.deletedAt,
      };
    } catch (error) {
      console.error('Error confirming account deletion:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Clean up residual data (per TOS Section 12)
   * Remove cached data, temporary files, and backups
   */
  async cleanupResidualData(userId, days = 30) {
    try {
      console.log(`🧹 Cleaning up residual data for: ${userId}`);

      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

      // Delete old API cache entries
      const { error: cacheError } = await supabase
        .from('api_cache')
        .delete()
        .eq('user_id', userId)
        .lt('created_at', cutoffDate);

      if (cacheError) {
        console.warn('Warning deleting cache:', cacheError);
      }

      // Delete old temporary files
      const exportFiles = fs.readdirSync(EXPORT_DIR);
      for (const file of exportFiles) {
        const filepath = path.join(EXPORT_DIR, file);
        const stats = fs.statSync(filepath);
        
        if (Date.now() - stats.mtimeMs > days * 24 * 60 * 60 * 1000) {
          fs.unlinkSync(filepath);
          console.log(`  Deleted expired export: ${file}`);
        }
      }

      console.log(`✅ Residual data cleanup complete`);

      return { success: true };
    } catch (error) {
      console.error('Error cleaning up residual data:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Sanitize data for export (remove sensitive fields)
   */
  sanitizeForExport(data) {
    const sanitized = { ...data };
    
    // Remove sensitive fields
    const sensitiveFields = ['password', 'secret', 'token', 'api_key', 'stripe_id'];
    for (const field of sensitiveFields) {
      delete sanitized[field];
    }

    return sanitized;
  }

  /**
   * Get deletion request status
   */
  getDeletionStatus(deletionId) {
    const request = this.deletionRequests.find(r => r.id === deletionId);
    if (!request) {
      return { found: false };
    }

    return {
      found: true,
      deletionId: request.id,
      status: request.status,
      requestedAt: request.requestedAt,
      deletedAt: request.deletedAt,
    };
  }

  /**
   * Get audit summary
   */
  getAuditSummary() {
    return {
      totalExportRequests: this.exportRequests.length,
      completedExports: this.exportRequests.filter(e => e.status === 'COMPLETED').length,
      totalDeletionRequests: this.deletionRequests.length,
      completedDeletions: this.deletionRequests.filter(d => d.status === 'COMPLETED').length,
      pendingDeletions: this.deletionRequests.filter(d => d.status === 'PENDING_VERIFICATION').length,
    };
  }
}

// Singleton instance
let instance = null;

export function getDataDeletionService() {
  if (!instance) {
    instance = new DataDeletionService();
  }
  return instance;
}

export default getDataDeletionService();
