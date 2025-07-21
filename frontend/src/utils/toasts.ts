import { toast } from '@/hooks/use-toast';

export const successToast = (message: string) => {
  toast({
    title: 'Success',
    description: message,
    variant: 'default',
  });
};

export const errorToast = (message: string) => {
  toast({
    title: 'Error',
    description: message,
    variant: 'destructive',
  });
};
export const infoToast = (message: string) => {
  toast({
    title: 'Info',
    description: message,
    variant: 'info',
  });
};
