import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
    return (
        <div className="max-w-5xl mx-auto py-20">
            <div className="text-center">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4">JoBook</h1>
                <p className="text-lg text-gray-600 mb-8">Nền tảng kết nối ứng viên và nhà tuyển dụng</p>
                <div className="flex justify-center gap-4">
                    <Link
                        to="/register"
                        className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-md"
                    >
                        Đăng ký
                    </Link>
                    <Link
                        to="/login"
                        className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md"
                    >
                        Đăng nhập
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-2">Tạo CV nhanh chóng</h3>
                    <p className="text-gray-600">Chọn mẫu, nhập thông tin và xuất PDF chỉ với vài bước.</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-2">Tìm việc phù hợp</h3>
                    <p className="text-gray-600">Khám phá các bài đăng tuyển dụng mới nhất.</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-2">Kết nối nhà tuyển dụng</h3>
                    <p className="text-gray-600">Theo dõi, tương tác và xây dựng mạng lưới chuyên nghiệp.</p>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
