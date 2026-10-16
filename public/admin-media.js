(function () {
  const catalog = new Map();
  const pendingUploads = new Set();
  const imagePreviews = new Map();
  const siteImageFields={siteHeroDesktopImage:'heroDesktopImage',siteHeroMobileImage:'heroMobileImage',siteGiftingImage:'giftingImage'};
  function refreshImagePreviews(){for(const show of imagePreviews.values()) show();}
  const siteFields={heroBadge:'siteHeroBadge',heroTitle:'siteHeroTitle',heroLead:'siteHeroLead',heroCta:'siteHeroCta',
    heroDesktopImage:'siteHeroDesktopImage',heroMobileImage:'siteHeroMobileImage',giftingBadge:'siteGiftingBadge',
    giftingTitle:'siteGiftingTitle',giftingDescription:'siteGiftingDesc',giftingImage:'siteGiftingImage',
    hotlineDisplay:'siteHotlineDisplay',hotlineTel:'siteHotlineTel',zaloUrl:'siteZaloUrl',addressDisplay:'siteAddressDisplay',
    serviceHoursDisplay:'siteServiceHours',noticeBanner:'siteNoticeBanner',aboutHeadline:'siteAboutHeadline',aboutLead:'siteAboutLead'};
  let siteLoading,siteReady=false,siteDirty=false;
  const originalSiteForm=typeof loadSiteSettingsForm==='function' ? loadSiteSettingsForm : null;
  const siteForm=document.getElementById('siteHeroTitle')?.closest?.('form');
  function setSiteBusy(busy) {
    if(siteForm) {
      for(const button of siteForm.querySelectorAll('[type="submit"]')) button.disabled=busy;
      for(const field of siteForm.querySelectorAll('input,textarea,select')) field.disabled=busy || !siteReady;
    }
  }
  async function loadServerSiteSettings() {
    if(siteLoading) return siteLoading;
    if(siteDirty) return;
    setSiteBusy(true);
    siteLoading=(async()=>{
      const response=await fetch('/api/admin/cms',{cache:'no-store',credentials:'same-origin',headers:getAdminAuthHeaders()});
      const result=await response.json();
      if(!response.ok || !result.ok || !result.siteSettings) throw new Error(result.errorMessage || 'Không tải được cấu hình giao diện.');
      if(!siteDirty) {appState.site=result.siteSettings;if(originalSiteForm) originalSiteForm();refreshImagePreviews();}
      siteReady=true;
    })();
    try {await siteLoading;} finally {siteLoading=null;setSiteBusy(false);}
  }
  if(originalSiteForm) loadSiteSettingsForm=function() {
    if(!siteDirty) originalSiteForm();
    return loadServerSiteSettings().catch(error=>{if(appState.activeTab==='site') showToast(error.message,'error');});
  };
  if(siteForm) {
    siteForm.addEventListener('input',()=>{siteDirty=true;});
    siteForm.addEventListener('change',()=>{siteDirty=true;});
  }
  handleSaveSiteSettings=async function(event) {
    event.preventDefault();
    if(!siteReady) {
      siteDirty=false;
      try {await loadServerSiteSettings();showToast('Đã tải cấu hình từ máy chủ. Anh kiểm tra nội dung trước khi lưu.','info');}
      catch(error) {showToast(error.message || 'Không tải được cấu hình.','error');}
      return;
    }
    if(['siteHeroDesktopImage','siteHeroMobileImage','siteGiftingImage'].some(id=>pendingUploads.has(id))) {showToast('Vui lòng chờ tải ảnh xong.','error');return;}
    const settings={};
    for(const [key,id] of Object.entries(siteFields)) settings[key]=document.getElementById(id).value.trim();
    setSiteBusy(true);
    try {
      const response=await fetch('/api/admin/cms',{method:'POST',credentials:'same-origin',headers:getAdminAuthHeaders(),body:JSON.stringify({action:'save_site_settings',settings})});
      const result=await response.json();
      if(!response.ok || !result.ok || !result.siteSettings) throw new Error(result.errorMessage || 'Chưa lưu được cấu hình giao diện.');
      appState.site=result.siteSettings;siteDirty=false;
      if(typeof persistAppState==='function') persistAppState();
      if(originalSiteForm) originalSiteForm();
      refreshImagePreviews();
      showToast('Đã lưu giao diện lên máy chủ. Tải lại trang web để xem thay đổi.','success');
    } catch(error) {showToast(error.message || 'Chưa lưu được cấu hình.','error');}
    finally {setSiteBusy(false);}
  };
  let catalogLoading;
  const productLines={'fresh-bowl':'Yến tươi chưng nóng','gift-set':'Set quà tặng',jar:'Yến hũ chưng sẵn','refined-nest':'Yến tinh chế'};

  function applyProduct(product) {
    catalog.set(product.id,product);
    appState.products[product.id]={id:product.id,name:product.name,category:product.category,price:product.priceVnd,
      image:product.imageUrl,description:product.shortDescription,productLine:product.productLine,productLineLabel:productLines[product.productLine],volumeMl:product.volumeMl,ingredients:product.ingredients};
  }

  async function loadMediaCatalog() {
    if(catalogLoading) return catalogLoading;
    catalogLoading=(async()=>{
      const response=await fetch('/api/catalog?refresh=1',{cache:'no-store'});
      const result=await response.json();
      if(!response.ok || !result.ok || !Array.isArray(result.products)) throw new Error('Không tải được danh mục sản phẩm.');
      const products={};
      for(const product of result.products) {
        catalog.set(product.id,product);
        products[product.id]={id:product.id,name:product.name,category:product.category,price:product.priceVnd,
          image:product.imageUrl,description:product.shortDescription,productLine:product.productLine,productLineLabel:productLines[product.productLine],volumeMl:product.volumeMl,ingredients:product.ingredients};
      }
      appState.products=products;
      renderProductsTable();
    })();
    try {await catalogLoading;} finally {catalogLoading=null;}
  }

  async function uploadImageToR2(file,siteImageField) {
    if(!file || file.size>3*1024*1024) throw new Error('Ảnh tối đa 3 MB.');
    const dataUrl=await new Promise((resolve,reject)=>{
      const reader=new FileReader();
      reader.onload=()=>resolve(reader.result);
      reader.onerror=()=>reject(new Error('Không đọc được ảnh.'));
      reader.readAsDataURL(file);
    });
    const response=await fetch('/api/admin/cms',{method:'POST',credentials:'same-origin',headers:getAdminAuthHeaders(),
      body:JSON.stringify({action:'upload_media_r2',dataUrl,fileName:file.name,...(siteImageField ? {siteImageField} : {})})});
    const result=await response.json().catch(()=>({}));
    if(!response.ok || !result.ok || result.storedInR2!==true || !String(result.url || '').startsWith('/api/media/uploads/')) {
      throw new Error(result.errorMessage || 'Chưa lưu được ảnh lên máy chủ.');
    }
    if(siteImageField) {
      if(result.siteSettings?.[siteImageField]!==result.url) throw new Error('Ảnh đã tải nhưng chưa gắn được vào banner. Vui lòng thử lại.');
      appState.site={...appState.site,[siteImageField]:result.url};
    }
    return result.url;
  }

  async function openImageLibrary(field,id,showPreview) {
    const dialog=document.createElement('dialog');
    dialog.setAttribute('aria-label','Ảnh đã tải lên');
    dialog.style.cssText='width:min(760px,94vw);max-height:85vh;padding:20px;border:1px solid #d5dfd9;border-radius:8px;color:#234534';
    const heading=document.createElement('h2');heading.textContent='Ảnh đã tải lên';heading.style.cssText='font-size:18px;margin:0 0 16px';
    const close=document.createElement('button');close.type='button';close.className='btn';close.textContent='Đóng';close.onclick=()=>dialog.close();
    const status=document.createElement('p');status.textContent='Đang tải ảnh…';status.setAttribute('role','status');
    const grid=document.createElement('div');grid.style.cssText='display:grid;grid-template-columns:repeat(auto-fit,minmax(min(180px,100%),1fr));gap:12px;margin:16px 0';
    dialog.append(heading,status,grid,close);document.body.append(dialog);dialog.addEventListener('close',()=>dialog.remove(),{once:true});dialog.showModal();
    try {
      const response=await fetch('/api/admin/cms?editorImages=1',{cache:'no-store',credentials:'same-origin',headers:getAdminAuthHeaders()});
      const result=await response.json();
      if(!response.ok || !result.ok || !Array.isArray(result.images)) throw new Error(result.errorMessage || 'Không tải được thư viện ảnh.');
      status.textContent=result.images.length ? (result.truncated ? 'Đang hiển thị một phần ảnh đã tải.' : '') : 'Chưa có ảnh tải lên trong R2.';
      for(const image of result.images) {
        const button=document.createElement('button');button.type='button';button.title='Dùng ảnh này';
        button.style.cssText='padding:8px;border:1px solid #d5dfd9;border-radius:6px;background:white;text-align:left;cursor:pointer;min-width:0';
        const preview=document.createElement('img');preview.src=image.url;preview.alt=image.name;preview.loading='lazy';preview.style.cssText='width:100%;height:130px;object-fit:contain;display:block';
        const name=document.createElement('span');name.textContent=image.name;name.style.cssText='display:block;font-size:12px;overflow-wrap:anywhere;margin-top:6px';
        button.append(preview,name);grid.append(button);
        button.onclick=async()=>{
          for(const item of grid.children) item.disabled=true;
          status.textContent='Đang cập nhật ảnh…';pendingUploads.add(id);setSiteBusy(true);
          try {
            const key=siteImageFields[id];
            const saved=await fetch('/api/admin/cms',{method:'POST',credentials:'same-origin',headers:getAdminAuthHeaders(),body:JSON.stringify({action:'save_site_settings',settings:{[key]:image.url}})});
            const body=await saved.json();
            if(!saved.ok || !body.ok || body.siteSettings?.[key]!==image.url) throw new Error(body.errorMessage || 'Chưa cập nhật được ảnh.');
            appState.site={...appState.site,[key]:image.url};field.value=image.url;showPreview();dialog.close();
            showToast('Đã cập nhật ảnh banner lên máy chủ. Tải lại trang web để xem.','success');
          } catch(error) {status.textContent=error.message || 'Chưa cập nhật được ảnh.';for(const item of grid.children) item.disabled=false;}
          finally {pendingUploads.delete(id);setSiteBusy(false);}
        };
      }
    } catch(error) {status.textContent=error.message || 'Không tải được thư viện ảnh.';}
  }

  function mountImageUpload(id) {
    const field=document.getElementById(id);
    if(!field) return;
    const tools=document.createElement('div');
    tools.style.cssText='display:flex;flex-wrap:wrap;align-items:center;gap:12px;margin-top:8px;min-height:40px';
    const picker=document.createElement('input');
    picker.type='file';picker.accept='image/png,image/jpeg,image/webp,image/gif,image/avif';picker.hidden=true;
    const button=document.createElement('button');
    button.type='button';button.className='btn btn-sm';button.title='Tải ảnh lên';
    button.innerHTML='<i data-lucide="upload" style="width:16px;height:16px"></i><span>Tải ảnh</span>';
    const preview=document.createElement('img');
    preview.alt='Ảnh đã chọn';preview.width=120;preview.height=80;
    preview.style.cssText='width:120px;height:80px;object-fit:contain;border-radius:4px;display:none';
    const showPreview=()=>{if(field.value && !field.value.startsWith('data:')) {preview.src=field.value;preview.style.display='block';} else preview.style.display='none';};
    preview.onerror=()=>{preview.style.display='none';};
    const dialog=field.closest?.('dialog');
    if(dialog && typeof MutationObserver!=='undefined') new MutationObserver(()=>{if(dialog.open) showPreview();}).observe(dialog,{attributes:true,attributeFilter:['open']});
    button.onclick=()=>{if(field.disabled) {showToast('Vui lòng chờ tải hoặc lưu cấu hình xong.','info');return;}picker.click();};
    imagePreviews.set(id,showPreview);
    field.addEventListener('change',showPreview);
    picker.onchange=async()=>{
      const file=picker.files?.[0];
      if(!file) return;
      button.disabled=true;
      pendingUploads.add(id);
      const saveButton=field.closest?.('form')?.querySelector('[type="submit"]');
      if(saveButton) saveButton.disabled=true;
      try {
        const key=siteImageFields[id];
        const url=await uploadImageToR2(file,key);
        field.value=url;field.dispatchEvent(new Event('change',{bubbles:true}));
        showToast(key ? 'Đã tải và cập nhật ảnh banner lên máy chủ.' : 'Đã tải ảnh thành công.','success');
      } catch(error) {showToast(error.message || 'Không tải được ảnh.','error');}
      finally {button.disabled=false;picker.value='';pendingUploads.delete(id);if(saveButton) saveButton.disabled=false;}
    };
    tools.append(button,picker,preview);field.after(tools);
    if(siteImageFields[id]) {
      const library=document.createElement('button');library.type='button';library.className='btn btn-sm';library.title='Chọn ảnh đã tải';
      library.innerHTML='<i data-lucide="images" style="width:16px;height:16px"></i><span>Ảnh đã tải</span>';
      library.onclick=()=>{if(!field.disabled) openImageLibrary(field,id,showPreview);};tools.append(library);
    }
    showPreview();
  }

  handleSaveProduct=async function(event) {
    event.preventDefault();
    const form=event.currentTarget;
    const button=form?.querySelector('[type="submit"]');
    if(button) button.disabled=true;
    try {
      if(pendingUploads.has('editProductImage')) throw new Error('Vui lòng chờ tải ảnh xong.');
      const id=document.getElementById('editProductId').value;
      if(!catalog.has(id)) await loadMediaCatalog();
      const current=catalog.get(id);
      const imageUrl=document.getElementById('editProductImage').value.trim();
      if(imageUrl.startsWith('data:')) throw new Error('Dùng nút tải ảnh để lưu ảnh trước.');
      const product={id,name:document.getElementById('editProductName').value.trim(),imageUrl,
        productLine:document.getElementById('editProductLine')?.value || current?.productLine || 'fresh-bowl',
        shortDescription:document.getElementById('editProductDesc').value.trim()};
      const volume=Number(document.getElementById('editProductVolume')?.value || current?.volumeMl || 200);
      if(!Number.isSafeInteger(volume) || volume<1) throw new Error('Quy cách không hợp lệ.');
      product.volumeMl=volume;
      if(appState.currentRole!=='MARKETING') {
        const category=document.getElementById('editProductCategory').value;
        Object.assign(product,{priceVnd:Number(document.getElementById('editProductPrice').value),
          ...(['nguyen-ban','ngot-diu','nhieu-tang'].includes(category) ? {category} : {}),
          ...(!current ? {status:'AVAILABLE'} : {})});
      }
      const response=await fetch('/api/admin/cms',{method:'POST',credentials:'same-origin',headers:getAdminAuthHeaders(),body:JSON.stringify({action:'upsert_product',product})});
      const result=await response.json();
      if(!response.ok || !result.ok) throw new Error(result.errorMessage || 'Chưa lưu được sản phẩm.');
      if(result.product?.id) {applyProduct(result.product);renderProductsTable();}
      else await loadMediaCatalog();
      closeDialog('editProductModal');showToast('Đã lưu sản phẩm.','success');
    } catch(error) {showToast(error.message || 'Không lưu được sản phẩm.','error');}
    finally {if(button) button.disabled=false;}
  };

  const productDialog=document.getElementById('editProductModal');
  const deleteButton=document.getElementById('deleteProductButton');
  if(productDialog && typeof MutationObserver!=='undefined') new MutationObserver(()=>{
    if(!productDialog.open) return;
    const current=catalog.get(document.getElementById('editProductId').value);
    document.getElementById('editProductLine').value=current?.productLine || 'fresh-bowl';
    document.getElementById('editProductVolume').value=current?.volumeMl || 200;
    const category=document.getElementById('editProductCategory');
    if(!category.value) category.value='nguyen-ban';
    if(deleteButton) deleteButton.hidden=!current || appState.currentRole==='MARKETING';
  }).observe(productDialog,{attributes:true,attributeFilter:['open']});
  if(typeof openNewProductModal==='function') {
    const originalNewProduct=openNewProductModal;
    openNewProductModal=function(){originalNewProduct();document.getElementById('editProductId').value='prod-'+crypto.randomUUID();};
  }
  if(typeof openEditProduct==='function') {
    const originalEditProduct=openEditProduct;
    openEditProduct=async function(id){
      try {
        if(!catalog.has(id)) await loadMediaCatalog();
        if(!catalog.has(id)) throw new Error('Sản phẩm không còn trong danh mục.');
        originalEditProduct(id);
      } catch(error) {showToast(error.message || 'Không tải được sản phẩm.','error');}
    };
  }
  if(deleteButton) deleteButton.onclick=async()=>{
    const id=document.getElementById('editProductId').value,current=catalog.get(id);
    if(!current || !window.confirm(`Xóa “${current.name}” khỏi danh mục? Lịch sử đơn hàng đã mua được giữ nguyên.`)) return;
    deleteButton.disabled=true;
    try {
      const response=await fetch('/api/admin/cms',{method:'POST',credentials:'same-origin',headers:getAdminAuthHeaders(),body:JSON.stringify({action:'delete_product',productId:id})});
      const result=await response.json();
      if(!response.ok || !result.ok) throw new Error(result.errorMessage || 'Chưa xóa được sản phẩm.');
      catalog.delete(id);delete appState.products[id];renderProductsTable();closeDialog('editProductModal');showToast('Đã xóa sản phẩm khỏi danh mục.','success');
    } catch(error) {showToast(error.message || 'Chưa xóa được sản phẩm.','error');}
    finally {deleteButton.disabled=false;}
  };

  for(const id of ['editProductImage','postCoverImageInput','siteHeroDesktopImage','siteHeroMobileImage','siteGiftingImage']) mountImageUpload(id);
  for(const [id,description] of [['siteHeroDesktopImage','Đề xuất 1920 × 780 px (khoảng 2,46:1).'],
    ['siteHeroMobileImage','Đề xuất 1080 × 1080 px (1:1).']]) {
    const field=document.getElementById(id);
    if(!field) continue;
    const hint=document.createElement('p');hint.style.cssText='font-size:12px;color:#647067;margin-top:6px;line-height:1.5';
    hint.textContent=description+' WebP/JPG/PNG, tối đa 3 MB. Giữ chủ thể ở giữa ảnh; phần dưới có chữ và nút đặt món.';
    field.after(hint);
  }
  if(window.lucide) window.lucide.createIcons();
  loadMediaCatalog().catch(()=>{});
  if(siteForm) loadServerSiteSettings().catch(()=>{});
  window.uploadImageToR2=uploadImageToR2;
})();
