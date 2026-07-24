import { dashboardRepository } from "../repositories/dashboard.repository";

export const dashboardService = {
  stats(userId: string) {
    return dashboardRepository.founderStats(userId);
  },
};
