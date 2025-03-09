/**
 * Utilidades para depurar problemas en la interpretación de código C#
 */

// Registrar información sobre la ejecución de código
export function logDebugInfo(message, data = null) {
  console.log(`[DEBUG] ${message}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
}

// Analizar y mostrar información sobre la estructura de un bucle for
export function analyzeForLoop(forStatement) {
  console.log('[DEBUG] Analizando bucle for:', forStatement);
  
  // Intentar extraer las partes del bucle for con diferentes patrones
  const patterns = [
    /for\s*\(\s*(.*?)\s*;\s*(.*?)\s*;\s*(.*?)\s*\)\s*{([\s\S]*?)}/s,
    /for\s*\(([\s\S]*?)\)\s*{([\s\S]*?)}/s,
    /for\s*\((.*?)\)/
  ];
  
  for (let i = 0; i < patterns.length; i++) {
    const match = forStatement.match(patterns[i]);
    console.log(`[DEBUG] Patrón ${i+1}:`, match ? 'Coincide' : 'No coincide');
    
    if (match) {
      console.log('[DEBUG] Grupos capturados:', match.slice(1));
      if (i === 0 || i === 1) {
        console.log('[DEBUG] Cuerpo del bucle:', match[match.length - 1]);
      }
      
      // Si es el segundo patrón, intentar dividir las partes del bucle for
      if (i === 1) {
        const forParts = match[1].split(';');
        console.log('[DEBUG] Partes del bucle for:', forParts);
      }
    }
  }
  
  // Revisar si hay un desbalance de llaves
  let braceCount = 0;
  for (let i = 0; i < forStatement.length; i++) {
    if (forStatement[i] === '{') braceCount++;
    if (forStatement[i] === '}') braceCount--;
  }
  console.log('[DEBUG] Balance de llaves:', braceCount);
}

// Verificar la estructura general del código
export function analyzeCodeStructure(code) {
  console.log('[DEBUG] Analizando estructura del código');
  
  // Contar declaraciones y bloques importantes
  const counts = {
    classes: (code.match(/class\s+\w+/g) || []).length,
    methods: (code.match(/static\s+\w+\s+\w+\s*\(/g) || []).length,
    forLoops: (code.match(/for\s*\(/g) || []).length,
    whileLoops: (code.match(/while\s*\(/g) || []).length,
    ifStatements: (code.match(/if\s*\(/g) || []).length,
    variables: (code.match(/\b(int|double|string|bool|var)\s+\w+\s*=/g) || []).length
  };
  
  console.log('[DEBUG] Elementos encontrados:', counts);
  
  // Verificar balance de llaves y paréntesis
  const balance = {
    braces: 0,
    parentheses: 0
  };
  
  let inString = false;
  let escapeNext = false;
  
  for (let i = 0; i < code.length; i++) {
    const char = code[i];
    
    if (escapeNext) {
      escapeNext = false;
      continue;
    }
    
    if (char === '\\' && inString) {
      escapeNext = true;
      continue;
    }
    
    if (char === '"' && !escapeNext) {
      inString = !inString;
      continue;
    }
    
    if (!inString) {
      if (char === '{') balance.braces++;
      else if (char === '}') balance.braces--;
      else if (char === '(') balance.parentheses++;
      else if (char === ')') balance.parentheses--;
    }
  }
  
  console.log('[DEBUG] Balance de símbolos:', balance);
  return {
    counts,
    balance,
    isBalanced: balance.braces === 0 && balance.parentheses === 0
  };
}
