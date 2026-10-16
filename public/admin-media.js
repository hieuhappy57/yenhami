(function () {
  const catalog = new Map();
  const pendingUploads = new Set();
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
  if(window.lucide) window.lucide.createIcons();
  loadMediaCatalog().catch(()=>{});
  window.uploadImageToR2=uploadImageToR2;
})();
