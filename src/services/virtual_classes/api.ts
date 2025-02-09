import axios from 'axios';
import { API_BASE_URL } from '../../configs/config';
import { AnyObject } from 'antd/es/_util/type';

export const virtualClassesAPI = {

    generateJitsiToken: async (classId: string, requestBody: AnyObject) => {
        const response = await axios.post(`${API_BASE_URL}/virtual/classes/${classId}/token`, requestBody);
        return response.data;
    },


    createClass: async (requestBody: AnyObject) => {
        const response = await axios.post(`${API_BASE_URL}/virtual/classes`, requestBody);
        return response.data;
    },

    // Fetch the responses submitted for a specific quiz attempt
    getVirtualClassesByCourseId: async (course_id: string) => {
        const response = await axios.get(`${API_BASE_URL}/virtual/classes/course/${course_id}`);
        return response.data;
    },

    getVirtualClassesByLecturerId: async (lecturer_id: string) => {
        const response = await axios.get(`${API_BASE_URL}/virtual/classes/upcoming/${lecturer_id}`);
        return response.data;
    },

    updateClassStatus: async (class_id: string, status: string) => {
        const response = await axios.put(`${API_BASE_URL}/virtual/classes/status/${class_id}`, { status });
        return response.data;
    },

    getVirtualClassesByClassId: async (class_id: string) => {
        const response = await axios.get(`${API_BASE_URL}/virtual/classes/class/${class_id}`);
        return response.data;
    },
};
