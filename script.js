/* Ahmedi Plaster of Paris – Quotation Generator (vanilla JS, runs fully in the browser) */
'use strict';

const BUSINESS = {
    name: 'Ahmedi Plaster of Paris',
    address: 'House No. 42, Amber Tower, Sarkhej Road, Ahmedabad – 380055',
    addressLine1: 'House No.42, Amber Tower, Sarkhej Road',
    addressLine2: 'Ahmedabad - 380055',
    mobile: '+91 9737766953'
};

const SAMPLE_ITEMS = [
    { description: 'Gypsum Ceiling', sqf: '1200', rate: '85' },
    { description: 'Gypsum Ceiling Back Area', sqf: '80', rate: '85' },
    { description: 'Gypsum Ceiling Side Area', sqf: '25', rate: '85' },
    { description: 'Beam Leveling', sqf: '115', rate: '85' }
];

let items = [];   // { id, description, sqf, rate } – sqf/rate kept as strings from inputs
let nextId = 1;

const $ = (id) => document.getElementById(id);

/* ---------- helpers ---------- */

// Safe number: returns 0 for empty, NaN, negative or non-finite values
function toNumber(value) {
    const n = parseFloat(value);
    return Number.isFinite(n) && n >= 0 ? n : 0;
}

// Round to 2 decimals to avoid floating point noise (e.g. 0.1 × 3)
function round2(n) { return Math.round((n + Number.EPSILON) * 100) / 100; }

function itemAmount(item) { return round2(toNumber(item.sqf) * toNumber(item.rate)); }
function grandTotal() { return round2(items.reduce((sum, it) => sum + itemAmount(it), 0)); }

// Indian numbering, e.g. 120700 -> 1,20,700
function formatIN(n) {
    return n.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}
const rupee = (n) => '₹' + formatIN(n);        // for the website

