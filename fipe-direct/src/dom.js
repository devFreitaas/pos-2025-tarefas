import { api } from "./api.js";

export function initFipeApp() {
  const selects = {
    type: document.getElementById('select-type'),
    brand: document.getElementById('select-brand'),
    model: document.getElementById('select-model'),
    year: document.getElementById('select-year'),
  };

  const resultElements = {
    image: document.getElementById('vehicle-image'),
    brand: document.getElementById('result-brand'),
    model: document.getElementById('result-model'),
    year: document.getElementById('result-year'),
    value: document.getElementById('result-value'),
  };

  const resultCard = document.getElementById('result-card');
  const selectionCard = document.getElementById('selection-card');
  const loader = document.getElementById('loader');
  const resultContent = document.getElementById('result-content');
  const resetButton = document.getElementById('reset-button');

  const state = { type: null, brand: null, model: null, year: null };

  const types = [
    { nome: 'Carros', codigo: 'carros' },
    { nome: 'Motos', codigo: 'motos' },
    { nome: 'Caminhões', codigo: 'caminhoes' },
  ];
  types.forEach(t => selects.type.add(new Option(t.nome, t.codigo)));

  selects.type.addEventListener('change', async (e) => {
    state.type = e.target.value;
    if (!state.type) return;
    const brands = await api.getBrands(state.type);
    updateSelect(selects.brand, brands, "2. Selecione a Marca");
    selects.model.innerHTML = `<option>3. Selecione o Modelo</option>`;
    selects.year.innerHTML = `<option>4. Selecione o Ano</option>`;
  });

  selects.brand.addEventListener('change', async (e) => {
    state.brand = e.target.value;
    const models = await api.getModels(state.type, state.brand);
    updateSelect(selects.model, models.modelos, "3. Selecione o Modelo");
  });

  selects.model.addEventListener('change', async (e) => {
    state.model = e.target.value;
    const years = await api.getYears(state.type, state.brand, state.model);
    updateSelect(selects.year, years, "4. Selecione o Ano");
  });

  selects.year.addEventListener('change', async (e) => {
    state.year = e.target.value;
    toggleView(true);
    loader.style.display = 'block';
    resultContent.style.display = 'none';

    const data = await api.getVehicle(state.type, state.brand, state.model, state.year);

    const query = `${data.Marca} ${data.Modelo} ${data.AnoModelo}`;
    const imageUrl = await api.getVehicleImage(query);

    resultElements.image.src = imageUrl;
    resultElements.brand.textContent = data.Marca;
    resultElements.model.textContent = data.Modelo;
    resultElements.year.textContent = data.AnoModelo;
    resultElements.value.textContent = data.Valor;

    loader.style.display = 'none';
    resultContent.style.display = 'block';
  });

  resetButton.addEventListener('click', () => {
    toggleView(false);
    selects.type.value = "";
    updateSelect(selects.brand, [], "2. Selecione a Marca");
    updateSelect(selects.model, [], "3. Selecione o Modelo");
    updateSelect(selects.year, [], "4. Selecione o Ano");
  });

  function updateSelect(select, data, placeholder) {
    select.innerHTML = `<option value="">${placeholder}</option>`;
    data.forEach(item => select.add(new Option(item.nome, item.codigo)));
    select.disabled = data.length === 0;
  }

  function toggleView(showResult) {
    selectionCard.classList.toggle('hidden-view', showResult);
    selectionCard.classList.toggle('visible-view', !showResult);
    resultCard.classList.toggle('hidden-view', !showResult);
    resultCard.classList.toggle('visible-view', showResult);
  }
}
