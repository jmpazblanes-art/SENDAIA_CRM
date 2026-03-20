-- Añadir columna category a lead_notes
-- Esto evita el retry silencioso en createNoteAction cuando se guarda con categoría
ALTER TABLE public.lead_notes
    ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general';

-- Restricción opcional para valores válidos
ALTER TABLE public.lead_notes
    ADD CONSTRAINT lead_notes_category_check
    CHECK (category IN ('general', 'call', 'meeting', 'technical', 'closing'))
    NOT VALID; -- NOT VALID para no bloquear filas existentes
