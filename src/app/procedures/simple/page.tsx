"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/ui/components/Button";
import { Select } from "@/ui/components/Select";
import { Switch } from "@/ui/components/Switch";
import { 
  FeatherArrowLeft, 
  FeatherDownload, 
  FeatherUpload,
  FeatherPlus,
  FeatherChevronDown,
  FeatherFileText,
  FeatherSearch,
  FeatherX,
  FeatherMoreHorizontal,
  FeatherTrash,
  FeatherCopy
} from "@subframe/core";
import { useProcedures } from '@/hooks/useProcedures';
import { useToast } from '@/contexts/ToastContext';
import { supabase } from '@/lib/supabase/client';
import { useSettings } from '@/contexts/SettingsContext';
import { IconButton } from "@/ui/components/IconButton";
import { TextField } from "@/ui/components/TextField";

// Import export libraries
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Categories for procedures
const PROCEDURE_CATEGORIES = [
  'All',
  'Others',
  'Emergency',
  'Restorative',
  'Cosmetic',
  'Preventive',
  'Periodontal',
  'Endodontic',
  'Oral Surgery',
  'Orthodontic'
];

interface ProcedureData {
  id: string;
  procedure_code?: string;
  name: string;
  category: string;
  price: number;
  estimated_time?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  isNew?: boolean; // Flag for new procedures not yet saved
}

