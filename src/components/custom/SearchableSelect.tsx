"use client";

import React, { useState, useRef, useEffect } from "react";
import { TextField } from "@/ui/components/TextField";
import { FeatherChevronDown, FeatherSearch } from "@subframe/core";

interface Option {
  id: string;
  name: string;
}

interface SearchableSelectProps {
  options: Option[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function SearchableSelect({ 
  options, 
  value, 
  onValueChange, 
  placeholder = "Search and select...",
  disabled = false,
  className = ""
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filtrar opções baseado na busca
  const filteredOptions = options.filter(option =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Encontrar opção selecionada
  const selectedOption = options.find(option => option.id === value);

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Limpar busca quando fechar
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
    }
  }, [isOpen]);

  const handleOptionClick = (optionId: string) => {
    onValueChange(optionId);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className={`relative h-10 grow shrink-0 basis-0 ${className}`} ref={dropdownRef}>
      {/* Campo de entrada principal */}
      <div 
        className={`h-10 w-full rounded-md border border-solid bg-default-background px-3 py-2 cursor-pointer flex items-center justify-between ${
          disabled ? 'border-neutral-border bg-neutral-50 cursor-not-allowed' : 'border-neutral-border hover:border-neutral-300'
        }`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={`text-body-medium flex-grow ${
          selectedOption ? 'text-default-font' : 'text-neutral-400'
        }`}>
          {selectedOption ? selectedOption.name : placeholder}
        </span>
        <FeatherChevronDown 
          className={`h-4 w-4 text-neutral-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </div>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-default-background border border-solid border-neutral-border rounded-md shadow-lg max-h-60 overflow-hidden">
          {/* Campo de busca */}
          <div className="p-2 border-b border-solid border-neutral-border">
            <TextField
              className="h-8"
              disabled={false}
              error={false}
              label=""
              helpText=""
              icon={<FeatherSearch />}
            >
              <TextField.Input
                ref={inputRef}
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </TextField>
          </div>

          {/* Lista de opções */}
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-body-medium text-neutral-500 text-center">
                No options found
              </div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option.id}
                  className={`px-3 py-2 text-body-medium cursor-pointer hover:bg-neutral-50 ${
                    value === option.id ? 'bg-brand-50 text-brand-700' : 'text-default-font'
                  }`}
                  onClick={() => handleOptionClick(option.id)}
                >
                  {option.name}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}