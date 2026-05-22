import axios from '@/utils/axios';
import { ip3 } from '@/utils/ip';

export async function getDashboardStats() {
  return axios.get(`${ip3}/dashboard/stats`);
}
