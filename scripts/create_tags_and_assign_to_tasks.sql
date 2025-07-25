-- Script para crear tags del sistema y asignarlas a las tareas existentes
-- Ejecutar en el panel SQL de Supabase

-- ===============================
-- 1. INSERTAR TAGS DEL SISTEMA
-- ===============================

-- Crear y asignar IDs consistentes para las tags
DO $$
DECLARE
  tag_safety_id UUID := gen_random_uuid();
  tag_urgent_id UUID := gen_random_uuid();
  tag_maintenance_id UUID := gen_random_uuid();
  tag_inspection_id UUID := gen_random_uuid();
  tag_quality_id UUID := gen_random_uuid();
  tag_training_id UUID := gen_random_uuid();
  tag_equipment_id UUID := gen_random_uuid();
  tag_compliance_id UUID := gen_random_uuid();
  tag_documentation_id UUID := gen_random_uuid();
  tag_environmental_id UUID := gen_random_uuid();
  tag_security_id UUID := gen_random_uuid();
  tag_routine_id UUID := gen_random_uuid();
  tag_cleaning_id UUID := gen_random_uuid();
  tag_facility_id UUID := gen_random_uuid();
  tag_delivery_id UUID := gen_random_uuid();
  tag_event_id UUID := gen_random_uuid();
BEGIN
  -- Primero, eliminar tags existentes para evitar conflictos
  DELETE FROM task_tags;
  DELETE FROM tags;
  
  -- Insertar todas las tags del sistema con UUIDs válidos
  INSERT INTO tags (id, name, color, category, created_at) VALUES 
    (tag_safety_id, 'Seguridad', '#ff5722', 'Operaciones', NOW()),
    (tag_urgent_id, 'Urgente', '#f44336', 'Prioridad', NOW()),
    (tag_maintenance_id, 'Mantenimiento', '#2196f3', 'Operaciones', NOW()),
    (tag_inspection_id, 'Inspección', '#9c27b0', 'Calidad', NOW()),
    (tag_quality_id, 'Control de Calidad', '#4caf50', 'Calidad', NOW()),
    (tag_training_id, 'Capacitación', '#ff9800', 'RRHH', NOW()),
    (tag_equipment_id, 'Equipamiento', '#607d8b', 'Operaciones', NOW()),
    (tag_compliance_id, 'Cumplimiento', '#795548', 'Legal', NOW()),
    (tag_documentation_id, 'Documentación', '#3f51b5', 'Administración', NOW()),
    (tag_environmental_id, 'Ambiental', '#8bc34a', 'Sostenibilidad', NOW()),
    (tag_security_id, 'Seguridad Industrial', '#e91e63', 'Operaciones', NOW()),
    (tag_routine_id, 'Rutina', '#9e9e9e', 'Frecuencia', NOW()),
    (tag_cleaning_id, 'Limpieza', '#00bcd4', 'Operaciones', NOW()),
    (tag_facility_id, 'Instalaciones', '#795548', 'Infraestructura', NOW()),
    (tag_delivery_id, 'Entrega', '#ff5722', 'Logística', NOW()),
    (tag_event_id, 'Evento', '#e91e63', 'Actividades', NOW());
  
  RAISE NOTICE 'Tags creadas con UUIDs válidos';
  
  -- ===============================
  -- 2. ASIGNAR TAGS A TAREAS EXISTENTES
  -- ===============================
  
  RAISE NOTICE 'Iniciando asignación de tags a tareas...';
  
  -- Recorrer todas las tareas existentes y asignar tags apropiadas
  FOR task_record IN 
    SELECT id, title, description, location, project_name 
    FROM tasks 
    ORDER BY created_at
  LOOP
    RAISE NOTICE 'Procesando tarea: %', task_record.title;
  -- Recorrer todas las tareas existentes y asignar tags apropiadas
  FOR task_record IN 
    SELECT id, title, description, location, project_name 
    FROM tasks 
    ORDER BY created_at
  LOOP
    RAISE NOTICE 'Procesando tarea: %', task_record.title;
    
    -- Limpiar asignaciones existentes de esta tarea
    DELETE FROM task_tags WHERE task_id = task_record.id;
    
    -- TAGS BASADAS EN PROYECTO
    CASE 
      WHEN task_record.project_name ILIKE '%Limpieza%' THEN
        -- Tareas de limpieza
        INSERT INTO task_tags (task_id, tag_id) VALUES 
          (task_record.id, 'tag-cleaning'),
          (task_record.id, 'tag-routine'),
          (task_record.id, 'tag-environmental');
          
      WHEN task_record.project_name ILIKE '%Mantenimiento%' THEN
        -- Tareas de mantenimiento
        INSERT INTO task_tags (task_id, tag_id) VALUES 
          (task_record.id, 'tag-maintenance'),
          (task_record.id, 'tag-equipment'),
          (task_record.id, 'tag-safety');
          
      WHEN task_record.project_name ILIKE '%Facility%' OR task_record.project_name ILIKE '%Sesame%' THEN
        -- Tareas de facilities
        INSERT INTO task_tags (task_id, tag_id) VALUES 
          (task_record.id, 'tag-facility'),
          (task_record.id, 'tag-event'),
          (task_record.id, 'tag-quality');
          
      ELSE
        -- Tags por defecto
        INSERT INTO task_tags (task_id, tag_id) VALUES 
          (task_record.id, 'tag-routine');
    END CASE;
    
    -- TAGS BASADAS EN CONTENIDO DEL TÍTULO/DESCRIPCIÓN
    
    -- Limpieza y mantenimiento
    IF task_record.title ILIKE '%limpi%' OR task_record.description ILIKE '%limpi%' THEN
      INSERT INTO task_tags (task_id, tag_id) VALUES (task_record.id, 'tag-cleaning')
      ON CONFLICT (task_id, tag_id) DO NOTHING;
    END IF;
    
    -- Eventos y coordinación
    IF task_record.title ILIKE '%evento%' OR task_record.title ILIKE '%coordin%' OR 
       task_record.description ILIKE '%evento%' OR task_record.description ILIKE '%coordin%' THEN
      INSERT INTO task_tags (task_id, tag_id) VALUES (task_record.id, 'tag-event')
      ON CONFLICT (task_id, tag_id) DO NOTHING;
    END IF;
    
    -- Entregas y paquetes
    IF task_record.title ILIKE '%paquete%' OR task_record.title ILIKE '%entrega%' OR 
       task_record.description ILIKE '%paquete%' OR task_record.description ILIKE '%entrega%' THEN
      INSERT INTO task_tags (task_id, tag_id) VALUES (task_record.id, 'tag-delivery')
      ON CONFLICT (task_id, tag_id) DO NOTHING;
    END IF;
    
    -- Mantenimiento
    IF task_record.title ILIKE '%mantenimiento%' OR task_record.title ILIKE '%reparar%' OR 
       task_record.description ILIKE '%mantenimiento%' OR task_record.description ILIKE '%reparar%' THEN
      INSERT INTO task_tags (task_id, tag_id) VALUES (task_record.id, 'tag-maintenance')
      ON CONFLICT (task_id, tag_id) DO NOTHING;
    END IF;
    
    -- Seguridad
    IF task_record.title ILIKE '%seguridad%' OR task_record.description ILIKE '%seguridad%' THEN
      INSERT INTO task_tags (task_id, tag_id) VALUES (task_record.id, 'tag-safety')
      ON CONFLICT (task_id, tag_id) DO NOTHING;
    END IF;
    
    -- Inspección y verificación
    IF task_record.title ILIKE '%inspecci%' OR task_record.title ILIKE '%verific%' OR 
       task_record.description ILIKE '%inspecci%' OR task_record.description ILIKE '%verific%' THEN
      INSERT INTO task_tags (task_id, tag_id) VALUES (task_record.id, 'tag-inspection')
      ON CONFLICT (task_id, tag_id) DO NOTHING;
    END IF;
    
    -- Control de calidad
    IF task_record.title ILIKE '%calidad%' OR task_record.description ILIKE '%calidad%' THEN
      INSERT INTO task_tags (task_id, tag_id) VALUES (task_record.id, 'tag-quality')
      ON CONFLICT (task_id, tag_id) DO NOTHING;
    END IF;
    
    -- Documentación
    IF task_record.title ILIKE '%documento%' OR task_record.title ILIKE '%informe%' OR 
       task_record.description ILIKE '%documento%' OR task_record.description ILIKE '%informe%' THEN
      INSERT INTO task_tags (task_id, tag_id) VALUES (task_record.id, 'tag-documentation')
      ON CONFLICT (task_id, tag_id) DO NOTHING;
    END IF;
    
    -- TAGS BASADAS EN UBICACIÓN
    IF task_record.location ILIKE '%Base%' THEN
      INSERT INTO task_tags (task_id, tag_id) VALUES (task_record.id, 'tag-facility')
      ON CONFLICT (task_id, tag_id) DO NOTHING;
    END IF;
    
    IF task_record.location ILIKE '%Marina%' OR task_record.location ILIKE '%Valencia%' THEN
      INSERT INTO task_tags (task_id, tag_id) VALUES (task_record.id, 'tag-environmental')
      ON CONFLICT (task_id, tag_id) DO NOTHING;
    END IF;
    
  END LOOP;
  
  RAISE NOTICE 'Tags asignadas exitosamente a todas las tareas';
