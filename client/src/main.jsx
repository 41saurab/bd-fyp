import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Toaster } from 'react-hot-toast'
import axios from 'axios'
import App from './App.jsx'
import './index.css'

// Auto-unwrap the backend envelope: { statusMsg, message, data: <payload> }
// so every axios call gets the actual payload directly in response.data
axios.interceptors.response.use(
  (response) => {
    if (
      response.data &&
      typeof response.data === 'object' &&
      'data' in response.data &&
      'statusMsg' in response.data
    ) {
      response.data = response.data.data;
    }
    return response;
  },
  (error) => Promise.reject(error)
);

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } }
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster position="top-right" toastOptions={{
        style: { fontFamily: 'DM Sans, sans-serif', fontSize: '14px' },
        success: { iconTheme: { primary: '#c0392b', secondary: '#fff' } }
      }} />
    </QueryClientProvider>
  </BrowserRouter>
)
