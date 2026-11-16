import { apiRequest } from '../api/apiClient';

export interface ServerRequirementItem {
  key: string;
  label: string;
  ok: boolean;
  current: string;
}

export interface InstallStatusPayload {
  installed: boolean;
  appVersion: string;
  adminLoginPath: string;
  adminPanelPath: string;
}

export interface DatabaseConfigInput {
  dbType: 'MySQL' | 'MariaDB';
  host: string;
  port: string;
  database: string;
  username: string;
  password: string;
}

export interface WebsiteInstallConfigInput {
  websiteName: string;
  websiteUrl: string;
  websiteDescription: string;
  collegeEmail: string;
  contactNumber: string;
  timezone: string;
  defaultLanguage: string;
  defaultTheme: string;
  adminLoginPath: string;
  adminPanelPath: string;
}

export interface AdminSetupInput {
  name: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

export const installService = {
  async getStatus() {
    return apiRequest<InstallStatusPayload>('/install/status');
  },

  async getRequirements() {
    return apiRequest<{ allPassed: boolean; checks: ServerRequirementItem[]; phpVersion: string }>(
      '/install/requirements'
    );
  },

  async testDatabase(config: DatabaseConfigInput) {
    return apiRequest<{ connected: boolean; serverVersion: string; database: string }>(
      '/install/test-database',
      {
        method: 'POST',
        body: JSON.stringify({
          host: config.host,
          port: Number(config.port) || 3306,
          database: config.database,
          username: config.username,
          password: config.password,
        }),
      }
    );
  },

  async executeInstallation(payload: {
    database: DatabaseConfigInput;
    website: WebsiteInstallConfigInput;
    admin: AdminSetupInput;
  }) {
    return apiRequest<{
      installed: boolean;
      adminLoginPath: string;
      adminPanelPath: string;
      superAdminEmail: string;
    }>('/install/execute', {
      method: 'POST',
      body: JSON.stringify({
        database: {
          host: payload.database.host,
          port: Number(payload.database.port) || 3306,
          database: payload.database.database,
          username: payload.database.username,
          password: payload.database.password,
        },
        website: {
          websiteName: payload.website.websiteName,
          websiteUrl: payload.website.websiteUrl,
          websiteDescription: payload.website.websiteDescription,
          contactEmail: payload.website.collegeEmail,
          contactPhone: payload.website.contactNumber,
          timezone: payload.website.timezone,
          defaultLanguage: payload.website.defaultLanguage,
          defaultTheme: payload.website.defaultTheme,
          adminLoginPath: payload.website.adminLoginPath,
          adminPanelPath: payload.website.adminPanelPath,
        },
        admin: {
          fullName: payload.admin.name,
          email: payload.admin.email,
          username: payload.admin.username,
          password: payload.admin.password,
          password_confirmation: payload.admin.confirmPassword,
        },
      }),
    });
  },
};
