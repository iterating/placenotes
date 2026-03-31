// Lightweight sanitizer for serverless environments (no DOM dependencies)
// This escapes HTML to prevent XSS attacks without requiring jsdom

const escapeHtml = (text) => {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
    '/': '&#x2F;'
  };
  return String(text).replace(/[&<>"'\/]/g, (s) => map[s]);
};

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param {string} dirty - The potentially unsafe HTML string
 * @returns {string} - Sanitized HTML string
 */
export const sanitizeHTML = (dirty) => {
  if (!dirty || typeof dirty !== 'string') {
    return '';
  }
  
  let clean = dirty;
  
  // Remove script tags and their content
  clean = clean.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove event handlers (onclick, onerror, etc.)
  clean = clean.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  clean = clean.replace(/on\w+\s*=\s*[^\s>]*/gi, '');
  
  // Remove javascript: protocol
  clean = clean.replace(/javascript:/gi, '');
  
  // Remove data: protocol (except for images)
  clean = clean.replace(/(<(?!img)[^>]+)\s+src\s*=\s*["']data:[^"']*["']/gi, '$1');
  
  // Escape the cleaned HTML to be safe
  return escapeHtml(clean);
};

/**
 * Sanitize plain text content (removes all HTML)
 * @param {string} dirty - The potentially unsafe text string
 * @returns {string} - Plain text string
 */
export const sanitizeText = (dirty) => {
  if (!dirty || typeof dirty !== 'string') {
    return '';
  }
  // Remove all HTML tags and escape
  return escapeHtml(dirty.replace(/<[^>]*>/g, ''));
};

export default {
  sanitizeHTML,
  sanitizeText
};
