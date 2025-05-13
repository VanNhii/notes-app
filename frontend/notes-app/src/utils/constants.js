    //export const BASE_URL = 'http://localhost:8000'
    // export const BASE_URL = 'https://notes-app-p13k.onrender.com'
    export const BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://notes-app-p13k.onrender.com'
  : 'http://localhost:8000';
