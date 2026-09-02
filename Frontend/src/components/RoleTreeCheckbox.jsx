import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, ChevronDown, Check, Minus, Search } from 'lucide-react';

const IndeterminateCheckbox = ({ checked, indeterminate, onChange, label, sublabel, id }) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = Boolean(indeterminate);
    }
  }, [indeterminate]);

  return (
    <label htmlFor={id} className="flex items-center gap-2.5 cursor-pointer select-none group py-1">
      <div className="relative flex items-center justify-center">
        <input
          ref={inputRef}
          type="checkbox"
          id={id}
          checked={Boolean(checked)}
          onChange={onChange}
          className="peer sr-only"
        />
        <div className={`w-5 h-5 rounded-md border transition-all flex items-center justify-center ${
          checked
            ? 'bg-brand-500 border-brand-400 text-white shadow-md shadow-brand-500/30'
            : indeterminate
            ? 'bg-brand-500/30 border-brand-400 text-brand-300'
            : 'border-white/[0.2] bg-white/[0.04] group-hover:border-white/[0.4]'
        }`}>
          {checked && <Check size={14} className="stroke-[3]" />}
          {!checked && indeterminate && <Minus size={14} className="stroke-[3]" />}
        </div>
      </div>
      <div className="flex flex-col">
        <span className={`text-sm font-medium transition-colors ${checked || indeterminate ? 'text-white font-semibold' : 'text-surface-300 group-hover:text-white'}`}>
          {label}
        </span>
        {sublabel && <span className="text-xs font-mono text-surface-500">{sublabel}</span>}
      </div>
    </label>
  );
};

