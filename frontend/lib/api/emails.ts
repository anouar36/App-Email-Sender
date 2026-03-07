import { apiClient } from './client';
import { authApi } from './auth';

export interface EmailCampaign {
  id: number;
  userId: number;
  subject: string;
  body: string;
  recipients: number;
  sent: number;
  opened: number;
  failed: number;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export interface SendEmailPayload {
  subject: string;
  body: string;
  recipients: string[];
  senderId?: number;
  templateId?: number;
  scheduledAt?: string;
}

export interface Analytics {
  totalCampaigns: number;
  totalSent: number;
  totalOpened: number;
  totalFailed: number;
  openRate: number;
  recentCampaigns: EmailCampaign[];
}

export const emailApi = {
  async sendEmails(payload: SendEmailPayload): Promise<{ message: string; campaignId: number }> {
    const token = authApi.getToken();
    if (!token) throw new Error('Not authenticated');
    return apiClient.post('/emails/send', payload, token);
  },

  async getCampaigns(): Promise<EmailCampaign[]> {
    const token = authApi.getToken();
    if (!token) throw new Error('Not authenticated');
    return apiClient.get('/emails/campaigns', token);
  },

  async getCampaignDetails(id: number): Promise<EmailCampaign> {
    const token = authApi.getToken();
    if (!token) throw new Error('Not authenticated');
    return apiClient.get(`/emails/campaigns/${id}`, token);
  },

  async getAnalytics(): Promise<Analytics> {
    const token = authApi.getToken();
    if (!token) throw new Error('Not authenticated');
    return apiClient.get('/emails/analytics', token);
  },

  async exportToExcel(): Promise<Blob> {
    const token = authApi.getToken();
    if (!token) throw new Error('Not authenticated');
    
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/emails/export`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Export failed');
    }

    return response.blob();
  },
};
