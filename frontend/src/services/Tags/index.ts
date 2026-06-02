import axios from '@/utils/axios';
import { ip3 } from '@/utils/ip';

export async function getAllTags() {
  return axios.get(`${ip3}/tags/all`);
}

export async function getTagsPage(query?: { page?: number; limit?: number }) {
  return axios.get(`${ip3}/tags/page`, { 
    params: {
      page: query?.page || 1,
      limit: query?.limit || 12,
    }
  });
}

export async function getPostsByTag(tagName: string, page: number = 1, limit: number = 10) {
  return axios.get(`${ip3}/tags/${tagName}/posts`, { 
    params: { page, limit }
  });
}

export async function getTagById(id: string) {
  return axios.get(`${ip3}/tags/${id}`);
}

export async function getPostsByTag(tagName: string, page?: number, limit?: number) {
  return axios.get(`${ip3}/posts/page`, { 
    params: { 
      tag: tagName,
      page: page || 1,
      limit: limit || 10
    } 
  });
}
