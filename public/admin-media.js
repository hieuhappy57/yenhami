(function () {
  const catalog = new Map();
  const pendingUploads = new Set();
  let catalogLoading;

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
          image:product.imageUrl,description:product.shortDescription,volumeMl:product.volumeMl,ingredients:product.ingredients};
      }
      appState.products=products;
      renderProductsTable();
    })();
    try {await catalogLoading;} finally {catalogLoading=null;}
  }

  async function uploadImageToR2(file) {
    if(!file || file.size>3*1024*1024) throw new Error('Ảnh tối đa 3 MB.');
    const dataUrl=await new Promise((resolve,reject)=>{
      const reader=new FileReader();
      reader.onload=()=>resolve(reader.result);
      reader.onerror=()=>reject(new Error('Không đọc được ảnh.'));
      reader.readAsDataURL(file);
    });
    const response=await fetch('/api/admin/cms',{method:'POST',credentials:'same-origin',headers:getAdminAuthHeaders(),
      body:JSON.stringify({action:'upload_media_r2',dataUrl,fileName:file.name})});
    const result=await response.json().catch(()=>({}));
    if(!response.ok || !result.ok || result.storedInR2!==true || !String(result.url || '').startsWith('/api/media/uploads/')) {
      throw new Error(result.errorMessage || 'Chưa lưu được ảnh lên máy chủ.');
    }
    return result.url;
  }

  function mountImageUpload(id) {
    const field=document.getElementById(id);
    if(!field) return;
    const tools=document.createElement('div');
    tools.style.cssText='display:flex;align-items:center;gap:12px;margin-top:8px;min-height:40px';
    const picker=document.createElement('input');
    picker.type='file';picker.accept='image/png,image/jpeg,image/webp,image/gif,image/avif';picker.hidden=true;
    const button=document.createElement('button');
    button.type='button';button.className='btn btn-sm';button.title='Tải ảnh lên';
    button.innerHTML='<i data-lucide="upload" style="width:16px;height:16px"></i><span>Tải ảnh</span>';
    const preview=document.createElement('img');
    preview.alt='Ảnh đã chọn';preview.width=80;preview.height=60;
    preview.style.cssText='width:80px;height:60px;object-fit:cover;border-radius:4px;display:none';
    const showPreview=()=>{if(field.value && !field.value.startsWith('data:')) {preview.src=field.value;preview.style.display='block';} else preview.style.display='none';};
    preview.onerror=()=>{preview.style.display='none';};
    const dialog=field.closest?.('dialog');
    if(dialog && typeof MutationObserver!=='undefined') new MutationObserver(()=>{if(dialog.open) showPreview();}).observe(dialog,{attributes:true,attributeFilter:['open']});
    button.onclick=()=>picker.click();
    field.addEventListener('change',showPreview);
    picker.onchange=async()=>{
      const file=picker.files?.[0];
      if(!file) return;
      button.disabled=true;
      pendingUploads.add(id);
      const saveButton=field.closest?.('form')?.querySelector('[type="submit"]');
      if(saveButton) saveButton.disabled=true;
      try {
        const url=await uploadImageToR2(file);
        field.value=url;field.dispatchEvent(new Event('change',{bubbles:true}));
        showToast('Đã tải ảnh thành công.','success');
      } catch(error) {showToast(error.message || 'Không tải được ảnh.','error');}
      finally {button.disabled=false;picker.value='';pendingUploads.delete(id);if(saveButton) saveButton.disabled=false;}
    };
    tools.append(button,picker,preview);field.after(tools);
  }

  handleSaveProduct=async function(event) {
    event.preventDefault();
    const form=event.currentTarget;
    const button=form?.querySelector('[type="submit"]');
    if(button) button.disabled=true;
    try {
      if(pendingUploads.has('editProductImage')) throw new Error('Vui lòng chờ tải ảnh xong.');
      await loadMediaCatalog();
      const id=document.getElementById('editProductId').value;
      const current=catalog.get(id);
      const imageUrl=document.getElementById('editProductImage').value.trim();
      if(imageUrl.startsWith('data:')) throw new Error('Dùng nút tải ảnh để lưu ảnh trước.');
      const product={id,name:document.getElementById('editProductName').value.trim(),imageUrl,
        shortDescription:document.getElementById('editProductDesc').value.trim()};
      if(appState.currentRole!=='MARKETING') {
        const category=document.getElementById('editProductCategory').value;
        Object.assign(product,{...(current || {}),...product,priceVnd:Number(document.getElementById('editProductPrice').value),
          category:['nguyen-ban','ngot-diu','nhieu-tang'].includes(category) ? category : (current?.category || 'nguyen-ban'),
          volumeMl:current?.volumeMl || 200,status:current?.status || 'AVAILABLE'});
      }
      const response=await fetch('/api/admin/cms',{method:'POST',credentials:'same-origin',headers:getAdminAuthHeaders(),body:JSON.stringify({action:'upsert_product',product})});
      const result=await response.json();
      if(!response.ok || !result.ok) throw new Error(result.errorMessage || 'Chưa lưu được sản phẩm.');
      await loadMediaCatalog();closeDialog('editProductModal');showToast('Đã lưu sản phẩm.','success');
    } catch(error) {showToast(error.message || 'Không lưu được sản phẩm.','error');}
    finally {if(button) button.disabled=false;}
  };

  for(const id of ['editProductImage','postCoverImageInput','siteHeroDesktopImage','siteHeroMobileImage','siteGiftingImage']) mountImageUpload(id);
  if(window.lucide) window.lucide.createIcons();
  loadMediaCatalog().catch(()=>{});
  window.uploadImageToR2=uploadImageToR2;
})();
