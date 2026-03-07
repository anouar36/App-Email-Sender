import axios from "axios"
import { authApi } from "./auth"

const API_URL = "http://localhost:5000/api"

export interface AppConfig {
  gmail_app_password?: string
  email_send_delay?: string
  [key: string]: any
}

export const appConfigApi = {
  getConfig: async (): Promise<AppConfig> => {
    const token = authApi.getToken()
    const response = await axios.get(`${API_URL}/config`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return response.data.config
  },

  updateConfig: async (key: string, value: string) => {
    const token = authApi.getToken()
    const response = await axios.post(
      `${API_URL}/config`,
      { config_key: key, config_value: value },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
    return response.data
  },
}
