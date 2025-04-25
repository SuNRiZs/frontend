// src/api.js
import axios from 'axios'

// если вы проксируете через Vite (server.proxy) — baseURL оставьте пустым
axios.defaults.baseURL = '/api'
axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.xsrfHeaderName = 'X-CSRFToken'

export default axios
