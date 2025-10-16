import { useState, useEffect, useCallback } from 'react';
import { getCorrespondenceById, getUsers } from '../services/api';
import { Correspondence, User } from '../types';

export const useCorrespondence = (id: string | undefined) => {
    const [correspondence, setCorrespondence] = useState<Correspondence | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchData = useCallback(async () => {
        if (!id) return;
        
        setLoading(true);
        setError('');

        try {
            const [docData, usersData] = await Promise.all([
                getCorrespondenceById(Number(id)),
                getUsers()
            ]);

            if (docData) {
                setCorrespondence(docData);
                setUsers(usersData);
            } else {
                setError('Hujjat topilmadi.');
            }
        } catch (err) {
            setError('Hujjatni yuklashda xatolik yuz berdi.');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { correspondence, setCorrespondence, users, loading, error, refetch: fetchData };
};