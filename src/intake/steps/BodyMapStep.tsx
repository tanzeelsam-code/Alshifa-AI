import React, { useState, useMemo } from 'react';
import { BodyRegistry, BodyZoneDefinition } from '../data/BodyZoneRegistry';
import { AnatomicalResolver } from '../logic/AnatomicalResolver';
import { ClinicalBodyMap } from '../svg/ClinicalBodyMap';
import { ZoneRefinementModal } from '../components/ZoneRefinementModal';
import { Language } from '../types/intake';
import { ChevronLeft, ChevronRight, Map, List, Layers, Activity } from 'lucide-react';

interface BodyMapStepProps {
  language: Language;
  onComplete: (zones: BodyZoneDefinition[]) => void;
  onBack?: () => void;
}

interface RefinementData {
  id: string;
  message: string;
  options: Array<{
    id: string;
    label: string;
    clinical: string;
  }>;
}

/**
 * Premium Body Map Selection Step
 * Unifies interactive SVG selection with refinement logic and fallback list UI
 */
export function BodyMapStep({ language, onComplete, onBack }: BodyMapStepProps) {
  const [selectedZones, setSelectedZones] = useState<BodyZoneDefinition[]>([]);
  const [view, setView] = useState<'front' | 'back'>('front');
  const [activeTab, setActiveTab] = useState<'map' | 'list'>('map');
  const [refinement, setRefinement] = useState<RefinementData | null>(null);

  const toggleZone = (zoneId: string) => {
    const zone = BodyRegistry.getZone(zoneId);
    if (!zone) return;

    // Check if this zone needs refinement (e.g., "ABDOMEN" -> specify which region)
    if (AnatomicalResolver.needsRefinement(zoneId)) {
      const children = BodyRegistry.getChildren(zoneId);
      setRefinement({
        id: zoneId,
        message: language === 'ur'
          ? `${zone.label_ur} میں درد کی نشاندہی کریں`
          : `Specify the location in the ${zone.label_en}`,
        options: children.map(child => ({
          id: child.id,
          label: language === 'ur' ? child.label_ur : child.label_en,
          clinical: child.clinical_term
        }))
      });
      return;
    }

    setSelectedZones(prev => {
      const exists = prev.find(z => z.id === zoneId);
      if (exists) {
        return prev.filter(z => z.id !== zoneId);
      } else {
        return [...prev, zone];
      }
    });
  };

  const handleRefinementSelection = (childId: string) => {
    const child = BodyRegistry.getZone(childId);
    if (child) {
      setSelectedZones(prev => {
        if (prev.find(z => z.id === childId)) return prev;
        return [...prev, child];
      });
    }
    setRefinement(null);
  };

  const getText = (key: string): string => {
    const texts: Record<string, Record<string, string>> = {
      title: { en: 'Pinpoint the Issue', ur: 'درد یا تکلیف کی نشاندہی کریں' },
      subtitle: { en: 'Select ALL areas where you are feeling discomfort', ur: 'تمام متاثرہ جسمانی حصے منتخب کریں' },
      selected: { en: 'Identified Areas', ur: 'منتخب شدہ حصے' },
      continue: { en: 'Confirm & Continue', ur: 'تصدیق کریں اور آگے بڑھیں' },
      back: { en: 'Back', ur: 'واپس' },
      front: { en: 'Front View', ur: 'سامنے کا حصہ' },
      backView: { en: 'Back View', ur: 'پچھلا حصہ' },
      listView: { en: 'List View', ur: 'فہرست' },
      mapView: { en: 'Interactive Map', ur: 'نقشہ' }
    };
    return texts[key]?.[language] || texts[key]?.en || key;
  };

  const groupByCategory = useMemo<Record<string, BodyZoneDefinition[]>>(() => {
    const categories: Record<string, BodyZoneDefinition[]> = {};
    BodyRegistry.getTerminalZones().forEach(zone => {
      if (!categories[zone.category]) categories[zone.category] = [];
      categories[zone.category].push(zone);
    });
    return categories;
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8 bg-white rounded-[2rem] shadow-2xl border border-slate-100 min-h-[600px] flex flex-col">
      {/* Header */}
      <div className="mb-8 text-center sm:text-left flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight mb-2">
            {getText('title')}
          </h2>
          <p className="text-slate-500 font-medium max-w-md">
            {getText('subtitle')}
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex bg-slate-100 p-1 rounded-2xl self-center sm:self-auto">
          <button
            onClick={() => setActiveTab('map')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'map' ? 'bg-white shadow-md text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Map size={16} /> {getText('mapView')}
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'list' ? 'bg-white shadow-md text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <List size={16} /> {getText('listView')}
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Primary Selector (Map or List) */}
        <div className="lg:col-span-7 xl:col-span-8 bg-slate-50/50 rounded-[2.5rem] p-6 border border-slate-100/50 flex flex-col items-center justify-center relative overflow-hidden">
          {activeTab === 'map' ? (
            <div className="w-full max-w-md">
              <div className="flex justify-center gap-3 mb-6 relative z-10">
                <button
                  onClick={() => setView('front')}
                  className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${view === 'front' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
                >
                  {getText('front')}
                </button>
                <button
                  onClick={() => setView('back')}
                  className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${view === 'back' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
                >
                  {getText('backView')}
                </button>
              </div>
              <ClinicalBodyMap
                view={view}
                language={language as 'en' | 'ur'}
                selectedZones={selectedZones.map(z => z.id)}
                onZoneClick={toggleZone}
              />
            </div>
          ) : (
            <div className="w-full h-full overflow-y-auto pr-2 space-y-6">
              {Object.entries(groupByCategory).map(([catId, zones]) => (
                <div key={catId} className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                    <Layers size={14} /> {catId.replace('_', ' ')}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {(zones as BodyZoneDefinition[]).map(zone => {
                      const selected = selectedZones.find(z => z.id === zone.id);
                      return (
                        <button
                          key={zone.id}
                          onClick={() => toggleZone(zone.id)}
                          className={`px-4 py-3 rounded-2xl text-sm font-bold transition-all border-2 text-left ${selected ? 'bg-indigo-50 border-indigo-400 text-indigo-700 shadow-sm' : 'bg-white border-slate-100 text-slate-600 hover:border-slate-300'}`}
                        >
                          {language === 'ur' ? zone.label_ur : zone.label_en}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Summary & Action */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6">
          <div className="flex-1 bg-white border-2 border-slate-100 rounded-[2rem] p-6 flex flex-col">
            <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
              <Activity className="text-indigo-500" size={20} /> {getText('selected')}
            </h3>

            {selectedZones.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-40">
                <div className="w-16 h-16 rounded-full bg-slate-100 mb-4 flex items-center justify-center">
                  <Map className="text-slate-300" size={32} />
                </div>
                <p className="text-sm font-bold text-slate-400">No areas selected yet</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                {selectedZones.map(zone => (
                  <div
                    key={zone.id}
                    className="flex items-center justify-between p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 group"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-extrabold text-indigo-900">
                        {language === 'ur' ? zone.label_ur : zone.label_en}
                      </span>
                      <span className="text-[10px] font-medium text-indigo-400 uppercase tracking-tight">
                        {zone.clinical_term}
                      </span>
                    </div>
                    <button
                      onClick={() => toggleZone(zone.id)}
                      className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col gap-3">
              <button
                onClick={() => onComplete(selectedZones)}
                disabled={selectedZones.length === 0}
                className={`w-full py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${selectedZones.length > 0 ? 'bg-slate-900 text-white shadow-xl hover:-translate-y-1 active:scale-95' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
              >
                {getText('continue')} <ChevronRight size={18} />
              </button>

              {onBack && (
                <button
                  onClick={onBack}
                  className="w-full py-4 rounded-2xl text-sm font-bold text-slate-500 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                >
                  <ChevronLeft size={18} /> {getText('back')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {refinement && (
        <ZoneRefinementModal
          refinement={refinement}
          language={language as 'en' | 'ur'}
          onSelect={handleRefinementSelection}
          onCancel={() => setRefinement(null)}
        />
      )}
    </div>
  );
}
