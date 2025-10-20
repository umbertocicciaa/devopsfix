import axios from 'axios';
import { AnalysisRequest, AnalysisResponse } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const api = {
  async analyzePipeline(request: AnalysisRequest): Promise<AnalysisResponse> {
    const response = await axios.post<AnalysisResponse>(`${API_BASE_URL}/analyze`, request);
    return response.data;
  },

  async getProviders(): Promise<string[]> {
    const response = await axios.get<{ providers: string[] }>(`${API_BASE_URL}/providers`);
    return response.data.providers;
  },

  async getCICDTypes(): Promise<string[]> {
    const response = await axios.get<{ cicdTypes: string[] }>(`${API_BASE_URL}/cicd-types`);
    return response.data.cicdTypes;
  }
};
