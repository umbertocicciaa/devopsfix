import axios from 'axios';
import { AnalysisRequest, AnalysisResponse } from '../types';
import { toApiError } from './errors';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const api = {
  async analyzePipeline(request: AnalysisRequest): Promise<AnalysisResponse> {
    try {
      const response = await axios.post<AnalysisResponse>(`${API_BASE_URL}/analyze`, request);
      return response.data;
    } catch (error) {
      throw toApiError(error);
    }
  },

  async getProviders(): Promise<string[]> {
    try {
      const response = await axios.get<{ providers: string[] }>(`${API_BASE_URL}/providers`);
      return response.data.providers;
    } catch (error) {
      throw toApiError(error);
    }
  },

  async getCICDTypes(): Promise<string[]> {
    try {
      const response = await axios.get<{ cicdTypes: string[] }>(`${API_BASE_URL}/cicd-types`);
      return response.data.cicdTypes;
    } catch (error) {
      throw toApiError(error);
    }
  }
};
