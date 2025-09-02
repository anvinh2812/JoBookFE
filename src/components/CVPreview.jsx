import React from 'react';

// NOTE: This is a trimmed port covering key templates (ATS + HienDai). Add more templates as needed.

const Section = ({ title, children }) => (
    <section className="mb-6">
        <div className="uppercase font-bold text-base border-b-2 border-gray-300 pb-1 mb-2 tracking-wide">{title}</div>
        {children}
    </section>
);

const CVPreview = ({ data, onChange, onListChange, onAddList, onRemoveList, templateStyle, isExporting, onAvatarChange }) => {
    if (templateStyle === 'ats') {
        return (
            <div className="bg-white w-full max-w-[820px] mx-auto p-8 border border-gray-300" style={{ fontFamily: 'Arial, Calibri, Helvetica, sans-serif', fontSize: '14px', color: '#111' }}>
                <div className="mb-4">
                    <div className="text-2xl font-bold tracking-tight">
                        {isExporting ? (data.fullName || 'Họ và tên') : (
                            <input type="text" name="fullName" value={data.fullName} onChange={onChange} placeholder="Họ và tên" className="w-full border-b border-gray-400 focus:border-gray-700 outline-none bg-transparent font-bold text-2xl" />
                        )}
                    </div>
                    <div className="text-sm text-gray-700 mt-1">
                        {isExporting ? (
                            <span>{data.email || 'Email'} • {data.phone || 'Số điện thoại'}</span>
                        ) : (
                            <div className="flex gap-4 items-center">
                                <input type="email" name="email" value={data.email} onChange={onChange} placeholder="Email" className="bg-transparent outline-none border-b border-gray-400 focus:border-gray-700" />
                                <input type="text" name="phone" value={data.phone} onChange={onChange} placeholder="Số điện thoại" className="bg-transparent outline-none border-b border-gray-400 focus:border-gray-700" />
                            </div>
                        )}
                    </div>
                </div>
                <div className="border-t border-gray-300 my-3" />
                <Section title="Tóm tắt">
                    {isExporting ? (
                        <div className="whitespace-pre-line text-[13.5px]">{data.summary}</div>
                    ) : (
                        <textarea name="summary" value={data.summary} onChange={onChange} rows={4} placeholder="Tóm tắt hồ sơ phù hợp ATS" className="w-full border-b border-gray-400 focus:border-gray-700 outline-none text-[13.5px]" />
                    )}
                </Section>
                <Section title="Kinh nghiệm làm việc">
                    {data.experienceList?.map((exp, idx) => (
                        <div key={idx} className="mb-3">
                            <div className="flex justify-between font-semibold">
                                {isExporting ? (
                                    <>
                                        <span className="w-1/3 inline-block text-gray-700">{exp.time}</span>
                                        <span className="w-2/3 inline-block text-right">{exp.company}</span>
                                    </>
                                ) : (
                                    <>
                                        <input type="text" placeholder="03/2022 - 02/2025" value={exp.time} onChange={e => onListChange('experienceList', idx, 'time', e.target.value)} className="w-1/3 outline-none border-b border-gray-400 focus:border-gray-700" />
                                        <input type="text" placeholder="Tên công ty..." value={exp.company} onChange={e => onListChange('experienceList', idx, 'company', e.target.value)} className="w-2/3 text-right outline-none border-b border-gray-400 focus:border-gray-700" />
                                    </>
                                )}
                            </div>
                            {isExporting ? (
                                <>
                                    <div className="font-bold">{exp.position}</div>
                                    <ul className="list-disc ml-5 mt-1">{(exp.details || '').split('\n').map((l, i) => (<li key={i}>{l}</li>))}</ul>
                                </>
                            ) : (
                                <>
                                    <input type="text" placeholder="Vị trí" value={exp.position} onChange={e => onListChange('experienceList', idx, 'position', e.target.value)} className="w-full outline-none border-b border-gray-400 focus:border-gray-700 font-bold mt-1" />
                                    <ul className="list-disc ml-5 mt-1">{(exp.details || '').split('\n').map((line, i) => (
                                        <li key={i}><input type="text" value={line} onChange={e => { const lines = (exp.details || '').split('\n'); lines[i] = e.target.value; onListChange('experienceList', idx, 'details', lines.join('\n')); }} className="w-full outline-none border-b border-gray-400 focus:border-gray-700" /></li>
                                    ))}
                                        <li><button type="button" className="text-xs text-gray-800 underline" onClick={() => onListChange('experienceList', idx, 'details', (exp.details ? exp.details + '\n' : '\n'))}>+ Thêm dòng</button></li>
                                    </ul>
                                </>
                            )}
                            {data.experienceList.length > 1 && !isExporting && <button type="button" className="text-xs text-red-500 underline mt-1" onClick={() => onRemoveList('experienceList', idx)}>Xóa</button>}
                        </div>
                    ))}
                    {!isExporting && <button type="button" className="text-xs text-gray-800 underline" onClick={() => onAddList('experienceList', { time: '', company: '', position: '', details: '' })}>+ Thêm kinh nghiệm</button>}
                </Section>
                <Section title="Học vấn">
                    {data.educationList?.map((edu, idx) => (
                        <div key={idx} className="mb-3">
                            <div className="flex justify-between font-semibold">
                                {isExporting ? (
                                    <>
                                        <span className="w-1/3 inline-block text-gray-700">{edu.time}</span>
                                        <span className="w-2/3 inline-block text-right">{edu.school}</span>
                                    </>
                                ) : (
                                    <>
                                        <input type="text" placeholder="2016 - 2020" value={edu.time} onChange={e => onListChange('educationList', idx, 'time', e.target.value)} className="w-1/3 outline-none border-b border-gray-400 focus:border-gray-700" />
                                        <input type="text" placeholder="Tên trường..." value={edu.school} onChange={e => onListChange('educationList', idx, 'school', e.target.value)} className="w-2/3 text-right outline-none border-b border-gray-400 focus:border-gray-700" />
                                    </>
                                )}
                            </div>
                            {isExporting ? (
                                <>
                                    <div>{edu.major}</div><div>{edu.result}</div><div>{edu.note}</div>
                                </>
                            ) : (
                                <>
                                    <input type="text" placeholder="Chuyên ngành" value={edu.major} onChange={e => onListChange('educationList', idx, 'major', e.target.value)} className="w-full outline-none border-b border-gray-400 focus:border-gray-700 mt-1" />
                                    <input type="text" placeholder="Kết quả/Thành tích" value={edu.result} onChange={e => onListChange('educationList', idx, 'result', e.target.value)} className="w-full outline-none border-b border-gray-400 focus:border-gray-700 mt-1" />
                                    <input type="text" placeholder="Ghi chú" value={edu.note} onChange={e => onListChange('educationList', idx, 'note', e.target.value)} className="w-full outline-none border-b border-gray-400 focus:border-gray-700 mt-1" />
                                </>
                            )}
                            {data.educationList.length > 1 && !isExporting && <button type="button" className="text-xs text-red-500 underline mt-1" onClick={() => onRemoveList('educationList', idx)}>Xóa</button>}
                        </div>
                    ))}
                    {!isExporting && <button type="button" className="text-xs text-gray-800 underline" onClick={() => onAddList('educationList', { time: '', school: '', major: '', result: '', note: '' })}>+ Thêm học vấn</button>}
                </Section>
            </div>
        );
    }

    // Minimal "hiện đại" header with avatar and dashed accents
    if (templateStyle === 'hienDai') {
        const accent = '#e57373';
        return (
            <div className="bg-white w-full max-w-[820px] mx-auto p-8 border border-gray-200" style={{ fontFamily: 'Inter, Arial, sans-serif' }}>
                <div className="flex items-start gap-6 mb-6">
                    <div className="w-28 h-28 rounded border border-gray-300 flex items-center justify-center overflow-hidden">
                        {data.avatar ? (
                            <img src={data.avatar} alt="avatar" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-gray-400">No Avatar</span>
                        )}
                    </div>
                    <div className="flex-1">
                        {isExporting ? (
                            <div className="inline-block px-3 py-1 border border-dashed rounded" style={{ borderColor: accent }}>
                                <div className="text-xl font-semibold" style={{ color: accent }}>{data.fullName || 'Họ và tên'}</div>
                            </div>
                        ) : (
                            <div className="inline-block px-3 py-1 border border-dashed rounded" style={{ borderColor: accent }}>
                                <input name="fullName" value={data.fullName} onChange={onChange} placeholder="Họ và tên" className="bg-transparent outline-none text-xl font-semibold" style={{ color: accent }} />
                            </div>
                        )}
                        <div className="mt-2 text-gray-700">
                            {isExporting ? (
                                <span>{data.email || 'Email'} • {data.phone || 'SĐT'}</span>
                            ) : (
                                <div className="flex gap-4 items-center">
                                    <input name="email" value={data.email} onChange={onChange} placeholder="Email" className="bg-transparent outline-none border-b border-gray-300" />
                                    <input name="phone" value={data.phone} onChange={onChange} placeholder="Số điện thoại" className="bg-transparent outline-none border-b border-gray-300" />
                                </div>
                            )}
                        </div>
                    </div>
                    {!isExporting && (
                        <label className="text-xs px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded cursor-pointer self-end">
                            Sửa ảnh
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => onAvatarChange?.(e.target.files?.[0])} />
                        </label>
                    )}
                </div>

                <div className="border-t border-gray-200 my-4" />
                <Section title="Tóm tắt">
                    {isExporting ? (
                        <div className="whitespace-pre-line">{data.summary}</div>
                    ) : (
                        <textarea name="summary" value={data.summary} onChange={onChange} rows={4} className="w-full outline-none border-b border-gray-300" placeholder="Giới thiệu ngắn gọn" />
                    )}
                </Section>
            </div>
        );
    }

    // Fallback simple view
    return (
        <div className="p-6 border rounded">
            <div className="text-xl font-semibold mb-2">{data.fullName || 'Họ và tên'}</div>
            <div className="text-sm text-gray-600">{data.email} • {data.phone}</div>
        </div>
    );
};

export default CVPreview;
