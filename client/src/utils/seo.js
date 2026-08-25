const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export async function fetchSeoContent(slug) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/seo/${slug}`
    );

    if (!response.ok) {
      throw new Error(`SEO request failed: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(
        result.message || 'SEO content not found'
      );
    }

    console.log('✅ SEO data received:', result.data);

    return result.data;
  } catch (error) {
    console.error('❌ Failed to fetch SEO content:', error);
    return null;
  }
}
