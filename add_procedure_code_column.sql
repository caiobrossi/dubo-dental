-- Add procedure_code column to procedures table
ALTER TABLE procedures 
ADD COLUMN procedure_code TEXT;

-- Create index for faster queries on procedure_code
CREATE INDEX idx_procedures_code ON procedures(procedure_code);

-- Add unique constraint for procedure_code within the same insurance plan (optional)
-- ALTER TABLE procedures 
-- ADD CONSTRAINT unique_procedure_code_per_plan UNIQUE (procedure_code, insurance_plan_id);