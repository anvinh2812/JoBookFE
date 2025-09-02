import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
    const { register } = useAuth();
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [accountType, setAccountType] = useState('job_seeker');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await register({ name, email, password, account_type: accountType });
            navigate('/');
        } catch (err) {
            setError('Đăng ký thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto py-16">
            <h1 className="text-2xl font-bold mb-6">Đăng ký</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm text-gray-700 mb-1">Họ tên</label>
                    <input
                        type="text"
                        className="w-full px-3 py-2 border rounded-md"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm text-gray-700 mb-1">Email</label>
                    <input
                        type="email"
                        className="w-full px-3 py-2 border rounded-md"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm text-gray-700 mb-1">Mật khẩu</label>
                    <input
                        type="password"
                        className="w-full px-3 py-2 border rounded-md"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm text-gray-700 mb-1">Loại tài khoản</label>
                    <select
                        className="w-full px-3 py-2 border rounded-md"
                        value={accountType}
                        onChange={(e) => setAccountType(e.target.value)}
                    >
                        <option value="job_seeker">Ứng viên</option>
                        <option value="company">Nhà tuyển dụng</option>
                    </select>
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full px-4 py-2 rounded-md text-white ${loading ? 'bg-gray-400' : 'bg-primary-600 hover:bg-primary-700'}`}
                >
                    {loading ? 'Đang xử lý...' : 'Đăng ký'}
                </button>
            </form>

            <p className="text-sm text-gray-600 mt-4">
                Đã có tài khoản?{' '}
                <Link to="/login" className="text-primary-600 hover:underline">Đăng nhập</Link>
            </p>
        </div>
    );
};

export default Register;
