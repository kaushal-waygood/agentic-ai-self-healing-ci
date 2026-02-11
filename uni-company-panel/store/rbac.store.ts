// // store/rbac.store.ts
// import { create } from 'zustand';
// import apiInstance from '@/services/api';

// export type Role = 'OWNER' | 'HR_MANAGER' | 'RECRUITER' | 'INTERVIEWER' | 'VIEWER';

// export interface TeamMember {
//   _id: string;
//   userId: string;
//   email: string;
//   fullName: string;
//   role: Role;
//   companyId: string;
//   status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
//   permissions: string[];
//   lastActive?: string;
//   joinedAt: string;
// }

// export interface Permission {
//   id: string;
//   name: string;
//   description: string;
//   category: 'JOBS' | 'CANDIDATES' | 'TEAM' | 'ANALYTICS' | 'SETTINGS';
// }

// interface RBACStore {
//   teamMembers: TeamMember[];
//   permissions: Permission[];
//   loading: boolean;
//   error: string | null;
  
//   getTeamMembers: (companyId?: string) => Promise<void>;
//   inviteMember: (data: {
//     email: string;
//     role: Role;
//     companyId?: string;
//     message?: string;
//   }) => Promise<boolean>;
//   updateMemberRole: (memberId: string, role: Role) => Promise<boolean>;
//   removeMember: (memberId: string) => Promise<boolean>;
//   getPermissions: () => Promise<void>;
//   checkPermission: (permissionName: string) => boolean;
// }

// const useRBACStore = create<RBACStore>((set, get) => ({
//   teamMembers: [],
//   permissions: [],
//   loading: false,
//   error: null,

//   getTeamMembers: async (companyId) => {
//     try {
//       set({ loading: true });
//       const url = companyId 
//         ? `/organization/team?companyId=${companyId}`
//         : '/organization/team';
      
//       const response = await apiInstance.get(url);
//       set({ teamMembers: response.data.members || [], loading: false });
//     } catch (error) {
//       console.error('Error fetching team:', error);
//       set({ loading: false, error: 'Failed to load team' });
//     }
//   },

//   inviteMember: async (data) => {
//     try {
//       set({ loading: true });
//       await apiInstance.post('/organization/team/invite', data);
//       set({ loading: false });
//       return true;
//     } catch (error) {
//       console.error('Error inviting member:', error);
//       set({ loading: false, error: 'Failed to send invitation' });
//       return false;
//     }
//   },

//   updateMemberRole: async (memberId, role) => {
//     try {
//       set({ loading: true });
//       await apiInstance.patch(`/organization/team/${memberId}/role`, { role });
      
//       set((state) => ({
//         teamMembers: state.teamMembers.map((member) =>
//           member._id === memberId ? { ...member, role } : member
//         ),
//         loading: false,
//       }));
//       return true;
//     } catch (error) {
//       console.error('Error updating role:', error);
//       set({ loading: false });
//       return false;
//     }
//   },

//   removeMember: async (memberId) => {
//     try {
//       set({ loading: true });
//       await apiInstance.delete(`/organization/team/${memberId}`);
      
//       set((state) => ({
//         teamMembers: state.teamMembers.filter((member) => member._id !== memberId),
//         loading: false,
//       }));
//       return true;
//     } catch (error) {
//       console.error('Error removing member:', error);
//       set({ loading: false });
//       return false;
//     }
//   },

//   getPermissions: async () => {
//     try {
//       const response = await apiInstance.get('/organization/permissions');
//       set({ permissions: response.data.permissions || [] });
//     } catch (error) {
//       console.error('Error fetching permissions:', error);
//     }
//   },

//   checkPermission: (permissionName) => {
//     // Frontend validation - backend se cross-check hoga
//     const userRole = 'OWNER'; // Tum auth store se get karloge
//     const permissionMap = {
//       OWNER: ['*'],
//       HR_MANAGER: ['create_job', 'view_candidates', 'manage_candidates'],
//       RECRUITER: ['view_candidates', 'screen_candidates'],
//       INTERVIEWER: ['view_assigned_candidates'],
//       VIEWER: ['view_jobs', 'view_candidates'],
//     };
    
//     return permissionMap[userRole]?.includes(permissionName) || 
//            permissionMap[userRole]?.includes('*') || 
//            false;
//   },
// }));

// export { useRBACStore };





// store/rbac.store.ts - UPDATED WITH MOCK
import { create } from 'zustand';
import apiInstance from '@/services/api';

