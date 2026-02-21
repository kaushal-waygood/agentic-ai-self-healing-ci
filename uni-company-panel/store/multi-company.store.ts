import { create } from 'zustand';
import apiInstance from '@/services/api';

interface SubCompany {
  _id: string;
  name: string;
  industry: string;
  logo?: string;
  contactEmail: string;
  contactPhone: string;
  address: {
    country: string;
    state: string;
    city: string;
  };
  status: 'ACTIVE' | 'INACTIVE';
  memberCount: number;
  jobCount: number;
  createdAt: string;
  parentId?: string;
  type: 'PARENT' | 'CHILD';
}

interface MultiCompanyStore {
  currentCompany: SubCompany | null;
  companies: SubCompany[];
  allCompaniesTree: any[];
  mainOrganization: any;
  loading: boolean;
  error: string | null;
  
  setCurrentCompany: (company: SubCompany) => void;
  getCompanies: () => Promise<void>;
  createCompany: (data: Partial<SubCompany>) => Promise<boolean>;
  updateCompany: (id: string, data: Partial<SubCompany>) => Promise<boolean>;
  deleteCompany: (id: string) => Promise<boolean>;
  switchCompany: (companyId: string) => Promise<void>;
  buildCompanyTree: () => any[];
  getParentCompanies: () => SubCompany[];
  getChildCompanies: (parentId: string) => SubCompany[];
}

const useMultiCompanyStore = create<MultiCompanyStore>((set, get) => ({
  currentCompany: null,
  companies: [],
  allCompaniesTree: [],
  mainOrganization: null,
  loading: false,
  error: null,

  setCurrentCompany: (company) => set({ currentCompany: company }),

  buildCompanyTree: () => {
    const { companies } = get();
    
    if (!companies || companies.length === 0) {
      set({ allCompaniesTree: [] });
      return [];
    }

    const companyMap = new Map<string, any>();
    
    // Initialize with children array
    companies.forEach(company => {
      companyMap.set(company._id, { 
        ...company, 
        children: [],
        isExpanded: false 
      });
    });
    
    // Build tree
    const tree: any[] = [];
    
    companies.forEach(company => {
      const node = companyMap.get(company._id)!;
      
      if (company.parentId && companyMap.has(company.parentId)) {
        companyMap.get(company.parentId)!.children.push(node);
      } else {
        tree.push(node);
      }
    });
    
    set({ allCompaniesTree: tree });
    return tree;
  },

  getParentCompanies: () => {
    const { companies } = get();
    return companies.filter(company => company.type === 'PARENT' || !company.parentId);
  },

  getChildCompanies: (parentId: string) => {
    const { companies } = get();
    return companies.filter(company => company.parentId === parentId);
  },

  getCompanies: async () => {
    try {
      set({ loading: true });
      
      // TEMPORARY MOCK - With hierarchy
      const mockCompanies: SubCompany[] = [
        {
          _id: '1',
          name: 'HappyTech',
          industry: 'Technology',
          type: 'PARENT',
          parentId: undefined,
          contactEmail: 'contact@happytech.com',
          contactPhone: '+91 9876543210',
          address: { country: 'IN', state: 'Delhi', city: 'New Delhi' },
          status: 'ACTIVE',
          memberCount: 12,
          jobCount: 8,
          createdAt: new Date().toISOString(),
        },
        {
          _id: '2',
          name: 'HelpStudy',
          industry: 'Education',
          type: 'CHILD',
          parentId: '1',
          contactEmail: 'info@helpstudy.com',
          contactPhone: '+91 9876543211',
          address: { country: 'IN', state: 'Maharashtra', city: 'Mumbai' },
          status: 'ACTIVE',
          memberCount: 5,
          jobCount: 3,
          createdAt: new Date().toISOString(),
        },
        {
          _id: '3',
          name: 'Zobs',
          industry: 'Recruitment',
          type: 'CHILD',
          parentId: '1',
          contactEmail: 'hr@zobs.com',
          contactPhone: '+91 9876543212',
          address: { country: 'IN', state: 'Karnataka', city: 'Bangalore' },
          status: 'ACTIVE',
          memberCount: 8,
          jobCount: 5,
          createdAt: new Date().toISOString(),
        },
      ];

      set({
        mainOrganization: mockCompanies[0],
        companies: mockCompanies,
        currentCompany: mockCompanies[0],
        loading: false,
      });

      setTimeout(() => {
        get().buildCompanyTree();
      }, 0);
      
    } catch (error) {
      console.error('Error fetching companies:', error);
      set({ loading: false, error: 'Failed to load companies' });
    }
  },

  createCompany: async (data) => {
    try {
      set({ loading: true });
      
      const newCompany: SubCompany = {
        _id: Date.now().toString(),
        name: data.name || 'New Company',
        industry: data.industry || 'Other',
        logo: data.logo as string | undefined,
        contactEmail: data.contactEmail || '',
        contactPhone: data.contactPhone || '',
        address: data.address || { country: 'IN', state: '', city: '' },
        status: 'ACTIVE',
        memberCount: 0,
        jobCount: 0,
        createdAt: new Date().toISOString(),
        type: data.parentId ? 'CHILD' : 'PARENT',
        parentId: data.parentId,
      };

      set((state) => ({
        companies: [...state.companies, newCompany],
        loading: false,
      }));

      // Rebuild tree
      get().buildCompanyTree();
      return true;
      
    } catch (error) {
      console.error('Error creating company:', error);
      set({ loading: false, error: 'Failed to create company' });
      return false;
    }
  },

  updateCompany: async (id, data) => {
    try {
      set({ loading: true });
      
      set((state) => ({
        companies: state.companies.map((comp) =>
          comp._id === id ? { ...comp, ...data } : comp
        ),
        loading: false,
      }));

      // Rebuild tree
      get().buildCompanyTree();
      return true;
      
    } catch (error) {
      console.error('Error updating company:', error);
      set({ loading: false });
      return false;
    }
  },

  deleteCompany: async (id) => {
    try {
      set({ loading: true });
      
      set((state) => ({
        companies: state.companies.filter((comp) => comp._id !== id),
        currentCompany: state.currentCompany?._id === id ? null : state.currentCompany,
        loading: false,
      }));

      // Rebuild tree
      get().buildCompanyTree();
      return true;
      
    } catch (error) {
      console.error('Error deleting company:', error);
      set({ loading: false });
      return false;
    }
  },

  switchCompany: async (companyId) => {
    try {
      set({ loading: true });
      
      const company = get().companies.find(c => c._id === companyId);
      if (company) {
        set({ currentCompany: company, loading: false });
      }
      
    } catch (error) {
      console.error('Error switching company:', error);
      set({ loading: false });
    }
  },
}));

export { useMultiCompanyStore };