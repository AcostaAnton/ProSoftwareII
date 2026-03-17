-- ============================================================
-- Migración: Agregar campos visit_purpose y visit_destination a visits
-- ============================================================

ALTER TABLE public.visits
ADD COLUMN visit_purpose TEXT,
ADD COLUMN visit_destination TEXT;