import axios from '@/utils/axios';
import { ip3 } from '@/utils/ip';

export async function getAllTags() {
  return axios.get(`${ip3}/tags/all`);
}

export async function getTagsPage(query?: Tags.IQuery) {
  return axios.get(`${ip3}/tags/page`, { params: query });
}

export async function getTagById(id: string) {
  return axios.get(`${ip3}/tags/${id}`);
}
