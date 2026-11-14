import {supabase, isConfigured, showConfigWarning, formatDate} from "./supabase.js";
const newsList=document.querySelector("#news-list"), annList=document.querySelector("#announcement-list");
document.querySelector("#year").textContent=new Date().getFullYear();
document.querySelector("#nav-toggle").addEventListener("click",()=>document.querySelector("#main-nav").classList.toggle("open"));
let allNews=[];
function escapeHTML(v=""){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function renderNews(){
 const q=document.querySelector("#search-news").value.toLowerCase(), cat=document.querySelector("#category-filter").value;
 const data=allNews.filter(n=>(!cat||n.category===cat)&&(`${n.title} ${n.summary} ${n.category}`).toLowerCase().includes(q));
 newsList.innerHTML=data.length?data.map(n=>`<article class="news-card"><div class="news-image">${n.image_url?`<img src="${escapeHTML(n.image_url)}" alt="${escapeHTML(n.title)}" loading="lazy">`:"✦"}</div><div class="news-body"><span class="chip">${escapeHTML(n.category)}</span><h3>${escapeHTML(n.title)}</h3><p>${escapeHTML(n.summary)}</p><span class="meta">${formatDate(n.created_at)}</span><br><a class="read-more" href="detail.html?id=${encodeURIComponent(n.id)}">Baca selengkapnya →</a></div></article>`).join(""):'<div class="empty">Belum ada berita yang sesuai.</div>';
}
async function load(){
 if(!isConfigured){showConfigWarning(newsList);showConfigWarning(annList);return;}
 const [{data:news,error:ne},{data:anns,error:ae}]=await Promise.all([
  supabase.from("news").select("*").eq("is_published",true).order("created_at",{ascending:false}),
  supabase.from("announcements").select("*").eq("is_active",true).order("created_at",{ascending:false})
 ]);
 if(ne){newsList.innerHTML=`<div class="empty">Gagal memuat berita: ${escapeHTML(ne.message)}</div>`;return;}
 allNews=news||[];document.querySelector("#stat-news").textContent=allNews.length;document.querySelector("#stat-announcements").textContent=(anns||[]).length;
 const cats=[...new Set(allNews.map(n=>n.category).filter(Boolean))].sort();
 document.querySelector("#category-filter").innerHTML='<option value="">Semua kategori</option>'+cats.map(c=>`<option value="${escapeHTML(c)}">${escapeHTML(c)}</option>`).join("");
 renderNews();
 if(ae){annList.innerHTML=`<div class="empty">Gagal memuat pengumuman: ${escapeHTML(ae.message)}</div>`;return;}
 annList.innerHTML=anns?.length?anns.map(a=>`<article class="announcement-card"><span class="announcement-date">${formatDate(a.event_date||a.created_at)}</span><h3>${escapeHTML(a.title)}</h3><p>${escapeHTML(a.content)}</p></article>`).join(""):'<div class="empty">Belum ada pengumuman aktif.</div>';
}
document.querySelector("#search-news").addEventListener("input",renderNews);
document.querySelector("#category-filter").addEventListener("change",renderNews);
load();
