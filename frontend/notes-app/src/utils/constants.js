    //export const BASE_URL = 'http://localhost:8000'
    // export const BASE_URL = 'https://notes-app-p13k.onrender.com'
export const BASE_URL = 
  process.env.REACT_APP_API_BASE_URL ||  // Ưu tiên dùng biến môi trường nếu tồn tại
  (process.env.NODE_ENV === 'production' 
    ? 'https://notes-app-p13k.onrender.com'  // Fallback 1: Production URL
    : 'http://localhost:8000');              // Fallback 2: Localhost
