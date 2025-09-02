import toast from 'react-hot-toast';
import errorMessagesVi from './errorMessages.vi';

const resolveMessage = (error, fallback) => {
  if (!error) return fallback || 'Có lỗi xảy ra';
  // Axios error shape
  const backendMessage = error?.response?.data?.message || error?.message;
  if (backendMessage && errorMessagesVi[backendMessage]) {
    return errorMessagesVi[backendMessage];
  }
  if (typeof backendMessage === 'string') return backendMessage;
  return fallback || 'Có lỗi xảy ra';
};

const notify = {
  success: (msg) => toast.success(msg),
  error: (error, fallback) => toast.error(resolveMessage(error, fallback)),
  info: (msg) => toast(msg),
};

export default notify;
