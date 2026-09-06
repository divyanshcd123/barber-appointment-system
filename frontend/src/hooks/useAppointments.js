import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export const useAppointments = (role) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAppointments = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const endpoint = role === 'barber' ? '/appointments/barber' : '/appointments/my';
      const { data } = await api.get(endpoint, { params });
      setAppointments(data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    if (role !== 'admin') fetchAppointments();
  }, [fetchAppointments, role]);

  const createAppointment = async (appointmentData) => {
    try {
      const { data } = await api.post('/appointments', appointmentData);
      toast.success('Appointment booked successfully! 🎉');
      await fetchAppointments();
      return { success: true, data: data.data };
    } catch (err) {
      const msg = err.response?.data?.message || 'Booking failed';
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  const updateStatus = async (id, status, reason = '') => {
    try {
      await api.put(`/appointments/${id}/status`, { status, cancellationReason: reason });
      const labels = { confirmed: 'confirmed', completed: 'marked as complete', cancelled: 'cancelled' };
      toast.success(`Appointment ${labels[status] || status}`);
      await fetchAppointments();
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Update failed';
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  const submitReview = async (appointmentId, rating, comment) => {
    try {
      await api.post(`/appointments/${appointmentId}/review`, { rating, comment });
      toast.success('Review submitted! Thank you ⭐');
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Review submission failed';
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  return { appointments, loading, error, fetchAppointments, createAppointment, updateStatus, submitReview };
};