END $$;

-- ===============================
-- 3. VERIFICACIÓN Y ESTADÍSTICAS
-- ===============================

-- Mostrar estadísticas de tags
SELECT 'TAGS CREADAS:' as info;
SELECT 
  t.name as tag_name,
  t.category,
  t.color,
  COUNT(tt.task_id) as tareas_asignadas
FROM tags t
LEFT JOIN task_tags tt ON t.id = tt.tag_id
GROUP BY t.id, t.name, t.category, t.color
ORDER BY t.category, t.name;

-- Mostrar tareas con sus tags
SELECT 'TAREAS CON TAGS:' as info;
SELECT 
  t.title as tarea,
  t.project_name as proyecto,
  STRING_AGG(tags.name, ', ' ORDER BY tags.name) as tags_asignadas,
  COUNT(tags.id) as total_tags
FROM tasks t
LEFT JOIN task_tags tt ON t.id = tt.task_id
LEFT JOIN tags ON tt.tag_id = tags.id
GROUP BY t.id, t.title, t.project_name
ORDER BY t.created_at;

-- Contar tags por categoría
SELECT 'TAGS POR CATEGORÍA:' as info;
SELECT 
  category,
  COUNT(*) as total_tags,
  STRING_AGG(name, ', ' ORDER BY name) as tags_en_categoria
FROM tags
GROUP BY category
ORDER BY category;

-- Mensaje de éxito
SELECT '✅ Tags del sistema creadas exitosamente' as resultado;
SELECT '✅ Tags asignadas automáticamente a todas las tareas basándose en contenido' as resultado;
SELECT '💡 Las tareas ahora tienen tags apropiadas según proyecto, contenido y ubicación' as resultado; 