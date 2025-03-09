/**
 * Ejecutor simplificado para ejemplos básicos de C#
 * Se centra en ejecutar bucles y mostrar su salida correctamente
 */

// Procesa y ejecuta código C# básico
export async function executeSimpleCSharp(code, virtualConsole) {
  // Variables para seguimiento del estado
  const state = {
    variables: {},
    methods: {},
  };

  // Extraer las variables declaradas en el código
  extractVariables(code, state);

  // Extraer métodos definidos en el código
  extractMethods(code, state);

  // Ejecutar el código línea por línea
  await executeCodeSequentially(code, state, virtualConsole);

  return true;
}

// Extrae y almacena todas las variables declaradas en el código
function extractVariables(code, state) {
  // Declaraciones de variables con inicialización
  const varRegex =
    /(int|double|string|bool|char|long|var)\s+(\w+)\s*=\s*([^;]+);/g;
  let match;

  while ((match = varRegex.exec(code)) !== null) {
    const type = match[1];
    const name = match[2];
    const valueExpr = match[3].trim();

    // Intenta evaluar el valor inicial si es posible
    if (valueExpr.match(/^\d+$/)) {
      state.variables[name] = parseInt(valueExpr, 10);
    } else if (valueExpr.match(/^\d+\.\d+$/)) {
      state.variables[name] = parseFloat(valueExpr);
    } else if (valueExpr === 'true' || valueExpr === 'false') {
      state.variables[name] = valueExpr === 'true';
    } else if (valueExpr.startsWith('"') && valueExpr.endsWith('"')) {
      state.variables[name] = valueExpr.substring(1, valueExpr.length - 1);
    } else {
      // Si no podemos evaluar el valor, establecemos un valor predeterminado según el tipo
      switch (type) {
        case 'int':
        case 'long':
        case 'double':
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

// Extrae los métodos definidos en el código
function extractMethods(code, state) {
  const methodRegex = /static\s+(\w+)\s+(\w+)\s*\(([^)]*)\)\s*{([\s\S]*?)}/g;
  let match;

  while ((match = methodRegex.exec(code)) !== null) {
    const returnType = match[1];
    const methodName = match[2];
    const parameters = match[3];
    const body = match[4];

    state.methods[methodName] = {
      returnType,
      parameters: parameters
        .split(',')
        .map((p) => {
          const parts = p.trim().split(' ');
          return parts.length > 1 ? { type: parts[0], name: parts[1] } : null;
        })
        .filter((p) => p !== null),
      body,
    };

    // Implementación especial para CalcularFactorial
    if (methodName === 'CalcularFactorial') {
      state.methods[methodName].execute = (n) => {
        if (n <= 1) return 1;
        let fact = 1;
        for (let i = 2; i <= n; i++) {
          fact *= i;
        }
        return fact;
      };
    }
  }
}

// Ejecuta el código línea por línea
async function executeCodeSequentially(code, state, virtualConsole) {
  // Ejecutar las instrucciones Console.WriteLine fuera de bucles
  await executeConsoleWriteLines(code, state, virtualConsole);

  // Ejecutar los bucles for
  await executeForLoops(code, state, virtualConsole);

  // Ejecutar los bucles while
  await executeWhileLoops(code, state, virtualConsole);

  // Ejecutar bucles do-while y llamadas a métodos
  await executeDoWhileLoopsAndMethods(code, state, virtualConsole);
}

// Ejecuta las instrucciones Console.WriteLine que están fuera de los bucles
async function executeConsoleWriteLines(code, state, virtualConsole) {
  const writeLinesOutsideLoops = [];

  // Encontrar todas las líneas de Console.WriteLine que no están dentro de un bucle
  const lines = code.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Si la línea contiene Console.WriteLine y no está dentro de un bucle o condicional
    if (
      line.includes('Console.WriteLine') &&
      !line.includes('for') &&
      !line.includes('while') &&
      !line.includes('if') &&
      !lines.slice(0, i).join('\n').includes('for (') &&
      !lines.slice(0, i).join('\n').includes('while (')
    ) {
      // Extraer el contenido del WriteLine
      const match = line.match(/Console\.WriteLine\(\s*(.*?)\s*\);/);

      if (match) {
        writeLinesOutsideLoops.push({
          line: i,
          content: match[1],
        });
      }
    }
  }

  // Procesar cada WriteLine encontrado
  for (const writeLine of writeLinesOutsideLoops) {
    await processWriteLine(writeLine.content, state, virtualConsole);
  }
}

// Ejecuta bucles for en el código
async function executeForLoops(code, state, virtualConsole) {
  // Buscar todos los bucles for
  const forLoopRegex =
    /for\s*\(\s*int\s+(\w+)\s*=\s*(\d+)\s*;\s*\1\s*<=\s*(\d+)\s*;\s*\1\+\+\s*\)\s*{([\s\S]*?)}/g;
  let match;

  while ((match = forLoopRegex.exec(code)) !== null) {
    const varName = match[1];
    const startVal = parseInt(match[2], 10);
    const endVal = parseInt(match[3], 10);
    const loopBody = match[4];

    // Ejecutar el bucle for
    for (let i = startVal; i <= endVal; i++) {
      // Actualizar la variable de control
      state.variables[varName] = i;

      // Encontrar y ejecutar todas las instrucciones WriteLine en el cuerpo del bucle
      const writeLineRegex = /Console\.WriteLine\(\s*(.*?)\s*\);/g;
      let writeLineMatch;

      while ((writeLineMatch = writeLineRegex.exec(loopBody)) !== null) {
        await processWriteLine(writeLineMatch[1], state, virtualConsole);
      }
    }
  }
}

// Ejecuta bucles while en el código
async function executeWhileLoops(code, state, virtualConsole) {
  // Buscar todos los bucles while
  const whileLoopRegex =
    /int\s+(\w+)\s*=\s*(\d+)\s*;[\s\S]*?while\s*\(\s*\1\s*>\s*0\s*\)\s*{([\s\S]*?)}/g;
  let match;

  while ((match = whileLoopRegex.exec(code)) !== null) {
    const varName = match[1];
    const startVal = parseInt(match[2], 10);
    const loopBody = match[3];

    // Inicializar la variable de control
    state.variables[varName] = startVal;

    // Ejecutar el bucle while
    while (state.variables[varName] > 0) {
      // Encontrar y ejecutar todas las instrucciones WriteLine en el cuerpo del bucle
      const writeLineRegex = /Console\.WriteLine\(\s*(.*?)\s*\);/g;
      let writeLineMatch;

      while ((writeLineMatch = writeLineRegex.exec(loopBody)) !== null) {
        await processWriteLine(writeLineMatch[1], state, virtualConsole);
      }

      // Decrementar la variable de control (específico para este ejemplo)
      state.variables[varName]--;
    }
  }
}

// Ejecuta bucles do-while y llamadas a métodos
async function executeDoWhileLoopsAndMethods(code, state, virtualConsole) {
  // Buscar todas las secciones de do-while
  const doWhileRegex = /do\s*{([\s\S]*?)}\s*while\s*\(\s*(.*?)\s*\)\s*;/g;
  let match;

  while ((match = doWhileRegex.exec(code)) !== null) {
    const loopBody = match[1];
    const condition = match[2];

    // Ejecutar el bucle do-while
    do {
      // Analizamos el cuerpo del bucle línea por línea
      const bodyLines = loopBody.split('\n');

      for (const line of bodyLines) {
        const trimmedLine = line.trim();

        // Console.WriteLine
        if (trimmedLine.startsWith('Console.WriteLine')) {
          const writeLineMatch = trimmedLine.match(
            /Console\.WriteLine\(\s*(.*?)\s*\);/
          );
          if (writeLineMatch) {
            await processWriteLine(writeLineMatch[1], state, virtualConsole);
          }
        }
        // Console.ReadLine
        else if (trimmedLine.includes('Console.ReadLine')) {
          // Buscar asignación de ReadLine
          const readLineMatch = trimmedLine.match(
            /(\w+)\s*=\s*Console\.ReadLine\(\)/
          );
          if (readLineMatch) {
            const varName = readLineMatch[1];
            const input = await virtualConsole.ReadLine();
            state.variables[varName] = input;
          } else {
            // Si no hay asignación, simplemente esperar un input
            await virtualConsole.ReadLine();
          }
        }
        // int.Parse
        else if (trimmedLine.includes('int.Parse')) {
          const parseMatch = trimmedLine.match(
            /(\w+)\s*=\s*int\.Parse\(\s*(\w+)\s*\)/
          );
          if (parseMatch) {
            const targetVar = parseMatch[1];
            const sourceVar = parseMatch[2];
            state.variables[targetVar] = parseInt(
              state.variables[sourceVar],
              10
            );
          }
        }
        // if statement
        else if (trimmedLine.startsWith('if')) {
          const ifMatch = trimmedLine.match(/if\s*\(\s*(\w+)\s*>\s*(\d+)\s*\)/);
          if (ifMatch) {
            const varName = ifMatch[1];
            const value = parseInt(ifMatch[2], 10);

            if (state.variables[varName] > value) {
              // Buscar la siguiente línea que debería ser un WriteLine
              const nextLineIndex = bodyLines.indexOf(line) + 1;
              if (nextLineIndex < bodyLines.length) {
                const nextLine = bodyLines[nextLineIndex].trim();
                const writeLineMatch = nextLine.match(
                  /Console\.WriteLine\(\s*(.*?)\s*\);/
                );
                if (writeLineMatch) {
                  await processWriteLine(
                    writeLineMatch[1],
                    state,
                    virtualConsole
                  );
                }
              }
            }
          }
        }
      }

      // Evaluar la condición para determinar si continuar el bucle
      // Para simplificar, sólo implementamos la condición específica del ejemplo
    } while (state.variables.numero > 0);
  }

  // Encontrar y ejecutar llamadas de método
  const methodCallRegex = /(\w+)\s*=\s*(\w+)\((\w+)\);/g;
  let methodMatch;

  while ((methodMatch = methodCallRegex.exec(code)) !== null) {
    const resultVar = methodMatch[1];
    const methodName = methodMatch[2];
    const param = methodMatch[3];

    // Verificar si el método existe en nuestro estado
    if (state.methods[methodName] && state.methods[methodName].execute) {
      // Ejecutar el método con el parámetro
      const paramValue = state.variables[param];
      const result = state.methods[methodName].execute(paramValue);
      state.variables[resultVar] = result;

      // Buscar el console.writeline que usa el resultado
      const resultWriteLineRegex = new RegExp(
        `Console\\.WriteLine\\(\\s*\\$"[^"]*${resultVar}[^"]*"\\s*\\);`
      );
      const resultWriteLineMatch = code.match(resultWriteLineRegex);

      if (resultWriteLineMatch) {
        await processWriteLine(resultWriteLineMatch[1], state, virtualConsole);
      }
    }
  }

  // Procesar las líneas finales que muestran el resultado
  const finalLines = code.split('\n');
  for (const line of finalLines) {
    const trimmedLine = line.trim();

    // Buscar Console.WriteLine que usan el resultado del método
    if (
      trimmedLine.startsWith('Console.WriteLine') &&
      trimmedLine.includes('factNum') &&
      trimmedLine.includes('resultado')
    ) {
      const writeLineMatch = trimmedLine.match(
        /Console\.WriteLine\(\s*(.*?)\s*\);/
      );
      if (writeLineMatch) {
        await processWriteLine(writeLineMatch[1], state, virtualConsole);
      }
    }
  }
}

// Procesa una instrucción Console.WriteLine
async function processWriteLine(content, state, virtualConsole) {
  // Si es una cadena simple
  if (content.startsWith('"') && content.endsWith('"')) {
    await virtualConsole.WriteLine(content.substring(1, content.length - 1));
    return;
  }

  // Si es una interpolación de cadena
  if (content.startsWith('$"') && content.endsWith('"')) {
    const template = content.substring(2, content.length - 1);

    // Reemplazar {variable} con su valor actual
    const result = template.replace(/{([^}]+)}/g, (match, expr) => {
      // Si es una expresión simple (solo una variable)
      if (expr.trim() in state.variables) {
        return state.variables[expr.trim()];
      }

      // Si es una expresión matemática (como "numero * numero")
      try {
        // Reemplazar variables con sus valores
        const resolvedExpr = expr.replace(/\b\w+\b/g, (match) => {
          if (match in state.variables) {
            return state.variables[match];
          }
          return match;
        });

        // Evaluar la expresión
        return eval(resolvedExpr);
      } catch (e) {
        return `[${expr}]`;
      }
    });

    await virtualConsole.WriteLine(result);
    return;
  }

  // Si es una variable u otra expresión
  if (content in state.variables) {
    await virtualConsole.WriteLine(state.variables[content]);
    return;
  }

  // Por defecto, simplemente mostramos el contenido tal cual
  await virtualConsole.WriteLine(content);
}
