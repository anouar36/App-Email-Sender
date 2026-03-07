import { apiClient } from './client';
import { authApi } from './auth';

export interface Sender {
  id: number;
  userId: number;
  email: string;
  password: string;
  host: string;
  port: number;
  secure: boolean;
  name?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSenderPayload {
  email: string;
  password: string;
  host: string;
  port: number;
  secure: boolean;
  name?: string;
}

export interface UpdateSenderPayload extends Partial<CreateSenderPayload> {
  isActive?: boolean;
}

export const senderApi = {
  async getSenders(): Promise<Sender[]> {
    const token = authApi.getToken();
    if (!token) throw new Error('Not authenticated');
    return apiClient.get('/senders', token);
  },

  async createSender(payload: CreateSenderPayload): Promise<Sender> {
    const token = authApi.getToken();
    if (!token) throw new Error('Not authenticated');
    return apiClient.post('/senders', payload, token);
  },

  async updateSender(id: number, payload: UpdateSenderPayload): Promise<Sender> {
    const token = authApi.getToken();
    if (!token) throw new Error('Not authenticated');
    return apiClient.put(`/senders/${id}`, payload, token);
  },

  async deleteSender(id: number): Promise<{ message: string }> {
    const token = authApi.getToken();
    if (!token) throw new Error('Not authenticated');
    return apiClient.delete(`/senders/${id}`, token);
  },
};
