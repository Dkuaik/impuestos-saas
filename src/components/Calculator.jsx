import React, { useState, useEffect } from 'react';
import { calculateNet, calculateGross } from '../utils/taxCalculations';

const Calculator = () => {
    const [salary, setSalary] = useState('');
    const [period, setPeriod] = useState('monthly'); // monthly, biweekly
    const [calcType, setCalcType] = useState('grossToNet'); // grossToNet, netToGross
    const [results, setResults] = useState(null);

    const handleCalculate = () => {
        const salaryNum = parseFloat(salary);
        if (isNaN(salaryNum) || salaryNum < 0) {
            setResults(null);
            return;
        }

        // Convert input to monthly for calculation
        let monthlyInput = salaryNum;
        if (period === 'biweekly') {
            monthlyInput = salaryNum * 2;
        }

        let calculatedData;
        if (calcType === 'grossToNet') {
            calculatedData = calculateNet(monthlyInput);
        } else {
            calculatedData = calculateGross(monthlyInput);
        }

        // Convert results back to selected period
        const factor = period === 'biweekly' ? 0.5 : 1;

        setResults({
            gross: calculatedData.gross * factor,
            net: calculatedData.net * factor,
            isr: calculatedData.isr * factor,
            imss: calculatedData.imss * factor
        });
    };

    // Auto-calculate on changes if valid
    useEffect(() => {
        if (salary) handleCalculate();
    }, [salary, period, calcType]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(amount);
    };

    return (
        <div className="calculator-card">
            <div className="input-section">
                <div className="input-group">
                    <label htmlFor="salary">Ingreso {period === 'monthly' ? 'Mensual' : 'Quincenal'}</label>
                    <div className="input-wrapper">
                        <span className="currency-symbol">$</span>
                        <input
                            type="number"
                            id="salary"
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            value={salary}
                            onChange={(e) => setSalary(e.target.value)}
                        />
                    </div>
                </div>

                <div className="controls-row">
                    <div className="control-group">
                        <label>Tipo de Cálculo</label>
                        <div className="toggle-container">
                            <input
                                type="radio"
                                name="calcType"
                                id="grossToNet"
                                checked={calcType === 'grossToNet'}
                                onChange={() => setCalcType('grossToNet')}
                            />
                            <label htmlFor="grossToNet" className="toggle-btn">Bruto a Neto</label>

                            <input
                                type="radio"
                                name="calcType"
                                id="netToGross"
                                checked={calcType === 'netToGross'}
                                onChange={() => setCalcType('netToGross')}
                            />
                            <label htmlFor="netToGross" className="toggle-btn">Neto a Bruto</label>
                        </div>
                    </div>

                    <div className="control-group">
                        <label>Periodo</label>
                        <select
                            id="period"
                            value={period}
                            onChange={(e) => setPeriod(e.target.value)}
                        >
                            <option value="monthly">Mensual</option>
                            <option value="biweekly">Quincenal</option>
                        </select>
                    </div>
                </div>
            </div>

            {results && (
                <div className="results-section">
                    <div className="result-card main-result">
                        <h3>Sueldo <span id="resultLabel">{calcType === 'grossToNet' ? 'Neto' : 'Bruto'}</span></h3>
                        <div className="amount">
                            {formatCurrency(calcType === 'grossToNet' ? results.net : results.gross)}
                        </div>
                    </div>

                    <div className="breakdown">
                        <div className="breakdown-item">
                            <span>Ingreso {calcType === 'grossToNet' ? 'Bruto' : 'Neto Objetivo'}</span>
                            <span className="value">
                                {formatCurrency(calcType === 'grossToNet' ? results.gross : results.net)}
                            </span>
                        </div>
                        <div className="breakdown-item deduction">
                            <span>ISR (Impuesto sobre la Renta)</span>
                            <span className="value text-red">
                                {results.isr < 0 ? '+' : '-'}{formatCurrency(Math.abs(results.isr))}
                            </span>
                        </div>
                        <div className="breakdown-item deduction">
                            <span>IMSS (Cuotas Obrero)</span>
                            <span className="value text-red">
                                -{formatCurrency(results.imss)}
                            </span>
                        </div>
                        <div className="breakdown-item total-row">
                            <span>Total Deducciones</span>
                            <span className="value text-red">
                                -{formatCurrency(results.isr + results.imss)}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Calculator;
