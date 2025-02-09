import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { message } from 'antd';
import { API_BASE_URL } from "../../configs/config.ts";
import { StudentAcademicProfile } from '../../models/student_academic_profile.ts';

interface AuthContextType {
    isAuthenticated: boolean;
    student: StudentAcademicProfile | null;
    loading: boolean;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
}


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [student, setStudent] = useState<StudentAcademicProfile | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        // Check for existing auth token on mount
        const token = localStorage.getItem('authToken');
        const studentId = localStorage.getItem('studentId');

        if (token) {
            if (studentId) {
                fetchStudentData(studentId).then(() => {

                });
            } else {
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    }, []);

    const fetchStudentData = async (studentId: string) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/student/${studentId}/profile`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('authToken')}`
                }
            });
            setStudent(response.data.data);
            setIsAuthenticated(true);
        } catch (error) {
            console.error('Error fetching student data:', error);
            logout();
        } finally {
            setLoading(false);
        }
    };

    const login = async (username: string, password: string) => {
        try {
            setLoading(true);
            // Make login request
            const response = await axios.post(`${API_BASE_URL}/auth/login`, {
                username,
                password
            });

            console.log(response.data);

            const token = response.data.token;
            const student: StudentAcademicProfile = response.data.profile;

            // Store token and student ID
            localStorage.setItem('authToken', token);
            localStorage.setItem('studentId', student.student_id);

            // Set up axios default headers
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            // Fetch student data
            setStudent(student);
            setIsAuthenticated(true);
            message.success('Successfully logged in!');
        } catch (error) {
            console.error('Login error:', error);
            message.error('Invalid credentials or server error');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('studentId');
        delete axios.defaults.headers.common['Authorization'];
        setIsAuthenticated(false);
        setStudent(null);
        message.success('Successfully logged out');
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, student, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};


export const AuthContext = createContext<AuthContextType | undefined>(undefined);

