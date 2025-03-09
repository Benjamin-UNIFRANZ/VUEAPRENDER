import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);



// Utilidad para verificar errores comunes de Supabase
export async function checkSupabaseError(error) {
  // Errores específicos para proyectos
  if (error.message?.includes('violates foreign key constraint')) {
    return 'El proyecto referencia datos que no existen'
  }
  
  if (error.message?.includes('duplicate key value violates unique constraint')) {
    return 'Ya existe un proyecto con ese nombre'
  }
  
  if (error.message?.includes('permission denied') || error.message?.includes('policy')) {
    // Verificar si el usuario está autenticado
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return 'Debes iniciar sesión para realizar esta operación'
    }
    return 'No tienes permisos para realizar esta operación. Asegúrate de ser el propietario del proyecto.'
  }
  
  if (error.code === '42501') {
    return 'Error de permisos: No tienes autorización para eliminar este proyecto'
  }
  
  // Devolver el mensaje original si no hay un error específico identificado
  return error.message || 'Error desconocido'
}

// Función simplificada para eliminar un proyecto por su ID
export async function deleteProject(projectId) {
  try {
    // Eliminar directamente el proyecto por su ID
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);
    
    if (error) {
      throw error;
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error al eliminar el proyecto:', error);
    return { 
      success: false, 
      error: error.message || 'Error al eliminar el proyecto'
    };
  }
}

// Función para guardar un proyecto (nuevo o actualización)
export async function saveProject(project) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Debes iniciar sesión para guardar proyectos');
    }
    
    // Verificar si tiene ID corto, si no, generarlo
    const projectData = {
      name: project.name,
      code: project.code,
      user_id: user.id
    };
    
    if (!project.short_id) {
      projectData.short_id = generateShortId();
    }
    
    // Si es una actualización
    if (project.id) {
      const { data, error } = await supabase
        .from('projects')
        .update(projectData)
        .eq('id', project.id)
        .select();
      
      if (error) throw error;
      return { success: true, project: data[0] };
    }
    // Si es un nuevo proyecto
    else {
      const { data, error } = await supabase
        .from('projects')
        .insert([projectData])
        .select();
      
      if (error) throw error;
      return { success: true, project: data[0] };
    }
  } catch (error) {
    console.error('Error al guardar proyecto:', error);
    return { 
      success: false, 
      error: await checkSupabaseError(error) 
    };
  }
}
