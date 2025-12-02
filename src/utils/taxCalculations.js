// Constants for 2025 (using 2024 values where 2025 are not yet official/changed)
const UMA_2024 = 108.57;
const UMA_MENSUAL = UMA_2024 * 30.4;
const TOPE_IMSS_UMA = 25;

// Factor de Integración Mínimo (1 año antigüedad, 12 días vacaciones)
// 365 + 15 (aguinaldo) + (12 * 0.25) (prima vacacional) / 365 = 1.0493
const FACTOR_INTEGRACION = 1.0493;

// Tabla ISR Mensual 2024/2025
// Límite Inferior, Cuota Fija, Porcentaje Excedente
const TABLA_ISR = [
    { limInf: 0.01, cuota: 0.00, porc: 0.0192 },
    { limInf: 746.05, cuota: 14.32, porc: 0.0640 },
    { limInf: 6332.06, cuota: 371.83, porc: 0.1088 },
    { limInf: 11128.02, cuota: 893.63, porc: 0.1600 },
    { limInf: 12935.83, cuota: 1182.88, porc: 0.1792 },
    { limInf: 15487.72, cuota: 1640.18, porc: 0.2136 },
    { limInf: 31236.50, cuota: 5004.12, porc: 0.2352 },
    { limInf: 49233.01, cuota: 9236.89, porc: 0.3000 },
    { limInf: 93993.91, cuota: 22665.17, porc: 0.3200 },
    { limInf: 125325.21, cuota: 32691.18, porc: 0.3400 },
    { limInf: 375975.62, cuota: 117912.32, porc: 0.3500 }
];

// Subsidio al Empleo 2024 (Actualizado Mayo 2024)
// Para ingresos menores a $9,081.00, el subsidio es la diferencia para que el ISR no exceda cierto monto, 
// pero simplificaremos usando la tabla tradicional o la nueva mecánica si es relevante.
// La nueva mecánica (Mayo 2024) otorga una cuota mensual de $390.12 a ingresos <= $9,081.00.
const SUBSIDIO_TOPE = 9081.00;
const SUBSIDIO_MONTO = 390.12;

export const calculateISR = (grossSalary) => {
    if (grossSalary <= 0) return 0;

    let row = TABLA_ISR.find((r, index) => {
        const nextRow = TABLA_ISR[index + 1];
        return grossSalary >= r.limInf && (!nextRow || grossSalary < nextRow.limInf);
    });

    if (!row) return 0;

    const excedente = grossSalary - row.limInf;
    const impuestoMarginal = excedente * row.porc;
    let isr = impuestoMarginal + row.cuota;

    // Aplicar Subsidio al Empleo (Mecánica 2024)
    if (grossSalary <= SUBSIDIO_TOPE) {
        // Si el ISR es menor al subsidio, el empleado recibe la diferencia (no implementado aquí, solo reducimos a 0 o negativo)
        // En la práctica, si ISR < Subsidio, el resultado es un abono.
        // Aquí retornaremos el ISR neto (puede ser negativo si hay subsidio a favor).
        isr -= SUBSIDIO_MONTO;
    }

    return isr;
};

export const calculateIMSS = (grossSalary) => {
    if (grossSalary <= 0) return 0;

    // 1. Calcular Salario Base de Cotización (SBC)
    let sbc = grossSalary * FACTOR_INTEGRACION / 30.4; // Aproximación diaria

    // Tope de 25 UMAS
    const topeSBC = UMA_2024 * TOPE_IMSS_UMA;
    if (sbc > topeSBC) sbc = topeSBC;
    if (sbc < UMA_2024) sbc = UMA_2024; // Mínimo teórico

    const sbcMensual = sbc * 30.4; // Base mensual para cálculo de cuotas

    // 2. Calcular Cuotas Obrero (Empleado)
    // Enfermedades y Maternidad (Excedente 3 UMA)
    const excedente3UMA = sbc - (3 * UMA_2024);
    const eyM_Excedente = excedente3UMA > 0 ? excedente3UMA * 30.4 * 0.0040 : 0; // 0.40%

    // Prestaciones en Dinero (Gastos Médicos Pensionados + Dinero)
    // Gastos Médicos: 0.375%
    // Dinero: 0.25%
    const eyM_Dinero = sbcMensual * (0.00375 + 0.0025);

    // Invalidez y Vida: 0.625%
    const iyv = sbcMensual * 0.00625;

    // Cesantía y Vejez: 1.125%
    const cyv = sbcMensual * 0.01125;

    // Total IMSS
    return eyM_Excedente + eyM_Dinero + iyv + cyv;
};

export const calculateNet = (grossSalary) => {
    const isr = calculateISR(grossSalary);
    const imss = calculateIMSS(grossSalary);
    return {
        gross: grossSalary,
        net: grossSalary - isr - imss,
        isr,
        imss
    };
};

export const calculateGross = (targetNet) => {
    // Binary search to find Gross from Net
    let low = targetNet;
    let high = targetNet * 2; // Initial guess
    let steps = 0;

    // Expand high if needed
    while (calculateNet(high).net < targetNet && steps < 20) {
        high *= 1.5;
        steps++;
    }

    let gross = high;

    for (let i = 0; i < 50; i++) { // Precision iterations
        gross = (low + high) / 2;
        const result = calculateNet(gross);

        if (Math.abs(result.net - targetNet) < 0.01) {
            return result;
        }

        if (result.net < targetNet) {
            low = gross;
        } else {
            high = gross;
        }
    }

    return calculateNet(gross);
};
