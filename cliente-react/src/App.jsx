import { useState } from 'react';
import { api } from './api';
import './App.css';

function App() {
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [years, setYears] = useState([]);

  const [selectedType, setSelectedType] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const types = [
    { nome: 'Carros', codigo: 'carros' },
    { nome: 'Motos', codigo: 'motos' },
    { nome: 'Caminhões', codigo: 'caminhoes' },
  ];

  const handleTypeChange = async (e) => {
    const type = e.target.value;
    setSelectedType(type);
    setBrands([]); setModels([]); setYears([]);
    setSelectedBrand(''); setSelectedModel(''); setSelectedYear('');
    
    if (type) {
      try {
        const data = await api.getBrands(type);
        setBrands(data);
      } catch (err) { setError('Erro ao buscar marcas'); }
    }
  };

  const handleBrandChange = async (e) => {
    const brand = e.target.value;
    setSelectedBrand(brand);
    setModels([]); setYears([]);
    setSelectedModel(''); setSelectedYear('');

    if (brand) {
      try {
        const data = await api.getModels(selectedType, brand);
        setModels(data.modelos || []);
      } catch (err) { setError('Erro ao buscar modelos'); }
    }
  };

  const handleModelChange = async (e) => {
    const model = e.target.value;
    setSelectedModel(model);
    setYears([]);
    setSelectedYear('');

    if (model) {
      try {
        const data = await api.getYears(selectedType, selectedBrand, model);
        setYears(data);
      } catch (err) { setError('Erro ao buscar anos'); }
    }
  };

  const handleYearChange = async (e) => {
    const year = e.target.value;
    setSelectedYear(year);

    if (year) {
      setLoading(true);
      setResult({});
      
      try {
        const data = await api.getVehicle(selectedType, selectedBrand, selectedModel, year);
        const query = `${data.Marca} ${data.Modelo} ${data.AnoModelo}`;
        const imageUrl = await api.getVehicleImage(query);
        
        setResult({ ...data, imageUrl });
      } catch (err) {
        setError('Erro ao buscar dados finais.');
        setResult(null);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleReset = () => {
    setResult(null);
    setSelectedType('');
    setSelectedBrand('');
    setSelectedModel('');
    setSelectedYear('');
    setBrands([]);
    setModels([]);
    setYears([]);
  };

  return (
    <main className="w-full max-w-lg relative">
      
      {}
      <div 
        id="selection-card" 
        className={`card rounded-2xl p-8 md:p-10 transition-all duration-500 ${result ? 'hidden-view' : 'visible-view'}`}
      >
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">FIPE Direct</h1>
          <p className="text-gray-500 mt-1">Simples, rápido e sem complicações.</p>
        </header>
        
        <div className="space-y-6">
          <div className="fade-in" style={{ animationDelay: '100ms' }}>
            <select className="w-full p-4 border-none rounded-xl text-gray-700 form-select focus:outline-none"
              value={selectedType} onChange={handleTypeChange}>
              <option value="">1. Selecione o Tipo</option>
              {types.map(t => <option key={t.codigo} value={t.codigo}>{t.nome}</option>)}
            </select>
          </div>
          
          <div className="fade-in" style={{ animationDelay: '200ms' }}>
            <select className="w-full p-4 border-none rounded-xl text-gray-700 form-select focus:outline-none"
              value={selectedBrand} onChange={handleBrandChange} disabled={!brands.length}>
              <option value="">2. Selecione a Marca</option>
              {brands.map(b => <option key={b.codigo} value={b.codigo}>{b.nome}</option>)}
            </select>
          </div>

          <div className="fade-in" style={{ animationDelay: '300ms' }}>
            <select className="w-full p-4 border-none rounded-xl text-gray-700 form-select focus:outline-none"
              value={selectedModel} onChange={handleModelChange} disabled={!models.length}>
              <option value="">3. Selecione o Modelo</option>
              {models.map(m => <option key={m.codigo} value={m.codigo}>{m.nome}</option>)}
            </select>
          </div>

          <div className="fade-in" style={{ animationDelay: '400ms' }}>
            <select className="w-full p-4 border-none rounded-xl text-gray-700 form-select focus:outline-none"
              value={selectedYear} onChange={handleYearChange} disabled={!years.length}>
              <option value="">4. Selecione o Ano</option>
              {years.map(y => <option key={y.codigo} value={y.codigo}>{y.nome}</option>)}
            </select>
          </div>
        </div>
        
        {error && <div className="mt-6 text-center text-red-600 bg-red-100 p-3 rounded-lg text-sm border border-red-200">{error}</div>}
      </div>

      {}
      <div 
        id="result-card" 
        className={`card rounded-2xl absolute top-0 w-full transition-all duration-500 ${result ? 'visible-view' : 'hidden-view'}`}
      >
        {}
        {loading && (
          <div className="p-20 text-center">
            <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <p className="mt-4 text-gray-500">Buscando informações...</p>
          </div>
        )}

        {}
        {!loading && result && result.Valor && (
          <div>
            <img src={result.imageUrl} alt="Imagem do Veículo" className="w-full h-56 object-cover rounded-t-2xl bg-gray-200" />
            <div className="p-8 text-center">
              <p className="font-semibold text-blue-600 fade-in">{result.Marca}</p>
              <h2 className="text-2xl font-bold text-gray-800 mt-1 fade-in" style={{ animationDelay: '100ms' }}>{result.Modelo}</h2>
              <p className="text-gray-500 fade-in" style={{ animationDelay: '200ms' }}>{result.AnoModelo}</p>
              
              <div className="mt-6 pt-6 border-t border-gray-300 fade-in" style={{ animationDelay: '300ms' }}>
                <p className="text-4xl font-extrabold text-green-600">{result.Valor}</p>
                <p className="text-sm text-gray-400">Valor Tabela FIPE</p>
              </div>
              
              <button onClick={handleReset} className="mt-8 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                Nova Consulta
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default App;