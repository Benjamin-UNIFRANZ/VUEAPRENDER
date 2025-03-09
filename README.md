# Intérprete C# a JavaScript

Un motor de ejecución de código C# que funciona directamente en el navegador, convirtiendo y ejecutando el código en JavaScript.

## Arquitectura del Sistema

```
┌─────────────────┐      ┌───────────────────────┐
│                 │      │                       │
│    editor.vue   │◄────►│    Interfaz Usuario   │
│                 │      │                       │
└────────┬────────┘      └───────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────┐
│                                                 │
│             Procesamiento de Código             │
│                                                 │
│  ┌─────────────┐  ┌───────────────┐  ┌────────┐ │
│  │             │  │               │  │        │ │
│  │   parser.js │  │fullModeInter- │  │simple- │ │
│  │             │◄─►│preter.js     │◄─►│CSharp │ │
│  │             │  │               │  │Runner  │ │
│  └──────┬──────┘  └───────┬───────┘  └────┬───┘ │
│         │                 │               │     │
└─────────┼─────────────────┼───────────────┼─────┘
          │                 │               │
          ▼                 ▼               ▼
┌─────────────────────────────────────────────────┐
│                                                 │
│              Utilidades de Soporte              │
│                                                 │
│  ┌─────────────┐  ┌───────────────┐  ┌────────┐ │
│  │             │  │               │  │        │ │
│  │   utils.js  │  │csharpInter-   │  │debug-  │ │
│  │             │◄─►│preter.js     │◄─►│Helper  │ │
│  │             │  │               │  │        │ │
│  └─────────────┘  └───────────────┘  └────────┘ │
│                                                 │
└─────────────────────────────────────────────────┘
```

## Componentes Principales

### 1. Interfaz de Usuario
- **editor.vue**: Componente principal que proporciona:
  - Editor de código con resaltado de sintaxis
  - Consola virtual para mostrar resultados
  - Controles para ejecutar el código
  - Gestión de proyectos y guardado

### 2. Procesadores de Código
- **parser.js**: Analiza sintácticamente el código C# y lo convierte a JavaScript
  - Tokeniza el código fuente
  - Genera código JavaScript equivalente
  - Maneja estructuras como clases, métodos y control de flujo

- **fullModeInterpreter.js**: Intérprete completo para código C#
  - Ejecuta el código C# instrucción por instrucción
  - Gestiona ámbitos de variables y funciones
  - Procesa bucles, condicionales y llamadas a métodos

- **simpleCSharpRunner.js**: Ejecutor simplificado para ejemplos específicos
  - Se centra en ejecutar ejemplos con bucles y console.write
  - Más fiable para casos simples y educativos
  - No requiere un análisis completo del código

### 3. Utilidades de Soporte
- **utils.js**: Funciones auxiliares generales
  - Mapeo de funciones C# a JavaScript
  - Análisis de errores
  - Conversión de operadores

- **csharpInterpreter.js**: Funcionalidades específicas para C#
  - Manejo de interpolación de cadenas
  - Procesamiento de expresiones C#
  - Transformaciones de código

- **debugHelper.js**: Herramientas de diagnóstico
  - Análisis de estructura de código
  - Depuración de bucles
  - Seguimiento de ejecución

- **simulationUtils.js**: Utilidades para simulación
  - Consola virtual
  - Procesamiento de bloques de código
  - Evaluación de expresiones

## Flujo de Ejecución

1. El usuario escribe código C# en el editor
2. Al pulsar "Run Code":
   - Se limpia la consola virtual
   - Se evalúa el tipo de código (si tiene bucles, usa simpleCSharpRunner.js)
   - Se intenta ejecutar con fullModeInterpreter.js si es complejo
   - Si falla, se utiliza el modo de compatibilidad simple

3. Proceso de ejecución:
   ```
   Código C# → Parser → Código JS → Ejecución → Resultado en Consola
   ```

4. Manejo de errores:
   - Los errores se capturan, analizan y muestran con mensajes amigables
   - Si un método de ejecución falla, se prueba con un método alternativo

## Proceso de Transformación C# a JS

1. **Tokenización**: El código se divide en tokens (palabras clave, identificadores, etc.)
2. **Análisis Sintáctico**: Se analiza la estructura del código
3. **Transformación**: Se convierte a JavaScript equivalente
4. **Ejecución**: Se ejecuta en un entorno simulado
5. **Captura de Salida**: Los resultados se muestran en la consola virtual

## Características Soportadas

- Variables y tipos básicos (int, double, string, bool)
- Estructuras de control (if, else, for, while, do-while)
- Console.WriteLine y Console.ReadLine
- Métodos y funciones
- Interpolación de cadenas ($"texto {variable}")
- Operadores matemáticos y lógicos

## Limitaciones

- No soporta POO completa
- Funcionalidades avanzadas de C# no implementadas
- Biblioteca estándar .NET limitada
