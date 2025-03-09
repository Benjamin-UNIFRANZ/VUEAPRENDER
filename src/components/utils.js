/**
 * Utilidades para manejar funcionalidades específicas de C#
 */

// Mapeo extendido de funciones de C# a JavaScript
export const csharpFunctions = {
  // Parse de tipos
  'int.Parse': (s) => parseInt(s, 10),
  'double.Parse': (s) => parseFloat(s),
  'float.Parse': (s) => parseFloat(s),
  'decimal.Parse': (s) => parseFloat(s),
  'bool.Parse': (s) => s.toLowerCase() === 'true',
  'char.Parse': (s) => s.charAt(0),
  
  // Conversiones
  'Convert.ToInt32': (s) => parseInt(s, 10),
  'Convert.ToDouble': (s) => parseFloat(s),
  'Convert.ToSingle': (s) => parseFloat(s),
  'Convert.ToDecimal': (s) => parseFloat(s),
  'Convert.ToString': (s) => String(s),
  'Convert.ToBoolean': (s) => Boolean(s),
  'Convert.ToChar': (s) => String(s).charAt(0),
  
  // Matemáticas
  'Math.Pow': (x, y) => Math.pow(x, y),
  'Math.Sqrt': (x) => Math.sqrt(x),
  'Math.Abs': (x) => Math.abs(x),
  'Math.Floor': (x) => Math.floor(x),
  'Math.Ceiling': (x) => Math.ceil(x),
  'Math.Round': (x, digits = 0) => {
    const factor = Math.pow(10, digits);
    return Math.round(x * factor) / factor;
  },
  'Math.Min': Math.min,
  'Math.Max': Math.max,
  'Math.Sign': Math.sign,
  'Math.Truncate': (x) => Math.trunc(x),
  
  // Strings
  'String.IsNullOrEmpty': (s) => !s || s.length === 0,
  'String.IsNullOrWhiteSpace': (s) => !s || /^\s*$/.test(s),
  'String.Join': (separator, values) => values.join(separator),
  'String.Format': (format, ...args) => {
    return format.replace(/{(\d+)}/g, (match, number) => {
      return typeof args[number] !== 'undefined' ? args[number] : match;
    });
  },
  
  // Arrays
  'Array.IndexOf': (array, item) => array.indexOf(item),
  'Array.LastIndexOf': (array, item) => array.lastIndexOf(item),
  'Array.Find': (array, predicate) => array.find(predicate),
  'Array.FindIndex': (array, predicate) => array.findIndex(predicate),
  'Array.Copy': (sourceArray, destinationArray, length) => {
    for (let i = 0; i < length; i++) {
      destinationArray[i] = sourceArray[i];
    }
  },
  
  // Console
  'Console.WriteLine': (text) => console.log(text),
  'Console.Write': (text) => process.stdout.write(text),
  'Console.ReadLine': () => prompt("Enter input:"),
  'Console.ReadKey': () => ({KeyChar: prompt("Press a key:").charAt(0)}),
  
  // DateTime
  'DateTime.Now': () => new Date(),
  'DateTime.Today': () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  },
  'DateTime.Parse': (s) => new Date(s),
};

// Detecta y convierte operadores de C# que son diferentes en JavaScript
export function convertCSharpOperators(expression) {
  if (!expression) return expression;
  
  let result = expression;
  
  // Operadores de igualdad
  result = result.replace(/(\w+|\))\s+!=\s+(\w+|\()/g, '$1 !== $2');
  result = result.replace(/(\w+|\))\s+==\s+(\w+|\()/g, '$1 === $2');
  
  // Operadores lógicos
  result = result.replace(/(\W|^)&&(\W|$)/g, '$1&&$2');
  result = result.replace(/(\W|^)\|\|(\W|$)/g, '$1||$2');
  result = result.replace(/(\W|^)!(\W|$)/g, '$1!$2');
  
  // Operadores de null
  // Simulamos el operador ?? (null-coalescing) de C#
  result = result.replace(/(\w+)\s*\?\?\s*(\w+)/g, '($1 !== null && $1 !== undefined) ? $1 : $2');
  
  // Operadores de incremento/decremento (igual en ambos lenguajes)
  // result = result.replace(/(\w+)\+\+/g, '$1++');
  // result = result.replace(/(\w+)--/g, '$1--');
  
  // Operadores de asignación compuesta
  result = result.replace(/(\w+)\s*\+=\s*(\w+|\d+)/g, '$1 += $2');
  result = result.replace(/(\w+)\s*-=\s*(\w+|\d+)/g, '$1 -= $2');
  result = result.replace(/(\w+)\s*\*=\s*(\w+|\d+)/g, '$1 *= $2');
  result = result.replace(/(\w+)\s*\/=\s*(\w+|\d+)/g, '$1 /= $2');
  result = result.replace(/(\w+)\s*%=\\s*(\w+|\d+)/g, '$1 %= $2');
  
  // Operadores de bits (igual en ambos lenguajes)
  
  return result;
}

