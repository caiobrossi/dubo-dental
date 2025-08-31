"use client";

import React, { useState, useEffect } from "react";
import { Avatar } from "@/ui/components/Avatar";
import { Button } from "@/ui/components/Button";
import { IconButton } from "@/ui/components/IconButton";
import { SegmentControl } from "@/ui/components/SegmentControl";
import { DefaultPageLayout } from "@/ui/layouts/DefaultPageLayout";
import { FeatherMoreVertical, FeatherPlus, FeatherUser, FeatherEdit2, FeatherTrash } from "@subframe/core";
import { DropdownMenu } from "@/ui/components/DropdownMenu";
import * as SubframeCore from "@subframe/core";
import { useRouter } from "next/navigation";
import AddChairRoomModal from "@/components/custom/AddChairRoomModal";
import { supabase, Professional, ChairRoom } from "@/lib/supabase";

// Extended interface for local display with backward compatibility
interface DisplayChairRoom extends ChairRoom {
  assignedTo?: string; // Keep for backward compatibility with existing data
  image?: string;
}

// Default chairs and rooms data
const defaultChairsRooms: DisplayChairRoom[] = [
  {
    id: '1',
    name: 'Room 01',
    type: 'room',
    assigned_professionals: ['1'],
    assignedTo: 'Rafael Rodrigues',
    image: 'https://res.cloudinary.com/subframe/image/upload/v1711417511/shared/t4qorgih4yjwudzjfkxq.png'
  },
  {
    id: '2',
    name: 'Chair Moonlight',
    type: 'chair',
    assigned_professionals: ['1'],
    assignedTo: 'Rafael Rodrigues',
    image: 'https://res.cloudinary.com/subframe/image/upload/v1711417511/shared/t4qorgih4yjwudzjfkxq.png'
  },
  {
    id: '3',
    name: 'Chair Sunshine',
    type: 'chair',
    assigned_professionals: ['1'],
    assignedTo: 'Rafael Rodrigues',
    image: 'https://res.cloudinary.com/subframe/image/upload/v1711417511/shared/t4qorgih4yjwudzjfkxq.png'
  },
  {
    id: '4',
    name: 'Chair Moonbeam',
    type: 'chair',
    assigned_professionals: ['1'],
    assignedTo: 'Rafael Rodrigues',
    image: 'https://res.cloudinary.com/subframe/image/upload/v1711417511/shared/t4qorgih4yjwudzjfkxq.png'
  }
];

