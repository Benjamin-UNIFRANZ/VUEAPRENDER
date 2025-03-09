/**
 * Utilidades para simular la ejecución de C# en JavaScript
 */

// Función para simular el comportamiento de una consola C#
export function createVirtualConsole(outputRef, simulateConsoleReadLine) {
  return {
    WriteLine: async (text) => {
      outputRef.value += String(text) + '\n';
      await new Promise(resolve => setTimeout(resolve, 10));
      return true;
    },
    Write: async (text) => {
      outputRef.value += String(text);
      await new Promise(resolve => setTimeout(resolve, 10));
      return true;
    },
    ReadLine: async (prompt = '') => {
      if (prompt) await this.Write(prompt);
      const input = await simulateConsoleReadLine('');
      return input;
    },
    ReadKey: async (prompt = '') => {
      if (prompt) await this.Write(prompt);
      const key = await simulateConsoleReadLine('Presione una tecla:', 'text', 'Presione una tecla');
      return { KeyChar: key.charAt(0) };
    },
    Clear: () => {
      outputRef.value = '';
      return true;
    }
  };
}

// Función para procesar un bloque específico de código C#
export async function processCodeBlock(codeBlock, variables, virtualConsole) {
  // Determinar qué tipo de bloque es
  if (codeBlock.trim().startsWith('if') || codeBlock.trim().startsWith('else')) {
    // Procesar bloque if/else
    return await processIfElseBlock(codeBlock, variables, virtualConsole);
  } else if (codeBlock.trim().startsWith('for')) {
    // Procesar bucle for
    return await processForLoop(codeBlock, variables, virtualConsole);
  } else if (codeBlock.trim().startsWith('while')) {
    // Procesar bucle while
    return await processWhileLoop(codeBlock, variables, virtualConsole);
  } else if (codeBlock.trim().startsWith('do')) {
    // Procesar bucle do-while
    return await processDoWhileLoop(codeBlock, variables, virtualConsole);
  } else {
    // Procesar declaración de variables o expresiones simples
    return await processSimpleStatement(codeBlock, variables, virtualConsole);
  }
}

// Identifica y procesa la asignación de variables
export function processVariableAssignment(statement, variables) {
  // Buscar patrones como: tipo variable = valor;
  const varAssignRegex = /(\w+)\s+(\w+)\s*=\s*([^;]+);/;
  const match = statement.match(varAssignRegex);
  
  if (match) {
    const [_, type, name, valueExpr] = match;
    
    // Evaluar la expresión de valor
    try {
      const value = evaluateExpression(valueExpr, variables);
      variables[name] = value;
      return true;
    } catch (error) {
      console.error(`Error al asignar variable ${name}: ${error.message}`);
      return false;
    }
  }
  
  // Buscar asignaciones simples sin tipo
  const simpleAssignRegex = /(\w+)\s*=\s*([^;]+);/;
  const simpleMatch = statement.match(simpleAssignRegex);
  
  if (simpleMatch) {
    const [_, name, valueExpr] = simpleMatch;
    
    // Evaluar la expresión de valor
    try {
      const value = evaluateExpression(valueExpr, variables);
      variables[name] = value;
      return true;
    } catch (error) {
      console.error(`Error al asignar variable ${name}: ${error.message}`);
      return false;
    }
  }
  
  return false;
}

// Función auxiliar para evaluar expresiones en el contexto de variables
export function evaluateExpression(expression, variables) {
  // Crear una función que evalúe la expresión con las variables disponibles
  const keys = Object.keys(variables);
  const values = Object.values(variables);
  
  try {
    const func = new Function(...keys, `return (${expression});`);
    return func(...values);
  } catch (error) {
    throw new Error(`Error al evaluar: ${expression} - ${error.message}`);
  }
}
