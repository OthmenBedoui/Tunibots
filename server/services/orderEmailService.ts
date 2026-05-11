import prisma from '../prisma.js';
import { getEmailTemplate, renderTemplate, sendEmail } from '../utils/email.js';

type CheckoutOrderEmailPayload = {
  id: string;
  orderNumber: string;
  amount: number;
  currency: string;
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  customerPhone: string;
  paymentMethod?: string | null;
  items: Array<{
    id: string;
    titleSnapshot: string;
    quantity: number;
    priceSnapshot: number;
  }>;
  invoice?: {
    id: string;
    invoiceNumber: string;
    issueDate: Date;
    status: string;
  } | null;
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const formatMoney = (amount: number, currency: string) => `${amount.toFixed(2)} ${currency}`;
const formatPaymentMethod = (method?: string | null) => {
  const labels: Record<string, string> = {
    whatsapp: 'WhatsApp / support',
    edinar: 'EDINAR',
    flouci: 'Flouci',
    click2pay: 'Click2Pay',
    carte: 'Carte bancaire'
  };
  return method ? labels[method.toLowerCase()] || method : 'A confirmer';
};

const buildItemsRows = (order: CheckoutOrderEmailPayload) =>
  order.items
    .map(
      (item) => `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:14px;">
            ${escapeHtml(item.titleSnapshot)}
            <div style="color:#64748b;font-size:12px;margin-top:4px;">Quantité: ${item.quantity}</div>
          </td>
          <td style="padding:12px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:14px;text-align:right;">
            ${formatMoney(item.priceSnapshot * item.quantity, order.currency)}
          </td>
        </tr>
      `
    )
    .join('');

const buildOrderConfirmationEmail = (order: CheckoutOrderEmailPayload) => {
  const customerName = `${order.customerFirstName} ${order.customerLastName}`.trim();
  const invoiceBlock = order.invoice
    ? `
      <div style="margin-top:16px;padding:16px;border:1px solid #cbd5e1;border-radius:16px;background:#f8fafc;">
        <div style="font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#475569;">Facture TuniBots</div>
        <div style="font-size:20px;font-weight:800;color:#0f172a;margin-top:6px;">${escapeHtml(order.invoice.invoiceNumber)}</div>
        <div style="font-size:14px;color:#475569;margin-top:6px;">Date: ${new Date(order.invoice.issueDate).toLocaleDateString('fr-FR')}</div>
        <div style="font-size:14px;color:#475569;">Statut: En cours</div>
      </div>
    `
    : '';

  return `
    <div style="background:#f8fafc;padding:32px 16px;font-family:Arial,sans-serif;color:#0f172a;">
      <div style="max-width:680px;margin:0 auto;background:#ffffff;border-radius:24px;padding:32px;border:1px solid #e2e8f0;">
        <div style="font-size:26px;font-weight:900;color:#0f172a;margin-bottom:10px;">TuniBots</div>
        <div style="display:inline-block;padding:6px 10px;border-radius:999px;background:#e0e7ff;color:#4338ca;font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;">Facture de commande</div>
        <h1 style="margin:18px 0 12px;font-size:28px;line-height:1.2;">Votre commande est en cours</h1>
        <p style="margin:0 0 18px;color:#475569;font-size:15px;">Bonjour ${escapeHtml(customerName || order.customerFirstName)}, votre facture TuniBots est générée. Un de nos services support vous guidera dans votre commande et les prochaines étapes.</p>

        <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin:24px 0;">
          <div style="padding:16px;border:1px solid #cbd5e1;border-radius:16px;background:#f8fafc;">
            <div style="font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#475569;">Numéro de commande</div>
            <div style="font-size:20px;font-weight:800;color:#0f172a;margin-top:6px;">${escapeHtml(order.orderNumber)}</div>
          </div>
          <div style="padding:16px;border:1px solid #cbd5e1;border-radius:16px;background:#f8fafc;">
            <div style="font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#475569;">Montant total</div>
            <div style="font-size:20px;font-weight:800;color:#0f172a;margin-top:6px;">${formatMoney(order.amount, order.currency)}</div>
          </div>
        </div>

        ${invoiceBlock}

        <div style="margin-top:16px;padding:16px;border:1px solid #cbd5e1;border-radius:16px;background:#f8fafc;">
          <div style="font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#475569;margin-bottom:10px;">Coordonnées client</div>
          <div style="font-size:14px;color:#0f172a;line-height:1.7;">
            <div><strong>Nom:</strong> ${escapeHtml(customerName || order.customerFirstName)}</div>
            <div><strong>Email:</strong> ${escapeHtml(order.customerEmail)}</div>
            <div><strong>Téléphone:</strong> ${escapeHtml(order.customerPhone)}</div>
            <div><strong>Méthode de paiement choisie:</strong> ${escapeHtml(formatPaymentMethod(order.paymentMethod))}</div>
          </div>
        </div>

        <div style="margin-top:24px;">
          <div style="font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#475569;margin-bottom:12px;">Récapitulatif</div>
          <table style="width:100%;border-collapse:collapse;">
            <tbody>
              ${buildItemsRows(order)}
            </tbody>
          </table>
        </div>

        <div style="margin-top:24px;padding:18px;border-radius:18px;background:#fff7ed;border:1px solid #fdba74;">
          <div style="font-weight:700;color:#9a3412;margin-bottom:8px;">Accompagnement support</div>
          <div style="font-size:14px;color:#7c2d12;">Votre facture a été générée. Un membre de notre support TuniBots vous guidera dans votre commande au ${escapeHtml(order.customerPhone)}.</div>
        </div>

        <p style="margin:24px 0 0;color:#64748b;font-size:13px;">Conservez ce message et votre numéro de commande pour le suivi.</p>
      </div>
    </div>
  `;
};

const buildOrderTemplateVariables = (order: CheckoutOrderEmailPayload) => {
  const customerName = `${order.customerFirstName} ${order.customerLastName}`.trim() || order.customerFirstName;
  return {
    orderNumber: order.orderNumber,
    invoiceNumber: order.invoice?.invoiceNumber || '',
    invoiceDate: order.invoice?.issueDate ? new Date(order.invoice.issueDate).toLocaleDateString('fr-FR') : '',
    customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    paymentMethod: formatPaymentMethod(order.paymentMethod),
    totalAmount: formatMoney(order.amount, order.currency),
    amount: order.amount.toFixed(2),
    currency: order.currency,
    itemsRows: buildItemsRows(order)
  };
};

export const sendOrderConfirmationEmail = async (order: CheckoutOrderEmailPayload) => {
  try {
    const template = await getEmailTemplate('orderInvoice');
    const variables = buildOrderTemplateVariables(order);
    await sendEmail(
      order.customerEmail,
      renderTemplate(template.subject, variables),
      renderTemplate(template.html || buildOrderConfirmationEmail(order), variables)
    );

    const now = new Date();
    await prisma.order.update({
      where: { id: order.id },
      data: {
        emailStatus: 'SENT',
        emailSentAt: now,
        emailError: null
      }
    });

    if (order.invoice?.id) {
      await prisma.invoice.update({
        where: { id: order.invoice.id },
        data: {
          emailSentAt: now,
          emailError: null
        }
      });
    }
    return { status: 'SENT', error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'SMTP send failed';
    await prisma.order.update({
      where: { id: order.id },
      data: {
        emailStatus: 'FAILED',
        emailError: message
      }
    });

    if (order.invoice?.id) {
      await prisma.invoice.update({
        where: { id: order.invoice.id },
        data: { emailError: message }
      });
    }

    console.error('[checkout-email] send failed', { orderId: order.id, message });
    return { status: 'FAILED', error: message };
  }
};

export const resendOrderConfirmationEmail = async (orderId: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      invoice: true
    }
  });

  if (!order) {
    throw new Error('Commande introuvable.');
  }

  return sendOrderConfirmationEmail(order);
};
