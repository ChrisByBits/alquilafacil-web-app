import http from "@/shared/services/http-common.js";

export class AvailabilityService {
  // Availability Calendar
  async getCalendarByLocalId(localId) {
    const response = await http.get(`/availability/local/${localId}`);
    return response.data;
  }

  async createCalendar(localId, ownerId) {
    const response = await http.post('/availability', {
      localId,
      ownerId,
      isActive: true
    });
    return response.data;
  }

  async updateCalendar(calendarId, data) {
    const response = await http.put(`/availability/${calendarId}`, data);
    return response.data;
  }

  async toggleCalendarStatus(calendarId) {
    const response = await http.post(`/availability/${calendarId}/toggle`);
    return response.data;
  }

  // Blocked Dates
  async getBlockedDates(calendarId, startDate = null, endDate = null) {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await http.get(`/availability/${calendarId}/blocked-dates`, { params });
    return response.data;
  }

  async addBlockedDate(calendarId, date, reason = '') {
    const response = await http.post(`/availability/${calendarId}/blocked-dates`, {
      date,
      reason
    });
    return response.data;
  }

  async addBlockedDateRange(calendarId, startDate, endDate, reason = '') {
    const response = await http.post(`/availability/${calendarId}/blocked-dates/range`, {
      startDate,
      endDate,
      reason
    });
    return response.data;
  }

  async removeBlockedDate(calendarId, blockedDateId) {
    await http.delete(`/availability/${calendarId}/blocked-dates/${blockedDateId}`);
  }

  async clearBlockedDates(calendarId) {
    await http.delete(`/availability/${calendarId}/blocked-dates`);
  }

  // Availability Rules
  async getAvailabilityRules(calendarId) {
    const response = await http.get(`/availability/${calendarId}/rules`);
    return response.data;
  }

  async addAvailabilityRule(calendarId, rule) {
    const response = await http.post(`/availability/${calendarId}/rules`, rule);
    return response.data;
  }

  async updateAvailabilityRule(calendarId, ruleId, rule) {
    const response = await http.put(`/availability/${calendarId}/rules/${ruleId}`, rule);
    return response.data;
  }

  async deleteAvailabilityRule(calendarId, ruleId) {
    await http.delete(`/availability/${calendarId}/rules/${ruleId}`);
  }

  // Check Availability
  async checkAvailability(localId, startDate, endDate) {
    const response = await http.get(`/availability/check/${localId}`, {
      params: { startDate, endDate }
    });
    return response.data;
  }

  async getAvailableDatesInRange(localId, startDate, endDate) {
    const response = await http.get(`/availability/available-dates/${localId}`, {
      params: { startDate, endDate }
    });
    return response.data;
  }
}
