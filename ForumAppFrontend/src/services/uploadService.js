import api from './api';

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function uploadImage(file) {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File is too large. Maximum allowed size is 10MB.');
  }

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Accept': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 413) {
      throw new Error('File is too large. Maximum allowed size is 10MB.');
    }
    throw error.response?.data || 'Error uploading image';
  }
}

export async function deleteImage(imageUrl) {
  try {
    await api.delete('/upload/image', {
      params: { url: imageUrl }
    });
  } catch (error) {
    throw error.response?.data || 'Error deleting image';
  }
}