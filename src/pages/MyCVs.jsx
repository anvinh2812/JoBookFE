import React, { useEffect, useState } from 'react';
import { cvsAPI } from '../services/api';
import CVViewerModal from '../components/CVViewerModal';
import ConfirmDialog from '../components/ConfirmDialog';
import notify from '../utils/notify';

const MyCVs = () => {
    const [cvs, setCvs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCVModal, setShowCVModal] = useState(false);
    const [cvUrl, setCvUrl] = useState('');
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);

    useEffect(() => {
        loadMyCVs();
    }, []);

    const loadMyCVs = async () => {
        try {
            setLoading(true);
            const res = await cvsAPI.getCVs();
            setCvs(res.data.cvs || []);
        } catch (error) {
            console.error('Error loading CVs', error);
        } finally {
            setLoading(false);
        }
    };

    const handleView = async (cvId) => {
        try {
            const response = await cvsAPI.getCVFile(cvId);
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            setCvUrl(url);
            setShowCVModal(true);
        } catch (error) {
            console.error('Error viewing CV', error);
            notify.error('Không thể xem CV');
        }
    };

    const handleDelete = (cvId) => setConfirmDeleteId(cvId);

    const confirmDelete = async () => {
        if (!confirmDeleteId) return;
        try {
            await cvsAPI.deleteCV(confirmDeleteId);
            setCvs((list) => list.filter((cv) => cv.id !== confirmDeleteId));
            notify.success('Xóa CV thành công');
        } catch (error) {
            notify.error('Xóa CV thất bại');
        } finally {
            setConfirmDeleteId(null);
        }
    };

    const handleToggleActive = async (cvId, nextActive) => {
        try {
            await cvsAPI.toggleCV(cvId);
            setCvs((list) => list.map((cv) => (cv.id === cvId ? { ...cv, is_active: nextActive } : cv)));
        } catch (error) {
            notify.error('Cập nhật trạng thái thất bại');
        }
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
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">CV của tôi</h1>
                <a href="/create-cv" className="px-4 py-2 rounded-md bg-primary-600 text-white hover:bg-primary-700">Tạo CV mới</a>
            </div>

            {cvs.length === 0 ? (
                <div className="text-center py-16 text-gray-600">Chưa có CV nào</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {cvs.map((cv) => (
                        <div key={cv.id} className="bg-white rounded-lg shadow p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold text-gray-900">{cv.title || 'CV không tên'}</h3>
                                    <p className="text-sm text-gray-600">Tải lên: {new Date(cv.created_at).toLocaleString()}</p>
                                </div>
                                <span className={`px-2 py-1 rounded text-xs ${cv.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                    {cv.is_active ? 'Đang bật' : 'Đã tắt'}
                                </span>
                            </div>

                            <div className="flex gap-2 mt-3">
                                <button onClick={() => handleView(cv.id)} className="px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200">Xem</button>
                                <button onClick={() => handleToggleActive(cv.id, !cv.is_active)} className="px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200">
                                    {cv.is_active ? 'Tắt' : 'Bật'}
                                </button>
                                <button onClick={() => handleDelete(cv.id)} className="px-3 py-2 rounded-md bg-red-100 text-red-700 hover:bg-red-200">Xóa</button>
                            </div>
                        </div>
                    ))}
                </div>
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

            <ConfirmDialog
                open={!!confirmDeleteId}
                title="Xóa CV"
                message="Bạn có chắc chắn muốn xóa CV này?"
                confirmText="Xóa"
                variant="danger"
                onClose={() => setConfirmDeleteId(null)}
                onConfirm={confirmDelete}
            />
        </div>
    );
};

export default MyCVs;
