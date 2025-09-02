import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usersAPI, followsAPI, cvsAPI, postsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import FollowModal from '../components/FollowModal';
import PostCard from '../components/PostCard';
import CVViewerModal from '../components/CVViewerModal';
import ConfirmDialog from '../components/ConfirmDialog';
import notify from '../utils/notify';

const Profile = () => {
    const { id } = useParams();
    const { user: authUser } = useAuth();
    const effectiveId = id || authUser?.id;
    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followersCount, setFollowersCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [showFollowers, setShowFollowers] = useState(false);
    const [showFollowing, setShowFollowing] = useState(false);
    const [cvUrl, setCvUrl] = useState('');
    const [showCVModal, setShowCVModal] = useState(false);
    const [confirmUnfollow, setConfirmUnfollow] = useState(false);

    const isOwnProfile = authUser && (!id || String(authUser.id) === String(effectiveId));

    useEffect(() => {
        loadUser();
    }, [effectiveId]);

    const loadUser = async () => {
        try {
            setLoading(true);
            const [userRes, postsRes] = await Promise.all([
                usersAPI.getUser(effectiveId),
                postsAPI.getUserPosts(effectiveId)
            ]);
            const u = userRes.data;
            setUser(u);
            setPosts(postsRes.data.posts || []);
            setIsFollowing(!!u.is_following);
            setFollowersCount(u.followers_count || 0);
            setFollowingCount(u.following_count || 0);
        } catch (error) {
            console.error('Error loading profile:', error);
            notify.error('Không thể tải thông tin người dùng');
        } finally {
            setLoading(false);
        }
    };

    const toggleFollow = async () => {
        if (!authUser) return;
        try {
            if (isFollowing) {
                setConfirmUnfollow(true);
            } else {
                await followsAPI.follow(effectiveId);
                setIsFollowing(true);
                setFollowersCount((c) => c + 1);
            }
        } catch (error) {
            console.error('Follow error:', error);
            notify.error('Không thể theo dõi');
        }
    };

    const confirmUnfollowAction = async () => {
        try {
            await followsAPI.unfollow(effectiveId);
            setIsFollowing(false);
            setFollowersCount((c) => Math.max(0, c - 1));
        } catch (error) {
            console.error('Unfollow error:', error);
            notify.error('Không thể hủy theo dõi');
        } finally {
            setConfirmUnfollow(false);
        }
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

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="max-w-3xl mx-auto p-6">
                <p className="text-gray-600">Không tìm thấy người dùng</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="flex items-center gap-4">
                    <img
                        src={user.avatar_url || 'https://i.pravatar.cc/150'}
                        alt={user.name}
                        className="w-20 h-20 rounded-full object-cover"
                    />
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                        <p className="text-gray-600">{user.email}</p>
                        <div className="flex gap-4 mt-2 text-sm text-gray-600">
                            <button onClick={() => setShowFollowers(true)} className="hover:underline">
                                <strong>{followersCount}</strong> người theo dõi
                            </button>
                            <button onClick={() => setShowFollowing(true)} className="hover:underline">
                                Đang theo dõi <strong>{followingCount}</strong>
                            </button>
                        </div>
                    </div>

                    {!isOwnProfile && (
                        <button
                            onClick={toggleFollow}
                            className={`px-4 py-2 rounded-md text-sm font-medium ${isFollowing ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-primary-600 text-white hover:bg-primary-700'}`}
                        >
                            {isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
                        </button>
                    )}
                    {isOwnProfile && (
                        <Link
                            to="/my-cvs"
                            className="px-4 py-2 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
                        >
                            Quản lý CV
                        </Link>
                    )}
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
                            currentUser={authUser}
                            onViewCV={handleViewCV}
                        />
                    ))
                )}
            </div>

            <FollowModal
                open={showFollowers}
                onClose={() => setShowFollowers(false)}
                userId={effectiveId}
                type="followers"
            />
            <FollowModal
                open={showFollowing}
                onClose={() => setShowFollowing(false)}
                userId={effectiveId}
                type="following"
            />

            {showCVModal && (
                <CVViewerModal
                    cvUrl={cvUrl}
                    onClose={() => {
                        setShowCVModal(false);
                        setCvUrl('');
                    }}
                />
            )}

            <ConfirmDialog
                open={confirmUnfollow}
                title="Hủy theo dõi"
                message={`Bạn có chắc muốn hủy theo dõi ${user.name}?`}
                confirmText="Hủy theo dõi"
                variant="danger"
                onClose={() => setConfirmUnfollow(false)}
                onConfirm={confirmUnfollowAction}
            />
        </div>
    );
};

export default Profile;
