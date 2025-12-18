// src/api.js
const FIPE_API_BASE = 'https://parallelum.com.br/fipe/api/v1';
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const SEARCH_ENGINE_ID = import.meta.env.VITE_SEARCH_ENGINE_ID;

const SVG_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'%3E%3Crect width='100%25' height='100%25' fill='%23eef2f9'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Lexend, sans-serif' font-size='24' fill='%239ca3af'%3EImagem não encontrada%3C/text%3E%3C/svg%3E";

export const api = {
  async getBrands(type) {
    return fetch(`${FIPE_API_BASE}/${type}/marcas`).then(r => r.json());
  },

  async getModels(type, brand) {
    return fetch(`${FIPE_API_BASE}/${type}/marcas/${brand}/modelos`).then(r => r.json());
  },

  async getYears(type, brand, model) {
    return fetch(`${FIPE_API_BASE}/${type}/marcas/${brand}/modelos/${model}/anos`).then(r => r.json());
  },

  async getVehicle(type, brand, model, year) {
    return fetch(`${FIPE_API_BASE}/${type}/marcas/${brand}/modelos/${model}/anos/${year}`).then(r => r.json());
  },

  async getVehicleImage(query) {
    if (!GOOGLE_API_KEY || !SEARCH_ENGINE_ID) {
      console.warn("⚠️ GOOGLE_API_KEY ou SEARCH_ENGINE_ID não configurados. Usando placeholder.");
      return SVG_PLACEHOLDER;
    }

    try {
      const endpoint = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${SEARCH_ENGINE_ID}&q=${encodeURIComponent(query)}&searchType=image&num=1&imgSize=large`;
      const res = await fetch(endpoint);
      const data = await res.json();

      if (data.items && data.items.length > 0) {
        return data.items[0].link;
      } else {
        return SVG_PLACEHOLDER;
      }
    } catch (error) {
      console.error("Erro ao buscar imagem:", error);
      return SVG_PLACEHOLDER;
    }
  }
};
