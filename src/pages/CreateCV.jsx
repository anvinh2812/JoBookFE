import React, { useEffect, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import CVPreview from '../components/CVPreview';
import { cvsAPI } from '../services/api';
import notify from '../utils/notify';

const defaultData = {
    fullName: '',
    email: '',
    phone: '',
    position: '',
    summary: '',
    avatar: '',
    experienceList: [{ time: '', company: '', position: '', details: '' }],
    educationList: [{ time: '', school: '', major: '', result: '', note: '' }],
    activityList: [{ time: '', org: '', role: '', details: '' }],
    skills: '',
    certificates: '',
    projects: [{ name: '', tech: '', desc: '' }],
};

const CreateCV = () => {
    const [data, setData] = useState(defaultData);
    const [templateStyle, setTemplateStyle] = useState('ats');
    const [isExporting, setIsExporting] = useState(false);
    const previewRef = useRef(null);

    const onChange = (e) => {
        setData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const onListChange = (listName, index, field, value) => {
        setData((prev) => {
            const list = [...(prev[listName] || [])];
            list[index] = { ...list[index], [field]: value };
            return { ...prev, [listName]: list };
        });
    };

    const onAddList = (listName, item) => {
        setData((prev) => ({ ...prev, [listName]: [...(prev[listName] || []), item] }));
    };

    const onRemoveList = (listName, index) => {
        setData((prev) => {
            const list = [...(prev[listName] || [])];
            list.splice(index, 1);
            return { ...prev, [listName]: list };
        });
    };

    const onAvatarChange = (file) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => setData((prev) => ({ ...prev, avatar: reader.result }));
        reader.readAsDataURL(file);
    };

    const exportPDF = async () => {
        if (!previewRef.current) return;
        try {
            setIsExporting(true);
            await new Promise((r) => setTimeout(r, 100));
            const node = previewRef.current;
            const canvas = await html2canvas(node, { scale: 2, useCORS: true });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'pt', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
            const imgWidth = canvas.width * ratio;
            const imgHeight = canvas.height * ratio;
            const x = (pageWidth - imgWidth) / 2;
            const y = 20;
            pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
            const pdfBlob = pdf.output('blob');

            const formData = new FormData();
            formData.append('file', pdfBlob, 'cv.pdf');
            await cvsAPI.uploadCV(formData);
            notify.success('Tải lên CV thành công');
        } catch (error) {
            console.error('Export error', error);
            notify.error('Xuất PDF thất bại');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">Tạo CV</h1>
                <div className="flex gap-2">
                    <select
                        value={templateStyle}
                        onChange={(e) => setTemplateStyle(e.target.value)}
                        className="px-3 py-2 border rounded-md"
                    >
                        <option value="ats">ATS đơn giản</option>
                        <option value="hienDai">Hiện đại</option>
                        <option value="classicOne">Classic One</option>
                        <option value="classicRed">Classic Red</option>
                        <option value="sidebarV2">Sidebar V2</option>
                        <option value="sidebarV3">Sidebar V3</option>
                        <option value="sidebarPastel">Sidebar Pastel</option>
                        <option value="caoCap">Cao cấp</option>
                        <option value="chuyenNghiep">Chuyên nghiệp</option>
                        <option value="senior">Senior</option>
                    </select>
                    <button onClick={exportPDF} className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">Xuất PDF & Tải lên</button>
                </div>
            </div>

            <div ref={previewRef} className="bg-white shadow rounded p-6">
                <CVPreview
                    data={data}
                    onChange={onChange}
                    onListChange={onListChange}
                    onAddList={onAddList}
                    onRemoveList={onRemoveList}
                    templateStyle={templateStyle}
                    isExporting={isExporting}
                    onAvatarChange={onAvatarChange}
                />
            </div>
        </div>
    );
};

export default CreateCV;