export type Role = 'OWNER' | 'HR_MANAGER' | 'RECRUITER' | 'INTERVIEWER' | 'VIEWER';

export interface TeamMember {
  _id: string;
  userId: string;
  email: string;
  fullName: string;
  role: Role;
  companyId: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  permissions: string[];
  lastActive?: string;
  joinedAt: string;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'JOBS' | 'CANDIDATES' | 'TEAM' | 'ANALYTICS' | 'SETTINGS';
}

interface RBACStore {
  teamMembers: TeamMember[];
  permissions: Permission[];
  loading: boolean;
  error: string | null;
  
  getTeamMembers: (companyId?: string) => Promise<void>;
  inviteMember: (data: {
    email: string;
    role: Role;
    companyId?: string;
    message?: string;
  }) => Promise<boolean>;
  updateMemberRole: (memberId: string, role: Role) => Promise<boolean>;
  removeMember: (memberId: string) => Promise<boolean>;
  getPermissions: () => Promise<void>;
  checkPermission: (permissionName: string) => boolean;
}

const useRBACStore = create<RBACStore>((set, get) => ({
  teamMembers: [],
  permissions: [],
  loading: false,
  error: null,

  getTeamMembers: async (companyId) => {
    try {
      set({ loading: true });
      
      // TEMPORARY MOCK DATA
      console.log('Using mock team data for company:', companyId);
      
      const mockTeamMembers: TeamMember[] = [
        {
          _id: 'tm1',
          userId: 'user1',
          email: 'john@happytech.com',
          fullName: 'John Doe',
          role: 'HR_MANAGER',
          companyId: companyId || '1',
          status: 'ACTIVE',
          permissions: ['create_job', 'view_candidates', 'manage_candidates'],
          joinedAt: '2024-01-15T10:30:00Z',
          lastActive: '2024-02-10T15:45:00Z',
        },
        {
          _id: 'tm2',
          userId: 'user2',
          email: 'sarah@happytech.com',
          fullName: 'Sarah Smith',
          role: 'RECRUITER',
          companyId: companyId || '1',
          status: 'ACTIVE',
          permissions: ['view_candidates', 'screen_candidates'],
          joinedAt: '2024-01-20T14:20:00Z',
        },
        {
          _id: 'tm3',
          userId: 'user3',
          email: 'mike@helpstudy.com',
          fullName: 'Mike Johnson',
          role: 'INTERVIEWER',
          companyId: companyId || '2',
          status: 'ACTIVE',
          permissions: ['view_assigned_candidates'],
          joinedAt: '2024-02-01T09:15:00Z',
        },
        {
          _id: 'tm4',
          userId: 'user4',
          email: 'alice@zobs.com',
          fullName: 'Alice Brown',
          role: 'VIEWER',
          companyId: companyId || '3',
          status: 'PENDING',
          permissions: ['view_jobs', 'view_candidates'],
          joinedAt: '2024-02-05T11:00:00Z',
        },
      ];

      // Filter by companyId if provided
      const filteredMembers = companyId 
        ? mockTeamMembers.filter(member => member.companyId === companyId)
        : mockTeamMembers;

      set({ 
        teamMembers: filteredMembers, 
        loading: false 
      });
      
      // UNCOMMENT WHEN BACKEND API IS READY:
      // const url = companyId 
      //   ? `/organization/team?companyId=${companyId}`
      //   : '/organization/team';
      // const response = await apiInstance.get(url);
      // set({ teamMembers: response.data.members || [], loading: false });
      
    } catch (error) {
      console.error('Error fetching team:', error);
      set({ loading: false, error: 'Failed to load team' });
    }
  },

  inviteMember: async (data) => {
    try {
      set({ loading: true });
      
      // TEMPORARY MOCK
      console.log('Mock: Inviting member with data:', data);
      
      const newMember: TeamMember = {
        _id: `tm${Date.now()}`,
        userId: `user${Date.now()}`,
        email: data.email,
        fullName: data.email.split('@')[0],
        role: data.role,
        companyId: data.companyId || '',
        status: 'PENDING',
        permissions: [],
        joinedAt: new Date().toISOString(),
      };

      set((state) => ({
        teamMembers: [...state.teamMembers, newMember],
        loading: false,
      }));
      
      // Show success toast
      alert(`Invitation sent to ${data.email} (Mock)`);
      return true;
      
      // UNCOMMENT WHEN BACKEND API IS READY:
      // await apiInstance.post('/organization/team/invite', data);
      // set({ loading: false });
      // return true;
      
    } catch (error) {
      console.error('Error inviting member:', error);
      set({ loading: false, error: 'Failed to send invitation' });
      return false;
    }
  },

  updateMemberRole: async (memberId, role) => {
    try {
      set({ loading: true });
      
      // TEMPORARY MOCK
      console.log('Mock: Updating role for', memberId, 'to', role);
      
      set((state) => ({
        teamMembers: state.teamMembers.map((member) =>
          member._id === memberId ? { ...member, role } : member
        ),
        loading: false,
      }));
      
      // Show success message
      alert(`Role updated to ${role} (Mock)`);
      return true;
      
      // UNCOMMENT WHEN BACKEND API IS READY:
      // await apiInstance.patch(`/organization/team/${memberId}/role`, { role });
      // set((state) => ({
      //   teamMembers: state.teamMembers.map((member) =>
      //     member._id === memberId ? { ...member, role } : member
      //   ),
      //   loading: false,
      // }));
      // return true;
      
    } catch (error) {
      console.error('Error updating role:', error);
      set({ loading: false });
      return false;
    }
  },

  removeMember: async (memberId) => {
    try {
      set({ loading: true });
      
      // TEMPORARY MOCK
      console.log('Mock: Removing member', memberId);
      
      set((state) => ({
        teamMembers: state.teamMembers.filter((member) => member._id !== memberId),
        loading: false,
      }));
      
      alert('Member removed (Mock)');
      return true;
      
      // UNCOMMENT WHEN BACKEND API IS READY:
      // await apiInstance.delete(`/organization/team/${memberId}`);
      // set((state) => ({
      //   teamMembers: state.teamMembers.filter((member) => member._id !== memberId),
      //   loading: false,
      // }));
      // return true;
      
    } catch (error) {
      console.error('Error removing member:', error);
      set({ loading: false });
      return false;
    }
  },

  getPermissions: async () => {
    try {
      // TEMPORARY MOCK PERMISSIONS
      const mockPermissions: Permission[] = [
        { id: 'p1', name: 'create_job', description: 'Create new job postings', category: 'JOBS' },
        { id: 'p2', name: 'edit_job', description: 'Edit existing job postings', category: 'JOBS' },
        { id: 'p3', name: 'delete_job', description: 'Delete job postings', category: 'JOBS' },
        { id: 'p4', name: 'view_candidates', description: 'View candidate applications', category: 'CANDIDATES' },
        { id: 'p5', name: 'manage_candidates', description: 'Update candidate status', category: 'CANDIDATES' },
        { id: 'p6', name: 'screen_candidates', description: 'Screen and shortlist candidates', category: 'CANDIDATES' },
        { id: 'p7', name: 'view_assigned_candidates', description: 'View assigned candidates only', category: 'CANDIDATES' },
        { id: 'p8', name: 'invite_members', description: 'Invite new team members', category: 'TEAM' },
        { id: 'p9', name: 'manage_roles', description: 'Change team member roles', category: 'TEAM' },
        { id: 'p10', name: 'view_analytics', description: 'View analytics dashboard', category: 'ANALYTICS' },
        { id: 'p11', name: 'view_settings', description: 'View organization settings', category: 'SETTINGS' },
        { id: 'p12', name: 'edit_settings', description: 'Edit organization settings', category: 'SETTINGS' },
      ];

      set({ permissions: mockPermissions });
      
      // UNCOMMENT WHEN BACKEND API IS READY:
      // const response = await apiInstance.get('/organization/permissions');
      // set({ permissions: response.data.permissions || [] });
      
    } catch (error) {
      console.error('Error fetching permissions:', error);
    }
  },

  checkPermission: (permissionName) => {
    // For now, allow everything in mock mode
    return true;
    
    // UNCOMMENT FOR REAL RBAC:
    // const userRole = 'OWNER'; // Get from auth store
    // const permissionMap = {
    //   OWNER: ['*'],
    //   HR_MANAGER: ['create_job', 'view_candidates', 'manage_candidates', 'view_analytics'],
    //   RECRUITER: ['view_candidates', 'screen_candidates'],
    //   INTERVIEWER: ['view_assigned_candidates'],
    //   VIEWER: ['view_jobs', 'view_candidates'],
    // };
    
    // return permissionMap[userRole]?.includes(permissionName) || 
    //        permissionMap[userRole]?.includes('*') || 
    //        false;
  },
}));

export { useRBACStore };