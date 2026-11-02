/* Small, pure, reusable rules shared by app and Node test runner. */
(function (root) {
  'use strict';
  const TARGET_GB = 12.8;
  const TOTAL_GB = 128;
  const STEPS = [
    {title:'Check the last successful backup',subtitle:'Protect what matters before changing anything.',instruction:'In WhatsApp, open Settings → Chats → Chat Backup. Look at the date of the last successful backup.',tip:'A backup is a precaution, not a permanent archive. Deleted media might not be recoverable from a newer backup.'},
    {title:'Find the biggest space-hogs',subtitle:'Review first. Nothing gets deleted yet.',instruction:'In WhatsApp, open Settings → Storage and data → Manage storage. Start with large videos and frequently forwarded media.',tip:'WhatsApp is the only app that can inspect its own attachments. This companion cannot read them.'},
    {title:'Choose what you can safely lose',subtitle:'Keep chats; consider unwanted media only.',instruction:'Open individual media in WhatsApp. Save anything irreplaceable elsewhere, select unwanted items, and confirm deletion inside WhatsApp.',tip:'Check whether a photo or video was also saved in Photos. Be careful with important documents and voice notes.'},
    {title:'Measure the space you actually gained',subtitle:'A real measurement, not a guess.',instruction:'Open Settings → General → iPhone Storage. Enter the newly displayed used-space figure back here.',tip:'iOS may take a while to recalculate. Only the measured net difference counts towards your target.'}
  ];
  function finite(n) { return typeof n === 'number' && Number.isFinite(n); }
  function validUsed(used, total=TOTAL_GB) { return finite(used) && used >= 0 && used <= total && finite(total) && total > 0; }
  function progress(baseline, current, target=TARGET_GB) {
    if (!validUsed(baseline) || !validUsed(current)) return {delta:0, verified:false, percent:0, target};
    const delta = Math.round((baseline-current)*100)/100;
    return {delta, verified:true, percent:Math.min(100,Math.max(0,(delta/target)*100)), target};
  }
  function requiresBackup(backup) { return !['today','week'].includes(backup); }
  function nextWizard(current, backup) {
    if (current <= 0 && requiresBackup(backup)) return 0;
    return Math.min(STEPS.length-1,Math.max(0,current)+1);
  }
  function classifyFiles(files) {
    let totalBytes=0;
    const keys = new Map();
    const items = [];
    for(const f of files) {
      if (!f || typeof f.name !== 'string' || !finite(f.size) || f.size < 0) continue;
      totalBytes += f.size;
      const key = f.name.toLocaleLowerCase()+'|'+f.size;
      const repeat = keys.has(key);
      keys.set(key,(keys.get(key)||0)+1);
      items.push({name:f.name,bytes:f.size,type:f.type||'',possibleRepeat:repeat});
    }
    return {count:items.length,totalBytes,items:items.sort((a,b)=>b.bytes-a.bytes).slice(0,60),repeatCount:items.filter(x=>x.possibleRepeat).length};
  }
  function round(n,dp=1) {const m=10**dp;return Math.round(n*m)/m;}
  function humanBytes(bytes) {
    if (!finite(bytes) || bytes<0) return '—';
    if(bytes>=1e9) return round(bytes/1e9,2)+' GB';
    if(bytes>=1e6) return round(bytes/1e6,1)+' MB';
    if(bytes>=1e3) return round(bytes/1e3,1)+' KB';
    return bytes+' B';
  }
  const api = {TARGET_GB,TOTAL_GB,STEPS,validUsed,progress,requiresBackup,nextWizard,classifyFiles,humanBytes,round};
  if(typeof module==='object' && module.exports) module.exports=api;
  root.StorageCore=api;
})(typeof window!=='undefined'?window:globalThis);
