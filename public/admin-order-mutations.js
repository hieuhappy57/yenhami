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
  order.confirmedAt = serverOrder.confirmedAt || null;
  order.preparingStartedAt = serverOrder.preparingStartedAt || null;
  order.preparedDoneAt = serverOrder.preparedDoneAt || null;
  order.completedAt = serverOrder.completedAt || null;
  order.isTotalFinal = serverOrder.isTotalFinal;
  if (serverOrder.orderPurpose === 'SELF') {order.recipientName='';order.recipientPhone='';}
  order.source = ({WEBSITE:'Website',ZALO:'Zalo',MESSENGER:'Messenger',PHONE:'Phone',STORE:'Store',OTHER:'Other'})[serverOrder.source] || 'Unknown';
  return order;
};

const originalOpenOrderDetail = openOrderDetail;
openOrderDetail = function (orderId) {
  originalOpenOrderDetail(orderId);
  const order = appState.orders.find(o => o.id === orderId);
  const steps = ['Khách đặt','Xác nhận & thu tiền','Chuyển bếp','Giao hàng','Thành công'];
  const activeStep = ['pending','confirmed','preparing','delivering','completed'].indexOf(order?.status);
  const progress = document.createElement('ol');
  progress.setAttribute('aria-label','Tiến độ đơn hàng');
  progress.style.cssText = 'display:flex;flex-wrap:wrap;gap:12px;list-style:none;padding:0;font-size:12px';
  steps.forEach((label,index)=>{
    const step = document.createElement('li');step.textContent = `${index+1}. ${label}`;
    step.style.color = index<=activeStep ? 'var(--primary)' : 'var(--text-muted)';
    if (index===activeStep) {step.style.fontWeight='700';step.setAttribute('aria-current','step');}
    progress.appendChild(step);
  });
  document.getElementById('orderDetailContent').prepend(progress);

  // RBAC UI masking on order detail:
  const content = document.getElementById('orderDetailContent');
  if (!['OWNER', 'MANAGER'].includes(appState.currentRole)) {
    // Hide refund form and cancel buttons for SALES/others
    content.querySelectorAll('form[onsubmit*="handleRecordRefund"]').forEach(el => el.remove());
    content.querySelectorAll('button[onclick*="promptCancelOrder"]').forEach(el => el.remove());
  }

  if (order?.status === 'pending') {
    content.querySelector('form[onsubmit*="handleRecordCollection"]')?.remove();
    content.querySelectorAll('button[onclick*="progressOrderStatus"]').forEach(button => button.remove());
    const form = document.createElement('form');
    form.id = 'confirmOrderForm';
    form.innerHTML = '<h4>Xác nhận đơn hàng</h4><label>Phí giao (VND)<input name="shippingFee" type="number" min="0" step="1" class="form-control"></label><p id="shippingFeeError" role="alert" style="display:none;color:var(--status-red);font-size:12px;margin:4px 0;">Nhập phí giao, hoặc 0 nếu miễn phí.</p><label>Số tiền thu (VND)<input name="amount" type="number" readonly class="form-control"></label><label>Hình thức thu<select name="method" class="form-control"><option value="BANK_TRANSFER">Chuyển khoản</option><option value="CASH">Tiền mặt</option><option value="OTHER">Khác</option></select></label><button class="btn btn-primary" type="submit">Xác nhận đơn &amp; ghi nhận thu</button>';
    const fee = form.querySelector('[name="shippingFee"]');
    const amount = form.querySelector('[name="amount"]');
    const feeError = form.querySelector('#shippingFeeError');
    fee.value = order.isTotalFinal ? String(order.shippingFee || 0) : '';
    fee.readOnly = order.ledger.length > 0;
    const updateAmount = () => { amount.value = String(Math.max(0,computeOrderFinancials(order).netGoods + Number(fee.value) - computeOrderFinancials(order).netCollected)); };
    fee.addEventListener('input',() => { feeError.style.display = 'none'; updateAmount(); });updateAmount();
    form.addEventListener('submit',async event => {
      event.preventDefault();
      if (fee.value.trim() === '' || !Number.isSafeInteger(Number(fee.value)) || Number(fee.value) < 0) {
        feeError.style.display = 'block';
        fee.focus();
        return;
      }
      const payload = {action:'confirm',shippingFeeVnd:Number(fee.value),amountVnd:Number(amount.value),method:form.querySelector('[name="method"]').value};
      const signature = JSON.stringify([orderId,payload]);
      if (!orderPaymentRetries.has(signature)) orderPaymentRetries.set(signature,crypto.randomUUID());
      if (await sendOrderMutation(orderId,{...payload,idempotencyKey:orderPaymentRetries.get(signature)})) orderPaymentRetries.delete(signature);
    });
    content.appendChild(form);
  }
  if (order?.status === 'confirmed' || order?.status === 'preparing') {
    content.querySelectorAll('button[onclick*="progressOrderStatus"]').forEach(button => button.remove());
  }
  document.querySelectorAll('#orderDetailContent button').forEach(button => {
    const labels = {'Chuyển sang Bếp pha chế':'Chuyển bếp','Xuất giao vận chuyển':'Giao hàng','Xác nhận hoàn tất đơn':'Xác nhận thành công'};
    const label = labels[button.textContent.trim()];if (label) button.textContent = label;
  });
};

