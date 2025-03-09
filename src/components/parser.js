/**
 * Parser de código C# a JavaScript
 */

 import { convertCSharpOperators } from './utils.js';

 // Tipos de tokens
 const TokenType = {
   KEYWORD: 'keyword',
   IDENTIFIER: 'identifier',
   OPERATOR: 'operator',
   PUNCTUATION: 'punctuation',
   STRING: 'string',
   NUMBER: 'number',
   COMMENT: 'comment',
   WHITESPACE: 'whitespace',
   EOF: 'EOF'
 };
 
 // Keywords de C#
 const KEYWORDS = [
   'if', 'else', 'while', 'for', 'foreach', 'do', 'switch', 'case', 'break',
   'continue', 'return', 'using', 'namespace', 'class', 'struct', 'interface',
   'public', 'private', 'protected', 'internal', 'static', 'void', 'int',
   'double', 'string', 'bool', 'char', 'long', 'float', 'decimal', 'var'
 ];
 
 /**
  * Tokenizer para código C#
  */
 export class CSharpTokenizer {
   constructor(code) {
     this.code = code;
     this.pos = 0;
     this.tokens = [];
   }
   
   tokenize() {
     while (this.pos < this.code.length) {
       const char = this.code[this.pos];
       
       // Espacios en blanco
       if (/\s/.test(char)) {
         this.tokenizeWhitespace();
       }
       // Comentarios
       else if (char === '/' && this.lookAhead(1) === '/') {
         this.tokenizeSingleLineComment();
       }
       else if (char === '/' && this.lookAhead(1) === '*') {
         this.tokenizeMultiLineComment();
       }
       // Cadenas
       else if (char === '"' || char === '\'') {
         this.tokenizeString(char);
       }
       // Números
       else if (/\d/.test(char)) {
         this.tokenizeNumber();
       }
       // Identificadores y palabras clave
       else if (/[a-zA-Z_]/.test(char)) {
         this.tokenizeIdentifierOrKeyword();
       }
       // Operadores y puntuación
       else {
         this.tokenizeOperatorOrPunctuation();
       }
     }
     
     this.tokens.push({ type: TokenType.EOF, value: '' });
     return this.tokens;
   }
   
   lookAhead(n) {
     return this.pos + n < this.code.length ? this.code[this.pos + n] : null;
   }
   
   tokenizeWhitespace() {
     let start = this.pos;
     while (this.pos < this.code.length && /\s/.test(this.code[this.pos])) {
       this.pos++;
     }
     const value = this.code.substring(start, this.pos);
     this.tokens.push({ type: TokenType.WHITESPACE, value });
   }
   
   tokenizeSingleLineComment() {
     let start = this.pos;
     this.pos += 2; // Skip //
     while (this.pos < this.code.length && this.code[this.pos] !== '\n') {
       this.pos++;
     }
     const value = this.code.substring(start, this.pos);
     this.tokens.push({ type: TokenType.COMMENT, value });
   }
   
   tokenizeMultiLineComment() {
     let start = this.pos;
     this.pos += 2; // Skip /*
     while (this.pos < this.code.length && 
            !(this.code[this.pos] === '*' && this.lookAhead(1) === '/')) {
       this.pos++;
     }
     if (this.pos < this.code.length) {
       this.pos += 2; // Skip */
     }
     const value = this.code.substring(start, this.pos);
     this.tokens.push({ type: TokenType.COMMENT, value });
   }
   
   tokenizeString(quote) {
     let start = this.pos;
     let escaped = false;
     this.pos++; // Skip opening quote
     
     while (this.pos < this.code.length) {
       if (escaped) {
         escaped = false;
       } else if (this.code[this.pos] === '\\') {
         escaped = true;
       } else if (this.code[this.pos] === quote) {
         break;
       }
       this.pos++;
     }
     
     if (this.pos < this.code.length) {
       this.pos++; // Skip closing quote
     }
     
     const value = this.code.substring(start, this.pos);
     this.tokens.push({ type: TokenType.STRING, value });
   }
   
   tokenizeNumber() {
     const regex = /^\d+(\.\d+)?([eE][+-]?\d+)?/;
     const match = this.code.substring(this.pos).match(regex);
     
     if (match) {
       const value = match[0];
       this.tokens.push({ type: TokenType.NUMBER, value });
       this.pos += value.length;
     } else {
       // Si no coincide con el patrón completo, avanzar solo un dígito
       this.tokens.push({ type: TokenType.NUMBER, value: this.code[this.pos] });
       this.pos++;
     }
   }
   
   tokenizeIdentifierOrKeyword() {
     const regex = /^[a-zA-Z_]\w*/;
     const match = this.code.substring(this.pos).match(regex);
     
     if (match) {
       const value = match[0];
       const type = KEYWORDS.includes(value) ? TokenType.KEYWORD : TokenType.IDENTIFIER;
       this.tokens.push({ type, value });
       this.pos += value.length;
     } else {
       // Si no coincide con el patrón completo, avanzar solo un carácter
       this.tokens.push({ type: TokenType.IDENTIFIER, value: this.code[this.pos] });
       this.pos++;
     }
   }
   
   tokenizeOperatorOrPunctuation() {
     // Lista de operadores multicarácter ordenados por longitud (del más largo al más corto)
     const multiCharOperators = [
       "+=", "-=", "*=", "/=", "%=", "==", "!=", ">=", "<=", "&&", "||", "++", "--", "=>", "??"
     ];
     
     // Primero verificamos si hay un operador multicarácter
     for (const op of multiCharOperators) {
       if (this.code.substring(this.pos, this.pos + op.length) === op) {
         this.tokens.push({ type: TokenType.OPERATOR, value: op });
         this.pos += op.length;
         return;
       }
     }
     
     // Si no es un operador multicarácter, entonces es un caracter único
     const operatorsAndPunctuation = "+-*/%=<>!&|^~?:;,.(){}[]";
     if (operatorsAndPunctuation.includes(this.code[this.pos])) {
       this.tokens.push({ 
         type: ";,(){}[]".includes(this.code[this.pos]) ? TokenType.PUNCTUATION : TokenType.OPERATOR, 
         value: this.code[this.pos] 
       });
       this.pos++;
     } else {
       // Caracter desconocido, lo saltamos
       this.pos++;
     }
   }
 }
 
 /**
  * Parser que transforma código C# a JavaScript
  */
 export class CSharpParser {
   constructor(code) {
     this.tokenizer = new CSharpTokenizer(code);
     this.tokens = [];
     this.position = 0;
     this.code = code;
   }
 
   parse() {
     // Tokenizar el código
     this.tokens = this.tokenizer.tokenize();
     
     // Filtrar comentarios y espacios en blanco para simplificar el análisis
     this.tokens = this.tokens.filter(token => 
       token.type !== TokenType.COMMENT && token.type !== TokenType.WHITESPACE);
       
     // Resultado del parsing
     const result = {
       jsCode: '',
       variables: {},
       functions: {},
       errors: []
     };
     
     try {
       result.jsCode = this.transformCodeToJS();
     } catch (error) {
       result.errors.push({
         message: error.message,
         position: this.position
       });
     }
     
     return result;
   }
   
   current() {
     return this.tokens[this.position];
   }
   
   peek(offset = 1) {
     const pos = this.position + offset;
     if (pos >= this.tokens.length) {
       return { type: TokenType.EOF, value: '' };
     }
     return this.tokens[pos];
   }
   
   advance() {
     if (this.position < this.tokens.length) {
       this.position++;
     }
     return this.current();
   }
   
   expect(type, value = null) {
     const token = this.current();
     
     if (token.type !== type) {
       throw new Error(`Se esperaba ${type}, pero se obtuvo ${token.type}`);
     }
     
     if (value !== null && token.value !== value) {
       throw new Error(`Se esperaba '${value}', pero se obtuvo '${token.value}'`);
     }
     
     this.advance();
     return token;
   }
   
   transformCodeToJS() {
     let jsCode = '';
     
     // Ignorar using y namespace
     this.skipUsingsAndNamespace();
     
     // Mientras tengamos tokens
     while (this.position < this.tokens.length && this.current().type !== TokenType.EOF) {
       // Analizar declaraciones de clase
       if (this.current().type === TokenType.KEYWORD && this.current().value === 'class') {
         jsCode += this.parseClass();
       }
       // Analizar métodos fuera de clase
       else if (this.isMethodDeclaration()) {
         jsCode += this.parseMethod();
       }
       // Analizar declaraciones de variables
       else if (this.isVariableDeclaration()) {
         jsCode += this.parseVariableDeclaration();
       }
       // Declaraciones de control de flujo
       else if (this.isControlFlowStatement()) {
         jsCode += this.parseControlFlowStatement();
       }
       // Expresiones y sentencias
       else if (this.isExpression()) {
         jsCode += this.parseExpression() + ';';
       }
       // Ignorar tokens desconocidos
       else {
         this.advance();
       }
     }
     
     return jsCode;
   }
   
   skipUsingsAndNamespace() {
     while (this.position < this.tokens.length) {
       if (this.current().type === TokenType.KEYWORD && 
          (this.current().value === 'using' || this.current().value === 'namespace')) {
         // Saltarse la declaración completa hasta el ;
         while (this.current().type !== TokenType.PUNCTUATION || this.current().value !== ';') {
           this.advance();
           if (this.current().type === TokenType.EOF) break;
         }
         if (this.current().type !== TokenType.EOF) this.advance(); // Skip the ;
       } else {
         break;
       }
     }
   }
   
   isMethodDeclaration() {
     // Verificar si estamos en una declaración de método
     if (this.current().type !== TokenType.KEYWORD) return false;
     
     const modifiers = ['static', 'public', 'private', 'protected', 'internal', 'virtual', 'abstract', 'override', 'sealed'];
     
     if (!modifiers.includes(this.current().value)) return false;
     
     // Verificar si tenemos un tipo de retorno seguido de un identificador y paréntesis
     let pos = 1;
     while (this.peek(pos).type === TokenType.KEYWORD && modifiers.includes(this.peek(pos).value)) {
       pos++;
     }
     
     // Tipo de retorno
     if (this.peek(pos).type !== TokenType.KEYWORD && this.peek(pos).type !== TokenType.IDENTIFIER) return false;
     pos++;
     
     // Nombre del método (identificador)
     if (this.peek(pos).type !== TokenType.IDENTIFIER) return false;
     pos++;
     
     // Paréntesis de apertura
     return this.peek(pos).type === TokenType.PUNCTUATION && this.peek(pos).value === '(';
   }
   
   parseMethod() {
     let jsCode = 'function ';
     
     // Saltar modificadores
     while (this.current().type === TokenType.KEYWORD && 
            ['static', 'public', 'private', 'protected', 'internal', 'virtual', 'abstract', 'override', 'sealed'].includes(this.current().value)) {
       this.advance();
     }
     
     // Saltar el tipo de retorno
     this.advance();
     
     // Nombre del método
     jsCode += this.expect(TokenType.IDENTIFIER).value;
     
     // Parámetros
     jsCode += this.parseParameters();
     
     // Cuerpo del método
     jsCode += this.parseBlock();
     
     return jsCode;
   }
   
   parseParameters() {
     let jsCode = '(';
     
     this.expect(TokenType.PUNCTUATION, '(');
     
     let first = true;
     while (this.current().type !== TokenType.PUNCTUATION || this.current().value !== ')') {
       if (!first) {
         this.expect(TokenType.PUNCTUATION, ',');
         jsCode += ', ';
       }
       
       first = false;
       
       // En C# los parámetros tienen tipo, en JS no
       if (this.current().type === TokenType.KEYWORD || this.current().type === TokenType.IDENTIFIER) {
         this.advance(); // Saltamos el tipo
       }
       
       // Nombre del parámetro
       jsCode += this.expect(TokenType.IDENTIFIER).value;
       
       if (this.current().type === TokenType.EOF) break;
     }
     
     this.expect(TokenType.PUNCTUATION, ')');
     jsCode += ')';
     
     return jsCode;
   }
   
   parseBlock() {
     let jsCode = ' {\n';
     
     this.expect(TokenType.PUNCTUATION, '{');
     
     // Procesar el contenido del bloque
     while (this.current().type !== TokenType.PUNCTUATION || this.current().value !== '}') {
       if (this.isVariableDeclaration()) {
         jsCode += this.parseVariableDeclaration();
       } else if (this.isControlFlowStatement()) {
         jsCode += this.parseControlFlowStatement();
       } else if (this.isExpression()) {
         jsCode += this.parseExpression() + ';\n';
       } else {
         this.advance();
       }
       
       if (this.current().type === TokenType.EOF) break;
     }
     
     this.expect(TokenType.PUNCTUATION, '}');
     jsCode += '}\n';
     
     return jsCode;
   }
   
   isVariableDeclaration() {
     // Verificamos si es una declaración de variable en C#
     if (this.current().type !== TokenType.KEYWORD) return false;
     
     const types = ['int', 'double', 'string', 'bool', 'char', 'var', 'float', 'decimal', 'long', 'short', 'byte'];
     
     return types.includes(this.current().value);
   }
   
   parseVariableDeclaration() {
     let jsCode = 'let '; // En JS usamos 'let' en lugar de los tipos de C#
     
     // Saltamos el tipo
     this.advance();
     
     // Nombre de la variable
     jsCode += this.expect(TokenType.IDENTIFIER).value;
     
     // Si hay una asignación
     if (this.current().type === TokenType.OPERATOR && this.current().value === '=') {
       this.advance(); // Consumir el operador =
       jsCode += ' = ' + this.parseExpression();
     }
     
     this.expect(TokenType.PUNCTUATION, ';');
     jsCode += ';\n';
     
     return jsCode;
   }
   
   isControlFlowStatement() {
     if (this.current().type !== TokenType.KEYWORD) return false;
     
     const controlKeywords = ['if', 'else', 'for', 'while', 'do', 'foreach', 'switch', 'case', 'break', 'continue', 'return'];
     
     return controlKeywords.includes(this.current().value);
   }
   
   parseControlFlowStatement() {
     const keyword = this.current().value;
     this.advance();
     
     let jsCode = '';
     
     switch (keyword) {
       case 'if':
         jsCode = 'if' + this.parseCondition() + this.parseStatement();
         
         // Check for else
         if (this.current().type === TokenType.KEYWORD && this.current().value === 'else') {
           this.advance();
           jsCode += ' else ' + this.parseStatement();
         }
         break;
       
       case 'else':
         // Solo 'else' sin 'if' es un error en la sintaxis
         throw new Error("'else' sin 'if' correspondiente");
         
       case 'for':
         jsCode = 'for' + this.parseForLoop() + this.parseStatement();
         break;
         
       case 'while':
         jsCode = 'while' + this.parseCondition() + this.parseStatement();
         break;
         
       case 'do':
         jsCode = 'do' + this.parseStatement();
         
         if (this.current().type === TokenType.KEYWORD && this.current().value === 'while') {
           this.advance();
           jsCode += ' while' + this.parseCondition() + ';';
         } else {
           throw new Error("Se esperaba 'while' después de 'do'");
         }
         break;
         
       case 'foreach':
         jsCode = this.parseForEach();
         break;
         
       case 'return':
         jsCode = 'return';
         
         // Si hay una expresión después del return
         if (this.isExpression()) {
           jsCode += ' ' + this.parseExpression();
         }
         
         this.expect(TokenType.PUNCTUATION, ';');
         jsCode += ';\n';
         break;
         
       // Otros casos como switch, break, continue
       // ...
     }
     
     return jsCode;
   }
   
   parseCondition() {
     let jsCode = '(';
     
     this.expect(TokenType.PUNCTUATION, '(');
     
     // Parsear la expresión de la condición
     jsCode += this.parseExpression();
     
     this.expect(TokenType.PUNCTUATION, ')');
     jsCode += ')';
     
     return jsCode;
   }
   
   parseStatement() {
     // Si es un bloque
     if (this.current().type === TokenType.PUNCTUATION && this.current().value === '{') {
       return this.parseBlock();
     }
     
     // Si es otra declaración (no bloque)
     let jsCode = '';
     
     if (this.isVariableDeclaration()) {
       jsCode = this.parseVariableDeclaration();
     } else if (this.isControlFlowStatement()) {
       jsCode = this.parseControlFlowStatement();
     } else if (this.isExpression()) {
       jsCode = this.parseExpression() + ';\n';
       this.expect(TokenType.PUNCTUATION, ';');
     } else {
       this.advance(); // Simplemente avanzar si no sabemos cómo manejar esto
     }
     
     return jsCode;
   }
   
   parseForLoop() {
     let jsCode = '(';
     
     this.expect(TokenType.PUNCTUATION, '(');
     
     // Inicialización
     if (!this.isExpressionEnd()) {
       if (this.isVariableDeclaration()) {
         // En JavaScript necesitamos usar let/var en el bucle for
         jsCode += 'let ';
         
         // Saltamos el tipo
         this.advance();
         
         // Nombre de la variable
         jsCode += this.expect(TokenType.IDENTIFIER).value;
         
         // Asignación
         if (this.current().type === TokenType.OPERATOR && this.current().value === '=') {
           this.advance(); // Consumir =
           jsCode += ' = ' + this.parseExpression();
         }
       } else {
         jsCode += this.parseExpression();
       }
     }
     
     this.expect(TokenType.PUNCTUATION, ';');
     jsCode += '; ';
     
     // Condición
     if (!this.isExpressionEnd()) {
       jsCode += this.parseExpression();
     }
     
     this.expect(TokenType.PUNCTUATION, ';');
     jsCode += '; ';
     
     // Incremento
     if (!this.isExpressionEnd()) {
       jsCode += this.parseExpression();
     }
     
     this.expect(TokenType.PUNCTUATION, ')');
     jsCode += ')';
     
     return jsCode;
   }
   
   parseForEach() {
     let jsCode = 'for (let ';
     
     this.expect(TokenType.PUNCTUATION, '(');
     
     // En C# foreach tiene un tipo pero en JS no lo necesitamos
     if (this.current().type === TokenType.KEYWORD || this.current().type === TokenType.IDENTIFIER) {
       this.advance(); // Saltamos el tipo
     }
     
     // Variable
     jsCode += this.expect(TokenType.IDENTIFIER).value;
     
     // En C# es 'in', necesitamos 'of' para JavaScript
     if (this.current().type === TokenType.KEYWORD && this.current().value === 'in') {
       this.advance();
       jsCode += ' of ';
     } else {
       throw new Error("Se esperaba 'in' en la declaración foreach");
     }
     
     // Colección
     jsCode += this.parseExpression();
     
     this.expect(TokenType.PUNCTUATION, ')');
     jsCode += ')';
     
     // Cuerpo del foreach
     jsCode += this.parseStatement();
     
     return jsCode;
   }
   
   isExpressionEnd() {
     return (this.current().type === TokenType.PUNCTUATION &&
            (this.current().value === ';' || this.current().value === ')' || 
             this.current().value === '}' || this.current().value === ','));
   }
   
   isExpression() {
     // Esto es simplificado; una implementación completa verificaría más casos
     return this.current().type === TokenType.IDENTIFIER ||
            this.current().type === TokenType.NUMBER ||
            this.current().type === TokenType.STRING ||
            this.current().type === TokenType.KEYWORD && ['true', 'false', 'null'].includes(this.current().value) ||
            this.current().type === TokenType.OPERATOR ||
            this.current().type === TokenType.PUNCTUATION && this.current().value === '(';
   }
   
   parseExpression() {
     // Esta es una implementación muy básica
     // Un parser de expresiones completo usaría el algoritmo Shunting Yard o similar
     
     let expr = '';
     let parenCount = 0;
     
     while (!this.isExpressionEnd() || parenCount > 0) {
       const token = this.current();
       
       if (token.type === TokenType.PUNCTUATION) {
         if (token.value === '(') parenCount++;
         else if (token.value === ')') parenCount--;
       }
       
       // Manejar llamadas a métodos de C# especiales
       if (token.type === TokenType.IDENTIFIER && this.peek().type === TokenType.PUNCTUATION && this.peek().value === '.') {
         const identifier = token.value;
         this.advance(); // Consumir el identificador
         this.advance(); // Consumir el punto
         
         const method = this.expect(TokenType.IDENTIFIER).value;
         
         // Mapear métodos de C# a JavaScript
         if (identifier === 'Console' && method === 'WriteLine') {
           expr += 'console.log';
         } else if (identifier === 'Convert') {
           if (method === 'ToInt32') expr += 'parseInt';
           else if (method === 'ToDouble') expr += 'parseFloat';
           else expr += `${identifier}.${method}`;
         } else {
           expr += `${identifier}.${method}`;
         }
       }
       // Si no es una llamada a método especial, añadimos el token tal cual
       else {
         expr += token.value;
         this.advance();
       }
       
       if (this.current().type === TokenType.EOF) break;
     }
     
     // Convertir operadores C# a JavaScript si es necesario
     return convertCSharpOperators(expr);
   }
   
   parseClass() {
     let jsCode = '';
     
     this.expect(TokenType.KEYWORD, 'class');
     
     // Nombre de la clase
     const className = this.expect(TokenType.IDENTIFIER).value;
     
     // En JavaScript moderno no necesitamos una declaración de clase explícita para código simple
     // pero podríamos generar una clase si fuera necesario
     
     // Abrir bloque de la clase
     this.expect(TokenType.PUNCTUATION, '{');
     
     // Procesar miembros de la clase
     while (this.current().type !== TokenType.PUNCTUATION || this.current().value !== '}') {
       // Métodos
       if (this.isMethodDeclaration()) {
         // Para el método Main, lo convertimos en una función independiente o una IIFE
         if (this.tokenLookAhead(1).value === 'void' && this.tokenLookAhead(2).value === 'Main') {
           const mainMethod = this.parseMethod();
           jsCode += mainMethod;
           
           // También podemos añadir una llamada automática si es Main
           // jsCode += `\n// Auto-ejecución del método Main\n${className}.Main();\n`;
         } else {
           this.parseMethod(); // Ignoramos otros métodos por ahora
         }
       }
       // Otros miembros de la clase
       else {
         this.advance();
       }
       
       if (this.current().type === TokenType.EOF) break;
     }
     
     this.expect(TokenType.PUNCTUATION, '}');
     
     return jsCode;
   }
   
   tokenLookAhead(offset) {
     const pos = this.position + offset;
     if (pos >= this.tokens.length) {
       return { type: TokenType.EOF, value: '' };
     }
     return this.tokens[pos];
   }
 }
 
 // Función helper para transformar código C# a JavaScript
 export function transformCSharpToJavaScript(csharpCode) {
   try {
     const parser = new CSharpParser(csharpCode);
     const result = parser.parse();
     
     if (result.errors.length > 0) {
       return { 
         success: false, 
         jsCode: null, 
         errors: result.errors 
       };
     }
     
     return { 
       success: true, 
       jsCode: result.jsCode, 
       errors: [] 
     };
   } catch (error) {
     return { 
       success: false, 
       jsCode: null, 
       errors: [{ message: error.message }] 
     };
   }
 }
 