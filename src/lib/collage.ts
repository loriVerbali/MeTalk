import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import type { Category } from "../types";

export interface CollageOptions {
  title?: string;
  includeCategories?: boolean;
  tilesPerRow?: number;
  pageSize?: "A4" | "Letter";
}

export const generateCollagePDF = async (
  categories: Category[],
  composedTiles: Map<string, Blob>,
  options: CollageOptions = {}
): Promise<void> => {
  const {
    title = "My Feelings",
    includeCategories = true,
    tilesPerRow = 3,
    pageSize = "A4",
  } = options;

  // Create a temporary container for the collage
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.top = "0";
  container.style.width = "210mm"; // A4 width
  container.style.backgroundColor = "white";
  container.style.padding = "20mm";
  container.style.fontFamily = "Arial, sans-serif";

  document.body.appendChild(container);

  try {
    // Add title
    const titleEl = document.createElement("h1");
    titleEl.textContent = title;
    titleEl.style.textAlign = "center";
    titleEl.style.fontSize = "24px";
    titleEl.style.marginBottom = "30px";
    titleEl.style.color = "#2C3E50";
    container.appendChild(titleEl);

    // Add categories and tiles
    categories.forEach((category, categoryIndex) => {
      if (includeCategories) {
        const categoryTitle = document.createElement("h2");
        categoryTitle.textContent = category.label.en; // Use English for print
        categoryTitle.style.fontSize = "18px";
        categoryTitle.style.marginTop = categoryIndex > 0 ? "40px" : "0";
        categoryTitle.style.marginBottom = "20px";
        categoryTitle.style.color = "#34495E";
        categoryTitle.style.borderBottom = "2px solid #3498DB";
        categoryTitle.style.paddingBottom = "10px";
        container.appendChild(categoryTitle);
      }

      // Create grid for tiles
      const grid = document.createElement("div");
      grid.style.display = "grid";
      grid.style.gridTemplateColumns = `repeat(${tilesPerRow}, 1fr)`;
      grid.style.gap = "15px";
      grid.style.marginBottom = "30px";

      category.tiles.forEach((tile) => {
        const tileContainer = document.createElement("div");
        tileContainer.style.textAlign = "center";
        tileContainer.style.padding = "10px";
        tileContainer.style.border = "1px solid #E1E8ED";
        tileContainer.style.borderRadius = "8px";
        tileContainer.style.backgroundColor = "#F8F9FA";

        // Add image
        const img = document.createElement("img");
        const tileBlob = composedTiles.get(tile.key);
        if (tileBlob) {
          img.src = URL.createObjectURL(tileBlob);
          img.style.width = "120px";
          img.style.height = "120px";
          img.style.objectFit = "contain";
          img.style.display = "block";
          img.style.margin = "0 auto 10px";
        } else {
          // Fallback placeholder
          img.style.width = "120px";
          img.style.height = "120px";
          img.style.backgroundColor = "#E1E8ED";
          img.style.display = "block";
          img.style.margin = "0 auto 10px";
        }

        // Add label
        const label = document.createElement("div");
        label.textContent = tile.label.en;
        label.style.fontSize = "14px";
        label.style.fontWeight = "bold";
        label.style.color = "#2C3E50";
        label.style.wordWrap = "break-word";

        tileContainer.appendChild(img);
        tileContainer.appendChild(label);
        grid.appendChild(tileContainer);
      });

      container.appendChild(grid);
    });

    // Wait for images to load
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Generate canvas from HTML
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#FFFFFF",
      width: container.offsetWidth,
      height: container.offsetHeight,
    });

    // Create PDF
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: pageSize,
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    const imgY = 0;

    pdf.addImage(
      canvas.toDataURL("image/png"),
      "PNG",
      imgX,
      imgY,
      imgWidth * ratio,
      imgHeight * ratio
    );

    // Add footer text
    const footerText = "Made By Verbali.io";
    const footerFontSize = 10;
    const footerY = pdfHeight - 10;
    const footerX = (pdfWidth - pdf.getTextWidth(footerText)) / 2;

    pdf.setFontSize(footerFontSize);
    pdf.setTextColor(100, 100, 100); // Gray color
    pdf.text(footerText, footerX, footerY);

    // Open print dialog
    pdf.autoPrint();
    pdf.output("dataurlnewwindow");
  } finally {
    // Clean up
    document.body.removeChild(container);
  }
};

