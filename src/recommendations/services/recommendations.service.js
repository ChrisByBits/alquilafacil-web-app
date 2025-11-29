import http from "@/shared/services/http-common.js";

export class RecommendationsService {
  async getRecommendationsForUser(userId, limit = 10) {
    const response = await http.get(`/recommendations/user/${userId}`, {
      params: { limit }
    });
    return response.data;
  }

  async getSimilarLocals(localId, limit = 10) {
    const response = await http.get(`/recommendations/local/${localId}/similar`, {
      params: { limit }
    });
    return response.data;
  }

  async getRecommendationsByImage(imageUrl, limit = 10) {
    const response = await http.post('/recommendations/by-image', {
      imageUrl,
      limit
    });
    return response.data;
  }
}
