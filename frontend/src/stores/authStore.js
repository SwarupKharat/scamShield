
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { axiosInstance } from "./axios";
import toast from "react-hot-toast";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      authUser: null,
      authRole: null,
      isSigningIn: false,
      isAccepting: false,
      isLoggingIn: false,
      isUpdating: false,
      isCheckingApproval: false,
      isReportingIncident: false,
      incidents: [],
      registrations: [],
      notifications: [],

      initializeAuth: async () => {
        try {
          const response = await axiosInstance.get('/auth/me');
          if (response.data.success) {
            set({
              authUser: response.data.user,
              authRole: response.data.user.role || null
            });
          } else {
            set({ authUser: null, authRole: null });
          }
        } catch (error) {
          set({ authUser: null, authRole: null });
        }
      },

      login: async (data) => {
        set({ isLoggingIn: true });
        try {
          const res = await axiosInstance.post('/auth/login', data);
          if (res.data.success) {
            toast.success("Login successful!");
            set({
              authUser: res.data.user,
              authRole: res.data.user.role || null
            });

            const userRole = res.data.user.role;
            if (userRole === 'admin') {
              window.location.href = '/admin-dashboard';
            } else if (userRole === 'authority') {
              window.location.href = '/authority-dashboard';
            } else if (userRole === 'user') {
              window.location.href = '/user-dashboard';
            }
          } else {
            toast.error(res.data.message);
          }
        } catch (error) {
          const errorMessage = error.response?.data?.message || "Login failed!";
          toast.error(errorMessage);
        } finally {
          set({ isLoggingIn: false });
        }
      },

      register: async (data) => {
        set({ isSigningIn: true });
        try {
          const res = await axiosInstance.post("/auth/signup", data);
          if (res.data.success) {
            toast.success(res.data.message);
          } else {
            toast.error(res.data.message);
          }
        } catch (error) {
          const errorMessage = error.response?.data?.message || "Registration failed!";
          toast.error(errorMessage);
        } finally {
          set({ isSigningIn: false });
        }
      },

      logout: async () => {
        try {
          const res = await axiosInstance.post('/auth/logout');
          set({ authUser: null, incidents: [] });
          if (res.data?.success) {
            toast.success("Logout successful");
          }
        } catch (error) {
          const errorMessage = error.response?.data?.message || "Logout failed!";
          toast.error(errorMessage);
        }
      },

      checkApproval: async (data) => {
        set({ isCheckingApproval: true });
        try {
          const res = await axiosInstance.post('/auth/check-approval', data);
          if (res.data.success) {
            toast.success(res.data.message);
          } else {
            toast.error(res.data.message);
          }
        } catch (error) {
          toast.error(error.response?.data?.message || "Internal Server Error!");
        } finally {
          set({ isCheckingApproval: false });
        }
      },

      reportIncident: async (data) => {
        set({ isReportingIncident: true });
        try {
          const res = await axiosInstance.post("/auth/report-incident", data);
          if (res.data.success) {
            toast.success("Incident reported successfully! We'll review it shortly.");
          } else {
            toast.error(res.data.message);
          }
        } catch (error) {
          toast.error(error.response?.data?.message || "Error in reporting! Try again.");
        } finally {
          set({ isReportingIncident: false });
        }
      },

      findUser: async (id) => {
        try {
          const res = await axiosInstance.get(`/authority/user/${id}`);
          return res.data.user;
        } catch (error) {
          return null;
        }
      },

      viewIncidents: async () => {
        try {
          const res = await axiosInstance.get('/authority/view-incidents');
          if (Array.isArray(res.data.data)) {
            set({ incidents: res.data.data });
          } else {
            toast.error(res.data.message);
          }
        } catch (error) {
          toast.error("Failed to fetch incidents.");
        }
      },

      viewRegistrations: async () => {
        try {
          const res = await axiosInstance.get('/admin/view-registrations');
          if (Array.isArray(res.data.users)) {
            set({ registrations: res.data.users });
          } else {
            toast.error(res.data.message);
          }
        } catch (error) {
          toast.error("Failed to fetch registrations.");
        }
      },

      acceptUser: async (data) => {
        set({ isAccepting: true });
        try {
          const res = await axiosInstance.post(`/admin/verify/${data.userId}`, { approval: data.approval });
          if (res.data.success) {
            toast.success(data.approval ? "User accepted!" : "User rejected!");
          } else {
            toast.error(res.data.message);
          }
        } catch (error) {
          toast.error("Error in accepting registration!");
        } finally {
          set({ isAccepting: false });
        }
      },

      updateIncident: async (data, incidentId) => {
        set({ isUpdating: true });
        try {
          const res = await axiosInstance.put(`/authority/update-incident/${incidentId}`, data);
          if (res.data.success) {
            toast.success("Updation successful!");
          } else {
            toast.error(res.data.message);
          }
        } catch (error) {
          toast.error("Internal Server Error");
        } finally {
          set({ isUpdating: false });
        }
      },

      getNotifications: async () => {
        try {
          const res = await axiosInstance.get('/auth/notifications');
          if (res.data.success) {
            set({ notifications: res.data.notifications });
            toast.success("Notifications fetched successfully!");
          } else {
            toast.error(res.data.message);
          }
        } catch (error) {
          toast.error("Internal Server Error");
        }
      },

      incident: {},
      viewIncident: async (id) => {
        try {
          const res = await axiosInstance.get(`/auth/view-incident/${id}`);
          if (res.data.success) {
            set({ incident: res.data.incident });
            toast.success("Incident fetched successfully!");
          } else {
            toast.error(res.data.message);
          }
        } catch (error) {
          toast.error("Internal server error!");
        }
      },

      report: {},
      viewReport: async (id) => {
        try {
          const res = await axiosInstance.get(`/auth/view-report/${id}`);
          if (res.data.success) {
            set({ report: res.data.report });
            toast.success(res.data.message);
          } else {
            toast.error(res.data.message);
          }
        } catch (error) {
          toast.error("Internal server error!");
        }
      },

      markIncidentSolved: async (id) => {
        try {
          const res = await axiosInstance.put(`/authority/mark-solved/${id}`);
          if (res.data.success) {
            toast.success(res.data.message || "Incident Marked As Completed");
          } else {
            toast.error(res.data.message);
          }
        } catch (error) {
          toast.error("Internal Server Error!");
        }
      },

      updateProfile: async (data) => {
        try {
          const res = await axiosInstance.put('/auth/update-profile', data);
          if (res.data.success) {
            toast.success('Profile updated successfully!');
            set({ authUser: { ...get().authUser, ...data } });
          } else {
            toast.error(res.data.message || 'Failed to update profile');
          }
        } catch (error) {
          toast.error('Internal Server Error');
        }
      },

      changePassword: async (data) => {
        try {
          const res = await axiosInstance.put('/auth/change-password', data);
          if (res.data.success) {
            toast.success('Password changed successfully!');
          } else {
            toast.error(res.data.message || 'Failed to change password');
          }
        } catch (error) {
          toast.error('Internal Server Error');
        }
      },

      getUserIncidents: async () => {
        try {
          const res = await axiosInstance.get('/auth/user-incidents');
          if (res.data.success) {
            return res.data.incidents;
          } else {
            toast.error(res.data.message || 'Failed to fetch incidents');
            return [];
          }
        } catch (error) {
          toast.error('Internal Server Error');
          return [];
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ authUser: state.authUser, authRole: state.authRole }),
    }
  )
);
