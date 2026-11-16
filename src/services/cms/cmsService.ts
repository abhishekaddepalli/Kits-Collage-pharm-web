import type {
  AdminUser,
  AdmissionEnquiry,
  CmsPage,
  CmsState,
  DashboardMetrics,
  EnquiryStatus,
  MediaItem,
  PermissionKey,
} from '../../types/cms';
import { apiRequest, apiUpload } from '../api/apiClient';

export const cmsService = {
  async fetchPublicBootstrap() {
    return apiRequest<Partial<CmsState>>('/public/bootstrap');
  },

  async fetchAdminBootstrap() {
    return apiRequest<Partial<CmsState>>('/admin/bootstrap');
  },

  async fetchDashboardMetrics() {
    return apiRequest<DashboardMetrics>('/admin/dashboard');
  },

  async submitPublicEnquiry(
    payload: Omit<AdmissionEnquiry, 'id' | 'status' | 'assignedTo' | 'notes' | 'followUpDate' | 'createdAt'>
  ) {
    return apiRequest<{ referenceCode: string; createdAt: string }>('/public/enquiries', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async submitFeedback(payload: { name: string; role: string; email?: string; rating: number; comments: string }) {
    return apiRequest('/public/feedback', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async sendChatbotMessage(message: string, sessionToken?: string) {
    return apiRequest<{
      reply: string;
      provider: 'faq' | 'gemini' | 'fallback';
      matchedFaqId: string | null;
      matched: boolean;
    }>('/chatbot/message', {
      method: 'POST',
      body: JSON.stringify({ message, sessionToken }),
    });
  },

  async updateEnquiry(id: string, status: EnquiryStatus, notes?: string, followUpDate?: string) {
    return apiRequest(`/admin/enquiries/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes, followUpDate }),
    });
  },

  async uploadMedia(file: File, title?: string, altText?: string, folder = 'Campus') {
    const fd = new FormData();
    fd.append('file', file);
    if (title) fd.append('title', title);
    if (altText) fd.append('altText', altText);
    fd.append('folder', folder);
    return apiUpload<MediaItem>('/admin/media', fd);
  },

  async updateMediaMetadata(id: string, payload: { title: string; altText: string; folder: string }) {
    return apiRequest(`/admin/media/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async deleteMedia(id: string) {
    return apiRequest(`/admin/media/${id}`, { method: 'DELETE' });
  },

  async createUser(payload: {
    name: string;
    username: string;
    email: string;
    password: string;
    role: string;
    active: boolean;
  }) {
    return apiRequest<AdminUser>('/admin/users', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateUser(id: string, payload: Partial<AdminUser> & { password?: string }) {
    return apiRequest(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async deleteUser(id: string) {
    return apiRequest(`/admin/users/${id}`, { method: 'DELETE' });
  },

  async updateRolePermissions(id: string, permissions: PermissionKey[]) {
    return apiRequest(`/admin/roles/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ permissions }),
    });
  },

  async markAllNotificationsRead() {
    return apiRequest('/admin/notifications/read-all', { method: 'POST' });
  },

  async syncPages(prevPages: CmsPage[], nextPages: CmsPage[]) {
    for (const page of nextPages) {
      const existing = prevPages.find((p) => p.id === page.id);
      if (!existing) {
        await apiRequest('/admin/pages', { method: 'POST', body: JSON.stringify(page) });
      } else if (JSON.stringify(existing) !== JSON.stringify(page)) {
        await apiRequest(`/admin/pages/${page.id}`, { method: 'PUT', body: JSON.stringify(page) });
      }
    }
    for (const oldPage of prevPages) {
      if (!nextPages.some((p) => p.id === oldPage.id)) {
        await apiRequest(`/admin/pages/${oldPage.id}`, { method: 'DELETE' });
      }
    }
  },

  async syncModuleChanges(prev: CmsState, next: CmsState): Promise<{ ok: boolean; error?: string }> {
    const tasks: Promise<{ ok: boolean; message?: string }>[] = [];

    if (prev.appearance !== next.appearance) {
      tasks.push(apiRequest('/admin/appearance', { method: 'PUT', body: JSON.stringify(next.appearance) }));
    }
    if (prev.header !== next.header) {
      tasks.push(apiRequest('/admin/header', { method: 'PUT', body: JSON.stringify(next.header) }));
    }
    if (prev.footer !== next.footer) {
      tasks.push(apiRequest('/admin/footer', { method: 'PUT', body: JSON.stringify(next.footer) }));
    }
    if (prev.navigation !== next.navigation) {
      tasks.push(apiRequest('/admin/menus', { method: 'PUT', body: JSON.stringify({ items: next.navigation }) }));
    }
    if (prev.sliders !== next.sliders) {
      tasks.push(apiRequest('/admin/sliders', { method: 'PUT', body: JSON.stringify({ sliders: next.sliders }) }));
    }
    if (prev.banners !== next.banners) {
      tasks.push(apiRequest('/admin/banners', { method: 'PUT', body: JSON.stringify({ banners: next.banners }) }));
    }
    if (prev.programs !== next.programs) {
      tasks.push(apiRequest('/admin/programs', { method: 'PUT', body: JSON.stringify({ programs: next.programs }) }));
    }
    if (prev.departments !== next.departments) {
      tasks.push(
        apiRequest('/admin/departments', { method: 'PUT', body: JSON.stringify({ departments: next.departments }) })
      );
    }
    if (prev.faculty !== next.faculty) {
      tasks.push(apiRequest('/admin/faculty', { method: 'PUT', body: JSON.stringify({ faculty: next.faculty }) }));
    }
    if (prev.newsEvents !== next.newsEvents) {
      tasks.push(
        apiRequest('/admin/news-events', { method: 'PUT', body: JSON.stringify({ newsEvents: next.newsEvents }) })
      );
    }
    if (prev.achievements !== next.achievements) {
      tasks.push(
        apiRequest('/admin/modules/achievements', { method: 'PUT', body: JSON.stringify({ items: next.achievements }) })
      );
    }
    if (prev.placements !== next.placements) {
      tasks.push(
        apiRequest('/admin/modules/placements', { method: 'PUT', body: JSON.stringify({ items: next.placements }) })
      );
    }
    if (prev.campusLife !== next.campusLife) {
      tasks.push(
        apiRequest('/admin/modules/campus-life', { method: 'PUT', body: JSON.stringify({ items: next.campusLife }) })
      );
    }
    if (prev.gallery !== next.gallery) {
      tasks.push(apiRequest('/admin/modules/gallery', { method: 'PUT', body: JSON.stringify({ items: next.gallery }) }));
    }
    if (prev.testimonials !== next.testimonials) {
      tasks.push(
        apiRequest('/admin/modules/testimonials', {
          method: 'PUT',
          body: JSON.stringify({ items: next.testimonials }),
        })
      );
    }
    if (prev.downloads !== next.downloads) {
      tasks.push(
        apiRequest('/admin/modules/downloads', { method: 'PUT', body: JSON.stringify({ items: next.downloads }) })
      );
    }
    if (prev.chatbot !== next.chatbot) {
      if (prev.chatbot.faqs !== next.chatbot.faqs) {
        tasks.push(
          apiRequest('/admin/chatbot/faqs', { method: 'PUT', body: JSON.stringify({ faqs: next.chatbot.faqs }) })
        );
      } else {
        tasks.push(
          apiRequest('/admin/chatbot/settings', {
            method: 'PUT',
            body: JSON.stringify({
              enabled: next.chatbot.enabled,
              name: next.chatbot.name,
              avatarUrl: next.chatbot.avatarUrl,
              welcomeMessage: next.chatbot.welcomeMessage,
              primaryColor: next.chatbot.primaryColor,
              suggestedQuestions: next.chatbot.suggestedQuestions,
              fallbackMessage: next.chatbot.fallbackMessage,
              providerMode: next.chatbot.providerMode,
            }),
          })
        );
      }
    }
    if (prev.seo !== next.seo) {
      tasks.push(apiRequest('/admin/seo', { method: 'PUT', body: JSON.stringify(next.seo) }));
    }
    if (prev.forms !== next.forms) {
      tasks.push(apiRequest('/admin/forms', { method: 'PUT', body: JSON.stringify({ forms: next.forms }) }));
    }
    if (prev.settings !== next.settings) {
      if (prev.settings.admissionsConfig !== next.settings.admissionsConfig) {
        tasks.push(
          apiRequest('/admin/admissions-settings', {
            method: 'PUT',
            body: JSON.stringify(next.settings.admissionsConfig),
          })
        );
      } else {
        tasks.push(apiRequest('/admin/settings', { method: 'PUT', body: JSON.stringify(next.settings) }));
      }
    }
    if (prev.pages !== next.pages) {
      await this.syncPages(prev.pages, next.pages);
    }

    const results = await Promise.all(tasks);
    const failed = results.find((r) => !r.ok);
    if (failed) {
      return { ok: false, error: failed.message };
    }
    return { ok: true };
  },
};
