import {supabase,isConfigured,showConfigWarning,formatDate} from "./supabase.js";
document.querySelector("#year").textContent=new Date().getFullYear();
const el=document.querySelector("#article"),id=new URLSearchParams(location.search).get("id");
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
async function load(){
 if(!isConfigured){showConfigWarning(el);return;}
 if(!id){el.innerHTML='<div class="empty">Artikel tidak ditemukan. <a href="index.html">Kembali</a></div>';return;}
 const {data,error}=await supabase.from("news").select("*").eq("id",id).eq("is_published",true).maybeSingle();
 if(error||!data){el.innerHTML='<div class="empty">Berita tidak ditemukan atau belum diterbitkan.</div>';return;}
 document.title=data.title+" | Portal Sekolah";
 el.innerHTML=`<span class="chip">${esc(data.category)}</span><h1>${esc(data.title)}</h1><div class="meta">Dipublikasikan ${formatDate(data.created_at)}</div>${data.image_url?`<img class="article-cover" src="${esc(data.image_url)}" alt="${esc(data.title)}">`:""}<p class="article-content">${esc(data.content)}</p><button class="btn btn-primary" onclick="window.print()">Cetak Berita</button>`;
}
load();
