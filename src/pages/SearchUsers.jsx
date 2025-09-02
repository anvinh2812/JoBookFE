import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { usersAPI } from '../services/api';

const SearchUsers = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [keyword, setKeyword] = useState(searchParams.get('q') || '');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const q = searchParams.get('q') || '';
        setKeyword(q);
        if (q) search(q);
    }, []);

    const search = async (q) => {
        try {
            setLoading(true);
            const res = await usersAPI.searchUsers({ q });
            setResults(res.data.users || []);
        } catch (error) {
            console.error('Search error', error);
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = (e) => {
        e.preventDefault();
        setSearchParams({ q: keyword });
        if (keyword.trim()) search(keyword.trim());
    };

    return (
        <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Tìm người dùng</h1>
            <form onSubmit={onSubmit} className="flex gap-2 mb-6">
                <input
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-md"
                    placeholder="Nhập tên hoặc email..."
                />
                <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md">Tìm kiếm</button>
            </form>

            {loading ? (
                <div>Đang tìm...</div>
            ) : results.length === 0 ? (
                <div className="text-gray-600">Không có kết quả</div>
            ) : (
                <ul className="space-y-3">
                    {results.map((u) => (
                        <li key={u.id} className="bg-white rounded-md shadow p-3 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-300" />
                            <div className="flex-1">
                                <div className="font-medium">{u.full_name || u.name}</div>
                                <div className="text-sm text-gray-600">{u.email}</div>
                            </div>
                            <Link to={`/users/${u.id}`} className="text-primary-600 hover:underline">Xem</Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default SearchUsers;
