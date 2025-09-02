import React, { useState, useEffect, useMemo } from 'react';
import { postsAPI, cvsAPI, applicationsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import PostCard from '../components/PostCard';
import ApplyModal from '../components/ApplyModal';
import CVViewerModal from '../components/CVViewerModal';
import EditPostModal from '../components/EditPostModal';
import ConfirmDialog from '../components/ConfirmDialog';
import notify from '../utils/notify';

const Home = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 20;
    const [hasMore, setHasMore] = useState(false);
    const [totalPages, setTotalPages] = useState(1);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [pendingStartDate, setPendingStartDate] = useState('');
    const [pendingEndDate, setPendingEndDate] = useState('');
    const isDateFilterActive = useMemo(() => !!startDate || !!endDate, [startDate, endDate]);
    const isPendingInvalid = useMemo(() => (
        pendingStartDate && pendingEndDate && pendingStartDate > pendingEndDate
    ), [pendingStartDate, pendingEndDate]);
    const [pageInput, setPageInput] = useState('1');

    useEffect(() => {
        setPageInput(String(page));
    }, [page]);
    const [selectedPost, setSelectedPost] = useState(null);
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [showCVModal, setShowCVModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingPost, setEditingPost] = useState(null);
    const [cvUrl, setCvUrl] = useState('');
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        setPage(1);
    }, [filter]);

    useEffect(() => {
        setPendingStartDate(startDate || '');
        setPendingEndDate(endDate || '');
    }, [startDate, endDate]);

    useEffect(() => {
        fetchPosts();
    }, [filter, page, startDate, endDate]);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            if (!isDateFilterActive) {
                const params = {
                    ...(filter !== 'all' ? { type: filter } : {}),
                    page,
                    limit: PAGE_SIZE,
                };
                const response = await postsAPI.getPosts(params);
                const data = response.data.posts || [];
                setPosts(data);
                setHasMore(data.length === PAGE_SIZE);
                setTotalPages(1);
                return;
            }

            const all = [];
            let curPage = 1;
            const MAX_PAGES = 100;
            while (curPage <= MAX_PAGES) {
                const params = {
                    ...(filter !== 'all' ? { type: filter } : {}),
                    page: curPage,
                    limit: PAGE_SIZE,
                };
                const res = await postsAPI.getPosts(params);
                const chunk = res.data.posts || [];
                all.push(...chunk);
                if (chunk.length < PAGE_SIZE) break;
                curPage += 1;
            }

            const start = startDate ? new Date(startDate) : null;
            const end = endDate ? new Date(endDate) : null;
            const endNormalized = end ? new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59, 999) : null;
            const filtered = all.filter((p) => {
                const d = new Date(p.created_at);
                if (start && d < start) return false;
                if (endNormalized && d > endNormalized) return false;
                return true;
            });

            const toIsExpired = (p) => {
                if (typeof p.is_expired === 'boolean') return p.is_expired;
                return p.post_type === 'find_candidate' && new Date(p.created_at) < new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
            };
            filtered.sort((a, b) => {
                const aExpired = toIsExpired(a) ? 1 : 0;
                const bExpired = toIsExpired(b) ? 1 : 0;
                if (aExpired !== bExpired) return aExpired - bExpired;

                const aFollow = a.is_following_author ? 0 : 1;
                const bFollow = b.is_following_author ? 0 : 1;
                if (aFollow !== bFollow) return aFollow - bFollow;

                return new Date(b.created_at) - new Date(a.created_at);
            });

            const tp = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
            setTotalPages(tp);

            const effectivePage = Math.min(page, tp);
            if (effectivePage !== page) {
                setPage(effectivePage);
            }

            const startIdx = (effectivePage - 1) * PAGE_SIZE;
            const pageSlice = filtered.slice(startIdx, startIdx + PAGE_SIZE);
            setPosts(pageSlice);
            setHasMore(effectivePage < tp);
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const commitPageInput = () => {
        const raw = parseInt(pageInput, 10);
        if (Number.isNaN(raw) || raw < 1) {
            setPage(1);
            return;
        }
        if (isDateFilterActive) {
            setPage(Math.min(raw, Math.max(1, totalPages)));
        } else {
            setPage(raw);
        }
    };

    const handleApply = (post) => {
        setSelectedPost(post);
        setShowApplyModal(true);
    };

    const handleViewCV = async (cvId) => {
        try {
            const response = await cvsAPI.getCVFile(cvId);
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            setCvUrl(url);
            setShowCVModal(true);
        } catch (error) {
            console.error('Error viewing CV:', error);
            notify.error('Không thể xem CV');
        }
    };

    const handleApplicationSubmit = async (applicationData) => {
        try {
            await applicationsAPI.apply(applicationData);
            setShowApplyModal(false);
            notify.success('Nộp CV thành công!');
        } catch (error) {
            console.error('Error applying:', error);
            notify.error(error, 'Lỗi khi nộp CV');
        }
    };

    const handleEditPost = (post) => {
        setEditingPost(post);
        setShowEditModal(true);
    };

    const handleSavePost = async (postId, postData) => {
        try {
            await postsAPI.updatePost(postId, postData);
            fetchPosts();
            notify.success('Cập nhật bài đăng thành công!');
        } catch (error) {
            console.error('Error updating post:', error);
            throw error;
        }
    };

    const handleDeletePost = async (postId) => {
        setConfirmDeleteId(postId);
    };

    const confirmDelete = async () => {
        if (!confirmDeleteId) return;
        try {
            await postsAPI.deletePost(confirmDeleteId);
            fetchPosts();
            notify.success('Xóa bài đăng thành công!');
        } catch (error) {
            console.error('Error deleting post:', error);
            notify.error('Lỗi khi xóa bài đăng');
        } finally {
            setConfirmDeleteId(null);
        }
    };

    const applyDateFilter = () => {
        if (isPendingInvalid) return;
        setStartDate(pendingStartDate);
        setEndDate(pendingEndDate);
        setPage(1);
    };

    const clearDateFilter = () => {
        setStartDate('');
        setEndDate('');
        setPendingStartDate('');
        setPendingEndDate('');
        setPage(1);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    Trang chủ
                </h1>

                <div className="flex flex-wrap gap-3 items-center mb-6">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-md text-sm font-medium ${filter === 'all'
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        Tất cả
                    </button>
                    <button
                        onClick={() => setFilter('find_job')}
                        className={`px-4 py-2 rounded-md text-sm font-medium ${filter === 'find_job'
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        Tìm việc làm
                    </button>
                    <button
                        onClick={() => setFilter('find_candidate')}
                        className={`px-4 py-2 rounded-md text-sm font-medium ${filter === 'find_candidate'
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        Tuyển dụng
                    </button>

                    <div className="flex items-center gap-2 ml-auto">
                        <label className="text-sm text-gray-600">Từ ngày</label>
                        <input
                            type="date"
                            value={pendingStartDate}
                            onChange={(e) => setPendingStartDate(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') applyDateFilter(); }}
                            className="px-3 py-2 rounded-md bg.gray-100 text-sm"
                        />
                        <label className="text-sm text-gray-600">Đến ngày</label>
                        <input
                            type="date"
                            value={pendingEndDate}
                            onChange={(e) => setPendingEndDate(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') applyDateFilter(); }}
                            className="px-3 py-2 rounded-md bg-gray-100 text-sm"
                        />
                        {isPendingInvalid && (
                            <span className="text-xs text-red-600">Khoảng thời gian không hợp lệ</span>
                        )}
                        <button
                            onClick={applyDateFilter}
                            disabled={isPendingInvalid}
                            className={`px-3 py-2 rounded-md text-sm ${isPendingInvalid ? 'bg-gray-100 text-gray-400' : 'bg-primary-600 text-white hover:bg-primary-700'}`}
                        >
                            Áp dụng
                        </button>
                        {isDateFilterActive ? (
                            <button
                                onClick={clearDateFilter}
                                className="px-3 py-2 rounded-md text-sm bg-red-100 text-red-700 hover:bg-red-200"
                            >
                                Xóa lọc thời gian
                            </button>
                        ) : null}
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {posts.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">Chưa có bài đăng nào</p>
                    </div>
                ) : (
                    posts.map((post) => (
                        <PostCard
                            key={post.id}
                            post={post}
                            currentUser={user}
                            onApply={handleApply}
                            onViewCV={handleViewCV}
                            onEdit={handleEditPost}
                            onDelete={handleDeletePost}
                        />
                    ))
                )}
            </div>

            <div className="flex items-center justify-between mt-8">
                <div className="text-sm text-gray-600">
                    {isDateFilterActive ? (
                        <span>Trang {page} / {totalPages}</span>
                    ) : (
                        <span>Trang {page}</span>
                    )}
                </div>
                <div className="flex gap-2 items-center">
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className={`px-4 py-2 rounded-md text-sm font-medium ${page === 1 ? 'bg-gray-100 text-gray-400' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                        Trang trước
                    </button>
                    <input
                        type="number"
                        min={1}
                        max={isDateFilterActive ? totalPages : undefined}
                        value={pageInput}
                        onChange={(e) => setPageInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') commitPageInput(); }}
                        onBlur={commitPageInput}
                        className="w-20 px-3 py-2 rounded-md bg-white border border-gray-300 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Trang"
                    />
                    <button
                        onClick={() => setPage((p) => p + 1)}
                        disabled={isDateFilterActive ? page >= totalPages : !hasMore}
                        className={`px-4 py-2 rounded-md text-sm font-medium ${(isDateFilterActive ? page >= totalPages : !hasMore) ? 'bg-gray-100 text-gray-400' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                        Trang sau
                    </button>
                </div>
            </div>

            {showApplyModal && (
                <ApplyModal
                    post={selectedPost}
                    onClose={() => setShowApplyModal(false)}
                    onSubmit={handleApplicationSubmit}
                />
            )}

            {showCVModal && (
                <CVViewerModal
                    cvUrl={cvUrl}
                    onClose={() => {
                        setShowCVModal(false);
                        setCvUrl('');
                    }}
                />
            )}

            {showEditModal && editingPost && (
                <EditPostModal
                    post={editingPost}
                    onClose={() => {
                        setShowEditModal(false);
                        setEditingPost(null);
                    }}
                    onSave={handleSavePost}
                />
            )}

            <ConfirmDialog
                open={!!confirmDeleteId}
                title="Xóa bài đăng"
                message="Bạn có chắc chắn muốn xóa bài đăng này? Hành động này không thể hoàn tác."
                confirmText="Xóa"
                variant="danger"
                onClose={() => setConfirmDeleteId(null)}
                onConfirm={confirmDelete}
            />
        </div>
    );
};

export default Home;
