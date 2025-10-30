// C:\Users\aliak\Desktop\Док-оборот\docmanageapp\components\AIAssistant.tsx

import React, { useState, useEffect } from 'react';
// --- ИЗМЕНЕНО: Убрали все импорты из 'antd' ---
import { RobotOutlined, LoadingOutlined } from '@ant-design/icons';

interface AIAssistantProps {
    content: string;
    title: string;
    source?: string;
}

interface ExtractedFields {
    qaydRaqam?: string;
    qaydSana?: string;
    chiqishRaqam?: string;
    chiqishSana?: string;
    hujjatTuri?: string;
    yetkazishTuri?: string;
    murojaatJamoaviyligi?: string;
    murojaatTuri?: string;
    murojaatShakli?: string;
    tashkilot?: string;
    manzil?: string;
    sohasi?: string;
    tarmoqYonalishi?: string;
    holati?: string;
    murojaatchiTuri?: string;
    stirYokiJshshir?: string;
    muallif?: string;
    tugulganSana?: string;
    jinsi?: string;
    telefonRaqami?: string;
    viloyatlar?: string;
    tuman?: string;
    mahallaNomi?: string;
    sektor?: string;
    mazmuni?: string;
    biriktirilganFayllar?: string;
    normativHujjatRaqami?: string;
    kartochkaOchish?: string;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ content, title, source }) => {
    const [loading, setLoading] = useState(true);
    const [extractedFields, setExtractedFields] = useState<ExtractedFields | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedFields, setEditedFields] = useState<ExtractedFields>({});

    const mockAnalyzeContent = async () => {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Извлекаем поля из документа (мок-данные, в реальности это будет API)
        const fields: ExtractedFields = {
            qaydRaqam: "0498/25",
            qaydSana: new Date().toLocaleDateString('ru-RU'),
            chiqishRaqam: "MCh-123",
            chiqishSana: new Date().toLocaleDateString('ru-RU'),
            hujjatTuri: "Murojaat",
            yetkazishTuri: "Elektron",
            murojaatJamoaviyligi: "Yakka tartibdagi",
            murojaatTuri: "Shikoyat",
            murojaatShakli: "Yozma",
            tashkilot: source || "Markaziy Bank",
            manzil: "Toshkent shahar, Yunusobod tumani",
            sohasi: "Moliya",
            tarmoqYonalishi: "Bank xizmatlari",
            holati: "Ko'rib chiqilmoqda",
            murojaatchiTuri: "Jismoniy shaxs",
            stirYokiJshshir: "12345678901234",
            muallif: "Karimov Jasur",
            tugulganSana: "1985-05-15",
            jinsi: "Erkak",
            telefonRaqami: "+998 90 123 45 67",
            viloyatlar: "Toshkent",
            tuman: "Yunusobod",
            mahallaNomi: "Yangi hayot",
            sektor: "Sektor 3",
            mazmuni: content || "Hurmatli bank ma'muriyati! Korxonamiz faoliyatini yanada samarali yuritish...",
            biriktirilganFayllar: "ariza.pdf, passport.jpg",
            normativHujjatRaqami: "PQ-2025-123",
            kartochkaOchish: new Date().toLocaleDateString('ru-RU')
        };

        setExtractedFields(fields);
        setLoading(false);
    };

    useEffect(() => {
        mockAnalyzeContent();
    }, [content, title]);

    const handleEdit = () => {
        setIsEditing(true);
        setEditedFields({ ...extractedFields });
    };

    const handleSave = () => {
        setExtractedFields(editedFields);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditedFields({});
    };

    const handleFieldChange = (field: keyof ExtractedFields, value: string) => {
        setEditedFields(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="p-6 border border-white/20 rounded-lg bg-gradient-to-br from-slate-800/50 to-slate-900/50 text-white">
            <div className="flex items-center gap-2 mb-6">
                <RobotOutlined className="text-2xl text-cyan-400" />
                <h3 className="text-xl font-bold">AI Tahlil Natijasi</h3>
            </div>
            
            {loading && (
                <div className="flex flex-col items-center justify-center py-10">
                    <LoadingOutlined className="text-3xl text-cyan-400 animate-spin" />
                    <p className="mt-3 text-sm text-white/60">Hujjat tahlil qilinmoqda...</p>
                </div>
            )}

            {!loading && extractedFields && (
                <>
                    {/* Кнопки управления */}
                    <div className="flex justify-end gap-2 mb-4">
                        {!isEditing ? (
                            <button
                                onClick={handleEdit}
                                className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 rounded-lg text-cyan-400 text-sm transition-colors"
                            >
                                ✏️ Tahrirlash
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={handleCancel}
                                    className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white text-sm transition-colors"
                                >
                                    ❌ Bekor qilish
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 rounded-lg text-emerald-400 text-sm transition-colors"
                                >
                                    ✅ Saqlash
                                </button>
                            </>
                        )}
                    </div>

                    <div className="space-y-5">
                        {/* Qayd raqam */}
                        <div className="pb-4 border-b border-white/10">
                            <p className="text-xs uppercase text-white/50 tracking-wider mb-2">QAYD RAQAM</p>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editedFields.qaydRaqam || ''}
                                    onChange={(e) => handleFieldChange('qaydRaqam', e.target.value)}
                                    className="w-full p-2 bg-white/10 border border-cyan-500/50 rounded-md text-white focus:ring-2 focus:ring-cyan-500"
                                />
                            ) : (
                                <p className="text-lg font-semibold text-white">{extractedFields.qaydRaqam}</p>
                            )}
                        </div>

                        {/* Qayd sana */}
                        <div className="pb-4 border-b border-white/10">
                            <p className="text-xs uppercase text-white/50 tracking-wider mb-2">QAYD SANA</p>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editedFields.qaydSana || ''}
                                    onChange={(e) => handleFieldChange('qaydSana', e.target.value)}
                                    className="w-full p-2 bg-white/10 border border-cyan-500/50 rounded-md text-white focus:ring-2 focus:ring-cyan-500"
                                />
                            ) : (
                                <p className="text-base text-white/90">{extractedFields.qaydSana}</p>
                            )}
                        </div>

                        {/* Chiqish raqam */}
                        <div className="pb-4 border-b border-white/10">
                            <p className="text-xs uppercase text-white/50 tracking-wider mb-2">CHIQISH RAQAM</p>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editedFields.chiqishRaqam || ''}
                                    onChange={(e) => handleFieldChange('chiqishRaqam', e.target.value)}
                                    className="w-full p-2 bg-white/10 border border-cyan-500/50 rounded-md text-white focus:ring-2 focus:ring-cyan-500"
                                />
                            ) : (
                                <p className="text-base text-white/90">{extractedFields.chiqishRaqam}</p>
                            )}
                        </div>

                        {/* Chiqish sana */}
                        <div className="pb-4 border-b border-white/10">
                            <p className="text-xs uppercase text-white/50 tracking-wider mb-2">CHIQISH SANA</p>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editedFields.chiqishSana || ''}
                                    onChange={(e) => handleFieldChange('chiqishSana', e.target.value)}
                                    className="w-full p-2 bg-white/10 border border-cyan-500/50 rounded-md text-white focus:ring-2 focus:ring-cyan-500"
                                />
                            ) : (
                                <p className="text-base text-white/90">{extractedFields.chiqishSana}</p>
                            )}
                        </div>

                        {/* Hujjat turi */}
                        <div className="pb-4 border-b border-white/10">
                            <p className="text-xs uppercase text-white/50 tracking-wider mb-2">HUJJAT TURI</p>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editedFields.hujjatTuri || ''}
                                    onChange={(e) => handleFieldChange('hujjatTuri', e.target.value)}
                                    className="w-full p-2 bg-white/10 border border-cyan-500/50 rounded-md text-white focus:ring-2 focus:ring-cyan-500"
                                />
                            ) : (
                                <p className="text-base text-white/90">{extractedFields.hujjatTuri}</p>
                            )}
                        </div>

                        {/* Yetkazish turi */}
                        <div className="pb-4 border-b border-white/10">
                            <p className="text-xs uppercase text-white/50 tracking-wider mb-2">YETKAZISH TURI</p>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editedFields.yetkazishTuri || ''}
                                    onChange={(e) => handleFieldChange('yetkazishTuri', e.target.value)}
                                    className="w-full p-2 bg-white/10 border border-cyan-500/50 rounded-md text-white focus:ring-2 focus:ring-cyan-500"
                                />
                            ) : (
                                <p className="text-base text-white/90">{extractedFields.yetkazishTuri}</p>
                            )}
                        </div>

                        {/* Murojaatning jamoaviyligi */}
                        {extractedFields.murojaatJamoaviyligi && (
                            <div className="pb-4 border-b border-white/10">
                                <p className="text-xs uppercase text-white/50 tracking-wider mb-2">MUROJAATNING JAMOAVIYLIGI</p>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editedFields.murojaatJamoaviyligi || ''}
                                        onChange={(e) => handleFieldChange('murojaatJamoaviyligi', e.target.value)}
                                        className="w-full p-2 bg-white/10 border border-cyan-500/50 rounded-md text-white focus:ring-2 focus:ring-cyan-500"
                                    />
                                ) : (
                                    <p className="text-base text-white/90">{extractedFields.murojaatJamoaviyligi}</p>
                                )}
                            </div>
                        )}

                        {/* Murojaat turi */}
                        {extractedFields.murojaatTuri && (
                            <div className="pb-4 border-b border-white/10">
                                <p className="text-xs uppercase text-white/50 tracking-wider mb-2">MUROJAAT TURI</p>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editedFields.murojaatTuri || ''}
                                        onChange={(e) => handleFieldChange('murojaatTuri', e.target.value)}
                                        className="w-full p-2 bg-white/10 border border-cyan-500/50 rounded-md text-white focus:ring-2 focus:ring-cyan-500"
                                    />
                                ) : (
                                    <p className="text-base text-white/90">{extractedFields.murojaatTuri}</p>
                                )}
                            </div>
                        )}

                        {/* Murojaat shakli */}
                        {extractedFields.murojaatShakli && (
                            <div className="pb-4 border-b border-white/10">
                                <p className="text-xs uppercase text-white/50 tracking-wider mb-2">MUROJAAT SHAKLI</p>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editedFields.murojaatShakli || ''}
                                        onChange={(e) => handleFieldChange('murojaatShakli', e.target.value)}
                                        className="w-full p-2 bg-white/10 border border-cyan-500/50 rounded-md text-white focus:ring-2 focus:ring-cyan-500"
                                    />
                                ) : (
                                    <p className="text-base text-white/90">{extractedFields.murojaatShakli}</p>
                                )}
                            </div>
                        )}

                        {/* Tashkilot */}
                        <div className="pb-4 border-b border-white/10">
                            <p className="text-xs uppercase text-white/50 tracking-wider mb-2">TASHKILOT</p>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editedFields.tashkilot || ''}
                                    onChange={(e) => handleFieldChange('tashkilot', e.target.value)}
                                    className="w-full p-2 bg-white/10 border border-cyan-500/50 rounded-md text-white focus:ring-2 focus:ring-cyan-500"
                                />
                            ) : (
                                <p className="text-base text-white/90">{extractedFields.tashkilot}</p>
                            )}
                        </div>

                        {/* Manzil */}
                        <div className="pb-4 border-b border-white/10">
                            <p className="text-xs uppercase text-white/50 tracking-wider mb-2">MANZIL</p>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editedFields.manzil || ''}
                                    onChange={(e) => handleFieldChange('manzil', e.target.value)}
                                    className="w-full p-2 bg-white/10 border border-cyan-500/50 rounded-md text-white focus:ring-2 focus:ring-cyan-500"
                                />
                            ) : (
                                <p className="text-base text-white/90">{extractedFields.manzil}</p>
                            )}
                        </div>

                        {/* Sohasi */}
                        {extractedFields.sohasi && (
                            <div className="pb-4 border-b border-white/10">
                                <p className="text-xs uppercase text-white/50 tracking-wider mb-2">SOHASI</p>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editedFields.sohasi || ''}
                                        onChange={(e) => handleFieldChange('sohasi', e.target.value)}
                                        className="w-full p-2 bg-white/10 border border-cyan-500/50 rounded-md text-white focus:ring-2 focus:ring-cyan-500"
                                    />
                                ) : (
                                    <p className="text-base text-white/90">{extractedFields.sohasi}</p>
                                )}
                            </div>
                        )}

                        {/* Tarmoq yo'nalishi */}
                        {extractedFields.tarmoqYonalishi && (
                            <div className="pb-4 border-b border-white/10">
                                <p className="text-xs uppercase text-white/50 tracking-wider mb-2">TARMOQ YO'NALISHI</p>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editedFields.tarmoqYonalishi || ''}
                                        onChange={(e) => handleFieldChange('tarmoqYonalishi', e.target.value)}
                                        className="w-full p-2 bg-white/10 border border-cyan-500/50 rounded-md text-white focus:ring-2 focus:ring-cyan-500"
                                    />
                                ) : (
                                    <p className="text-base text-white/90">{extractedFields.tarmoqYonalishi}</p>
                                )}
                            </div>
                        )}

                        {/* Holati */}
                        {extractedFields.holati && (
                            <div className="pb-4 border-b border-white/10">
                                <p className="text-xs uppercase text-white/50 tracking-wider mb-2">HOLATI</p>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editedFields.holati || ''}
                                        onChange={(e) => handleFieldChange('holati', e.target.value)}
                                        className="w-full p-2 bg-white/10 border border-cyan-500/50 rounded-md text-white focus:ring-2 focus:ring-cyan-500"
                                    />
                                ) : (
                                    <p className="text-base text-white/90">{extractedFields.holati}</p>
                                )}
                            </div>
                        )}

                        {/* Murojaatchi turi */}
                        {extractedFields.murojaatchiTuri && (
                            <div className="pb-4 border-b border-white/10">
                                <p className="text-xs uppercase text-white/50 tracking-wider mb-2">MUROJAATCHI TURI</p>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editedFields.murojaatchiTuri || ''}
                                        onChange={(e) => handleFieldChange('murojaatchiTuri', e.target.value)}
                                        className="w-full p-2 bg-white/10 border border-cyan-500/50 rounded-md text-white focus:ring-2 focus:ring-cyan-500"
                                    />
                                ) : (
                                    <p className="text-base text-white/90">{extractedFields.murojaatchiTuri}</p>
                                )}
                            </div>
                        )}

                        {/* STIR yoki JSHSHIR */}
                        {extractedFields.stirYokiJshshir && (
                            <div className="pb-4 border-b border-white/10">
                                <p className="text-xs uppercase text-white/50 tracking-wider mb-2">STIR YOKI JSHSHIR</p>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editedFields.stirYokiJshshir || ''}
                                        onChange={(e) => handleFieldChange('stirYokiJshshir', e.target.value)}
                                        className="w-full p-2 bg-white/10 border border-cyan-500/50 rounded-md text-white font-mono focus:ring-2 focus:ring-cyan-500"
                                    />
                                ) : (
                                    <p className="text-base font-mono text-white/90">{extractedFields.stirYokiJshshir}</p>
                                )}
                            </div>
                        )}

                        {/* Muallif */}
                        <div className="pb-4 border-b border-white/10">
                            <p className="text-xs uppercase text-white/50 tracking-wider mb-2">MUALLIF</p>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editedFields.muallif || ''}
                                    onChange={(e) => handleFieldChange('muallif', e.target.value)}
                                    className="w-full p-2 bg-white/10 border border-cyan-500/50 rounded-md text-white focus:ring-2 focus:ring-cyan-500"
                                />
                            ) : (
                                <p className="text-base text-white/90">{extractedFields.muallif}</p>
                            )}
                        </div>

                        {/* Tug'ilgan sana */}
                        {extractedFields.tugulganSana && (
                            <div className="pb-4 border-b border-white/10">
                                <p className="text-xs uppercase text-white/50 tracking-wider mb-2">TUG'ILGAN SANA</p>
                                {isEditing ? (
                                    <input
                                        type="date"
                                        value={editedFields.tugulganSana || ''}
                                        onChange={(e) => handleFieldChange('tugulganSana', e.target.value)}
                                        className="w-full p-2 bg-white/10 border border-cyan-500/50 rounded-md text-white focus:ring-2 focus:ring-cyan-500"
                                    />
                                ) : (
                                    <p className="text-base text-white/90">{extractedFields.tugulganSana}</p>
                                )}
                            </div>
                        )}

                        {/* Jinsi */}
                        {extractedFields.jinsi && (
                            <div className="pb-4 border-b border-white/10">
                                <p className="text-xs uppercase text-white/50 tracking-wider mb-2">JINSI</p>
                                {isEditing ? (
                                    <select
                                        value={editedFields.jinsi || ''}
                                        onChange={(e) => handleFieldChange('jinsi', e.target.value)}
                                        className="w-full p-2 bg-white/10 border border-cyan-500/50 rounded-md text-white focus:ring-2 focus:ring-cyan-500"
                                    >
                                        <option value="Erkak" className="bg-gray-900">Erkak</option>
                                        <option value="Ayol" className="bg-gray-900">Ayol</option>
                                    </select>
                                ) : (
                                    <p className="text-base text-white/90">{extractedFields.jinsi}</p>
                                )}
                            </div>
                        )}

                        {/* Telefon raqami */}
                        {extractedFields.telefonRaqami && (
                            <div className="pb-4 border-b border-white/10">
                                <p className="text-xs uppercase text-white/50 tracking-wider mb-2">TELEFON RAQAMI</p>
                                {isEditing ? (
                                    <input
                                        type="tel"
                                        value={editedFields.telefonRaqami || ''}
                                        onChange={(e) => handleFieldChange('telefonRaqami', e.target.value)}
                                        className="w-full p-2 bg-white/10 border border-cyan-500/50 rounded-md text-white focus:ring-2 focus:ring-cyan-500"
                                    />
                                ) : (
                                    <p className="text-base text-white/90">{extractedFields.telefonRaqami}</p>
                                )}
                            </div>
                        )}

                        {/* Viloyat */}
                        {extractedFields.viloyatlar && (
                            <div className="pb-4 border-b border-white/10">
                                <p className="text-xs uppercase text-white/50 tracking-wider mb-2">VILOYAT</p>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editedFields.viloyatlar || ''}
                                        onChange={(e) => handleFieldChange('viloyatlar', e.target.value)}
                                        className="w-full p-2 bg-white/10 border border-cyan-500/50 rounded-md text-white focus:ring-2 focus:ring-cyan-500"
                                    />
                                ) : (
                                    <p className="text-base text-white/90">{extractedFields.viloyatlar}</p>
                                )}
                            </div>
                        )}

                        {/* Tuman */}
                        {extractedFields.tuman && (
                            <div className="pb-4 border-b border-white/10">
                                <p className="text-xs uppercase text-white/50 tracking-wider mb-2">TUMAN</p>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editedFields.tuman || ''}
                                        onChange={(e) => handleFieldChange('tuman', e.target.value)}
                                        className="w-full p-2 bg-white/10 border border-cyan-500/50 rounded-md text-white focus:ring-2 focus:ring-cyan-500"
                                    />
                                ) : (
                                    <p className="text-base text-white/90">{extractedFields.tuman}</p>
                                )}
                            </div>
                        )}

                        {/* Mahalla nomi */}
                        {extractedFields.mahallaNomi && (
                            <div className="pb-4 border-b border-white/10">
                                <p className="text-xs uppercase text-white/50 tracking-wider mb-2">MAHALLA NOMI</p>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editedFields.mahallaNomi || ''}
                                        onChange={(e) => handleFieldChange('mahallaNomi', e.target.value)}
                                        className="w-full p-2 bg-white/10 border border-cyan-500/50 rounded-md text-white focus:ring-2 focus:ring-cyan-500"
                                    />
                                ) : (
                                    <p className="text-base text-white/90">{extractedFields.mahallaNomi}</p>
                                )}
                            </div>
                        )}

                        {/* Sektor */}
                        {extractedFields.sektor && (
                            <div className="pb-4 border-b border-white/10">
                                <p className="text-xs uppercase text-white/50 tracking-wider mb-2">SEKTOR</p>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editedFields.sektor || ''}
                                        onChange={(e) => handleFieldChange('sektor', e.target.value)}
                                        className="w-full p-2 bg-white/10 border border-cyan-500/50 rounded-md text-white focus:ring-2 focus:ring-cyan-500"
                                    />
                                ) : (
                                    <p className="text-base text-white/90">{extractedFields.sektor}</p>
                                )}
                            </div>
                        )}

                        {/* Biriktirilgan fayllar */}
                        <div className="pb-4 border-b border-white/10">
                            <p className="text-xs uppercase text-white/50 tracking-wider mb-2">BIRIKTIRILGAN FAYLLAR</p>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editedFields.biriktirilganFayllar || ''}
                                    onChange={(e) => handleFieldChange('biriktirilganFayllar', e.target.value)}
                                    className="w-full p-2 bg-white/10 border border-cyan-500/50 rounded-md text-white focus:ring-2 focus:ring-cyan-500"
                                />
                            ) : (
                                <p className="text-base text-white/90">{extractedFields.biriktirilganFayllar}</p>
                            )}
                        </div>

                        {/* Normativ hujjat raqami */}
                        <div className="pb-4 border-b border-white/10">
                            <p className="text-xs uppercase text-white/50 tracking-wider mb-2">NORMATIV HUJJAT RAQAMI</p>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editedFields.normativHujjatRaqami || ''}
                                    onChange={(e) => handleFieldChange('normativHujjatRaqami', e.target.value)}
                                    className="w-full p-2 bg-white/10 border border-cyan-500/50 rounded-md text-white focus:ring-2 focus:ring-cyan-500"
                                />
                            ) : (
                                <p className="text-base text-white/90">{extractedFields.normativHujjatRaqami}</p>
                            )}
                        </div>

                        {/* Kartochka ochish */}
                        <div className="pb-4 border-b border-white/10">
                            <p className="text-xs uppercase text-white/50 tracking-wider mb-2">KARTOCHKA OCHISH</p>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editedFields.kartochkaOchish || ''}
                                    onChange={(e) => handleFieldChange('kartochkaOchish', e.target.value)}
                                    className="w-full p-2 bg-white/10 border border-cyan-500/50 rounded-md text-white focus:ring-2 focus:ring-cyan-500"
                                />
                            ) : (
                                <p className="text-base text-white/90">{extractedFields.kartochkaOchish}</p>
                            )}
                        </div>

                        {/* Mazmuni */}
                        <div>
                            <p className="text-xs uppercase text-white/50 tracking-wider mb-2">MAZMUNI</p>
                            {isEditing ? (
                                <textarea
                                    value={editedFields.mazmuni || ''}
                                    onChange={(e) => handleFieldChange('mazmuni', e.target.value)}
                                    rows={6}
                                    className="w-full p-2 bg-white/10 border border-cyan-500/50 rounded-md text-white focus:ring-2 focus:ring-cyan-500"
                                />
                            ) : (
                                <p className="text-sm text-white/80 leading-relaxed">{extractedFields.mazmuni}</p>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default AIAssistant;