function ChairsAndRooms() {
  const router = useRouter();
  const [chairsRooms, setChairsRooms] = useState<DisplayChairRoom[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingChairRoom, setEditingChairRoom] = useState<ChairRoom | null>(null);
  const [allProfessionals, setAllProfessionals] = useState<Professional[]>([]);

  // Function to capitalize text
  const capitalizeText = (text: string) => {
    return text
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Load data from database on mount
  useEffect(() => {
    const loadProfessionals = async () => {
      try {
        const { data, error } = await supabase
          .from('professionals')
          .select('*')
          .order('name', { ascending: true });

        if (error) throw error;
        setAllProfessionals(data || []);
      } catch (error) {
        console.error('Error loading professionals:', error);
      }
    };

    const loadChairsRooms = async () => {
      try {
        const { data, error } = await supabase
          .from('chairs_rooms')
          .select('*')
          .order('created_at', { ascending: true });

        if (error) throw error;
        // Capitalize names when loading from database
        const capitalizedData = (data || []).map(item => ({
          ...item,
          name: capitalizeText(item.name)
        }));
        setChairsRooms(capitalizedData);
      } catch (error) {
        console.error('Error loading chairs/rooms:', error);
        // Fallback to default data if table doesn't exist yet
        setChairsRooms(defaultChairsRooms);
      }
    };

    const loadData = async () => {
      try {
        // Load both professionals and chairs/rooms
        await Promise.all([
          loadProfessionals(),
          loadChairsRooms()
        ]);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadData();
  }, []);

  // Get professional names from IDs
  const getProfessionalNames = (professionalIds: string[]) => {
    if (!professionalIds || professionalIds.length === 0) return 'No one assigned';
    
    const assignedProfessionals = allProfessionals.filter(professional => 
      professionalIds.includes(professional.id)
    );
    
    if (assignedProfessionals.length === 0) return 'No one assigned';
    
    return assignedProfessionals.map(p => p.name).join(', ');
  };

  // Reload chairs/rooms from database
  const reloadChairsRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('chairs_rooms')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      // Capitalize names when reloading from database
      const capitalizedData = (data || []).map(item => ({
        ...item,
        name: capitalizeText(item.name)
      }));
      setChairsRooms(capitalizedData);
    } catch (error) {
      console.error('Error reloading chairs/rooms:', error);
    }
  };

  const handleChairRoomAdded = async (chairRoom: ChairRoom) => {
    // Reload data from database to get the latest
    await reloadChairsRooms();
    setEditingChairRoom(null);
    setIsAddModalOpen(false);
  };

  const handleEditChairRoom = (chairRoom: DisplayChairRoom) => {
    setEditingChairRoom(chairRoom);
    setIsAddModalOpen(true);
  };

  const handleDeleteChairRoom = async (chairRoom: DisplayChairRoom) => {
    if (!chairRoom.id) return;
    
    const confirmDelete = window.confirm(`Are you sure you want to delete "${chairRoom.name}"?`);
    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from('chairs_rooms')
        .delete()
        .eq('id', chairRoom.id);

      if (error) throw error;
      
      // Reload data after deletion
      await reloadChairsRooms();
    } catch (error) {
      console.error('Error deleting chair/room:', error);
      alert('Failed to delete chair/room. Please try again.');
    }
  };

  // Show loading state while data is being loaded
  if (!isLoaded) {
    return (
      <DefaultPageLayout>
        <div className="flex h-full w-full items-center justify-center bg-white">
          <span className="text-body-medium font-body-medium text-subtext-color">Loading...</span>
        </div>
      </DefaultPageLayout>
    );
  }

  return (
    <DefaultPageLayout>
      <div className="flex h-full w-full flex-col items-start bg-default-background">
        {/* Fixed Header */}
        <div className="flex w-full flex-col items-center bg-white/80 backdrop-blur-md px-8 py-3 border-b border-neutral-border/50">
          <div className="flex w-full items-start justify-between px-2 py-2">
            <div className="flex items-center gap-4">
              <Avatar
                size="large"
                image="https://res.cloudinary.com/subframe/image/upload/v1711417549/shared/jtjkdxvy1mm2ozvaymwv.png"
              >
                A
              </Avatar>
              <span className="text-heading-1 font-heading-1 text-default-font">
                Clinic Up
              </span>
            </div>
            <Button
              disabled={false}
              variant="neutral-secondary"
              size="medium"
              icon={<FeatherPlus />}
              iconRight={null}
              loading={false}
              onClick={() => setIsAddModalOpen(true)}
            >
              Add Chair / Room
            </Button>
          </div>
          <SegmentControl
            className="h-10 w-auto flex-none"
            variant="default"
            variant2="default"
          >
            <SegmentControl.Item 
              active={false}
              onClick={() => router.push('/admin')}
            >
              Clinic Info
            </SegmentControl.Item>
            <SegmentControl.Item active={true}>
              Chairs and Rooms
            </SegmentControl.Item>
            <SegmentControl.Item active={false}>My team</SegmentControl.Item>
            <SegmentControl.Item active={false}>Schedule shifts</SegmentControl.Item>
            <SegmentControl.Item active={false}>Team payment</SegmentControl.Item>
            <SegmentControl.Item active={false}>Finance</SegmentControl.Item>
          </SegmentControl>
        </div>
        
        {/* Scrollable Content */}
        <div className="flex w-full grow shrink-0 basis-0 flex-col items-center gap-12 rounded-lg bg-default-background px-4 py-4 overflow-auto">
          <div className="flex w-full max-w-[1200px] grow shrink-0 basis-0 items-start gap-8 px-4 pt-6">
            {/* Chairs and Rooms Grid */}
            <div className="flex w-full flex-col items-start gap-6">
              <div className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                {chairsRooms.map((item) => (
                  <div 
                    key={item.id}
                    className="flex flex-col items-start justify-between rounded-md bg-neutral-100 hover:bg-white hover:shadow-md hover:border hover:border-neutral-border p-4 transition-all min-h-[140px]"
                  >
                    <div className="flex w-full items-center gap-3 pb-4">
                      <img
                        className="h-8 w-8 flex-none object-cover rounded-full"
                        src={item.image}
                        alt={item.name}
                      />
                      <span className="line-clamp-2 grow shrink-0 basis-0 text-heading-3 font-heading-3 text-default-font">
                        {item.name}
                      </span>
                      <SubframeCore.DropdownMenu.Root>
                        <SubframeCore.DropdownMenu.Trigger asChild={true}>
                          <IconButton
                            size="medium"
                            icon={<FeatherMoreVertical />}
                            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                          />
                        </SubframeCore.DropdownMenu.Trigger>
                        <SubframeCore.DropdownMenu.Portal>
                          <SubframeCore.DropdownMenu.Content
                            side="bottom"
                            align="end"
                            sideOffset={4}
                            asChild={true}
                          >
                            <DropdownMenu>
                              <DropdownMenu.DropdownItem 
                                icon={<FeatherEdit2 />}
                                onClick={() => handleEditChairRoom(item)}
                              >
                                Edit {item.type}
                              </DropdownMenu.DropdownItem>
                              <DropdownMenu.DropdownItem 
                                icon={<FeatherTrash />}
                                onClick={() => handleDeleteChairRoom(item)}
                              >
                                Delete {item.type}
                              </DropdownMenu.DropdownItem>
                            </DropdownMenu>
                          </SubframeCore.DropdownMenu.Content>
                        </SubframeCore.DropdownMenu.Portal>
                      </SubframeCore.DropdownMenu.Root>
                    </div>
                    <div className="flex w-full items-center gap-2">
                      <FeatherUser className="text-body-medium font-body-medium text-subtext-color" />
                      <span className="text-caption font-caption text-subtext-color">
                        {item.assigned_professionals && item.assigned_professionals.length > 0 
                          ? `Assigned to ${getProfessionalNames(item.assigned_professionals)}`
                          : item.assignedTo 
                          ? `Assigned to ${item.assignedTo}`
                          : 'No one assigned'
                        }
                      </span>
                    </div>
                  </div>
                ))}
                
                {/* Add New Card */}
                <div 
                  className="flex flex-col items-center justify-center rounded-md border-2 border-dashed border-neutral-300 bg-neutral-50 p-4 hover:border-brand-400 hover:bg-brand-50 transition-all cursor-pointer h-[140px]"
                  onClick={() => setIsAddModalOpen(true)}
                >
                  <FeatherPlus className="text-2xl text-neutral-400 mb-2" />
                  <span className="text-body-medium font-body-medium text-neutral-600 text-center">
                    Add Chair or Room
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Chair Room Modal */}
      <AddChairRoomModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onChairRoomAdded={handleChairRoomAdded}
        editingChairRoom={editingChairRoom}
      />
    </DefaultPageLayout>
  );
}

export default ChairsAndRooms;