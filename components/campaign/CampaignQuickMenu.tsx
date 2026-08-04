"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";

interface AccordionItem {
  id: string;
  label: string;
  count: number;
  subtitle?: string;
}

export function CampaignQuickMenu({
  items,
  children,
}: {
  items: AccordionItem[];
  children: React.ReactNode[];
}) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="rounded-2xl border border-slate-100 divide-y divide-slate-100">
      {items.map((item, i) => {
        const isOpen = openId === item.id;
        return (
          <div key={item.id}>
            <button
              onClick={() => setOpenId(isOpen ? null : item.id)}
              className="w-full flex items-center justify-between gap-3 p-4 hover:bg-slate-50 transition-colors text-left"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-800">{item.label}</span>
                  <span className="rounded-full bg-secondary-light px-2 py-0.5 text-xs font-semibold text-secondary-dark">
                    {item.count}
                  </span>
                </div>
                {item.subtitle && <p className="text-xs text-slate-400 mt-0.5">{item.subtitle}</p>}
              </div>
              {isOpen ? (
                <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
              )}
            </button>
            {isOpen && <div className="px-4 pb-4">{children[i]}</div>}
          </div>
        );
      })}
    </div>
  );
}