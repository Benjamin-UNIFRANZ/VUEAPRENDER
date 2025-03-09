/**
 * Intérprete completo de C# a JavaScript
 */

 import { csharpFunctions, convertCSharpOperators } from './utils.js';

 // Convierte interpolación de cadenas de C# a JavaScript
 export function convertStringInterpolation(csharpString) {
   // Si no es una cadena interpolada de C#, devuelve el string original
   if (!csharpString.startsWith('$"') && !csharpString.startsWith('$@"')) {
     return csharpString;
   }
 
   // Eliminar el prefijo $" o $@"
   let content = csharpString.replace(/^\$(@)?\"/, '');
   // Eliminar la comilla doble final
   content = content.substring(0, content.length - 1);
 
   // Convertir {expresion} de C# a ${expresion} de JS
   content = content.replace(/{([^}]*)}/g, '${$1}');
 
   // Devolver como template literal de JS
   return '`' + content + '`';
 }
 
 // Extrae variables y sus valores del código C#
 export function extractVariablesFromCode(csharpCode) {
   const variables = {};
   
   // Buscar declaraciones de variables (incluye más tipos)
   const varRegex = /(int|double|float|decimal|string|bool|char|long|short|byte|uint|ulong|ushort|sbyte)\s+(\w+)\s*=\s*([^;]+);/g;
   let match;
   
   while ((match = varRegex.exec(csharpCode)) !== null) {
     const type = match[1];
     const name = match[2];
     const value = match[3].trim();
     
     // Convertir valor según el tipo
     let jsValue;
     try {
       if (type === 'string') {
         // Si es una cadena, quitamos las comillas y la evaluamos
         if (value.startsWith('$"') || value.startsWith('$@"')) {
           const interpolated = convertStringInterpolation(value);
           jsValue = eval(interpolated); // Evaluar la interpolación
         } else {
           jsValue = value.replace(/^"(.*)"$/, '$1');
         }
       } else if (type === 'bool') {
         // Convertir bool de C# a booleano de JS
         jsValue = value.toLowerCase() === 'true';
       } else if (type === 'char') {
         // Convertir char de C# a string de JS
         jsValue = value.replace(/^'(.)'$/, '$1');
       } else {
         // Para números, evaluamos directamente
         jsValue = eval(value);
       }
       
       variables[name] = jsValue;
     } catch (e) {
       console.error(`Error converting variable ${name}: ${e.message}`);
     }
   }
   
   return variables;
 }
 
 // Evalúa una expresión C# dentro del contexto de variables dadas
 export function evaluateCSharpExpression(expression, variablesContext) {
   // Si es una interpolación de cadena, convertirla primero
   if (expression.startsWith('$"') || expression.startsWith('$@"')) {
     expression = convertStringInterpolation(expression);
   }
   
   // Convertir operadores C# a JS
   expression = convertCSharpOperators(expression);
   
   // Reemplazar llamadas a funciones C# con equivalentes JS
   Object.keys(csharpFunctions).forEach(csharpFunc => {
     if (expression.includes(csharpFunc)) {
       const regex = new RegExp(`${csharpFunc.replace(/\./g, '\\.')}\\s*\\(([^)]*)\\)`, 'g');
       expression = expression.replace(regex, (match, args) => {
         return `csharpFunctions["${csharpFunc}"](${args})`;
       });
     }
   });
   
   // Crear una función que evalúe la expresión con las variables del contexto
   const contextKeys = Object.keys(variablesContext);
   const contextValues = Object.values(variablesContext);
   
   try {
     // Añadir el contexto de funciones C#
     const evalFunction = new Function(...contextKeys, 'csharpFunctions', `return ${expression}`);
     return evalFunction(...contextValues, csharpFunctions);
   } catch (e) {
     throw new Error(`Error evaluando expresión C#: ${expression} - ${e.message}`);
   }
 }
 
 // Transforma código C# a JavaScript ejecutable
 export function transformCSharpToJS(csharpCode) {
   let jsCode = csharpCode;
   
   // Eliminar using directives
   jsCode = jsCode.replace(/using\s+[^;]+;/g, '');
   
   // Eliminar declaraciones de clase y método Main
   jsCode = jsCode.replace(/class\s+\w+\s*{/g, '');
   jsCode = jsCode.replace(/static\s+void\s+Main\s*\([^)]*\)\s*{/g, '');
   
   // Eliminar llaves finales sobrantes
   jsCode = jsCode.replace(/}\s*}$/g, '');
   
   // Transformar bucles y condicionales
   jsCode = transformLoopsAndConditionals(jsCode);
   
   // Transformar funciones y métodos
   jsCode = transformFunctionsAndMethods(jsCode);
   
   // Transformar operadores C# específicos
   jsCode = convertCSharpOperators(jsCode);
   
   return jsCode;
 }
 
 // Transforma bucles y condicionales de C# a JavaScript
 function transformLoopsAndConditionals(code) {
   let jsCode = code;
   
   // Transformar for
   jsCode = jsCode.replace(/for\s*\(([^;]+;\s*[^;]+;\s*[^)]+)\)\s*{/g, (match, condition) => {
     return `for (${condition}) {`;
   });
   
   // Transformar foreach - convertimos a for...of
   jsCode = jsCode.replace(/foreach\s*\(([^)]+)\s+(\w+)\s+in\s+([^)]+)\)\s*{/g, (match, type, variable, collection) => {
     return `for (let ${variable} of ${collection}) {`;
   });
   
   // Transformar while
   jsCode = jsCode.replace(/while\s*\(([^)]+)\)\s*{/g, (match, condition) => {
     const jsCondition = convertCSharpOperators(condition);
     return `while (${jsCondition}) {`;
   });
   
   // Transformar do-while
   jsCode = jsCode.replace(/do\s*{([^}]+)}\s*while\s*\(([^)]+)\)\s*;/g, (match, body, condition) => {
     const jsCondition = convertCSharpOperators(condition);
     return `do {${body}} while (${jsCondition});`;
   });
   
   // Transformar if-else if-else
   jsCode = jsCode.replace(/if\s*\(([^)]+)\)\s*{/g, (match, condition) => {
     const jsCondition = convertCSharpOperators(condition);
     return `if (${jsCondition}) {`;
   });
   
   jsCode = jsCode.replace(/}\s*else\s+if\s*\(([^)]+)\)\s*{/g, (match, condition) => {
     const jsCondition = convertCSharpOperators(condition);
     return `} else if (${jsCondition}) {`;
   });
   
   // No es necesario transformar else { ... } ya que es igual en ambos lenguajes
   
   return jsCode;
 }
 
 // Transforma funciones y métodos de C# a JavaScript
 function transformFunctionsAndMethods(code) {
   let jsCode = code;
   
   // Transformar declaraciones de métodos
   // static/public/private returnType MethodName(params) -> function MethodName(params)
   jsCode = jsCode.replace(/(static|public|private|protected|internal)\s+(\w+)\s+(\w+)\s*\(([^)]*)\)\s*{/g, 
     (match, modifier, returnType, methodName, parameters) => {
       return `function ${methodName}(${parameters}) {`;
     });
   
   // Manejar return statements (mantienen la misma sintaxis)
   
   // Transformar llamadas a métodos del sistema
   jsCode = transformSystemMethodCalls(jsCode);
   
   return jsCode;
 }
 
 // Transforma llamadas a métodos del sistema de C# a JavaScript
 function transformSystemMethodCalls(code) {
   let jsCode = code;
   
   // Console.WriteLine -> console.log
   jsCode = jsCode.replace(/Console\.WriteLine\(([^)]*)\);/g, (match, args) => {
     // Si el argumento es una interpolación de cadena, convertirla
     if (args.startsWith('$"') || args.startsWith('$@"')) {
       args = convertStringInterpolation(args);
     }
     return `console.log(${args});`;
   });
   
   // Console.ReadLine -> prompt
   jsCode = jsCode.replace(/Console\.ReadLine\(\);/g, 'prompt("Enter input:");');
   
   // Convertir funciones matemáticas
   jsCode = jsCode.replace(/Math\.(Pow|Sqrt|Abs|Floor|Ceiling|Round)\(([^)]+)\)/g, (match, func, args) => {
     return `Math.${func.toLowerCase()}(${args})`;
   });
   
   // Funciones de conversión
   jsCode = jsCode.replace(/int\.Parse\(([^)]+)\)/g, 'parseInt($1, 10)');
   jsCode = jsCode.replace(/double\.Parse\(([^)]+)\)/g, 'parseFloat($1)');
   jsCode = jsCode.replace(/Convert\.ToInt32\(([^)]+)\)/g, 'parseInt($1, 10)');
   jsCode = jsCode.replace(/Convert\.ToDouble\(([^)]+)\)/g, 'parseFloat($1)');
   jsCode = jsCode.replace(/Convert\.ToString\(([^)]+)\)/g, 'String($1)');
   
   return jsCode;
 }
 
 // Identifica el tipo de error en el código C#
 export function detectCSharpError(error, csharpCode) {
   // Errores comunes de sintaxis
   const syntaxErrors = {
     "missing semicolon": {
       regex: /;/,
       lineCheck: (line) => !line.trim().endsWith(';') && !line.trim().endsWith('{') && !line.trim().endsWith('}') && line.trim().length > 0,
       message: "Falta punto y coma (;) al final de la línea"
     },
     "unmatched brackets": {
       message: "Llaves, paréntesis o corchetes no balanceados"
     },
     "undefined variable": {
       regex: /is not defined|undefined/,
       message: "Variable o función no definida"
     },
     "type mismatch": {
       regex: /type|cannot convert|cannot implicitly convert/i,
       message: "Incompatibilidad de tipos"
     }
   };
   
   // Buscar línea de error si hay un número de línea en el mensaje
   const lineMatch = error.message.match(/line\s+(\d+)/i);
   let errorLine = null;
   
   if (lineMatch) {
     const lineNum = parseInt(lineMatch[1], 10);
     const lines = csharpCode.split('\n');
     if (lineNum <= lines.length) {
       errorLine = lines[lineNum - 1];
     }
   }
   
   // Analizar el mensaje de error
   for (const [errorType, errorInfo] of Object.entries(syntaxErrors)) {
     if (errorInfo.regex && error.message.match(errorInfo.regex)) {
       if (errorLine && errorInfo.lineCheck && errorInfo.lineCheck(errorLine)) {
         return {
           type: errorType,
           message: errorInfo.message,
           line: errorLine
         };
       } else if (!errorInfo.lineCheck) {
         return {
           type: errorType,
           message: errorInfo.message
         };
       }
     }
   }
   
   // Si no se identifica un error específico
   return {
     type: "unknown",
     message: "Error desconocido: " + error.message
   };
 }
 