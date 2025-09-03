-- Create inventory_movements table to track all inventory changes
CREATE TABLE IF NOT EXISTS inventory_movements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    inventory_id UUID NOT NULL,
    product_name TEXT NOT NULL,
    professional_id UUID,
    movement_type TEXT NOT NULL CHECK (movement_type IN ('withdraw', 'add', 'adjust')),
    quantity INTEGER NOT NULL,
    previous_stock INTEGER NOT NULL,
    new_stock INTEGER NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Foreign key constraints
    CONSTRAINT fk_inventory_movements_inventory 
        FOREIGN KEY (inventory_id) REFERENCES inventory(id) ON DELETE CASCADE,
    CONSTRAINT fk_inventory_movements_professional 
        FOREIGN KEY (professional_id) REFERENCES professionals(id) ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_inventory_movements_inventory_id ON inventory_movements(inventory_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_professional_id ON inventory_movements(professional_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_created_at ON inventory_movements(created_at);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_movement_type ON inventory_movements(movement_type);

-- Add RLS (Row Level Security) policies if needed
-- ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;

-- Add comments for documentation
COMMENT ON TABLE inventory_movements IS 'Tracks all inventory movements including withdrawals, additions, and adjustments';
COMMENT ON COLUMN inventory_movements.movement_type IS 'Type of movement: withdraw, add, or adjust';
COMMENT ON COLUMN inventory_movements.quantity IS 'Quantity moved (positive for additions, negative for withdrawals)';
COMMENT ON COLUMN inventory_movements.previous_stock IS 'Stock level before the movement';
COMMENT ON COLUMN inventory_movements.new_stock IS 'Stock level after the movement';