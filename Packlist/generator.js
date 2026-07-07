
let csvData = [];

/* ---------------- LOGO ---------------- */
const logoImg = new Image();
logoImg.src = "./logo.svg";
logoImg.crossOrigin = "anonymous";

let logoReady = false;

logoImg.onload = () => {
  logoReady = true;

  // 🔥 trigger redraw once logo is actually ready
  generate();
};

/* ---------------- CSV ---------------- */
document.addEventListener("DOMContentLoaded", () => {
  const fileInput = document.getElementById("csvFile");

  fileInput.addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (!file || !window.Papa) return;

    Papa.parse(file, {
      skipEmptyLines: true,
      complete: (res) => {
        csvData = res.data || [];

        // ✅ AUTO GENERATE ON UPLOAD
        generate();
      }
    });
  });
});

/* ---------------- QR ---------------- */
function drawQR(text, size) {
  const qr = qrcode(0, 'M');
  qr.addData(String(text || ""));
  qr.make();

  const modules = qr.getModuleCount();
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = size;
  canvas.height = size;

  const scale = size / modules;

  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = "#000";

  for (let r = 0; r < modules; r++) {
    for (let c = 0; c < modules; c++) {
      if (qr.isDark(r, c)) {
        ctx.fillRect(c * scale, r * scale, scale, scale);
      }
    }
  }

  return canvas;
}

/* ---------------- PARSE ---------------- */
function parseCSV(rows) {
  const groups = new Map();
  const orphanItems = [];

  for (const row of rows) {
    if (!row || row.length < 2) continue;

    const [code, name, qty] = row;

    if (String(code).startsWith("INV")) {
      const id = String(code).replace("INV", "").trim();

      groups.set(id, {
        id,
        description: name || "",
        items: []
      });

      continue;
    }

    if (String(code).startsWith("LSM@")) {
      const deviceId = String(code).replace("LSM@", "").slice(0, 4);

      const item = { code, name, qty };

      if (groups.has(deviceId)) {
        groups.get(deviceId).items.push(item);
      } else {
        orphanItems.push(item);
      }
    }
  }

  return { groups, orphanItems };
}

/* ---------------- ITEM ---------------- */
function drawItem(ctx, x, y, qr, name, qty, indent = 0) {
  const size = 44;

  const qrCanvas = drawQR(qr, size);
  ctx.drawImage(qrCanvas, x + indent, y);

  ctx.fillStyle = "#000";
  ctx.font = "14px Arial";

  const textY = y + (size / 2) + 5;

  ctx.fillText(qty || "", x + 55 + indent, textY);
  ctx.fillText(name || "", x + 110 + indent, textY);
}

/* ---------------- GENERATE ---------------- */
function generate() {
  const canvas = document.getElementById("sheet");
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const packName = document.getElementById("packName").value;
  const packInfo = document.getElementById("packInfo").value;
  const packDate = document.getElementById("packDate").value;
  const packId = document.getElementById("packId").value;

  const topOffset = 80;
  const headerTop = topOffset;
  const sideSize = 100;

  if (logoReady) {
    ctx.drawImage(logoImg, canvas.width - sideSize - 40, headerTop, sideSize, sideSize);
  }

  const packQR = drawQR("inventory.lstudios-media.de/packinfo/" + packName, sideSize);
  ctx.drawImage(packQR, 40, headerTop);

  const textX = 40 + sideSize + 20;

  ctx.fillStyle = "#000";

  const qrCenterY = headerTop + sideSize / 2;

  ctx.font = "30px Arial Bold";
  ctx.fillText(packName || "", textX, qrCenterY - 28);
  ctx.font = "20px Arial";
  ctx.fillText(packInfo || "", textX, qrCenterY - 5);
  ctx.font = "14px Arial";
  ctx.fillText("Packaging ID: " + (packId || ""), textX, qrCenterY + 50);

  const metaX = textX + 260;
  ctx.fillText("Pack Date: " + (packDate || ""), metaX, qrCenterY + 50);

  const itemsStartY = headerTop + sideSize + 70;

  ctx.fillStyle = "#000";
  ctx.font = "18px Arial";
  ctx.fillText("Items", 40, itemsStartY);

  if (!csvData.length) return;

  const { groups, orphanItems } = parseCSV(csvData);

  const x = 40;
  const startY = itemsStartY + 40;
  const rowH = 60;

  let y = 0;

  for (const group of groups.values()) {
    const baseY = startY + y * rowH;

    const qrSize = 44;
    const groupQR = "LSM@INV" + group.id;

    const qrCanvas = drawQR(groupQR, qrSize);
    ctx.drawImage(qrCanvas, x, baseY);

    const textY = baseY + (qrSize / 2) + 5;

    ctx.font = "16px Arial";
    ctx.fillText(group.description || "", x + 55, textY);
    ctx.fillText(`(${group.items.length})`, x + 300, textY);

    y++;

    for (const item of group.items) {
      drawItem(ctx, x, startY + y * rowH, item.code, item.name, item.qty, 30);
      y++;
    }

    y++;
  }

  for (const item of orphanItems) {
    drawItem(ctx, x, startY + y * rowH, item.code, item.name, item.qty);
    y++;
  }

  ctx.font = "14px Arial";
  ctx.fillText("Page 1", canvas.width / 2 - 30, canvas.height - 40);
}

/* ---------------- PRINT ---------------- */
function printCanvas() {
  const canvas = document.getElementById("sheet");
  const w = window.open("");
  w.document.write(`<img src="${canvas.toDataURL()}" style="width:100%">`);
  w.print();
}

/* ---------------- PDF ---------------- */
function exportPDF() {
  const canvas = document.getElementById("sheet");
  const w = window.open("");
  w.document.write(`
    <html><body style="margin:0">
      <img src="${canvas.toDataURL()}" style="width:100%">
    </body></html>
  `);
  w.print();
}

window.addEventListener("DOMContentLoaded", () => {
  generate();
});

function attachAutoUpdate() {
  const inputs = [
    "packName",
    "packInfo",
    "packDate",
    "packId"
  ];

  inputs.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;

    el.addEventListener("input", generate);
    el.addEventListener("change", generate);
  });
}

window.addEventListener("DOMContentLoaded", () => {
  attachAutoUpdate();
  generate();
});