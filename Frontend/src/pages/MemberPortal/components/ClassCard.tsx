import React from 'react';
import { asset, ClassItem } from '../shared';

export function ClassCard({ item, onSelect }: { item: any, onSelect: (item: any) => void }) {
  return (
<article
                    className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-xl hover:shadow-teal-900/5 hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col"
                    
                    onClick={() => onSelect(item)}
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        src={asset("classes", item.image)}
                        alt=""
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <span className="inline-block px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-lg text-white text-[11px] font-bold uppercase tracking-wider mb-2 border border-white/30">
                          {item.room}
                        </span>
                        <h3 className="text-lg font-bold text-white leading-tight">{item.title}</h3>
                      </div>
                    </div>

                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex items-center gap-2 mb-4 text-sm font-medium text-slate-600">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                        <span>HLV: <strong className="text-slate-800">{item.coach}</strong></span>
                      </div>
                      <div className="flex items-center gap-2 mb-6 text-sm font-medium text-slate-600">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                        <span className="text-slate-800">{item.schedule}</span>
                      </div>

                      <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">{item.spaces}</span>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            onSelect(item);
                          }}
                          type="button"
                          className="px-4 py-2 bg-teal-50 hover:bg-teal-600 text-teal-700 hover:text-white font-bold text-sm rounded-xl transition-colors duration-200"
                        >
                          Đặt chỗ
                        </button>
                      </div>
                    </div>
                  </article>
  );
}
