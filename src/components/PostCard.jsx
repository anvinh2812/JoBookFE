import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const PostCard = ({ post, currentUser, onApply, onViewCV, onEdit, onDelete }) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const isExpired = !!post.is_expired || (post.post_type === 'find_candidate' && new Date(post.created_at) < new Date(Date.now() - 10 * 24 * 60 * 60 * 1000));

    const daysLeft = (() => {
        if (post.post_type !== 'find_candidate') return null;
        const created = new Date(post.created_at).getTime();
        const deadline = created + 10 * 24 * 60 * 60 * 1000;
        const msLeft = deadline - Date.now();
        if (msLeft <= 0) return 0;
        return Math.ceil(msLeft / (24 * 60 * 60 * 1000));
    })();

    const canApply = () => {
        return post.post_type === 'find_candidate' &&
            !isExpired &&
            currentUser.account_type === 'candidate' &&
            post.user_id !== currentUser.id;
    };

    const canViewCV = () => {
        return post.post_type === 'find_job' && post.cv_file_url;
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                    {post.author_avatar ? (
                        <img
                            src={`${post.author_avatar}`}
                            alt={post.author_name}
                            className="h-12 w-12 rounded-full object-cover"
                        />
                    ) : (
                        <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-lg font-medium text-gray-700">
                                {post.author_name?.charAt(0).toUpperCase()}
                            </span>
                        </div>
                    )}
                    <div>
                        {post.user_id === currentUser.id ? (
                            <h3 className="font-semibold text-gray-900">{post.author_name}</h3>
                        ) : (
                            <Link
                                to={`/users/${post.user_id}`}
                                className="font-semibold text-gray-900 hover:text-primary-600 transition-colors"
                            >
                                {post.author_name}
                            </Link>
                        )}
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <span className="bg-gray-100 px-2 py-1 rounded-full text-xs">
                                {post.author_type === 'candidate' ? 'Ứng viên' : 'Doanh nghiệp'}
                            </span>
                            {post.is_following_author && (
                                <span className="bg-primary-100 text-primary-700 px-2 py-1 rounded-full text-xs">
                                    Đang theo dõi
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="text-sm text-gray-500">
                    {formatDate(post.created_at)}
                </div>
            </div>

            <div className="mb-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${post.post_type === 'find_job'
                    ? 'bg-green-100 text-green-800'
                    : (isExpired ? 'bg-gray-200 text-gray-600' : 'bg-blue-100 text-blue-800')
                    }`}>
                    {post.post_type === 'find_job' ? '🔍 Tìm việc làm' : (isExpired ? '⏳ Tuyển dụng (Hết hạn)' : '👥 Tuyển dụng')}
                </span>
                {post.post_type === 'find_candidate' && !isExpired && typeof daysLeft === 'number' && (
                    <span className="ml-2 text-xs text-gray-500">Còn {daysLeft} ngày</span>
                )}
            </div>

            <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {post.title}
                </h2>
                <p className="text-gray-700 whitespace-pre-wrap">
                    {post.description}
                </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex space-x-3">
                    {canViewCV() && (
                        <button
                            onClick={() => onViewCV(post.attached_cv_id)}
                            className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 transition-colors"
                        >
                            Xem CV
                        </button>
                    )}

                    {post.post_type === 'find_candidate' && (
                        <button
                            onClick={() => !isExpired && onApply(post)}
                            disabled={isExpired || !canApply()}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${isExpired || !canApply() ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}
                        >
                            {isExpired ? 'Đã hết hạn' : 'Nộp CV'}
                        </button>
                    )}
                </div>

                {post.user_id === currentUser.id && (
                    <div className="relative">
                        <button
                            onClick={() => setShowDropdown(!showDropdown)}
                            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                        </button>

                        {showDropdown && (
                            <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                                <button
                                    onClick={() => {
                                        onEdit(post);
                                        setShowDropdown(false);
                                    }}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    <div className="flex items-center">
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        Sửa bài đăng
                                    </div>
                                </button>
                                <button
                                    onClick={() => {
                                        onDelete(post.id);
                                        setShowDropdown(false);
                                    }}
                                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                >
                                    <div className="flex items-center">
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        Xóa bài đăng
                                    </div>
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PostCard;
