
(function(){
  const STORAGE_KEY = 'qualitet.publish.center';
  const FALLBACK = {
    app: {
      app_url: window.location.origin,
      public_domain: window.location.origin,
      api_base_url: window.QM_API_BASE || '',
      allowed_origins: window.location.origin
    },
    stripe: { secret_key:'', publishable_key:'', webhook_secret:'', price_ids:{} },
    suppliers: {
      bigbuy_api_key:'',
      bigbuy_secret:'',
      baselinker_token:'',
      idosell_api_key:'',
      xml_feed_url:'',
      auto_import_enabled:false
    },
    ai: {
      openai_api_key:'',
      elevenlabs_api_key:'',
      meta_pixel_id:'',
      ga_measurement_id:''
    },
    netlify: { site_id:'', access_token:'', build_hook_url:'', publish_dir:'.', build_command:'', production_branch:'main' },
    zoho: { org_email:'', smtp_host:'smtp.zoho.eu', smtp_port:'465', smtp_secure:'true', smtp_user:'', smtp_pass:'', smtp_from:'', imap_host:'imap.zoho.eu', imap_port:'993' }
  };
  function deepMerge(target, source){
    const out = Array.isArray(target) ? target.slice() : Object.assign({}, target);
    Object.keys(source || {}).forEach(function(key){
      const sval = source[key];
      const tval = out[key];
      if(sval && typeof sval === 'object' && !Array.isArray(sval)){
        out[key] = deepMerge((tval && typeof tval === 'object') ? tval : {}, sval);
      }else{
        out[key] = sval;
      }
    });
    return out;
  }
  function load(){
    try{
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      if(raw && raw.payload){
        return deepMerge(FALLBACK, raw.payload);
      }
    }catch(_){}
    return FALLBACK;
  }
  window.QM_RUNTIME_CONFIG = load();
  if(!window.QM_API_BASE && window.QM_RUNTIME_CONFIG.app && window.QM_RUNTIME_CONFIG.app.api_base_url){
    window.QM_API_BASE = window.QM_RUNTIME_CONFIG.app.api_base_url;
  }
})();
