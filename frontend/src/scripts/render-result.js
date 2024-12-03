const mainLogicElement = document.getElementById("main-logic");
import { downloadContent } from "./index.js";

function renderResult(query, data) {
  const thumbnail = data.thumbnail || [];

  const innerHtml = `
    <section class="result-rendered w-full max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
      <div class="thumbnail-container relative aspect-video group">
        <picture class="w-full h-full">
          <img 
            src="${data.thumbnail.url}" 
            alt="${data.title || "Video thumbnail"}"
            width="${data.thumbnail.width}"
            height="${data.thumbnail.height}"
            class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="eager">
        </picture>
      </div>
      
      <div class="meta-container p-6 space-y-4">
        <div class="info-container">
          <h2 class="title text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 hover:line-clamp-none transition-all duration-300">
            ${data.title || "Untitled"}
          </h2>
        </div>
        
        <button
          class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
          id="download-button">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
          </svg>
          <span>Download</span>
        </button>
      </div>
    </section>
  `;

  mainLogicElement.innerHTML = innerHtml;

  const downloadButton = document.getElementById("download-button");
  downloadButton.addEventListener("click", handleDownload);

  function handleDownload(e) {
    e.preventDefault();
    downloadContent(query);
  }
}

export default renderResult;
