// utils/clientToast.ts
export const showToast = async (type: 'success' | 'error', message: string) => {
  if (typeof window !== 'undefined') {
    const { toast } = await import('sonner');
    toast[type](message);
  }
};
