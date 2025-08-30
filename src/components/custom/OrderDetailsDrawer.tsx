"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/ui/components/Button";
import { Chips } from "@/ui/components/Chips";
import { IconButton } from "@/ui/components/IconButton";
import { LinkButton } from "@/ui/components/LinkButton";
import { DrawerLayout } from "@/ui/layouts/DrawerLayout";
import { FeatherMoreVertical } from "@subframe/core";
import { FeatherX } from "@subframe/core";
import { supabase, LabOrder } from "@/lib/supabase";

interface OrderDetailsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId?: string;
  onEditOrder?: (order: LabOrder) => void;
}

function OrderDetailsDrawer({ open, onOpenChange, orderId, onEditOrder }: OrderDetailsDrawerProps) {
  const [orderData, setOrderData] = useState<LabOrder | null>(null);
  const [loading, setLoading] = useState(false);

  // Carregar dados do pedido quando abrir o drawer
  useEffect(() => {
    if (open && orderId) {
      fetchOrderData(orderId);
    }
  }, [open, orderId]);

  const fetchOrderData = async (id: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('lab_orders')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Erro ao buscar dados do pedido:', error);
      } else {
        setOrderData(data);
      }
    } catch (error) {
      console.error('Erro ao buscar dados do pedido:', error);
    } finally {
      setLoading(false);
    }
  };

  // Função para mapear status para variante do chip
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'order_created': return 'brand';
      case 'order_confirmed': return 'success';
      case 'in_progress': return 'warning';
      case 'completed': return 'success';
      case 'overdue': return 'error';
      default: return 'neutral';
    }
  };

  // Função para mapear status para texto exibido
  const getStatusText = (status: string) => {
    switch (status) {
      case 'order_created': return 'Order created';
      case 'order_confirmed': return 'Order confirmed';
      case 'in_progress': return 'In progress';
      case 'completed': return 'Completed';
      case 'overdue': return 'Overdue';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleEditOrder = () => {
    if (orderData && onEditOrder) {
      onEditOrder(orderData);
      onOpenChange(false); // Fechar o drawer
    }
  };

  if (loading) {
    return (
      <DrawerLayout open={open} onOpenChange={onOpenChange}>
        <div className="flex h-full w-144 flex-col items-start bg-page-bg">
          <div className="flex w-full items-center justify-center py-8">
            <span>Carregando detalhes do pedido...</span>
          </div>
        </div>
      </DrawerLayout>
    );
  }

  if (!orderData) {
    return (
      <DrawerLayout open={open} onOpenChange={onOpenChange}>
        <div className="flex h-full w-144 flex-col items-start bg-page-bg">
          <div className="flex w-full items-center justify-center py-8">
            <span>Pedido não encontrado</span>
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
            {orderData.order_name}
          </span>
          <div className="flex items-center gap-6">
            <Chips 
              variant={getStatusVariant(orderData.status) as any} 
              icon={null} 
              iconRight={null}
            >
              {getStatusText(orderData.status)}
            </Chips>
            <IconButton
              disabled={false}
              variant="neutral-secondary"
              icon={<FeatherMoreVertical />}
              onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
            />
            <IconButton
              disabled={false}
              icon={<FeatherX />}
              onClick={() => onOpenChange(false)}
            />
          </div>
        </div>
        <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-6 px-4 py-4 overflow-y-auto">
          <div className="flex w-full flex-col items-start rounded-md bg-default-background px-4 py-4">
            <div className="flex h-12 w-full flex-none items-center justify-between border-b border-solid border-neutral-border py-2">
              <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                Patient name
              </span>
              <span className="grow shrink-0 basis-0 text-body-large font-body-large text-default-font text-right">
                {orderData.patient_name || 'N/A'}
              </span>
            </div>
            <div className="flex h-12 w-full flex-none items-center justify-between border-b border-solid border-neutral-border py-2">
              <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                Professional
              </span>
              <span className="grow shrink-0 basis-0 text-body-large font-body-large text-default-font text-right">
                {orderData.professional_name || 'N/A'}
              </span>
            </div>
            <div className="flex h-12 w-full flex-none items-center justify-between border-b border-solid border-neutral-border py-2">
              <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                Lab name
              </span>
              <span className="grow shrink-0 basis-0 text-body-large font-body-large text-default-font text-right">
                {orderData.lab_name}
              </span>
            </div>
            <div className="flex h-12 w-full flex-none items-center justify-between border-b border-solid border-neutral-border py-2">
              <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                Lab Service
              </span>
              <span className="grow shrink-0 basis-0 text-body-large font-body-large text-default-font text-right">
                {orderData.services}
              </span>
            </div>
            <div className="flex h-12 w-full flex-none items-center justify-between border-b border-solid border-neutral-border py-2">
              <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                Due date
              </span>
              <span className="grow shrink-0 basis-0 text-body-large font-body-large text-default-font text-right">
                {formatDate(orderData.due_date)}
              </span>
            </div>
            <div className="flex h-12 w-full flex-none items-center justify-between border-b border-solid border-neutral-border py-2">
              <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                Requested on
              </span>
              <span className="grow shrink-0 basis-0 text-body-large font-body-large text-default-font text-right">
                {orderData.created_at ? formatDate(orderData.created_at) : 'N/A'}
              </span>
            </div>
            <div className="flex h-12 w-full flex-none items-center justify-between border-b border-solid border-neutral-border py-2">
              <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                Description
              </span>
              <span className="grow shrink-0 basis-0 text-body-large font-body-large text-default-font text-right">
                -
              </span>
            </div>
            <div className="flex h-12 w-full flex-none items-center justify-between py-2">
              <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                Lab Sheet
              </span>
              <LinkButton
                disabled={false}
                variant="brand"
                size="medium"
                icon={null}
                iconRight={null}
                onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
              >
                Filename.pdf
              </LinkButton>
            </div>
          </div>
          
          <div className="flex w-full flex-col items-start rounded-md bg-default-background px-4 py-4">
            <div className="flex w-full flex-col items-start pb-2">
              <span className="w-full text-heading-4 font-heading-4 text-default-font">
                {orderData.services}
              </span>
            </div>
            <div className="flex h-12 w-full flex-none items-center justify-between border-b border-solid border-neutral-border py-2">
              <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                Tooth
              </span>
              <span className="grow shrink-0 basis-0 text-body-large font-body-large text-default-font text-right">
                52,37,24
              </span>
            </div>
            <div className="flex h-12 w-full flex-none items-center justify-between border-b border-solid border-neutral-border py-2">
              <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                Quantity
              </span>
              <span className="grow shrink-0 basis-0 text-body-large font-body-large text-default-font text-right">
                3
              </span>
            </div>
            <div className="flex h-12 w-full flex-none items-center justify-between border-b border-solid border-neutral-border py-2">
              <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                Shade color
              </span>
              <span className="grow shrink-0 basis-0 text-body-large font-body-large text-default-font text-right">
                B1
              </span>
            </div>
            <div className="flex h-12 w-full flex-none items-center justify-between border-b border-solid border-neutral-border py-2">
              <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                Unit price
              </span>
              <span className="grow shrink-0 basis-0 text-body-large font-body-large text-default-font text-right">
                ${(orderData.total_price / 3).toFixed(2)}
              </span>
            </div>
            <div className="flex h-12 w-full flex-none items-center justify-between py-2">
              <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                Total price
              </span>
              <span className="grow shrink-0 basis-0 text-body-large font-body-large text-default-font text-right">
                ${orderData.total_price.toFixed(2)}
              </span>
            </div>
          </div>
          
          <Button
            className="h-10 w-full flex-none"
            disabled={false}
            variant="neutral-secondary"
            size="large"
            icon={null}
            iconRight={null}
            loading={false}
            onClick={handleEditOrder}
          >
            Edit Order
          </Button>
        </div>
      </div>
    </DrawerLayout>
  );
}

export default OrderDetailsDrawer;