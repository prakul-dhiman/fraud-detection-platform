import React, { useState, useEffect } from 'react';
import { Command } from 'cmdk';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, Activity, ShieldAlert, UploadCloud, Terminal } from 'lucide-react';

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleSelect = (route) => {
    navigate(route);
    setOpen(false);
  };

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Global Command Menu"
      className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-[#111116] border border-[#2a2a35] rounded-xl shadow-2xl overflow-hidden z-50 text-white"
    >
      <div className="flex items-center border-b border-[#2a2a35] px-3 py-2">
        <Search className="w-5 h-5 text-gray-400 mr-2" />
        <Command.Input
          placeholder="Search transactions, cases, reports..."
          className="flex-1 bg-transparent text-white outline-none placeholder:text-gray-500 py-2"
        />
      </div>
      <Command.List className="max-h-[300px] overflow-y-auto p-2">
        <Command.Empty className="py-6 text-center text-gray-400 text-sm">No results found.</Command.Empty>

        <Command.Group heading="Navigation" className="text-xs font-medium text-gray-500 px-2 py-1">
          <Command.Item
            onSelect={() => handleSelect('/dashboard')}
            className="flex items-center px-2 py-2.5 rounded-md cursor-pointer hover:bg-[#1a1a24] aria-selected:bg-[#1a1a24] text-sm text-gray-200 mt-1"
          >
            <Activity className="w-4 h-4 mr-2 text-gray-400" /> Dashboard
          </Command.Item>
          <Command.Item
            onSelect={() => handleSelect('/history')}
            className="flex items-center px-2 py-2.5 rounded-md cursor-pointer hover:bg-[#1a1a24] aria-selected:bg-[#1a1a24] text-sm text-gray-200"
          >
            <FileText className="w-4 h-4 mr-2 text-gray-400" /> Transactions History
          </Command.Item>
          <Command.Item
            onSelect={() => handleSelect('/alerts')}
            className="flex items-center px-2 py-2.5 rounded-md cursor-pointer hover:bg-[#1a1a24] aria-selected:bg-[#1a1a24] text-sm text-gray-200"
          >
            <ShieldAlert className="w-4 h-4 mr-2 text-gray-400" /> Alert Center
          </Command.Item>
          <Command.Item
            onSelect={() => handleSelect('/reports')}
            className="flex items-center px-2 py-2.5 rounded-md cursor-pointer hover:bg-[#1a1a24] aria-selected:bg-[#1a1a24] text-sm text-gray-200"
          >
            <FileText className="w-4 h-4 mr-2 text-gray-400" /> Reports
          </Command.Item>
          <Command.Item
            onSelect={() => handleSelect('/api-playground')}
            className="flex items-center px-2 py-2.5 rounded-md cursor-pointer hover:bg-[#1a1a24] aria-selected:bg-[#1a1a24] text-sm text-gray-200"
          >
            <Terminal className="w-4 h-4 mr-2 text-gray-400" /> API Playground
          </Command.Item>
        </Command.Group>

        <Command.Group heading="Quick Actions" className="text-xs font-medium text-gray-500 px-2 py-1 mt-2">
          <Command.Item
            onSelect={() => handleSelect('/predict')}
            className="flex items-center px-2 py-2.5 rounded-md cursor-pointer hover:bg-[#1a1a24] aria-selected:bg-[#1a1a24] text-sm text-gray-200 mt-1"
          >
            <Search className="w-4 h-4 mr-2 text-gray-400" /> Single Prediction
          </Command.Item>
          <Command.Item
            onSelect={() => handleSelect('/bulk')}
            className="flex items-center px-2 py-2.5 rounded-md cursor-pointer hover:bg-[#1a1a24] aria-selected:bg-[#1a1a24] text-sm text-gray-200"
          >
            <UploadCloud className="w-4 h-4 mr-2 text-gray-400" /> Bulk Upload
          </Command.Item>
        </Command.Group>

      </Command.List>
    </Command.Dialog>
  );
}