// Alternative: Generate collage as single image
export const generateCollageImage = async (
  categories: Category[],
  composedTiles: Map<string, Blob>,
  options: CollageOptions = {}
): Promise<Blob> => {
  const {
    title = "My Feelings",
    includeCategories = true,
    tilesPerRow = 4,
  } = options;

  // Create a temporary container
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.top = "0";
  container.style.width = "800px";
  container.style.backgroundColor = "white";
  container.style.padding = "40px";
  container.style.fontFamily = "Arial, sans-serif";

  document.body.appendChild(container);

  try {
    // Add title
    const titleEl = document.createElement("h1");
    titleEl.textContent = title;
    titleEl.style.textAlign = "center";
    titleEl.style.fontSize = "32px";
    titleEl.style.marginBottom = "40px";
    titleEl.style.color = "#2C3E50";
    container.appendChild(titleEl);

    // Add categories and tiles
    categories.forEach((category, categoryIndex) => {
      if (includeCategories) {
        const categoryTitle = document.createElement("h2");
        categoryTitle.textContent = category.label.en;
        categoryTitle.style.fontSize = "24px";
        categoryTitle.style.marginTop = categoryIndex > 0 ? "60px" : "0";
        categoryTitle.style.marginBottom = "30px";
        categoryTitle.style.color = "#34495E";
        categoryTitle.style.borderBottom = "3px solid #3498DB";
        categoryTitle.style.paddingBottom = "15px";
        container.appendChild(categoryTitle);
      }

      // Create grid for tiles
      const grid = document.createElement("div");
      grid.style.display = "grid";
      grid.style.gridTemplateColumns = `repeat(${tilesPerRow}, 1fr)`;
      grid.style.gap = "20px";
      grid.style.marginBottom = "40px";

      category.tiles.forEach((tile) => {
        const tileContainer = document.createElement("div");
        tileContainer.style.textAlign = "center";
        tileContainer.style.padding = "15px";
        tileContainer.style.border = "2px solid #E1E8ED";
        tileContainer.style.borderRadius = "12px";
        tileContainer.style.backgroundColor = "#F8F9FA";

        // Add image
        const img = document.createElement("img");
        const tileBlob = composedTiles.get(tile.key);
        if (tileBlob) {
          img.src = URL.createObjectURL(tileBlob);
          img.style.width = "150px";
          img.style.height = "150px";
          img.style.objectFit = "contain";
          img.style.display = "block";
          img.style.margin = "0 auto 15px";
        } else {
          // Fallback placeholder
          img.style.width = "150px";
          img.style.height = "150px";
          img.style.backgroundColor = "#E1E8ED";
          img.style.display = "block";
          img.style.margin = "0 auto 15px";
        }

        // Add label
        const label = document.createElement("div");
        label.textContent = tile.label.en;
        label.style.fontSize = "16px";
        label.style.fontWeight = "bold";
        label.style.color = "#2C3E50";
        label.style.wordWrap = "break-word";

        tileContainer.appendChild(img);
        tileContainer.appendChild(label);
        grid.appendChild(tileContainer);
      });

      container.appendChild(grid);
    });

    // Wait for images to load
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Generate canvas from HTML
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#FFFFFF",
      width: container.offsetWidth,
      height: container.offsetHeight,
    });

    // Convert to blob
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to create blob from canvas"));
          }
        },
        "image/png",
        0.95
      );
    });
  } finally {
    // Clean up
    document.body.removeChild(container);
  }
};
