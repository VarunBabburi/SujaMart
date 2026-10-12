// backend/controllers/invoiceController.js
const PDFDocument = require("pdfkit");
const db = require("../config/db");

// ── Seller details printed on every invoice ──────────────────────────────
const SELLER = {
  brand: "SujaMart",
  owner: "Varun Babburi",
  address: "Warangal, Telangana, India", // TODO: full store address
  email: "varunbabburi@gmail.com",
  phone: "+91 7671919822",
  website: "sujamart.shop",
  // gstin: "XXXXXXXXXXXXXXX", // uncomment and fill in only if you are GST registered
};

const COLORS = {
  brand: "#7A22FD",
  dark: "#0F172A",
  text: "#334155",
  muted: "#94A3B8",
  line: "#E2E8F0",
  zebra: "#F8FAFC",
  soft: "#F5F3FF",
};

// NOTE: the built-in PDF fonts cannot print the ₹ symbol, so "Rs." is used.
const money = (n) => `Rs. ${Number(n || 0).toFixed(2)}`;

const PAGE_MARGIN = 40;

exports.generateInvoice = (req, res) => {
  const orderId = req.params.orderId;

  const sql = `
    SELECT
      o.id AS order_id,
      o.user_id,
      o.total_amount,
      o.payment_method,
      o.created_at,

      u.name AS customer_name,
      u.email,
      u.phone,

      a.name AS delivery_name,
      a.phone AS delivery_phone,
      a.address_line,
      a.city,
      a.pincode,
      a.landmark,
      a.address_type,

      oi.id AS item_id,
      p.name AS product_name,
      oi.quantity,
      oi.price_at_purchase,

      pay.razorpay_payment_id

    FROM orders o
    LEFT JOIN addresses a ON o.address_id = a.id
    JOIN users u ON o.user_id = u.id
    JOIN order_items oi ON o.id = oi.order_id
    JOIN products p ON oi.product_id = p.id
    LEFT JOIN payments pay ON o.id = pay.order_id
    WHERE o.id = ?
  `;

  db.query(sql, [orderId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    const order = results[0];

    // If the route is behind verifyToken, only the owner of the order (or an admin) may download it.
    if (req.user && req.user.role !== "admin" && order.user_id !== req.user.id) {
      return res.status(403).json({ message: "You cannot access this invoice" });
    }

    // The payments join can repeat item rows, so keep each order item once.
    const seen = new Set();
    const items = results.filter((r) => {
      if (seen.has(r.item_id)) return false;
      seen.add(r.item_id);
      return true;
    });

    const subtotal = items.reduce(
      (sum, i) => sum + Number(i.quantity) * Number(i.price_at_purchase),
      0
    );
    const total = Number(order.total_amount);
    const diff = Math.round((total - subtotal) * 100) / 100;

    const doc = new PDFDocument({ size: "A4", margin: PAGE_MARGIN });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice-${orderId}.pdf`
    );
    doc.pipe(res);

    const left = PAGE_MARGIN;
    const right = doc.page.width - PAGE_MARGIN;
    const width = right - left;

    // ── Header band ───────────────────────────────────────────────
    doc.rect(0, 0, doc.page.width, 110).fill(COLORS.brand);

    doc
      .fillColor("#FFFFFF")
      .font("Helvetica-Bold")
      .fontSize(26)
      .text(SELLER.brand, left, 34, { width: width / 2 });
    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor("#E9D5FF")
      .text("Quick grocery delivery", left, 66);
    doc.text(`Owned & operated by ${SELLER.owner}`, left, 80);

    doc
      .font("Helvetica-Bold")
      .fontSize(24)
      .fillColor("#FFFFFF")
      .text("INVOICE", left, 34, { width, align: "right" });
    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor("#E9D5FF")
      .text(`Invoice No: #${order.order_id}`, left, 66, { width, align: "right" });
    doc.text(
      `Date: ${new Date(order.created_at).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })}`,
      left,
      80,
      { width, align: "right" }
    );

    // ── Seller / Billed to / Delivery ─────────────────────────────
    let y = 135;
    const colW = (width - 20) / 3;

    const block = (x, title, lines) => {
      doc.font("Helvetica-Bold").fontSize(8).fillColor(COLORS.muted).text(title, x, y, {
        width: colW,
        characterSpacing: 1,
      });
      doc.font("Helvetica-Bold").fontSize(11).fillColor(COLORS.dark).text(lines[0], x, y + 14, { width: colW });
      doc.font("Helvetica").fontSize(9).fillColor(COLORS.text);
      let ly = doc.y + 2;
      lines.slice(1).forEach((l) => {
        if (!l) return;
        doc.text(l, x, ly, { width: colW });
        ly = doc.y + 1;
      });
      return ly;
    };

    const addressLine = [order.address_line, order.city].filter(Boolean).join(", ");
    const sellerEnd = block(left, "SOLD BY", [
      `${SELLER.brand}`,
      `Prop: ${SELLER.owner}`,
      SELLER.address,
      SELLER.phone,
      SELLER.email,
      SELLER.gstin ? `GSTIN: ${SELLER.gstin}` : null,
    ]);
    const billEnd = block(left + colW + 10, "BILLED TO", [
      order.customer_name || "Customer",
      order.phone ? `Phone: ${order.phone}` : null,
      order.email || null,
    ]);
    const shipEnd = block(left + (colW + 10) * 2, "DELIVER TO", [
      order.delivery_name || order.customer_name || "Customer",
      order.delivery_phone ? `Phone: ${order.delivery_phone}` : null,
      addressLine || null,
      order.pincode ? `Pincode: ${order.pincode}` : null,
      order.landmark ? `Landmark: ${order.landmark}` : null,
      order.address_type ? `Type: ${order.address_type}` : null,
    ]);

    y = Math.max(sellerEnd, billEnd, shipEnd) + 18;

    // ── Items table ───────────────────────────────────────────────
    const cols = {
      no: left + 10,
      item: left + 42,
      qty: left + width - 230,
      rate: left + width - 170,
      amount: left + width - 90,
    };

    const drawTableHeader = () => {
      doc.roundedRect(left, y, width, 26, 6).fill(COLORS.dark);
      doc.font("Helvetica-Bold").fontSize(9).fillColor("#FFFFFF");
      doc.text("#", cols.no, y + 9, { width: 24 });
      doc.text("ITEM", cols.item, y + 9, { width: 200 });
      doc.text("QTY", cols.qty, y + 9, { width: 50, align: "center" });
      doc.text("RATE", cols.rate, y + 9, { width: 70, align: "right" });
      doc.text("AMOUNT", cols.amount, y + 9, { width: 80 - 10, align: "right" });
      y += 26;
    };

    drawTableHeader();

    items.forEach((item, idx) => {
      const rowH = 28;
      if (y + rowH > doc.page.height - 150) {
        doc.addPage();
        y = PAGE_MARGIN;
        drawTableHeader();
      }
      if (idx % 2 === 0) {
        doc.rect(left, y, width, rowH).fill(COLORS.zebra);
      }
      const amount = Number(item.quantity) * Number(item.price_at_purchase);
      doc.font("Helvetica").fontSize(9.5).fillColor(COLORS.text);
      doc.text(String(idx + 1), cols.no, y + 9, { width: 24 });
      doc
        .fillColor(COLORS.dark)
        .font("Helvetica-Bold")
        .text(item.product_name, cols.item, y + 9, { width: qtyGap(cols), height: 12, ellipsis: true });
      doc.font("Helvetica").fillColor(COLORS.text);
      doc.text(String(item.quantity), cols.qty, y + 9, { width: 50, align: "center" });
      doc.text(money(item.price_at_purchase), cols.rate, y + 9, { width: 70, align: "right" });
      doc
        .font("Helvetica-Bold")
        .fillColor(COLORS.dark)
        .text(money(amount), cols.amount - 10, y + 9, { width: 80, align: "right" });
      y += rowH;
    });

    doc
      .moveTo(left, y)
      .lineTo(right, y)
      .lineWidth(0.7)
      .strokeColor(COLORS.line)
      .stroke();
    y += 14;

    // ── Totals ────────────────────────────────────────────────────
    if (y + 170 > doc.page.height - PAGE_MARGIN) {
      doc.addPage();
      y = PAGE_MARGIN;
    }

    const totalsX = left + width - 220;
    const totalLine = (label, value, opts = {}) => {
      doc
        .font(opts.bold ? "Helvetica-Bold" : "Helvetica")
        .fontSize(opts.size || 10)
        .fillColor(opts.color || COLORS.text)
        .text(label, totalsX, y, { width: 110 });
      doc.text(value, totalsX + 100, y, { width: 120, align: "right" });
      y += opts.gap || 18;
    };

    totalLine("Subtotal", money(subtotal));
    if (Math.abs(diff) > 0.009) {
      totalLine(diff > 0 ? "Delivery & other charges" : "Discount", money(Math.abs(diff)));
    }

    y += 2;
    doc.roundedRect(totalsX - 10, y - 6, 230, 34, 8).fill(COLORS.soft);
    doc
      .font("Helvetica-Bold")
      .fontSize(12)
      .fillColor(COLORS.brand)
      .text("Total amount", totalsX, y + 3, { width: 110 });
    doc.fontSize(14).text(money(total), totalsX + 70, y + 2, { width: 150, align: "right" });

    // ── Payment details (left of totals) ──────────────────────────
    const payY = y - 40 < 0 ? y : y - (Math.abs(diff) > 0.009 ? 38 : 20);
    doc.font("Helvetica-Bold").fontSize(8).fillColor(COLORS.muted).text("PAYMENT", left, payY, { characterSpacing: 1 });
    doc.font("Helvetica-Bold").fontSize(10).fillColor(COLORS.dark).text(
      String(order.payment_method || "-").toUpperCase(),
      left,
      payY + 14
    );
    if (order.razorpay_payment_id) {
      doc.font("Helvetica").fontSize(9).fillColor(COLORS.text).text(
        `Transaction ID: ${order.razorpay_payment_id}`,
        left,
        payY + 30,
        { width: width - 260 }
      );
    }

    y += 60;

    // ── Thank-you note ────────────────────────────────────────────
    doc
      .font("Helvetica-Bold")
      .fontSize(12)
      .fillColor(COLORS.dark)
      .text(`Thank you for shopping with ${SELLER.brand}!`, left, y, { width, align: "center" });
    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor(COLORS.text)
      .text(
        `Questions about this order? Write to ${SELLER.email} or call ${SELLER.phone}.`,
        left,
        y + 18,
        { width, align: "center" }
      );

    // ── Footer on the last page ───────────────────────────────────
    const footerY = doc.page.height - 75;
    doc.moveTo(left, footerY).lineTo(right, footerY).lineWidth(0.7).strokeColor(COLORS.line).stroke();
    doc
      .font("Helvetica")
      .fontSize(8)
      .fillColor(COLORS.muted)
      .text(
        `Computer-generated invoice, no signature required  |  ${SELLER.brand} · ${SELLER.website}`,
        left,
        footerY + 10,
        { width, align: "center", lineBreak: false }
      );

    doc.end();
  });
};

// Width available for the item name (between the item column and the qty column)
function qtyGap(cols) {
  return cols.qty - cols.item - 8;
}