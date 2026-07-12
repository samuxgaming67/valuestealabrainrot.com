(function(){
  const nowNodes=document.querySelectorAll('[data-online-users]');
  const last30Nodes=document.querySelectorAll('[data-online-users-30m]');
  if(!nowNodes.length && !last30Nodes.length)return;

  const endpoint='/online-users.php';
  let id=sessionStorage.getItem('sab_online_user_id');
  if(!id){
    id=(crypto&&crypto.randomUUID)?crypto.randomUUID():('u_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2));
    sessionStorage.setItem('sab_online_user_id',id);
  }

  function setNodes(nodes,v){
    nodes.forEach(function(el){
      el.textContent=(typeof v==='number'&&isFinite(v))?String(v):'—';
    });
  }

  function ping(){
    if(document.hidden)return;
    fetch(endpoint,{
      method:'POST',
      headers:{'Content-Type':'application/x-www-form-urlencoded'},
      body:'id='+encodeURIComponent(id),
      cache:'no-store',
      credentials:'same-origin'
    })
    .then(function(r){return r.ok?r.json():null;})
    .then(function(d){
      if(d&&typeof d.online==='number')setNodes(nowNodes,d.online);
      if(d&&typeof d.last30m==='number')setNodes(last30Nodes,d.last30m);
    })
    .catch(function(){
      setNodes(nowNodes,'—');
      setNodes(last30Nodes,'—');
    });
  }

  ping();
  setInterval(ping,30000);
  document.addEventListener('visibilitychange',function(){if(!document.hidden)ping();});
})();
