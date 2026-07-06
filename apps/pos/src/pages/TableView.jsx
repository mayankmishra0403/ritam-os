import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Printer, ArrowRight, Users, Clock, IndianRupee } from 'lucide-react';
import { mockTables } from '../data/mockData';
import usePosStore from '../store/posStore';

const statusConfig = {
  FREE: {
    label: 'Free',
    className: 'status-badge-free',
    borderColor: 'border-[#06D6A0]',
    bgColor: 'bg-[#06D6A0]/5',
    hoverBg: 'hover:bg-[#06D6A0]/10',
  },
  OCCUPIED: {
    label: 'Occupied',
    className: 'status-badge-occupied',
    borderColor: 'border-[#FF6B35]',
    bgColor: 'bg-[#FF6B35]/5',
    hoverBg: 'hover:bg-[#FF6B35]/10',
  },
  BILLING: {
    label: 'Billing',
    className: 'status-badge-billing',
    borderColor: 'border-[#FFD166]',
    bgColor: 'bg-[#FFD166]/8',
    hoverBg: 'hover:bg-[#FFD166]/12',
  },
  RESERVED: {
    label: 'Reserved',
    className: 'status-badge-reserved',
    borderColor: 'border-[#118AB2]',
    bgColor: 'bg-[#118AB2]/5',
    hoverBg: 'hover:bg-[#118AB2]/10',
  },
};

const sections = ['ALL', 'Hall', 'VIP', 'Balcony'];
const statusFilters = ['ALL', 'FREE', 'OCCUPIED', 'BILLING', 'RESERVED'];

export default function TableView() {
  const navigate = useNavigate();
  const { tableFilter, setTableFilter, sectionFilter, setSectionFilter, setSelectedTable } = usePosStore();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTables = useMemo(() => {
    return mockTables.filter((table) => {
      if (tableFilter !== 'ALL' && table.status !== tableFilter) return false;
      if (sectionFilter !== 'ALL' && table.section !== sectionFilter) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !table.tableNumber.toString().includes(query) &&
          !table.section.toLowerCase().includes(query)
        )
          return false;
      }
      return true;
    });
  }, [tableFilter, sectionFilter, searchQuery]);

  const handleTableClick = (table) => {
    setSelectedTable(table);
    navigate(`/billing/${table.tableNumber}`);
  };

  const sectionsList = useMemo(() => {
    const unique = [...new Set(mockTables.map((t) => t.section))];
    return ['ALL', ...unique];
  }, []);

  return (
    <div className="h-full flex flex-col p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E]">Tables</h1>
          <p className="text-sm text-[#6B7280] mt-1">
            {mockTables.filter((t) => t.status === 'FREE').length} free ·{' '}
            {mockTables.filter((t) => t.status === 'OCCUPIED').length} occupied
          </p>
        </div>
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
          <input
            type="text"
            placeholder="Search table or section..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2.5 rounded-xl border border-[#F0E6DC] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/30 focus:border-[#FF6B35] w-64"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        {/* Status tabs */}
        <div className="flex items-center gap-1 bg-white rounded-xl p-1 border border-[#F0E6DC]">
          {statusFilters.map((filter) => (
            <button
              key={filter}
              onClick={() => setTableFilter(filter)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all min-h-[36px] ${
                tableFilter === filter
                  ? 'bg-[#FF6B35] text-white shadow-sm'
                  : 'text-[#6B7280] hover:text-[#1A1A2E] hover:bg-[#FFF8F0]'
              }`}
            >
              {filter === 'ALL' ? 'All' : statusConfig[filter].label}
            </button>
          ))}
        </div>

        {/* Section filter */}
        <div className="flex items-center gap-1 bg-white rounded-xl p-1 border border-[#F0E6DC]">
          {sectionsList.map((section) => (
            <button
              key={section}
              onClick={() => setSectionFilter(section)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all min-h-[36px] ${
                sectionFilter === section
                  ? 'bg-[#1A1A2E] text-white shadow-sm'
                  : 'text-[#6B7280] hover:text-[#1A1A2E] hover:bg-[#FFF8F0]'
              }`}
            >
              {section === 'ALL' ? 'All' : section}
            </button>
          ))}
        </div>
      </div>

      {/* Table Grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTables.map((table, index) => {
            const config = statusConfig[table.status];
            return (
              <motion.button
                key={table.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03, duration: 0.2 }}
                onClick={() => handleTableClick(table)}
                className={`relative flex flex-col items-start p-5 rounded-xl border-2 transition-all duration-200 text-left ${config.borderColor} ${config.bgColor} ${config.hoverBg} hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] min-h-[140px]`}
              >
                {/* Table Number */}
                <div className="flex items-center justify-between w-full mb-2">
                  <span className="text-3xl font-bold text-[#1A1A2E]">
                    {table.tableNumber}
                  </span>
                  <span className={config.className}>{config.label}</span>
                </div>

                {/* Capacity & Section */}
                <div className="flex items-center gap-3 text-xs text-[#6B7280] mb-3">
                  <span className="flex items-center gap-1">
                    <Users size={14} />
                    {table.capacity}
                  </span>
                  <span>{table.section}</span>
                </div>

                {/* Order info for occupied/billing */}
                {(table.status === 'OCCUPIED' || table.status === 'BILLING') && (
                  <div className="w-full space-y-1.5 mt-1">
                    <div className="flex items-center gap-1.5 text-xs text-[#6B7280]">
                      <Clock size={13} />
                      <span>{table.orderTime}</span>
                      <span className="mx-1">·</span>
                      <span>{table.itemCount} items</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm font-semibold text-[#1A1A2E]">
                      <IndianRupee size={14} />
                      <span>{table.total?.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                )}

                {/* Quick actions for occupied */}
                {table.status === 'OCCUPIED' && (
                  <div className="flex items-center gap-2 mt-3 w-full pt-3 border-t border-[#F0E6DC]">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Print bill action
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#6B7280] hover:bg-white/60 transition-colors"
                    >
                      <Printer size={14} />
                      Print Bill
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Transfer table action
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#6B7280] hover:bg-white/60 transition-colors"
                    >
                      <ArrowRight size={14} />
                      Transfer
                    </button>
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>

        {filteredTables.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-[#6B7280]">
            <Search size={48} className="mb-4 opacity-40" />
            <p className="text-lg font-medium">No tables found</p>
            <p className="text-sm">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
