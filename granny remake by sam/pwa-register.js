// PWA temporarily disabled for AdSense/reachability stability.
// This file intentionally unregisters old service workers and clears old caches.
(function(){
  async function clearOldPWA(){
    try{
      if('serviceWorker' in navigator){
        const regs = await navigator.serviceWorker.getRegistrations();
        for(const r of regs){ await r.unregister(); }
      }
      if('caches' in window){
        const keys = await caches.keys();
        for(const k of keys){ await caches.delete(k); }
      }
    }catch(e){}
  }

  if(document.readyState === 'complete') clearOldPWA();
  else window.addEventListener('load', clearOldPWA);

  window.SABInstallPWA = function(){
    alert('Install app is temporarily disabled while the site is being reviewed.');
  };
})();
