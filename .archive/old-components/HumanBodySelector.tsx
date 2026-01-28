import React, { useState } from 'react';

const DetailedBodySelector = ({ onSubmit, onBack }: { onSubmit: (data: any[]) => void, onBack?: () => void }) => {
    const [selectedParts, setSelectedParts] = useState<string[]>([]);
    const [hoveredPart, setHoveredPart] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'external' | 'internal'>('external'); // 'external' or 'internal'
    const [painIntensity, setPainIntensity] = useState<Record<string, number>>({});

    // External body parts
    const externalParts = [
        // Head Region
        { id: 'FRONTAL', name: 'Forehead', nameUrdu: 'ماتھا', category: 'head', x: 240, y: 50, rx: 35, ry: 25 },
        { id: 'EYE_LEFT', name: 'Left Eye', nameUrdu: 'بایاں آنکھ', category: 'head', x: 225, y: 60, rx: 8, ry: 6 },
        { id: 'EYE_RIGHT', name: 'Right Eye', nameUrdu: 'دایاں آنکھ', category: 'head', x: 255, y: 60, rx: 8, ry: 6 },
        { id: 'NOSE', name: 'Nose', nameUrdu: 'ناک', category: 'head', x: 240, y: 70, rx: 6, ry: 10 },
        { id: 'ORAL_CAVITY', name: 'Mouth', nameUrdu: 'منہ', category: 'head', x: 240, y: 85, rx: 12, ry: 6 },
        { id: 'MANDIBLE', name: 'Jaw', nameUrdu: 'جبڑا', category: 'head', x: 240, y: 95, rx: 15, ry: 10 },
        { id: 'EAR_LEFT', name: 'Left Ear', nameUrdu: 'بایاں کان', category: 'head', x: 205, y: 65, rx: 8, ry: 12 },
        { id: 'EAR_RIGHT', name: 'Right Ear', nameUrdu: 'دایاں کان', category: 'head', x: 275, y: 65, rx: 8, ry: 12 },
        { id: 'NECK_ANTERIOR', name: 'Front of Neck', nameUrdu: 'گردن کا اگلا حصہ', category: 'head', x: 240, y: 110, rx: 20, ry: 15 },
        { id: 'NECK_POSTERIOR', name: 'Back of Neck', nameUrdu: 'گردن کا پچھلا حصہ', category: 'head', x: 240, y: 110, rx: 20, ry: 15 },

        // Upper Body
        { id: 'LEFT_SHOULDER', name: 'Left Shoulder', nameUrdu: 'بایاں کندھا', category: 'upper', x: 175, y: 150, rx: 30, ry: 25 },
        { id: 'RIGHT_SHOULDER', name: 'Right Shoulder', nameUrdu: 'دایاں کندھا', category: 'upper', x: 305, y: 150, rx: 30, ry: 25 },
        { id: 'CHEST', name: 'Chest', nameUrdu: 'سینہ', category: 'upper', x: 240, y: 175, rx: 50, ry: 45 },
        { id: 'EPIGASTRIC', name: 'Upper Middle Abdomen', nameUrdu: 'اوپری درمیانی حصہ', category: 'upper', x: 240, y: 230, rx: 35, ry: 25 },
        { id: 'UMBILICAL', name: 'Around Navel', nameUrdu: 'ناف کے گرد', category: 'upper', x: 240, y: 270, rx: 30, ry: 30 },

        // Arms
        { id: 'LEFT_UPPER_ARM', name: 'Left Upper Arm', nameUrdu: 'بایاں اوپری بازو', category: 'arms', x: 145, y: 195, rx: 18, ry: 45 },
        { id: 'RIGHT_UPPER_ARM', name: 'Right Upper Arm', nameUrdu: 'دایاں اوپری بازو', category: 'arms', x: 335, y: 195, rx: 18, ry: 45 },
        { id: 'LEFT_ELBOW', name: 'Left Elbow', nameUrdu: 'بایاں کہنی', category: 'arms', x: 135, y: 245, rx: 15, ry: 15 },
        { id: 'RIGHT_ELBOW', name: 'Right Elbow', nameUrdu: 'دایاں کہنی', category: 'arms', x: 345, y: 245, rx: 15, ry: 15 },
        { id: 'LEFT_FOREARM', name: 'Left Forearm', nameUrdu: 'بایاں نچلا بازو', category: 'arms', x: 120, y: 290, rx: 16, ry: 40 },
        { id: 'RIGHT_FOREARM', name: 'Right Forearm', nameUrdu: 'دایاں نچلا بازو', category: 'arms', x: 360, y: 290, rx: 16, ry: 40 },

        // Lower Body
        { id: 'PELVIS', name: 'Pelvis', nameUrdu: 'کولہے', category: 'lower', x: 240, y: 325, rx: 40, ry: 25 },
        { id: 'INGUINAL', name: 'Groin Area', nameUrdu: 'نالی کا علاقہ', category: 'lower', x: 240, y: 350, rx: 30, ry: 15 },
        { id: 'LEFT_HIP', name: 'Left Hip', nameUrdu: 'بایاں کولہا', category: 'lower', x: 210, y: 345, rx: 25, ry: 20 },
        { id: 'RIGHT_HIP', name: 'Right Hip', nameUrdu: 'دایاں کولہا', category: 'lower', x: 270, y: 345, rx: 25, ry: 20 },
        { id: 'LEFT_KNEE', name: 'Left Knee', nameUrdu: 'بایاں گھٹنا', category: 'lower', x: 210, y: 465, rx: 20, ry: 18 },
        { id: 'RIGHT_KNEE', name: 'Right Knee', nameUrdu: 'دایاں گھٹنا', category: 'lower', x: 270, y: 465, rx: 20, ry: 18 },

        // Back
        { id: 'THORACIC_SPINE', name: 'Upper back', nameUrdu: 'اوپری کمر', category: 'back', x: 240, y: 190, rx: 45, ry: 40 },
        { id: 'LOWER_THORACIC', name: 'Mid Back', nameUrdu: 'درمیانی کمر', category: 'back', x: 240, y: 245, rx: 42, ry: 35 },
        { id: 'LUMBAR_SPINE', name: 'Lower Back', nameUrdu: 'نچلی کمر', category: 'back', x: 240, y: 295, rx: 40, ry: 30 },
    ];

    // Internal organs
    const internalOrgans = [
        // NERVOUS SYSTEM
        { id: 'brain', name: 'Brain', nameUrdu: 'دماغ', category: 'nervous', x: 240, y: 55, rx: 30, ry: 35 },

        // RESPIRATORY
        { id: 'throat', name: 'Throat', nameUrdu: 'گلا', category: 'respiratory', x: 240, y: 115, rx: 12, ry: 20 },
        { id: 'leftLung', name: 'Left Lung', nameUrdu: 'بایاں پھیپھڑا', category: 'respiratory', x: 215, y: 180, rx: 25, ry: 40 },
        { id: 'rightLung', name: 'Right Lung', nameUrdu: 'دایاں پھیپھڑا', category: 'respiratory', x: 265, y: 180, rx: 25, ry: 40 },

        // CARDIOVASCULAR
        { id: 'heart', name: 'Heart', nameUrdu: 'دل', category: 'cardiovascular', x: 230, y: 185, rx: 20, ry: 25 },

        // DIGESTIVE
        { id: 'stomach', name: 'Stomach', nameUrdu: 'معدہ', category: 'digestive', x: 225, y: 230, rx: 25, ry: 30 },
        { id: 'liver', name: 'Liver', nameUrdu: 'جگر', category: 'digestive', x: 260, y: 220, rx: 32, ry: 28 },
        { id: 'gallbladder', name: 'Gallbladder', nameUrdu: 'پتہ', category: 'digestive', x: 270, y: 235, rx: 10, ry: 12 },
        { id: 'pancreas', name: 'Pancreas', nameUrdu: 'لبلبہ', category: 'digestive', x: 240, y: 245, rx: 28, ry: 10 },
        { id: 'smallIntestine', name: 'Small Intestine', nameUrdu: 'چھوٹی آنت', category: 'digestive', x: 240, y: 275, rx: 38, ry: 32 },
        { id: 'largeIntestine', name: 'Large Intestine', nameUrdu: 'بڑی آنت', category: 'digestive', x: 240, y: 295, rx: 42, ry: 28 },
        { id: 'appendix', name: 'Appendix', nameUrdu: 'اپینڈکس', category: 'digestive', x: 265, y: 305, rx: 6, ry: 12 },

        // URINARY
        { id: 'leftKidney', name: 'Left Kidney', nameUrdu: 'بایاں گردہ', category: 'urinary', x: 215, y: 250, rx: 15, ry: 22 },
        { id: 'rightKidney', name: 'Right Kidney', nameUrdu: 'دایاں گردہ', category: 'urinary', x: 265, y: 248, rx: 15, ry: 22 },
        { id: 'bladder', name: 'Bladder', nameUrdu: 'مثانہ', category: 'urinary', x: 240, y: 315, rx: 22, ry: 18 },

        // REPRODUCTIVE
        { id: 'reproductive', name: 'Reproductive Organs', nameUrdu: 'تولیدی اعضاء', category: 'reproductive', x: 240, y: 330, rx: 26, ry: 20 },

        // ENDOCRINE
        { id: 'thyroid', name: 'Thyroid', nameUrdu: 'تھائیرائیڈ', category: 'endocrine', x: 240, y: 125, rx: 18, ry: 10 },

        // LYMPHATIC/IMMUNE
        { id: 'spleen', name: 'Spleen', nameUrdu: 'تلی', category: 'lymphatic', x: 210, y: 235, rx: 18, ry: 22 }
    ];

    const currentParts = viewMode === 'external' ? externalParts : internalOrgans;

    const toggleBodyPart = (partId: string) => {
        setSelectedParts(prev => {
            if (prev.includes(partId)) {
                const newPainIntensity = { ...painIntensity };
                delete newPainIntensity[partId];
                setPainIntensity(newPainIntensity);
                return prev.filter(id => id !== partId);
            } else {
                return [...prev, partId];
            }
        });
    };

    const setPainLevel = (partId: string, level: number) => {
        setPainIntensity(prev => ({
            ...prev,
            [partId]: level
        }));
    };

    const getBodyPartColor = (partId: string) => {
        if (!selectedParts.includes(partId)) {
            return hoveredPart === partId ? '#3b82f6' : '#cbd5e1';
        }

        const intensity = painIntensity[partId] || 5;
        if (intensity <= 3) return '#fbbf24'; // Yellow - mild
        if (intensity <= 6) return '#f97316'; // Orange - moderate
        return '#dc2626'; // Red - severe
    };

    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            head: '#8b5cf6',
            upper: '#3b82f6',
            arms: '#10b981',
            lower: '#f59e0b',
            back: '#ef4444',
            nervous: '#8b5cf6',
            lymphatic: '#8b5cf6',
            respiratory: '#06b6d4',
            cardiovascular: '#dc2626',
            digestive: '#f59e0b',
            urinary: '#10b981',
            reproductive: '#ec4899',
            endocrine: '#8b5cf6'
        };
        return colors[category] || '#64748b';
    };

    const handleSubmit = () => {
        const data = currentParts
            .filter(part => selectedParts.includes(part.id))
            .map(part => ({
                id: part.id,
                name: part.name,
                nameUrdu: part.nameUrdu,
                category: part.category,
                painIntensity: painIntensity[part.id] || 0,
                type: viewMode
            }));

        if (onSubmit) {
            onSubmit(data);
        } else {
            console.log('Submitted data:', data);
            alert(`${data.length} علاقے منتخب کیے گئے`);
        }
    };

    const handleClear = () => {
        setSelectedParts([]);
        setPainIntensity({});
    };

    return (
        <div style={{
            maxWidth: '1000px',
            margin: '0 auto',
            padding: '20px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            direction: 'rtl'
        }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <h2 style={{
                    color: '#0891b2',
                    fontSize: '28px',
                    marginBottom: '10px',
                    fontWeight: 'bold'
                }}>
                    طبی معائنہ - درد کی نشاندہی
                </h2>
                <p style={{ color: '#64748b', fontSize: '16px' }}>
                    جسم کے اس حصے پر کلک کریں جہاں آپ کو تکلیف ہے
                </p>
            </div>

            {/* View Mode Toggle */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '10px',
                marginBottom: '20px'
            }}>
                <button
                    onClick={() => setViewMode('external')}
                    style={{
                        padding: '10px 25px',
                        fontSize: '16px',
                        borderRadius: '6px',
                        border: viewMode === 'external' ? '2px solid #0891b2' : '2px solid #cbd5e1',
                        background: viewMode === 'external' ? '#0891b2' : 'white',
                        color: viewMode === 'external' ? 'white' : '#64748b',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        transition: 'all 0.2s'
                    }}
                >
                    بیرونی حصے
                </button>
                <button
                    onClick={() => setViewMode('internal')}
                    style={{
                        padding: '10px 25px',
                        fontSize: '16px',
                        borderRadius: '6px',
                        border: viewMode === 'internal' ? '2px solid #0891b2' : '2px solid #cbd5e1',
                        background: viewMode === 'internal' ? '#0891b2' : 'white',
                        color: viewMode === 'internal' ? 'white' : '#64748b',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        transition: 'all 0.2s'
                    }}
                >
                    اندرونی اعضاء
                </button>
            </div>

            {/* Body Diagram */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '20px'
            }}>
                <svg
                    width="480"
                    height="640"
                    style={{
                        border: '2px solid #e2e8f0',
                        borderRadius: '8px',
                        background: viewMode === 'external' ? '#fef3c7' : '#fce7f3'
                    }}
                >
                    {/* Body Outline */}
                    <path
                        d="M 240 30 
               Q 210 30, 205 60
               L 200 110
               L 145 150
               L 120 200
               L 110 340
               L 190 365
               L 190 470
               L 200 570
               L 230 625
               L 240 630
               L 250 625
               L 280 570
               L 290 470
               L 290 365
               L 370 340
               L 360 200
               L 335 150
               L 280 110
               L 275 60
               Q 270 30, 240 30 Z"
                        fill="none"
                        stroke={viewMode === 'external' ? '#92400e' : '#831843'}
                        strokeWidth="2.5"
                        strokeDasharray={viewMode === 'internal' ? '5,5' : '0'}
                    />

                    {/* Body Parts */}
                    {currentParts.map(part => (
                        <g key={part.id}>
                            <ellipse
                                cx={part.x}
                                cy={part.y}
                                rx={part.rx}
                                ry={part.ry}
                                fill={getBodyPartColor(part.id)}
                                fillOpacity="0.7"
                                stroke={selectedParts.includes(part.id) ? '#1e293b' : getCategoryColor(part.category)}
                                strokeWidth={selectedParts.includes(part.id) ? '3' : '1.5'}
                                style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                                onMouseEnter={() => setHoveredPart(part.id)}
                                onMouseLeave={() => setHoveredPart(null)}
                                onClick={() => toggleBodyPart(part.id)}
                            />
                            {(hoveredPart === part.id || selectedParts.includes(part.id)) && (
                                <text
                                    x={part.x}
                                    y={part.y - part.ry - 8}
                                    textAnchor="middle"
                                    fontSize="11"
                                    fill="#1e293b"
                                    fontWeight="bold"
                                    style={{
                                        pointerEvents: 'none'
                                    }}
                                >
                                    {part.nameUrdu}
                                </text>
                            )}
                        </g>
                    ))}
                </svg>
            </div>

            {/* Selected Parts with Pain Intensity */}
            {selectedParts.length > 0 && (
                <div style={{
                    background: '#fef2f2',
                    border: '2px solid #fecaca',
                    borderRadius: '8px',
                    padding: '20px',
                    marginBottom: '20px'
                }}>
                    <h4 style={{
                        color: '#991b1b',
                        marginBottom: '15px',
                        fontSize: '18px',
                        fontWeight: 'bold'
                    }}>
                        منتخب علاقے ({selectedParts.length}):
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {currentParts
                            .filter(part => selectedParts.includes(part.id))
                            .map(part => (
                                <div
                                    key={part.id}
                                    style={{
                                        background: 'white',
                                        padding: '15px',
                                        borderRadius: '8px',
                                        border: '1px solid #fecaca'
                                    }}
                                >
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '10px'
                                    }}>
                                        <span style={{
                                            fontSize: '16px',
                                            fontWeight: 'bold',
                                            color: '#1e293b'
                                        }}>
                                            {part.nameUrdu}
                                        </span>
                                        <button
                                            onClick={() => toggleBodyPart(part.id)}
                                            style={{
                                                background: '#dc2626',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                padding: '5px 10px',
                                                cursor: 'pointer',
                                                fontSize: '12px'
                                            }}
                                        >
                                            ہٹائیں
                                        </button>
                                    </div>
                                    <div>
                                        <label
                                            htmlFor={`pain-range-${part.id}`}
                                            style={{
                                                display: 'block',
                                                marginBottom: '8px',
                                                color: '#64748b',
                                                fontSize: '14px'
                                            }}
                                        >
                                            درد کی شدت (0 = کوئی نہیں، 10 = شدید):
                                        </label>
                                        <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                                            <input
                                                id={`pain-range-${part.id}`}
                                                type="range"
                                                min="0"
                                                max="10"
                                                value={painIntensity[part.id] || 0}
                                                onChange={(e) => setPainLevel(part.id, parseInt(e.target.value))}
                                                style={{ flex: 1 }}
                                                aria-label="Pain intensity"
                                            />
                                            <span style={{
                                                minWidth: '30px',
                                                textAlign: 'center',
                                                fontWeight: 'bold',
                                                color: getBodyPartColor(part.id)
                                            }}>
                                                {painIntensity[part.id] || 0}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            )}

            {/* Legend */}
            <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '15px',
                marginBottom: '20px'
            }}>
                <h4 style={{
                    fontSize: '16px',
                    marginBottom: '10px',
                    color: '#1e293b'
                }}>
                    درد کی شدت کی علامات:
                </h4>
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '20px', height: '20px', background: '#fbbf24', borderRadius: '50%' }}></div>
                        <span style={{ fontSize: '14px' }}>ہلکا (0-3)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '20px', height: '20px', background: '#f97316', borderRadius: '50%' }}></div>
                        <span style={{ fontSize: '14px' }}>درمیانہ (4-6)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '20px', height: '20px', background: '#dc2626', borderRadius: '50%' }}></div>
                        <span style={{ fontSize: '14px' }}>شدید (7-10)</span>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div style={{
                display: 'flex',
                gap: '15px',
                justifyContent: 'center'
            }}>
                {onBack && (
                    <button
                        onClick={onBack}
                        style={{
                            padding: '12px 30px',
                            fontSize: '16px',
                            borderRadius: '6px',
                            border: '2px solid #64748b',
                            background: 'white',
                            color: '#64748b',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        واپس
                    </button>
                )}
                <button
                    onClick={handleClear}
                    disabled={selectedParts.length === 0}
                    style={{
                        padding: '12px 30px',
                        fontSize: '16px',
                        borderRadius: '6px',
                        border: '2px solid #64748b',
                        background: 'white',
                        color: '#64748b',
                        cursor: selectedParts.length === 0 ? 'not-allowed' : 'pointer',
                        opacity: selectedParts.length === 0 ? 0.5 : 1,
                        fontWeight: 'bold'
                    }}
                >
                    صاف کریں
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={selectedParts.length === 0}
                    style={{
                        padding: '12px 30px',
                        fontSize: '16px',
                        borderRadius: '6px',
                        border: 'none',
                        background: selectedParts.length === 0 ? '#94a3b8' : '#0891b2',
                        color: 'white',
                        cursor: selectedParts.length === 0 ? 'not-allowed' : 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    جاری رکھیں ({selectedParts.length})
                </button>
            </div>
        </div>
    );
};

export default DetailedBodySelector;
