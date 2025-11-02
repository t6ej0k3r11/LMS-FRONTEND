import DOMPurify from "dompurify";

/**
 * Sanitizes HTML content to prevent XSS attacks
 * @param {string} dirty - The potentially unsafe HTML string
 * @returns {string} - The sanitized HTML string
 */
export const sanitizeHtml = (dirty) => {
  if (typeof dirty !== "string") return "";
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      "p",
      "br",
      "strong",
      "em",
      "u",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "ul",
      "ol",
      "li",
      "blockquote",
    ],
    ALLOWED_ATTR: [],
  });
};

/**
 * Sanitizes plain text content
 * @param {string} text - The potentially unsafe text string
 * @returns {string} - The sanitized text string
 */
export const sanitizeText = (text) => {
  if (typeof text !== "string") return "";
  // Remove any HTML tags and encode special characters
  return text.replace(/<[^>]*>/g, "").trim();
};

/**
 * Sanitizes user input for display in React components
 * @param {string} input - The user input to sanitize
 * @param {boolean} allowHtml - Whether to allow basic HTML tags
 * @returns {string} - The sanitized input
 */
export const sanitizeUserInput = (input, allowHtml = false) => {
  if (typeof input !== "string") return "";

  if (allowHtml) {
    return sanitizeHtml(input);
  } else {
    return sanitizeText(input);
  }
};
