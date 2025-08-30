"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/ui/components/Button";
import { IconButton } from "@/ui/components/IconButton";
import { LinkButton } from "@/ui/components/LinkButton";
import { DrawerLayout } from "@/ui/layouts/DrawerLayout";
import { FeatherEye } from "@subframe/core";
import { FeatherX } from "@subframe/core";
import { supabase, Supplier, SupplierOrder } from "@/lib/supabase";

interface SupplierDetailsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplierId?: string;
}

function SupplierDetailsDrawer({ open, onOpenChange, supplierId }: SupplierDetailsDrawerProps) {
  const [supplierData, setSupplierData] = useState<Supplier | null>(null);
  const [supplierOrders, setSupplierOrders] = useState<SupplierOrder[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && supplierId) {
      fetchSupplierData(supplierId);
      fetchSupplierOrders(supplierId);
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

  const fetchSupplierOrders = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('supplier_orders')
        .select('*')
        .eq('supplier_id', id)
        .order('order_date', { ascending: false });

      if (error) {
        console.error('Erro ao buscar pedidos do supplier:', error);
      } else {
        setSupplierOrders(data || []);
      }
    } catch (error) {
      console.error('Erro ao buscar pedidos do supplier:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
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
            {supplierData.alternative_phone && (
              <div className="flex h-12 w-full flex-none items-center justify-between border-b border-solid border-neutral-border py-2">
                <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                  Alternative number
                </span>
                <span className="grow shrink-0 basis-0 text-body-large font-body-large text-default-font text-right">
                  {supplierData.alternative_phone}
                </span>
              </div>
            )}
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
          
          <div className="flex w-full flex-col items-start">
            <div className="flex w-full flex-col items-start pb-4">
              <span className="w-full text-heading-4 font-heading-4 text-default-font">
                Purchase History
              </span>
            </div>
            {supplierOrders.length === 0 ? (
              <div className="flex w-full justify-center py-8">
                <span className="text-body-medium font-body-medium text-subtext-color">
                  Nenhum histórico de compras encontrado
                </span>
              </div>
            ) : (
              supplierOrders.map((order) => (
                <div key={order.id} className="flex h-12 w-full flex-none items-center gap-4 border-b border-solid border-neutral-border py-2">
                  <div className="flex items-center gap-4">
                    <span className="font-body-small-/bold text-subtext-color">
                      {formatDate(order.order_date)}
                    </span>
                    <span className="grow shrink-0 basis-0 text-body-medium font-body-medium text-default-font">
                      Order {order.order_number}
                    </span>
                  </div>
                  <span className="grow shrink-0 basis-0 text-body-large font-body-large text-default-font text-right">
                    ${order.total_amount.toFixed(2)}
                  </span>
                  <IconButton
                    disabled={false}
                    variant="brand-tertiary"
                    size="medium"
                    icon={<FeatherEye />}
                    loading={false}
                    onClick={() => {
                      // TODO: Implementar visualização dos detalhes do pedido
                      console.log('View order details:', order.id);
                    }}
                  />
                </div>
              ))
            )}
          </div>
          
          <Button
            className="h-10 w-full flex-none"
            disabled={false}
            variant="neutral-secondary"
            size="large"
            icon={null}
            iconRight={null}
            loading={false}
            onClick={() => {
              // TODO: Implementar funcionalidade de fazer pedido
              console.log('Order from supplier:', supplierData.name);
            }}
          >
            Order from this Supplier
          </Button>
        </div>
      </div>
    </DrawerLayout>
  );
}

export default SupplierDetailsDrawer;