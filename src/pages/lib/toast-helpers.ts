import { toast } from 'sonner';

export const showSuccessToast = (message: string, description?: string) => {
  toast.success(message, {
    description,
    duration: 3000,
    className: 'animate-success',
  });
};

export const showErrorToast = (message: string, description?: string) => {
  toast.error(message, {
    description,
    duration: 4000,
  });
};

export const showWarningToast = (message: string, description?: string) => {
  toast.warning(message, {
    description,
    duration: 3500,
  });
};

export const showInfoToast = (message: string, description?: string) => {
  toast.info(message, {
    description,
    duration: 3000,
  });
};

export const showLoadingToast = (message: string) => {
  return toast.loading(message, {
    duration: Infinity,
  });
};

export const dismissToast = (toastId: string | number) => {
  toast.dismiss(toastId);
};

export const showPromiseToast = <T,>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string;
    error: string;
  }
) => {
  return toast.promise(promise, {
    loading: messages.loading,
    success: () => messages.success,
    error: messages.error,
    className: 'animate-success',
  });
};
