/**
 * Intérprete completo para código C# en JavaScript
 */

 import { convertStringInterpolation, detectCSharpError } from './csharpInterpreter';
 import { csharpFunctions } from './utils';
 
 /**
  * Interpreta y ejecuta código C# completo en un entorno JS
  */
 export async function executeFullCSharp(csharpCode, virtualConsole) {
   // Estado global del entorno de ejecución
   const state = {
     variables: {},    // Almacena todas las variables
     functions: {},    // Almacena todas las funciones definidas
     currentBlock: [], // Almacena el bloque actual en ejecución
     executionStack: [] // Pila de ejecución para manejar llamadas a funciones
   };
   
   try {
     // Preprocesar el código
     const processedCode = preprocessCode(csharpCode);
     
     // Extraer definiciones de funciones y métodos
     extractFunctions(processedCode, state);
     
     // Extraer el código del método Main
     const mainCode = extractMainMethod(processedCode);
     
     if (!mainCode) {
       await virtualConsole.WriteLine("[Error] No se encontró el método Main.");
       return false;
     }
     
     // Ejecutar el código del método Main
     return await executeBlock(mainCode, state, virtualConsole);
   } catch (error) {
     await virtualConsole.WriteLine(`[Error] ${error.message}`);
     return false;
   }
 }
 
 /**
  * Preprocesa el código eliminando directivas using y comentarios
  */
 function preprocessCode(code) {
   // Eliminar comentarios de una línea
   let processed = code.replace(/\/\/.*$/gm, '');
   
   // Eliminar comentarios de múltiples líneas
   processed = processed.replace(/\/\*[\s\S]*?\*\//g, '');
   
   // Eliminar directivas using
   processed = processed.replace(/using\s+[^;]+;/g, '');
   
   return processed;
 }
 
 /**
  * Extrae todas las definiciones de funciones y métodos
  */
 function extractFunctions(code, state) {
   // Patrón para encontrar métodos en C#
   const functionPattern = /(static|public|private|protected)?\s+(\w+)\s+(\w+)\s*\(([^)]*)\)\s*{([^{}]*(?:{[^{}]*}[^{}]*)*?)}/g;
   
   let match;
   while ((match = functionPattern.exec(code)) !== null) {
     const [fullMatch, modifier, returnType, functionName, params, body] = match;
     
     // Ignorar métodos de clase no estáticos (por ahora solo soportamos métodos estáticos)
     if (modifier && modifier !== 'static' && !functionName.includes('Main')) {
       continue;
     }
     
     // Almacenar la función
     state.functions[functionName] = {
       returnType,
       params: parseParameters(params),
       body: body.trim(),
       fullBody: fullMatch
     };
   }
 }
 
 /**
  * Parsea los parámetros de una función
  */
 function parseParameters(paramsString) {
   if (!paramsString.trim()) return [];
   
   const params = [];
   const paramList = paramsString.split(',');
   
   for (const param of paramList) {
     const parts = param.trim().split(' ');
     if (parts.length >= 2) {
       params.push({
         type: parts[0].trim(),
         name: parts[1].trim().replace(/^\w/, c => c.toLowerCase())
       });
     }
   }
   
   return params;
 }
 
 /**
  * Extrae el método Main del código
  */
 function extractMainMethod(code) {
   // Encuentra el método Main
   const mainPattern = /static\s+void\s+Main\s*\([^)]*\)\s*{([\s\S]*?)}/;
   const match = code.match(mainPattern);
   
   if (match && match[1]) {
     return match[1].trim();
   }
   
   // Si no encuentra un método Main tradicional, busca cualquier código ejecutable fuera de funciones
   // Esto es para manejar casos donde no hay un método Main explícito
   const classPattern = /class\s+\w+\s*{([\s\S]*?)}/;
   const classMatch = code.match(classPattern);
   
   if (classMatch && classMatch[1]) {
     const classBody = classMatch[1];
     // Filtrar el contenido de la clase para encontrar código no incluido en funciones
     const nonFunctionCode = classBody.replace(/(\w+)\s+(\w+)\s*\(([^)]*)\)\s*{[^{}]*(?:{[^{}]*}[^{}]*)*?}/g, '').trim();
     if (nonFunctionCode) {
       return nonFunctionCode;
     }
   }
   
   return null;
 }
 
 /**
  * Ejecuta un bloque de código
  */
 async function executeBlock(blockCode, state, virtualConsole) {
   // Dividir el bloque en declaraciones
   const statements = splitIntoStatements(blockCode);
   
   let result = null;
   
   for (const statement of statements) {
     try {
       // Saltar líneas vacías
       if (!statement.trim()) continue;
       
       // Procesar declaraciones específicas
       if (isVariableDeclaration(statement)) {
         processVariableDeclaration(statement, state);
       }
       else if (isConsoleOperation(statement)) {
         await processConsoleOperation(statement, state, virtualConsole);
       }
       else if (isControlFlowStatement(statement)) {
         result = await processControlFlow(statement, state, virtualConsole);
         
         // Manejar retorno de funciones
         if (result && result.returnValue !== undefined) {
           return result;
         }
       }
       else if (isMethodCall(statement)) {
         result = await processMethodCall(statement, state, virtualConsole);
       }
       else if (isVariableAssignment(statement)) {
         processVariableAssignment(statement, state);
       }
       else {
         // Intentar evaluar la expresión
         try {
           evalExpression(statement, state);
         } catch (error) {
           await virtualConsole.WriteLine(`[Error evaluando: ${statement.trim()} - ${error.message}]`);
         }
       }
     } catch (error) {
       await virtualConsole.WriteLine(`[Error en instrucción: ${statement.trim()} - ${error.message}]`);
     }
   }
   
   return result;
 }
 
 /**
  * Divide el código en declaraciones individuales
  */
 function splitIntoStatements(code) {
   const statements = [];
   let currentStatement = '';
   let braceCount = 0;
   let parenCount = 0;
   let inString = false;
   let escapeNext = false;
   let inLineComment = false;
   let inBlockComment = false;
   
   for (let i = 0; i < code.length; i++) {
     const char = code[i];
     const nextChar = i + 1 < code.length ? code[i + 1] : '';
     
     // Manejar comentarios
     if (!inString && !inLineComment && !inBlockComment && char === '/' && nextChar === '/') {
       inLineComment = true;
       currentStatement += char;
       continue;
     }
     
     if (inLineComment && (char === '\n' || i === code.length - 1)) {
       inLineComment = false;
       currentStatement += char;
       continue;
     }
     
     if (!inString && !inLineComment && !inBlockComment && char === '/' && nextChar === '*') {
       inBlockComment = true;
       currentStatement += char;
       continue;
     }
     
     if (inBlockComment && char === '*' && nextChar === '/') {
       inBlockComment = false;
       currentStatement += char;
       i++; // Saltar el próximo carácter (/)
       currentStatement += '/';
       continue;
     }
     
     if (inLineComment || inBlockComment) {
       currentStatement += char;
       continue;
     }
     
     // Manejar escape de caracteres en strings
     if (escapeNext) {
       escapeNext = false;
       currentStatement += char;
       continue;
     }
     
     if (char === '\\' && inString) {
       escapeNext = true;
       currentStatement += char;
       continue;
     }
     
     // Manejar strings
     if (char === '"' && !escapeNext) {
       inString = !inString;
       currentStatement += char;
       continue;
     }
     
     // Contar paréntesis y llaves
     if (!inString) {
       if (char === '{') braceCount++;
       else if (char === '}') braceCount--;
       else if (char === '(') parenCount++;
       else if (char === ')') parenCount--;
     }
     
     currentStatement += char;
     
     // Si estamos al nivel de base (no dentro de llaves ni paréntesis) y encontramos un punto y coma
     if (braceCount === 0 && parenCount === 0 && char === ';' && !inString) {
       statements.push(currentStatement.trim());
       currentStatement = '';
       continue;
     }
     
     // Manejar bloques completos como if, for, etc.
     if (braceCount === 0 && char === '}' && !inString && currentStatement.trim()) {
       statements.push(currentStatement.trim());
       currentStatement = '';
     }
   }
   
   // Añadir la última declaración si existe
   if (currentStatement.trim()) {
     statements.push(currentStatement.trim());
   }
   
   return statements;
 }
 
 /**
  * Verifica si una declaración es una declaración de variable
  */
 function isVariableDeclaration(statement) {
   const varTypes = ['int', 'double', 'string', 'bool', 'char', 'var', 'float', 'decimal', 'long'];
   const regex = new RegExp(`^(${varTypes.join('|')})\\s+\\w+\\s*(=.*)?;$`);
   
   return regex.test(statement.trim());
 }
 
 /**
  * Procesa una declaración de variable
  */
 function processVariableDeclaration(statement, state) {
   const varRegex = /(\w+)\s+(\w+)\s*(?:=\s*([^;]+))?\s*;/;
   const match = statement.match(varRegex);
   
   if (match) {
     const [_, type, name, valueExpr] = match;
     
     // Si hay una expresión de valor, evaluarla
     if (valueExpr) {
       try {
         const value = evalExpression(valueExpr, state);
         state.variables[name] = value;
       } catch (error) {
         throw new Error(`Error al inicializar variable ${name}: ${error.message}`);
       }
     } else {
       // Inicializar con valor predeterminado según el tipo
       switch (type) {
         case 'int':
         case 'double':
         case 'float':
         case 'decimal':
         case 'long':
           state.variables[name] = 0;
           break;
         case 'string':
           state.variables[name] = '';
           break;
         case 'bool':
           state.variables[name] = false;
           break;
         default:
           state.variables[name] = null;
       }
     }
   }
 }
 
 /**
  * Verifica si una declaración es una operación de consola
  */
 function isConsoleOperation(statement) {
   return statement.includes('Console.') && 
          (statement.includes('WriteLine') || 
           statement.includes('ReadLine') || 
           statement.includes('Write'));
 }
 
 /**
  * Procesa una operación de consola
  */
 async function processConsoleOperation(statement, state, virtualConsole) {
   // Comprobar si es Console.WriteLine
   if (statement.includes('Console.WriteLine')) {
     const contentMatch = statement.match(/Console\.WriteLine\s*\(\s*(.*?)\s*\)\s*;/);
     if (contentMatch) {
       const content = contentMatch[1].trim();
       await processConsoleWriteLine(content, state, virtualConsole);
     }
   }
   // Comprobar si es Console.Write
   else if (statement.includes('Console.Write') && !statement.includes('WriteLine')) {
     const contentMatch = statement.match(/Console\.Write\s*\(\s*(.*?)\s*\)\s*;/);
     if (contentMatch) {
       const content = contentMatch[1].trim();
       await processConsoleWrite(content, state, virtualConsole);
     }
   }
   // Comprobar si es una asignación de Console.ReadLine
   else if (statement.includes('Console.ReadLine')) {
     const assignmentMatch = statement.match(/(\w+)\s*=\s*Console\.ReadLine\s*\(\s*\)\s*;/);
     if (assignmentMatch) {
       const variableName = assignmentMatch[1];
       const input = await virtualConsole.ReadLine();
       state.variables[variableName] = input;
     }
   }
 }
 
 /**
  * Procesa una llamada a Console.WriteLine
  */
 async function processConsoleWriteLine(content, state, virtualConsole) {
   if (!content) {
     await virtualConsole.WriteLine('');
     return;
   }
   
   if (content.startsWith('"') && content.endsWith('"') && content.length >= 2) {
     // String literal simple
     await virtualConsole.WriteLine(content.slice(1, -1));
   } 
   else if (content.startsWith('$"') || content.startsWith('$@"')) {
     // Interpolación de cadenas
     try {
       const jsTemplate = convertStringInterpolation(content);
       const result = evalExpression(jsTemplate, state);
       await virtualConsole.WriteLine(result);
     } catch (error) {
       throw new Error(`Error en interpolación: ${error.message}`);
     }
   } 
   else {
     // Expresión o variable
     try {
       const result = evalExpression(content, state);
       await virtualConsole.WriteLine(result);
     } catch (error) {
       throw new Error(`Error evaluando expresión: ${error.message}`);
     }
   }
 }
 
 /**
  * Procesa una llamada a Console.Write
  */
 async function processConsoleWrite(content, state, virtualConsole) {
   if (!content) {
     await virtualConsole.Write('');
     return;
   }
   
   if (content.startsWith('"') && content.endsWith('"') && content.length >= 2) {
     // String literal simple
     await virtualConsole.Write(content.slice(1, -1));
   } 
   else if (content.startsWith('$"') || content.startsWith('$@"')) {
     // Interpolación de cadenas
     try {
       const jsTemplate = convertStringInterpolation(content);
       const result = evalExpression(jsTemplate, state);
       await virtualConsole.Write(result);
     } catch (error) {
       throw new Error(`Error en interpolación: ${error.message}`);
     }
   } 
   else {
     // Expresión o variable
     try {
       const result = evalExpression(content, state);
       await virtualConsole.Write(result);
     } catch (error) {
       throw new Error(`Error evaluando expresión: ${error.message}`);
     }
   }
 }
 
 /**
  * Evalúa una expresión en el contexto actual
  */
 function evalExpression(expression, state) {
   // Crear contexto con las variables disponibles
   const varContext = { ...state.variables };
   
   // Convertir funciones C#
   for (const funcName in csharpFunctions) {
     varContext[funcName.replace('.', '_')] = csharpFunctions[funcName];
   }
   
   // Reemplazar llamadas a funciones C#
   let processedExpr = expression;
   
   // Convertir int.Parse, double.Parse, etc.
   processedExpr = processedExpr.replace(/(\w+)\.Parse\(\s*(.*?)\s*\)/g, (match, type, arg) => {
     const funcName = `${type}_Parse`;
     return `${funcName}(${arg})`;
   });
   
   // Manejar interpolación de cadenas si la expresión es un template literal
   if (processedExpr.startsWith('`') && processedExpr.endsWith('`')) {
     // Para una interpolación, evaluamos en el contexto actual
     const keys = Object.keys(varContext);
     const values = Object.values(varContext);
     
     // Crear una función para evaluar la expresión con el contexto adecuado
     try {
       const func = new Function(...keys, `return ${processedExpr}`);
       return func(...values);
     } catch (error) {
       throw new Error(`Error evaluando interpolación: ${error.message}`);
     }
   }
   
   // Evaluar expresiones normales
   try {
     // Reemplazar llamadas a funciones definidas por el usuario
     for (const funcName in state.functions) {
       if (processedExpr.includes(`${funcName}(`)) {
         throw new Error(`Las llamadas a función directas en expresiones aún no están soportadas: ${funcName}`);
       }
     }
     
     // Crear una función para evaluar la expresión
     const keys = Object.keys(varContext);
     const values = Object.values(varContext);
     
     const func = new Function(...keys, `return ${processedExpr}`);
     return func(...values);
   } catch (error) {
     throw new Error(`Error evaluando expresión '${expression}': ${error.message}`);
   }
 }
 
 /**
  * Verifica si una declaración es un statement de control de flujo
  */
 function isControlFlowStatement(statement) {
   const controlKeywords = ['if', 'else', 'for', 'while', 'foreach', 'do', 'switch', 'return'];
   for (const keyword of controlKeywords) {
     if (statement.trim().startsWith(keyword + ' ') || statement.trim() === keyword) {
       return true;
     }
   }
   return false;
 }
 
 /**
  * Procesa un statement de control de flujo
  */
 async function processControlFlow(statement, state, virtualConsole) {
   if (statement.trim().startsWith('if ')) {
     return await processIfStatement(statement, state, virtualConsole);
   }
   else if (statement.trim().startsWith('for ')) {
     return await processForLoop(statement, state, virtualConsole);
   }
   else if (statement.trim().startsWith('while ')) {
     return await processWhileLoop(statement, state, virtualConsole);
   }
   else if (statement.trim().startsWith('do ')) {
     return await processDoWhileLoop(statement, state, virtualConsole);
   }
   else if (statement.trim().startsWith('return ')) {
     return processReturnStatement(statement, state);
   }
   else {
     throw new Error(`Control de flujo no soportado: ${statement.substring(0, 20)}...`);
   }
 }
 
 /**
  * Procesa un statement if-else
  */
 async function processIfStatement(statement, state, virtualConsole) {
   // Extraer la condición y el bloque de código
   const conditionMatch = statement.match(/if\s*\(\s*(.*?)\s*\)\s*{([\s\S]*?)}/);
   
   if (!conditionMatch) {
     throw new Error('Formato inválido de declaración if');
   }
   
   const [_, conditionExpr, ifBlockCode] = conditionMatch;
   
   // Evaluar la condición
   try {
     const conditionResult = evalExpression(conditionExpr, state);
     
     if (conditionResult) {
       // Ejecutar el bloque if
       return await executeBlock(ifBlockCode, state, virtualConsole);
     } else {
       // Buscar un bloque else si existe
       const elseMatch = statement.match(/}\s*else\s*{([\s\S]*?)}/);
       
       if (elseMatch) {
         const elseBlockCode = elseMatch[1];
         return await executeBlock(elseBlockCode, state, virtualConsole);
       }
     }
   } catch (error) {
     throw new Error(`Error en condición if: ${error.message}`);
   }
   
   return null;
 }
 
 /**
  * Procesa un bucle for
  */
 async function processForLoop(statement, state, virtualConsole) {
   try {
     // Mejorar la expresión regular para ser más flexible con los formatos de bucles for
     const forRegex = /for\s*\(\s*(.*?)\s*;\s*(.*?)\s*;\s*(.*?)\s*\)\s*{([\s\S]*?)}/s;
     const forMatch = statement.match(forRegex);
     
     if (!forMatch) {
       // Intentar con una expresión más permisiva para bucles con formato diferente
       const alternativeRegex = /for\s*\(([\s\S]*?)\)\s*{([\s\S]*?)}/s;
       const altMatch = statement.match(alternativeRegex);
       
       if (!altMatch) {
         await virtualConsole.WriteLine(`[Error: Formato de bucle for no reconocido: ${statement.substring(0, 40)}...]`);
         return null;
       }
       
       // Intentar separar manualmente las partes del bucle for
       const forParts = altMatch[1].split(';');
       if (forParts.length !== 3) {
         await virtualConsole.WriteLine(`[Error: El bucle for debe tener 3 partes separadas por punto y coma]`);
         return null;
       }
       
       const initialization = forParts[0].trim();
       const condition = forParts[1].trim();
       const increment = forParts[2].trim();
       const blockCode = altMatch[2];
       
       return await executeForLoop(initialization, condition, increment, blockCode, state, virtualConsole);
     }
     
     // Si la expresión regular original funciona, usar esos valores
     const [_, initialization, condition, increment, blockCode] = forMatch;
     return await executeForLoop(initialization, condition, increment, blockCode, state, virtualConsole);
   } catch (error) {
     await virtualConsole.WriteLine(`[Error procesando bucle for: ${error.message}]`);
     return null;
   }
 }
 
 /**
  * Ejecuta un bucle for con las partes ya extraídas
  */
 async function executeForLoop(initialization, condition, increment, blockCode, state, virtualConsole) {
   try {
     // Crear un nuevo ámbito para las variables locales del bucle for
     const loopState = {
       ...state,
       variables: { ...state.variables }
     };
     
     // Procesar la inicialización
     if (initialization) {
       // Si es una declaración de variable (por ejemplo "int i = 1")
       if (initialization.includes(' ')) {
         const parts = initialization.split('=').map(part => part.trim());
         const varDecl = parts[0].split(' ');
         
         if (varDecl.length >= 2) {
           const varType = varDecl[0].trim();
           const varName = varDecl[1].trim();
           const initialValue = parts.length > 1 ? evalExpressionSafe(parts[1], loopState) : 0;
           
           loopState.variables[varName] = initialValue;
         }
       } else {
         // Es una asignación simple (por ejemplo "i=1")
         const assignParts = initialization.split('=').map(part => part.trim());
         if (assignParts.length == 2) {
           const varName = assignParts[0];
           const value = evalExpressionSafe(assignParts[1], loopState);
           loopState.variables[varName] = value;
         }
       }
     }
     
     // Ejecutar el bucle
     while (true) {
       try {
         // Evaluar la condición
         if (!condition || !evalExpressionSafe(condition, loopState)) {
           break;
         }
         
         // Ejecutar el bloque
         const blockResult = await executeBlock(blockCode, loopState, virtualConsole);
         
         // Si hay un return, interrumpir el bucle
         if (blockResult && blockResult.returnValue !== undefined) {
           // Copiar variables modificadas al scope original
           for (const key in loopState.variables) {
             if (key in state.variables || !(key in loopState.variables)) {
               state.variables[key] = loopState.variables[key];
             }
           }
           return blockResult;
         }
         
         // Ejecutar el incremento
         if (increment) {
           evalExpressionSafe(increment, loopState);
         }
       } catch (loopError) {
         await virtualConsole.WriteLine(`[Error en iteración del bucle: ${loopError.message}]`);
         break;
       }
     }
     
     // Copiar variables modificadas al scope original
     for (const key in loopState.variables) {
       if (key in state.variables || !(key in loopState.variables)) {
         state.variables[key] = loopState.variables[key];
       }
     }
     
     return null;
   } catch (error) {
     throw new Error(`Error ejecutando bucle for: ${error.message}`);
   }
 }
 
 /**
  * Versión segura de evalExpression que captura errores
  */
 function evalExpressionSafe(expression, state) {
   try {
     return evalExpression(expression, state);
   } catch (error) {
     console.error(`Error evaluando expresión "${expression}": ${error.message}`);
     return false; // Valor por defecto seguro para condiciones
   }
 }
 
 /**
  * Procesa un bucle while
  */
 async function processWhileLoop(statement, state, virtualConsole) {
   // Extraer la condición y el bloque de código
   const whileMatch = statement.match(/while\s*\(\s*(.*?)\s*\)\s*{([\s\S]*?)}/);
   
   if (!whileMatch) {
     throw new Error('Formato inválido de bucle while');
   }
   
   const [_, condition, blockCode] = whileMatch;
   
   // Ejecutar el bucle
   try {
     while (evalExpression(condition, state)) {
       const blockResult = await executeBlock(blockCode, state, virtualConsole);
       
       // Si hay un return, interrumpir el bucle
       if (blockResult && blockResult.returnValue !== undefined) {
         return blockResult;
       }
     }
   } catch (error) {
     throw new Error(`Error en bucle while: ${error.message}`);
   }
   
   return null;
 }
 
 /**
  * Procesa un bucle do-while
  */
 async function processDoWhileLoop(statement, state, virtualConsole) {
   // Extraer el bloque de código y la condición
   const doWhileMatch = statement.match(/do\s*{([\s\S]*?)}\s*while\s*\(\s*(.*?)\s*\);?/);
   
   if (!doWhileMatch) {
     throw new Error('Formato inválido de bucle do-while');
   }
   
   const [_, blockCode, condition] = doWhileMatch;
   
   // Ejecutar el bucle
   try {
     do {
       const blockResult = await executeBlock(blockCode, state, virtualConsole);
       
       // Si hay un return, interrumpir el bucle
       if (blockResult && blockResult.returnValue !== undefined) {
         return blockResult;
       }
     } while (evalExpression(condition, state));
   } catch (error) {
     throw new Error(`Error en bucle do-while: ${error.message}`);
   }
   
   return null;
 }
 
 /**
  * Procesa un statement return
  */
 function processReturnStatement(statement, state) {
   // Extraer la expresión de retorno
   const returnMatch = statement.match(/return\s+(.*?);/);
   
   if (!returnMatch) {
     // Return vacío
     return { returnValue: undefined };
   }
   
   const returnExpr = returnMatch[1];
   
   try {
     const returnValue = evalExpression(returnExpr, state);
     return { returnValue };
   } catch (error) {
     throw new Error(`Error en statement return: ${error.message}`);
   }
 }
 
 /**
  * Verifica si una declaración es una llamada a método
  */
 function isMethodCall(statement) {
   // Buscar una llamada a método que no sea Console
   for (const funcName in csharpFunctions) {
     if (statement.includes(funcName) && statement.includes('(') && statement.includes(')')) {
       return true;
     }
   }
   
   // Buscar una llamada a función definida por el usuario
   for (const funcName in state.functions) {
     if (statement.includes(funcName + '(')) {
       return true;
     }
   }
   
   return false;
 }
 
 /**
  * Procesa una llamada a método
  */
 async function processMethodCall(statement, state, virtualConsole) {
   // Encontrar el nombre del método y los argumentos
   const methodMatch = statement.match(/(\w+)\s*\((.*?)\)\s*;/);
   
   if (!methodMatch) return null;
   
   const [_, methodName, argsString] = methodMatch;
   
   // Verificar si es un método definido por el usuario
   if (state.functions[methodName]) {
     const func = state.functions[methodName];
     
     // Evaluar argumentos
     const argValues = [];
     
     if (argsString.trim()) {
       const argExpressions = argsString.split(',').map(arg => arg.trim());
       
       for (const argExpr of argExpressions) {
         try {
           const argValue = evalExpression(argExpr, state);
           argValues.push(argValue);
         } catch (error) {
           throw new Error(`Error evaluando argumento ${argExpr}: ${error.message}`);
         }
       }
     }
     
     // Crear un nuevo entorno para la función
     const functionState = {
       ...state,
       variables: { ...state.variables }
     };
     
     // Asignar valores a los parámetros
     for (let i = 0; i < func.params.length && i < argValues.length; i++) {
       functionState.variables[func.params[i].name] = argValues[i];
     }
     
     // Ejecutar el cuerpo de la función
     const result = await executeBlock(func.body, functionState, virtualConsole);
     
     // Devolver el valor de retorno si existe
     return result;
   }
   
   return null;
 }
 
 /**
  * Verifica si una declaración es una asignación de variable
  */
 function isVariableAssignment(statement) {
   const assignRegex = /^\s*(\w+)\s*=\s*([^;]+);$/;
   return assignRegex.test(statement);
 }
 
 /**
  * Procesa una asignación de variable
  */
 function processVariableAssignment(statement, state) {
   const assignMatch = statement.match(/^\s*(\w+)\s*=\s*([^;]+);$/);
   
   if (!assignMatch) return;
   
   const [_, varName, valueExpr] = assignMatch;
   
   if (!(varName in state.variables)) {
     // Si la variable no existe, la declaramos implícitamente (var)
     state.variables[varName] = null;
   }
   
   try {
     const value = evalExpression(valueExpr, state);
     state.variables[varName] = value;
   } catch (error) {
     throw new Error(`Error al asignar variable ${varName}: ${error.message}`);
   }
 }
 