function refreshOrderViews(orderId) {
  persistAppState();
  const renderActiveOrdersView = {orders:renderOrdersTable,dashboard:updateDashboard,kitchen:renderKitchenTable,customers:renderCustomersTable}[appState.activeTab];
  if (renderActiveOrdersView) renderActiveOrdersView();
  if (document.getElementById('orderDetailModal')?.open) openOrderDetail(orderId);
}

async function sendOrderMutation(orderId, payload) {
  if (orderMutationPending.has(orderId)) return false;
  const order = appState.orders.find(o => o.id === orderId);
  if (!order) return false;
  orderMutationPending.add(orderId);
  const buttons = [...document.querySelectorAll('#orderDetailModal button, #orderDetailModal input, #orderDetailModal select, .kitchen-action-btn')];
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
    if (index !== -1 && data.order) {
      appState.orders[index] = mapServerOrderToUiOrder(data.order);
    }
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
  if (appState.currentRole === 'KITCHEN') {
    if (!['preparing', 'delivering'].includes(nextStatus)) return;
  } else if (!['OWNER','MANAGER','SALES'].includes(appState.currentRole)) {
    return;
  }
  const statuses = {confirmed:'CONFIRMED',preparing:'PREPARING',delivering:'DELIVERING',completed:'COMPLETED'};
  const next = {pending:'confirmed',confirmed:'preparing',preparing:'delivering',delivering:'completed'};
  const order = appState.orders.find(o => o.id === orderId);
  if (!order || next[order.status] !== nextStatus) return;
  if (nextStatus === 'confirmed') {openOrderDetail(orderId);return;}
  if (nextStatus === 'preparing' || nextStatus === 'delivering') return;
  return sendOrderMutation(orderId, {action:'status',newOrderStatus:statuses[nextStatus]});
}

async function kitchenStartPreparing(orderId) {
  const order = appState.orders.find(o => o.id === orderId);
  if (!order) return;
  return sendOrderMutation(orderId, { action: 'status', newOrderStatus: 'PREPARING' });
}

async function kitchenFinishPreparing(orderId) {
  const order = appState.orders.find(o => o.id === orderId);
  if (!order) return;
  return sendOrderMutation(orderId, { action: 'status', newOrderStatus: 'DELIVERING' });
}

async function promptCancelOrder(orderId) {
  if (!['OWNER','MANAGER'].includes(appState.currentRole)) {
    showToast('Chỉ Quản lý (Manager) hoặc Chủ cơ sở (Owner) mới có quyền huỷ đơn hàng!', 'error');
    return;
  }
  const reason = window.prompt('Nhập lý do huỷ đơn hàng (bắt buộc):');
  if (reason?.trim()) return sendOrderMutation(orderId,{action:'status',newOrderStatus:'CANCELLED',note:reason.trim()});
}

async function recordOrderCash(event, orderId, type) {
  event?.preventDefault();
  if (!(type === 'collection' ? ['OWNER','MANAGER','SALES'] : ['OWNER','MANAGER']).includes(appState.currentRole)) {
    showToast('Bạn không có quyền thực hiện giao dịch này.', 'error');
    return;
  }
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
