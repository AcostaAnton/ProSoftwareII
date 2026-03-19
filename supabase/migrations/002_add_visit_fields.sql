-- ============================================================
-- Migración: Agregar campos visit_purpose y visit_destination a visits
-- ============================================================

ALTER TABLE public.visits
ADD COLUMN IF NOT EXISTS visit_purpose TEXT,
ADD COLUMN IF NOT EXISTS visit_destination TEXT;