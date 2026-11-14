const PALETTE_SIZE = 5;
const STORAGE_KEY = "color-palette-generator-saves";

const paletteGrid = document.getElementById("paletteGrid");
const generateButton = document.getElementById("generateButton");
const saveButton = document.getElementById("saveButton");
const savedList = document.getElementById("savedList");
const savedCount = document.getElementById("savedCount");
const emptyState = document.getElementById("emptyState");
const toast = document.getElementById("toast");

let colors = [];
let savedPalettes = loadSavedPalettes();
let toastTimer = null;

function randomChannel() {
  return Math.floor(Math.random() * 256);
}

function randomHex() {
  return `#${[randomChannel(), randomChannel(), randomChannel()].map((value) => value.toString(16).padStart(2, "0")).join("")}`.toUpperCase();
}

function isValidHex(value) {
  return /^#[0-9A-F]{6}$/i.test(value);
}

function hexToRgb(hex) {
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16)
  };
}

function luminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

function createColor(value = randomHex(), locked = false) {
  return { value: value.toUpperCase(), locked };
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 1600);
}

function loadSavedPalettes() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item) => Array.isArray(item.colors) && item.colors.length === PALETTE_SIZE && item.colors.every(isValidHex))
      .map((item) => ({ id: String(item.id), colors: item.colors.map((color) => color.toUpperCase()) }));
  } catch (error) {
    return [];
  }
}

function saveSavedPalettes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(savedPalettes));
}

function renderPalette() {
  paletteGrid.innerHTML = "";
  colors.forEach((color, index) => {
    const card = document.createElement("article");
    const textTheme = luminance(color.value) < 0.48 ? "dark" : "light";
    card.className = `color-card ${textTheme}`;
    card.style.backgroundColor = color.value;
    card.dataset.index = String(index);

    const topLine = document.createElement("div");
    topLine.className = "color-topline";

    const colorIndex = document.createElement("span");
    colorIndex.className = "color-index";
    colorIndex.textContent = `COLOR ${index + 1}`;

    const lockButton = document.createElement("button");
    lockButton.className = "icon-button lock-button";
    lockButton.type = "button";
    lockButton.textContent = color.locked ? "🔒" : "🔓";
    lockButton.setAttribute("aria-label", color.locked ? `Unlock color ${index + 1}` : `Lock color ${index + 1}`);
    lockButton.setAttribute("aria-pressed", String(color.locked));
    lockButton.addEventListener("click", () => toggleLock(index));

    const details = document.createElement("div");
    details.className = "color-details";

    const hex = document.createElement("strong");
    hex.className = "hex-code";
    hex.textContent = color.value;

    const copyButton = document.createElement("button");
    copyButton.className = "copy-button";
    copyButton.type = "button";
    copyButton.textContent = "Copy hex";
    copyButton.addEventListener("click", () => copyColor(index));

    topLine.append(colorIndex, lockButton);
    details.append(hex, copyButton);
    card.append(topLine, details);
    paletteGrid.appendChild(card);
  });
}

function renderSaved() {
  savedList.innerHTML = "";
  savedCount.textContent = `${savedPalettes.length} saved`;
  emptyState.hidden = savedPalettes.length > 0;

  savedPalettes.forEach((palette, paletteIndex) => {
    const item = document.createElement("article");
    item.className = "saved-palette";

    const swatches = document.createElement("div");
    swatches.className = "saved-swatches";
    swatches.setAttribute("aria-label", `Saved palette ${paletteIndex + 1}: ${palette.colors.join(", ")}`);
    palette.colors.forEach((color) => {
      const swatch = document.createElement("span");
      swatch.style.backgroundColor = color;
      swatch.title = color;
      swatches.appendChild(swatch);
    });

    const actions = document.createElement("div");
    actions.className = "saved-actions";

    const applyButton = document.createElement("button");
    applyButton.className = "small-button apply-button";
    applyButton.type = "button";
    applyButton.textContent = "Apply";
    applyButton.addEventListener("click", () => applyPalette(palette.id));

    const deleteButton = document.createElement("button");
    deleteButton.className = "small-button delete-button";
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => deletePalette(palette.id));

    actions.append(applyButton, deleteButton);
    item.append(swatches, actions);
    savedList.appendChild(item);
  });
}

function generatePalette() {
  colors = colors.map((color) => color.locked ? color : createColor());
  renderPalette();
}

function toggleLock(index) {
  colors[index].locked = !colors[index].locked;
  renderPalette();
}

async function copyColor(index) {
  const value = colors[index].value;
  try {
    await navigator.clipboard.writeText(value);
    showToast(`${value} copied`);
  } catch (error) {
    showToast(`Copy unavailable: ${value}`);
  }
}

function saveCurrentPalette() {
  savedPalettes.unshift({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    colors: colors.map((color) => color.value)
  });
  saveSavedPalettes();
  renderSaved();
  showToast("Palette saved");
}

function applyPalette(id) {
  const palette = savedPalettes.find((item) => item.id === id);
  if (!palette) return;
  colors = palette.colors.map((color) => createColor(color));
  renderPalette();
  showToast("Palette applied");
}

function deletePalette(id) {
  savedPalettes = savedPalettes.filter((item) => item.id !== id);
  saveSavedPalettes();
  renderSaved();
  showToast("Palette deleted");
}

function setColors(values) {
  if (!Array.isArray(values) || values.length !== PALETTE_SIZE || !values.every(isValidHex)) return false;
  colors = values.map((value) => createColor(value));
  renderPalette();
  return true;
}

generateButton.addEventListener("click", generatePalette);
saveButton.addEventListener("click", saveCurrentPalette);
document.addEventListener("keydown", (event) => {
  const tagName = document.activeElement?.tagName;
  if (event.code === "Space" && tagName !== "BUTTON" && tagName !== "INPUT" && tagName !== "TEXTAREA") {
    event.preventDefault();
    generatePalette();
  }
});

colors = Array.from({ length: PALETTE_SIZE }, () => createColor());
renderPalette();
renderSaved();

window.paletteGenerator = {
  getState() {
    return {
      colors: colors.map((color) => ({ ...color })),
      saved: savedPalettes.map((palette) => ({ id: palette.id, colors: [...palette.colors] }))
    };
  },
  setColors
};