const RoleTreeCheckbox = ({ rawList = [], selectedFeatureIds = [], onChangeSelected }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedApps, setExpandedApps] = useState({});
  const [expandedFuncs, setExpandedFuncs] = useState({});
  const [checkedIds, setCheckedIds] = useState(new Set(selectedFeatureIds.map(id => Number(id))));

  useEffect(() => {
    setCheckedIds(new Set(selectedFeatureIds.map(id => Number(id))));
  }, [selectedFeatureIds]);

  // Expand all by default
  useEffect(() => {
    if (Array.isArray(rawList) && rawList.length > 0) {
      const initApps = {};
      const initFuncs = {};
      rawList.forEach(app => {
        initApps[app.id] = true;
        app.functions?.forEach(func => {
          initFuncs[func.id] = true;
        });
      });
      setExpandedApps(initApps);
      setExpandedFuncs(initFuncs);
    }
  }, [rawList]);

  const toggleAppExpand = (appId) => {
    setExpandedApps(prev => ({ ...prev, [appId]: !prev[appId] }));
  };

  const toggleFuncExpand = (funcId) => {
    setExpandedFuncs(prev => ({ ...prev, [funcId]: !prev[funcId] }));
  };

  // Helper functions for state determination
  const getAllFeatureIdsForFunc = (func) => (func.features || []).map(f => Number(f.id));
  const getAllFeatureIdsForApp = (app) => (app.functions || []).flatMap(getAllFeatureIdsForFunc);

  const isFeatureChecked = (featId) => checkedIds.has(Number(featId));

  const isFuncChecked = (func) => {
    const fIds = getAllFeatureIdsForFunc(func);
    if (fIds.length === 0) return false;
    return fIds.every(id => checkedIds.has(id));
  };

  const isFuncIndeterminate = (func) => {
    const fIds = getAllFeatureIdsForFunc(func);
    if (fIds.length === 0) return false;
    const checkedCount = fIds.filter(id => checkedIds.has(id)).length;
    return checkedCount > 0 && checkedCount < fIds.length;
  };

  const isAppChecked = (app) => {
    const fIds = getAllFeatureIdsForApp(app);
    if (fIds.length === 0) return false;
    return fIds.every(id => checkedIds.has(id));
  };

  const isAppIndeterminate = (app) => {
    const fIds = getAllFeatureIdsForApp(app);
    if (fIds.length === 0) return false;
    const checkedCount = fIds.filter(id => checkedIds.has(id)).length;
    return checkedCount > 0 && checkedCount < fIds.length;
  };

  // Checkbox change handlers
  const handleFeatureToggle = (featId) => {
    const next = new Set(checkedIds);
    const id = Number(featId);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setCheckedIds(next);
    onChangeSelected(Array.from(next));
  };

  const handleFuncToggle = (func) => {
    const fIds = getAllFeatureIdsForFunc(func);
    const isCurrentlyChecked = isFuncChecked(func);
    const next = new Set(checkedIds);

    if (isCurrentlyChecked) {
      fIds.forEach(id => next.delete(id));
    } else {
      fIds.forEach(id => next.add(id));
    }
    setCheckedIds(next);
    onChangeSelected(Array.from(next));
  };

  const handleAppToggle = (app) => {
    const fIds = getAllFeatureIdsForApp(app);
    const isCurrentlyChecked = isAppChecked(app);
    const next = new Set(checkedIds);

    if (isCurrentlyChecked) {
      fIds.forEach(id => next.delete(id));
    } else {
      fIds.forEach(id => next.add(id));
    }
    setCheckedIds(next);
    onChangeSelected(Array.from(next));
  };

  // Filter list by search term
  const filteredApps = rawList.map(app => {
    const searchLower = searchTerm.toLowerCase();
    const appMatch = app.name.toLowerCase().includes(searchLower);

    const matchingFuncs = (app.functions || []).map(func => {
      const funcMatch = func.name.toLowerCase().includes(searchLower) || func.url.toLowerCase().includes(searchLower);
      const matchingFeatures = (func.features || []).filter(feat =>
        feat.name.toLowerCase().includes(searchLower) || feat.url.toLowerCase().includes(searchLower)
      );

      if (funcMatch || matchingFeatures.length > 0 || appMatch) {
        return {
          ...func,
          features: appMatch || funcMatch ? func.features : matchingFeatures
        };
      }
      return null;
    }).filter(Boolean);

    if (appMatch || matchingFuncs.length > 0) {
      return { ...app, functions: matchingFuncs };
    }
    return null;
  }).filter(Boolean);

  return (
    <div className="space-y-4">
      {/* Search Input Filter */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 text-surface-400" size={16} />
        <input
          type="text"
          placeholder="Cari Screen Function atau API Feature (misal: User Master, Delete, /api/geofences)..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-500 placeholder:text-surface-500"
        />
      </div>

      {filteredApps.length === 0 ? (
        <div className="p-8 text-center text-surface-400 text-sm italic border border-white/[0.06] rounded-2xl">
          Tidak ada hak akses yang cocok dengan pencarian "{searchTerm}"
        </div>
      ) : (
        <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
          {filteredApps.map(app => {
            const isExpanded = expandedApps[app.id];
            const appChecked = isAppChecked(app);
            const appIndeterminate = isAppIndeterminate(app);

            return (
              <div key={app.id} className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 space-y-2">
                {/* LEVEL 1: APPLICATION HEADER */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleAppExpand(app.id)}
                    className="p-1 rounded-lg hover:bg-white/[0.08] text-surface-400 hover:text-white transition-colors"
                  >
                    {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </button>
                  <IndeterminateCheckbox
                    id={`app-${app.id}`}
                    checked={appChecked}
                    indeterminate={appIndeterminate}
                    onChange={() => handleAppToggle(app)}
                    label={app.name}
                    sublabel={`Aplikasi Application #${app.id}`}
                  />
                </div>

                {/* LEVEL 2: FUNCTIONS TREE */}
                {isExpanded && (
                  <div className="pl-7 space-y-2 border-l-2 border-brand-500/20 ml-3 mt-2 pt-1">
                    {(app.functions || []).map(func => {
                      const isFuncExp = expandedFuncs[func.id];
                      const funcChecked = isFuncChecked(func);
                      const funcIndet = isFuncIndeterminate(func);

                      return (
                        <div key={func.id} className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-3 space-y-2">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => toggleFuncExpand(func.id)}
                              className="p-1 rounded-lg hover:bg-white/[0.08] text-surface-400 hover:text-white transition-colors"
                            >
                              {isFuncExp ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </button>
                            <IndeterminateCheckbox
                              id={`func-${app.id}-${func.id}`}
                              checked={funcChecked}
                              indeterminate={funcIndet}
                              onChange={() => handleFuncToggle(func)}
                              label={func.name}
                              sublabel={`URL: ${func.url}`}
                            />
                          </div>

                          {/* LEVEL 3: GRANULAR API FEATURE ACTION CHECKBOXES */}
                          {isFuncExp && (
                            <div className="pl-7 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 border-l border-brand-500/20 ml-2.5 pt-1.5 pb-1">
                              {(func.features || []).map(feat => {
                                const featChecked = isFeatureChecked(feat.id);

                                return (
                                  <div key={feat.id} className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] transition-all">
                                    <IndeterminateCheckbox
                                      id={`feat-${app.id}-${func.id}-${feat.id}`}
                                      checked={featChecked}
                                      indeterminate={false}
                                      onChange={() => handleFeatureToggle(feat.id)}
                                      label={feat.name}
                                      sublabel={`[${feat.method}] ${feat.url}`}
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RoleTreeCheckbox;
