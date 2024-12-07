import resultRenderer from "./render-result.js";
import loading from "./loading.js";

const API_BASE_URL = "https://tunevault.onrender.com/api";

const fetchMetaContent = async (query) => {
  try {
    const response = await fetch(`${API_BASE_URL}/meta?query=${query}`);
    if (!response.ok) {
      throw new Error("Failed to fetch content info");
    }
    return await response.json();
  } catch (error) {
    throw Error(error.message);
  }
};

const downloadContent = (query) => {
  window.location.href = `${API_BASE_URL}/download?query=${query}`;
};

const renderError = (error) => {
  const mainSection = document.querySelector("#main-logic");
  mainSection.innerHTML = `
    <div class="error-container p-4 bg-red-100/10 border border-red-200/20 rounded-xl">
      <p class="text-red-500">${error.message}</p>
    </div>
  `;
};

const handleSubmit = async (query) => {
  if (!query) return;

  try {
    loading();
    const data = await fetchMetaContent(query);
    resultRenderer(data.data.videoItem[0]);
  } catch (error) {
    renderError(error);
    console.error("error in submitting", error);
  }
};

const setupEventListeners = () => {
  const submitButton = document.getElementById("submit-button");
  const inputBox = document.getElementById("tunevault-input-box");

  submitButton.addEventListener("click", () => {
    const query = inputBox.value.trim();
    handleSubmit(query);
  });
};

// Initial setup
window.addEventListener("DOMContentLoaded", (event) => {
  fetch(`${API_BASE_URL}/status`);
  setupEventListeners();
});

export { downloadContent };
