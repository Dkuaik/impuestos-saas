import Calculator from './components/Calculator'

function App() {
    return (
        <>
            <div className="background-blobs">
                <div className="blob blob-1"></div>
                <div className="blob blob-2"></div>
                <div className="blob blob-3"></div>
            </div>

            <main className="container">
                <header className="header">
                    <h1>Calculadora de Impuestos <span className="highlight">México 2025</span></h1>
                    <p className="subtitle">Desglose detallado de ISR e IMSS</p>
                </header>

                <Calculator />

                <section className="info-section">
                    <h2>Referencias Importantes</h2>
                    <div className="info-grid">
                        <div className="info-card">
                            <h3><a href="https://www.sat.gob.mx/" target="_blank" rel="noopener noreferrer">ISR 2025</a></h3>
                            <p>Cálculo basado en las tablas mensuales vigentes para 2025 (similares a 2024).</p>
                        </div>
                        <div className="info-card">
                            <h3><a href="https://www.imss.gob.mx/" target="_blank" rel="noopener noreferrer">IMSS 2025</a></h3>
                            <p>Incluye cuotas obreras para Enfermedades y Maternidad, Invalidez y Vida, y Cesantía y Vejez.</p>
                        </div>
                        <div className="info-card">
                            <h3><a href="https://www.inegi.org.mx/temas/uma/" target="_blank" rel="noopener noreferrer">UMA</a></h3>
                            <p>Valor estimado UMA 2025: <strong>$108.57 MXN</strong> (Base 2024)</p>
                        </div>
                    </div>
                </section>
            </main>
        </>
    )
}

export default App
