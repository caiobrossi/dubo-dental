import React, { useState, useEffect } from 'react';
import { Button } from '@/ui/components/Button';
import { DropdownMenu } from '@/ui/components/DropdownMenu';
import { FeatherChevronDown } from '@subframe/core';
import * as SubframeCore from '@subframe/core';
import { supabase } from '@/lib/supabase';

interface Professional {
  id: string;
  name: string;
}

interface ProfessionalFilterProps {
  selectedProfessional: string;
  onProfessionalChange: (professionalId: string) => void;
}

export const ProfessionalFilter: React.FC<ProfessionalFilterProps> = ({
  selectedProfessional,
  onProfessionalChange
}) => {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfessionals = async () => {
      try {
        const { data, error } = await supabase
          .from('professionals')
          .select('id, name')
          .order('name');

        if (error) {
          console.error('Error fetching professionals:', error);
        } else {
          setProfessionals(data || []);
        }
      } catch (error) {
        console.error('Error fetching professionals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfessionals();
  }, []);

  const getDisplayText = (): string => {
    if (selectedProfessional === 'all') {
      return 'All professionals';
    }
    const professional = professionals.find(p => p.id === selectedProfessional);
    return professional?.name || 'All professionals';
  };

  return (
    <SubframeCore.DropdownMenu.Root>
      <SubframeCore.DropdownMenu.Trigger asChild={true}>
        <Button
          variant="neutral-secondary"
          size="large"
          iconRight={<FeatherChevronDown />}
          className="gap-1"
        >
          {getDisplayText()}
        </Button>
      </SubframeCore.DropdownMenu.Trigger>
      <SubframeCore.DropdownMenu.Portal>
        <SubframeCore.DropdownMenu.Content
          side="bottom"
          align="start"
          sideOffset={4}
          asChild={true}
        >
          <DropdownMenu>
            <DropdownMenu.DropdownItem
              onClick={() => onProfessionalChange('all')}
            >
              All professionals
            </DropdownMenu.DropdownItem>
            {loading ? (
              <DropdownMenu.DropdownItem>
                Loading professionals...
              </DropdownMenu.DropdownItem>
            ) : (
              professionals.map((professional) => (
                <DropdownMenu.DropdownItem
                  key={professional.id}
                  onClick={() => onProfessionalChange(professional.id)}
                >
                  {professional.name}
                </DropdownMenu.DropdownItem>
              ))
            )}
          </DropdownMenu>
        </SubframeCore.DropdownMenu.Content>
      </SubframeCore.DropdownMenu.Portal>
    </SubframeCore.DropdownMenu.Root>
  );
};