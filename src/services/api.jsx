import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const getCustomers = () => axios.get(`${BASE_URL}/api/allCustomer`);
export const getTechnicians = () => axios.get(`${BASE_URL}/api/getTech`);
export const getAdmin = () => axios.get(`${BASE_URL}/api/getAdmin`);
export const getWaitForApprove = () => axios.get(`${BASE_URL}/api/waitApprove`);
export const getCustomerById = (id) => axios.get(`${BASE_URL}/api/getCustomerById/${id}`);
export const deleteCustomer = (id) => axios.delete(`${BASE_URL}/api/deleteCustomer/${id}`);
export const deleteTechnician = (id) => axios.delete(`${BASE_URL}/api/deleteTechnician/${id}`);
export const deleteAdmin = (id) => axios.delete(`${BASE_URL}/api/deleteAdmin/${id}`);
// เพิ่มอื่น ๆ ได้ตามต้องการ
