import http from "@/shared/services/http-common.js";

export class ContractsService {
  // Contract Templates
  async createContractTemplate(title, content, userId, category = 'standard', isDefault = false) {
    const response = await http.post('/contract-templates', {
      title,
      content,
      userId,
      category,
      isDefault
    });
    return response.data;
  }

  async duplicateContractTemplate(templateId, newTitle) {
    const original = await this.getContractTemplateById(templateId);
    const response = await http.post('/contract-templates', {
      title: newTitle || `${original.title} (Copia)`,
      content: original.content,
      userId: original.userId,
      category: original.category || 'standard',
      isDefault: false
    });
    return response.data;
  }

  async getContractTemplateById(templateId) {
    const response = await http.get(`/contract-templates/${templateId}`);
    return response.data;
  }

  async getContractTemplatesByUserId(userId) {
    const response = await http.get(`/contract-templates/user/${userId}`);
    return response.data;
  }

  async updateContractTemplate(templateId, title, content, category = null, isDefault = null) {
    const data = { title, content };
    if (category !== null) data.category = category;
    if (isDefault !== null) data.isDefault = isDefault;
    const response = await http.put(`/contract-templates/${templateId}`, data);
    return response.data;
  }

  async setDefaultTemplate(templateId, userId) {
    // First, unset any existing default for this user
    const templates = await this.getContractTemplatesByUserId(userId);
    for (const template of templates) {
      if (template.isDefault && template.id !== templateId) {
        await this.updateContractTemplate(template.id, template.title, template.content, template.category, false);
      }
    }
    // Then set the new default
    const template = await this.getContractTemplateById(templateId);
    return await this.updateContractTemplate(templateId, template.title, template.content, template.category, true);
  }

  async getTemplatesByCategory(userId, category) {
    const templates = await this.getContractTemplatesByUserId(userId);
    return templates.filter(t => t.category === category);
  }

  async deleteContractTemplate(templateId) {
    await http.delete(`/contract-templates/${templateId}`);
  }

  // Contract Instances
  async createContractInstance(data) {
    const response = await http.post('/contract-instances', data);
    return response.data;
  }

  async getContractInstanceById(instanceId) {
    const response = await http.get(`/contract-instances/${instanceId}`);
    return response.data;
  }

  async getContractInstancesByUserId(userId) {
    const response = await http.get(`/contract-instances/user/${userId}`);
    return response.data;
  }

  async getContractInstanceByReservationId(reservationId) {
    const response = await http.get(`/contract-instances/reservation/${reservationId}`);
    return response.data;
  }

  async signContract(instanceId, userId) {
    const response = await http.post(`/contract-instances/${instanceId}/sign`, null, {
      params: { userId }
    });
    return response.data;
  }

  async signContractWithSignature(instanceId, signatureData) {
    const response = await http.post(`/contract-instances/${instanceId}/sign-digital`, {
      signerName: signatureData.signerName,
      signatureImage: signatureData.signatureImage,
      signedAt: signatureData.signedAt,
      ipAddress: await this.getClientIP(),
      userAgent: navigator.userAgent
    });
    return response.data;
  }

  async getClientIP() {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  }

  async cancelContract(instanceId, userId) {
    const response = await http.post(`/contract-instances/${instanceId}/cancel`, null, {
      params: { userId }
    });
    return response.data;
  }

  async downloadContractPdf(instanceId) {
    const response = await http.get(`/contract-instances/${instanceId}/pdf`, {
      responseType: 'blob'
    });
    return response.data;
  }

  async getContractSignatureInfo(instanceId) {
    const response = await http.get(`/contract-instances/${instanceId}/signature-info`);
    return response.data;
  }
}
