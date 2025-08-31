"use client";

import React, { useState, useEffect } from "react";
import { supabase, LabOrder, Professional } from "@/lib/supabase";
import NewLabOrderModal from "@/components/custom/NewLabOrderModal";
import OrderDetailsDrawer from "@/components/custom/OrderDetailsDrawer";
import SupplierDetailsDrawer from "@/components/custom/SupplierDetailsDrawer";
import { Button } from "@/ui/components/Button";
import { Chips } from "@/ui/components/Chips";
import { DropdownMenu } from "@/ui/components/DropdownMenu";
import { IconButton } from "@/ui/components/IconButton";
import { LinkButton } from "@/ui/components/LinkButton";
import { Table } from "@/ui/components/Table";
import { TextField } from "@/ui/components/TextField";
import { DefaultPageLayout } from "@/ui/layouts/DefaultPageLayout";
import { FeatherChevronDown } from "@subframe/core";
import { FeatherDownload } from "@subframe/core";
import { FeatherEdit2 } from "@subframe/core";
import { FeatherMoreHorizontal } from "@subframe/core";
import { FeatherPlus } from "@subframe/core";
import { FeatherPrinter } from "@subframe/core";
import { FeatherSearch } from "@subframe/core";
import { FeatherStar } from "@subframe/core";
import { FeatherTrash } from "@subframe/core";
import { FeatherX } from "@subframe/core";
import * as SubframeCore from "@subframe/core";

