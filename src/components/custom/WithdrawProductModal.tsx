"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/ui/components/Button";
import { Chips } from "@/ui/components/Chips";
import { IconButton } from "@/ui/components/IconButton";
import { Select } from "@/ui/components/Select";
import { TextField } from "@/ui/components/TextField";
import { DialogLayout } from "@/ui/layouts/DialogLayout";
import { FeatherX } from "@subframe/core";
import { supabase, Professional } from "@/lib/supabase";
import { useToast } from "@/contexts/ToastContext";

interface InventoryItem {
  id: string;
  product_name: string;
  category: string;
  current_stock: number;
  minimum_stock: number;
  maximum_stock: number;
  unit_price: number;
  sku?: string;
  supplier?: string;
  location?: string;
}

interface WithdrawProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: InventoryItem | null;
  onWithdrawComplete?: () => void;
}

function WithdrawProductModal({ open, onOpenChange, product, onWithdrawComplete }: WithdrawProductModalProps) {
  const [withdrawQuantity, setWithdrawQuantity] = useState<string>("");
  const [withdrawBy, setWithdrawBy] = useState<string>("");
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useToast();

  // Load professionals when modal opens
  useEffect(() => {
    if (open) {
      loadProfessionals();
    }
  }, [open]);

  const loadProfessionals = async () => {
    try {
      const { data, error } = await supabase
        .from('professionals')
        .select('id, name')
        .order('name');

      if (error) {
        console.error('Error loading professionals:', error);
        return;
      }

      setProfessionals(data || []);
    } catch (error) {
      console.error('Error loading professionals:', error);
    }
  };

  const handleWithdraw = async () => {
    if (!product || !withdrawQuantity || !withdrawBy) {
      showError('Please fill in all required fields');
      return;
    }

    const quantity = parseInt(withdrawQuantity);
    if (isNaN(quantity) || quantity <= 0) {
      showError('Please enter a valid quantity');
      return;
    }

    if (quantity > product.current_stock) {
      showError('Cannot withdraw more than current stock');
      return;
    }

    setLoading(true);

    try {
      // Update inventory stock
      const { error: inventoryError } = await supabase
        .from('inventory')
        .update({ 
          current_stock: product.current_stock - quantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', product.id);

      if (inventoryError) throw inventoryError;

      // Try to create movement record (optional - table may not exist yet)
      try {
        const { error: movementError } = await supabase
          .from('inventory_movements')
          .insert({
            inventory_id: product.id,
            product_name: product.product_name,
            professional_id: withdrawBy,
            movement_type: 'withdraw',
            quantity: quantity,
            previous_stock: product.current_stock,
            new_stock: product.current_stock - quantity,
            notes: `Withdrawn by professional`,
            created_at: new Date().toISOString()
          });
        
        if (movementError) {
          console.error('Movement tracking error:', movementError);
          console.log('Movement data attempted:', {
            inventory_id: product.id,
            product_name: product.product_name,
            professional_id: withdrawBy,
            movement_type: 'withdraw',
            quantity: quantity
          });
        } else {
          console.log('Movement recorded successfully');
        }
      } catch (movementError) {
        console.error('Movement tracking not available yet:', movementError);
        // Continue without movement tracking for now
      }

      showSuccess(`Successfully withdrew ${quantity} ${product.product_name}`);
      
      // Reset form
      setWithdrawQuantity("");
      setWithdrawBy("");
      
      // Close modal and trigger refresh
      onOpenChange(false);
      onWithdrawComplete?.();

    } catch (error) {
      console.error('Error withdrawing product:', error);
      showError('Failed to withdraw product');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setWithdrawQuantity("");
    setWithdrawBy("");
    onOpenChange(false);
  };

  if (!product) return null;

  const getStockStatus = (current: number, min: number, max: number): "success" | "error" | "neutral" => {
    if (current < min) return "error";
    if (current > max) return "success";
    return "neutral";
  };

  return (
    <DialogLayout open={open} onOpenChange={onOpenChange}>
      <div className="flex h-full w-144 flex-col items-start bg-default-background mobile:h-auto mobile:w-96">
        <div className="flex w-full grow shrink-0 basis-0 items-center justify-between border-b border-solid border-neutral-border bg-default-background px-4 py-4">
          <span className="grow shrink-0 basis-0 text-heading-2 font-heading-2 text-default-font">
            Withdraw product
          </span>
          <IconButton
            disabled={false}
            icon={<FeatherX />}
            onClick={handleClose}
          />
        </div>
        <div className="flex w-full flex-col items-start gap-8 px-4 py-4 mobile:flex-col mobile:flex-nowrap mobile:gap-6">
          <div className="flex w-full flex-col items-start gap-4">
            <div className="flex w-full flex-col items-start rounded-md bg-neutral-100 px-4 py-2 mobile:h-auto mobile:w-full mobile:flex-none mobile:px-2 mobile:py-2">
              <div className="flex h-12 w-full flex-none items-center justify-between border-b border-solid border-neutral-border py-2 mobile:w-full mobile:grow mobile:shrink-0 mobile:basis-0 mobile:flex-col mobile:flex-nowrap mobile:items-start mobile:justify-start mobile:gap-1">
                <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color mobile:text-body-small mobile:font-body-small">
                  Product
                </span>
                <span className="grow shrink-0 basis-0 text-body-large font-body-large text-default-font text-right mobile:text-default-font mobile:text-left">
                  {product.product_name}
                </span>
              </div>
              <div className="flex h-12 w-full flex-none items-center justify-between border-b border-solid border-neutral-border py-2 mobile:w-full mobile:grow mobile:shrink-0 mobile:basis-0 mobile:flex-col mobile:flex-nowrap mobile:items-start mobile:justify-start mobile:gap-1">
                <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color mobile:text-body-small mobile:font-body-small">
                  Min/Max
                </span>
                <span className="grow shrink-0 basis-0 text-body-large font-body-large text-default-font text-right mobile:text-default-font mobile:text-left">
                  {product.minimum_stock}/{product.maximum_stock}
                </span>
              </div>
              <div className="flex h-12 w-full flex-none items-center justify-between py-2 mobile:w-full mobile:grow mobile:shrink-0 mobile:basis-0 mobile:flex-col mobile:flex-nowrap mobile:items-start mobile:justify-start mobile:gap-1">
                <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color mobile:text-body-small mobile:font-body-small">
                  Current Stock
                </span>
                <Chips 
                  variant={getStockStatus(product.current_stock, product.minimum_stock, product.maximum_stock)} 
                  icon={null} 
                  size="large"
                >
                  {product.current_stock}
                </Chips>
              </div>
            </div>
            <div className="flex w-full grow shrink-0 basis-0 flex-col items-start">
              <div className="flex h-12 w-full flex-none items-center justify-between py-2">
                <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                  Withdraw quantity
                </span>
                <TextField
                  className="h-10 grow shrink-0 basis-0"
                  disabled={false}
                  error={false}
                  variant="filled"
                  label=""
                  helpText=""
                  icon={null}
                  iconRight={null}
                >
                  <TextField.Input
                    type="number"
                    placeholder="Enter quantity"
                    value={withdrawQuantity}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => 
                      setWithdrawQuantity(event.target.value)
                    }
                    min="1"
                    max={product.current_stock.toString()}
                  />
                </TextField>
              </div>
              <div className="flex w-full grow shrink-0 basis-0 items-center justify-between py-2">
                <span className="w-52 flex-none text-body-medium font-body-medium text-subtext-color">
                  Withdraw by
                </span>
                <Select
                  className="h-auto grow shrink-0 basis-0 self-stretch"
                  disabled={false}
                  error={false}
                  variant="filled"
                  label=""
                  placeholder="Select professional"
                  helpText=""
                  icon={null}
                  value={withdrawBy}
                  onValueChange={setWithdrawBy}
                >
                  {professionals.map((professional) => (
                    <Select.Item key={professional.id} value={professional.id}>
                      {professional.name}
                    </Select.Item>
                  ))}
                </Select>
              </div>
            </div>
          </div>
          <Button
            className="h-10 w-full flex-none"
            disabled={!withdrawQuantity || !withdrawBy || loading}
            variant="brand-primary"
            size="large"
            icon={null}
            iconRight={null}
            loading={loading}
            onClick={handleWithdraw}
          >
            {loading ? 'Processing...' : 'Confirm Withdrawal'}
          </Button>
        </div>
      </div>
    </DialogLayout>
  );
}

export default WithdrawProductModal;