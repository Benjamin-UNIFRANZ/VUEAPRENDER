import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import edge from 'edge-js';
import { createServer as createViteServer } from 'vite';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Create C# execution function
const executeCSharp = edge.func(`
    #r "System.Console.dll"
    
    using System;
    using System.IO;
    using System.Text;
    using System.Threading.Tasks;

    public class Program
    {
        public async Task<object> Invoke(dynamic input)
        {
            string code = (string)input;
            
            // Create a StringWriter to capture console output
            var outputWriter = new StringWriter();
            var originalOutput = Console.Out;
            Console.SetOut(outputWriter);
            
            try
            {
                // Compile and execute the code
                var compiler = new Microsoft.CSharp.CSharpCodeProvider();
                var parameters = new System.CodeDom.Compiler.CompilerParameters();
                
                parameters.ReferencedAssemblies.Add("System.dll");
                parameters.GenerateInMemory = true;
                parameters.GenerateExecutable = true;
                
                var results = compiler.CompileAssemblyFromSource(parameters, code);
                
                if (results.Errors.HasErrors)
                {
                    StringBuilder errors = new StringBuilder();
                    foreach (var error in results.Errors)
                    {
                        errors.AppendLine(error.ToString());
                    }
                    return new { success = false, output = errors.ToString() };
                }
                
                var assembly = results.CompiledAssembly;
                var entryPoint = assembly.EntryPoint;
                
                entryPoint.Invoke(null, new object[] { new string[] { } });
                
                return new { success = true, output = outputWriter.ToString() };
            }
            catch (Exception ex)
            {
                return new { success = false, output = ex.ToString() };
            }
            finally
            {
                Console.SetOut(originalOutput);
                outputWriter.Dispose();
            }
        }
    }
`);

// C# code execution endpoint
app.post('/api/execute', async (req, res) => {
    try {
        const { code } = req.body;
        
        if (!code) {
            return res.status(400).json({ 
                success: false, 
                output: 'No code provided' 
            });
        }

        const result = await new Promise((resolve, reject) => {
            executeCSharp(code, (error, result) => {
                if (error) reject(error);
                else resolve(result);
            });
        });

        res.json(result);
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            output: `Server error: ${error.message}` 
        });
    }
});

// Create Vite dev server
const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa'
});

app.use(vite.middlewares);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});