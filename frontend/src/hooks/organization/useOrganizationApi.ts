// hooks/organization/useOrganizationApi.ts
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useOrganizationApi = (initialApiKey = '') => {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState(initialApiKey);

  const generateApiKey = () => {
    const newKey = `sk_${[...Array(32)]
      .map(() => Math.random().toString(36)[2])
      .join('')}`;
    setApiKey(newKey);
    toast({ title: 'New API Key Generated' });
    return newKey;
  };

  const copyApiKey = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      toast({ title: 'API Key Copied' });
    }
  };

  return {
    apiKey,
    generateApiKey,
    copyApiKey,
  };
};
