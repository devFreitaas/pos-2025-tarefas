(function () {
    const FIPE_API_BASE = 'https://parallelum.com.br/fipe/api/v1';
    const GOOGLE_API_KEY = 'nao esta funcionando pois aq estaria minhas api e eu nao vo expor isso';
    const SEARCH_ENGINE_ID = 'nao esta funcionando pois aq estaria minhas api e eu nao vo expor isso';

    const state = { type: null, brand: null, model: null, year: null };

    const ui = {
        selectionCard: document.getElementById('selection-card'),
        resultCard: document.getElementById('result-card'),
        loader: document.getElementById('loader'),
        resultContent: document.getElementById('result-content'),
        errorDisplay: document.getElementById('error-display'),
        resetButton: document.getElementById('reset-button'),
        selects: {
            type: document.getElementById('select-type'),
            brand: document.getElementById('select-brand'),
            model: document.getElementById('select-model'),
            year: document.getElementById('select-year'),
        },
        results: {
            image: document.getElementById('vehicle-image'),
            brand: document.getElementById('result-brand'),
            model: document.getElementById('result-model'),
            year: document.getElementById('result-year'),
            value: document.getElementById('result-value'),
        },
    };
    
    const SVG_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'%3E%3Crect width='100%25' height='100%25' fill='%23eef2f9'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Lexend, sans-serif' font-size='24' fill='%239ca3af'%3EImagem não encontrada%3C/text%3E%3C/svg%3E";

    const api = {
        async fetchWrapper(path, source = 'FIPE') {
            try {
                const response = await fetch(path);
                if (!response.ok) throw new Error(`HTTP Error ${response.status}`);
                return await response.json();
            } catch (error) {
                view.showError(`A API (${source}) falhou. Detalhe: ${error.message}`);
                throw error;
            }
        },
        async fetchVehicleImageUrl(query) {
            if (!GOOGLE_API_KEY || !SEARCH_ENGINE_ID || GOOGLE_API_KEY === 'SUA_CHAVE_API_DO_GOOGLE_AQUI') {
                console.error("Chaves da API do Google não configuradas.");
                return SVG_PLACEHOLDER;
            }
            try {
                const endpoint = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${SEARCH_ENGINE_ID}&q=${encodeURIComponent(query)}&searchType=image&num=1&imgSize=large`;
                const data = await this.fetchWrapper(endpoint, 'Google Imagens');
                if (data.items && data.items.length > 0) {
                    return data.items[0].link;
                }
                return SVG_PLACEHOLDER;
            } catch(error) {
                console.error(`Falha ao buscar imagem do Google: ${error.message}`);
                return SVG_PLACEHOLDER;
            }
        }
    };

    const view = {
        populateSelect(selectKey, data) {
            const select = ui.selects[selectKey];
            const defaultOptionText = select.firstElementChild.textContent;
            select.innerHTML = `<option value="">${defaultOptionText}</option>`;
            data.forEach(item => select.add(new Option(item.nome, item.codigo)));
            select.disabled = false;
        },
        resetSelectsFrom(startKey) {
            const keys = ['brand', 'model', 'year'];
            const startIndex = keys.indexOf(startKey);
            for (let i = startIndex; i < keys.length; i++) {
                const key = keys[i];
                const label = key.charAt(0).toUpperCase() + key.slice(1);
                ui.selects[key].innerHTML = `<option value="">${i + 2}. Selecione a ${label}</option>`;
                ui.selects[key].disabled = true;
            }
        },
        toggleView(showResult) {
            const addClass = showResult ? 'hidden-view' : 'visible-view';
            const removeClass = showResult ? 'visible-view' : 'hidden-view';
            ui.selectionCard.classList.replace(removeClass, addClass);
            ui.resultCard.classList.replace(addClass, removeClass);
        },
        toggleLoader(show) {
            ui.loader.style.display = show ? 'block' : 'none';
            ui.resultContent.style.display = show ? 'none' : 'block';
        },
        renderResult(data, imageUrl) {
            ui.results.image.src = imageUrl;
            ui.results.brand.textContent = data.Marca;
            ui.results.model.textContent = data.Modelo;
            ui.results.year.textContent = data.AnoModelo;
            ui.results.value.textContent = data.Valor;
        },
        showError(message) {
            ui.errorDisplay.textContent = message;
            ui.errorDisplay.classList.remove('hidden');
        },
        clearError() {
            ui.errorDisplay.classList.add('hidden');
        },
    };

    const controller = {
        async onTypeChange(e) {
            state.type = e.target.value;
            view.resetSelectsFrom('brand');
            if (!state.type) return;
            try {
                const brands = await api.fetchWrapper(`${FIPE_API_BASE}/${state.type}/marcas`);
                if (brands) view.populateSelect('brand', brands);
            } catch (error)
        },
        async onBrandChange(e) {
            state.brand = e.target.value;
            view.resetSelectsFrom('model');
            if (!state.brand) return;
            try {
                const data = await api.fetchWrapper(`${FIPE_API_BASE}/${state.type}/marcas/${state.brand}/modelos`);
                if (data && data.modelos) view.populateSelect('model', data.modelos);
            } catch (error)
        },
        async onModelChange(e) {
            state.model = e.target.value;
            view.resetSelectsFrom('year');
            if (!state.model) return;
            try {
                const years = await api.fetchWrapper(`${FIPE_API_BASE}/${state.type}/marcas/${state.brand}/modelos/${state.model}/anos`);
                if (years) view.populateSelect('year', years);
            } catch (error)
        },
        async onYearChange(e) {
            state.year = e.target.value;
            if (!state.year) return;
            try {
                view.toggleView(true);
                view.toggleLoader(true);
                
                const resultData = await api.fetchWrapper(`${FIPE_API_BASE}/${state.type}/marcas/${state.brand}/modelos/${state.model}/anos/${state.year}`);
                if(resultData) {
                    const imageQuery = `${resultData.Marca} ${resultData.Modelo} ${resultData.AnoModelo}`;
                    const imageUrl = await api.fetchVehicleImageUrl(imageQuery);
                    view.renderResult(resultData, imageUrl);
                    view.toggleLoader(false);
                }
            } catch (error) {
                setTimeout(() => view.toggleView(false), 2000);
            }
        },
        onReset() {
            view.toggleView(false);
            view.resetSelectsFrom('brand');
            ui.selects.type.value = '';
        },
        onImageError() {
            ui.results.image.src = SVG_PLACEHOLDER;
        }
    };

    function init() {
        view.clearError();
        const vehicleTypes = [ { nome: 'Carros', codigo: 'carros' }, { nome: 'Motos', codigo: 'motos' }, { nome: 'Caminhões', codigo: 'caminhoes' }];
        view.populateSelect('type', vehicleTypes);
        ui.selects.type.addEventListener('change', controller.onTypeChange);
        ui.selects.brand.addEventListener('change', controller.onBrandChange);
        ui.selects.model.addEventListener('change', controller.onModelChange);
        ui.selects.year.addEventListener('change', controller.onYearChange);
        ui.resetButton.addEventListener('click', controller.onReset);
        ui.results.image.addEventListener('error', controller.onImageError);
    }

    init();
})();