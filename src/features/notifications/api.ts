import api from "@/src/lib/api/client";
import { API_ENDPOINTS } from "@/src/lib/api/endpoints";

export const notificationsApi = {
  list() {
    return api.get(API_ENDPOINTS.dashboard.notifications);
  },

  markRead(id: string) {
    return api.post(API_ENDPOINTS.dashboard.notificationRead(id));
  },

  markAllRead(notificationIds: string[]) {
    return api.post(API_ENDPOINTS.dashboard.notificationsReadAll, { notificationIds });
  },
};

