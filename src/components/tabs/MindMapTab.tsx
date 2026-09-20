import React, { useState, useRef } from 'react';
import { MindMapData, MindMapNode } from '../../types';

interface MindMapTabProps {
  mindMap: MindMapData;
  documentTitle: string;
}

export const MindMapTab: React.FC<MindMapTabProps> = ({ mindMap, documentTitle }) => {
  const [zoom, setZoom] = useState(1.0);
  const [collapsedBranches, setCollapsedBranches] = useState<Record<string, boolean>>({});

  const safeRoot = mindMap?.root || {
    title: documentTitle || 'Core Subject Matter',
    subtitle: 'Ontological Root',
    sectionRef: 'Full Document',
    description: 'Synthesized core knowledge hierarchy.',
  };
  const safeBranches = mindMap?.branches || [];

  const [selectedNode, setSelectedNode] = useState<MindMapNode | null>(() => {
    return (
      safeBranches[0]?.keyPoints?.[0] || {
        id: 'root-default',
        label: 'Concept Root',
        title: safeRoot.title,
        description: safeRoot.description,
      }
    );
  });
  const [viewMode, setViewMode] = useState<'tree' | 'outline'>('tree');
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    let text = `${documentTitle} — Concept Mind Map Outline\nRoot: ${safeRoot.title}\n\n`;
    safeBranches.forEach((branch, idx) => {
      text += `${idx + 1}. ${branch.title}\n`;
      branch.keyPoints?.forEach((kp) => {
        text += `   • ${kp.title}: ${kp.description}\n`;
      });
      text += '\n';
    });
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const viewportRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);

  const totalPoints = safeBranches.reduce((acc, b) => acc + (b.keyPoints?.length || 0), 0);

  const handleZoomIn = () => setZoom((prev) => Math.min(1.4, Number((prev + 0.15).toFixed(2))));
  const handleZoomOut = () => setZoom((prev) => Math.max(0.65, Number((prev - 0.15).toFixed(2))));
  const handleResetZoom = () => {
    setZoom(1.0);
    if (viewportRef.current) {
      viewportRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  };

  const toggleBranch = (branchId: string) => {
    setCollapsedBranches((prev) => ({ ...prev, [branchId]: !prev[branchId] }));
  };

  const areAllCollapsed = safeBranches.length > 0 && safeBranches.every((b) => collapsedBranches[b.id]);
  const toggleAll = () => {
    const newState = !areAllCollapsed;
    const updated: Record<string, boolean> = {};
    safeBranches.forEach((b) => {
      updated[b.id] = newState;
    });
    setCollapsedBranches(updated);
  };

  // Drag to pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!viewportRef.current) return;
    isDraggingRef.current = true;
    startXRef.current = e.pageX - viewportRef.current.offsetLeft;
    scrollLeftRef.current = viewportRef.current.scrollLeft;
  };

  const handleMouseLeave = () => {
    isDraggingRef.current = false;
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !viewportRef.current) return;
    e.preventDefault();
    const x = e.pageX - viewportRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    viewportRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  return (
    <article className="w-full flex flex-col gap-space-sm animate-in fade-in duration-200 text-[#1C1917]">
      {/* Mind Map Sub-Header & Meta Controls */}
      <section className="flex flex-col gap-space-sm mb-space-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#1B4332] text-[18px]">
                schema
              </span>
              <h2 className="font-headline-sm text-lg sm:text-xl font-bold text-[#1C1917]">
                Concept Tree: {safeRoot.title}
              </h2>
            </div>
            <p className="font-mono text-xs text-[#78716C] mt-0.5">
              1 Root • {safeBranches.length} Subtopics • {totalPoints} Key Points • High-yield ontology
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className={`h-8 px-3.5 rounded-full font-label-sm text-xs flex items-center gap-space-xs transition-all active:scale-95 cursor-pointer font-bold ${
                copied
                  ? 'bg-[#14382A] text-white shadow-xs'
                  : 'bg-[#1B4332] hover:bg-[#14382A] text-white shadow-xs'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">
                {copied ? 'check' : 'content_copy'}
              </span>
              <span>{copied ? 'Copied Outline' : 'Copy Outline'}</span>
            </button>

            <div className="flex items-center bg-white p-0.5 rounded-lg border border-[#E5E0D8] shadow-xs">
              <button
                onClick={() => setViewMode('tree')}
                className={`px-2.5 py-1 rounded font-mono text-xs flex items-center gap-1 transition-all cursor-pointer ${
                  viewMode === 'tree'
                    ? 'bg-[#1B4332] text-white font-bold shadow-xs'
                    : 'text-[#78716C] hover:text-[#1C1917]'
                }`}
                type="button"
              >
                <span className="material-symbols-outlined text-[14px]">account_tree</span>
                <span>Tree</span>
              </button>
              <button
                onClick={() => setViewMode('outline')}
                className={`px-2.5 py-1 rounded font-mono text-xs flex items-center gap-1 transition-all cursor-pointer ${
                  viewMode === 'outline'
                    ? 'bg-[#1B4332] text-white font-bold shadow-xs'
                    : 'text-[#78716C] hover:text-[#1C1917]'
                }`}
                type="button"
              >
                <span className="material-symbols-outlined text-[14px]">format_list_bulleted</span>
                <span>Outline</span>
              </button>
            </div>
          </div>
        </div>

        {/* Canvas Floating Toolbar & Interactive Pill */}
        <div className="flex items-center justify-between bg-white px-space-md py-2 rounded-xl shadow-xs border border-[#E5E0D8]">
          <div className="flex items-center gap-1 text-[#57534E]">
            <button
              onClick={handleZoomIn}
              className="w-8 h-8 rounded-lg hover:bg-[#FAF8F5] text-[#57534E] hover:text-[#1C1917] flex items-center justify-center transition-colors cursor-pointer"
              title="Zoom in"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">zoom_in</span>
            </button>
            <button
              onClick={handleZoomOut}
              className="w-8 h-8 rounded-lg hover:bg-[#FAF8F5] text-[#57534E] hover:text-[#1C1917] flex items-center justify-center transition-colors cursor-pointer"
              title="Zoom out"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">zoom_out</span>
            </button>
            <button
              onClick={handleResetZoom}
              className="w-8 h-8 rounded-lg hover:bg-[#FAF8F5] text-[#57534E] hover:text-[#1C1917] flex items-center justify-center transition-colors cursor-pointer"
              title="Fit to screen"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">filter_center_focus</span>
            </button>
            <span className="text-[#1B4332] font-mono text-[11px] px-1.5 py-0.5 rounded bg-[#1B4332]/10 border border-[#1B4332]/25 ml-1 font-bold">
              {Math.round(zoom * 100)}%
            </span>
          </div>

          <div className="flex items-center gap-space-xs">
            <button
              onClick={toggleAll}
              className="h-8 px-2.5 rounded-lg bg-[#FAF8F5] hover:bg-[#EAE5DC] text-[#1C1917] border border-[#E5E0D8] font-mono text-xs flex items-center gap-1 transition-colors cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[15px]">
                {areAllCollapsed ? 'unfold_more' : 'unfold_less'}
              </span>
              <span>{areAllCollapsed ? 'Expand All' : 'Collapse All'}</span>
            </button>
            <span className="hidden sm:inline-flex items-center gap-1 font-mono text-xs text-[#78716C]">
              <span className="material-symbols-outlined text-[14px] text-[#1B4332]">touch_app</span>
              <span>Tap card to inspect excerpt</span>
            </span>
          </div>
        </div>
      </section>

      {/* View Mode: Tree vs Outline */}
      {viewMode === 'tree' ? (
        /* Interactive Scrollable Mind Map Canvas */
        <div className="relative w-full rounded-2xl bg-[#F5F2EC] shadow-xs overflow-hidden border border-[#E5E0D8] border-l-4 border-l-[#1B4332]">
          <div
            ref={viewportRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            className="w-full overflow-x-auto overflow-y-hidden p-space-lg cursor-grab active:cursor-grabbing select-none"
            style={{
              backgroundImage: 'radial-gradient(#D6D0C4 1.25px, transparent 1.25px)',
              backgroundSize: '22px 22px',
              backgroundColor: '#F5F2EC',
            }}
          >
            <div
              className="min-w-[820px] transition-transform duration-150 origin-top-left py-space-sm flex flex-col gap-space-lg"
              style={{ transform: `scale(${zoom})` }}
            >
              {/* Root Node Tier */}
              <div className="flex justify-start pl-2">
                <div
                  onClick={() =>
                    setSelectedNode({
                      id: 'root',
                      label: 'Root Ontology',
                      title: safeRoot.title,
                      description: safeRoot.description,
                      sourceCitation: safeRoot.sectionRef || 'All Sections',
                      excerptText: safeRoot.description,
                      pageRef: 'Chapter Overview',
                    })
                  }
                  className="group relative flex items-start gap-3 bg-white p-3.5 rounded-xl shadow-xs max-w-sm cursor-pointer hover:bg-[#FAF8F5] transition-all border border-[#E5E0D8]"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#1B4332]/10 border border-[#1B4332]/25 text-[#1B4332] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[22px]">neurology</span>
                  </div>
                  <div className="flex flex-col pr-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] px-1.5 py-0.2 bg-[#1B4332]/10 border border-[#1B4332]/25 text-[#1B4332] font-bold rounded">
                         ROOT ONTOLOGY
                      </span>
                      <span className="font-mono text-[11px] text-[#78716C]">
                        {safeRoot.sectionRef || 'Full Chapter'}
                      </span>
                    </div>
                    <h3 className="font-headline-sm text-base text-[#1C1917] font-bold mt-0.5">
                      {safeRoot.title}
                    </h3>
                    <p className="font-body-sm text-xs text-[#57534E] mt-0.5 line-clamp-2">
                      {safeRoot.description}
                    </p>
                  </div>
                  <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#1B4332] text-white flex items-center justify-center text-[10px]">
                    <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                  </div>
                </div>
              </div>

              {/* Connecting Line Root to Level 1 Nodes */}
              <div className="relative w-full pl-6 -my-3">
                <svg className="w-full h-8 overflow-visible" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M 12 0 V 16 H 48"
                    fill="none"
                    stroke="#D6D0C4"
                    strokeDasharray="3 3"
                    strokeWidth="2"
                  />
                </svg>
              </div>

              {/* Primary Branch Containers */}
              <div className="flex flex-col gap-space-lg relative pl-8">
                {/* Continuous left branch spine rule */}
                <div className="absolute left-3 top-2 bottom-6 w-0.5 bg-[#E5E0D8]"></div>

                {safeBranches.map((branch, bIdx) => {
                  const isCollapsed = collapsedBranches[branch.id];

                  return (
                    <div key={branch.id} className="relative flex flex-col gap-3 group/branch">
                      {/* Branch Header Node */}
                      <div className="flex items-center gap-3">
                        <div
                          onClick={() => toggleBranch(branch.id)}
                          className="relative flex items-center justify-between w-80 bg-white p-3 rounded-xl shadow-xs cursor-pointer hover:bg-[#FAF8F5] transition-colors border border-[#E5E0D8]"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-md bg-[#1B4332]/10 border border-[#1B4332]/25 text-[#1B4332] flex items-center justify-center font-mono text-xs font-bold">
                              {branch.romanNumeral || bIdx + 1}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h4 className="font-headline-sm text-sm leading-5 text-[#1C1917] font-semibold">
                                  {branch.title}
                                </h4>
                                {branch.examBadge && (
                                  <span className="px-1.5 py-0.2 rounded bg-[#1B4332]/10 border border-[#1B4332]/25 text-[#1B4332] font-mono text-[10px] font-bold">
                                    {branch.examBadge}
                                  </span>
                                )}
                              </div>
                              <p className="font-mono text-xs text-[#78716C] truncate max-w-[170px]">
                                {branch.subtitle}
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleBranch(branch.id);
                            }}
                            className="flex items-center gap-0.5 px-2 py-0.5 rounded bg-[#FAF8F5] text-[#57534E] hover:text-[#1C1917] text-[11px] font-mono cursor-pointer border border-[#E5E0D8]"
                            type="button"
                          >
                            <span>{branch.keyPoints?.length || 0} pts</span>
                            <span className="material-symbols-outlined text-[14px]">
                              {isCollapsed ? 'expand_more' : 'expand_less'}
                            </span>
                          </button>
                        </div>

                        {branch.tag && (
                          <span className="font-mono text-xs text-[#78716C] italic">
                            {branch.tag}
                          </span>
                        )}
                      </div>

                      {/* Branch Children (Key Points) */}
                      {!isCollapsed && (
                        <div className="flex flex-col gap-2.5 pl-10 relative">
                          <div className="absolute left-4 top-0 bottom-4 w-0.5 bg-[#E5E0D8]"></div>

                          {branch.keyPoints?.map((pt) => {
                            const isSelected = selectedNode?.id === pt.id;

                            return (
                              <div key={pt.id} className="relative flex items-center gap-3">
                                <div className="absolute -left-6 top-1/2 w-5 h-0.5 bg-[#E5E0D8]"></div>
                                <div
                                  onClick={() => setSelectedNode(pt)}
                                  className={`w-96 p-3 rounded-xl bg-white shadow-xs transition-all cursor-pointer border ${
                                    isSelected
                                      ? 'border-[#1B4332] ring-2 ring-[#1B4332]/20 bg-[#FAF8F5]'
                                      : 'border-[#E5E0D8] hover:bg-[#FAF8F5]'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-mono text-xs text-[#78716C]">
                                      {pt.label}
                                    </span>
                                    {pt.tag ? (
                                      <span className="font-mono text-xs text-[#1B4332] font-semibold">
                                        {pt.tag}
                                      </span>
                                    ) : (
                                      <span
                                        className="w-2 h-2 rounded-full"
                                        style={{ backgroundColor: pt.tagColor || '#1B4332' }}
                                      ></span>
                                    )}
                                  </div>
                                  <h5 className="font-headline-sm text-sm text-[#1C1917] font-semibold mt-0.5">
                                    {pt.title}
                                  </h5>
                                  <p className="font-body-sm text-xs text-[#57534E] mt-1 leading-normal">
                                    {pt.description}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Canvas bottom status bar */}
          <div className="px-space-md py-2.5 bg-white flex items-center justify-between border-t border-[#E5E0D8]">
            <div className="flex items-center gap-2 text-[#78716C]">
              <span className="material-symbols-outlined text-[16px] text-[#1B4332]">info</span>
              <span className="font-mono text-xs">
                Tap any concept card to preview source citation & details
              </span>
            </div>
            <span className="font-mono text-xs text-[#78716C] font-medium">
              Pan & Pinch enabled
            </span>
          </div>
        </div>
      ) : (
        /* Outline Mode */
        <div className="flex flex-col gap-space-sm bg-white rounded-2xl p-space-md border border-[#E5E0D8] border-l-4 border-l-[#1B4332] shadow-xs">
          <div className="p-space-sm bg-[#1B4332]/5 rounded-xl border border-[#1B4332]/20">
            <h3 className="font-headline-sm text-base text-[#1C1917] font-bold">{safeRoot.title}</h3>
            <p className="font-body-sm text-xs text-[#57534E] mt-0.5">{safeRoot.description}</p>
          </div>

          {safeBranches.map((b) => (
            <div key={b.id} className="mt-2 pl-2 border-l-2 border-[#1B4332]/40 flex flex-col gap-2">
              <h4 className="font-headline-sm text-sm text-[#1C1917] font-semibold">
                {b.romanNumeral}. {b.title}
              </h4>
              <div className="flex flex-col gap-2 pl-3">
                {b.keyPoints?.map((pt) => (
                  <div
                    key={pt.id}
                    onClick={() => setSelectedNode(pt)}
                    className="p-2.5 rounded-xl bg-[#FAF8F5] hover:bg-[#EAE5DC] border border-[#E5E0D8] cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-[#1B4332] font-medium">{pt.label}</span>
                      <span className="font-mono text-xs text-[#78716C]">{pt.pageRef || 'Citation'}</span>
                    </div>
                    <p className="font-body-md font-medium text-[#1C1917] text-sm mt-0.5">{pt.title}</p>
                    <p className="font-body-sm text-xs text-[#57534E] mt-0.5">{pt.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bottom Drawer Excerpt Preview (Academic Micro-Viewer) */}
      {selectedNode && (
        <section className="bg-white p-space-md rounded-2xl shadow-xs border border-[#E5E0D8] border-l-4 border-l-[#1B4332] mt-space-sm animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-space-sm mb-space-sm bg-[#FAF8F5] -mx-space-md -mt-space-md px-space-md pt-space-sm rounded-t-2xl border-b border-[#E5E0D8]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#1B4332] text-[18px]">
                menu_book
              </span>
              <span className="font-headline-sm text-sm font-semibold text-[#1C1917]">
                Selected Concept: {selectedNode.title}
              </span>
            </div>
            <span className="font-mono text-xs text-[#78716C]">
              {selectedNode.pageRef || selectedNode.sourceCitation || 'Document Reference'}
            </span>
          </div>

          <div className="flex flex-col gap-space-xs">
            <h4 className="font-headline-sm text-base font-bold text-[#1C1917]">
              "{selectedNode.title}"
            </h4>
            <p className="font-body-md text-sm text-[#33302E] leading-relaxed">
              {selectedNode.excerptText || selectedNode.description}
            </p>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-space-xs mt-2 border-t border-[#E5E0D8]">
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded bg-[#FAF8F5] border border-[#E5E0D8] text-[#57534E] font-mono text-xs">
                  {selectedNode.tag || selectedNode.label || 'Ontology Node'}
                </span>
                <span className="px-2 py-0.5 rounded bg-[#FAF8F5] border border-[#E5E0D8] text-[#57534E] font-mono text-xs">
                  {documentTitle}
                </span>
              </div>
            </div>
          </div>
        </section>
      )}
    </article>
  );
};