function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function todayISO() {
    const d = new Date();
    const pad = (x) => String(x).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function generateQuoteNo() {
    const d = new Date();
    const pad = (x) => String(x).padStart(2, '0');
    return `Q-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
}

function formatDateDisplay(iso) {
    if (!iso) return '';
    const [y, m, d] = iso.split('-');
    return `${d}-${m}-${y}`;
}

/* ---------- item table ---------- */

function addItem(data) {
    items.push({ id: nextId++, description: '', sqf: '', rate: '', ...(data || {}) });
    renderItems();
    refresh();
}

function removeItem(id) {
    items = items.filter((it) => it.id !== id);
    renderItems();
    refresh();
}

// Rebuilds rows (used on add/remove only, so typing never loses focus)
function renderItems() {
    const body = $('itemsBody');
    body.innerHTML = '';
    items.forEach((it, index) => {
        const tr = document.createElement('tr');
        tr.dataset.id = it.id;
        tr.innerHTML = `
      <td class="serial">${index + 1}</td>
      <td><input type="text" class="form-control" data-field="description" placeholder="Work description" value="${escapeHtml(it.description)}"></td>
      <td><input type="number" class="form-control" data-field="sqf" min="0" step="any" inputmode="decimal" value="${escapeHtml(it.sqf)}"></td>
      <td><input type="number" class="form-control" data-field="rate" min="0" step="any" inputmode="decimal" value="${escapeHtml(it.rate)}"></td>
      <td class="amount-cell">${rupee(itemAmount(it))}</td>
      <td><button type="button" class="btn btn-sm btn-outline-danger" data-remove="${it.id}">Remove</button></td>`;
        body.appendChild(tr);
    });
}

// Handles typing in any row input
function onItemInput(e) {
    const input = e.target;
    const row = input.closest('tr');
    if (!row || !input.dataset.field) return;
    const item = items.find((it) => it.id === Number(row.dataset.id));
    if (!item) return;

    if (input.type === 'number') {
        const invalid = input.value !== '' && !(parseFloat(input.value) >= 0); // negative or invalid
        input.classList.toggle('is-invalid', invalid);
        item[input.dataset.field] = invalid ? '' : input.value;
    } else {
        item[input.dataset.field] = input.value;
    }
    row.querySelector('.amount-cell').textContent = rupee(itemAmount(item));
    refresh();
}

/* ---------- totals and preview ---------- */

function getCustomer() {
    return {
        name: $('custName').value.trim(),
        address: $('custAddress').value.trim(),
        mobile: $('custMobile').value.trim(),
        date: $('quoteDate').value,
        quoteNo: $('quoteNo').value.trim()
    };
}

function refresh() {
    $('totalAmount').textContent = rupee(grandTotal());
    document.querySelectorAll('#itemsBody .serial').forEach((cell, i) => { cell.textContent = i + 1; });
    renderPreview();
}

function renderPreview() {
    const c = getCustomer();
    const rows = items.map((it, i) => `
    <tr><td>${i + 1}</td><td>${escapeHtml(it.description) || '&nbsp;'}</td>
    <td class="num">${formatIN(toNumber(it.sqf))}</td><td class="num">${formatIN(toNumber(it.rate))}</td>
    <td class="num">${formatIN(itemAmount(it))}</td></tr>`).join('');
    $('preview').innerHTML = `
    <div class="pv-name">${escapeHtml(BUSINESS.name)}</div>
    <div class="pv-sub">${escapeHtml(BUSINESS.address)}<br>${escapeHtml(BUSINESS.mobile)}</div>
    <hr class="my-2">
    <div class="d-flex justify-content-between"><span>No: ${escapeHtml(c.quoteNo) || '—'}</span><span>${escapeHtml(formatDateDisplay(c.date))}</span></div>
    <div class="mt-1"><strong>To:</strong> ${escapeHtml(c.name) || '—'}</div>
    ${c.address ? `<div>${escapeHtml(c.address)}</div>` : ''}
    ${c.mobile ? `<div>Mobile: ${escapeHtml(c.mobile)}</div>` : ''}
    <table><thead><tr><th>#</th><th>Item</th><th>SQF</th><th>Rate</th><th>Amount</th></tr></thead><tbody>${rows}</tbody></table>
    <div class="pv-total"><span>Total Amount</span><span>${rupee(grandTotal())}</span></div>`;
}

/* ---------- validation ---------- */

function showAlert(msg) {
    const box = $('formAlert');
    box.textContent = msg;
    box.classList.remove('d-none');
    box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
function hideAlert() { $('formAlert').classList.add('d-none'); }

// Returns true when all required data is present
function validateForm() {
    hideAlert();
    const problems = [];
    [['custName', 'customer name'], ['quoteDate', 'quotation date'], ['quoteNo', 'quotation number']].forEach(([id, label]) => {
        const empty = !$(id).value.trim();
        $(id).classList.toggle('is-invalid', empty);
        if (empty) problems.push(label);
    });
    if (!items.length) problems.push('at least one item');
    else if (items.some((it) => !it.description.trim())) problems.push('a description for every item');
    if (items.length && items.some((it) => document.querySelector('.is-invalid[data-field]'))) problems.push('valid (non-negative) numbers');

    if (problems.length) {
        showAlert('Please add: ' + problems.join(', ') + '.');
        return false;
    }
    return true;
}

/* ---------- PDF ---------- */

/* Builds a Letter-size PDF that copies the layout of the Excel quotation:
   one outer box, centred business header, Mobile/Date row, Name row, bordered
   table padded with blank rows, TOTAL AMOUNT row at the bottom. */
function downloadPDF() {
    if (!validateForm()) return;
    if (!window.jspdf || !window.jspdf.jsPDF) {
        showAlert('The PDF library did not load. Check your internet connection and reload the page.');
        return;
    }
    const c = getCustomer();
    const doc = new window.jspdf.jsPDF({ unit: 'mm', format: 'letter', orientation: 'portrait' });
    const pageW = doc.internal.pageSize.getWidth();   // 215.9 mm
    const pageH = doc.internal.pageSize.getHeight();  // 279.4 mm

    // Geometry measured from the original Excel PDF
    const L = 10.8, W = pageW - 2 * L, R = L + W, TOP = 19;
    const HEADER_H = 44.4, ROW_H = 7.6, LINE_H = 4.4, PAD = 1.6, PAGE_ROWS = 21;
    const colW = [27.3, 73, 27.3, 38.4];
    colW.push(W - colW.reduce((a, b) => a + b, 0));
    const colX = [L];
    colW.forEach((w, i) => colX.push(colX[i] + w));

    const hasExtra = !!(c.address || c.mobile);                 // optional address/mobile row
    const bodyCapacity = (PAGE_ROWS - (hasExtra ? 1 : 0)) * ROW_H;

    const hline = (y) => doc.line(L, y, R, y);
    const vline = (x, y1, y2) => doc.line(x, y1, x, y2);
    // Shrinks text until it fits the width (min 7 pt)
    const fitText = (text, x, y, maxW, opts) => {
        let size = 11;
        doc.setFontSize(size);
        while (size > 7 && doc.getTextWidth(text) > maxW) { size -= 0.5; doc.setFontSize(size); }
        doc.text(text, x, y, opts);
        doc.setFontSize(11);
    };

    // Pre-compute row heights (long descriptions wrap onto extra lines) and split into pages
    doc.setFont('helvetica', 'normal').setFontSize(11);
    const rows = items.map((it, i) => {
        const lines = doc.splitTextToSize(it.description.trim(), colW[1] - 4);
        return {
            sno: i + 1, lines, sqf: formatIN(toNumber(it.sqf)), rate: formatIN(toNumber(it.rate)),
            amount: formatIN(itemAmount(it)), h: Math.max(ROW_H, lines.length * LINE_H + 2 * PAD)
        };
    });
    const pages = [];
    let current = { rows: [], h: 0 };
    rows.forEach((r) => {
        if (current.rows.length && current.h + r.h > bodyCapacity) { pages.push(current); current = { rows: [], h: 0 }; }
        current.rows.push(r); current.h += r.h;
    });
    pages.push(current);

    pages.forEach((page, pi) => {
        if (pi > 0) doc.addPage();
        const isLast = pi === pages.length - 1;
        doc.setDrawColor(0).setTextColor(0).setLineWidth(0.35);

        // Business header block
        doc.setFont('helvetica', 'normal').setFontSize(11);
        doc.text('Quotation', pageW / 2, TOP + 8.1, { align: 'center' });
        doc.setFont('helvetica', 'bold').setFontSize(17);
        doc.text(BUSINESS.name, pageW / 2, TOP + 17.6, { align: 'center' });
        doc.setFont('helvetica', 'normal').setFontSize(11);
        doc.text('Add. ' + BUSINESS.addressLine1, pageW / 2, TOP + 26.5, { align: 'center' });
        doc.text(BUSINESS.addressLine2, pageW / 2, TOP + 34.7, { align: 'center' });

        // Mobile + date row
        let y = TOP + HEADER_H;
        hline(y);
        doc.text('Mobile No. ' + BUSINESS.mobile, L + 0.8, y + 5.3);
        doc.text('Date : ' + formatDateDisplay(c.date).replace(/-/g, '/'), L + 138.7, y + 5.3);
        y += ROW_H; hline(y);

        // Customer name row (quotation number on the right)
        fitText('Name : ' + c.name, L + 0.8, y + 5.3, W * 0.58);
        fitText('Quotation No. : ' + c.quoteNo, R - 1.5, y + 5.3, W * 0.36, { align: 'right' });
        y += ROW_H; hline(y);

        // Optional address / mobile row
        if (hasExtra) {
            const parts = [];
            if (c.address) parts.push('Address : ' + c.address);
            if (c.mobile) parts.push('Mobile : ' + c.mobile);
            fitText(parts.join('     '), L + 0.8, y + 5.3, W - 3);
            y += ROW_H; hline(y);
        }

        // Table heading
        const tableTop = y;
        doc.setFont('helvetica', 'bold');
        ['S No.', 'Item Description', 'SQF.', 'RATE', 'AMOUNT'].forEach((t, i) =>
            doc.text(t, colX[i] + colW[i] / 2, y + 5.3, { align: 'center' }));
        doc.setFont('helvetica', 'normal');
        y += ROW_H; hline(y);

        // Item rows
        const bodyTop = y;
        page.rows.forEach((r) => {
            const firstBase = y + (r.h - r.lines.length * LINE_H) / 2 + LINE_H * 0.8;
            const midBase = y + r.h / 2 + 1.4;
            doc.text(String(r.sno), colX[0] + colW[0] / 2, midBase, { align: 'center' });
            doc.text(r.lines, colX[1] + colW[1] / 2, firstBase, { align: 'center', lineHeightFactor: 1.0 });
            doc.text(r.sqf, colX[2] + colW[2] / 2, midBase, { align: 'center' });
            doc.text(r.rate, colX[3] + colW[3] / 2, midBase, { align: 'center' });
            doc.text(r.amount, colX[4] + colW[4] - 1.5, midBase, { align: 'right' });
            y += r.h; hline(y);
        });

        // Blank ruled rows so every page looks like the Excel sheet
        const bodyBottom = bodyTop + bodyCapacity;
        while (y + ROW_H <= bodyBottom + 0.01) { y += ROW_H; hline(y); }
        if (bodyBottom - y > 0.01) { y = bodyBottom; hline(y); }

        // Column dividers for heading + body
        [1, 2, 3, 4].forEach((i) => vline(colX[i], tableTop, y));

        let boxBottom = y;
        if (isLast) {
            // TOTAL AMOUNT row: left two columns merged, middle two merged
            vline(colX[2], y, y + ROW_H); vline(colX[4], y, y + ROW_H);
            doc.text('TOTAL AMOUNT', (colX[2] + colX[4]) / 2, y + 5.3, { align: 'center' });
            doc.setFont('helvetica', 'bold');
            doc.text(formatIN(grandTotal()), colX[4] + colW[4] - 1.5, y + 5.3, { align: 'right' });
            doc.setFont('helvetica', 'normal');
            boxBottom = y + ROW_H; hline(boxBottom);
        }
        doc.rect(L, TOP, W, boxBottom - TOP);   // outer border

        // Signature lines below the box (last page only)
        if (isLast) {
            const sigY = boxBottom + 14;
            doc.setLineWidth(0.3);
            doc.line(L, sigY, L + 60, sigY);
            doc.line(R - 60, sigY, R, sigY);
            doc.setFontSize(10);
            doc.text("Customer's Signature", L, sigY + 4.5);
            doc.text('Authorized Signature', R, sigY + 4.5, { align: 'right' });
        }
        if (pages.length > 1) {
            doc.setFontSize(8).setTextColor(110);
            doc.text(`Page ${pi + 1} of ${pages.length}`, pageW / 2, pageH - 5, { align: 'center' });
        }
    });

    const safeName = c.name.replace(/[^a-z0-9]+/gi, '_').replace(/^_+|_+$/g, '') || 'Customer';
    doc.save(`Quotation_${safeName}_${c.date}.pdf`);
}

/* ---------- init ---------- */

function clearForm() {
    if (!confirm('Clear all customer details and items?')) return;
    ['custName', 'custAddress', 'custMobile'].forEach((id) => { $(id).value = ''; $(id).classList.remove('is-invalid'); });
    $('quoteDate').value = todayISO();
    $('quoteNo').value = generateQuoteNo();
    items = [];
    hideAlert();
    addItem(); // start with one empty row
}

document.addEventListener('DOMContentLoaded', () => {
    $('quoteDate').value = todayISO();
    $('quoteNo').value = generateQuoteNo();
    SAMPLE_ITEMS.forEach((s) => items.push({ id: nextId++, ...s }));
    renderItems();
    refresh();

    $('itemsBody').addEventListener('input', onItemInput);
    $('itemsBody').addEventListener('click', (e) => {
        const btn = e.target.closest('[data-remove]');
        if (btn) removeItem(Number(btn.dataset.remove));
    });
    ['custName', 'custAddress', 'custMobile', 'quoteDate', 'quoteNo'].forEach((id) =>
        $(id).addEventListener('input', () => { $(id).classList.remove('is-invalid'); renderPreview(); }));

    $('addItemBtn').addEventListener('click', () => addItem());
    $('addItemBtn2').addEventListener('click', () => addItem());
    $('clearBtn').addEventListener('click', clearForm);
    ['pdfBtn', 'pdfBtnSide', 'pdfBtnMobile'].forEach((id) => $(id).addEventListener('click', downloadPDF));
});