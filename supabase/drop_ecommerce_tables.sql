-- Script de limpieza: Eliminar tablas del antiguo sistema de E-commerce / POS
-- Proyecto: Sistema de Gestión de Dispositivos Campus PUJ Cali
-- Estas tablas tienen 0 registros y no están vinculadas al sistema de dispositivos.

DROP TABLE IF EXISTS public.detalle_venta CASCADE;
DROP TABLE IF EXISTS public.venta CASCADE;
DROP TABLE IF EXISTS public.producto CASCADE;
DROP TABLE IF EXISTS public.cliente CASCADE;
DROP TABLE IF EXISTS public.vendedor CASCADE;
DROP TABLE IF EXISTS public.administrador CASCADE;
DROP TABLE IF EXISTS public.usuario CASCADE;
