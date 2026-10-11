'use strict';

// Keep the server acknowledgement authoritative for both status and cash entries.
const orderMutationPending = new Set();
const orderPaymentRetries = new Map();
const originalOrderMapper = mapServerOrderToUiOrder;
mapServerOrderToUiOrder = function (serverOrder) {
  const order = originalOrderMapper(serverOrder);
  order.ledger = (serverOrder.ledger || []).map(entry => ({
    id: entry.id, date: entry.occurredAt, type: entry.type === 'REFUND' ? 'refund' : 'collection',
    amount: Number(entry.amountVnd), method: entry.method, reason: entry.reason || ''
  }));
  order.completedAt = serverOrder.completedAt || null;
  order.isTotalFinal = serverOrder.isTotalFinal;
  order.source = ({WEBSITE:'Website',ZALO:'Zalo',MESSENGER:'Messenger',PHONE:'Phone',STORE:'Store',OTHER:'Other'})[serverOrder.source] || 'Unknown';
  return order;
};

const originalOpenOrderDetail = openOrderDetail;
openOrderDetail = function (orderId) {
  originalOpenOrderDetail(orderId);
  const order = appState.orders.find(o => o.id === orderId);
  if (order?.isTotalFinal === false && !['completed','cancelled'].includes(order.status)) {
    const content = document.getElementById('orderDetailContent');
    content.querySelector('form[onsubmit*="handleRecordCollection"]')?.remove();
    const fee = document.createElement('form');
    fee.innerHTML = '<p>Đơn chưa chốt phí giao. Xác nhận phí trước khi thu tiền.</p><label>Phí giao (VND)<input type="number" min="0" step="1" required class="form-control"></label><button class="btn btn-primary" type="submit">Chốt phí giao</button>';
    fee.addEventListener('submit',event => {
      event.preventDefault();
      sendOrderMutation(orderId,{action:'delivery_fee',shippingFeeVnd:Number(fee.querySelector('input').value)});
    });
    content.appendChild(fee);
  }
};

function refreshOrderViews(orderId) {
  persistAppState();
  renderOrdersTable();updateDashboard();renderKitchenTable();renderCustomersTable();
  if (document.getElementById('orderDetailModal')?.open) openOrderDetail(orderId);
}

async function sendOrderMutation(orderId, payload) {
  if (orderMutationPending.has(orderId)) return false;
  const order = appState.orders.find(o => o.id === orderId);
  if (!order) return false;
  orderMutationPending.add(orderId);
  const buttons = [...document.querySelectorAll('#orderDetailModal button, #orderDetailModal input, #orderDetailModal select')];
  buttons.forEach(button => { button.disabled = true; });
  try {
    const response = await fetch('/api/admin/orders', {
      method:'PATCH', cache:'no-store', credentials:'same-origin',
      headers:getAdminAuthHeaders(),
      body:JSON.stringify({...payload, referenceCode:order.referenceCode || order.id, expectedVersion:order.rowVersion})
    });
    const data = await response.json();
    if (!response.ok || !data.ok || !data.order) {
      if (response.status === 401) lockAdminApp();
      if (response.status === 409) {
        orderMutationPending.delete(orderId);
        await fetchServerOrders(true);
        if (document.getElementById('orderDetailModal')?.open) openOrderDetail(orderId);
      }
      throw new Error(data.errorMessage || 'Máy chủ chưa xác nhận thao tác.');
    }
    const index = appState.orders.findIndex(o => o.id === orderId);
    appState.orders[index] = mapServerOrderToUiOrder(data.order);
    refreshOrderViews(orderId);
    showToast('Đã lưu thao tác trên máy chủ.', 'success');
    return true;
  } catch (error) {
    showToast(`Chưa ghi nhận: ${error.message}. Có thể thử lại.`, 'error');
    return false;
  } finally {
    orderMutationPending.delete(orderId);
    buttons.forEach(button => { button.disabled = false; });
  }
}

async function progressOrderStatus(orderId, nextStatus) {
  if (!['OWNER','MANAGER','SALES'].includes(appState.currentRole)) return;
  const statuses = {confirmed:'CONFIRMED',preparing:'PREPARING',delivering:'DELIVERING',completed:'COMPLETED'};
  const next = {pending:'confirmed',confirmed:'preparing',preparing:'delivering',delivering:'completed'};
  const order = appState.orders.find(o => o.id === orderId);
  if (!order || next[order.status] !== nextStatus) return;
  return sendOrderMutation(orderId, {action:'status',newOrderStatus:statuses[nextStatus]});
}

async function promptCancelOrder(orderId) {
  if (!['OWNER','MANAGER','SALES'].includes(appState.currentRole)) return;
  const reason = window.prompt('Nhập lý do huỷ đơn hàng (bắt buộc):');
  if (reason?.trim()) return sendOrderMutation(orderId,{action:'status',newOrderStatus:'CANCELLED',note:reason.trim()});
}

async function recordOrderCash(event, orderId, type) {
  event?.preventDefault();
  if (!(type === 'collection' ? ['OWNER','MANAGER','SALES'] : ['OWNER','MANAGER']).includes(appState.currentRole)) return;
  const prefix = type === 'collection' ? 'col' : 'ref';
  const amount = Number(document.getElementById(`${prefix}Amount_${orderId}`)?.value);
  const methodLabel = document.getElementById(`${prefix}Method_${orderId}`)?.value;
  const reason = type === 'refund' ? document.getElementById(`refReason_${orderId}`)?.value.trim() : 'Ghi nhận thu tiền';
  const order = appState.orders.find(o => o.id === orderId);
  if (!order) return;
  const financials = computeOrderFinancials(order);
  const limit = type === 'collection' ? financials.outstanding : financials.netCollected;
  if (!Number.isSafeInteger(amount) || amount <= 0 || amount > limit || !reason) {
    showToast('Số tiền hoặc lý do không hợp lệ.', 'error');return;
  }
  const method = {'Tiền mặt':'CASH','Chuyển khoản':'BANK_TRANSFER'}[methodLabel] || 'OTHER';
  const signature = JSON.stringify([orderId,type,amount,method,reason]);
  if (!orderPaymentRetries.has(signature)) orderPaymentRetries.set(signature,crypto.randomUUID());
  const saved = await sendOrderMutation(orderId,{action:type,amountVnd:amount,method,reason,idempotencyKey:orderPaymentRetries.get(signature)});
  if (saved) orderPaymentRetries.delete(signature);
}

function handleRecordCollection(event, orderId) { return recordOrderCash(event,orderId,'collection'); }
function handleRecordRefund(event, orderId) { return recordOrderCash(event,orderId,'refund'); }
