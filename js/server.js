const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { XMLParser } = require("fast-xml-parser");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
});

function toArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function safeNumber(value, fallback = 0) {
  if (value === null || value === undefined || value === "") return fallback;
  const normalized = String(value).replace(",", ".").replace(/[^\d.-]/g, "");
  const num = Number(normalized);
  return Number.isFinite(num) ? num : fallback;
}

function withMargin(basePrice) {
  const marginPercent = safeNumber(process.env.DEFAULT_MARGIN_PERCENT || 20, 20);
  const vatPercent = safeNumber(process.env.DEFAULT_VAT_PERCENT || 23, 23);

  const netto = safeNumber(basePrice, 0);
  const withMarginValue = netto * (1 + marginPercent / 100);
  const brutto = withMarginValue * (1 + vatPercent / 100);

  return Number(brutto.toFixed(2));
}

function normalizeProduct(raw, sourceName = "hurtownia") {
  const id =
    raw.id ||
    raw.product_id ||
    raw.sku ||
    raw.code ||
    raw.symbol ||
    raw.ean ||
    `${sourceName}-${Math.random().toString(36).slice(2, 10)}`;

  const name =
    raw.name ||
    raw.nazwa ||
    raw.title ||
    raw.product_name ||
    raw.nazwa_produktu ||
    "Produkt";

  const description =
    raw.description ||
    raw.opis ||
    raw.desc ||
    raw.long_description ||
    raw.short_description ||
    "";

  const category =
    raw.category ||
    raw.kategoria ||
    raw.category_name ||
    raw.group ||
    "inne";

  const image =
    raw.image ||
    raw.imageUrl ||
    raw.thumbnail ||
    raw.zdjecie ||
    raw.photo ||
    raw.img ||
    "";

  const stock =
    raw.stock ||
    raw.qty ||
    raw.quantity ||
    raw.ilosc ||
    raw.available ||
    0;

  const supplierPrice =
    raw.price_net ||
    raw.net_price ||
    raw.cena_netto ||
    raw.price ||
    raw.cena ||
    0;

  return {
    id: String(id),
    nazwa: String(name),
    cena: withMargin(supplierPrice),
    cena_zakupu: safeNumber(supplierPrice, 0),
    opis: String(description),
    kategoria: String(category).toLowerCase(),
    zdjecie: String(image),
    stan: safeNumber(stock, 0),
    zrodlo: sourceName,
  };
}

async function fetchJsonFeed(url, sourceName) {
  const response = await axios.get(url, { timeout: 20000 });
  const data = response.data;

  let products = [];

  if (Array.isArray(data)) {
    products = data;
  } else if (Array.isArray(data.products)) {
    products = data.products;
  } else if (Array.isArray(data.items)) {
    products = data.items;
  } else if (Array.isArray(data.data)) {
    products = data.data;
  } else {
    products = [];
  }

  return products.map((item) => normalizeProduct(item, sourceName));
}

function extractXmlProducts(parsed) {
  if (!parsed || typeof parsed !== "object") return [];

  const candidates = [
    parsed.products?.product,
    parsed.offer?.products?.product,
    parsed.oferta?.produkty?.produkt,
    parsed.catalog?.product,
    parsed.katalog?.produkt,
    parsed.root?.products?.product,
    parsed.root?.product,
  ];

  for (const candidate of candidates) {
    const arr = toArray(candidate);
    if (arr.length) return arr;
  }

  return [];
}

async function fetchXmlFeed(url, sourceName) {
  const response = await axios.get(url, { timeout: 20000 });
  const parsed = parser.parse(response.data);
  const products = extractXmlProducts(parsed);
  return products.map((item) => normalizeProduct(item, sourceName));
}

function parseCsvLine(line) {
  const result = [];
  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    const next = line[i + 1];

    if (ch === '"') {
      if (insideQuotes && next === '"') {
        current += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (ch === ";" && !insideQuotes) {
      result.push(current.trim());
      current = "";
    } else if (ch === "," && !insideQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }

  result.push(current.trim());
  return result;
}

async function fetchCsvFeed(url, sourceName) {
  const response = await axios.get(url, { timeout: 20000 });
  const text = String(response.data || "").trim();

  if (!text) return [];

  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase());

  const products = lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row = {};

    headers.forEach((header, index) => {
      row[header] = values[index] ?? "";
    });

    return normalizeProduct(row, sourceName);
  });

  return products;
}

async function fetchSupplierFeed(url, sourceName) {
  const lowered = url.toLowerCase();

  if (lowered.endsWith(".json")) {
    return fetchJsonFeed(url, sourceName);
  }

  if (lowered.endsWith(".xml")) {
    return fetchXmlFeed(url, sourceName);
  }

  if (lowered.endsWith(".csv")) {
    return fetchCsvFeed(url, sourceName);
  }

  try {
    return await fetchJsonFeed(url, sourceName);
  } catch {
    try {
      return await fetchXmlFeed(url, sourceName);
    } catch {
      return await fetchCsvFeed(url, sourceName);
    }
  }
}

function dedupeProducts(products) {
  const map = new Map();

  for (const product of products) {
    const key =
      product.id ||
      product.ean ||
      `${product.nazwa}-${product.zrodlo}`.toLowerCase();

    if (!map.has(key)) {
      map.set(key, product);
      continue;
    }

    const existing = map.get(key);

    if ((product.stan || 0) > (existing.stan || 0)) {
      map.set(key, product);
    }
  }

  return Array.from(map.values());
}

async function loadAllSupplierProducts() {
  const feeds = [
    { name: "hurtownia_1", url: process.env.SUPPLIER_1_URL },
    { name: "hurtownia_2", url: process.env.SUPPLIER_2_URL },
    { name: "hurtownia_3", url: process.env.SUPPLIER_3_URL },
    { name: "hurtownia_4", url: process.env.SUPPLIER_4_URL },
    { name: "hurtownia_5", url: process.env.SUPPLIER_5_URL },
  ].filter((feed) => feed.url);

  if (!feeds.length) {
    return [];
  }

  const results = await Promise.allSettled(
    feeds.map((feed) => fetchSupplierFeed(feed.url, feed.name))
  );

  const allProducts = [];
  const errors = [];

  results.forEach((result, index) => {
    const feed = feeds[index];

    if (result.status === "fulfilled") {
      allProducts.push(...result.value);
    } else {
      errors.push({
        hurtownia: feed.name,
        blad: result.reason?.message || "Nieznany błąd",
      });
    }
  });

  return {
    products: dedupeProducts(allProducts),
    errors,
  };
}

app.get("/", (req, res) => {
  res.send("API działa 🚀");
});

app.get("/api/products", async (req, res) => {
  try {
    const result = await loadAllSupplierProducts();

    if (Array.isArray(result)) {
      return res.json(result);
    }

    return res.json(result.products);
  } catch (error) {
    console.error("Błąd /api/products:", error.message);
    return res.status(500).json({
      error: "Nie udało się pobrać produktów z hurtowni",
      details: error.message,
    });
  }
});

app.get("/api/sync-status", async (req, res) => {
  try {
    const result = await loadAllSupplierProducts();

    if (Array.isArray(result)) {
      return res.json({
        productsCount: result.length,
        errors: [],
      });
    }

    return res.json({
      productsCount: result.products.length,
      errors: result.errors,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Błąd synchronizacji",
      details: error.message,
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("Serwer działa na porcie " + PORT);
});