// New procedure row component
const NewProcedureRow = React.memo<{
  currencySymbol: string;
  onAdd: (newProcedure: Partial<ProcedureData>) => void;
}>(({ currencySymbol, onAdd }) => {
  const [newProcedure, setNewProcedure] = React.useState({
    procedure_code: '',
    name: '',
    category: 'Others',
    price: 0,
    estimated_time: ''
  });

  const handleAdd = () => {
    if (!newProcedure.name.trim()) return;
    
    onAdd(newProcedure);
    
    // Reset form
    setNewProcedure({
      procedure_code: '',
      name: '',
      category: 'Others',
      price: 0,
      estimated_time: ''
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  };

  return (
    <div className="px-6 py-4 bg-neutral-25 border-b border-neutral-200">
      <div className="flex gap-4 items-center">
        {/* Active Switch - Always on for new procedures */}
        <div className="w-12 flex-shrink-0 flex justify-start items-center">
          <div className="w-10 h-5 bg-brand-primary rounded-full flex items-center justify-end px-1">
            <div className="w-4 h-4 bg-white rounded-full"></div>
          </div>
        </div>
        
        {/* Procedure Code */}
        <div className="flex-1 max-w-[250px]">
          <input
            type="text"
            value={newProcedure.procedure_code}
            onChange={(e) => setNewProcedure(prev => ({ ...prev, procedure_code: e.target.value }))}
            onKeyPress={handleKeyPress}
            placeholder="Enter code"
            className="w-full h-10 px-3 text-sm rounded-sm font-heading bg-white border border-neutral-200 hover:border-neutral-300 focus:bg-white focus:ring-1 focus:ring-brand-primary focus:border-brand-primary focus:outline-none transition-all"
          />
        </div>
        
        {/* Procedure Name */}
        <div className="flex-[2] min-w-[540px]">
          <input
            type="text"
            value={newProcedure.name}
            onChange={(e) => setNewProcedure(prev => ({ ...prev, name: e.target.value }))}
            onKeyPress={handleKeyPress}
            placeholder="Enter procedure name"
            className="w-full h-10 px-3 text-sm rounded-sm font-heading bg-white border border-neutral-200 hover:border-neutral-300 focus:bg-white focus:ring-1 focus:ring-brand-primary focus:border-brand-primary focus:outline-none transition-all"
          />
        </div>
        
        {/* Category Select */}
        <div className="flex-1 max-w-[300px] relative">
          <select
            value={newProcedure.category}
            onChange={(e) => setNewProcedure(prev => ({ ...prev, category: e.target.value }))}
            className="w-full h-10 pl-3 pr-8 text-sm rounded-sm font-heading appearance-none bg-white border border-neutral-200 hover:border-neutral-300 focus:bg-white focus:ring-1 focus:ring-brand-primary focus:border-brand-primary focus:outline-none transition-all"
            style={{
              backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 12px center',
              backgroundSize: '16px'
            }}
          >
            {PROCEDURE_CATEGORIES.filter(cat => cat !== 'All').map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        
        {/* Price */}
        <div className="flex-1 max-w-[250px]">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-500">
              {currencySymbol}
            </span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={newProcedure.price}
              onChange={(e) => setNewProcedure(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
              onKeyPress={handleKeyPress}
              placeholder="0.00"
              className="w-full h-10 pl-8 pr-3 text-sm rounded-sm font-heading bg-white border border-neutral-200 hover:border-neutral-300 focus:bg-white focus:ring-1 focus:ring-brand-primary focus:border-brand-primary focus:outline-none transition-all"
            />
          </div>
        </div>
        
        {/* Estimated Time */}
        <div className="flex-1 max-w-[250px]">
          <input
            type="time"
            step="300"
            value={newProcedure.estimated_time}
            onChange={(e) => setNewProcedure(prev => ({ ...prev, estimated_time: e.target.value }))}
            onKeyPress={handleKeyPress}
            className="w-full h-10 px-3 text-sm rounded-sm font-heading bg-white border border-neutral-200 hover:border-neutral-300 focus:bg-white focus:ring-1 focus:ring-brand-primary focus:border-brand-primary focus:outline-none transition-all"
          />
        </div>
        
        {/* Add Button */}
        <div className="w-12 flex-shrink-0 relative flex justify-center">
          <IconButton
            variant="brand-primary"
            size="large"
            icon={<FeatherPlus />}
            onClick={handleAdd}
            disabled={!newProcedure.name.trim()}
          />
        </div>
      </div>
    </div>
  );
});

NewProcedureRow.displayName = 'NewProcedureRow';

export default function SimpleProceduresPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planName = searchParams.get('planId');
  const { showError, showSuccess } = useToast();
  const { settings } = useSettings();
  
  // Currency symbols mapping
  const currencySymbols = {
    'EUR': '€',
    'USD': '$',
    'BRL': 'R$',
    'GBP': '£'
  };

  // Simple state management
  const [procedures, setProcedures] = useState<ProcedureData[]>([]);
  const [filteredProcedures, setFilteredProcedures] = useState<ProcedureData[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  
  // Refs for uncontrolled inputs (the key to performance!)
  const inputRefs = useRef<{[key: string]: {[field: string]: HTMLInputElement}}>({});
  
  // Actual plan ID state
  const [actualPlanId, setActualPlanId] = useState<string | null>(null);

  // Get plan ID from database
  useEffect(() => {
    const fetchPlanId = async () => {
      if (!planName) return;
      
      try {
        const { data, error } = await supabase
          .from('insurance_plans')
          .select('id')
          .eq('name', planName)
          .single();
        
        if (error) throw error;
        setActualPlanId(data?.id || null);
      } catch (error) {
        console.error('Error fetching plan ID:', error);
      }
    };
    
    fetchPlanId();
  }, [planName]);

  // Load procedures
  useEffect(() => {
    const loadProcedures = async () => {
      if (!actualPlanId) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('procedures')
          .select('*')
          .eq('insurance_plan_id', actualPlanId)
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        setProcedures(data || []);
      } catch (error) {
        console.error('Error loading procedures:', error);
        showError('Failed to load procedures');
      } finally {
        setLoading(false);
      }
    };

    loadProcedures();
  }, [actualPlanId, showError]);

  // Filter procedures
  useEffect(() => {
    let filtered = procedures;
    
    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    
    // Filter by search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(term) ||
        (p.procedure_code && p.procedure_code.toLowerCase().includes(term))
      );
    }
    
    setFilteredProcedures(filtered);
  }, [procedures, selectedCategory, searchTerm]);

  // Handle navigation back
  const handleBack = useCallback(() => {
    if (hasChanges) {
      const confirm = window.confirm('You have unsaved changes. Are you sure you want to leave?');
      if (!confirm) return;
    }
    router.back();
  }, [router, hasChanges]);

  // Handle toggle switch (the only controlled input we need)
  const handleToggle = useCallback((procedureId: string, checked: boolean) => {
    setProcedures(prev => prev.map(p => 
      p.id === procedureId ? { ...p, is_active: checked } : p
    ));
    setHasChanges(true);
  }, []);

  // Mark field as changed
  const handleFieldChange = useCallback(() => {
    setHasChanges(true);
  }, []);

  // Save all changes
  const handleSave = useCallback(async () => {
    try {
      setLoading(true);
      
      // Separate new and existing procedures
      const newProcedures = procedures.filter(p => p.isNew);
      const existingProcedures = procedures.filter(p => !p.isNew);
      
      // Collect data from refs and current state for existing procedures
      const updates = existingProcedures.map(procedure => {
        const refs = inputRefs.current[procedure.id] || {};
        return {
          id: procedure.id,
          procedure_code: refs.procedure_code?.value || procedure.procedure_code || '',
          name: refs.name?.value || procedure.name,
          category: refs.category?.value || procedure.category,
          price: parseFloat(refs.price?.value || procedure.price.toString()) || 0,
          estimated_time: refs.estimated_time?.value || procedure.estimated_time || '',
          is_active: procedure.is_active
        };
      });

      // Insert new procedures
      for (const newProcedure of newProcedures) {
        const refs = inputRefs.current[newProcedure.id] || {};
        const { data, error } = await supabase
          .from('procedures')
          .insert({
            insurance_plan_id: actualPlanId,
            procedure_code: refs.procedure_code?.value || newProcedure.procedure_code || '',
            name: refs.name?.value || newProcedure.name,
            category: refs.category?.value || newProcedure.category,
            price: parseFloat(refs.price?.value || newProcedure.price.toString()) || 0,
            estimated_time: refs.estimated_time?.value || newProcedure.estimated_time || '',
            is_active: newProcedure.is_active
          })
          .select()
          .single();

        if (error) throw error;
        
        // Update local state with real data from database
        setProcedures(prev => prev.map(p => 
          p.id === newProcedure.id 
            ? { ...data, isNew: false }
            : p
        ));
      }

      // Update existing procedures
      for (const update of updates) {
        const { error } = await supabase
          .from('procedures')
          .update({
            procedure_code: update.procedure_code,
            name: update.name,
            category: update.category,
            price: update.price,
            estimated_time: update.estimated_time,
            is_active: update.is_active,
            updated_at: new Date().toISOString()
          })
          .eq('id', update.id);

        if (error) throw error;
      }

      setHasChanges(false);
      showSuccess('All changes saved successfully');
    } catch (error) {
      console.error('Error saving procedures:', error);
      showError('Failed to save changes');
    } finally {
      setLoading(false);
    }
  }, [procedures, actualPlanId, showSuccess, showError]);

  // Add new procedure
  const handleAddProcedure = useCallback(async () => {
    if (!actualPlanId) return;
    
    try {
      const { data, error } = await supabase
        .from('procedures')
        .insert({
          insurance_plan_id: actualPlanId,
          name: 'New Procedure',
          category: 'Others',
          price: 0,
          procedure_code: '',
          estimated_time: '',
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;
      
      setProcedures(prev => [data, ...prev]);
      showSuccess('New procedure added');
    } catch (error) {
      console.error('Error adding procedure:', error);
      showError('Failed to add procedure');
    }
  }, [actualPlanId, showSuccess, showError]);

  // Export functions
  const exportToPDF = useCallback(() => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text(`${planName || 'Insurance'} Procedures Report`, 20, 20);
    
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
    
    const tableData = filteredProcedures.map(procedure => [
      procedure.procedure_code || '',
      procedure.name,
      procedure.category,
      `${currencySymbols[settings.currencyFormat] || '$'}${procedure.price.toFixed(2)}`,
      procedure.estimated_time || '',
      procedure.is_active ? 'Active' : 'Inactive'
    ]);
    
    autoTable(doc, {
      head: [['Code', 'Procedure', 'Category', 'Price', 'Est. Time', 'Status']],
      body: tableData,
      startY: 40,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [64, 64, 64] },
    });
    
    doc.save(`${planName || 'procedures'}-${new Date().toISOString().split('T')[0]}.pdf`);
    setShowExportDropdown(false);
  }, [planName, filteredProcedures, settings.currencyFormat, currencySymbols]);

  const exportToExcel = useCallback(() => {
    const excelData = filteredProcedures.map(procedure => ({
      'Procedure Code': procedure.procedure_code || '',
      'Procedure Name': procedure.name,
      'Category': procedure.category,
      'Price': procedure.price,
      'Estimated Time': procedure.estimated_time || '',
      'Status': procedure.is_active ? 'Active' : 'Inactive',
      'Created At': procedure.created_at ? new Date(procedure.created_at).toLocaleDateString() : '',
      'Updated At': procedure.updated_at ? new Date(procedure.updated_at).toLocaleDateString() : '',
    }));
    
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);
    
    XLSX.utils.book_append_sheet(wb, ws, 'Procedures');
    
    XLSX.writeFile(wb, `${planName || 'procedures'}-${new Date().toISOString().split('T')[0]}.xlsx`);
    setShowExportDropdown(false);
  }, [planName, filteredProcedures]);

  // Set input ref
  const setInputRef = useCallback((procedureId: string, field: string, element: HTMLInputElement | null) => {
    if (!element) return;
    
    if (!inputRefs.current[procedureId]) {
      inputRefs.current[procedureId] = {};
    }
    inputRefs.current[procedureId][field] = element;
  }, []);

  if (loading && procedures.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-lg text-neutral-600">Loading procedures...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full flex-col bg-default-background">
      {/* Header */}
      <div className="flex h-auto w-full flex-none items-center justify-between px-8 py-4 border-b border-neutral-200">
        <div className="flex items-center gap-4">
          <IconButton
            variant="neutral-tertiary"
            size="large"
            icon={<FeatherArrowLeft />}
            onClick={handleBack}
          />
          <h1 className="text-xl font-semibold text-neutral-900">
            {planName || 'Private plan'}
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <Button
            variant="brand-primary"
            size="large"
            onClick={handleSave}
            disabled={!hasChanges || loading}
          >
            Save Changes
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex w-full flex-none items-center justify-between px-8 py-4 bg-white">
        <div className="flex items-center gap-4">
          <div className="w-48 rounded-full overflow-hidden">
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
              className="w-full [&>div]:rounded-full"
              style={{ borderRadius: '9999px' }}
            >
              {PROCEDURE_CATEGORIES.map(category => (
                <Select.Item key={category} value={category}>
                  {category}
                </Select.Item>
              ))}
            </Select>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Button
              variant="neutral-secondary"
              size="large"
              icon={<FeatherDownload />}
              iconRight={<FeatherChevronDown />}
              onClick={() => setShowExportDropdown(!showExportDropdown)}
            >
              Export as
            </Button>
            
            {showExportDropdown && (
              <div className="absolute right-0 top-12 bg-white border border-neutral-200 rounded-lg shadow-lg py-2 z-20" style={{ minWidth: '160px' }}>
                <button
                  onClick={exportToPDF}
                  className="w-full px-4 py-2 text-left hover:bg-neutral-50 flex items-center gap-2 text-sm"
                >
                  <FeatherFileText className="w-4 h-4" />
                  Export as PDF
                </button>
                <button
                  onClick={exportToExcel}
                  className="w-full px-4 py-2 text-left hover:bg-neutral-50 flex items-center gap-2 text-sm"
                >
                  <FeatherDownload className="w-4 h-4" />
                  Export as Excel
                </button>
              </div>
            )}
            
            {showExportDropdown && (
              <div 
                className="fixed inset-0 z-0" 
                onClick={() => setShowExportDropdown(false)}
              />
            )}
          </div>
          
          <TextField
            className="w-96 [&>div]:rounded-full"
            variant="filled"
            icon={<FeatherSearch />}
            iconRight={searchTerm ? (
              <IconButton
                variant="neutral-tertiary"
                size="small"
                icon={<FeatherX />}
                onClick={() => setSearchTerm('')}
              />
            ) : undefined}
            style={{ borderRadius: '9999px' }}
          >
            <TextField.Input
              placeholder="Search procedures..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            />
          </TextField>
        </div>
      </div>

      {/* Simple Table */}
      <div className="flex-1 p-8 overflow-hidden">
        <div className="bg-white rounded-lg border border-neutral-200 h-full flex flex-col">
          {/* Table Header */}
          <div className="bg-neutral-50 border-b border-neutral-200 px-6 py-3 sticky top-0 z-10">
            <div className="flex gap-4 text-sm font-medium text-neutral-900">
              <div className="w-12 flex-shrink-0">Active</div>
              <div className="flex-1 max-w-[250px]">Code</div>
              <div className="flex-[2] min-w-[540px]">Procedure</div>
              <div className="flex-1 max-w-[300px]">Category</div>
              <div className="flex-1 max-w-[250px]">Price</div>
              <div className="flex-1 max-w-[250px]">Est. Time</div>
              <div className="w-12 flex-shrink-0"></div>
            </div>
          </div>
          
          {/* Table Body */}
          <div className="flex-1 overflow-y-auto">
            {/* Add New Procedure Row */}
            <NewProcedureRow
              currencySymbol={currencySymbols[settings.currencyFormat] || '$'}
              onAdd={(newProcedure) => {
                // Create a temporary procedure with a temporary ID
                const tempProcedure = {
                  id: `temp-${Date.now()}`, // Temporary ID
                  name: newProcedure.name || 'New Procedure',
                  category: newProcedure.category || 'Others',
                  price: newProcedure.price || 0,
                  procedure_code: newProcedure.procedure_code || '',
                  estimated_time: newProcedure.estimated_time || '',
                  is_active: true,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  isNew: true // Flag to identify new procedures
                };
                
                setProcedures(prev => [tempProcedure, ...prev]);
                setHasChanges(true); // Show save changes button
                showSuccess('New procedure added to table. Click "Save Changes" to save to database.');
              }}
            />
            
            {filteredProcedures.map((procedure) => (
              <ProcedureRow
                key={procedure.id}
                procedure={procedure}
                currencySymbol={currencySymbols[settings.currencyFormat] || '$'}
                onToggle={handleToggle}
                onFieldChange={handleFieldChange}
                setInputRef={setInputRef}
                onDelete={async (id) => {
                  if (confirm('Are you sure you want to delete this procedure?')) {
                    try {
                      const { error } = await supabase
                        .from('procedures')
                        .delete()
                        .eq('id', id);
                      
                      if (error) throw error;
                      
                      setProcedures(prev => prev.filter(p => p.id !== id));
                      showSuccess('Procedure deleted successfully');
                    } catch (error) {
                      console.error('Error deleting procedure:', error);
                      showError('Failed to delete procedure');
                    }
                  }
                }}
                onDuplicate={async (id) => {
                  try {
                    const procedureToDuplicate = procedures.find(p => p.id === id);
                    if (!procedureToDuplicate) return;
                    
                    const { data, error } = await supabase
                      .from('procedures')
                      .insert({
                        insurance_plan_id: actualPlanId,
                        name: `${procedureToDuplicate.name} (Copy)`,
                        category: procedureToDuplicate.category,
                        price: procedureToDuplicate.price,
                        procedure_code: procedureToDuplicate.procedure_code,
                        estimated_time: procedureToDuplicate.estimated_time,
                        is_active: true
                      })
                      .select()
                      .single();
                    
                    if (error) throw error;
                    
                    setProcedures(prev => [data, ...prev]);
                    showSuccess('Procedure duplicated successfully');
                  } catch (error) {
                    console.error('Error duplicating procedure:', error);
                    showError('Failed to duplicate procedure');
                  }
                }}
              />
            ))}
            
            {filteredProcedures.length === 0 && (
              <div className="px-6 py-12 text-center text-neutral-500">
                {searchTerm || selectedCategory !== 'All' 
                  ? 'No procedures match your filters' 
                  : 'No procedures found'
                }
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Memoized row component for performance
const ProcedureRow = React.memo<{
  procedure: ProcedureData;
  currencySymbol: string;
  onToggle: (id: string, checked: boolean) => void;
  onFieldChange: () => void;
  setInputRef: (procedureId: string, field: string, element: HTMLInputElement | null) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
}>(({ procedure, currencySymbol, onToggle, onFieldChange, setInputRef, onDelete, onDuplicate }) => {
  const [showMenu, setShowMenu] = React.useState(false);
  return (
    <div className="px-6 py-4 hover:bg-neutral-25">
      <div className="flex gap-4 items-center">
        {/* Active Switch */}
        <div className="w-12 flex-shrink-0 flex justify-start items-center">
          <Switch
            checked={procedure.is_active}
            onCheckedChange={(checked) => onToggle(procedure.id, checked)}
          />
        </div>
        
        {/* Procedure Code */}
        <div className="flex-1 max-w-[250px]">
          <input
            ref={(el) => setInputRef(procedure.id, 'procedure_code', el)}
            type="text"
            defaultValue={procedure.procedure_code || ''}
            placeholder="Enter code"
            onChange={onFieldChange}
            disabled={!procedure.is_active}
            className={`w-full h-10 px-3 text-sm rounded-sm font-heading ${
              !procedure.is_active 
                ? 'bg-gray-100 text-neutral-400 cursor-not-allowed' 
                : 'bg-neutral-100 hover:bg-neutral-200 focus:bg-white focus:ring-1 focus:ring-brand-primary border-none'
            } focus:outline-none transition-all`}
          />
        </div>
        
        {/* Procedure Name */}
        <div className="flex-[2] min-w-[540px]">
          <input
            ref={(el) => setInputRef(procedure.id, 'name', el)}
            type="text"
            defaultValue={procedure.name}
            placeholder="Enter procedure name"
            onChange={onFieldChange}
            disabled={!procedure.is_active}
            className={`w-full h-10 px-3 text-sm rounded-sm font-heading ${
              !procedure.is_active 
                ? 'bg-gray-100 text-neutral-400 cursor-not-allowed' 
                : 'bg-neutral-100 hover:bg-neutral-200 focus:bg-white focus:ring-1 focus:ring-brand-primary border-none'
            } focus:outline-none transition-all`}
          />
        </div>
        
        {/* Category Select */}
        <div className="flex-1 max-w-[300px] relative">
          <select
            ref={(el) => setInputRef(procedure.id, 'category', el as any)}
            defaultValue={procedure.category}
            onChange={onFieldChange}
            disabled={!procedure.is_active}
            className={`w-full h-10 pl-3 pr-8 text-sm rounded-sm font-heading appearance-none ${
              !procedure.is_active 
                ? 'bg-gray-100 text-neutral-400 cursor-not-allowed' 
                : 'bg-neutral-100 hover:bg-neutral-200 focus:bg-white focus:ring-1 focus:ring-brand-primary border-none'
            } focus:outline-none transition-all`}
            style={{
              backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 12px center',
              backgroundSize: '16px'
            }}
          >
            {PROCEDURE_CATEGORIES.filter(cat => cat !== 'All').map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        
        {/* Price */}
        <div className="flex-1 max-w-[250px]">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-500">
              {currencySymbol}
            </span>
            <input
              ref={(el) => setInputRef(procedure.id, 'price', el)}
              type="number"
              step="0.01"
              min="0"
              defaultValue={procedure.price}
              placeholder="0.00"
              onChange={onFieldChange}
              disabled={!procedure.is_active}
              className={`w-full h-10 pl-8 pr-3 text-sm rounded-sm ${
                !procedure.is_active 
                  ? 'bg-gray-100 text-neutral-400 cursor-not-allowed' 
                  : 'bg-neutral-100 hover:bg-neutral-200 focus:bg-white focus:ring-1 focus:ring-brand-primary border-none'
              } focus:outline-none transition-all`}
            />
          </div>
        </div>
        
        {/* Estimated Time */}
        <div className="flex-1 max-w-[250px]">
          <input
            ref={(el) => setInputRef(procedure.id, 'estimated_time', el)}
            type="time"
            step="300"
            defaultValue={procedure.estimated_time || ''}
            onChange={onFieldChange}
            disabled={!procedure.is_active}
            className={`w-full h-10 px-3 text-sm rounded-sm font-heading ${
              !procedure.is_active 
                ? 'bg-gray-100 text-neutral-400 cursor-not-allowed' 
                : 'bg-neutral-100 hover:bg-neutral-200 focus:bg-white focus:ring-1 focus:ring-brand-primary border-none'
            } focus:outline-none transition-all`}
          />
        </div>
        
        {/* Actions Menu */}
        <div className="w-12 flex-shrink-0 relative flex justify-center">
          <IconButton
            variant="neutral-tertiary"
            size="large"
            icon={<FeatherMoreHorizontal />}
            onClick={() => setShowMenu(!showMenu)}
          />
          
          {showMenu && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-8 bg-white border border-neutral-200 rounded-lg shadow-lg py-2 z-20" style={{ minWidth: '160px' }}>
                <button
                  onClick={() => {
                    onDuplicate?.(procedure.id);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-neutral-50 flex items-center gap-2 text-sm"
                >
                  <FeatherCopy className="w-4 h-4" />
                  Duplicate
                </button>
                <button
                  onClick={() => {
                    onDelete?.(procedure.id);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-neutral-50 flex items-center gap-2 text-sm text-red-600"
                >
                  <FeatherTrash className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
});

ProcedureRow.displayName = 'ProcedureRow';