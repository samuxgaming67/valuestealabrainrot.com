(function(){
  if(window.SABExistOverridesRuntimeV7) return;
  window.SABExistOverridesRuntimeV7 = true;

  window.SAB_EXIST_OVERRIDES = window.SAB_EXIST_OVERRIDES || {};
  window.SAB_EXIST_STATUS_OVERRIDES = window.SAB_EXIST_STATUS_OVERRIDES || {};
  window.EC_DB_OVERRIDES = window.EC_DB_OVERRIDES || {};
  window.EC_DB_OVERRIDES_READY = false;

  var lastPayloadKey = '';

  function norm(s){
    return String(s || '')
      .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
  }

  function fmtCount(n){
    n = Number(n);
    if(!isFinite(n) || n < 0) return '';
    if(n === 0) return '0 exist';
    return '~' + Math.round(n).toLocaleString();
  }

  function statusLabel(status){
    status = String(status || 'count').toLowerCase();
    if(status === 'not_tradeable') return 'Not tradeable';
    if(status === 'not_released') return 'Not released yet';
    if(status === 'tba') return 'TBA';
    if(status === 'unknown') return 'Unknown';
    return '';
  }

  function cleanNum(v){
    var n = parseFloat(String(v || '').replace(/[^0-9.]/g,''));
    return isFinite(n) ? n : 0;
  }

  function getOverride(name, mut){
    var by = window.SAB_EXIST_OVERRIDES[String(name || '').trim()];
    if(!by) return null;
    mut = mut || 'Default';

    // Important:
    // Default = base/no-mutation exist count.
    // It must NOT be used as fallback for Gold/Rainbow/Lava/etc.
    // Otherwise one Default count appears duplicated on every mutation row.
    if(mut === 'Default') return by.Default || null;
    return by[mut] || null;
  }

  function displayFor(name, mut){
    var ov = getOverride(name, mut || 'Default');
    if(ov){
      var status = String(ov.exist_status || ov.status || 'count').toLowerCase();
      if(status !== 'count') return statusLabel(status);
      if(ov.exist_count !== null && ov.exist_count !== undefined) return fmtCount(ov.exist_count);
    }

    try{
      if((mut || 'Default') !== 'Default' && typeof EC_VARIANTS !== 'undefined' && EC_VARIANTS[name] && EC_VARIANTS[name][mut] != null){
        var c = Number(EC_VARIANTS[name][mut]);
        if(c === 0) return '0 exist';
        if(c <= 10) return c + ' only';
        return '~' + c.toLocaleString();
      }

      // EC[name] is the base/default count only.
      // Do not reuse it for mutation-specific rows.
      if((mut || 'Default') === 'Default' && typeof EC !== 'undefined' && EC && EC[name]) return EC[name];
    }catch(e){}

    return '';
  }

  window.SABGetExistDisplay = displayFor;
  window.SABGetExistOverride = getOverride;

  function escapeHtml(s){
    return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c];
    });
  }

  function mutationColor(mut){
    var map = {
      'Default':'#8b8580',
      'Gold':'#facc15',
      'Diamond':'#22d3ee',
      'Rainbow':'#a855f7',
      'Bloodrot':'#991b1b',
      'Candy':'#f472b6',
      'Lava':'#f97316',
      'Galaxy':'#8b5cf6',
      'Yin Yang':'#f8fafc',
      'Radioactive':'#4ade80',
      'Cursed':'#ef4444',
      'Divine':'#facc15',
      'Cyber':'#22d3ee',
      'Phantom':'#a855f7'
    };
    return map[mut] || '#94a3b8';
  }

  function parseExistNumber(display){
    var n = parseFloat(String(display || '').replace(/[^0-9.]/g,''));
    return isFinite(n) ? n : 0;
  }

  function getMutationExistEntries(name){
    var standardOrder = ['Phantom','Cyber','Bloodrot','Lava','Galaxy','Yin Yang','Cursed','Divine','Radioactive','Candy','Rainbow','Diamond','Gold','Default'];
    var seen = {};
    var out = [];
    var byOverride = window.SAB_EXIST_OVERRIDES && window.SAB_EXIST_OVERRIDES[name] ? window.SAB_EXIST_OVERRIDES[name] : null;
    var byVariant = (typeof EC_VARIANTS !== 'undefined' && EC_VARIANTS[name]) ? EC_VARIANTS[name] : null;

    function getDisplay(mut){
      var display = displayFor(name, mut);
      if(display) return display;

      // Important: show every standard mutation even if data is missing.
      // Missing means not tracked yet, not necessarily zero existing copies.
      return 'Not tracked';
    }

    function getSource(mut){
      if(byOverride && byOverride[mut]) return 'DB';
      if(byVariant && byVariant[mut] !== undefined) return 'data.js';
      if(mut === 'Default' && typeof EC !== 'undefined' && EC && EC[name]) return 'data.js';
      return '';
    }

    function push(mut){
      if(seen[mut]) return;
      seen[mut] = true;
      var display = getDisplay(mut);
      var count = parseExistNumber(display);
      out.push({
        mutation: mut,
        display: display,
        count: count,
        source: getSource(mut),
        color: mutationColor(mut)
      });
    }

    standardOrder.forEach(push);

    // Also include future/custom mutations if present in DB or data.js.
    if(byOverride){
      Object.keys(byOverride).forEach(push);
    }
    if(byVariant){
      Object.keys(byVariant).forEach(push);
    }

    return out;
  }

  function renderMutationExistBox(name){
    if(!/^\/brainrot\//.test(location.pathname)) return;
    if(!name) return;

    var entries = getMutationExistEntries(name);
    if(!entries.length) return;

    var total = entries.reduce(function(sum, entry){
      return sum + (entry.count || 0);
    }, 0);

    var max = entries.reduce(function(m, entry){
      return Math.max(m, entry.count || 0);
    }, 0) || 1;

    var html = entries.map(function(entry){
      var display = escapeHtml(entry.display);
      var count = entry.count || 0;
      var width = count > 0 ? Math.max(2, Math.round((count / max) * 100)) : 0;
      var special = /^(0 exist|none yet|TBA|Unknown|Not tradeable|Not released yet|Not tracked)$/i.test(entry.display);
      var source = entry.source ? '<span style="font-size:9px;color:var(--muted2);margin-left:6px">'+escapeHtml(entry.source)+'</span>' : '';

      return '<div style="display:grid;grid-template-columns:118px 1fr 96px;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid rgba(148,163,184,.10)">'+
        '<div style="display:flex;align-items:center;gap:9px;min-width:0">'+
          '<span style="width:13px;height:13px;border-radius:4px;background:'+entry.color+';box-shadow:0 0 10px '+entry.color+';flex:0 0 auto"></span>'+
          '<strong style="font-family:Fredoka,sans-serif;font-size:13px;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+escapeHtml(entry.mutation)+'</strong>'+
        '</div>'+
        '<div style="height:8px;border-radius:999px;background:rgba(148,163,184,.12);overflow:hidden">'+
          '<div style="width:'+width+'%;height:100%;border-radius:999px;background:'+entry.color+'"></div>'+
        '</div>'+
        '<div style="font-family:Fredoka,sans-serif;font-size:13px;font-weight:800;text-align:right;color:'+(special ? '#fbbf24' : entry.color)+'">'+display+source+'</div>'+
      '</div>';
    }).join('');

    var box = document.getElementById('mutation-exist-box');
    if(!box){
      box = document.createElement('div');
      box.id = 'mutation-exist-box';
      box.style.cssText = 'background:linear-gradient(135deg,rgba(30,33,53,.92),rgba(21,24,39,.96));border:1.5px solid var(--border2);border-radius:14px;padding:16px;margin:0 0 16px';

      var h2s = Array.from(document.querySelectorAll('h2'));
      var incomeH2 = h2s.find(function(h){ return /income per mutation/i.test(h.textContent || ''); });
      var target = incomeH2 ? incomeH2.closest('div') : null;
      if(target && target.parentNode){
        target.parentNode.insertBefore(box, target);
      }else{
        var main = document.querySelector('main');
        if(main) main.appendChild(box);
      }
    }

    box.innerHTML =
      '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:10px">'+
        '<div>'+
          '<h2 style="font-family:Fredoka,sans-serif;font-weight:800;font-size:18px;margin:0 0 4px">Mutation Exist Counts</h2>'+
          '<p style="font-size:12px;color:var(--muted);line-height:1.6;margin:0">Live exist counts for this brainrot by mutation, synced from data.js and DB overrides.</p>'+
          '<p style="font-size:12px;color:var(--muted);line-height:1.6;margin:6px 0 0">Total across tracked mutations: <strong style="color:var(--text)">'+(total ? total.toLocaleString() : 'not tracked')+'</strong> copies.</p>'+
        '</div>'+
        '<span style="font-size:10px;color:var(--muted2);font-family:JetBrains Mono,monospace;white-space:nowrap">Live</span>'+
      '</div>'+
      '<div style="display:grid;grid-template-columns:1fr;gap:0">'+html+'</div>'+
      '<p style="font-size:11px;color:var(--muted2);line-height:1.6;margin:12px 0 0">“Not tracked” means we do not have a reliable mutation-specific count yet. “0 exist” means the mutation is tracked/released but no copies are currently known.</p>';
  }

  function applyToDataGlobals(){
    var data = window.SAB_EXIST_OVERRIDES || {};

    // Calculator uses EC_DB_OVERRIDES internally, so keep both names synced.
    window.EC_DB_OVERRIDES = data;
    window.EC_DB_OVERRIDES_READY = true;

    Object.keys(data).forEach(function(name){
      Object.keys(data[name] || {}).forEach(function(mut){
        var ov = data[name][mut] || {};
        var status = String(ov.exist_status || ov.status || 'count').toLowerCase();
        var label = statusLabel(status);
        window.SAB_EXIST_STATUS_OVERRIDES[name + '||' + mut] = status;

        try{
          if(mut === 'Default'){
            if(typeof EC !== 'undefined'){
              EC[name] = status === 'count' ? fmtCount(ov.exist_count) : label;
            }
          }else{
            if(typeof EC_VARIANTS !== 'undefined'){
              if(!EC_VARIANTS[name]) EC_VARIANTS[name] = {};
              EC_VARIANTS[name][mut] = status === 'count' ? Number(ov.exist_count || 0) : 0;
            }
          }
        }catch(e){}
      });
    });
  }

  function patchExistCountsPage(){
    if(!/exist-counts\.html$|\/exist-counts\/?$/.test(location.pathname)) return;

    try{
      if(typeof ECD !== 'undefined' && Array.isArray(ECD)){
        Object.keys(window.SAB_EXIST_OVERRIDES || {}).forEach(function(name){
          var ov = getOverride(name, 'Default');
          if(!ov) return;

          var status = String(ov.exist_status || ov.status || 'count').toLowerCase();
          var count = status === 'count' ? fmtCount(ov.exist_count) : statusLabel(status);
          var entry = ECD.find(function(x){ return x.name === name; });

          if(entry){
            entry.count = count;
            entry.cN = status === 'count' ? cleanNum(count) : 0;
          }else if(status === 'count'){
            var rarity = 'Secret';
            try{
              var br = (typeof BR !== 'undefined' && BR.find) ? BR.find(function(b){ return b.n === name; }) : null;
              if(br && br.r) rarity = br.r;
            }catch(e){}
            ECD.push({name:name, count:count, rarity:rarity, cN:cleanNum(count)});
          }
        });

        ECD.sort(function(a,b){ return b.cN - a.cN; });
        try{ ecFil = [].concat(ECD); }catch(e){}
        if(typeof renderEc === 'function') renderEc();
      }
    }catch(e){
      console.warn('[SAB] exist-counts live data patch failed', e);
    }
  }

  function setText(el, value){
    if(!el || !value) return;
    if((el.textContent || '').trim() !== String(value)) el.textContent = value;
  }

  function patchLabelValueBlocks(root, value){
    if(!root || !value) return;

    root.querySelectorAll('.stat-card, .stat, .info-card, .detail-card, .wiki-card, .card').forEach(function(card){
      var txt = card.textContent || '';
      if(!/exist/i.test(txt)) return;

      var label = card.querySelector('.sc-label, .label, .k, [class*="label"]');
      if(label && /exist/i.test(label.textContent || '')){
        var val = card.querySelector('.sc-val, .value, .v, strong, [class*="value"]');
        if(val) setText(val, value);
      }
    });

    root.querySelectorAll('[data-exist-value], .exist-count, .exist-value, [class*="exist-count"], [class*="exist-value"]').forEach(function(el){
      setText(el, value);
    });

    root.querySelectorAll('tr').forEach(function(row){
      var cells = Array.from(row.children || []);
      for(var i=0;i<cells.length;i++){
        if(/exist/i.test(cells[i].textContent || '') && cells[i+1]){
          setText(cells[i+1], value);
          break;
        }
      }
    });
  }

  function findCurrentBrainrotName(){
    var attrEl = document.querySelector('[data-brainrot-name], [data-brainrot], [data-name]');
    if(attrEl){
      var v = attrEl.getAttribute('data-brainrot-name') || attrEl.getAttribute('data-brainrot') || attrEl.getAttribute('data-name');
      if(v) return v.trim();
    }

    var h1 = document.querySelector('h1');
    if(h1){
      return (h1.textContent || '')
        .replace(/\s+Exist Count.*$/i,'')
        .replace(/\s+Value.*$/i,'')
        .trim();
    }

    return '';
  }

  function patchStaticBrainrotPage(){
    if(!/^\/brainrot\//.test(location.pathname)) return;

    var name = findCurrentBrainrotName();
    if(!name) return;

    var shown = displayFor(name, 'Default');
    if(!shown) return;

    patchLabelValueBlocks(document, shown);
    renderMutationExistBox(name);

    var info = document.querySelector('.detail-info') || document.querySelector('main');
    var note = document.getElementById('live-exist-db-note');
    if(info){
      if(!note){
        note = document.createElement('div');
        note.id = 'live-exist-db-note';
        note.style.cssText = 'margin-top:8px;font-size:11px;color:var(--muted);font-family:Fredoka,sans-serif';
        info.appendChild(note);
      }
      note.innerHTML = 'Live exist count: <strong style="color:var(--cyan)">' + shown + '</strong>';
    }

    var desc = document.querySelector('meta[name="description"]');
    if(desc){
      var old = desc.getAttribute('content') || '';
      if(/copies in existence/i.test(old)){
        desc.setAttribute('content', old.replace(/with\s+[^.]+\s+copies in existence/i, 'with ' + shown + ' copies in existence'));
      }
    }
  }

  function patchBrainrotCardsEverywhere(){
    var data = window.SAB_EXIST_OVERRIDES || {};
    var names = Object.keys(data);
    if(!names.length) return;

    var blocks = Array.from(document.querySelectorAll('tr, article, .card, .brainrot-card, .ec-card, .item-card, [data-brainrot], [data-name], [data-brainrot-name]'));
    if(!blocks.length) return;

    blocks.forEach(function(block){
      var blockTextNorm = norm(block.getAttribute('data-brainrot-name') || block.getAttribute('data-brainrot') || block.getAttribute('data-name') || block.textContent || '');
      if(!blockTextNorm) return;

      for(var i=0;i<names.length;i++){
        var name = names[i];
        if(!blockTextNorm.includes(norm(name))) continue;

        var display = displayFor(name, 'Default');
        if(!display) continue;
        patchLabelValueBlocks(block, display);
        break;
      }
    });
  }

  function patchCalculator(){
    try{
      if(typeof updMutEC === 'function') updMutEC();
      if(typeof updateDetailEstimate === 'function') updateDetailEstimate();
    }catch(e){}
  }

  function afterApply(){
    applyToDataGlobals();
    patchExistCountsPage();
    patchStaticBrainrotPage();
    patchBrainrotCardsEverywhere();
    patchCalculator();

    window.dispatchEvent(new CustomEvent('sab:exist-overrides-ready', {
      detail: {overrides: window.SAB_EXIST_OVERRIDES}
    }));
  }

  function loadExistOverrides(){
    return fetch('/api/exist-overrides.php?ts=' + Date.now(), {cache:'no-store'})
      .then(function(r){ return r.json(); })
      .then(function(data){
        if(!data || !data.ok || !data.overrides) return;
        var key = JSON.stringify(data.overrides || {});
        window.SAB_EXIST_OVERRIDES = data.overrides || {};
        window.EC_DB_OVERRIDES = window.SAB_EXIST_OVERRIDES;
        window.EC_DB_OVERRIDES_READY = true;

        if(key !== lastPayloadKey){
          lastPayloadKey = key;
          afterApply();
          console.log('[SAB] live exist overrides loaded:', data.count || 0);
        }else{
          afterApply();
        }
      })
      .catch(function(err){
        console.warn('[SAB] live exist overrides unavailable', err);
      });
  }

  loadExistOverrides();
  setInterval(loadExistOverrides, 60000);
  document.addEventListener('visibilitychange', function(){
    if(!document.hidden) loadExistOverrides();
  });
})();