// Detecta el tipo de error en código C#
export function analyzeError(error, code) {
  const errorTypes = {
    SYNTAX: 'Error de sintaxis',
    TYPE_MISMATCH: 'Error de tipo',
    UNDEFINED_VARIABLE: 'Variable no definida',
    METHOD_NOT_FOUND: 'Método no encontrado',
    MISSING_SEMICOLON: 'Falta punto y coma',
    BRACKET_MISMATCH: 'Desequilibrio de llaves/paréntesis',
    CONVERSION_ERROR: 'Error de conversión',
    UNSUPPORTED_FEATURE: 'Característica no soportada',
    GENERAL: 'Error general'
  };
  
  // Analizar mensaje de error
  let errorType = errorTypes.GENERAL;
  let errorMessage = error.message;
  
  if (error.message.includes('SyntaxError')) {
    errorType = errorTypes.SYNTAX;
    
    if (error.message.includes('Unexpected token')) {
      const token = error.message.match(/Unexpected token (.+)/)[1];
      errorMessage = `Error de sintaxis: token inesperado '${token}'`;
    } else if (error.message.includes('missing')) {
      errorType = errorTypes.MISSING_SEMICOLON;
      errorMessage = 'Posible punto y coma faltante (;)';
    }
  } else if (error.message.includes('is not defined')) {
    errorType = errorTypes.UNDEFINED_VARIABLE;
    const varName = error.message.match(/(\w+) is not defined/)[1];
    errorMessage = `La variable o método '${varName}' no está definido`;
  } else if (error.message.includes('Cannot read property')) {
    errorType = errorTypes.METHOD_NOT_FOUND;
    errorMessage = 'Intento de acceder a propiedad de un objeto null o undefined';
  } else if (error.message.includes('type')) {
    errorType = errorTypes.TYPE_MISMATCH;
    errorMessage = 'Error de tipo: operación no válida entre estos tipos';
  }
  
  // Buscar la línea del error
  let lineNumber = null;
  
  if (error.stack) {
    const lineMatch = error.stack.match(/line (\d+)/);
    if (lineMatch) lineNumber = parseInt(lineMatch[1], 10);
  }
  
  // Buscar paréntesis/llaves no balanceados
  if (errorType === errorTypes.SYNTAX && lineNumber === null) {
    const brackets = { '{': 0, '}': 0, '(': 0, ')': 0, '[': 0, ']': 0 };
    for (let i = 0; i < code.length; i++) {
      if (brackets.hasOwnProperty(code[i])) {
        brackets[code[i]]++;
      }
    }
    
    if (brackets['{'] !== brackets['}'] || brackets['('] !== brackets[')'] || brackets['['] !== brackets[']']) {
      errorType = errorTypes.BRACKET_MISMATCH;
      errorMessage = 'Desequilibrio de llaves, paréntesis o corchetes';
    }
  }
  
  return {
    type: errorType,
    message: errorMessage,
    lineNumber
  };
}

// Ejecuta código C# convertido a JS en un entorno seguro
export function executeCSharpCode(jsCode, virtualConsole) {
  try {
    // Crear un contexto seguro para la ejecución
    const sandbox = {
      console: virtualConsole,
      Math: Math,
      parseInt: parseInt,
      parseFloat: parseFloat,
      String: String,
      Number: Number,
      Boolean: Boolean,
      Date: Date,
      Array: Array,
      Object: Object,
      csharpFunctions: csharpFunctions,
      // Añadir funciones del virtualConsole directamente
      WriteLine: virtualConsole.WriteLine,
      ReadLine: virtualConsole.ReadLine,
      ReadNumber: virtualConsole.ReadNumber
    };
    
    // Crear una función para ejecutar el código con el sandbox como this
    const executor = new Function('sandbox', `
      with(sandbox) {
        ${jsCode}
      }
    `);
    
    // Ejecutar el código
    executor(sandbox);
    
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error,
      errorDetails: analyzeError(error, jsCode)
    };
  }
}