function LabsOrder() {
  const [labOrders, setLabOrders] = useState<LabOrder[]>([]);
  const [filteredLabOrders, setFilteredLabOrders] = useState<LabOrder[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProfessional, setSelectedProfessional] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | undefined>(undefined);
  const [editingOrder, setEditingOrder] = useState<LabOrder | null>(null);
  const [showSupplierDetails, setShowSupplierDetails] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | undefined>(undefined);

  // Função para buscar dados do Supabase
  const fetchLabOrders = async () => {
    try {
      setLoading(true);
      
      // Atualizar status baseado na data de vencimento
      await supabase.rpc('update_lab_order_status');
      
      // Buscar todos os lab orders incluindo supplier_id
      const { data, error } = await supabase
        .from('lab_orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar lab orders:', error);
      } else {
        console.log('Lab orders carregados:', data);
        setLabOrders(data || []);
      }
    } catch (error) {
      console.error('Erro ao buscar lab orders:', error);
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados quando o componente montar
  useEffect(() => {
    fetchLabOrders();
    loadProfessionals();
    checkSuppliers(); // Adicionar verificação de suppliers
  }, []);

  // Aplicar filtros quando dados ou filtros mudarem
  useEffect(() => {
    filterLabOrders();
  }, [labOrders, searchTerm, selectedProfessional, sortBy]);

  const loadProfessionals = async () => {
    try {
      const { data, error } = await supabase
        .from('professionals')
        .select('id, name, specialty')
        .order('name', { ascending: true });

      if (error) throw error;
      setProfessionals(data || []);
    } catch (error) {
      console.error('Erro ao carregar profissionais:', error);
    }
  };

  const checkSuppliers = async () => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Erro ao carregar suppliers - tabela pode não existir:', error);
      } else {
        console.log('Suppliers disponíveis:', data);
      }
    } catch (error) {
      console.error('Erro ao verificar suppliers:', error);
    }
  };

  const filterLabOrders = () => {
    let filtered = labOrders;
    
    // Filter by professional
    if (selectedProfessional !== 'all') {
      filtered = filtered.filter(order => order.professional_id === selectedProfessional);
    }
    
    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(order => {
        // Filter by patient name
        if (order.patient_name?.toLowerCase().includes(term)) return true;
        
        // Filter by order name
        if (order.order_name?.toLowerCase().includes(term)) return true;
        
        // Filter by professional name
        if (order.professional_name?.toLowerCase().includes(term)) return true;
        
        // Filter by lab name
        if (order.lab_name?.toLowerCase().includes(term)) return true;
        
        // Filter by services
        if (order.services?.toLowerCase().includes(term)) return true;
        
        return false;
      });
    }
    
    // Sort orders
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'a-z':
          return (a.order_name || '').localeCompare(b.order_name || '');
        case 'z-a':
          return (b.order_name || '').localeCompare(a.order_name || '');
        case 'newest':
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        case 'oldest':
          return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
        case 'due-date':
          return new Date(a.due_date || 0).getTime() - new Date(b.due_date || 0).getTime();
        default:
          return 0;
      }
    });
    
    setFilteredLabOrders(sorted);
  };

  const handleOrderClick = (orderId: string) => {
    setSelectedOrderId(orderId);
    setShowOrderDetails(true);
  };

  const handleEditOrder = (order: LabOrder) => {
    setEditingOrder(order);
    setShowNewOrderModal(true);
  };

  const handleLabNameClick = async (labName: string, supplierId?: string) => {
    console.log('handleLabNameClick chamado:', { labName, supplierId });
    
    // TESTE: Forçar abertura do drawer com um ID fake para testar o componente
    const testSupplierId = "123e4567-e89b-12d3-a456-426614174000"; // UUID fake para teste
    console.log('TESTE: Forçando abertura do drawer com ID fake');
    setSelectedSupplierId(testSupplierId);
    setShowSupplierDetails(true);
    return; // Sair early para teste
    
    if (supplierId) {
      // Se já temos o supplier_id, usar diretamente
      console.log('Usando supplier_id diretamente:', supplierId);
      setSelectedSupplierId(supplierId);
      setShowSupplierDetails(true);
    } else {
      // Se não temos supplier_id, buscar supplier pelo nome do lab
      console.log('Buscando supplier pelo nome:', labName);
      try {
        const { data, error } = await supabase
          .from('suppliers')
          .select('id')
          .eq('name', labName)
          .single();

        console.log('Resultado da busca:', { data, error });

        if (data && !error) {
          console.log('Supplier encontrado, abrindo drawer:', data.id);
          setSelectedSupplierId(data.id);
          setShowSupplierDetails(true);
        } else {
          console.log('Supplier não encontrado para:', labName);
          // Mostrar alerta para o usuário
          alert(`Supplier não encontrado para o lab: ${labName}`);
        }
      } catch (error) {
        console.error('Erro ao buscar supplier:', error);
      }
    }
  };

  const handleModalClose = (open: boolean) => {
    setShowNewOrderModal(open);
    if (!open) {
      setEditingOrder(null); // Reset editing state when modal closes
    }
  };

  const getSortDisplayText = (sortOption: string) => {
    switch (sortOption) {
      case 'a-z': return 'A to Z';
      case 'z-a': return 'Z to A';
      case 'newest': return 'Newest to Oldest';
      case 'oldest': return 'Oldest to Newest';
      case 'due-date': return 'Due Date';
      default: return 'Newest to Oldest';
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

  return (
    <DefaultPageLayout>
      <div className="flex h-full w-full flex-col items-start gap-4 bg-default-background shadow-md pb-3">
        <div className="flex h-auto w-full flex-none items-center justify-between px-8 py-2 border-b border-solid border-neutral-border">
          <div className="flex flex-col items-start gap-2">
            <span className="text-heading-2 font-heading-2 text-default-font">
              Labs Order
            </span>
          </div>
          <div className="flex items-center gap-2">
            <SubframeCore.DropdownMenu.Root>
              <SubframeCore.DropdownMenu.Trigger asChild={true}>
                <Button
                  disabled={false}
                  variant="neutral-secondary"
                  size="large"
                  iconRight={null}
                  loading={false}
                  onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                >
                  Actions
                </Button>
              </SubframeCore.DropdownMenu.Trigger>
              <SubframeCore.DropdownMenu.Portal>
                <SubframeCore.DropdownMenu.Content
                  side="bottom"
                  align="start"
                  sideOffset={6}
                  asChild={true}
                >
                  <DropdownMenu>
                    <DropdownMenu.DropdownItem icon={<FeatherPrinter />}>
                      Print
                    </DropdownMenu.DropdownItem>
                    <DropdownMenu.DropdownItem icon={<FeatherDownload />}>
                      Download as...
                    </DropdownMenu.DropdownItem>
                    <DropdownMenu.DropdownItem icon={<FeatherPlus />}>
                      Create product category
                    </DropdownMenu.DropdownItem>
                  </DropdownMenu>
                </SubframeCore.DropdownMenu.Content>
              </SubframeCore.DropdownMenu.Portal>
            </SubframeCore.DropdownMenu.Root>
            <Button
              disabled={false}
              variant="brand-primary"
              size="large"
              icon={<FeatherPlus />}
              iconRight={null}
              loading={false}
              onClick={() => setShowNewOrderModal(true)}
            >
              New Lab Order
            </Button>
          </div>
        </div>
        <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-6 rounded-lg bg-default-background px-4 py-4 overflow-auto">
          <div className="flex w-full flex-wrap items-center justify-between pb-4">
            <div className="flex items-center gap-4">
              <SubframeCore.DropdownMenu.Root>
                <SubframeCore.DropdownMenu.Trigger asChild={true}>
                  <Button
                    variant="neutral-tertiary"
                    size="large"
                    iconRight={<FeatherChevronDown />}
                    onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                  >
                    Sort by: {getSortDisplayText(sortBy)}
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
                        onClick={() => setSortBy('a-z')}
                      >
                        A to Z
                      </DropdownMenu.DropdownItem>
                      <DropdownMenu.DropdownItem
                        onClick={() => setSortBy('z-a')}
                      >
                        Z to A
                      </DropdownMenu.DropdownItem>
                      <DropdownMenu.DropdownItem
                        onClick={() => setSortBy('newest')}
                      >
                        Newest to Oldest
                      </DropdownMenu.DropdownItem>
                      <DropdownMenu.DropdownItem
                        onClick={() => setSortBy('oldest')}
                      >
                        Oldest to Newest
                      </DropdownMenu.DropdownItem>
                      <DropdownMenu.DropdownItem
                        onClick={() => setSortBy('due-date')}
                      >
                        Due Date
                      </DropdownMenu.DropdownItem>
                    </DropdownMenu>
                  </SubframeCore.DropdownMenu.Content>
                </SubframeCore.DropdownMenu.Portal>
              </SubframeCore.DropdownMenu.Root>
              
              <SubframeCore.DropdownMenu.Root>
                <SubframeCore.DropdownMenu.Trigger asChild={true}>
                  <Button
                    variant="neutral-tertiary"
                    size="large"
                    iconRight={<FeatherChevronDown />}
                    onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                  >
                    {selectedProfessional === 'all' 
                      ? 'All professionals' 
                      : professionals.find(p => p.id === selectedProfessional)?.name || 'All professionals'
                    }
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
                        onClick={() => setSelectedProfessional('all')}
                      >
                        All professionals
                      </DropdownMenu.DropdownItem>
                      {professionals.length === 0 ? (
                        <DropdownMenu.DropdownItem>
                          Carregando profissionais...
                        </DropdownMenu.DropdownItem>
                      ) : (
                        professionals.map((professional) => (
                          <DropdownMenu.DropdownItem
                            key={professional.id}
                            onClick={() => setSelectedProfessional(professional.id)}
                          >
                            {professional.name}
                          </DropdownMenu.DropdownItem>
                        ))
                      )}
                    </DropdownMenu>
                  </SubframeCore.DropdownMenu.Content>
                </SubframeCore.DropdownMenu.Portal>
              </SubframeCore.DropdownMenu.Root>
            </div>
            <TextField
              className="h-10 w-96 flex-none"
              variant="filled"
              label=""
              helpText=""
              icon={<FeatherSearch />}
              iconRight={searchTerm ? (
                <IconButton
                  variant="neutral-tertiary"
                  size="small"
                  icon={<FeatherX />}
                  onClick={() => setSearchTerm('')}
                />
              ) : null}
            >
              <TextField.Input
                placeholder="Search by patient name, order name, professional..."
                value={searchTerm}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(event.target.value)}
              />
            </TextField>
          </div>
          <Table
            className="h-auto w-full flex-none"
            header={
              <Table.HeaderRow className="w-full grow shrink-0 basis-0">
                <Table.HeaderCell>Order name</Table.HeaderCell>
                <Table.HeaderCell>Patient</Table.HeaderCell>
                <Table.HeaderCell>Professional</Table.HeaderCell>
                <Table.HeaderCell>Lab name</Table.HeaderCell>
                <Table.HeaderCell>Services</Table.HeaderCell>
                <Table.HeaderCell>Due date</Table.HeaderCell>
                <Table.HeaderCell>Total Price</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell />
              </Table.HeaderRow>
            }
          >
            {loading ? (
              <Table.Row className="h-12 w-full flex-none">
                <Table.Cell colSpan={9} className="h-16 text-center">
                  <span className="text-body-medium font-body-medium text-neutral-500">
                    Carregando...
                  </span>
                </Table.Cell>
              </Table.Row>
            ) : filteredLabOrders.length === 0 ? (
              <Table.Row className="h-12 w-full flex-none">
                <Table.Cell colSpan={9} className="h-16 text-center">
                  <span className="text-body-medium font-body-medium text-neutral-500">
                    Nenhum pedido encontrado
                  </span>
                </Table.Cell>
              </Table.Row>
            ) : (
              filteredLabOrders.map((order) => (
                <Table.Row key={order.id} className="h-12 w-full flex-none">
                  <Table.Cell className="h-16 grow shrink-0 basis-0">
                    <button
                      className="text-body-medium font-body-medium text-brand-600 hover:text-brand-700 underline cursor-pointer"
                      onClick={() => handleOrderClick(order.id!)}
                    >
                      {order.order_name}
                    </button>
                  </Table.Cell>
                  <Table.Cell className="h-16 grow shrink-0 basis-0">
                    <span className="whitespace-nowrap text-body-medium font-body-medium text-neutral-500">
                      {order.patient_name || 'N/A'}
                    </span>
                  </Table.Cell>
                  <Table.Cell className="h-16 grow shrink-0 basis-0">
                    <span className="whitespace-nowrap text-body-medium font-body-medium text-neutral-500">
                      {order.professional_name || 'N/A'}
                    </span>
                  </Table.Cell>
                  <Table.Cell className="h-16 grow shrink-0 basis-0">
                    <LinkButton
                      disabled={false}
                      variant="brand"
                      size="medium"
                      icon={null}
                      iconRight={null}
                      onClick={() => handleLabNameClick(order.lab_name, order.supplier_id)}
                    >
                      {order.lab_name}
                    </LinkButton>
                  </Table.Cell>
                  <Table.Cell className="h-16 grow shrink-0 basis-0">
                    <span className="whitespace-nowrap text-body-medium font-body-medium text-neutral-500">
                      {order.services}
                    </span>
                  </Table.Cell>
                  <Table.Cell className="h-16 grow shrink-0 basis-0">
                    <span className="text-body-medium font-body-medium text-default-font">
                      {new Date(order.due_date).toLocaleDateString('pt-BR')}
                    </span>
                  </Table.Cell>
                  <Table.Cell className="h-16 grow shrink-0 basis-0">
                    <span className="text-body-medium font-body-medium text-default-font">
                      ${order.total_price.toFixed(2)}
                    </span>
                  </Table.Cell>
                  <Table.Cell className="h-16 grow shrink-0 basis-0">
                    <Chips
                      variant={getStatusVariant(order.status) as any}
                      icon={null}
                      iconRight={null}
                      size="large"
                    >
                      {getStatusText(order.status)}
                    </Chips>
                  </Table.Cell>
                  <Table.Cell className="grow shrink-0 basis-0 flex justify-end items-center w-full h-full">
                    <SubframeCore.DropdownMenu.Root>
                      <SubframeCore.DropdownMenu.Trigger asChild={true}>
                        <IconButton
                          size="medium"
                          icon={<FeatherMoreHorizontal />}
                          onClick={(
                            event: React.MouseEvent<HTMLButtonElement>
                          ) => {}}
                        />
                      </SubframeCore.DropdownMenu.Trigger>
                      <SubframeCore.DropdownMenu.Portal>
                        <SubframeCore.DropdownMenu.Content
                          side="bottom"
                          align="end"
                          sideOffset={8}
                          asChild={true}
                        >
                          <DropdownMenu>
                            <DropdownMenu.DropdownItem icon={<FeatherStar />}>
                              Favorite
                            </DropdownMenu.DropdownItem>
                            <DropdownMenu.DropdownItem icon={<FeatherPlus />}>
                              Add
                            </DropdownMenu.DropdownItem>
                            <DropdownMenu.DropdownItem icon={<FeatherEdit2 />}>
                              Edit
                            </DropdownMenu.DropdownItem>
                            <DropdownMenu.DropdownItem icon={<FeatherTrash />}>
                              Delete
                            </DropdownMenu.DropdownItem>
                          </DropdownMenu>
                        </SubframeCore.DropdownMenu.Content>
                      </SubframeCore.DropdownMenu.Portal>
                    </SubframeCore.DropdownMenu.Root>
                  </Table.Cell>
                </Table.Row>
              ))
            )}
          </Table>
        </div>
      </div>

      {/* Modal para criar novo lab order */}
      <NewLabOrderModal
        open={showNewOrderModal}
        onOpenChange={handleModalClose}
        onLabOrderCreated={fetchLabOrders}
        editingOrder={editingOrder}
      />

      {/* Drawer para mostrar detalhes do pedido */}
      <OrderDetailsDrawer
        open={showOrderDetails}
        onOpenChange={setShowOrderDetails}
        orderId={selectedOrderId}
        onEditOrder={handleEditOrder}
      />

      {/* Drawer para mostrar detalhes do supplier */}
      <SupplierDetailsDrawer
        open={showSupplierDetails}
        onOpenChange={setShowSupplierDetails}
        supplierId={selectedSupplierId}
      />
    </DefaultPageLayout>
  );
}

export default LabsOrder;