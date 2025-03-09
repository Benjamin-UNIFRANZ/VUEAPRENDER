using System;

class Program
{
    static void Main()
    {
        Console.WriteLine("Demostración de ciclos en C#");
        Console.WriteLine("---------------------------");
        
        // Ejemplo de ciclo for
        Console.WriteLine("\n1. Ciclo for - Contando del 1 al 5:");
        for (int i = 1; i <= 5; i++)
        {
            Console.WriteLine($"Número: {i}");
        }
        
        // Ejemplo de ciclo while
        Console.WriteLine("\n2. Ciclo while - Contando hacia atrás de 5 a 1:");
        int contador = 5;
        while (contador > 0)
        {
            Console.WriteLine($"Número: {contador}");
            contador--;
        }
        
        // Ejemplo de ciclo do-while
        Console.WriteLine("\n3. Ciclo do-while - Se ejecuta al menos una vez:");
        int numero = 0;
        do
        {
            Console.WriteLine("Ingrese un número positivo (0 para terminar):");
            string input = Console.ReadLine();
            numero = int.Parse(input);
            
            if (numero > 0)
            {
                Console.WriteLine($"El cuadrado de {numero} es {numero * numero}");
            }
        } while (numero > 0);
        
        // Ejemplo de cálculo de factorial usando un método
        Console.WriteLine("\n4. Cálculo de factorial usando un método:");
        Console.WriteLine("Ingrese un número para calcular su factorial:");
        string factInput = Console.ReadLine();
        int factNum = int.Parse(factInput);
        
        long resultado = CalcularFactorial(factNum);
        Console.WriteLine($"El factorial de {factNum} es {resultado}");
    }
    
    // Método para calcular el factorial de un número
    static long CalcularFactorial(int n)
    {
        if (n <= 1)
        {
            return 1;
        }
        
        long fact = 1;
        for (int i = 2; i <= n; i++)
        {
            fact *= i;
        }
        
        return fact;
    }
}