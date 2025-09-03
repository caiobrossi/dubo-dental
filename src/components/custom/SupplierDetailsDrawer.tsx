"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/ui/components/Button";
import { IconButton } from "@/ui/components/IconButton";
import { LinkButton } from "@/ui/components/LinkButton";
import { DrawerLayout } from "@/ui/layouts/DrawerLayout";
import { FeatherEye } from "@subframe/core";
import { FeatherX } from "@subframe/core";
import { supabase, Supplier } from "@/lib/supabase";

interface SupplierDetailsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplierId?: string;
}

function SupplierDetailsDrawer({ open, onOpenChange, supplierId }: SupplierDetailsDrawerProps) {
  const [supplierData, setSupplierData] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && supplierId) {
      fetchSupplierData(supplierId);
    }
  }, [open, supplierId]);

  const fetchSupplierData = async (id: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Erro ao buscar dados do supplier:', error);
      } else {
        setSupplierData(data);
      }
    } catch (error) {
      console.error('Erro ao buscar dados do supplier:', error);
    } finally {
      setLoading(false);
    }
  };



  const handleEmailClick = (email: string) => {
    window.open(`mailto:${email}`, '_blank');
  };

  const handleWebsiteClick = (website: string) => {
    const url = website.startsWith('http') ? website : `https://${website}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <DrawerLayout open={open} onOpenChange={onOpenChange}>
        <div className="flex h-full w-144 flex-col items-start bg-page-bg">
          <div className="flex w-full items-center justify-center py-8">
            <span>Carregando detalhes do fornecedor...</span>
          </div>
        </div>
      </DrawerLayout>
    );
  }

  if (!supplierData) {
    return (
      <DrawerLayout open={open} onOpenChange={onOpenChange}>
        <div className="flex h-full w-144 flex-col items-start bg-page-bg">
          <div className="flex w-full items-center justify-center py-8">
            <span>Fornecedor não encontrado</span>
          </div>
        </div>
      </DrawerLayout>
    );
  }

  return (
    <DrawerLayout open={open} onOpenChange={onOpenChange}>
      <div className="flex h-full w-144 flex-col items-start bg-page-bg">
        <div className="flex w-full items-start border-b border-solid border-neutral-border bg-default-background px-4 py-4">
          <span className="grow shrink-0 basis-0 text-heading-2 font-heading-2 text-default-font">
            {supplierData.name}
          </span>
          <IconButton
            disabled={false}
            icon={<FeatherX />}
            onClick={() => onOpenChange(false)}
          />
        </div>
        <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-6 px-4 py-4 overflow-y-auto">
          <div className="flex w-full flex-col items-start rounded-md bg-default-background px-4 py-4">
            {supplierData.contact_person && (
              <div className="flex h-12 w-full flex-none items-center justify-between border-b border-solid border-neutral-border py-2">
                <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                  Contact
                </span>
                <span className="grow shrink-0 basis-0 text-body-large font-body-large text-default-font text-right">
                  {supplierData.contact_person}
                </span>
              </div>
            )}
            {supplierData.phone && (
              <div className="flex h-12 w-full flex-none items-center justify-between border-b border-solid border-neutral-border py-2">
                <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                  Phone number
                </span>
                <span className="grow shrink-0 basis-0 text-body-large font-body-large text-default-font text-right">
                  {supplierData.phone}
                </span>
              </div>
            )}
{(() => {
              const alternativePhones = supplierData.alternative_phone 
                ? supplierData.alternative_phone.split(',').map(phone => phone.trim()).filter(phone => phone)
                : [];
              
              return alternativePhones.map((altPhone, index) => (
                <div key={index} className="flex h-12 w-full flex-none items-center justify-between border-b border-solid border-neutral-border py-2">
                  <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                    {index === 0 ? "Alternative numbers" : ""}
                  </span>
                  <span className="grow shrink-0 basis-0 text-body-large font-body-large text-default-font text-right">
                    {altPhone}
                  </span>
                </div>
              ));
            })()}
            {supplierData.website && (
              <div className="flex h-12 w-full flex-none items-center justify-between border-b border-solid border-neutral-border py-2">
                <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                  Website
                </span>
                <LinkButton
                  disabled={false}
                  variant="brand"
                  size="medium"
                  icon={null}
                  iconRight={null}
                  onClick={() => handleWebsiteClick(supplierData.website!)}
                >
                  {supplierData.website}
                </LinkButton>
              </div>
            )}
            {supplierData.email && (
              <div className="flex h-12 w-full flex-none items-center justify-between border-b border-solid border-neutral-border py-2">
                <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                  Email
                </span>
                <LinkButton
                  disabled={false}
                  variant="brand"
                  size="medium"
                  icon={null}
                  iconRight={null}
                  onClick={() => handleEmailClick(supplierData.email!)}
                >
                  {supplierData.email}
                </LinkButton>
              </div>
            )}
            {supplierData.products && (
              <div className="flex h-12 w-full flex-none items-center justify-between py-2">
                <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                  Products
                </span>
                <span className="grow shrink-0 basis-0 text-body-large font-body-large text-default-font text-right">
                  {supplierData.products}
                </span>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </DrawerLayout>
  );
}

export default SupplierDetailsDrawer;